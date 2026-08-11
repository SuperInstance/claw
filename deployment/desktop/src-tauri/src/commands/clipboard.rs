use tauri::command;

#[command]
pub async fn read_clipboard() -> Result<String, String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    let clipboard = tauri_plugin_clipboard_manager::ClipboardManager::new();
    clipboard.read_text()
        .map_err(|e| format!("Failed to read clipboard: {}", e))?
        .ok_or_else(|| "Clipboard is empty".to_string())
}

#[command]
pub async fn write_clipboard(text: String) -> Result<(), String> {
    use tauri_plugin_clipboard_manager::ClipboardExt;

    let clipboard = tauri_plugin_clipboard_manager::ClipboardManager::new();
    clipboard.write_text(&text)
        .map_err(|e| format!("Failed to write clipboard: {}", e))
}
