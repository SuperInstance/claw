use crate::database::{Document, Database};
use crate::AppState;
use serde_json::Value;
use std::sync::Arc;
use tauri::command;
use tauri::State;

#[command]
pub async fn save_document(
    state: State<'_, AppState>,
    id: String,
    name: String,
    content: Value,
    metadata: Option<Value>,
) -> Result<String, String> {
    let db = state.db.lock().await;
    let doc = Document {
        id: id.clone(),
        name,
        content: serde_json::to_string(&content)
            .map_err(|e| format!("Failed to serialize content: {}", e))?,
        created_at: chrono::Utc::now(),
        updated_at: chrono::Utc::now(),
        metadata: metadata.map(|m| serde_json::to_string(&m)).transpose()
            .map_err(|e| format!("Failed to serialize metadata: {}", e))?,
    };
    db.save_document(&doc).await
        .map_err(|e| format!("Failed to save document: {}", e))?;
    Ok(id)
}

#[command]
pub async fn load_document(
    state: State<'_, AppState>,
    id: String,
) -> Result<Document, String> {
    let db = state.db.lock().await;
    db.load_document(&id).await
        .map_err(|e| format!("Failed to load document: {}", e))
}

#[command]
pub async fn list_documents(
    state: State<'_, AppState>,
) -> Result<Vec<Document>, String> {
    let db = state.db.lock().await;
    db.list_documents().await
        .map_err(|e| format!("Failed to list documents: {}", e))
}

#[command]
pub async fn delete_document(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let db = state.db.lock().await;
    db.delete_document(&id).await
        .map_err(|e| format!("Failed to delete document: {}", e))
}
