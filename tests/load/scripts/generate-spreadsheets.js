#!/usr/bin/env node

/**
 * Generate test spreadsheet data for load testing
 * Creates realistic spreadsheet structures with cells, formulas, and metadata
 */

const fs = require('fs');
const path = require('path');

const SPREADSHEET_COUNT = 1000;
const OUTPUT_FILE = path.join(__dirname, '../data/test-spreadsheets.json');

function generateSpreadsheets() {
  console.log(`Generating ${SPREADSHEET_COUNT} test spreadsheets...`);

  const spreadsheets = [];
  const templates = [
    { name: 'Budget', rows: 50, cols: 10 },
    { name: 'Project Plan', rows: 100, cols: 15 },
    { name: 'Sales Data', rows: 200, cols: 20 },
    { name: 'Inventory', rows: 150, cols: 12 },
    { name: 'Employee List', rows: 100, cols: 10 },
    { name: 'Financial Report', rows: 75, cols: 25 },
    { name: 'Dashboard', rows: 30, cols: 30 },
  ];

  for (let i = 1; i <= SPREADSHEET_COUNT; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const spreadsheet = {
      id: `spreadsheet-${i}`,
      name: `${template.name} ${i}`,
      description: `Test ${template.name.toLowerCase()} spreadsheet #${i}`,
      rows: template.rows,
      cols: template.cols,
      owner: `user-${Math.floor(Math.random() * 1000) + 1}`,
      collaborators: generateCollaborators(),
      cells: generateCells(template.rows, template.cols),
      formulas: generateFormulas(template.rows, template.cols),
      charts: generateCharts(),
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      version: Math.floor(Math.random() * 100) + 1,
      settings: {
        protected: Math.random() > 0.8,
        frozenRows: Math.floor(Math.random() * 3),
        frozenCols: Math.floor(Math.random() * 2),
        autoRecalc: true,
      },
    };

    spreadsheets.push(spreadsheet);

    if (i % 100 === 0) {
      console.log(`Generated ${i} spreadsheets...`);
    }
  }

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(spreadsheets, null, 2));
  console.log(`✓ Generated ${SPREADSHEET_COUNT} test spreadsheets`);
  console.log(`✓ Saved to ${OUTPUT_FILE}`);
}

function generateCollaborators() {
  const count = Math.floor(Math.random() * 10);
  const collaborators = [];
  const roles = ['viewer', 'editor', 'commenter'];

  for (let i = 0; i < count; i++) {
    collaborators.push({
      userId: `user-${Math.floor(Math.random() * 10000) + 1}`,
      role: roles[Math.floor(Math.random() * roles.length)],
      invitedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return collaborators;
}

function generateCells(rows, cols) {
  const cells = {};
  const cellCount = Math.floor(rows * cols * 0.3); // 30% of cells have data

  for (let i = 0; i < cellCount; i++) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    const key = `${String.fromCharCode(65 + (col % 26))}${row + 1}`;

    cells[key] = {
      row,
      col,
      value: generateCellValue(),
      formula: null,
      format: generateCellFormat(),
      style: generateCellStyle(),
    };
  }

  return cells;
}

function generateCellValue() {
  const types = ['number', 'text', 'date', 'boolean', 'currency', 'percentage'];
  const type = types[Math.floor(Math.random() * types.length)];

  switch (type) {
    case 'number':
      return Math.random() * 10000;
    case 'text':
      return `Sample text ${Math.floor(Math.random() * 1000)}`;
    case 'date':
      return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    case 'boolean':
      return Math.random() > 0.5;
    case 'currency':
      return (Math.random() * 10000).toFixed(2);
    case 'percentage':
      return (Math.random() * 100).toFixed(1) + '%';
    default:
      return '';
  }
}

function generateCellFormat() {
  const formats = ['general', 'number', 'currency', 'percentage', 'date', 'text'];
  return formats[Math.floor(Math.random() * formats.length)];
}

function generateCellStyle() {
  return {
    bold: Math.random() > 0.8,
    italic: Math.random() > 0.9,
    underline: Math.random() > 0.95,
    backgroundColor: Math.random() > 0.9 ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : null,
    color: Math.random() > 0.9 ? `#${Math.floor(Math.random() * 16777215).toString(16)}` : null,
    fontSize: Math.random() > 0.8 ? 12 + Math.floor(Math.random() * 4) : 11,
  };
}

function generateFormulas(rows, cols) {
  const formulas = [];
  const formulaCount = Math.floor(Math.random() * 20);
  const formulaTypes = ['SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'VLOOKUP', 'IF'];

  for (let i = 0; i < formulaCount; i++) {
    const type = formulaTypes[Math.floor(Math.random() * formulaTypes.length)];
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);

    formulas.push({
      cell: `${String.fromCharCode(65 + (col % 26))}${row + 1}`,
      formula: generateFormula(type, row, col),
      dependsOn: generateDependentCells(row, col),
    });
  }

  return formulas;
}

function generateFormula(type, row, col) {
  switch (type) {
    case 'SUM':
      return `=SUM(A${row + 1}:${String.fromCharCode(65 + col)}${row + 1})`;
    case 'AVERAGE':
      return `=AVERAGE(A${row + 1}:${String.fromCharCode(65 + col)}${row + 1})`;
    case 'COUNT':
      return `=COUNT(A${row + 1}:${String.fromCharCode(65 + col)}${row + 1})`;
    case 'MAX':
      return `=MAX(A${row + 1}:${String.fromCharCode(65 + col)}${row + 1})`;
    case 'MIN':
      return `=MIN(A${row + 1}:${String.fromCharCode(65 + col)}${row + 1})`;
    case 'IF':
      return `=IF(A${row + 1}>100,"High","Low")`;
    case 'VLOOKUP':
      return `=VLOOKUP(A${row + 1},B${row + 1}:${String.fromCharCode(65 + col)}${row + 10},2,FALSE)`;
    default:
      return `=SUM(A${row + 1}:${String.fromCharCode(65 + col)}${row + 1})`;
  }
}

function generateDependentCells(row, col) {
  const count = Math.floor(Math.random() * 5);
  const cells = [];

  for (let i = 0; i < count; i++) {
    cells.push({
      row: Math.floor(Math.random() * row),
      col: Math.floor(Math.random() * col),
    });
  }

  return cells;
}

function generateCharts() {
  const charts = [];
  const chartCount = Math.floor(Math.random() * 3);
  const chartTypes = ['line', 'bar', 'pie', 'scatter', 'area'];

  for (let i = 0; i < chartCount; i++) {
    charts.push({
      id: `chart-${i + 1}`,
      type: chartTypes[Math.floor(Math.random() * chartTypes.length)],
      title: `Chart ${i + 1}`,
      dataRange: `A1:${String.fromCharCode(65 + Math.floor(Math.random() * 10) + 5)}${Math.floor(Math.random() * 20) + 10}`,
      position: {
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 20),
        width: 5 + Math.floor(Math.random() * 5),
        height: 5 + Math.floor(Math.random() * 5),
      },
    });
  }

  return charts;
}

// Run if called directly
if (require.main === module) {
  generateSpreadsheets();
}

module.exports = { generateSpreadsheets };
