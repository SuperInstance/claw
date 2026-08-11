use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePool, Row};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Document {
    pub id: String,
    pub name: String,
    pub content: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
    pub metadata: Option<String>,
}

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(path: PathBuf) -> Result<Self, sqlx::Error> {
        // Ensure parent directory exists
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let pool = SqlitePool::connect(&format!("sqlite:{}", path.display())).await?;

        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                metadata TEXT
            )
            "#,
        )
        .execute(&pool)
        .await?;

        Ok(Self { pool })
    }

    pub async fn save_document(&self, doc: &Document) -> Result<(), sqlx::Error> {
        sqlx::query(
            r#"
            INSERT INTO documents (id, name, content, created_at, updated_at, metadata)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            ON CONFLICT(id) DO UPDATE SET
                name = ?2,
                content = ?3,
                updated_at = ?5,
                metadata = ?6
            "#,
        )
        .bind(&doc.id)
        .bind(&doc.name)
        .bind(&doc.content)
        .bind(doc.created_at.to_rfc3339())
        .bind(doc.updated_at.to_rfc3339())
        .bind(&doc.metadata)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn load_document(&self, id: &str) -> Result<Document, sqlx::Error> {
        let row = sqlx::query("SELECT * FROM documents WHERE id = ?1")
            .bind(id)
            .fetch_one(&self.pool)
            .await?;

        Ok(Document {
            id: row.get("id"),
            name: row.get("name"),
            content: row.get("content"),
            created_at: chrono::DateTime::parse_from_rfc3339(row.get("created_at"))
                .unwrap()
                .with_timezone(&chrono::Utc),
            updated_at: chrono::DateTime::parse_from_rfc3339(row.get("updated_at"))
                .unwrap()
                .with_timezone(&chrono::Utc),
            metadata: row.get("metadata"),
        })
    }

    pub async fn list_documents(&self) -> Result<Vec<Document>, sqlx::Error> {
        let rows = sqlx::query("SELECT * FROM documents ORDER BY updated_at DESC")
            .fetch_all(&self.pool)
            .await?;

        rows.iter()
            .map(|row| {
                Ok(Document {
                    id: row.get("id"),
                    name: row.get("name"),
                    content: row.get("content"),
                    created_at: chrono::DateTime::parse_from_rfc3339(row.get("created_at"))
                        .unwrap()
                        .with_timezone(&chrono::Utc),
                    updated_at: chrono::DateTime::parse_from_rfc3339(row.get("updated_at"))
                        .unwrap()
                        .with_timezone(&chrono::Utc),
                    metadata: row.get("metadata"),
                })
            })
            .collect()
    }

    pub async fn delete_document(&self, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM documents WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}
