use tauri::AppHandle;

pub fn show_notification(
    app_handle: &AppHandle,
    title: &str,
    body: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    use tauri_plugin_notification::NotificationExt;

    tauri_plugin_notification::Notification::new()
        .title(title)
        .body(body)
        .show()?;

    Ok(())
}
