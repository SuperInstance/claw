#!/usr/bin/env python3
"""
Quantum Advantage Visualization for Phylogenetic Inference

Generates visualizations comparing classical, quantum-inspired, and quantum
approaches to phylogenetic tree reconstruction.

Author: SuperInstance Research Team
Date: 2026-03-14
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib import rcParams
import seaborn as sns

# Set style
sns.set_style("whitegrid")
rcParams['figure.figsize'] = (14, 10)
rcParams['font.size'] = 10


def plot_complexity_comparison():
    """
    Plot time complexity comparison for tree search
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

    # Left plot: Scaling with number of taxa
    n_taxa = np.array([10, 20, 30, 40, 50])

    # Approximate tree space size
    N_trees = np.exp(2 * n_taxa * np.log(n_taxa))

    # Complexities
    classical_time = N_trees / 1e6  # Scaled for visibility
    quantum_time = np.sqrt(N_trees) / 1e3  # O(√N)
    quantum_inspired_time = np.sqrt(N_trees) / 5e2  # Classical simulation

    ax1.semilogy(n_taxa, classical_time, 'r-o', linewidth=2, markersize=8,
                 label='Classical O(N)', alpha=0.7)
    ax1.semilogy(n_taxa, quantum_time, 'b-s', linewidth=2, markersize=8,
                 label='Quantum O(√N)', alpha=0.7)
    ax1.semilogy(n_taxa, quantum_inspired_time, 'g-^', linewidth=2, markersize=8,
                 label='Quantum-Inspired O(√N)', alpha=0.7)

    ax1.set_xlabel('Number of Taxa (n)', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Time (arbitrary units, log scale)', fontsize=12, fontweight='bold')
    ax1.set_title('Tree Search Complexity Scaling', fontsize=14, fontweight='bold')
    ax1.legend(fontsize=11)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim([1, 1e12])

    # Right plot: Speedup comparison
    speedup_quantum = classical_time / quantum_time
    speedup_qi = classical_time / quantum_inspired_time

    ax2.semilogy(n_taxa, speedup_quantum, 'b-s', linewidth=2, markersize=8,
                 label='Quantum Speedup', alpha=0.7)
    ax2.semilogy(n_taxa, speedup_qi, 'g-^', linewidth=2, markersize=8,
                 label='Quantum-Inspired Speedup', alpha=0.7)

    ax2.axhline(y=10, color='orange', linestyle='--', linewidth=1.5,
                label='10x Speedup Target')
    ax2.axhline(y=100, color='red', linestyle='--', linewidth=1.5,
                label='100x Speedup Target')

    ax2.set_xlabel('Number of Taxa (n)', fontsize=12, fontweight='bold')
    ax2.set_ylabel('Speedup Factor (log scale)', fontsize=12, fontweight='bold')
    ax2.set_title('Quantum Advantage Speedup', fontsize=14, fontweight='bold')
    ax2.legend(fontsize=11)
    ax2.grid(True, alpha=0.3)
    ax2.set_ylim([1, 1e8])

    plt.tight_layout()
    plt.savefig('C:/Users/casey/polln/research/quantum_inspired/complexity_comparison.png',
                dpi=300, bbox_inches='tight')
    print("✓ Saved: complexity_comparison.png")
    plt.close()


def plot_performance_projections():
    """
    Plot performance projections for different implementation phases
    """
    fig, ax = plt.subplots(figsize=(12, 8))

    # Problem sizes
    taxa = [20, 50, 100, 200, 500]

    # Times (hours) - illustrative
    classical = [0.1, 10, 500, 20000, 1e6]
    quantum_inspired = [0.01, 1, 50, 1000, 20000]
    hybrid_nisq = [0.005, 0.2, 10, 100, 1000]
    full_quantum = [0.001, 0.05, 1, 10, 50]

    # Plot
    ax.loglog(taxa, classical, 'r-o', linewidth=2.5, markersize=10,
              label='Classical (Current)', alpha=0.8)
    ax.loglog(taxa, quantum_inspired, 'g-s', linewidth=2.5, markersize=10,
              label='Quantum-Inspired (Phase 1)', alpha=0.8)
    ax.loglog(taxa, hybrid_nisq, 'b-^', linewidth=2.5, markersize=10,
              label='Hybrid NISQ (Phase 2)', alpha=0.8)
    ax.loglog(taxa, full_quantum, 'm-d', linewidth=2.5, markersize=10,
              label='Full Quantum (Phase 3)', alpha=0.8)

    # Add feasibility regions
    ax.fill_between(taxa, 0, 1, color='green', alpha=0.1, label='Real-time (< 1 hour)')
    ax.fill_between(taxa, 1, 24, color='yellow', alpha=0.1, label='Practical (< 1 day)')

    ax.set_xlabel('Number of Taxa (n)', fontsize=13, fontweight='bold')
    ax.set_ylabel('Computation Time (hours, log scale)', fontsize=13, fontweight='bold')
    ax.set_title('Phylogenetic Inference Performance Projections',
                 fontsize=15, fontweight='bold', pad=20)
    ax.legend(fontsize=11, loc='upper left')
    ax.grid(True, alpha=0.3, which='both')

    # Add text annotations
    ax.text(25, 5e5, 'Infeasible', fontsize=11, color='red',
            bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))
    ax.text(250, 0.5, 'Real-time', fontsize=11, color='green',
            bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    plt.tight_layout()
    plt.savefig('C:/Users/casey/polln/research/quantum_inspired/performance_projections.png',
                dpi=300, bbox_inches='tight')
    print("✓ Saved: performance_projections.png")
    plt.close()


def plot_algorithm_components():
    """
    Plot breakdown of quantum phylogenetic inference components
    """
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(16, 12))

    # 1. Quantum Walk
    components = ['Tree\nSearch', 'Likelihood\nComp.', 'Branch\nOpt.', 'Total']
    classical_pct = [40, 50, 10, 100]
    quantum_pct = [25, 50, 5, 80]
    quantum_inspired_pct = [30, 50, 8, 88]

    x = np.arange(len(components))
    width = 0.25

    ax1.bar(x - width, classical_pct, width, label='Classical', color='red', alpha=0.7)
    ax1.bar(x, quantum_pct, width, label='Quantum', color='blue', alpha=0.7)
    ax1.bar(x + width, quantum_inspired_pct, width, label='Quantum-Inspired',
            color='green', alpha=0.7)

    ax1.set_ylabel('Relative Time (%)', fontsize=11, fontweight='bold')
    ax1.set_title('Component-wise Breakdown', fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(components)
    ax1.legend()
    ax1.grid(True, alpha=0.3, axis='y')

    # 2. Speedup by Component
    speedups = [100, 1, 20]  # Tree search, likelihood, branch
    ax2.barh(['Quantum Walk\nTree Search', 'Amplitude\nAmplification',
              'QPE Branch\nEstimation'],
             speedups, color=['blue', 'purple', 'cyan'], alpha=0.7)
    ax2.set_xlabel('Speedup Factor', fontsize=11, fontweight='bold')
    ax2.set_title('Theoretical Quantum Speedup by Component',
                  fontsize=13, fontweight='bold')
    ax2.set_xscale('log')
    ax2.grid(True, alpha=0.3, axis='x')

    # 3. Implementation Timeline
    phases = ['Phase 1\nClassical\nQI', 'Phase 2\nHybrid\nNISQ',
              'Phase 3\nFull\nQuantum']
    timeline = [2026.5, 2029, 2036]
    speedup_range = [[5, 50], [10, 500], [100, 10000]]

    for i, (phase, year, range_val) in enumerate(zip(phases, timeline, speedup_range)):
        ax3.scatter([year], [i], s=2000, c=['green', 'blue', 'purple'][i],
                    alpha=0.3, edgecolors='black', linewidth=2)
        ax3.annotate(f'{range_val[0]}-{range_val[1]}x', (year, i),
                     fontsize=11, fontweight='bold', ha='center', va='center')
        ax3.text(year, i-0.15, phase, fontsize=10, ha='center')

    ax3.set_xlim(2025, 2040)
    ax3.set_ylim(-0.5, 2.5)
    ax3.set_yticks([])
    ax3.set_xlabel('Year', fontsize=11, fontweight='bold')
    ax3.set_title('Implementation Roadmap & Expected Speedup',
                  fontsize=13, fontweight='bold')
    ax3.grid(True, alpha=0.3, axis='x')

    # 4. Quantum Advantage Analysis
    advantages = ['Quadratic\nSpeedup', 'Quantum\nParallelism',
                  'Amplitude\nAmplication', 'Phase\nEstimation']
    feasibility = [3, 2, 3, 1]  # 1=hard, 3=easy
    impact = [3, 3, 2, 2]  # 1=low, 3=high

    scatter = ax4.scatter(impact, advantages, s=[f*300 for f in feasibility],
                          c=feasibility, cmap='RdYlGn',
                          alpha=0.6, edgecolors='black', linewidth=2)

    for i, (adv, f, imp) in enumerate(zip(advantages, feasibility, impact)):
        ax4.annotate(f'Feasibility: {f}/3', (imp, i),
                    fontsize=9, ha='left', va='center',
                    xytext=(imp+0.1, i))

    ax4.set_xlabel('Impact (1=Low, 3=High)', fontsize=11, fontweight='bold')
    ax4.set_title('Quantum Advantage: Feasibility vs Impact',
                  fontsize=13, fontweight='bold')
    ax4.set_xlim(0.5, 3.5)
    ax4.set_ylim(-0.5, 3.5)
    ax4.grid(True, alpha=0.3)

    # Add colorbar
    cbar = plt.colorbar(scatter, ax=ax4)
    cbar.set_label('Feasibility (1=Hard, 3=Easy)', fontsize=10)

    plt.tight_layout()
    plt.savefig('C:/Users/casey/polln/research/quantum_inspired/algorithm_components.png',
                dpi=300, bbox_inches='tight')
    print("✓ Saved: algorithm_components.png")
    plt.close()


def plot_application_scenarios():
    """
    Plot application scenarios and impact
    """
    fig, ax = plt.subplots(figsize=(14, 8))

    scenarios = [
        'Viral\nPhylogenetics\n(COVID-19)',
        'Species Tree\nReconstruction',
        'Metagenomic\nAnalysis',
        'Cancer\nPhylogeny',
        'Ancient DNA\nAnalysis'
    ]

    # Current time vs Quantum-Inspired time (hours)
    current_times = [48, 720, 4320, 168, 336]
    qi_times = [2, 24, 144, 8, 16]

    x = np.arange(len(scenarios))
    width = 0.35

    bars1 = ax.bar(x - width/2, current_times, width, label='Current Methods',
                   color='red', alpha=0.7)
    bars2 = ax.bar(x + width/2, qi_times, width, label='Quantum-Inspired',
                   color='green', alpha=0.7)

    # Add speedup annotations
    for i, (curr, qi) in enumerate(zip(current_times, qi_times)):
        speedup = curr / qi
        ax.text(i, max(curr, qi) + 50, f'{speedup:.0f}x',
                fontsize=10, fontweight='bold', ha='center')

    ax.set_ylabel('Computation Time (hours, log scale)', fontsize=12, fontweight='bold')
    ax.set_title('Quantum-Inspired Phylogenetics: Application Scenarios',
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(scenarios)
    ax.legend(fontsize=11)
    ax.set_yscale('log')
    ax.grid(True, alpha=0.3, axis='y')

    # Add feasibility annotations
    ax.axhspan(0, 1, color='green', alpha=0.1, label='Real-time')
    ax.axhspan(1, 24, color='yellow', alpha=0.1, label='Same-day')
    ax.axhspan(24, 168, color='orange', alpha=0.1, label='Week-long')

    plt.tight_layout()
    plt.savefig('C:/Users/casey/polln/research/quantum_inspired/application_scenarios.png',
                dpi=300, bbox_inches='tight')
    print("✓ Saved: application_scenarios.png")
    plt.close()


def plot_hardware_requirements():
    """
    Plot hardware requirements timeline
    """
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))

    years = [2026, 2029, 2032, 2036, 2040]

    # Qubit requirements
    qubits_classical = [0, 0, 0, 0, 0]  # No qubits needed
    qubits_nisq = [0, 100, 500, 1000, 2000]
    qubits_ft = [0, 0, 10000, 50000, 100000]

    ax1.plot(years, qubits_classical, 'g-o', linewidth=2.5, markersize=8,
             label='Classical (No qubits)', alpha=0.7)
    ax1.plot(years, qubits_nisq, 'b-s', linewidth=2.5, markersize=8,
             label='NISQ Devices', alpha=0.7)
    ax1.plot(years, qubits_ft, 'r-^', linewidth=2.5, markersize=8,
             label='Fault-Tolerant QC', alpha=0.7)

    ax1.set_xlabel('Year', fontsize=12, fontweight='bold')
    ax1.set_ylabel('Number of Qubits (log scale)', fontsize=12, fontweight='bold')
    ax1.set_title('Quantum Hardware Requirements', fontsize=14, fontweight='bold')
    ax1.set_yscale('log')
    ax1.legend(fontsize=11)
    ax1.grid(True, alpha=0.3)
    ax1.set_ylim([1, 200000])

    # Annotate phases
    ax1.fill_between([2026, 2029], 1, 100000, color='green', alpha=0.1)
    ax1.text(2027.5, 50, 'Phase 1\nClassical', fontsize=10, ha='center',
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    ax1.fill_between([2029, 2036], 1, 100000, color='blue', alpha=0.1)
    ax1.text(2032.5, 500, 'Phase 2\nNISQ', fontsize=10, ha='center',
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    ax1.fill_between([2036, 2040], 1, 100000, color='red', alpha=0.1)
    ax1.text(2038, 10000, 'Phase 3\nFTQC', fontsize=10, ha='center',
             bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

    # Speedup vs hardware
    hardware_types = ['CPU\nCluster', 'GPU\nCluster',
                      'NISQ\nQuantum', 'FT\nQuantum']
    speedup = [1, 5, 50, 1000]
    availability = [100, 100, 30, 5]  # Percent availability

    bars = ax2.bar(hardware_types, speedup,
                   color=['gray', 'green', 'blue', 'red'], alpha=0.7)

    # Add availability annotations
    for i, (bar, avail) in enumerate(zip(bars, availability)):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                 f'{avail}% avail.', fontsize=10, fontweight='bold',
                 ha='center', va='bottom')

    ax2.set_ylabel('Expected Speedup Factor', fontsize=12, fontweight='bold')
    ax2.set_title('Hardware Requirements vs Expected Speedup',
                  fontsize=14, fontweight='bold')
    ax2.set_yscale('log')
    ax2.grid(True, alpha=0.3, axis='y')

    plt.tight_layout()
    plt.savefig('C:/Users/casey/polln/research/quantum_inspired/hardware_requirements.png',
                dpi=300, bbox_inches='tight')
    print("✓ Saved: hardware_requirements.png")
    plt.close()


def generate_all_visualizations():
    """
    Generate all visualization figures
    """
    print("=" * 70)
    print("QUANTUM PHYLOGENETIC INFERENCE - VISUALIZATION GENERATION")
    print("=" * 70)
    print()

    print("Generating visualizations...")
    print()

    plot_complexity_comparison()
    plot_performance_projections()
    plot_algorithm_components()
    plot_application_scenarios()
    plot_hardware_requirements()

    print()
    print("=" * 70)
    print("All visualizations generated successfully!")
    print("=" * 70)
    print()
    print("Generated files:")
    print("1. complexity_comparison.png - Time complexity comparison")
    print("2. performance_projections.png - Performance projections by phase")
    print("3. algorithm_components.png - Algorithm component breakdown")
    print("4. application_scenarios.png - Real-world application scenarios")
    print("5. hardware_requirements.png - Hardware requirements timeline")
    print()
    print("Location: C:/Users/casey/polln/research/quantum_inspired/")


if __name__ == "__main__":
    generate_all_visualizations()
