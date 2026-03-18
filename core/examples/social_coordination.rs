//! Social Coordination Patterns Example
//!
//! This example demonstrates the social architecture for multi-agent coordination,
//! including master-slave, co-worker, and consensus patterns.

use claw_core::{
    agent::{MinimalAgent, AgentConfig, Agent},
    equipment::EquipmentSlot,
};
use std::collections::HashMap;
use tokio::time::{sleep, Duration};
use uuid::Uuid;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();

    println!("=== Social Coordination Patterns Example ===\n");

    // Example 1: Master-Slave Pattern
    println!("--- Example 1: Master-Slave Pattern ---\n");
    master_slave_example().await?;

    // Example 2: Co-Worker Pattern
    println!("\n--- Example 2: Co-Worker Pattern ---\n");
    co_worker_example().await?;

    // Example 3: Consensus Pattern
    println!("\n--- Example 3: Consensus Pattern ---\n");
    consensus_example().await?;

    // Example 4: Peer Coordination
    println!("\n--- Example 4: Peer Coordination ---\n");
    peer_coordination_example().await?;

    println!("\n=== Social Coordination Patterns Complete ===");
    Ok(())
}

/// Master-Slave Pattern Example
///
/// Demonstrates parallel processing with a master agent coordinating
/// multiple slave agents.
async fn master_slave_example() -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating master agent...");
    let master_id = Uuid::new_v4().to_string();
    let master_config = AgentConfig {
        id: master_id.clone(),
        cell_ref: "A1".to_string(),
        model: "deepseek-chat".to_string(),
        equipment: vec![EquipmentSlot::Coordination],
        config: HashMap::new(),
    };
    let master = MinimalAgent::new(master_config);

    println!("Creating slave agents...");
    let slave_ids: Vec<String> = vec![
        create_slave("B1".to_string()).await?,
        create_slave("B2".to_string()).await?,
        create_slave("B3".to_string()).await?,
    ];

    println!("Master {} has {} slaves", master_agent_id(&master), slave_ids.len());

    // Master distributes task to slaves
    let task = "Process data chunk";
    println!("\nMaster distributing task: '{}'", task);

    let mut results = Vec::new();
    for (i, slave_id) in slave_ids.iter().enumerate() {
        let chunk = format!("{} {}", task, i);
        println!("  → Slave {}: Processing '{}'", i, chunk);
        let result = simulate_slave_work(&chunk).await?;
        results.push(result);
    }

    // Master aggregates results
    println!("\nAggregating results from slaves...");
    let aggregated = aggregate_results(&results);
    println!("Final result: {}", aggregated);

    Ok(())
}

/// Co-Worker Pattern Example
///
/// Demonstrates peer collaboration where agents work together
/// on a shared task.
async fn co_worker_example() -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating co-worker agents...");

    let worker_a_id = Uuid::new_v4().to_string();
    let worker_a_config = AgentConfig {
        id: worker_a_id.clone(),
        cell_ref: "C1".to_string(),
        model: "deepseek-chat".to_string(),
        equipment: vec![EquipmentSlot::Memory],
        config: HashMap::new(),
    };
    let worker_a = MinimalAgent::new(worker_a_config);

    let worker_b_id = Uuid::new_v4().to_string();
    let worker_b_config = AgentConfig {
        id: worker_b_id.clone(),
        cell_ref: "C2".to_string(),
        model: "deepseek-chat".to_string(),
        equipment: vec![EquipmentSlot::Reasoning],
        config: HashMap::new(),
    };
    let worker_b = MinimalAgent::new(worker_b_config);

    println!("Worker A: {} (Memory specialist)", get_agent_id(&worker_a));
    println!("Worker B: {} (Reasoning specialist)", get_agent_id(&worker_b));

    // Workers collaborate on a task
    let task = "Analyze complex pattern";
    println!("\nCollaborating on task: '{}'", task);

    // Step 1: Worker A stores initial data
    println!("  → Worker A: Storing task data");
    let data = format!("Data for {}", task);
    sleep(Duration::from_millis(50)).await;

    // Step 2: Worker B analyzes the data
    println!("  → Worker B: Analyzing data");
    let analysis = format!("Analysis of {}", data);
    sleep(Duration::from_millis(100)).await;

    // Step 3: Worker A stores the result
    println!("  → Worker A: Storing analysis result");
    sleep(Duration::from_millis(50)).await;

    println!("\nCollaboration complete!");
    println!("Result: {} successfully processed", analysis);

    Ok(())
}

/// Consensus Pattern Example
///
/// Demonstrates consensus-based decision making where multiple agents
/// must agree on an outcome.
async fn consensus_example() -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating consensus agents...");

    let agent_configs = vec![
        ("D1", "deepseek-chat"),
        ("D2", "gpt-4"),
        ("D3", "claude-3"),
    ];

    let mut agents = Vec::new();
    for (cell_ref, model) in agent_configs {
        let id = Uuid::new_v4().to_string();
        let config = AgentConfig {
            id: id.clone(),
            cell_ref: cell_ref.to_string(),
            model: model.to_string(),
            equipment: vec![EquipmentSlot::Consensus],
            config: HashMap::new(),
        };
        let agent = MinimalAgent::new(config);
        println!("  → Agent {} ({})", get_agent_id(&agent), model);
        agents.push(agent);
    }

    // Agents vote on a decision
    let decision_topic = "Should we increase production?";
    println!("\nDecision topic: '{}'", decision_topic);

    let mut votes = Vec::new();
    for (i, agent) in agents.iter().enumerate() {
        let vote = simulate_agent_vote(agent, decision_topic, i).await?;
        let agent_id = get_agent_id(agent);
        println!("  → Agent {}: {}", agent_id, vote);
        votes.push(vote);
    }

    // Calculate consensus
    println!("\nCalculating consensus...");
    let consensus = calculate_consensus(&votes);
    println!("Consensus decision: {}", consensus);

    // Calculate agreement percentage
    let agree_count = votes.iter().filter(|v| **v == consensus).count();
    let agreement_pct = (agree_count as f64 / votes.len() as f64) * 100.0;
    println!("Agreement: {}/{} ({:.1}%)", agree_count, votes.len(), agreement_pct);

    Ok(())
}

/// Peer Coordination Example
///
/// Demonstrates peer-to-peer coordination where agents
/// communicate directly without a central coordinator.
async fn peer_coordination_example() -> Result<(), Box<dyn std::error::Error>> {
    println!("Creating peer agents...");

    let mut peers = Vec::new();
    for i in 0..4 {
        let id = Uuid::new_v4().to_string();
        let config = AgentConfig {
            id: id.clone(),
            cell_ref: format!("E{}", i + 1),
            model: "deepseek-chat".to_string(),
            equipment: vec![],
            config: HashMap::new(),
        };
        let agent = MinimalAgent::new(config);
        println!("  → Peer {}: {}", i, get_agent_id(&agent));
        peers.push(agent);
    }

    println!("\nSimulating peer-to-peer communication...");

    // Simulate peer message passing
    let message = "Coordinate task allocation";
    println!("Initial message: '{}'", message);

    for (i, peer) in peers.iter().enumerate() {
        let response = format!("Peer {} received: {}", i, message);
        println!("  → {}: {}", get_agent_id(peer), response);
        sleep(Duration::from_millis(25)).await;
    }

    println!("\nPeer coordination complete!");

    Ok(())
}

// Helper functions

/// Create a slave agent
async fn create_slave(cell_ref: String) -> Result<String, Box<dyn std::error::Error>> {
    let id = Uuid::new_v4().to_string();
    let config = AgentConfig {
        id: id.clone(),
        cell_ref,
        model: "deepseek-chat".to_string(),
        equipment: vec![],
        config: HashMap::new(),
    };
    let _slave = MinimalAgent::new(config);
    Ok(id)
}

/// Simulate slave agent work
async fn simulate_slave_work(task: &str) -> Result<String, Box<dyn std::error::Error>> {
    sleep(Duration::from_millis(100)).await;
    Ok(format!("Processed: {}", task))
}

/// Aggregate results from multiple slaves
fn aggregate_results(results: &[String]) -> String {
    format!(
        "Aggregated {} results: {}",
        results.len(),
        results.join(", ")
    )
}

/// Simulate agent voting
async fn simulate_agent_vote(
    _agent: &MinimalAgent,
    _topic: &str,
    index: usize,
) -> Result<String, Box<dyn std::error::Error>> {
    sleep(Duration::from_millis(50)).await;

    // Simulate different agents having different opinions
    let vote = match index {
        0 => "Yes",
        1 => "Yes",
        2 => "No", // One dissenting opinion
        _ => "Abstain",
    };

    Ok(vote.to_string())
}

/// Calculate consensus from votes
fn calculate_consensus(votes: &[String]) -> String {
    // Count votes
    let mut vote_counts = HashMap::new();
    for vote in votes {
        *vote_counts.entry(vote.clone()).or_insert(0) += 1;
    }

    // Find majority
    vote_counts
        .into_iter()
        .max_by_key(|(_, count)| *count)
        .map(|(vote, _)| vote)
        .unwrap_or_else(|| "No consensus".to_string())
}

/// Helper function to get agent ID
fn get_agent_id(agent: &MinimalAgent) -> String {
    agent.id().to_owned()
}

/// Helper function to get master agent ID
fn master_agent_id(agent: &MinimalAgent) -> String {
    agent.id().to_owned()
}
