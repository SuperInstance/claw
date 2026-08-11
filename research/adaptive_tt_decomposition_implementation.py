"""
Adaptive Low-Rank Tensor Decomposition Implementation
====================================================

Implementation of Tensor-Train (TT) decomposition with adaptive rank selection
for distributed systems and federated learning applications.

Features:
- TT-SVD decomposition with adaptive rank selection
- Comparison to LoRA (Low-Rank Adaptation)
- Federated learning compression
- Performance benchmarks
- PyTorch integration

Author: SuperInstance Research Team
Date: 2026-03-14
License: MIT
"""

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import List, Tuple, Dict, Optional, Union
from dataclasses import dataclass
import time
from collections import defaultdict


# ============================================================================
# Core Tensor-Train Decomposition
# ============================================================================

@dataclass
class TTResult:
    """Result of Tensor-Train decomposition"""
    cores: List[torch.Tensor]
    ranks: Tuple[int, ...]
    reconstruction_error: float
    compression_ratio: float
    shape: Tuple[int, ...]
    decomposition_time: float


def tt_svd_torch(
    tensor: torch.Tensor,
    epsilon: float = 1e-10,
    max_ranks: Optional[Tuple[int, ...]] = None,
    relative_eps: bool = True,
    device: str = 'cpu'
) -> TTResult:
    """
    Tensor Train decomposition via successive SVD (PyTorch implementation)

    Parameters:
    -----------
    tensor : torch.Tensor
        Input tensor of shape (d1, d2, ..., dn)
    epsilon : float
        Truncation tolerance for singular values
    max_ranks : tuple of int, optional
        Maximum allowed ranks
    relative_eps : bool
        If True, epsilon is relative to largest singular value
    device : str
        Device to use ('cpu' or 'cuda')

    Returns:
    --------
    TTResult
        Object containing cores, ranks, error, and compression ratio
    """
    start_time = time.time()

    tensor = tensor.to(device)
    ndim = tensor.ndim
    shape = tensor.shape

    if max_ranks is None:
        max_ranks = tuple(min(np.prod(shape[:i+1]), np.prod(shape[i+1:]))
                         for i in range(ndim - 1))

    # Reshape to matrix for first SVD
    current = tensor.reshape(shape[0], -1)

    cores = []
    ranks = [1]

    for i in range(ndim - 1):
        # SVD
        U, S, Vt = torch.linalg.svd(current, full_matrices=False)

        # Determine truncation rank
        if relative_eps and len(S) > 0:
            threshold = epsilon * S[0]
        else:
            threshold = epsilon

        rank = int(torch.sum(S > threshold).item())
        rank = min(rank, max_ranks[i], len(S))
        rank = max(1, rank)  # Ensure at least rank 1

        # Truncate
        U = U[:, :rank]
        S = S[:rank]
        Vt = Vt[:rank, :]

        # Reshape core
        if i == 0:
            core = U.reshape(1, shape[i], rank)
        else:
            core = U.reshape(ranks[-1], shape[i], rank)

        cores.append(core)
        ranks.append(rank)

        # Prepare for next iteration
        current = torch.diag(S) @ Vt
        current = current.reshape(rank * shape[i + 1], -1)

    # Last core
    last_core = current.reshape(ranks[-1], shape[-1], 1)
    cores.append(last_core)
    ranks.append(1)

    # Compute reconstruction error
    reconstructed = reconstruct_tt(cores)
    error = torch.norm(tensor - reconstructed) / torch.norm(tensor)

    # Compression ratio
    original_size = np.prod(shape)
    compressed_size = sum(c.numel() for c in cores)
    compression_ratio = original_size / compressed_size if compressed_size > 0 else float('inf')

    decomposition_time = time.time() - start_time

    return TTResult(
        cores=cores,
        ranks=tuple(ranks),
        reconstruction_error=error.item(),
        compression_ratio=compression_ratio,
        shape=shape,
        decomposition_time=decomposition_time
    )


def reconstruct_tt(cores: List[torch.Tensor]) -> torch.Tensor:
    """
    Reconstruct full tensor from TT cores

    Parameters:
    -----------
    cores : List[torch.Tensor]
        List of TT cores

    Returns:
    --------
    torch.Tensor
        Reconstructed tensor
    """
    if len(cores) == 0:
        raise ValueError("Empty cores list")

    # Start with first core
    result = cores[0].squeeze(0)  # (n1, r2)

    # Contract through all cores
    for i, core in enumerate(cores[1:], 1):
        result = result @ core.reshape(core.shape[0], -1)
        result = result.reshape(-1, core.shape[2])

    # Reshape to tensor
    shape = tuple(c.shape[1] for c in cores)
    return result.reshape(shape)


def adaptive_rank_tt(
    tensor: torch.Tensor,
    energy_threshold: float = 0.999,
    max_rank: int = 64,
    device: str = 'cpu'
) -> TTResult:
    """
    Tensor-Train decomposition with adaptive rank selection based on energy

    Parameters:
    -----------
    tensor : torch.Tensor
        Input tensor
    energy_threshold : float
        Cumulative energy threshold for rank selection (0-1)
    max_rank : int
        Maximum allowed rank
    device : str
        Device to use

    Returns:
    --------
    TTResult
        Decomposition result with adaptive ranks
    """
    start_time = time.time()

    tensor = tensor.to(device)
    ndim = tensor.ndim
    shape = tensor.shape

    current = tensor.reshape(shape[0], -1)
    cores = []
    ranks = [1]

    for i in range(ndim - 1):
        # SVD
        U, S, Vt = torch.linalg.svd(current, full_matrices=False)

        # Cumulative energy
        energy = torch.cumsum(S**2, dim=0) / torch.sum(S**2)

        # Find rank for energy threshold
        rank_idx = torch.searchsorted(energy, energy_threshold)
        rank = int((rank_idx + 1).item())
        rank = min(rank, max_rank, len(S))
        rank = max(1, rank)

        # Form core
        if i == 0:
            core = U[:, :rank].reshape(1, shape[i], rank)
        else:
            core = U[:, :rank].reshape(ranks[-1], shape[i], rank)

        cores.append(core)
        ranks.append(rank)

        # Prepare next
        current = torch.diag(S[:rank]) @ Vt[:rank, :]
        current = current.reshape(rank * shape[i+1], -1)

    # Last core
    last_core = current.reshape(ranks[-1], shape[-1], 1)
    cores.append(last_core)
    ranks.append(1)

    # Metrics
    reconstructed = reconstruct_tt(cores)
    error = torch.norm(tensor - reconstructed) / torch.norm(tensor)

    original_size = np.prod(shape)
    compressed_size = sum(c.numel() for c in cores)
    compression_ratio = original_size / compressed_size

    decomposition_time = time.time() - start_time

    return TTResult(
        cores=cores,
        ranks=tuple(ranks),
        reconstruction_error=error.item(),
        compression_ratio=compression_ratio,
        shape=shape,
        decomposition_time=decomposition_time
    )


# ============================================================================
# PyTorch Layers with TT Decomposition
# ============================================================================

class TTLinear(nn.Module):
    """
    Tensor-Train Linear Layer

    Replaces dense linear layer with TT-decomposed weights
    """
    def __init__(
        self,
        in_features: int,
        out_features: int,
        rank: int = 8,
        bias: bool = True,
        device: str = 'cpu'
    ):
        super().__init__()
        self.in_features = in_features
        self.out_features = out_features
        self.rank = rank
        self.device = device

        # TT cores for 2D matrix [out_features, in_features]
        # Core 0: [1, out_features, rank]
        # Core 1: [rank, in_features, 1]
        self.core0 = nn.Parameter(torch.randn(1, out_features, rank, device=device))
        self.core1 = nn.Parameter(torch.randn(rank, in_features, 1, device=device))

        if bias:
            self.bias = nn.Parameter(torch.zeros(out_features, device=device))
        else:
            self.register_parameter('bias', None)

        self._reset_parameters()

    def _reset_parameters(self):
        """Initialize parameters"""
        nn.init.xavier_uniform_(self.core0)
        nn.init.xavier_uniform_(self.core1)
        if self.bias is not None:
            nn.init.zeros_(self.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass"""
        # Reconstruct weight matrix from TT cores
        weight = torch.einsum('ior, r i 1 -> o i', self.core0, self.core1)

        # Linear operation
        return F.linear(x, weight, self.bias)

    def compress_from_dense(self, dense_weight: torch.Tensor, epsilon: float = 1e-6):
        """
        Initialize from dense weight matrix using TT-SVD

        Parameters:
        -----------
        dense_weight : torch.Tensor
            Dense weight matrix [out_features, in_features]
        epsilon : float
            Truncation tolerance
        """
        # Ensure 2D
        if dense_weight.dim() != 2:
            raise ValueError(f"Expected 2D tensor, got {dense_weight.dim()}D")

        # Apply TT-SVD
        result = tt_svd_torch(dense_weight, epsilon=epsilon, device=self.device)

        # Extract cores (2D case)
        if len(result.cores) >= 2:
            self.core0.data = result.cores[0].data
            self.core1.data = result.cores[1].data

    def compute_compression_ratio(self) -> float:
        """Compute compression ratio"""
        dense_params = self.in_features * self.out_features
        tt_params = self.core0.numel() + self.core1.numel()
        return dense_params / tt_params if tt_params > 0 else float('inf')

    def get_effective_rank(self) -> int:
        """Get effective TT rank"""
        return self.core0.shape[2]

    def adjust_rank(self, new_rank: int):
        """Adjust TT rank (requires re-initialization)"""
        old_rank = self.rank
        self.rank = new_rank

        # Resize cores
        self.core0.data = torch.cat([
            self.core0.data,
            torch.randn(1, self.out_features, new_rank - old_rank, device=self.device)
        ], dim=2) if new_rank > old_rank else self.core0.data[:, :, :new_rank]

        self.core1.data = torch.cat([
            self.core1.data,
            torch.randn(new_rank - old_rank, self.in_features, 1, device=self.device)
        ], dim=0) if new_rank > old_rank else self.core1.data[:new_rank, :, :]


class TTConv2d(nn.Module):
    """
    Tensor-Train 2D Convolution Layer

    Uses TT decomposition for 4D convolutional kernel
    """
    def __init__(
        self,
        in_channels: int,
        out_channels: int,
        kernel_size: Union[int, Tuple[int, int]],
        rank: int = 8,
        stride: int = 1,
        padding: int = 0,
        bias: bool = True,
        device: str = 'cpu'
    ):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.kernel_size = (kernel_size, kernel_size) if isinstance(kernel_size, int) else kernel_size
        self.stride = stride
        self.padding = padding
        self.rank = rank
        self.device = device

        # TT cores for 4D kernel [out, in, kh, kw]
        kh, kw = self.kernel_size

        # Simplified: Use 2 cores for matrix view
        # Core 0: [1, out_channels * kh, rank]
        # Core 1: [rank, in_channels * kw, 1]
        self.core0 = nn.Parameter(torch.randn(
            1, out_channels * kh, rank, device=device
        ))
        self.core1 = nn.Parameter(torch.randn(
            rank, in_channels * kw, 1, device=device
        ))

        if bias:
            self.bias = nn.Parameter(torch.zeros(out_channels, device=device))
        else:
            self.register_parameter('bias', None)

        self._reset_parameters()

    def _reset_parameters(self):
        nn.init.xavier_uniform_(self.core0)
        nn.init.xavier_uniform_(self.core1)
        if self.bias is not None:
            nn.init.zeros_(self.bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass"""
        # Reconstruct kernel
        weight = torch.einsum('ior, r i 1 -> o i', self.core0, self.core1)

        # Reshape to 4D kernel
        kh, kw = self.kernel_size
        weight = weight.reshape(self.out_channels, self.in_channels, kh, kw)

        # Standard convolution
        return F.conv2d(x, weight, bias=self.bias, stride=self.stride, padding=self.padding)

    def compress_from_dense(self, dense_weight: torch.Tensor, epsilon: float = 1e-6):
        """Initialize from dense kernel using TT-SVD"""
        # Reshape to 2D
        out_ch, in_ch, kh, kw = dense_weight.shape
        weight_2d = dense_weight.reshape(out_ch * kh, in_ch * kw)

        # TT decomposition
        result = tt_svd_torch(weight_2d, epsilon=epsilon, device=self.device)

        if len(result.cores) >= 2:
            self.core0.data = result.cores[0].data
            self.core1.data = result.cores[1].data

    def compute_compression_ratio(self) -> float:
        """Compute compression ratio"""
        dense_params = self.out_channels * self.in_channels * np.prod(self.kernel_size)
        tt_params = self.core0.numel() + self.core1.numel()
        return dense_params / tt_params


# ============================================================================
# Adaptive Rank Selection
# ============================================================================

class AdaptiveRankSelector(nn.Module):
    """
    Learned adaptive rank selection for TT decomposition

    Predicts optimal rank based on tensor statistics
    """
    def __init__(self, max_rank: int = 64, feature_dim: int = 64):
        super().__init__()
        self.max_rank = max_rank

        # Feature extractor
        self.feature_net = nn.Sequential(
            nn.Linear(feature_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU()
        )

        # Rank predictor
        self.rank_predictor = nn.Linear(64, max_rank)

    def forward(self, tensor_stats: torch.Tensor) -> int:
        """
        Predict rank from tensor statistics

        Parameters:
        -----------
        tensor_stats : torch.Tensor
            Statistical features of tensor

        Returns:
        --------
        int
            Predicted rank
        """
        features = self.feature_net(tensor_stats)
        logits = self.rank_predictor(features)

        # Softmax over ranks
        probs = F.softmax(logits, dim=-1)

        # Expected rank
        rank = int((probs * torch.arange(1, self.max_rank + 1, device=probs.device)).sum().item())

        return max(1, min(rank, self.max_rank))


def collect_tensor_stats(tensor: torch.Tensor) -> torch.Tensor:
    """
    Collect statistical features from tensor for rank prediction

    Parameters:
    -----------
    tensor : torch.Tensor
        Input tensor

    Returns:
    --------
    torch.Tensor
        Feature vector
    """
    stats = []

    for dim in range(tensor.ndim):
        # Compute statistics along this dimension
        dims_to_reduce = tuple(i for i in range(tensor.ndim) if i != dim)

        if dims_to_reduce:
            dim_stats = tensor.float().mean(dim=dims_to_reduce)
        else:
            dim_stats = tensor.float()

        stats.extend([
            dim_stats.mean().item(),
            dim_stats.var().item() if dim_stats.numel() > 1 else 0.0,
            (dim_stats.max() - dim_stats.min()).item() if dim_stats.numel() > 0 else 0.0
        ])

    return torch.tensor(stats, dtype=torch.float32)


# ============================================================================
# Federated Learning with TT Compression
# ============================================================================

class TTFederatedClient:
    """
    Federated learning client with TT compression
    """
    def __init__(
        self,
        model: nn.Module,
        tt_rank: int = 8,
        epsilon: float = 1e-6,
        device: str = 'cpu'
    ):
        self.model = model
        self.tt_rank = tt_rank
        self.epsilon = epsilon
        self.device = device

        # Store base parameters
        self.base_params = {
            name: param.detach().clone().to(device)
            for name, param in model.named_parameters()
        }

    def compute_update(self, local_data, epochs: int = 1) -> Dict[str, Dict]:
        """
        Train on local data and compute TT-compressed update

        Parameters:
        -----------
        local_data : DataLoader
            Local training data
        epochs : int
            Number of local training epochs

        Returns:
        --------
        Dict[str, Dict]
            Compressed updates (TT cores or sparse gradients)
        """
        # Local training
        self.model.train()
        optimizer = torch.optim.SGD(self.model.parameters(), lr=0.01)

        for epoch in range(epochs):
            for batch_x, batch_y in local_data:
                optimizer.zero_grad()

                outputs = self.model(batch_x)
                loss = F.cross_entropy(outputs, batch_y)

                loss.backward()
                optimizer.step()

        # Compute updates
        updates = {}
        for name, param in self.model.named_parameters():
            delta = param.data - self.base_params[name]

            # TT compression for large tensors
            if delta.numel() > 1000 and delta.dim() >= 2:
                tt_result = tt_svd_torch(delta, epsilon=self.epsilon, device=self.device)

                updates[name] = {
                    'type': 'tt',
                    'cores': [core.cpu() for core in tt_result.cores],
                    'ranks': tt_result.ranks,
                    'shape': tt_result.shape,
                    'compression_ratio': tt_result.compression_ratio
                }
            else:
                # Keep small updates as-is
                updates[name] = {
                    'type': 'dense',
                    'data': delta.cpu()
                }

        return updates

    def apply_update(self, update: Dict[str, Dict]):
        """Apply compressed update to model"""
        for name, update_data in update.items():
            if update_data['type'] == 'tt':
                # Reconstruct from TT
                cores = [core.to(self.device) for core in update_data['cores']]
                delta = reconstruct_tt(cores)
            else:
                delta = update_data['data'].to(self.device)

            # Update model parameter
            if name in dict(self.model.named_parameters()):
                param = dict(self.model.named_parameters())[name]
                param.data += delta

                # Update base parameter
                self.base_params[name] = param.data.detach().clone()


class TTFederatedServer:
    """
    Federated learning server with TT aggregation
    """
    def __init__(self, model: nn.Module, device: str = 'cpu'):
        self.model = model
        self.device = device
        self.global_params = {
            name: param.detach().clone().to(device)
            for name, param in model.named_parameters()
        }

    def aggregate_updates(
        self,
        client_updates: List[Dict[str, Dict]],
        client_weights: Optional[List[float]] = None
    ) -> Dict[str, torch.Tensor]:
        """
        Aggregate TT-compressed updates from clients

        Parameters:
        -----------
        client_updates : List[Dict[str, Dict]]
            Updates from multiple clients
        client_weights : List[float], optional
            Weight for each client's update

        Returns:
        --------
        Dict[str, torch.Tensor]
            Aggregated updates
        """
        if client_weights is None:
            client_weights = [1.0 / len(client_updates)] * len(client_updates)

        aggregated = {}

        for name in client_updates[0].keys():
            updates = [u[name] for u in client_updates]

            if updates[0]['type'] == 'tt':
                # TT aggregation
                aggregated[name] = self.aggregate_tt_updates(updates, client_weights)
            else:
                # Simple averaging for dense updates
                dense_updates = [u['data'] for u in updates]
                aggregated[name] = sum(w * d for w, d in zip(client_weights, dense_updates))

        # Update global model
        for name, update in aggregated.items():
            if name in self.global_params:
                self.global_params[name] += update

        return aggregated

    def aggregate_tt_updates(
        self,
        tt_updates: List[Dict],
        weights: List[float]
    ) -> torch.Tensor:
        """Aggregate TT-decomposed updates"""
        n_clients = len(tt_updates)
        n_cores = len(tt_updates[0]['cores'])

        # Average cores at each position
        avg_cores = []
        for core_idx in range(n_cores):
            # Gather cores from all clients
            cores = [torch.tensor(update['cores'][core_idx]) for update in tt_updates]

            # Weighted average
            avg_core = sum(w * c for w, c in zip(weights, cores))

            avg_cores.append(avg_core)

        # Reconstruct tensor
        reconstructed = reconstruct_tt(avg_cores)

        return reconstructed

    def distribute_model(self) -> Dict[str, torch.Tensor]:
        """Distribute current global model"""
        return {name: param.cpu() for name, param in self.global_params.items()}


# ============================================================================
# Benchmarking and Evaluation
# ============================================================================

class TTBenchmark:
    """Benchmarking suite for TT decomposition"""

    def __init__(self, device: str = 'cpu'):
        self.device = device
        self.results = []

    def benchmark_compression(
        self,
        tensors: List[torch.Tensor],
        ranks: List[int],
        epsilons: List[float]
    ) -> Dict[str, pd.DataFrame]:
        """Benchmark compression ratios and errors"""
        results = {
            'compression': [],
            'error': [],
            'time': []
        }

        for tensor in tensors:
            for rank in ranks:
                for epsilon in epsilons:
                    # TT decomposition
                    result = tt_svd_torch(
                        tensor,
                        epsilon=epsilon,
                        max_ranks=(rank,) * (tensor.ndim - 1),
                        device=self.device
                    )

                    results['compression'].append({
                        'shape': str(tensor.shape),
                        'rank': rank,
                        'epsilon': epsilon,
                        'compression_ratio': result.compression_ratio
                    })

                    results['error'].append({
                        'shape': str(tensor.shape),
                        'rank': rank,
                        'epsilon': epsilon,
                        'reconstruction_error': result.reconstruction_error
                    })

                    results['time'].append({
                        'shape': str(tensor.shape),
                        'rank': rank,
                        'epsilon': epsilon,
                        'decomp_time': result.decomposition_time
                    })

        return {k: pd.DataFrame(v) for k, v in results.items()}

    def benchmark_linear_layer(
        self,
        in_features: int,
        out_features: int,
        rank: int,
        batch_size: int = 32,
        n_iterations: int = 100
    ) -> Dict[str, float]:
        """Benchmark TT-Linear vs Dense Linear"""
        # Create layers
        dense_layer = nn.Linear(in_features, out_features).to(self.device)
        tt_layer = TTLinear(in_features, out_features, rank=rank, device=self.device)

        # Compress TT layer from dense
        tt_layer.compress_from_dense(dense_layer.weight.data)

        # Benchmark data
        x = torch.randn(batch_size, in_features, device=self.device)

        # Warmup
        for _ in range(10):
            _ = dense_layer(x)
            _ = tt_layer(x)

        # Dense forward
        start = time.time()
        for _ in range(n_iterations):
            y_dense = dense_layer(x)
        dense_time = (time.time() - start) / n_iterations

        # TT forward
        start = time.time()
        for _ in range(n_iterations):
            y_tt = tt_layer(x)
        tt_time = (time.time() - start) / n_iterations

        # Verify correctness
        error = torch.norm(y_dense - y_tt) / torch.norm(y_dense)

        # Compute metrics
        dense_params = in_features * out_features
        tt_params = tt_layer.core0.numel() + tt_layer.core1.numel()

        return {
            'dense_time_ms': dense_time * 1000,
            'tt_time_ms': tt_time * 1000,
            'speedup': dense_time / tt_time,
            'error': error.item(),
            'dense_params': dense_params,
            'tt_params': tt_params,
            'compression_ratio': dense_params / tt_params,
            'memory_saving': (dense_params - tt_params) * 4 / (1024 ** 2)  # MB
        }

    def benchmark_federated(
        self,
        n_clients: int,
        model: nn.Module,
        tt_rank: int,
        data_size: int = 1000
    ) -> Dict[str, float]:
        """Benchmark federated learning with TT compression"""
        # Simulate updates
        dense_updates = []
        tt_updates = []

        total_dense_size = 0
        total_tt_size = 0

        for _ in range(n_clients):
            # Generate random update
            for name, param in model.named_parameters():
                if param.dim() >= 2:
                    update = torch.randn_like(param) * 0.01

                    # Dense size
                    dense_size = update.numel() * 4  # 4 bytes per float
                    total_dense_size += dense_size

                    # TT compression
                    tt_result = tt_svd_torch(update, epsilon=1e-6, device=self.device)
                    tt_size = sum(c.numel() * 4 for c in tt_result.cores)
                    total_tt_size += tt_size

        # Compute metrics
        bandwidth_saving = (total_dense_size - total_tt_size) / total_dense_size

        return {
            'n_clients': n_clients,
            'dense_size_mb': total_dense_size / (1024 ** 2),
            'tt_size_mb': total_tt_size / (1024 ** 2),
            'bandwidth_saving_pct': bandwidth_saving * 100,
            'compression_ratio': total_dense_size / total_tt_size,
            'estimated_time_dense_s': total_dense_size / (1e9) / 1e-9,  # Assuming 1 Gbps
            'estimated_time_tt_s': total_tt_size / (1e9) / 1e-9
        }


# ============================================================================
# Utilities
# ============================================================================

def convert_model_to_tt(
    model: nn.Module,
    rank: int = 8,
    epsilon: float = 1e-6,
    device: str = 'cpu'
) -> nn.Module:
    """
    Convert trained model to TT format

    Parameters:
    -----------
    model : nn.Module
        Input model with dense layers
    rank : int
        TT rank for decomposition
    epsilon : float
        Truncation tolerance
    device : str
        Target device

    Returns:
    --------
    nn.Module
        Model with TT layers
    """
    import copy

    tt_model = copy.deepcopy(model)

    for name, module in list(tt_model.named_modules()):
        if isinstance(module, nn.Linear):
            # Create TT layer
            tt_layer = TTLinear(
                module.in_features,
                module.out_features,
                rank=rank,
                bias=module.bias is not None,
                device=device
            )

            # Compress from dense weights
            tt_layer.compress_from_dense(module.weight.data, epsilon=epsilon)

            if module.bias is not None:
                tt_layer.bias.data = module.bias.data

            # Replace in model
            set_module(tt_model, name, tt_layer)

        elif isinstance(module, nn.Conv2d):
            # Create TT conv layer
            tt_layer = TTConv2d(
                module.in_channels,
                module.out_channels,
                module.kernel_size,
                rank=rank,
                stride=module.stride,
                padding=module.padding,
                bias=module.bias is not None,
                device=device
            )

            # Compress from dense weights
            tt_layer.compress_from_dense(module.weight.data, epsilon=epsilon)

            if module.bias is not None:
                tt_layer.bias.data = module.bias.data

            # Replace in model
            set_module(tt_model, name, tt_layer)

    return tt_model


def set_module(model: nn.Module, name: str, new_module: nn.Module):
    """Replace module in model by name"""
    parts = name.split('.')
    parent = model

    for part in parts[:-1]:
        if part.isdigit():
            parent = parent[int(part)]
        else:
            parent = getattr(parent, part)

    last_part = parts[-1]
    if last_part.isdigit():
        parent[int(last_part)] = new_module
    else:
        setattr(parent, last_part, new_module)


def print_tt_summary(result: TTResult):
    """Print summary of TT decomposition result"""
    print(f"\n{'='*60}")
    print(f"Tensor-Train Decomposition Summary")
    print(f"{'='*60}")
    print(f"Original Shape: {result.shape}")
    print(f"TT Ranks: {result.ranks}")
    print(f"\nCompression Metrics:")
    print(f"  Original Size: {np.prod(result.shape):,} elements")
    print(f"  TT Size: {sum(c.numel() for c in result.cores):,} elements")
    print(f"  Compression Ratio: {result.compression_ratio:.2f}x")
    print(f"  Memory Savings: {(1 - 1/result.compression_ratio)*100:.1f}%")
    print(f"\nAccuracy Metrics:")
    print(f"  Reconstruction Error: {result.reconstruction_error:.6e}")
    print(f"  Relative Accuracy: {(1 - result.reconstruction_error)*100:.2f}%")
    print(f"\nPerformance:")
    print(f"  Decomposition Time: {result.decomposition_time*1000:.2f} ms")
    print(f"{'='*60}\n")


# ============================================================================
# Main Demo
# ============================================================================

def main():
    """Demonstration of TT decomposition capabilities"""
    print("\n" + "="*60)
    print("Adaptive Low-Rank Tensor Decomposition Demo")
    print("="*60)

    # Set device
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"\nUsing device: {device}")

    # 1. Basic TT Decomposition
    print("\n" + "-"*60)
    print("1. Basic TT Decomposition")
    print("-"*60)

    # Create test tensor
    tensor = torch.randn(64, 64, 64, device=device)
    print(f"\nOriginal tensor shape: {tensor.shape}")
    print(f"Original size: {tensor.numel():,} elements ({tensor.numel() * 4 / 1024**2:.2f} MB)")

    # TT decomposition
    result = tt_svd_torch(tensor, epsilon=1e-6, device=device)
    print_tt_summary(result)

    # 2. Adaptive Rank Selection
    print("\n" + "-"*60)
    print("2. Adaptive Rank Selection")
    print("-"*60)

    adaptive_result = adaptive_rank_tt(tensor, energy_threshold=0.999, device=device)
    print_tt_summary(adaptive_result)

    # 3. TT-Linear Layer
    print("\n" + "-"*60)
    print("3. TT-Linear Layer Comparison")
    print("-"*60)

    in_features, out_features = 1024, 1024

    # Dense layer
    dense_layer = nn.Linear(in_features, out_features).to(device)

    # TT layer
    tt_layer = TTLinear(in_features, out_features, rank=16, device=device)
    tt_layer.compress_from_dense(dense_layer.weight.data)

    print(f"\nDense layer parameters: {in_features * out_features:,}")
    print(f"TT layer parameters: {tt_layer.core0.numel() + tt_layer.core1.numel():,}")
    print(f"Compression ratio: {tt_layer.compute_compression_ratio():.2f}x")
    print(f"Memory savings: {(1 - 1/tt_layer.compute_compression_ratio())*100:.1f}%")

    # 4. Benchmarking
    print("\n" + "-"*60)
    print("4. Performance Benchmarking")
    print("-"*60)

    benchmark = TTBenchmark(device=device)

    # Benchmark different sizes
    sizes = [(256, 256), (512, 512), (1024, 1024)]
    ranks = [8, 16, 32]

    print(f"\n{'Size':<15} {'Rank':<8} {'Speedup':<10} {'Compression':<12} {'Error':<10}")
    print("-" * 60)

    for in_f, out_f in sizes:
        for rank in ranks:
            results = benchmark.benchmark_linear_layer(in_f, out_f, rank)
            print(f"{in_f}x{out_f:<8} {rank:<8} "
                  f"{results['speedup']:<10.2f} "
                  f"{results['compression_ratio']:<12.2f} "
                  f"{results['error']:<10.6e}")

    # 5. Federated Learning
    print("\n" + "-"*60)
    print("5. Federated Learning Compression")
    print("-"*60)

    # Simple model
    model = nn.Sequential(
        nn.Linear(784, 256),
        nn.ReLU(),
        nn.Linear(256, 128),
        nn.ReLU(),
        nn.Linear(128, 10)
    ).to(device)

    fed_results = benchmark.benchmark_federated(
        n_clients=50,
        model=model,
        tt_rank=8
    )

    print(f"\nClients: {fed_results['n_clients']}")
    print(f"Dense update size: {fed_results['dense_size_mb']:.2f} MB")
    print(f"TT update size: {fed_results['tt_size_mb']:.2f} MB")
    print(f"Bandwidth saving: {fed_results['bandwidth_saving_pct']:.1f}%")
    print(f"Compression ratio: {fed_results['compression_ratio']:.2f}x")

    print("\n" + "="*60)
    print("Demo Complete!")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
