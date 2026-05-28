#!/usr/bin/env python3
"""Tests for the Cocapn Fleet skill bridge."""
from __future__ import annotations

import json
import threading
import time
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import sys
import os

# Add the scripts directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from claw_fleet_bridge import FleetBridgeServer


class TestFleetBridge(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = FleetBridgeServer(host="127.0.0.1", port=8851)
        cls.server.start()
        cls.base_url = cls.server.url
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.server.stop()

    def _get(self, path: str) -> dict:
        with urlopen(f"{self.base_url}{path}") as resp:
            return json.loads(resp.read().decode())

    def _post(self, path: str, data: dict) -> dict:
        body = json.dumps(data).encode()
        req = Request(f"{self.base_url}{path}", data=body, headers={"Content-Type": "application/json"})
        with urlopen(req) as resp:
            return json.loads(resp.read().decode())

    def test_health(self):
        data = self._get("/health")
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["fleet"], "cocapn")

    def test_flux_presets(self):
        data = self._get("/flux/presets")
        self.assertIn("presets", data)

    def test_status(self):
        data = self._get("/status")
        self.assertIn("error", data)  # FleetConductorV2 not available in test env

    def test_llm_task(self):
        payload = {
            "defaultProvider": "kimi-coding",
            "defaultModel": "k2p6",
            "maxTokens": 2048,
            "timeoutMs": 60000
        }
        data = self._post("/llm/task", payload)
        self.assertEqual(data["id"], "llm-task")
        self.assertEqual(data["name"], "LLM Task")
        self.assertIn("configSchema", data)
        self.assertEqual(data["task"], payload)

    def test_breed(self):
        try:
            data = self._post("/breed", {"n_winners": 3, "preset": "diversity"})
            self.fail("Expected HTTPError")
        except HTTPError as e:
            self.assertEqual(e.code, 500)
            data = json.loads(e.read().decode())
            self.assertIn("error", data)

    def test_flux_check(self):
        try:
            data = self._post("/flux/check", {"candidate": {"name": "test"}})
            self.fail("Expected HTTPError")
        except HTTPError as e:
            self.assertEqual(e.code, 500)
            data = json.loads(e.read().decode())
            self.assertIn("error", data)

    def test_mesh_insert(self):
        try:
            data = self._post("/mesh/insert", {"table_id": "test", "vector": [0.1, 0.2], "fitness": 0.5})
            self.fail("Expected HTTPError")
        except HTTPError as e:
            self.assertEqual(e.code, 500)
            data = json.loads(e.read().decode())
            self.assertIn("error", data)

    def test_mesh_query(self):
        try:
            data = self._post("/mesh/query", {"min_fitness": 0.8})
            self.fail("Expected HTTPError")
        except HTTPError as e:
            self.assertEqual(e.code, 500)
            data = json.loads(e.read().decode())
            self.assertIn("error", data)

    def test_404(self):
        try:
            self._get("/nonexistent")
        except HTTPError as e:
            self.assertEqual(e.code, 404)


if __name__ == "__main__":
    unittest.main()
