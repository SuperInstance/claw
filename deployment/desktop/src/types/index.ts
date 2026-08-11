export interface Document {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
  metadata?: string;
}

export interface Cell {
  id: string;
  row: number;
  col: number;
  value: string;
  formula?: string;
  type: 'value' | 'formula' | 'agent';
  dependencies?: string[];
}

export interface SpreadsheetData {
  id: string;
  name: string;
  cells: Map<string, Cell>;
  metadata?: {
    rows: number;
    cols: number;
    created: string;
    modified: string;
  };
}

export interface SystemInfo {
  os: string;
  arch: string;
  version: string;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
}

export interface FileAssociation {
  extension: string;
  mimeType: string;
  handler: (file: File) => void;
}
