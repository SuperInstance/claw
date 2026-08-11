"""
Neural Fractional Differential Equations (NFDE) Simulation Framework
=====================================================================

Comprehensive implementation of NFDEs for distributed systems applications.

Author: Research Team
Date: 2026-03-14
Status: Production-Ready Alpha
"""

import torch
import torch.nn as nn
import numpy as np
import math
from typing import Optional, Tuple, List, Callable
from dataclasses import dataclass


@dataclass
class NFDEConfig:
    """Configuration for Neural FDE system"""
    state_dim: int = 128
    alpha: float = 0.7  # Fractional order (0, 1]
    hurst: float = 0.85  # Hurst parameter (0, 1)
    memory_length: int = 1000
    dt: float = 0.01
    device: str = 'cuda' if torch.cuda.is_available() else 'cpu'


class FractionalCalculus:
    """Core fractional calculus operations"""

    @staticmethod
    def gamma(x: torch.Tensor) -> torch.Tensor:
        """Gamma function"""
        return torch.special.gamma(x)

    @staticmethod
    def mittag_leffler(alpha: float, z: torch.Tensor, beta: float = 1.0) -> torch.Tensor:
        """
        Two-parameter Mittag-Leffler function E_{alpha,beta}(z)

        Using series expansion for small |z| and asymptotic for large |z|
        """
        # Series expansion: E_{α,β}(z) = Σ z^k / Γ(αk + β)
        result = torch.zeros_like(z)
        term = torch.ones_like(z) / FractionalCalculus.gamma(torch.tensor(beta))

        for k in range(100):  # 100 terms sufficient for convergence
            result += term
            term = term * z / FractionalCalculus.gamma(torch.tensor(alpha * (k + 1) + beta))

            # Early stopping for convergence
            if torch.max(torch.abs(term)) < 1e-10:
                break

        return result

    @staticmethod
    def compute_glrud_coefficients(alpha: float, length: int) -> np.ndarray:
        """
        Compute Grunwald-Letnikov coefficients

        w_k^α = (-1)^k * binomial(α, k)
               = (-1)^k * Γ(α+1) / (Γ(k+1) * Γ(α-k+1))
        """
        coeffs = np.zeros(length)
        for k in range(length):
            sign = (-1) ** k
            gamma_num = math.gamma(alpha + 1)
            gamma_den = math.gamma(k + 1) * math.gamma(alpha - k + 1)
            coeffs[k] = sign * gamma_num / gamma_den
        return coeffs

    @staticmethod
    def compute_fractional_kernel(alpha: float, length: int, device: str = 'cpu') -> torch.Tensor:
        """
        Compute Caputo fractional derivative kernel

        K(t) = t^(-α) / Γ(1-α)
        """
        t = torch.arange(1, length + 1, dtype=torch.float32, device=device)
        kernel = t.pow(-alpha) / torch.tensor(math.gamma(1 - alpha))
        return kernel


class FractionalBrownianMotion:
    """Fractional Brownian Motion generator"""

    def __init__(self, hurst: float, size: int, device: str = 'cpu'):
        self.H = hurst
        self.size = size
        self.device = device

        # Precompute covariance matrix
        self.cov_matrix = self._compute_covariance()

    def _compute_covariance(self) -> torch.Tensor:
        """
        Compute fBm covariance matrix

        C(s,t) = 0.5 * (s^(2H) + t^(2H) - |t-s|^(2H))
        """
        indices = torch.arange(self.size, dtype=torch.float32)
        s, t = torch.meshgrid(indices, indices, indexing='ij')

        covariance = 0.5 * (s ** (2 * self.H) + t ** (2 * self.H) - torch.abs(t - s) ** (2 * self.H))
        return covariance.to(self.device)

    def sample(self, num_samples: int = 1) -> torch.Tensor:
        """
        Generate fBm samples using Cholesky decomposition

        Returns: [num_samples, size] tensor
        """
        # Cholesky decomposition of covariance
        L = torch.linalg.cholesky(self.cov_matrix)

        # Generate standard normal samples
        z = torch.randn(num_samples, self.size, device=self.device)

        # Transform to fBm
        fbm = z @ L.T

        return fbm

    def sample_increment(self, dt: float, num_samples: int = 1) -> torch.Tensor:
        """
        Generate fBm increment for timestep dt

        Using: dW^H = W^H(t+dt) - W^H(t) ~ N(0, dt^(2H))
        """
        std = dt ** self.H
        return torch.randn(num_samples, device=self.device) * std


class NeuralFractionalDE(nn.Module):
    """
    Neural Fractional Differential Equation

    D^α x = f(x) + g(x) * dW^H

    where:
    - D^α is Caputo fractional derivative
    - f(x) is neural drift network
    - g(x) is neural diffusion network
    - dW^H is fractional Brownian motion
    """

    def __init__(self, config: NFDEConfig):
        super().__init__()
        self.config = config
        self.state_dim = config.state_dim
        self.alpha = config.alpha
        self.H = 0.5 + self.alpha / 2  # Hurst from fractional order

        # Neural networks for drift and diffusion
        self.drift_net = nn.Sequential(
            nn.Linear(self.state_dim, 256),
            nn.Tanh(),
            nn.Linear(256, 256),
            nn.Tanh(),
            nn.Linear(256, self.state_dim)
        )

        self.diffusion_net = nn.Sequential(
            nn.Linear(self.state_dim, 256),
            nn.Tanh(),
            nn.Linear(256, 256),
            nn.Tanh(),
            nn.Linear(256, self.state_dim),
            nn.Softplus()  # Ensure positive
        )

        # Fractional derivative kernel (cached)
        self.register_buffer(
            "fractional_kernel",
            FractionalCalculus.compute_fractional_kernel(
                self.alpha,
                config.memory_length,
                config.device
            )
        )

        # Fractional Brownian motion generator
        self.fbm_generator = FractionalBrownianMotion(
            self.H,
            size=config.memory_length,
            device=config.device
        )

        # History buffer
        self.history_buffer = None

    def fractional_derivative(self, x_history: torch.Tensor) -> torch.Tensor:
        """
        Compute fractional derivative using convolution

        D^α x(t) = (1/Γ(1-α)) ∫_0^t (t-s)^(-α) x'(s) ds

        Approximated via convolution with power-law kernel
        """
        batch_size, seq_len, state_dim = x_history.shape

        # Compute first difference (derivative approximation)
        dx = torch.diff(x_history, dim=1)  # [batch, seq_len-1, state_dim]

        # Pad to handle boundary
        dx_padded = torch.nn.functional.pad(
            dx,
            (0, 0, 0, self.fractional_kernel.shape[0] - dx.shape[1])
        )

        # Fractional convolution across time dimension
        # Reshape for conv1d: [batch * state_dim, 1, seq_len]
        dx_flat = dx_padded.permute(0, 2, 1).reshape(-1, 1, -1)

        # Expand kernel
        kernel_expanded = self.fractional_kernel.view(1, 1, -1)

        # Convolve
        frac_deriv_flat = torch.nn.functional.conv1d(
            dx_flat,
            kernel_expanded.flip(-1),
            padding=0
        )

        # Reshape back
        frac_deriv = frac_deriv_flat.reshape(batch_size, state_dim, -1).permute(0, 2, 1)

        return frac_deriv

    def forward(
        self,
        x_current: torch.Tensor,
        x_history: torch.Tensor,
        dt: Optional[float] = None
    ) -> Tuple[torch.Tensor, dict]:
        """
        Integrate fractional SDE forward one timestep

        Args:
            x_current: [batch, state_dim] current state
            x_history: [batch, history_len, state_dim] history
            dt: timestep (uses config.dt if None)

        Returns:
            x_new: [batch, state_dim] new state
            info: dict with debug information
        """
        if dt is None:
            dt = self.config.dt

        # 1. Compute fractional derivative of history
        frac_deriv = self.fractional_derivative(x_history)

        # Use most recent fractional derivative
        frac_deriv_t = frac_deriv[:, -1, :]  # [batch, state_dim]

        # 2. Drift term (deterministic)
        drift = self.drift_net(x_current)

        # 3. Diffusion term (stochastic with memory)
        diffusion = self.diffusion_net(x_current)

        # 4. Fractional Brownian motion increment
        fbm_increment = self.fbm_generator.sample_increment(dt, x_current.shape[0])
        fbm_increment = fbm_increment.view(-1, 1).expand(-1, self.state_dim)

        # 5. Full FDE integration
        # dx = drift*dt + diffusion*dW^H + frac_deriv*α*dt
        dx = (
            drift * dt +
            diffusion * fbm_increment +
            frac_deriv_t * self.alpha * dt
        )

        x_new = x_current + dx

        # Debug info
        info = {
            'drift_norm': torch.norm(drift).item(),
            'diffusion_norm': torch.norm(diffusion).item(),
            'frac_deriv_norm': torch.norm(frac_deriv_t).item(),
            'fbm_std': torch.std(fbm_increment).item(),
            'dx_norm': torch.norm(dx).item()
        }

        return x_new, info

    def trajectory(
        self,
        x0: torch.Tensor,
        num_steps: int,
        dt: Optional[float] = None
    ) -> Tuple[torch.Tensor, List[dict]]:
        """
        Generate full trajectory

        Args:
            x0: [batch, state_dim] initial state
            num_steps: number of timesteps
            dt: timestep

        Returns:
            trajectory: [batch, num_steps, state_dim]
            info_list: list of debug info per step
        """
        if dt is None:
            dt = self.config.dt

        batch_size = x0.shape[0]
        trajectory = torch.zeros(batch_size, num_steps, self.state_dim, device=x0.device)
        info_list = []

        # Initialize history with x0
        history = x0.unsqueeze(1).repeat(1, self.config.memory_length, 1)

        x = x0.clone()
        for step in range(num_steps):
            x, info = self.forward(x, history, dt)
            trajectory[:, step, :] = x
            info_list.append(info)

            # Update history (roll buffer)
            history = torch.roll(history, -1, dims=1)
            history[:, -1, :] = x

        return trajectory, info_list


class FractionalDeadbandAdapter(nn.Module):
    """
    Fractional deadband adaptation with long-term memory

    D^α δ(t) = -λ(δ(t) - δ_target) + η·ξ(t)
    """

    def __init__(
        self,
        initial_deadband: float = 0.1,
        alpha: float = 0.7,
        lambda_decay: float = 0.1,
        noise_scale: float = 0.01,
        memory_length: int = 100
    ):
        super().__init__()
        self.alpha = alpha
        self.lambda_decay = lambda_decay
        self.noise_scale = noise_scale
        self.memory_length = memory_length

        # Deadband state
        self.deadband = nn.Parameter(torch.tensor(initial_deadband))

        # History buffer
        self.register_buffer("history", torch.zeros(memory_length))

        # Fractional kernel
        self.register_buffer(
            "frac_kernel",
            FractionalCalculus.compute_fractional_kernel(alpha, memory_length)
        )

        # Target deadband (learnable)
        self.target_deadband = nn.Parameter(torch.tensor(initial_deadband))

    def forward(self, metric: float, dt: float = 0.01) -> Tuple[float, dict]:
        """
        Update deadband based on system metric

        Args:
            metric: Current system performance metric
            dt: Timestep

        Returns:
            new_deadband: Updated deadband value
            info: Debug information
        """
        # Compute fractional derivative of history
        frac_deriv = torch.sum(
            self.history * self.frac_kernel.flip(0)
        ) / torch.tensor(math.gamma(1 - self.alpha))

        # Error from target
        error = self.deadband - self.target_deadband

        # Fractional update
        # dδ = -λ*error*dt + η*noise + frac_deriv*α*dt
        noise = torch.randn(1).item() * self.noise_scale
        delta_deadband = (
            -self.lambda_decay * error * dt +
            noise * math.sqrt(dt) +
            frac_deriv.item() * self.alpha * dt
        )

        # Update deadband (ensure positive)
        new_deadband = max(0.001, self.deadband.item() + delta_deadband)
        self.deadband.data = torch.tensor(new_deadband)

        # Update history
        self.history = torch.roll(self.history, -1)
        self.history[-1] = self.deadband

        info = {
            'deadband': new_deadband,
            'error': error.item(),
            'frac_deriv': frac_deriv.item(),
            'delta': delta_deadband
        }

        return new_deadband, info


class FractionalKalmanFilter:
    """
    Fractional Kalman Filter for state estimation with memory

    Prediction:
        D^α x̂ = A x̂
        D^α P = A P A^T + Q

    Update:
        K = P H^T (H P H^T + R)^(-1)
        x̂ = x̂ + K (z - H x̂)
        P = (I - K H) P
    """

    def __init__(
        self,
        state_dim: int,
        measurement_dim: int,
        alpha: float = 0.7,
        process_noise: float = 0.01,
        measurement_noise: float = 0.1
    ):
        self.state_dim = state_dim
        self.measurement_dim = measurement_dim
        self.alpha = alpha

        # State matrices
        self.A = torch.eye(state_dim)
        self.H = torch.randn(measurement_dim, state_dim)
        self.Q = torch.eye(state_dim) * process_noise
        self.R = torch.eye(measurement_dim) * measurement_noise

        # State and covariance
        self.x = torch.zeros(state_dim)
        self.P = torch.eye(state_dim)

        # History
        self.x_history = torch.zeros(state_dim, 100)  # Store last 100 states

        # Fractional kernel
        self.frac_kernel = FractionalCalculus.compute_fractional_kernel(alpha, 100)

    def predict(self, dt: float = 0.01) -> torch.Tensor:
        """
        Prediction step with fractional dynamics

        Uses short-memory principle: only recent history contributes significantly
        """
        # Compute fractional derivative of state history
        frac_deriv = torch.sum(
            self.x_history * self.frac_kernel.flip(0).unsqueeze(1),
            dim=1
        ) / math.gamma(1 - self.alpha)

        # Fractional prediction
        # x̂ = x + dt^α * (A x + frac_deriv)
        dx = self.A @ self.x + frac_deriv * dt ** self.alpha
        self.x = self.x + dx * dt

        # Covariance prediction (simplified)
        self.P = self.P + dt * (self.A @ self.P @ self.A.T + self.Q) * self.alpha

        # Update history
        self.x_history = torch.roll(self.x_history, -1, dims=1)
        self.x_history[:, -1] = self.x

        return self.x.clone()

    def update(self, measurement: torch.Tensor) -> torch.Tensor:
        """
        Update step with new measurement
        """
        # Kalman gain
        S = self.H @ self.P @ self.H.T + self.R
        K = self.P @ self.H.T @ torch.inverse(S)

        # Update state
        y = measurement - self.H @ self.x  # Innovation
        self.x = self.x + K @ y

        # Update covariance
        I = torch.eye(self.state_dim)
        self.P = (I - K @ self.H) @ self.P

        return self.x.clone()

    def step(self, measurement: torch.Tensor, dt: float = 0.01) -> torch.Tensor:
        """
        Full prediction-update cycle
        """
        self.predict(dt)
        return self.update(measurement)


def demo_nfde():
    """Demonstration of Neural FDE capabilities"""

    print("=" * 80)
    print("Neural Fractional Differential Equations - Demonstration")
    print("=" * 80)

    # Configuration
    config = NFDEConfig(
        state_dim=4,
        alpha=0.7,
        hurst=0.85,
        memory_length=100,
        dt=0.01,
        device='cpu'
    )

    print(f"\nConfiguration:")
    print(f"  State Dimension: {config.state_dim}")
    print(f"  Fractional Order (α): {config.alpha}")
    print(f"  Hurst Parameter (H): {config.hurst}")
    print(f"  Memory Length: {config.memory_length}")
    print(f"  Timestep (dt): {config.dt}")

    # Initialize NFDE
    nfde = NeuralFractionalDE(config)

    # Initial state
    x0 = torch.randn(2, config.state_dim)  # Batch of 2

    print(f"\nInitial State:")
    print(f"  Mean: {x0.mean().item():.4f}")
    print(f"  Std: {x0.std().item():.4f}")

    # Generate trajectory
    num_steps = 100
    print(f"\nGenerating {num_steps} steps...")

    trajectory, info_list = nfde.trajectory(x0, num_steps)

    print(f"\nTrajectory Statistics:")
    print(f"  Shape: {trajectory.shape}")
    print(f"  Mean: {trajectory.mean().item():.4f}")
    print(f"  Std: {trajectory.std().item():.4f}")
    print(f"  Min: {trajectory.min().item():.4f}")
    print(f"  Max: {trajectory.max().item():.4f}")

    # Analyze drift term
    drift_norms = [info['drift_norm'] for info in info_list]
    print(f"\nDrift Term:")
    print(f"  Mean Norm: {np.mean(drift_norms):.4f}")
    print(f"  Std Norm: {np.std(drift_norms):.4f}")

    # Analyze fractional derivative
    frac_deriv_norms = [info['frac_deriv_norm'] for info in info_list]
    print(f"\nFractional Derivative:")
    print(f"  Mean Norm: {np.mean(frac_deriv_norms):.4f}")
    print(f"  Std Norm: {np.std(frac_deriv_norms):.4f}")

    # Test deadband adaptation
    print(f"\n" + "=" * 80)
    print("Testing Fractional Deadband Adaptation")
    print("=" * 80)

    deadband_adapter = FractionalDeadbandAdapter(
        initial_deadband=0.1,
        alpha=0.7,
        lambda_decay=0.1
    )

    print(f"\nInitial Deadband: {deadband_adapter.deadband.item():.4f}")

    # Simulate adaptation
    metrics = [0.5, 0.6, 0.7, 0.8, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65]
    deadbands = []

    for i, metric in enumerate(metrics):
        new_deadband, info = deadband_adapter(metric)
        deadbands.append(new_deadband)
        print(f"Step {i+1}: Metric={metric:.2f}, Deadband={new_deadband:.4f}")

    print(f"\nDeadband Statistics:")
    print(f"  Initial: {deadbands[0]:.4f}")
    print(f"  Final: {deadbands[-1]:.4f}")
    print(f"  Change: {deadbands[-1] - deadbands[0]:.4f}")

    print(f"\n" + "=" * 80)
    print("Demonstration Complete")
    print("=" * 80)


if __name__ == "__main__":
    demo_nfde()
