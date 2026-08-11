"""
Test script for Neural Fractional Differential Equations
"""

import torch
import numpy as np
import math
from NFDE_simulation_framework import (
    NFDEConfig,
    NeuralFractionalDE,
    FractionalCalculus,
    FractionalBrownianMotion,
    FractionalDeadbandAdapter
)


def test_fractional_calculus():
    """Test basic fractional calculus operations"""
    print("\n" + "=" * 80)
    print("TEST 1: Fractional Calculus Operations")
    print("=" * 80)

    # Test Gamma function
    x = torch.tensor([5.0])
    gamma_val = FractionalCalculus.gamma(x)
    expected = 24.0  # 4! = 24
    print(f"\nGamma function:")
    print(f"  Gamma(5) = {gamma_val.item():.2f}")
    print(f"  Expected (4!) = {expected:.2f}")
    print(f"  Match: {abs(gamma_val.item() - expected) < 0.01}")

    # Test Mittag-Leffler function
    z = torch.tensor([0.5])
    ml_val = FractionalCalculus.mittag_leffler(0.7, z)
    print(f"\nMittag-Leffler function:")
    print(f"  E_0.7(0.5) = {ml_val.item():.4f}")

    # Test fractional kernel
    kernel = FractionalCalculus.compute_fractional_kernel(0.7, 10)
    print(f"\nFractional derivative kernel (alpha=0.7, length=10):")
    print(f"  First 5 values: {kernel[:5].numpy()}")
    print(f"  Kernel sum: {kernel.sum().item():.4f}")


def test_fbm_generator():
    """Test fractional Brownian motion generator"""
    print("\n" + "=" * 80)
    print("TEST 2: Fractional Brownian Motion Generator")
    print("=" * 80)

    # Test different Hurst parameters
    hurst_values = [0.3, 0.5, 0.7]

    for H in hurst_values:
        fbm = FractionalBrownianMotion(hurst=H, size=1000)
        samples = fbm.sample(num_samples=5)

        print(f"\nHurst parameter H = {H}:")
        print(f"  Sample shape: {samples.shape}")
        print(f"  Mean: {samples.mean().item():.4f}")
        print(f"  Std: {samples.std().item():.4f}")

        # Test increment
        increment = fbm.sample_increment(dt=0.01, num_samples=100)
        print(f"  Increment std (dt=0.01): {increment.std().item():.6f}")
        print(f"  Expected (dt^H): {0.01**H:.6f}")


def test_neural_fde():
    """Test Neural Fractional Differential Equation"""
    print("\n" + "=" * 80)
    print("TEST 3: Neural Fractional Differential Equation")
    print("=" * 80)

    config = NFDEConfig(
        state_dim=8,
        alpha=0.7,
        hurst=0.85,
        memory_length=50,
        dt=0.01
    )

    print(f"\nConfiguration:")
    print(f"  State dim: {config.state_dim}")
    print(f"  Alpha (fractional order): {config.alpha}")
    print(f"  Hurst: {config.hurst}")
    print(f"  Memory: {config.memory_length}")

    # Create NFDE
    nfde = NeuralFractionalDE(config)

    # Initial state
    batch_size = 4
    x0 = torch.randn(batch_size, config.state_dim)
    history = torch.randn(batch_size, config.memory_length, config.state_dim)

    print(f"\nInitial state:")
    print(f"  Batch size: {batch_size}")
    print(f"  State mean: {x0.mean().item():.4f}")
    print(f"  State std: {x0.std().item():.4f}")

    # Single forward step
    x_new, info = nfde.forward(x0, history, dt=0.01)

    print(f"\nForward step:")
    print(f"  Drift norm: {info['drift_norm']:.4f}")
    print(f"  Diffusion norm: {info['diffusion_norm']:.4f}")
    print(f"  Fractional deriv norm: {info['frac_deriv_norm']:.4f}")
    print(f"  FBM std: {info['fbm_std']:.6f}")
    print(f"  dx norm: {info['dx_norm']:.4f}")

    # Generate trajectory
    print(f"\nGenerating trajectory...")
    trajectory, info_list = nfde.trajectory(x0, num_steps=100, dt=0.01)

    print(f"  Trajectory shape: {trajectory.shape}")
    print(f"  Final state mean: {trajectory[:, -1, :].mean().item():.4f}")
    print(f"  Final state std: {trajectory[:, -1, :].std().item():.4f}")

    # Analyze statistics
    drift_norms = [info['drift_norm'] for info in info_list]
    frac_deriv_norms = [info['frac_deriv_norm'] for info in info_list]

    print(f"\nTrajectory statistics:")
    print(f"  Drift norm - Mean: {np.mean(drift_norms):.4f}, Std: {np.std(drift_norms):.4f}")
    print(f"  Frac deriv norm - Mean: {np.mean(frac_deriv_norms):.4f}, Std: {np.std(frac_deriv_norms):.4f}")


def test_deadband_adaptation():
    """Test fractional deadband adaptation"""
    print("\n" + "=" * 80)
    print("TEST 4: Fractional Deadband Adaptation")
    print("=" * 80)

    adapter = FractionalDeadbandAdapter(
        initial_deadband=0.1,
        alpha=0.7,
        lambda_decay=0.05,
        noise_scale=0.01,
        memory_length=50
    )

    print(f"\nConfiguration:")
    print(f"  Initial deadband: {adapter.deadband.item():.4f}")
    print(f"  Alpha: {adapter.alpha}")
    print(f"  Lambda decay: {adapter.lambda_decay}")

    # Simulate system with changing performance
    print(f"\nSimulating adaptation...")
    deadbands = []
    errors = []

    for step in range(50):
        # Synthetic metric (degrades then improves)
        if step < 20:
            metric = 0.5 + 0.02 * step  # Improving
        else:
            metric = 0.9 - 0.01 * (step - 20)  # Degrading

        new_deadband, info = adapter(metric, dt=0.1)
        deadbands.append(new_deadband)
        errors.append(info['error'])

    print(f"\nResults:")
    print(f"  Initial deadband: {deadbands[0]:.4f}")
    print(f"  Final deadband: {deadbands[-1]:.4f}")
    print(f"  Min deadband: {min(deadbands):.4f}")
    print(f"  Max deadband: {max(deadbands):.4f}")
    print(f"  Deadband range: {max(deadbands) - min(deadbands):.4f}")

    # Check adaptation
    first_10 = np.mean(deadbands[:10])
    last_10 = np.mean(deadbands[-10])
    print(f"\nAdaptation:")
    print(f"  Mean (first 10): {first_10:.4f}")
    print(f"  Mean (last 10): {last_10:.4f}")
    print(f"  Change: {last_10 - first_10:.4f}")


def test_comparison_sde_vs_fde():
    """Compare standard SDE vs fractional FDE"""
    print("\n" + "=" * 80)
    print("TEST 5: SDE vs FDE Comparison")
    print("=" * 80)

    # Simulate both with same parameters
    state_dim = 4
    num_steps = 200
    dt = 0.01
    x0 = torch.randn(10, state_dim)  # Batch of 10

    # FDE (alpha=0.7)
    config_fde = NFDEConfig(
        state_dim=state_dim,
        alpha=0.7,
        hurst=0.85,
        memory_length=50,
        dt=dt
    )
    fde = NeuralFractionalDE(config_fde)
    traj_fde, _ = fde.trajectory(x0, num_steps, dt)

    # Approximate SDE (alpha=1.0, close to standard SDE)
    config_sde = NFDEConfig(
        state_dim=state_dim,
        alpha=0.99,  # Close to 1 (integer derivative)
        hurst=0.505,  # Close to 0.5 (standard BM)
        memory_length=10,  # Less memory
        dt=dt
    )
    sde = NeuralFractionalDE(config_sde)
    traj_sde, _ = sde.trajectory(x0, num_steps, dt)

    print(f"\nComparison (batch of {x0.shape[0]} trajectories, {num_steps} steps):")

    # Compute autocorrelation (measure of memory)
    def autocorrelation(x, lag=10):
        """Compute autocorrelation at given lag"""
        x_mean = x.mean(dim=1, keepdim=True)
        x_centered = x - x_mean
        acf = []
        for l in range(lag):
            if l < x.shape[1]:
                cov = (x_centered[:, :-l if l > 0 else None] * x_centered[:, l:]).mean(dim=1)
                var = (x_centered ** 2).mean(dim=1)
                acf.append((cov / var).mean().item())
        return acf

    acf_fde = autocorrelation(traj_fde[0], lag=10)
    acf_sde = autocorrelation(traj_sde[0], lag=10)

    print(f"\nAutocorrelation (first trajectory):")
    print(f"  Lag 1 - FDE: {acf_fde[0]:.4f}, SDE: {acf_sde[0]:.4f}")
    print(f"  Lag 5 - FDE: {acf_fde[4]:.4f}, SDE: {acf_sde[4]:.4f}")
    print(f"  Lag 10 - FDE: {acf_fde[-1]:.4f}, SDE: {acf_sde[-1]:.4f}")

    # Variance growth
    var_fde = traj_fde[:, :, 0].var(dim=0)  # First dimension
    var_sde = traj_sde[:, :, 0].var(dim=0)

    print(f"\nVariance growth (first dimension):")
    print(f"  Initial - FDE: {var_fde[0]:.4f}, SDE: {var_sde[0]:.4f}")
    print(f"  Final - FDE: {var_fde[-1]:.4f}, SDE: {var_sde[-1]:.4f}")
    print(f"  Growth rate - FDE: {(var_fde[-1]/var_fde[0]):.2f}x")
    print(f"  Growth rate - SDE: {(var_sde[-1]/var_sde[0]):.2f}x")


def main():
    """Run all tests"""
    print("\n" + "=" * 80)
    print("NEURAL FRACTIONAL DIFFERENTIAL EQUATIONS - TEST SUITE")
    print("=" * 80)

    try:
        test_fractional_calculus()
        test_fbm_generator()
        test_neural_fde()
        test_deadband_adaptation()
        test_comparison_sde_vs_fde()

        print("\n" + "=" * 80)
        print("ALL TESTS PASSED")
        print("=" * 80)

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
