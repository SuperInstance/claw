use tauri::command;

#[command]
pub async fn check_updates() -> Result<String, String> {
    // This will be handled by the Tauri updater plugin
    Ok("Checking for updates...")
}
