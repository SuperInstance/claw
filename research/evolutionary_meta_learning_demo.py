#!/usr/bin/env python3
"""
Evolutionary Game-Theoretic Meta-Learning Demonstration

This script demonstrates the core concepts from the Enhanced Mathematical
Framework Section 1.6: Evolutionary strategies for optimizer discovery.

Key Components:
1. Evolutionary Meta-Learner: Evolves optimizer parameters
2. Game-Theoretic Selection: Maintains population diversity
3. Multi-Species Competition: Specialized optimizer families
4. Convergence Analysis: Tracks evolution dynamics

Author: Enhanced Framework Analysis
Date: 2026-03-14
"""

import numpy as np
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from abc import ABC, abstractmethod
import json
from pathlib import Path

# Set random seed for reproducibility
np.random.seed(42)


# =============================================================================
# DATA STRUCTURES
# =============================================================================

@dataclass
class OptimizerGenotype:
    """
    Encodes optimizer hyperparameters as a 20-dimensional genome.

    Genome Structure:
    [0:4]:   Learning rate schedule (init, final, decay_type, decay_rate)
    [5:8]:   Momentum parameters (alpha, beta, type)
    [9:12]:  Adaptive learning rate (beta1, beta2, epsilon)
    [13:16]: Regularization (l1, l2, dropout)
    [17:19]: Batch norm parameters
    """
    params: np.ndarray  # Shape: (20,)

    def __post_init__(self):
        if self.params.shape != (20,):
            raise ValueError(f"Genotype must have 20 parameters, got {self.params.shape}")

    def decode(self) -> Dict:
        """Decode genotype to optimizer parameters."""
        return {
            # Learning rate schedule
            'lr_init': self.map_range(self.params[0], 1e-5, 1e-1),
            'lr_final': self.map_range(self.params[1], 1e-6, 1e-2),
            'decay_type': 'exponential' if self.params[2] > 0.5 else 'step',
            'decay_rate': self.map_range(self.params[3], 0.1, 0.99),

            # Momentum
            'momentum': self.map_range(self.params[5], 0.1, 0.99),

            # Adam parameters
            'beta1': self.map_range(self.params[9], 0.5, 0.999),
            'beta2': self.map_range(self.params[10], 0.9, 0.9999),
            'epsilon': self.map_range(self.params[11], 1e-9, 1e-6),

            # Regularization
            'l1_strength': self.params[13],
            'l2_strength': self.params[14],
            'dropout': self.params[15],

            # Optimizer type
            'type': 'adam' if self.params[4] > 0.66 else (
                'sgd_momentum' if self.params[8] > 0.5 else 'rmsprop'
            )
        }

    @staticmethod
    def map_range(value: float, min_val: float, max_val: float) -> float:
        """Map [0,1] to [min_val, max_val]."""
        return min_val + value * (max_val - min_val)

    def mutate(self, rate: float = 0.1) -> 'OptimizerGenotype':
        """Apply Gaussian mutation."""
        noise = np.random.normal(0, rate, size=self.params.shape)
        new_params = np.clip(self.params + noise, 0, 1)
        return OptimizerGenotype(new_params)

    def crossover(self, other: 'OptimizerGenotype', point: int) -> 'OptimizerGenotype':
        """Single-point crossover."""
        child_params = np.concatenate([
            self.params[:point],
            other.params[point:]
        ])
        return OptimizerGenotype(child_params)


@dataclass
class Individual:
    """An individual in the population with genotype and fitness."""
    genotype: OptimizerGenotype
    fitness: float = 0.0
    species_id: int = 0

    def create_optimizer(self):
        """Create optimizer from genotype."""
        return self.genotype.decode()


# =============================================================================
# EVOLUTIONARY META-LEARNER
# =============================================================================

class EvolutionaryMetaLearner:
    """
    Evolutionary Meta-Learning Framework.

    Implements:
    1. Multi-species population
    2. Game-theoretic payoff matrix
    3. Selection, crossover, mutation
    4. Convergence tracking
    """

    def __init__(
        self,
        num_species: int = 3,
        population_size: int = 50,
        mutation_rate: float = 0.1,
        crossover_rate: float = 0.7,
        selection_pressure: float = 0.5
    ):
        self.num_species = num_species
        self.population_size = population_size
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate
        self.selection_pressure = selection_pressure

        # Initialize populations for each species
        self.populations: List[List[Individual]] = []
        for species_id in range(num_species):
            species_population = self._initialize_species(
                species_id, population_size
            )
            self.populations.append(species_population)

        # Game-theoretic payoff matrix
        self.payoff_matrix = self._compute_payoff_matrix()

        # Tracking
        self.history: Dict[str, List] = {
            'generation': [],
            'mean_fitness': [],
            'best_fitness': [],
            'species_counts': [],
            'diversity': [],
        }

    def _initialize_species(self, species_id: int, size: int) -> List[Individual]:
        """Initialize a species with genotypes specialized for different roles."""
        population = []

        # Base genotypes for each species
        base_genotypes = {
            0: self._adam_base(),      # Fast convergence specialists
            1: self._sgd_base(),       # High accuracy specialists
            2: self._rmsprop_base(),   # Robustness specialists
        }

        base = base_genotypes[species_id % len(base_genotypes)]

        # Create population with mutations from base
        for _ in range(size):
            mutated_genotype = base.mutate(rate=0.05)
            individual = Individual(
                genotype=mutated_genotype,
                species_id=species_id
            )
            population.append(individual)

        return population

    @staticmethod
    def _adam_base() -> OptimizerGenotype:
        """Create Adam optimizer as base genotype."""
        params = np.zeros(20)
        params[0] = 0.5   # lr_init → ~5e-2
        params[1] = 0.1   # lr_final → ~1e-3
        params[2] = 1.0   # exponential decay
        params[3] = 0.95  # decay_rate
        params[4] = 1.0   # Adam type
        params[5] = 0.0   # No momentum (Adam has its own)
        params[9] = 0.9495  # beta1 → 0.9
        params[10] = 1.0   # beta2 → 0.999
        params[11] = 0.1  # epsilon
        params[13] = 0.0  # No L1
        params[14] = 0.0  # No L2
        params[15] = 0.0  # No dropout
        return OptimizerGenotype(params)

    @staticmethod
    def _sgd_base() -> OptimizerGenotype:
        """Create SGD with momentum as base genotype."""
        params = np.zeros(20)
        params[0] = 0.3   # lr_init → ~3e-2
        params[1] = 0.05  # lr_final → ~5e-4
        params[2] = 1.0   # exponential decay
        params[3] = 0.95  # decay_rate
        params[4] = 0.0   # SGD type
        params[5] = 0.9   # high momentum
        params[8] = 1.0   # momentum type
        params[13] = 0.0  # No L1
        params[14] = 0.01 # Small L2
        params[15] = 0.0  # No dropout
        return OptimizerGenotype(params)

    @staticmethod
    def _rmsprop_base() -> OptimizerGenotype:
        """Create RMSprop as base genotype."""
        params = np.zeros(20)
        params[0] = 0.4   # lr_init → ~4e-2
        params[1] = 0.1   # lr_final → ~1e-3
        params[2] = 0.0   # step decay
        params[3] = 0.9   # decay_rate
        params[4] = 0.33  # RMSprop type
        params[8] = 0.0   # no momentum
        params[13] = 0.0  # No L1
        params[14] = 0.0  # No L2
        params[15] = 0.1  # Light dropout
        return OptimizerGenotype(params)

    def _compute_payoff_matrix(self) -> np.ndarray:
        """
        Compute game-theoretic payoff matrix.

        Payoffs represent expected fitness when species interact.
        High payoff for complementary species, low for competitors.
        """
        payoff = np.zeros((self.num_species, self.num_species))

        for i in range(self.num_species):
            for j in range(self.num_species):
                if i == j:
                    # Same species: moderate payoff (stable but no synergy)
                    payoff[i, j] = 1.0
                elif self._are_complementary(i, j):
                    # Complementary species: high payoff
                    payoff[i, j] = 1.5
                else:
                    # Similar species: low payoff (competition)
                    payoff[i, j] = 0.7

        return payoff

    @staticmethod
    def _are_complementary(species1: int, species2: int) -> bool:
        """Check if two species are complementary."""
        # Species 0 (Adam) and Species 1 (SGD) are complementary
        # Species 1 (SGD) and Species 2 (RMSprop) are complementary
        complementary_pairs = {(0, 1), (1, 0), (1, 2), (2, 1)}
        return (species1, species2) in complementary_pairs

    def evolve(
        self,
        num_generations: int,
        task_distribution: 'TaskDistribution',
        verbose: bool = True
    ) -> Dict:
        """
        Run evolutionary meta-learning for multiple generations.
        """
        if verbose:
            print("=" * 70)
            print("Evolutionary Meta-Learning")
            print("=" * 70)
            print(f"Species: {self.num_species}")
            print(f"Population size: {self.population_size}")
            print(f"Generations: {num_generations}")
            print()

        for generation in range(num_generations):
            # 1. Evaluate fitness
            fitness_results = self._evaluate_all(task_distribution)

            # 2. Update history
            self._update_history(generation, fitness_results)

            # 3. Selection (with game-theoretic adjustment)
            self._selection_with_game_theory(fitness_results)

            # 4. Crossover and mutation
            self._reproduction()

            # 5. Report progress
            if verbose and (generation % 10 == 0 or generation == num_generations - 1):
                self._report_progress(generation, fitness_results)

        # Return final statistics
        return self._compile_results()

    def _evaluate_all(self, task_distribution: 'TaskDistribution') -> List[List[float]]:
        """Evaluate fitness for all individuals across all species."""
        fitness_results = []

        for species_id, population in enumerate(self.populations):
            species_fitness = []

            for individual in population:
                # Sample tasks for evaluation
                tasks = task_distribution.sample_tasks(k=5)

                # Evaluate average performance
                total_fitness = 0.0
                for task in tasks:
                    fitness = self._evaluate_on_task(individual, task)
                    total_fitness += fitness

                avg_fitness = total_fitness / len(tasks)
                individual.fitness = avg_fitness
                species_fitness.append(avg_fitness)

            fitness_results.append(species_fitness)

        return fitness_results

    def _evaluate_on_task(self, individual: Individual, task: 'Task') -> float:
        """
        Evaluate individual optimizer on a task.

        Simulates training with the optimizer and returns fitness.
        """
        optimizer_params = individual.create_optimizer()

        # Simulate training (simplified)
        # In practice, this would actually train a model
        final_accuracy, convergence_time, generalization_gap = task.simulate_training(
            optimizer_params
        )

        # Fitness: combination of accuracy, speed, and generalization
        fitness = (
            0.5 * final_accuracy +
            0.3 * (1.0 / convergence_time) +
            0.2 * (1.0 - generalization_gap)
        )

        return fitness

    def _selection_with_game_theory(self, fitness_results: List[List[float]]):
        """Selection with game-theoretic payoff adjustment."""
        for species_id, population in enumerate(self.populations):
            species_fitness = fitness_results[species_id]

            # Adjust fitness based on game theory
            adjusted_fitness = []
            for i, fitness in enumerate(species_fitness):
                # Compute game bonus from payoff matrix
                game_bonus = 0.0
                for other_species in range(self.num_species):
                    if other_species != species_id:
                        # Bonus from interacting with other species
                        payoff = self.payoff_matrix[species_id, other_species]
                        game_bonus += 0.1 * payoff

                adjusted_fitness.append(fitness * (1.0 + game_bonus))

            # Select top individuals
            num_survivors = int(self.selection_pressure * len(population))

            # Sort by adjusted fitness
            sorted_indices = np.argsort(adjusted_fitness)[::-1]
            survivors = [population[i] for i in sorted_indices[:num_survivors]]

            self.populations[species_id] = survivors

    def _reproduction(self):
        """Create offspring through crossover and mutation."""
        new_populations = []

        for species_id, population in enumerate(self.populations):
            offspring = []

            # Keep survivors
            offspring.extend(population)

            # Create new individuals to fill population
            while len(offspring) < self.population_size:
                # Select parents
                parent1, parent2 = self._select_parents(species_id)

                # Crossover
                if np.random.random() < self.crossover_rate:
                    crossover_point = np.random.randint(1, 20)
                    child_genotype = parent1.genotype.crossover(
                        parent2.genotype, crossover_point
                    )
                else:
                    child_genotype = parent1.genotype

                # Mutation
                child_genotype = child_genotype.mutate(self.mutation_rate)

                # Create child
                child = Individual(
                    genotype=child_genotype,
                    species_id=species_id
                )
                offspring.append(child)

            new_populations.append(offspring)

        self.populations = new_populations

    def _select_parents(self, species_id: int) -> Tuple[Individual, Individual]:
        """Select parents using tournament selection."""
        population = self.populations[species_id]
        tournament_size = 3

        # Parent 1
        tournament1 = np.random.choice(population, tournament_size)
        parent1 = max(tournament1, key=lambda ind: ind.fitness)

        # Parent 2
        tournament2 = np.random.choice(population, tournament_size)
        parent2 = max(tournament2, key=lambda ind: ind.fitness)

        return parent1, parent2

    def _update_history(self, generation: int, fitness_results: List[List[float]]):
        """Update evolutionary history."""
        all_fitness = []
        species_counts = []

        for species_fitness in fitness_results:
            all_fitness.extend(species_fitness)
            species_counts.append(len(species_fitness))

        self.history['generation'].append(generation)
        self.history['mean_fitness'].append(np.mean(all_fitness))
        self.history['best_fitness'].append(np.max(all_fitness))
        self.history['species_counts'].append(species_counts)

        # Compute diversity (genotypic variance)
        all_genotypes = []
        for population in self.populations:
            all_genotypes.extend([ind.genotype.params for ind in population])
        diversity = np.mean(np.std(all_genotypes, axis=0))
        self.history['diversity'].append(diversity)

    def _report_progress(self, generation: int, fitness_results: List[List[float]]):
        """Report progress for current generation."""
        all_fitness = []
        for species_fitness in fitness_results:
            all_fitness.extend(species_fitness)

        mean_fit = np.mean(all_fitness)
        best_fit = np.max(all_fitness)
        diversity = self.history['diversity'][-1]

        print(f"Generation {generation:3d}: "
              f"Mean Fitness = {mean_fit:.4f}, "
              f"Best Fitness = {best_fit:.4f}, "
              f"Diversity = {diversity:.4f}")

    def _compile_results(self) -> Dict:
        """Compile final results."""
        # Get best individual across all species
        best_individual = None
        best_fitness = -np.inf

        for population in self.populations:
            for individual in population:
                if individual.fitness > best_fitness:
                    best_fitness = individual.fitness
                    best_individual = individual

        return {
            'best_individual': best_individual,
            'best_fitness': best_fitness,
            'history': self.history,
            'final_populations': self.populations,
        }


# =============================================================================
# TASK DISTRIBUTION
# =============================================================================

class TaskDistribution:
    """
    Distribution of tasks for meta-learning evaluation.

    Each task represents a learning problem with different characteristics.
    """

    def __init__(self, num_task_types: int = 5):
        self.num_task_types = num_task_types
        self.task_types = list(range(num_task_types))

    def sample_tasks(self, k: int = 5) -> List['Task']:
        """Sample k tasks from the distribution."""
        task_ids = np.random.choice(self.task_types, size=k)
        return [Task(task_id) for task_id in task_ids]


class Task:
    """A single learning task."""

    def __init__(self, task_id: int):
        self.task_id = task_id

        # Task characteristics
        self.noise_level = np.random.uniform(0.1, 0.3)
        self.data_complexity = np.random.uniform(0.5, 1.5)
        self.optimal_lr = np.random.uniform(1e-4, 1e-2)

    def simulate_training(
        self,
        optimizer_params: Dict
    ) -> Tuple[float, float, float]:
        """
        Simulate training with given optimizer parameters.

        Returns:
            (final_accuracy, convergence_time, generalization_gap)
        """
        # Simplified simulation based on optimizer parameters
        lr = optimizer_params['lr_init']

        # Accuracy depends on learning rate match
        lr_match = 1.0 - abs(lr - self.optimal_lr) / self.optimal_lr
        base_accuracy = 0.85 + 0.1 * lr_match

        # Add noise
        final_accuracy = base_accuracy - self.noise_level * np.random.uniform(0, 0.1)

        # Convergence time (fewer iterations = better)
        # Higher learning rate → faster convergence (if stable)
        stability = 1.0 if lr < 0.05 else max(0.5, 1.0 - lr * 5)
        convergence_time = 100 / (lr * stability * 100)

        # Generalization gap
        generalization_gap = 0.05 + 0.1 * self.data_complexity - 0.05 * lr_match

        return final_accuracy, convergence_time, generalization_gap


# =============================================================================
# VISUALIZATION
# =============================================================================

def plot_evolutionary_dynamics(results: Dict, save_path: Optional[str] = None):
    """Plot evolutionary dynamics."""
    history = results['history']

    fig, axes = plt.subplots(2, 2, figsize=(12, 10))

    # 1. Fitness over generations
    ax = axes[0, 0]
    ax.plot(history['generation'], history['mean_fitness'], 'b-', label='Mean', linewidth=2)
    ax.plot(history['generation'], history['best_fitness'], 'r-', label='Best', linewidth=2)
    ax.set_xlabel('Generation')
    ax.set_ylabel('Fitness')
    ax.set_title('Fitness Evolution')
    ax.legend()
    ax.grid(True, alpha=0.3)

    # 2. Diversity over generations
    ax = axes[0, 1]
    ax.plot(history['generation'], history['diversity'], 'g-', linewidth=2)
    ax.set_xlabel('Generation')
    ax.set_ylabel('Genotypic Diversity')
    ax.set_title('Population Diversity')
    ax.grid(True, alpha=0.3)

    # 3. Species counts over generations
    ax = axes[1, 0]
    species_counts = np.array(history['species_counts'])
    for species_id in range(species_counts.shape[1]):
        ax.plot(history['generation'], species_counts[:, species_id],
               label=f'Species {species_id}', linewidth=2)
    ax.set_xlabel('Generation')
    ax.set_ylabel('Population Size')
    ax.set_title('Species Population Dynamics')
    ax.legend()
    ax.grid(True, alpha=0.3)

    # 4. Fitness distribution (final generation)
    ax = axes[1, 1]
    final_fitness = []
    for population in results['final_populations']:
        for individual in population:
            final_fitness.append(individual.fitness)

    ax.hist(final_fitness, bins=20, color='steelblue', edgecolor='black', alpha=0.7)
    ax.axvline(np.mean(final_fitness), color='red', linestyle='--',
              label=f'Mean: {np.mean(final_fitness):.4f}')
    ax.set_xlabel('Fitness')
    ax.set_ylabel('Count')
    ax.set_title('Final Fitness Distribution')
    ax.legend()
    ax.grid(True, alpha=0.3)

    plt.tight_layout()

    if save_path:
        plt.savefig(save_path, dpi=150, bbox_inches='tight')
        print(f"Saved plot to {save_path}")

    plt.show()


def plot_best_optimizer_details(results: Dict):
    """Plot details of the best evolved optimizer."""
    best_individual = results['best_individual']
    optimizer_params = best_individual.create_optimizer()

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # 1. Parameter values
    ax = axes[0]
    param_names = [
        'lr_init', 'lr_final', 'decay_rate', 'momentum',
        'beta1', 'beta2', 'epsilon', 'l1', 'l2', 'dropout'
    ]
    param_values = [
        optimizer_params['lr_init'],
        optimizer_params['lr_final'],
        optimizer_params['decay_rate'],
        optimizer_params['momentum'],
        optimizer_params['beta1'],
        optimizer_params['beta2'],
        optimizer_params['epsilon'],
        optimizer_params['l1_strength'],
        optimizer_params['l2_strength'],
        optimizer_params['dropout'],
    ]

    y_pos = np.arange(len(param_names))
    ax.barh(y_pos, param_values, color='coral', edgecolor='black', alpha=0.7)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(param_names)
    ax.set_xlabel('Parameter Value')
    ax.set_title('Best Optimizer Parameters')
    ax.grid(True, alpha=0.3)

    # 2. Learning rate schedule
    ax = axes[1]
    epochs = np.arange(100)
    if optimizer_params['decay_type'] == 'exponential':
        lr_schedule = (
            optimizer_params['lr_final'] +
            (optimizer_params['lr_init'] - optimizer_params['lr_final']) *
            optimizer_params['decay_rate'] ** epochs
        )
    else:  # step decay
        lr_schedule = optimizer_params['lr_init'] * (
            optimizer_params['decay_rate'] ** (epochs // 30)
        )

    ax.plot(epochs, lr_schedule, linewidth=2, color='darkblue')
    ax.set_xlabel('Epoch')
    ax.set_ylabel('Learning Rate')
    ax.set_title('Learning Rate Schedule')
    ax.set_yscale('log')
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.show()

    print("\n" + "=" * 70)
    print("Best Evolved Optimizer")
    print("=" * 70)
    print(f"Fitness: {best_individual.fitness:.4f}")
    print(f"Species: {best_individual.species_id}")
    print(f"Type: {optimizer_params['type']}")
    print(f"Learning Rate: {optimizer_params['lr_init']:.6f} → {optimizer_params['lr_final']:.6f}")
    print(f"Decay: {optimizer_params['decay_type']} (rate={optimizer_params['decay_rate']:.4f})")
    print(f"Momentum: {optimizer_params['momentum']:.4f}")
    print(f"Beta1: {optimizer_params['beta1']:.4f}")
    print(f"Beta2: {optimizer_params['beta2']:.4f}")
    print(f"L1: {optimizer_params['l1_strength']:.4f}")
    print(f"L2: {optimizer_params['l2_strength']:.4f}")
    print(f"Dropout: {optimizer_params['dropout']:.4f}")


# =============================================================================
# MAIN SIMULATION
# =============================================================================

def main():
    """Run the evolutionary meta-learning simulation."""
    print("\n" + "=" * 70)
    print("EVOLUTIONARY GAME-THEORETIC META-LEARNING DEMONSTRATION")
    print("=" * 70)
    print("\nThis demonstrates the concepts from:")
    print("Enhanced Mathematical Framework Section 1.6")
    print()

    # Create task distribution
    task_distribution = TaskDistribution(num_task_types=5)

    # Create evolutionary meta-learner
    learner = EvolutionaryMetaLearner(
        num_species=3,
        population_size=50,
        mutation_rate=0.1,
        crossover_rate=0.7,
        selection_pressure=0.5
    )

    # Run evolution
    results = learner.evolve(
        num_generations=50,
        task_distribution=task_distribution,
        verbose=True
    )

    # Plot results
    print("\nGenerating visualizations...")
    plot_evolutionary_dynamics(
        results,
        save_path='evolutionary_meta_learning_dynamics.png'
    )

    # Show best optimizer
    plot_best_optimizer_details(results)

    # Save results
    output_path = Path('evolutionary_meta_learning_results.json')
    save_results = {
        'best_fitness': float(results['best_fitness']),
        'best_optimizer': results['best_individual'].create_optimizer(),
        'history': {k: [float(v) if isinstance(v, (int, float, np.number)) else v
                     for v in vals]
                  for k, vals in results['history'].items()},
    }

    with open(output_path, 'w') as f:
        json.dump(save_results, f, indent=2)

    print(f"\nResults saved to {output_path}")

    print("\n" + "=" * 70)
    print("Simulation Complete")
    print("=" * 70)

    return results


if __name__ == '__main__':
    results = main()
