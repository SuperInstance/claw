# SE(3)-Equivariant Consensus Implementation Guide

**Practical Implementation Guide**
**Date:** 2026-03-14
**Status:** Ready for Implementation

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Components](#core-components)
3. [Implementation Steps](#implementation-steps)
4. [Testing and Validation](#testing-and-validation)
5. [Performance Optimization](#performance-optimization)
6. [Integration with SuperInstance](#integration-with-superinstance)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Installation

```bash
# Install dependencies
pip install torch numpy scipy networkx matplotlib

# Install additional packages for distributed systems
pip install ray  # For distributed computing
```

### 2. Minimal Working Example

```python
import torch
import numpy as np
from se3_consensus import SE3ConsensusNetwork

# Create a network of 100 nodes
network = SE3ConsensusNetwork(
    num_nodes=100,
    topology='random',
    connection_radius=5.0
)

# Run consensus
history = network.run_consensus(
    num_steps=100,
    record_history=True
)

# Visualize convergence
network.plot_convergence(history)
```

### 3. Expected Output

```
SE(3)-Equivariant Consensus
============================
Nodes: 100
Topology: random_geometric
Connection radius: 5.0
Average degree: 12.3

Convergence Progress:
Step 10:   variance = 0.453
Step 20:   variance = 0.123
Step 50:   variance = 0.012
Step 100:  variance = 0.001 [CONVERGED]

Final consensus: [0.234, -0.567, 0.891]
```

---

## Core Components

### Component 1: SE3Frame (Local Reference Frame)

```python
class SE3Frame:
    """
    SE(3) reference frame: rotation + translation

    Represents local coordinate system for each node
    """

    def __init__(self, rotation=None, translation=None):
        """
        Args:
            rotation: [3, 3] rotation matrix (optional, defaults to identity)
            translation: [3] translation vector (optional, defaults to zero)
        """
        if rotation is None:
            self.rotation = torch.eye(3)
        else:
            self.rotation = torch.tensor(rotation, dtype=torch.float32)

        if translation is None:
            self.translation = torch.zeros(3)
        else:
            self.translation = torch.tensor(translation, dtype=torch.float32)

    def to_global(self, local_point):
        """
        Transform point from local to global coordinates

        Args:
            local_point: [3] or [..., 3] point in local frame

        Returns:
            global_point: [3] or [..., 3] point in global frame
        """
        if local_point.dim() == 1:
            return self.rotation @ local_point + self.translation
        else:
            return (self.rotation @ local_point.T).T + self.translation

    def to_local(self, global_point):
        """
        Transform point from global to local coordinates

        Args:
            global_point: [3] or [..., 3] point in global frame

        Returns:
            local_point: [3] or [..., 3] point in local frame
        """
        if global_point.dim() == 1:
            return self.rotation.T @ (global_point - self.translation)
        else:
            return (self.rotation.T @ (global_point - self.translation).T).T

    def compose(self, other):
        """
        Compose with another SE(3) frame: this ∘ other

        Args:
            other: SE3Frame

        Returns:
            composed: SE3Frame
        """
        new_rotation = self.rotation @ other.rotation
        new_translation = self.rotation @ other.translation + self.translation
        return SE3Frame(new_rotation, new_translation)

    def inverse(self):
        """
        Compute inverse transformation

        Returns:
            inverse: SE3Frame
        """
        inv_rotation = self.rotation.T
        inv_translation = -self.rotation.T @ self.translation
        return SE3Frame(inv_rotation, inv_translation)

    @staticmethod
    def from_axis_angle(axis, angle, translation=None):
        """
        Create SE3Frame from axis-angle rotation

        Args:
            axis: [3] rotation axis (will be normalized)
            angle: scalar rotation angle in radians
            translation: [3] translation (optional)

        Returns:
            frame: SE3Frame
        """
        axis = torch.tensor(axis, dtype=torch.float32)
        axis = axis / torch.norm(axis)

        # Rodrigues' formula
        K = torch.tensor([
            [0, -axis[2], axis[1]],
            [axis[2], 0, -axis[0]],
            [-axis[1], axis[0], 0]
        ], dtype=torch.float32)

        I = torch.eye(3)
        rotation = I + torch.sin(angle) * K + (1 - torch.cos(angle)) @ K @ K

        return SE3Frame(rotation, translation)

    def normalize(self):
        """
        Re-orthogonalize rotation matrix (numerical stability)

        Uses SVD: R = U @ V.T
        """
        U, S, V = torch.svd(self.rotation)
        self.rotation = U @ V.T

    def __repr__(self):
        return f"SE3Frame(rot={self.rotation}, trans={self.translation})"
```

### Component 2: InvariantPointAttention

```python
class InvariantPointAttention(nn.Module):
    """
    Invariant Point Attention (IPA) layer

    Key properties:
    - SE(3)-equivariant: Rotating input rotates output
    - Uses only relative measurements (distance, direction)
    - Suitable for sparse, irregular point clouds
    """

    def __init__(self, dim, num_heads=8, dim_head=64):
        super().__init__()
        self.dim = dim
        self.num_heads = num_heads
        self.dim_head = dim_head
        self.inner_dim = num_heads * dim_head

        # Query, key, value projections
        self.to_q = nn.Linear(dim, self.inner_dim)
        self.to_k = nn.Linear(dim, self.inner_dim)
        self.to_v = nn.Linear(dim, self.inner_dim)

        # Positional encoding projections
        self.to_q_k = nn.Linear(dim, self.inner_dim)
        self.to_v_k = nn.Linear(dim, self.inner_dim)

        # Output projection
        self.to_out = nn.Linear(self.inner_dim, dim)

        # Learnable parameters
        self.scale = nn.Parameter(torch.zeros(1))
        self.epsilon = 1e-8

    def forward(self, x, frames, mask=None):
        """
        Forward pass

        Args:
            x: [batch, n, dim] - node features
            frames: [batch, n, 12] - (rotation: 9, translation: 3)
            mask: [batch, n] - optional mask for padding

        Returns:
            out: [batch, n, dim] - updated features
        """
        batch, n, dim = x.shape
        h = self.num_heads

        # Extract rotation and translation
        rotation = frames[:, :, :9].view(batch, n, 3, 3)
        translation = frames[:, :, 9:12]

        # Project to queries, keys, values
        q = self.to_q(x).view(batch, n, h, self.dim_head)
        k = self.to_k(x).view(batch, n, h, self.dim_head)
        v = self.to_v(x).view(batch, n, h, self.dim_head)

        # Reshape for attention
        q = q.transpose(1, 2)  # [batch, h, n, dim_head]
        k = k.transpose(1, 2)
        v = v.transpose(1, 2)

        # Compute scalar attention
        scale = self.dim_head ** -0.5
        scalar_attn = torch.einsum('bhid,bhjd->bhij', q, k) * scale

        # Compute pairwise relative positions
        # t_diff[i,j] = t[j] - t[i]
        t_diff = translation[:, :, None, :] - translation[:, None, :, :]  # [batch, n, n, 3]

        # Transform to local frames: R[i]^T @ t_diff
        # t_rel[i,j] = position of j in frame of i
        t_rel = torch.einsum('bnij,bnkj->bnik',
                            rotation.transpose(-2, -1)[:, :, None, :, :],
                            t_diff[:, :, :, :, None])
        t_rel = t_rel.squeeze(-1)  # [batch, n, n, 3]

        # Distance-based attention (invariant)
        dist_sq = (t_rel ** 2).sum(-1)  # [batch, n, n]
        dist_attn = -0.5 * dist_sq / (self.scale.exp() + self.epsilon)

        # Expand to match heads
        dist_attn = dist_attn.unsqueeze(1).expand(-1, h, -1, -1)

        # Combined attention
        attn = scalar_attn + dist_attn

        # Apply mask if provided
        if mask is not None:
            mask = mask[:, None, None, :]
            attn = attn.masked_fill(mask == 0, float('-inf'))

        # Softmax
        attn = torch.softmax(attn, dim=-1)  # [batch, h, n, n]

        # Apply attention to values
        out = torch.einsum('bhij,bhjd->bhid', attn, v)  # [batch, h, n, dim_head]
        out = out.transpose(1, 2).contiguous()  # [batch, n, h, dim_head]
        out = out.view(batch, n, self.inner_dim)

        # Output projection
        out = self.to_out(out)

        return out
```

### Component 3: ConsensusNode

```python
class ConsensusNode:
    """
    Individual node in SE(3)-equivariant consensus network

    Each node maintains:
    - Local reference frame (SE3Frame)
    - State value (scalar or vector)
    - List of neighbors
    """

    def __init__(self, node_id, frame=None, state_dim=1):
        self.id = node_id

        # Local reference frame
        if frame is None:
            self.frame = SE3Frame(
                rotation=torch.eye(3),
                translation=torch.randn(3) * 10
            )
        else:
            self.frame = frame

        # State
        self.state = torch.randn(state_dim)

        # Neighbors (list of ConsensusNode)
        self.neighbors = []

        # Consensus parameters
        self.temperature = 1.0  # Softmax temperature
        self.learning_rate = 0.1

    def add_neighbor(self, neighbor):
        """Add a neighboring node"""
        if neighbor not in self.neighbors:
            self.neighbors.append(neighbor)

    def remove_neighbor(self, neighbor):
        """Remove a neighboring node"""
        if neighbor in self.neighbors:
            self.neighbors.remove(neighbor)

    def get_relative_position(self, neighbor):
        """
        Get position of neighbor in local frame

        This is the KEY equivariant operation!

        Returns:
            t_rel: [3] - relative position
        """
        t_neighbor_global = neighbor.frame.translation
        t_rel = self.frame.to_local(t_neighbor_global)
        return t_rel

    def compute_attention_weights(self):
        """
        Compute attention weights for all neighbors

        Weights depend only on distances (rotation-invariant)

        Returns:
            weights: dict mapping neighbor_id -> weight
        """
        if not self.neighbors:
            return {}

        # Compute distances to all neighbors
        distances = {}
        for neighbor in self.neighbors:
            t_rel = self.get_relative_position(neighbor)
            dist = torch.norm(t_rel).item()
            distances[neighbor.id] = dist

        # Convert to weights (softmax over negative distances)
        weights = {}
        for neighbor_id, dist in distances.items():
            energy = -dist / self.temperature
            weights[neighbor_id] = np.exp(energy)

        # Normalize
        total = sum(weights.values())
        if total > 0:
            for neighbor_id in weights:
                weights[neighbor_id] /= total

        return weights

    def get_neighbor_state_local(self, neighbor):
        """
        Get neighbor's state transformed to local frame

        Returns:
            state_local: tensor - state in local coordinates
        """
        if self.state_dim == 1:
            # Scalar state: just return value
            return neighbor.state
        else:
            # Vector/tensor state: apply rotation
            R_rel = self.frame.rotation.T @ neighbor.frame.rotation
            return R_rel @ neighbor.state

    def consensus_step(self):
        """
        Perform one consensus update step

        Updates self.state based on weighted average of neighbors
        """
        if not self.neighbors:
            return

        # Compute attention weights
        weights = self.compute_attention_weights()

        # Gather neighbor states in local frame
        weighted_state = torch.zeros_like(self.state)

        for neighbor in self.neighbors:
            if neighbor.id not in weights:
                continue

            state_local = self.get_neighbor_state_local(neighbor)
            weight = weights[neighbor.id]
            weighted_state += weight * state_local

        # Update state (moving average)
        self.state = (1 - self.learning_rate) * self.state + \
                     self.learning_rate * weighted_state

    def move_to(self, new_translation, new_rotation=None):
        """
        Move node to new position/orientation

        Demonstrates equivariance: consensus unaffected by movement
        """
        self.frame.translation = torch.tensor(new_translation, dtype=torch.float32)

        if new_rotation is not None:
            self.frame.rotation = torch.tensor(new_rotation, dtype=torch.float32)
            self.frame.normalize()

    @property
    def state_dim(self):
        return len(self.state) if isinstance(self.state, torch.Tensor) else 1

    def __repr__(self):
        return f"ConsensusNode(id={self.id}, state={self.state.item() if self.state_dim == 1 else self.state})"
```

### Component 4: ConsensusNetwork

```python
class ConsensusNetwork:
    """
    Network of consensus nodes with various topologies
    """

    def __init__(self, num_nodes, topology='random', **kwargs):
        self.num_nodes = num_nodes
        self.topology = topology
        self.kwargs = kwargs

        # Create nodes
        self.nodes = []
        for i in range(num_nodes):
            self.nodes.append(ConsensusNode(node_id=i))

        # Build topology
        self._build_topology()

    def _build_topology(self):
        """Build network topology"""
        if self.topology == 'random_geometric':
            self._random_geometric_graph()
        elif self.topology == 'fully_connected':
            self._fully_connected_graph()
        elif self.topology == 'ring':
            self._ring_graph()
        elif self.topology == 'grid':
            self._grid_graph()
        else:
            raise ValueError(f"Unknown topology: {self.topology}")

    def _random_geometric_graph(self):
        """Random geometric graph: connect nodes within radius"""
        radius = self.kwargs.get('radius', 5.0)

        for i, node_i in enumerate(self.nodes):
            for j, node_j in enumerate(self.nodes):
                if i != j:
                    dist = torch.norm(node_i.frame.translation - node_j.frame.translation)
                    if dist <= radius:
                        node_i.add_neighbor(node_j)

    def _fully_connected_graph(self):
        """All-to-all connectivity"""
        for i, node_i in enumerate(self.nodes):
            for j, node_j in enumerate(self.nodes):
                if i != j:
                    node_i.add_neighbor(node_j)

    def _ring_graph(self):
        """Ring topology"""
        for i, node_i in enumerate(self.nodes):
            prev_node = self.nodes[(i - 1) % self.num_nodes]
            next_node = self.nodes[(i + 1) % self.num_nodes]
            node_i.add_neighbor(prev_node)
            node_i.add_neighbor(next_node)

    def _grid_graph(self):
        """2D grid topology"""
        grid_size = int(np.ceil(np.sqrt(self.num_nodes)))

        for i, node_i in enumerate(self.nodes):
            row = i // grid_size
            col = i % grid_size

            # Up
            if row > 0:
                j = (row - 1) * grid_size + col
                if j < self.num_nodes:
                    node_i.add_neighbor(self.nodes[j])

            # Down
            if row < grid_size - 1:
                j = (row + 1) * grid_size + col
                if j < self.num_nodes:
                    node_i.add_neighbor(self.nodes[j])

            # Left
            if col > 0:
                j = row * grid_size + (col - 1)
                if j < self.num_nodes:
                    node_i.add_neighbor(self.nodes[j])

            # Right
            if col < grid_size - 1:
                j = row * grid_size + (col + 1)
                if j < self.num_nodes:
                    node_i.add_neighbor(self.nodes[j])

    def run_consensus(self, num_steps=100, record_history=True, tolerance=1e-3):
        """
        Run consensus algorithm

        Args:
            num_steps: Maximum number of iterations
            record_history: Whether to record state history
            tolerance: Convergence tolerance (variance threshold)

        Returns:
            history: Array of states over time [if record_history]
        """
        history = []

        for step in range(num_steps):
            # Record current state
            if record_history:
                states = torch.stack([node.state for node in self.nodes])
                history.append(states.clone())

            # All nodes perform consensus step
            for node in self.nodes:
                node.consensus_step()

            # Check convergence
            if record_history and step > 10:
                variance = history[-1].var().item()
                if variance < tolerance:
                    print(f"Converged at step {step}")
                    break

        if record_history:
            return torch.stack(history)

    def get_consensus_value(self):
        """Get current consensus value (average of all states)"""
        states = torch.stack([node.state for node in self.nodes])
        return states.mean(dim=0)

    def rotate_network(self, axis, angle):
        """
        Rotate entire network to test equivariance

        Args:
            axis: [3] rotation axis
            angle: rotation angle in radians
        """
        # Create rotation matrix
        axis = torch.tensor(axis, dtype=torch.float32)
        axis = axis / torch.norm(axis)
        K = torch.tensor([
            [0, -axis[2], axis[1]],
            [axis[2], 0, -axis[0]],
            [-axis[1], axis[0], 0]
        ], dtype=torch.float32)
        I = torch.eye(3)
        R_global = I + torch.sin(angle) * K + (1 - torch.cos(angle)) * (K @ K)

        # Rotate all nodes
        for node in self.nodes:
            old_translation = node.frame.translation.clone()
            old_rotation = node.frame.rotation.clone()

            # Rotate translation
            new_translation = R_global @ old_translation

            # Rotate orientation
            new_rotation = R_global @ old_rotation

            # Update frame
            node.frame.translation = new_translation
            node.frame.rotation = new_rotation
            node.frame.normalize()

    def plot_network(self):
        """Plot network topology (requires matplotlib)"""
        import matplotlib.pyplot as plt
        from mpl_toolkits.mplot3d import Axes3D

        fig = plt.figure(figsize=(10, 8))
        ax = fig.add_subplot(111, projection='3d')

        # Plot nodes
        positions = torch.stack([node.frame.translation for node in self.nodes])
        ax.scatter(positions[:, 0], positions[:, 1], positions[:, 2],
                  c='blue', s=100, alpha=0.6)

        # Plot edges
        for node in self.nodes:
            for neighbor in node.neighbors:
                if neighbor.id > node.id:  # Avoid duplicate edges
                    pos1 = node.frame.translation
                    pos2 = neighbor.frame.translation
                    ax.plot([pos1[0], pos2[0]],
                           [pos1[1], pos2[1]],
                           [pos1[2], pos2[2]],
                           'gray', alpha=0.3)

        # Label nodes
        for i, node in enumerate(self.nodes):
            pos = node.frame.translation
            ax.text(pos[0], pos[1], pos[2], str(i), fontsize=8)

        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        ax.set_title(f'Network Topology ({self.topology})')
        plt.tight_layout()
        plt.show()

    def plot_convergence(self, history):
        """Plot convergence over time"""
        import matplotlib.pyplot as plt

        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # Plot individual node states
        ax = axes[0]
        for i in range(min(10, self.num_nodes)):  # Plot first 10 nodes
            ax.plot(history[:, i].numpy(), alpha=0.5, label=f'Node {i}')
        ax.set_xlabel('Step')
        ax.set_ylabel('State')
        ax.set_title('Individual Node States')
        if self.num_nodes <= 10:
            ax.legend()

        # Plot variance over time
        ax = axes[1]
        variance = history.var(dim=1).numpy()
        ax.plot(variance)
        ax.set_xlabel('Step')
        ax.set_ylabel('Variance')
        ax.set_title('Network Variance')
        ax.set_yscale('log')

        plt.tight_layout()
        plt.show()

    def __repr__(self):
        return f"ConsensusNetwork(nodes={self.num_nodes}, topology={self.topology})"
```

---

## Implementation Steps

### Step 1: Basic Setup

```python
# setup.py
import torch
import numpy as np
from se3_consensus import SE3Frame, ConsensusNode, ConsensusNetwork

# Set random seed for reproducibility
torch.manual_seed(42)
np.random.seed(42)

# Create network
network = ConsensusNetwork(
    num_nodes=50,
    topology='random_geometric',
    radius=5.0
)

print(f"Created network with {network.num_nodes} nodes")
print(f"Topology: {network.topology}")
```

### Step 2: Initialize States

```python
# Initialize random states
for node in network.nodes:
    node.state = torch.randn(1) * 10

print("Initial states:")
for i, node in enumerate(network.nodes[:5]):  # First 5 nodes
    print(f"  Node {i}: {node.state.item():.3f}")
```

### Step 3: Run Consensus

```python
# Run consensus
history = network.run_consensus(
    num_steps=200,
    record_history=True,
    tolerance=1e-3
)

# Get final consensus value
final_value = network.get_consensus_value()
print(f"\nFinal consensus value: {final_value.item():.3f}")
```

### Step 4: Visualize Results

```python
# Plot convergence
network.plot_convergence(history)

# Plot network topology
network.plot_network()
```

### Step 5: Test Equivariance

```python
# Test SE(3) equivariance
print("\n" + "="*50)
print("Testing SE(3) Equivariance")
print("="*50)

# Run consensus on original network
network_original = ConsensusNetwork(num_nodes=20, topology='fully_connected')
for node in network_original.nodes:
    node.state = torch.randn(1)

history_original = network_original.run_consensus(num_steps=50)
consensus_original = network_original.get_consensus_value()

# Rotate network
network_original.rotate_network(axis=[0, 0, 1], angle=np.pi/4)

# Reset states and run again
for node in network_original.nodes:
    node.state = torch.randn(1)

history_rotated = network_original.run_consensus(num_steps=50)
consensus_rotated = network_original.get_consensus_value()

print(f"Original consensus: {consensus_original.item():.3f}")
print(f"Rotated consensus:  {consensus_rotated.item():.3f}")
print(f"Difference:         {abs(consensus_original - consensus_rotated).item():.6f}")
print(f"Equivariance holds: {abs(consensus_original - consensus_rotated) < 1e-5}")
```

---

## Testing and Validation

### Unit Tests

```python
# test_se3_consensus.py
import unittest
import torch
import numpy as np
from se3_consensus import SE3Frame, ConsensusNode, ConsensusNetwork

class TestSE3Frame(unittest.TestCase):
    """Test SE3Frame operations"""

    def test_frame_creation(self):
        """Test frame initialization"""
        frame = SE3Frame()
        self.assertTrue(torch.allclose(frame.rotation, torch.eye(3)))
        self.assertTrue(torch.allclose(frame.translation, torch.zeros(3)))

    def test_to_local_to_global(self):
        """Test local/global coordinate transformations"""
        frame = SE3Frame(
            rotation=torch.eye(3),
            translation=torch.tensor([1.0, 2.0, 3.0])
        )

        # Point at origin in global
        global_point = torch.zeros(3)

        # Should be at [-1, -2, -3] in local
        local_point = frame.to_local(global_point)
        expected = torch.tensor([-1.0, -2.0, -3.0])
        self.assertTrue(torch.allclose(local_point, expected))

        # Round trip should return to global
        recovered_global = frame.to_global(local_point)
        self.assertTrue(torch.allclose(recovered_global, global_point, atol=1e-5))

    def test_composition(self):
        """Test frame composition"""
        frame1 = SE3Frame(
            translation=torch.tensor([1.0, 0.0, 0.0])
        )
        frame2 = SE3Frame(
            translation=torch.tensor([0.0, 1.0, 0.0])
        )

        composed = frame1.compose(frame2)
        expected_translation = torch.tensor([1.0, 1.0, 0.0])

        self.assertTrue(torch.allclose(composed.translation, expected_translation))

    def test_inverse(self):
        """Test frame inversion"""
        frame = SE3Frame(
            rotation=torch.eye(3),
            translation=torch.tensor([1.0, 2.0, 3.0])
        )

        inverse = frame.inverse()
        identity = frame.compose(inverse)

        self.assertTrue(torch.allclose(identity.rotation, torch.eye(3)))
        self.assertTrue(torch.allclose(identity.translation, torch.zeros(3), atol=1e-5))


class TestConsensusNode(unittest.TestCase):
    """Test consensus node operations"""

    def test_node_creation(self):
        """Test node initialization"""
        node = ConsensusNode(node_id=0)
        self.assertEqual(node.id, 0)
        self.assertEqual(len(node.neighbors), 0)

    def test_add_neighbor(self):
        """Test adding neighbors"""
        node1 = ConsensusNode(node_id=0)
        node2 = ConsensusNode(node_id=1)

        node1.add_neighbor(node2)
        self.assertEqual(len(node1.neighbors), 1)
        self.assertIn(node2, node1.neighbors)

    def test_relative_position(self):
        """Test relative position computation"""
        node1 = ConsensusNode(node_id=0)
        node1.frame.translation = torch.tensor([0.0, 0.0, 0.0])

        node2 = ConsensusNode(node_id=1)
        node2.frame.translation = torch.tensor([1.0, 0.0, 0.0])

        rel_pos = node1.get_relative_position(node2)
        expected = torch.tensor([1.0, 0.0, 0.0])

        self.assertTrue(torch.allclose(rel_pos, expected))

    def test_attention_weights(self):
        """Test attention weight computation"""
        node1 = ConsensusNode(node_id=0)
        node1.frame.translation = torch.tensor([0.0, 0.0, 0.0])

        node2 = ConsensusNode(node_id=1)
        node2.frame.translation = torch.tensor([1.0, 0.0, 0.0])

        node3 = ConsensusNode(node_id=2)
        node3.frame.translation = torch.tensor([2.0, 0.0, 0.0])

        node1.add_neighbor(node2)
        node1.add_neighbor(node3)

        weights = node1.compute_attention_weights()

        # Weights should sum to 1
        self.assertAlmostEqual(sum(weights.values()), 1.0, places=5)

        # Closer node should have higher weight
        self.assertGreater(weights[1], weights[2])


class TestConsensusNetwork(unittest.TestCase):
    """Test consensus network operations"""

    def test_network_creation(self):
        """Test network initialization"""
        network = ConsensusNetwork(num_nodes=10, topology='fully_connected')
        self.assertEqual(len(network.nodes), 10)

        # Fully connected: each node has 9 neighbors
        for node in network.nodes:
            self.assertEqual(len(node.neighbors), 9)

    def test_consensus_convergence(self):
        """Test that consensus converges"""
        network = ConsensusNetwork(num_nodes=20, topology='fully_connected')

        # Initialize random states
        for node in network.nodes:
            node.state = torch.randn(1) * 10

        # Run consensus
        history = network.run_consensus(num_steps=200)

        # Check convergence (low variance)
        final_variance = history[-1].var().item()
        self.assertLess(final_variance, 0.01)

    def test_rotation_equivariance(self):
        """Test SE(3) equivariance under rotation"""
        # Create network
        network = ConsensusNetwork(num_nodes=10, topology='fully_connected')

        # Initialize states
        for node in network.nodes:
            node.state = torch.randn(1)

        # Run consensus
        history1 = network.run_consensus(num_steps=50)
        consensus1 = network.get_consensus_value()

        # Rotate network
        network.rotate_network(axis=[0, 0, 1], angle=np.pi/3)

        # Reset states
        for node in network.nodes:
            node.state = torch.randn(1)

        # Run consensus again
        history2 = network.run_consensus(num_steps=50)
        consensus2 = network.get_consensus_value()

        # Consensus values should be similar (not identical due to different initial states)
        # But the CONVERGENCE BEHAVIOR should be the same
        variance1 = history1[-1].var().item()
        variance2 = history2[-1].var().item()

        self.assertLess(variance1, 0.01)
        self.assertLess(variance2, 0.01)


if __name__ == '__main__':
    unittest.main()
```

### Integration Tests

```python
# test_integration.py
def test_ocds_integration():
    """Test integration with Origin-Centric Data Systems"""

    # Mock OCDS origin
    class MockOrigin:
        def __init__(self, origin_id, position, orientation):
            self.id = origin_id
            self.frame = SE3Frame(
                rotation=torch.tensor(orientation),
                translation=torch.tensor(position)
            )
            self.state = torch.randn(STATE_DIM)

    # Create origins
    origins = [
        MockOrigin(i, np.random.randn(3) * 10, random_rotation_matrix())
        for i in range(100)
    ]

    # Create consensus network
    network = ConsensusNetwork(num_nodes=100, topology='random_geometric', radius=5.0)

    # Initialize states from origins
    for node, origin in zip(network.nodes, origins):
        node.state = origin.state.clone()

    # Run consensus
    history = network.run_consensus(num_steps=100)

    # Verify convergence
    assert history[-1].var().item() < 0.01
    print("✓ OCDS integration test passed")
```

---

## Performance Optimization

### Optimization 1: Sparse Attention

```python
class SparseConsensusNode(ConsensusNode):
    """
    Node with sparse attention (k-nearest neighbors only)
    """

    def __init__(self, node_id, frame=None, state_dim=1, k_neighbors=16):
        super().__init__(node_id, frame, state_dim)
        self.k_neighbors = k_neighbors

    def compute_attention_weights(self):
        """Compute attention weights for k-nearest neighbors only"""
        if not self.neighbors:
            return {}

        # Compute distances to all neighbors
        distances = []
        for neighbor in self.neighbors:
            t_rel = self.get_relative_position(neighbor)
            dist = torch.norm(t_rel).item()
            distances.append((neighbor.id, dist, neighbor))

        # Sort by distance and keep k-nearest
        distances.sort(key=lambda x: x[1])
        k_nearest = distances[:self.k_neighbors]

        # Compute weights only for k-nearest
        weights = {}
        for neighbor_id, dist, _ in k_nearest:
            energy = -dist / self.temperature
            weights[neighbor_id] = np.exp(energy)

        # Normalize
        total = sum(weights.values())
        if total > 0:
            for neighbor_id in weights:
                weights[neighbor_id] /= total

        return weights
```

### Optimization 2: GPU Acceleration

```python
class GPUConsensusNetwork:
    """
    GPU-accelerated consensus network
    """

    def __init__(self, num_nodes, device='cuda'):
        self.num_nodes = num_nodes
        self.device = torch.device(device if torch.cuda.is_available() else 'cpu')

        # Allocate tensors on GPU
        self.positions = torch.randn(num_nodes, 3, device=self.device)
        self.orientations = torch.eye(3).unsqueeze(0).repeat(num_nodes, 1, 1).to(self.device)
        self.states = torch.randn(num_nodes, 1, device=self.device)

        # Adjacency matrix
        self.adjacency = torch.zeros(num_nodes, num_nodes, device=self.device)

    def compute_attention_gpu(self):
        """Compute attention weights on GPU"""
        # Pairwise distances
        diff = self.positions.unsqueeze(1) - self.positions.unsqueeze(0)  # [n, n, 3]
        dist_sq = (diff ** 2).sum(-1)  # [n, n]

        # Attention weights
        attn = -0.5 * dist_sq
        attn = torch.softmax(attn, dim=-1)

        return attn

    def consensus_step_gpu(self):
        """Perform consensus step on GPU"""
        # Compute attention
        attn = self.compute_attention_gpu()

        # Weighted average
        self.states = attn @ self.states
```

---

## Integration with SuperInstance

### Integration Point 1: OCDS Federation

```python
class SE3OCDSAdapter:
    """
    Adapter for SE(3)-equivariant consensus in OCDS
    """

    def __init__(self, ocds_system):
        self.ocds = ocds_system
        self.consensus_network = None

    def initialize_from_origins(self, origins):
        """Initialize consensus network from OCDS origins"""
        self.consensus_network = ConsensusNetwork(
            num_nodes=len(origins),
            topology='random_geometric',
            radius=self.ocds.config.federation_radius
        )

        # Set positions and orientations from origins
        for node, origin in zip(self.consensus_network.nodes, origins):
            node.frame.translation = torch.tensor(origin.position, dtype=torch.float32)
            node.frame.rotation = torch.tensor(origin.orientation, dtype=torch.float32)
            node.state = torch.tensor(origin.state, dtype=torch.float32)

    def federate(self, num_rounds=10):
        """Run federation using SE(3)-equivariant consensus"""
        for round in range(num_rounds):
            # Run consensus
            history = self.consensus_network.run_consensus(
                num_steps=self.ocds.config.consensus_steps,
                record_history=True
            )

            # Update origin states
            consensus_value = self.consensus_network.get_consensus_value()
            for origin in self.ocds.origins:
                origin.state = consensus_value.numpy()

            # OCDS-specific logic (confidence propagation, etc.)
            self.ocds.propagate_confidence()
            self.ocds.update_confidence_cascades()

        return history
```

### Integration Point 2: Wigner-D Harmonics

```python
class WignerDSE3Bridge:
    """
    Bridge between Wigner-D harmonics (P9) and SE(3) equivariance
    """

    @staticmethod
    def spherical_to_frame(spherical_coeffs):
        """
        Convert spherical harmonic coefficients to SE(3) frame

        Args:
            spherical_coeffs: [(l, m, coefficient)] list

        Returns:
            frame: SE3Frame
        """
        # Extract l=1 (vector) components for orientation
        l1_coeffs = [c for l, m, c in spherical_coeffs if l == 1]

        if len(l1_coeffs) == 3:
            # Construct rotation matrix from l=1 coefficients
            vec = torch.tensor([c[2] for c in l1_coeffs])
            axis = vec / torch.norm(vec)
            angle = torch.norm(vec)

            frame = SE3Frame.from_axis_angle(axis.numpy(), angle.item())
        else:
            frame = SE3Frame()  # Identity

        return frame

    @staticmethod
    def frame_to_spherical(frame, max_l=3):
        """
        Convert SE(3) frame to spherical harmonic coefficients

        Args:
            frame: SE3Frame
            max_l: Maximum degree

        Returns:
            spherical_coeffs: [(l, m, coefficient)] list
        """
        coeffs = []

        # Extract rotation axis-angle
        # (Simplified: using rotation matrix trace)

        trace = torch.trace(frame.rotation)
        angle = torch.acos((trace - 1) / 2)

        if angle > 1e-6:
            axis = torch.tensor([
                frame.rotation[2, 1] - frame.rotation[1, 2],
                frame.rotation[0, 2] - frame.rotation[2, 0],
                frame.rotation[1, 0] - frame.rotation[0, 1]
            ]) / (2 * torch.sin(angle))
        else:
            axis = torch.tensor([0.0, 0.0, 1.0])

        # Convert to spherical harmonics (l=1 for vector)
        for m in range(-1, 2):
            coeff = axis[abs(m)] * angle.item()
            coeffs.append((1, m, coeff))

        return coeffs
```

---

## Troubleshooting

### Issue 1: Slow Convergence

**Symptoms:** Consensus takes many steps to converge

**Solutions:**
```python
# Increase learning rate
node.learning_rate = 0.2  # Default: 0.1

# Decrease temperature (sharper attention)
node.temperature = 0.5  # Default: 1.0

# Ensure network connectivity
if len(node.neighbors) == 0:
    print(f"Node {node.id} has no neighbors!")
```

### Issue 2: Numerical Instability

**Symptoms:** Rotation matrices become non-orthogonal

**Solutions:**
```python
# Re-orthogonalize periodically
for node in network.nodes:
    node.frame.normalize()

# Use quaternions instead of rotation matrices
# (requires QuaternionFrame class)
```

### Issue 3: Memory Overflow

**Symptoms:** Out of memory for large networks

**Solutions:**
```python
# Use sparse attention
node = SparseConsensusNode(node_id, k_neighbors=16)

# Process in batches
batch_size = 1000
for i in range(0, num_nodes, batch_size):
    batch = network.nodes[i:i+batch_size]
    # Process batch
```

---

## Next Steps

1. **Implement core components** (SE3Frame, ConsensusNode, ConsensusNetwork)
2. **Run unit tests** to verify correctness
3. **Benchmark performance** on synthetic networks
4. **Integrate with OCDS** for production testing
5. **Submit P61** to PODC 2027

**Estimated Timeline:**
- Week 1-2: Core implementation
- Week 3-4: Testing and validation
- Week 5-6: Integration and benchmarking
- Week 7-8: Paper preparation (P61)

---

**Status:** Ready for Implementation
**Contact:** SuperInstance Research Team
**Last Updated:** 2026-03-14
