import pytest
import json
import os
import shutil
from pathlib import Path
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from molting_engine import ResidueCollector, SeedMutationService, MoltLifecycle

@pytest.fixture
def setup_molt_env(tmp_path):
    seed_file = tmp_path / "seed.json"
    residue_dir = tmp_path / "residue"
    residue_dir.mkdir()
    initial_seed = {"robustness": 0.5, "complexity": 0.5, "name": "test_agent"}
    with open(seed_file, "w") as f:
        json.dump(initial_seed, f)
    return {"seed_path": str(seed_file), "residue_dir": str(residue_dir), "initial_seed": initial_seed, "tmp_path": tmp_path}

def test_residue_collector(setup_molt_env):
    collector = ResidueCollector(setup_molt_env["residue_dir"])
    collector.collect({"metric": 1.0}, ["error1"])
    residue = collector.flush_to_residue()
    assert len(residue) == 1
    assert residue[0]["telemetry"]["metric"] == 1.0
    assert "error1" in residue[0]["errors"]
    assert len(collector.residue_cache) == 0

def test_seed_mutation_service(setup_molt_env):
    mutator = SeedMutationService(mutation_rate=1.0)
    seed = setup_molt_env["initial_seed"]
    residue = [{"errors": ["critical error"]}]
    new_seed = mutator.mutate(seed, residue)
    assert new_seed["robustness"] > seed["robustness"]
    assert new_seed["complexity"] < seed["complexity"]
    assert "mutated_" in new_seed["name"]

def test_molt_lifecycle(setup_molt_env):
    collector = ResidueCollector(setup_molt_env["residue_dir"])
    mutator = SeedMutationService(mutation_rate=0.1)
    lifecycle = MoltLifecycle(setup_molt_env["seed_path"], setup_molt_env["residue_dir"], mutator, collector)
    def sim_func(seed):
        return {"score": 100}, []
    new_seed = lifecycle.run_generation(sim_func)
    assert lifecycle.generation == 1
    assert os.path.exists(setup_molt_env["seed_path"])
    with open(setup_molt_env["seed_path"], "r") as f:
        saved_seed = json.load(f)
    assert saved_seed != setup_molt_env["initial_seed"]
