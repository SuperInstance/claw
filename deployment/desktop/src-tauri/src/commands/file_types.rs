use crate::utils::csv;
use crate::utils::excel;
use tauri::command;

#[command]
pub async fn parse_csv(path: String) -> Result<Vec<Vec<String>>, String> {
    csv::parse_csv_file(&path)
}

#[command]
pub async fn parse_excel(path: String) -> Result<Vec<Vec<String>>, String> {
    excel::parse_excel_file(&path)
}

#[command]
pub async fn export_csv(path: String, data: Vec<Vec<String>>) -> Result<(), String> {
    csv::write_csv_file(&path, &data)
}

#[command]
pub async fn export_excel(
    path: String,
    sheets: Vec<(String, Vec<Vec<String>>)>,
) -> Result<(), String> {
    excel::write_excel_file(&path, &sheets)
}
