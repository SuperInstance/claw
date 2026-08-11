use notify::{recommended_watcher, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{async_runtime::Mutex, AppHandle, Emitter};
use tokio::sync::mpsc;

pub struct FileWatcher {
    _watcher: RecommendedWatcher,
}

impl FileWatcher {
    pub fn new(app_handle: AppHandle) -> Result<Self, notify::Error> {
        let (tx, mut rx) = mpsc::unbounded_channel();

        let watcher = recommended_watcher(move |res: Result<Event, _>| {
            if let Ok(event) = res {
                if let Err(e) = tx.send(event) {
                    eprintln!("Failed to send file event: {}", e);
                }
            }
        })?;

        // Start event handler
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                if matches!(
                    event.kind,
                    EventKind::Create(_) | EventKind::Modify(_) | EventKind::Remove(_)
                ) {
                    let paths: Vec<String> = event.paths.iter()
                        .map(|p| p.to_string_lossy().to_string())
                        .collect();

                    if let Err(e) = app_handle.emit("file-change", paths) {
                        eprintln!("Failed to emit file event: {}", e);
                    }
                }
            }
        });

        Ok(Self { _watcher: watcher })
    }
}

pub fn setup_file_watcher(app_handle: AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // This is a placeholder - actual file watching would be configured based on user preferences
    Ok(())
}
