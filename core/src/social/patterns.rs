//! Social Patterns for Multi-Agent Coordination
//!
//! This module defines the various social patterns that agents can use to interact.

use crate::social::{SocialError, SocialResult, SocialAgentMetadata};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Social role for an agent
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum SocialRole {
    /// Master agent controls others
    Master,

    /// Slave agent executes tasks
    Slave,

    /// Co-worker agent collaborates as equal
    CoWorker,

    /// Peer agent coordinates as equal
    Peer,

    /// Delegate agent assigns tasks
    Delegate,

    /// Observer agent monitors without participating
    Observer,
}

/// Type of relationship between agents
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum RelationshipType {
    /// Master-Slave relationship
    MasterSlave,

    /// Co-Worker relationship
    CoWorker,

    /// Peer relationship
    Peer,

    /// Delegate relationship
    Delegate,

    /// Observer relationship
    Observer,
}

/// Social pattern trait
#[async_trait]
pub trait SocialPattern: Send + Sync {
    /// Get the pattern type
    fn pattern_type(&self) -> RelationshipType;

    /// Add an agent to the pattern
    async fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()>;

    /// Remove an agent from the pattern
    async fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()>;

    /// Get all agents in the pattern
    async fn get_agents(&self) -> Vec<SocialAgentMetadata>;

    /// Get agents by role
    async fn get_agents_by_role(&self, role: SocialRole) -> Vec<SocialAgentMetadata>;

    /// Execute coordination
    async fn coordinate(&self, task: serde_json::Value) -> SocialResult<serde_json::Value>;

    /// Check if pattern is healthy
    async fn health_check(&self) -> SocialResult<bool>;
}

/// Master-Slave Pattern
///
/// One master coordinates multiple slaves for parallel processing
pub struct MasterSlavePattern {
    master: Option<SocialAgentMetadata>,
    slaves: HashMap<String, SocialAgentMetadata>,
}

impl MasterSlavePattern {
    pub fn new() -> Self {
        Self {
            master: None,
            slaves: HashMap::new(),
        }
    }

    pub fn with_master(mut self, master: SocialAgentMetadata) -> Self {
        self.master = Some(master);
        self
    }

    pub fn add_slave(&mut self, slave: SocialAgentMetadata) -> SocialResult<()> {
        if self.slaves.contains_key(&slave.id) {
            return Err(SocialError::RelationshipExists(
                "master".to_string(),
                slave.id,
            ));
        }
        self.slaves.insert(slave.id.clone(), slave);
        Ok(())
    }

    pub fn get_master(&self) -> Option<&SocialAgentMetadata> {
        self.master.as_ref()
    }

    pub fn get_slaves(&self) -> Vec<&SocialAgentMetadata> {
        self.slaves.values().collect()
    }

    pub fn slave_count(&self) -> usize {
        self.slaves.len()
    }
}

impl Default for MasterSlavePattern {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SocialPattern for MasterSlavePattern {
    fn pattern_type(&self) -> RelationshipType {
        RelationshipType::MasterSlave
    }

    async fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()> {
        match agent.role {
            SocialRole::Master => {
                if self.master.is_some() {
                    return Err(SocialError::RelationshipExists(
                        "master".to_string(),
                        agent.id,
                    ));
                }
                self.master = Some(agent);
                Ok(())
            }
            SocialRole::Slave => {
                if self.slaves.contains_key(&agent.id) {
                    return Err(SocialError::RelationshipExists(
                        "slave".to_string(),
                        agent.id,
                    ));
                }
                self.slaves.insert(agent.id.clone(), agent);
                Ok(())
            }
            _ => Err(SocialError::InvalidStrategy(format!(
                "Invalid role for Master-Slave pattern: {:?}",
                agent.role
            ))),
        }
    }

    async fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()> {
        if let Some(master) = &self.master {
            if master.id == agent_id {
                self.master = None;
                return Ok(());
            }
        }

        if self.slaves.remove(agent_id).is_some() {
            Ok(())
        } else {
            Err(SocialError::AgentNotFound(agent_id.to_string()))
        }
    }

    async fn get_agents(&self) -> Vec<SocialAgentMetadata> {
        let mut agents = Vec::new();

        if let Some(master) = &self.master {
            agents.push(master.clone());
        }

        for slave in self.slaves.values() {
            agents.push(slave.clone());
        }

        agents
    }

    async fn get_agents_by_role(&self, role: SocialRole) -> Vec<SocialAgentMetadata> {
        match role {
            SocialRole::Master => self.master.iter().cloned().collect(),
            SocialRole::Slave => self.slaves.values().cloned().collect(),
            _ => Vec::new(),
        }
    }

    async fn coordinate(&self, task: serde_json::Value) -> SocialResult<serde_json::Value> {
        // Master delegates task to slaves in parallel
        let _results = tokio::task::JoinSet::<SocialResult<serde_json::Value>>::new();

        Ok(serde_json::json!({
            "pattern": "master-slave",
            "master": self.master.as_ref().map(|m| m.id.clone()),
            "slaves": self.slaves.len(),
            "task": task
        }))
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(self.master.is_some() && !self.slaves.is_empty())
    }
}

/// Co-Worker Pattern
///
/// Multiple agents collaborate as equals on shared tasks
pub struct CoWorkerPattern {
    workers: HashMap<String, SocialAgentMetadata>,
}

impl CoWorkerPattern {
    pub fn new() -> Self {
        Self {
            workers: HashMap::new(),
        }
    }

    pub fn add_worker(&mut self, worker: SocialAgentMetadata) -> SocialResult<()> {
        if self.workers.contains_key(&worker.id) {
            return Err(SocialError::RelationshipExists(
                "worker".to_string(),
                worker.id,
            ));
        }
        self.workers.insert(worker.id.clone(), worker);
        Ok(())
    }

    pub fn get_workers(&self) -> Vec<&SocialAgentMetadata> {
        self.workers.values().collect()
    }

    pub fn worker_count(&self) -> usize {
        self.workers.len()
    }
}

impl Default for CoWorkerPattern {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SocialPattern for CoWorkerPattern {
    fn pattern_type(&self) -> RelationshipType {
        RelationshipType::CoWorker
    }

    async fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()> {
        if agent.role != SocialRole::CoWorker {
            return Err(SocialError::InvalidStrategy(format!(
                "Invalid role for Co-Worker pattern: {:?}",
                agent.role
            )));
        }

        if self.workers.contains_key(&agent.id) {
            return Err(SocialError::RelationshipExists(
                "worker".to_string(),
                agent.id,
            ));
        }

        self.workers.insert(agent.id.clone(), agent);
        Ok(())
    }

    async fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()> {
        self.workers
            .remove(agent_id)
            .map(|_| ())
            .ok_or_else(|| SocialError::AgentNotFound(agent_id.to_string()))
    }

    async fn get_agents(&self) -> Vec<SocialAgentMetadata> {
        self.workers.values().cloned().collect()
    }

    async fn get_agents_by_role(&self, role: SocialRole) -> Vec<SocialAgentMetadata> {
        if role == SocialRole::CoWorker {
            self.workers.values().cloned().collect()
        } else {
            Vec::new()
        }
    }

    async fn coordinate(&self, task: serde_json::Value) -> SocialResult<serde_json::Value> {
        Ok(serde_json::json!({
            "pattern": "co-worker",
            "workers": self.workers.len(),
            "task": task
        }))
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(!self.workers.is_empty() && self.workers.len() >= 2)
    }
}

/// Peer Pattern
///
/// Equal agents coordinate together without hierarchy
pub struct PeerPattern {
    peers: HashMap<String, SocialAgentMetadata>,
}

impl PeerPattern {
    pub fn new() -> Self {
        Self {
            peers: HashMap::new(),
        }
    }

    pub fn add_peer(&mut self, peer: SocialAgentMetadata) -> SocialResult<()> {
        if self.peers.contains_key(&peer.id) {
            return Err(SocialError::RelationshipExists(
                "peer".to_string(),
                peer.id,
            ));
        }
        self.peers.insert(peer.id.clone(), peer);
        Ok(())
    }

    pub fn get_peers(&self) -> Vec<&SocialAgentMetadata> {
        self.peers.values().collect()
    }

    pub fn peer_count(&self) -> usize {
        self.peers.len()
    }
}

impl Default for PeerPattern {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SocialPattern for PeerPattern {
    fn pattern_type(&self) -> RelationshipType {
        RelationshipType::Peer
    }

    async fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()> {
        if agent.role != SocialRole::Peer {
            return Err(SocialError::InvalidStrategy(format!(
                "Invalid role for Peer pattern: {:?}",
                agent.role
            )));
        }

        if self.peers.contains_key(&agent.id) {
            return Err(SocialError::RelationshipExists(
                "peer".to_string(),
                agent.id,
            ));
        }

        self.peers.insert(agent.id.clone(), agent);
        Ok(())
    }

    async fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()> {
        self.peers
            .remove(agent_id)
            .map(|_| ())
            .ok_or_else(|| SocialError::AgentNotFound(agent_id.to_string()))
    }

    async fn get_agents(&self) -> Vec<SocialAgentMetadata> {
        self.peers.values().cloned().collect()
    }

    async fn get_agents_by_role(&self, role: SocialRole) -> Vec<SocialAgentMetadata> {
        if role == SocialRole::Peer {
            self.peers.values().cloned().collect()
        } else {
            Vec::new()
        }
    }

    async fn coordinate(&self, task: serde_json::Value) -> SocialResult<serde_json::Value> {
        Ok(serde_json::json!({
            "pattern": "peer",
            "peers": self.peers.len(),
            "task": task
        }))
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(!self.peers.is_empty() && self.peers.len() >= 2)
    }
}

/// Delegate Pattern
///
/// One agent delegates tasks to others
pub struct DelegatePattern {
    delegate: Option<SocialAgentMetadata>,
    delegates: HashMap<String, SocialAgentMetadata>,
}

impl DelegatePattern {
    pub fn new() -> Self {
        Self {
            delegate: None,
            delegates: HashMap::new(),
        }
    }

    pub fn with_delegate(mut self, delegate: SocialAgentMetadata) -> Self {
        self.delegate = Some(delegate);
        self
    }

    pub fn add_delegated(&mut self, delegated: SocialAgentMetadata) -> SocialResult<()> {
        if self.delegates.contains_key(&delegated.id) {
            return Err(SocialError::RelationshipExists(
                "delegate".to_string(),
                delegated.id,
            ));
        }
        self.delegates.insert(delegated.id.clone(), delegated);
        Ok(())
    }

    pub fn get_delegate(&self) -> Option<&SocialAgentMetadata> {
        self.delegate.as_ref()
    }

    pub fn get_delegates(&self) -> Vec<&SocialAgentMetadata> {
        self.delegates.values().collect()
    }
}

impl Default for DelegatePattern {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SocialPattern for DelegatePattern {
    fn pattern_type(&self) -> RelationshipType {
        RelationshipType::Delegate
    }

    async fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()> {
        match agent.role {
            SocialRole::Delegate => {
                if self.delegate.is_some() {
                    return Err(SocialError::RelationshipExists(
                        "delegate".to_string(),
                        agent.id,
                    ));
                }
                self.delegate = Some(agent);
                Ok(())
            }
            _ => {
                if self.delegates.contains_key(&agent.id) {
                    return Err(SocialError::RelationshipExists(
                        "delegated".to_string(),
                        agent.id,
                    ));
                }
                self.delegates.insert(agent.id.clone(), agent);
                Ok(())
            }
        }
    }

    async fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()> {
        if let Some(delegate) = &self.delegate {
            if delegate.id == agent_id {
                self.delegate = None;
                return Ok(());
            }
        }

        if self.delegates.remove(agent_id).is_some() {
            Ok(())
        } else {
            Err(SocialError::AgentNotFound(agent_id.to_string()))
        }
    }

    async fn get_agents(&self) -> Vec<SocialAgentMetadata> {
        let mut agents = Vec::new();

        if let Some(delegate) = &self.delegate {
            agents.push(delegate.clone());
        }

        for delegated in self.delegates.values() {
            agents.push(delegated.clone());
        }

        agents
    }

    async fn get_agents_by_role(&self, role: SocialRole) -> Vec<SocialAgentMetadata> {
        match role {
            SocialRole::Delegate => self.delegate.iter().cloned().collect(),
            _ => Vec::new(),
        }
    }

    async fn coordinate(&self, task: serde_json::Value) -> SocialResult<serde_json::Value> {
        Ok(serde_json::json!({
            "pattern": "delegate",
            "delegate": self.delegate.as_ref().map(|d| d.id.clone()),
            "delegates": self.delegates.len(),
            "task": task
        }))
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(self.delegate.is_some() && !self.delegates.is_empty())
    }
}

/// Observer Pattern
///
/// Agents observe without participating
pub struct ObserverPattern {
    observers: HashMap<String, SocialAgentMetadata>,
    observed: Option<String>,
}

impl ObserverPattern {
    pub fn new() -> Self {
        Self {
            observers: HashMap::new(),
            observed: None,
        }
    }

    pub fn with_observed(mut self, observed: String) -> Self {
        self.observed = Some(observed);
        self
    }

    pub fn add_observer(&mut self, observer: SocialAgentMetadata) -> SocialResult<()> {
        if self.observers.contains_key(&observer.id) {
            return Err(SocialError::RelationshipExists(
                "observer".to_string(),
                observer.id,
            ));
        }
        self.observers.insert(observer.id.clone(), observer);
        Ok(())
    }

    pub fn get_observers(&self) -> Vec<&SocialAgentMetadata> {
        self.observers.values().collect()
    }

    pub fn observer_count(&self) -> usize {
        self.observers.len()
    }

    pub fn get_observed(&self) -> Option<&str> {
        self.observed.as_deref()
    }
}

impl Default for ObserverPattern {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SocialPattern for ObserverPattern {
    fn pattern_type(&self) -> RelationshipType {
        RelationshipType::Observer
    }

    async fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()> {
        if agent.role != SocialRole::Observer {
            return Err(SocialError::InvalidStrategy(format!(
                "Invalid role for Observer pattern: {:?}",
                agent.role
            )));
        }

        if self.observers.contains_key(&agent.id) {
            return Err(SocialError::RelationshipExists(
                "observer".to_string(),
                agent.id,
            ));
        }

        self.observers.insert(agent.id.clone(), agent);
        Ok(())
    }

    async fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()> {
        self.observers
            .remove(agent_id)
            .map(|_| ())
            .ok_or_else(|| SocialError::AgentNotFound(agent_id.to_string()))
    }

    async fn get_agents(&self) -> Vec<SocialAgentMetadata> {
        self.observers.values().cloned().collect()
    }

    async fn get_agents_by_role(&self, role: SocialRole) -> Vec<SocialAgentMetadata> {
        if role == SocialRole::Observer {
            self.observers.values().cloned().collect()
        } else {
            Vec::new()
        }
    }

    async fn coordinate(&self, task: serde_json::Value) -> SocialResult<serde_json::Value> {
        Ok(serde_json::json!({
            "pattern": "observer",
            "observers": self.observers.len(),
            "observed": self.observed,
            "task": task
        }))
    }

    async fn health_check(&self) -> SocialResult<bool> {
        Ok(self.observed.is_some() && !self.observers.is_empty())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_master_slave_pattern() {
        let mut pattern = MasterSlavePattern::new();

        let master = SocialAgentMetadata::new("master-1".to_string(), SocialRole::Master);
        let slave1 = SocialAgentMetadata::new("slave-1".to_string(), SocialRole::Slave);
        let slave2 = SocialAgentMetadata::new("slave-2".to_string(), SocialRole::Slave);

        pattern.add_agent(master).await.unwrap();
        pattern.add_agent(slave1).await.unwrap();
        pattern.add_agent(slave2).await.unwrap();

        assert_eq!(pattern.slave_count(), 2);
        assert!(pattern.health_check().await.unwrap());
    }

    #[tokio::test]
    async fn test_co_worker_pattern() {
        let mut pattern = CoWorkerPattern::new();

        let worker1 = SocialAgentMetadata::new("worker-1".to_string(), SocialRole::CoWorker);
        let worker2 = SocialAgentMetadata::new("worker-2".to_string(), SocialRole::CoWorker);

        pattern.add_agent(worker1).await.unwrap();
        pattern.add_agent(worker2).await.unwrap();

        assert_eq!(pattern.worker_count(), 2);
        assert!(pattern.health_check().await.unwrap());
    }

    #[tokio::test]
    async fn test_peer_pattern() {
        let mut pattern = PeerPattern::new();

        let peer1 = SocialAgentMetadata::new("peer-1".to_string(), SocialRole::Peer);
        let peer2 = SocialAgentMetadata::new("peer-2".to_string(), SocialRole::Peer);

        pattern.add_agent(peer1).await.unwrap();
        pattern.add_agent(peer2).await.unwrap();

        assert_eq!(pattern.peer_count(), 2);
        assert!(pattern.health_check().await.unwrap());
    }

    #[tokio::test]
    async fn test_delegate_pattern() {
        let mut pattern = DelegatePattern::new();

        let delegate = SocialAgentMetadata::new("delegate-1".to_string(), SocialRole::Delegate);
        let delegated = SocialAgentMetadata::new("delegated-1".to_string(), SocialRole::Slave);

        pattern.add_agent(delegate).await.unwrap();
        pattern.add_agent(delegated).await.unwrap();

        assert!(pattern.health_check().await.unwrap());
    }

    #[tokio::test]
    async fn test_observer_pattern() {
        let mut pattern = ObserverPattern::new().with_observed("target-1".to_string());

        let observer1 = SocialAgentMetadata::new("observer-1".to_string(), SocialRole::Observer);
        let observer2 = SocialAgentMetadata::new("observer-2".to_string(), SocialRole::Observer);

        pattern.add_agent(observer1).await.unwrap();
        pattern.add_agent(observer2).await.unwrap();

        assert_eq!(pattern.observer_count(), 2);
        assert!(pattern.health_check().await.unwrap());
    }
}
