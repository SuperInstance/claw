use std::fs::File;
use std::io::{BufRead, BufReader, Write};
use std::path::Path;

pub fn parse_csv_file(path: &str) -> Result<Vec<Vec<String>>, String> {
    let file = File::open(path)
        .map_err(|e| format!("Failed to open file: {}", e))?;

    let reader = BufReader::new(file);
    let mut rows = Vec::new();

    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read line: {}", e))?;

        // Simple CSV parsing (for production, use csv crate)
        let row: Vec<String> = line
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();

        rows.push(row);
    }

    Ok(rows)
}

pub fn write_csv_file(path: &str, data: &[Vec<String>]) -> Result<(), String> {
    let mut file = File::create(path)
        .map_err(|e| format!("Failed to create file: {}", e))?;

    for row in data {
        let line = row.join(",");
        writeln!(file, "{}", line)
            .map_err(|e| format!("Failed to write line: {}", e))?;
    }

    Ok(())
}
