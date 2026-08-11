use tauri::command;
use tauri::Manager;

#[command]
pub async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize()
        .map_err(|e| format!("Failed to minimize window: {}", e))
}

#[command]
pub async fn maximize_window(window: tauri::Window) -> Result<(), String> {
    if window.is_maximized().unwrap() {
        window.unmaximize()
            .map_err(|e| format!("Failed to unmaximize window: {}", e))
    } else {
        window.maximize()
            .map_err(|e| format!("Failed to maximize window: {}", e))
    }
}

#[command]
pub async fn close_window(window: tauri::Window) -> Result<(), String> {
    window.hide()
        .map_err(|e| format!("Failed to hide window: {}", e))
}
