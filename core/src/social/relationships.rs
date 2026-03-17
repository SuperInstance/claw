//! Relationship Management for Social Coordination
//!
//! This module manages relationships between agents in the social system.

use crate::social::{RelationshipType, SocialAgentMetadata, SocialError, SocialResult};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use tokio::sync::RwLock;

/// Relationship state
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum RelationshipState {
    Active,
    Inactive,
    Suspended,
    Terminated,
}

/// Relationship between agents
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Relationship {
    pub id: String,
    pub relationship_type: RelationshipType,
    pub participants: Vec<String>,
    pub state: RelationshipState,
    pub metadata: HashMap<String, serde_json::Value>,
}

impl Relationship {
    pub fn new(
        id: String,
        relationship_type: RelationshipType,
        participants: Vec<String>,
    ) -> Self {
        Self {
            id,
            relationship_type,
            participants,
            state: RelationshipState::Active,
            metadata: HashMap::new(),
        }
    }

    pub fn with_metadata(mut self, metadata: HashMap<String, serde_json::Value>) -> Self {
        self.metadata = metadata;
        self
    }

    pub fn is_active(&self) -> bool {
        self.state == RelationshipState::Active
    }

    pub fn participant_count(&self) -> usize {
        self.participants.len()
    }
}

/// Relationship manager
pub struct RelationshipManager {
    agents: HashMap<String, SocialAgentMetadata>,
    relationships: HashMap<String, Relationship>,
    agent_relationships: HashMap<String, HashSet<String>>,
    social_graph: SocialGraph,
}

impl RelationshipManager {
    pub fn new() -> Self {
        Self {
            agents: HashMap::new(),
            relationships: HashMap::new(),
            agent_relationships: HashMap::new(),
            social_graph: SocialGraph::new(),
        }
    }

    /// Add an agent
    pub fn add_agent(&mut self, agent: SocialAgentMetadata) -> SocialResult<()> {
        if self.agents.contains_key(&agent.id) {
            return Err(SocialError::RelationshipExists(
                "agent".to_string(),
                agent.id,
            ));
        }

        self.social_graph.add_node(agent.id.clone());
        let agent_id = agent.id.clone();
        self.agents.insert(agent.id.clone(), agent);
        self.agent_relationships.insert(agent_id, HashSet::new());

        Ok(())
    }

    /// Remove an agent
    pub fn remove_agent(&mut self, agent_id: &str) -> SocialResult<()> {
        if !self.agents.contains_key(agent_id) {
            return Err(SocialError::AgentNotFound(agent_id.to_string()));
        }

        // Remove all relationships involving this agent
        let relationship_ids: Vec<_> = self
            .agent_relationships
            .get(agent_id)
            .map(|ids| ids.iter().cloned().collect())
            .unwrap_or_default();

        for rel_id in relationship_ids {
            self.remove_relationship(&rel_id)?;
        }

        self.agents.remove(agent_id);
        self.agent_relationships.remove(agent_id);
        self.social_graph.remove_node(agent_id);

        Ok(())
    }

    /// Get an agent
    pub fn get_agent(&self, agent_id: &str) -> Option<&SocialAgentMetadata> {
        self.agents.get(agent_id)
    }

    /// Get all agents
    pub fn get_all_agents(&self) -> Vec<SocialAgentMetadata> {
        self.agents.values().cloned().collect()
    }

    /// Add a relationship
    pub fn add_relationship(&mut self, relationship: Relationship) -> SocialResult<()> {
        if self.relationships.contains_key(&relationship.id) {
            return Err(SocialError::RelationshipExists(
                "relationship".to_string(),
                relationship.id,
            ));
        }

        // Validate all participants exist
        for participant in &relationship.participants {
            if !self.agents.contains_key(participant) {
                return Err(SocialError::AgentNotFound(participant.clone()));
            }
        }

        // Add edges to social graph
        let participants = &relationship.participants;
        for i in 0..participants.len() {
            for j in (i + 1)..participants.len() {
                self.social_graph.add_edge(
                    participants[i].clone(),
                    participants[j].clone(),
                    relationship.relationship_type.clone(),
                );
            }
        }

        // Update agent relationships
        for participant in &relationship.participants {
            self.agent_relationships
                .entry(participant.clone())
                .or_insert_with(HashSet::new)
                .insert(relationship.id.clone());
        }

        self.relationships.insert(relationship.id.clone(), relationship);

        Ok(())
    }

    /// Remove a relationship
    pub fn remove_relationship(&mut self, relationship_id: &str) -> SocialResult<()> {
        let relationship = self
            .relationships
            .remove(relationship_id)
            .ok_or_else(|| SocialError::RelationshipNotFound(
                "unknown".to_string(),
                relationship_id.to_string(),
            ))?;

        // Remove edges from social graph
        let participants = &relationship.participants;
        for i in 0..participants.len() {
            for j in (i + 1)..participants.len() {
                self.social_graph.remove_edge(
                    &participants[i],
                    &participants[j],
                );
            }
        }

        // Update agent relationships
        for participant in &relationship.participants {
            if let Some(relations) = self.agent_relationships.get_mut(participant) {
                relations.remove(relationship_id);
            }
        }

        Ok(())
    }

    /// Get a relationship
    pub fn get_relationship(&self, relationship_id: &str) -> Option<&Relationship> {
        self.relationships.get(relationship_id)
    }

    /// Get all relationships
    pub fn get_all_relationships(&self) -> Vec<Relationship> {
        self.relationships.values().cloned().collect()
    }

    /// Get agent relationships
    pub fn get_agent_relationships(&self, agent_id: &str) -> Vec<Relationship> {
        self.agent_relationships
            .get(agent_id)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.relationships.get(id))
                    .cloned()
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Get social graph
    pub fn get_social_graph(&self) -> &SocialGraph {
        &self.social_graph
    }

    /// Get social metrics
    pub fn get_social_metrics(&self) -> SocialMetrics {
        self.social_graph.get_metrics()
    }

    /// Find shortest path between agents
    pub fn find_path(&self, from: &str, to: &str) -> SocialResult<Vec<String>> {
        self.social_graph.find_shortest_path(from, to)
    }

    /// Get agents by capability
    pub fn get_agents_by_capability(&self, capability: &str) -> Vec<SocialAgentMetadata> {
        self.agents
            .values()
            .filter(|agent| agent.capabilities.contains(&capability.to_string()))
            .cloned()
            .collect()
    }

    /// Get available agents
    pub fn get_available_agents(&self) -> Vec<SocialAgentMetadata> {
        self.agents
            .values()
            .filter(|agent| agent.is_available())
            .cloned()
            .collect()
    }

    /// Get agent count
    pub fn agent_count(&self) -> usize {
        self.agents.len()
    }

    /// Get relationship count
    pub fn relationship_count(&self) -> usize {
        self.relationships.len()
    }
}

impl Default for RelationshipManager {
    fn default() -> Self {
        Self::new()
    }
}

/// Social graph for tracking agent connections
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialGraph {
    nodes: HashSet<String>,
    edges: HashMap<String, HashMap<String, RelationshipType>>,
}

impl SocialGraph {
    pub fn new() -> Self {
        Self {
            nodes: HashSet::new(),
            edges: HashMap::new(),
        }
    }

    pub fn add_node(&mut self, node: String) {
        self.nodes.insert(node.clone());
        self.edges.entry(node).or_insert_with(HashMap::new);
    }

    pub fn remove_node(&mut self, node: &str) {
        self.nodes.remove(node);

        // Remove all edges involving this node
        for edges in self.edges.values_mut() {
            edges.remove(node);
        }

        self.edges.remove(node);
    }

    pub fn add_edge(&mut self, from: String, to: String, edge_type: RelationshipType) {
        self.edges
            .entry(from.clone())
            .or_insert_with(HashMap::new)
            .insert(to.clone(), edge_type.clone());

        self.edges
            .entry(to)
            .or_insert_with(HashMap::new)
            .insert(from, edge_type);
    }

    pub fn remove_edge(&mut self, from: &str, to: &str) {
        if let Some(edges) = self.edges.get_mut(from) {
            edges.remove(to);
        }

        if let Some(edges) = self.edges.get_mut(to) {
            edges.remove(from);
        }
    }

    pub fn find_shortest_path(&self, from: &str, to: &str) -> SocialResult<Vec<String>> {
        if !self.nodes.contains(from) {
            return Err(SocialError::AgentNotFound(from.to_string()));
        }

        if !self.nodes.contains(to) {
            return Err(SocialError::AgentNotFound(to.to_string()));
        }

        // BFS to find shortest path
        let mut queue = vec![vec![from.to_string()]];
        let mut visited = HashSet::new();
        visited.insert(from.to_string());

        while let Some(path) = queue.pop() {
            let current = path.last().unwrap();

            if current == to {
                return Ok(path);
            }

            if let Some(neighbors) = self.edges.get(current) {
                for neighbor in neighbors.keys() {
                    if !visited.contains(neighbor) {
                        visited.insert(neighbor.clone());
                        let mut new_path = path.clone();
                        new_path.push(neighbor.clone());
                        queue.push(new_path);
                    }
                }
            }
        }

        Err(SocialError::RoutingFailed(format!(
            "No path found from {} to {}",
            from, to
        )))
    }

    pub fn get_metrics(&self) -> SocialMetrics {
        let total_edges = self.edges.values().map(|e| e.len()).sum::<usize>() / 2;

        // Calculate average degree
        let avg_degree = if self.nodes.is_empty() {
            0.0
        } else {
            total_edges as f64 * 2.0 / self.nodes.len() as f64
        };

        SocialMetrics {
            total_nodes: self.nodes.len(),
            total_edges,
            avg_degree,
            connected_components: self.count_connected_components(),
        }
    }

    fn count_connected_components(&self) -> usize {
        let mut visited = HashSet::new();
        let mut components = 0;

        for node in &self.nodes {
            if !visited.contains(node) {
                components += 1;
                self.dfs_visit(node, &mut visited);
            }
        }

        components
    }

    fn dfs_visit(&self, node: &str, visited: &mut HashSet<String>) {
        visited.insert(node.to_string());

        if let Some(neighbors) = self.edges.get(node) {
            for neighbor in neighbors.keys() {
                if !visited.contains(neighbor) {
                    self.dfs_visit(neighbor, visited);
                }
            }
        }
    }
}

impl Default for SocialGraph {
    fn default() -> Self {
        Self::new()
    }
}

/// Social metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SocialMetrics {
    pub total_nodes: usize,
    pub total_edges: usize,
    pub avg_degree: f64,
    pub connected_components: usize,
}

impl Default for SocialMetrics {
    fn default() -> Self {
        Self {
            total_nodes: 0,
            total_edges: 0,
            avg_degree: 0.0,
            connected_components: 0,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::social::SocialRole;

    #[test]
    fn test_relationship_manager() {
        let mut manager = RelationshipManager::new();

        let agent1 = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
        let agent2 = SocialAgentMetadata::new("agent-2".to_string(), SocialRole::Peer);

        manager.add_agent(agent1).unwrap();
        manager.add_agent(agent2).unwrap();

        assert_eq!(manager.agent_count(), 2);

        let relationship = Relationship::new(
            "rel-1".to_string(),
            RelationshipType::Peer,
            vec!["agent-1".to_string(), "agent-2".to_string()],
        );

        manager.add_relationship(relationship).unwrap();

        assert_eq!(manager.relationship_count(), 1);
    }

    #[test]
    fn test_social_graph() {
        let mut graph = SocialGraph::new();

        graph.add_node("agent-1".to_string());
        graph.add_node("agent-2".to_string());
        graph.add_node("agent-3".to_string());

        graph.add_edge(
            "agent-1".to_string(),
            "agent-2".to_string(),
            RelationshipType::Peer,
        );
        graph.add_edge(
            "agent-2".to_string(),
            "agent-3".to_string(),
            RelationshipType::Peer,
        );

        let path = graph.find_shortest_path("agent-1", "agent-3").unwrap();
        assert_eq!(path, vec!["agent-1", "agent-2", "agent-3"]);
    }

    #[test]
    fn test_social_metrics() {
        let mut manager = RelationshipManager::new();

        let agent1 = SocialAgentMetadata::new("agent-1".to_string(), SocialRole::Peer);
        let agent2 = SocialAgentMetadata::new("agent-2".to_string(), SocialRole::Peer);

        manager.add_agent(agent1).unwrap();
        manager.add_agent(agent2).unwrap();

        let relationship = Relationship::new(
            "rel-1".to_string(),
            RelationshipType::Peer,
            vec!["agent-1".to_string(), "agent-2".to_string()],
        );

        manager.add_relationship(relationship).unwrap();

        let metrics = manager.get_social_metrics();
        assert_eq!(metrics.total_nodes, 2);
        assert_eq!(metrics.total_edges, 1);
    }
}
