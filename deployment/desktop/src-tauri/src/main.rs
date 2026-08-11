// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod file_watcher;
mod notifications;
mod updater;
mod utils;

use database::Database;
use std::sync::Arc;
use tauri::{
    async_runtime::Mutex, CustomMenuItem, Manager, State, SystemTray, SystemTrayEvent,
    SystemTrayMenu, SystemTrayMenuItem, WindowEvent,
};

#[derive(Debug)]
pub struct AppState {
    pub db: Arc<Mutex<Database>>,
}

fn main() {
    // Create system tray menu
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Initialize database
            let db = Database::new(
                app.path_resolver()
                    .app_data_dir()
                    .expect("Failed to get app data dir")
                    .join("spreadsheet-moment.db"),
            )?;

            app.manage(AppState {
                db: Arc::new(Mutex::new(db)),
            });

            // Setup file watcher
            let app_handle = app.handle().clone();
            file_watcher::setup_file_watcher(app_handle)?;

            // Setup window event listeners
            let main_window = app.get_window("main").unwrap();

            // Handle window close event
            let window = main_window.clone();
            main_window.on_window_event(move |event| match event {
                WindowEvent::CloseRequested { api, .. } => {
                    // Prevent window from closing, hide it instead
                    window.hide().unwrap();
                    api.prevent_close();
                }
                _ => {}
            });

            // Check for updates on startup
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = updater::check_for_updates(app_handle).await {
                    eprintln!("Failed to check for updates: {}", e);
                }
            });

            Ok(())
        })
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "hide" => {
                    app.get_window("main").unwrap().hide().unwrap();
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::fs::read_file,
            commands::fs::write_file,
            commands::fs::read_dir,
            commands::fs::create_dir,
            commands::fs::delete_file,
            commands::fs::delete_dir,
            commands::file_types::parse_csv,
            commands::file_types::parse_excel,
            commands::file_types::export_csv,
            commands::file_types::export_excel,
            commands::database::save_document,
            commands::database::load_document,
            commands::database::list_documents,
            commands::database::delete_document,
            commands::notifications::send_notification,
            commands::updater::check_updates,
            commands::system::get_app_version,
            commands::system::get_system_info,
            commands::window::minimize_window,
            commands::window::maximize_window,
            commands::window::close_window,
            commands::clipboard::read_clipboard,
            commands::clipboard::write_clipboard,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
