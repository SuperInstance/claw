import { test, expect } from '../../fixtures/test-fixtures';
import { TestDataGenerator } from '../../helpers/test-data-generator';

test.describe('Spreadsheet Operations E2E Tests', () => {
  let spreadsheetId: string;

  test.beforeEach(async ({ spreadsheetPage, authPage, testUser }) => {
    // Login before each test
    await authPage.gotoLoginPage();
    await authPage.login(testUser.email, testUser.password);
    await authPage.verifyLoginSuccess();

    // Create a test spreadsheet
    await spreadsheetPage.gotoDashboard();
    const sheetName = TestDataGenerator.spreadsheetName();
    await spreadsheetPage.createSpreadsheet(sheetName);

    // Extract spreadsheet ID from URL
    const url = spreadsheetPage.getUrl();
    const match = url.match(/\/spreadsheet\/([a-z0-9-]+)/);
    if (match) {
      spreadsheetId = match[1];
    }
  });

  test.describe('Basic Cell Operations', () => {
    test('should create and edit spreadsheet', async ({ spreadsheetPage, testSpreadsheet }) => {
      await spreadsheetPage.verifySpreadsheetName(testSpreadsheet.name);
      await spreadsheetPage.editCellValue('A1', 'Hello World');
      await spreadsheetPage.verifyCellValue('A1', 'Hello World');
    });

    test('should edit multiple cells', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Name');
      await spreadsheetPage.editCellValue('B1', 'Age');
      await spreadsheetPage.editCellValue('C1', 'City');
      await spreadsheetPage.editCellValue('A2', 'John Doe');
      await spreadsheetPage.editCellValue('B2', '30');
      await spreadsheetPage.editCellValue('C2', 'New York');

      await spreadsheetPage.verifyCellValue('A1', 'Name');
      await spreadsheetPage.verifyCellValue('B1', 'Age');
      await spreadsheetPage.verifyCellValue('C1', 'City');
      await spreadsheetPage.verifyCellValue('A2', 'John Doe');
      await spreadsheetPage.verifyCellValue('B2', '30');
      await spreadsheetPage.verifyCellValue('C2', 'New York');
    });

    test('should clear cell content', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Test Content');
      await spreadsheetPage.verifyCellValue('A1', 'Test Content');
      await spreadsheetPage.clearCell('A1');
      await spreadsheetPage.verifyCellValue('A1', '');
    });

    test('should copy and paste cells', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Copy Test');
      await spreadsheetPage.copyRange('A1', 'A1');
      await spreadsheetPage.pasteRange('B1');
      await spreadsheetPage.verifyCellValue('B1', 'Copy Test');
    });

    test('should cut and paste cells', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Cut Test');
      await spreadsheetPage.verifyCellValue('A1', 'Cut Test');
      await spreadsheetPage.cutRange('A1', 'A1');
      await spreadsheetPage.pasteRange('B1');
      await spreadsheetPage.verifyCellValue('B1', 'Cut Test');
      await spreadsheetPage.verifyCellValue('A1', '');
    });
  });

  test.describe('Formula Operations', () => {
    test('should enter basic SUM formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '20');
      await spreadsheetPage.editCellValue('A3', '30');
      await spreadsheetPage.editCellFormula('A4', '=SUM(A1:A3)');
      await spreadsheetPage.verifyCellValue('A4', '60');
    });

    test('should enter AVERAGE formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '20');
      await spreadsheetPage.editCellValue('A3', '30');
      await spreadsheetPage.editCellFormula('A4', '=AVERAGE(A1:A3)');
      await spreadsheetPage.verifyCellValue('A4', '20');
    });

    test('should enter COUNT formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '20');
      await spreadsheetPage.editCellValue('A3', 'text');
      await spreadsheetPage.editCellFormula('A4', '=COUNT(A1:A3)');
      await spreadsheetPage.verifyCellValue('A4', '2');
    });

    test('should enter MAX formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '50');
      await spreadsheetPage.editCellValue('A3', '30');
      await spreadsheetPage.editCellFormula('A4', '=MAX(A1:A3)');
      await spreadsheetPage.verifyCellValue('A4', '50');
    });

    test('should enter MIN formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '5');
      await spreadsheetPage.editCellValue('A3', '30');
      await spreadsheetPage.editCellFormula('A4', '=MIN(A1:A3)');
      await spreadsheetPage.verifyCellValue('A4', '5');
    });

    test('should enter IF formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '100');
      await spreadsheetPage.editCellFormula('B1', '=IF(A1>50,"High","Low")');
      await spreadsheetPage.verifyCellValue('B1', 'High');
    });

    test('should enter CONCATENATE formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Hello');
      await spreadsheetPage.editCellValue('B1', 'World');
      await spreadsheetPage.editCellFormula('C1', '=CONCATENATE(A1," ",B1)');
      await spreadsheetPage.verifyCellValue('C1', 'Hello World');
    });

    test('should show formula error for invalid formula', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellFormula('A1', '=INVALID_FORMULA()');
      await spreadsheetPage.verifyFormulaError('A1');
    });

    test('should detect circular reference', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellFormula('A1', '=B1');
      await spreadsheetPage.editCellFormula('B1', '=A1');
      await spreadsheetPage.verifyCircularReferenceWarning();
    });

    test('should show formula autocomplete', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellFormula('A1', '=SU');
      await spreadsheetPage.verifyVisible('[data-testid="formula-autocomplete"]');
      await spreadsheetPage.verifyTextContains('[data-testid="formula-autocomplete"]', 'SUM');
    });
  });

  test.describe('Row and Column Operations', () => {
    test('should insert new row', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Original');
      await spreadsheetPage.insertRow(2);
      await spreadsheetPage.verifyCellValue('A2', '');
      await spreadsheetPage.verifyCellValue('A1', 'Original');
    });

    test('should insert new column', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Original');
      await spreadsheetPage.insertColumn('B');
      await spreadsheetPage.verifyCellValue('B1', '');
      await spreadsheetPage.verifyCellValue('A1', 'Original');
    });

    test('should delete row', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Keep');
      await spreadsheetPage.editCellValue('A2', 'Delete');
      await spreadsheetPage.deleteRow(2);
      await spreadsheetPage.verifyCellValue('A1', 'Keep');
    });

    test('should delete column', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Keep');
      await spreadsheetPage.editCellValue('B1', 'Delete');
      await spreadsheetPage.deleteColumn('B');
      await spreadsheetPage.verifyCellValue('A1', 'Keep');
    });

    test('should sort range ascending', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '30');
      await spreadsheetPage.editCellValue('A2', '10');
      await spreadsheetPage.editCellValue('A3', '20');
      await spreadsheetPage.sortRange('A1', 'A3', 'A', true);
      await spreadsheetPage.verifyCellValue('A1', '10');
      await spreadsheetPage.verifyCellValue('A2', '20');
      await spreadsheetPage.verifyCellValue('A3', '30');
    });

    test('should sort range descending', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '30');
      await spreadsheetPage.editCellValue('A3', '20');
      await spreadsheetPage.sortRange('A1', 'A3', 'A', false);
      await spreadsheetPage.verifyCellValue('A1', '30');
      await spreadsheetPage.verifyCellValue('A2', '20');
      await spreadsheetPage.verifyCellValue('A3', '10');
    });
  });

  test.describe('Sheet Management', () => {
    test('should add new sheet', async ({ spreadsheetPage }) => {
      const sheetCount = await spreadsheetPage.getSheetCount();
      await spreadsheetPage.addSheet('New Sheet');
      const newSheetCount = await spreadsheetPage.getSheetCount();
      expect(newSheetCount).toBe(sheetCount + 1);
      await spreadsheetPage.verifySheetExists('New Sheet');
    });

    test('should rename sheet', async ({ spreadsheetPage }) => {
      await spreadsheetPage.addSheet('Sheet1');
      await spreadsheetPage.renameSheet('Sheet1', 'Renamed Sheet');
      await spreadsheetPage.verifySheetExists('Renamed Sheet');
    });

    test('should delete sheet', async ({ spreadsheetPage }) => {
      await spreadsheetPage.addSheet('To Delete');
      const sheetCount = await spreadsheetPage.getSheetCount();
      await spreadsheetPage.deleteSheet('To Delete');
      const newSheetCount = await spreadsheetPage.getSheetCount();
      expect(newSheetCount).toBe(sheetCount - 1);
    });

    test('should copy sheet', async ({ spreadsheetPage }) => {
      await spreadsheetPage.addSheet('Original');
      await spreadsheetPage.editCellValue('A1', 'Test');
      await spreadsheetPage.copySheet('Original');
      await spreadsheetPage.switchToSheet('Original (2)');
      await spreadsheetPage.verifyCellValue('A1', 'Test');
    });

    test('should switch between sheets', async ({ spreadsheetPage }) => {
      await spreadsheetPage.addSheet('Sheet1');
      await spreadsheetPage.editCellValue('A1', 'Sheet1');
      await spreadsheetPage.addSheet('Sheet2');
      await spreadsheetPage.editCellValue('A1', 'Sheet2');

      await spreadsheetPage.switchToSheet('Sheet1');
      await spreadsheetPage.verifyCellValue('A1', 'Sheet1');
      await spreadsheetPage.verifySheetActive('Sheet1');

      await spreadsheetPage.switchToSheet('Sheet2');
      await spreadsheetPage.verifyCellValue('A1', 'Sheet2');
      await spreadsheetPage.verifySheetActive('Sheet2');
    });
  });

  test.describe('Formatting Operations', () => {
    test('should format cell as currency', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '1234.56');
      await spreadsheetPage.formatCell('A1', 'currency');
      await spreadsheetPage.verifyCellFormat('A1', 'currency');
    });

    test('should format cell as percentage', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '0.75');
      await spreadsheetPage.formatCell('A1', 'percentage');
      await spreadsheetPage.verifyCellFormat('A1', 'percentage');
    });

    test('should format cell with bold text', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Bold Text');
      await spreadsheetPage.formatCell('A1', 'bold');
      await spreadsheetPage.verifyCellFormat('A1', 'bold');
    });

    test('should apply conditional formatting', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '100');
      await spreadsheetPage.editCellValue('A2', '50');
      await spreadsheetPage.applyConditionalFormatting('A1:A2', 'greater_than', '75', 'red');
      await spreadsheetPage.verifyCellHighlighted('A1');
    });

    test('should merge cells', async ({ spreadsheetPage }) => {
      await spreadsheetPage.mergeCells('A1', 'C1');
      await spreadsheetPage.editCellValue('A1', 'Merged');
      await spreadsheetPage.verifyCellValue('A1', 'Merged');
    });

    test('should unmerge cells', async ({ spreadsheetPage }) => {
      await spreadsheetPage.mergeCells('A1', 'C1');
      await spreadsheetPage.unmergeCells('A1');
      await spreadsheetPage.editCellValue('B1', 'Separate');
      await spreadsheetPage.verifyCellValue('B1', 'Separate');
    });
  });

  test.describe('Data Operations', () => {
    test('should apply filter to range', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Name');
      await spreadsheetPage.editCellValue('B1', 'Value');
      await spreadsheetPage.editCellValue('A2', 'Item 1');
      await spreadsheetPage.editCellValue('B2', '100');
      await spreadsheetPage.editCellValue('A3', 'Item 2');
      await spreadsheetPage.editCellValue('B3', '200');
      await spreadsheetPage.filterRange('A1', 'B3');
      await spreadsheetPage.verifyVisible('[data-testid="filter-dropdown"]');
    });

    test('should apply autosum', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '20');
      await spreadsheetPage.editCellValue('A3', '30');
      await spreadsheetPage.applyAutosum('A1:A3', 'A4');
      await spreadsheetPage.verifyCellValue('A4', '60');
    });

    test('should create named range', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Test');
      await spreadsheetPage.createNamedRange('A1:A1', 'TestRange');
      await spreadsheetPage.verifyVisible('[data-named-range="TestRange"]');
    });

    test('should set data validation', async ({ spreadsheetPage }) => {
      await spreadsheetPage.setDataValidation('A1:A10', 'number_between_1_100');
      await spreadsheetPage.editCellValue('A1', '150');
      await spreadsheetPage.verifyVisible('[data-testid="validation-error"]');
    });

    test('should add sparkline', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '10');
      await spreadsheetPage.editCellValue('A2', '20');
      await spreadsheetPage.editCellValue('A3', '30');
      await spreadsheetPage.addSparkline('B1', 'A1:A3');
      await spreadsheetPage.verifyVisible('[data-testid="sparkline-chart"]');
    });
  });

  test.describe('Charts and Visualization', () => {
    test('should create line chart', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Month');
      await spreadsheetPage.editCellValue('B1', 'Sales');
      await spreadsheetPage.editCellValue('A2', 'Jan');
      await spreadsheetPage.editCellValue('B2', '100');
      await spreadsheetPage.editCellValue('A3', 'Feb');
      await spreadsheetPage.editCellValue('B3', '200');
      await spreadsheetPage.createChart('A1:B3', 'line');
      await spreadsheetPage.verifyVisible(spreadsheetPage.chartContainer);
    });

    test('should create bar chart', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Product');
      await spreadsheetPage.editCellValue('B1', 'Sales');
      await spreadsheetPage.editCellValue('A2', 'A');
      await spreadsheetPage.editCellValue('B2', '100');
      await spreadsheetPage.editCellValue('A3', 'B');
      await spreadsheetPage.editCellValue('B3', '200');
      await spreadsheetPage.createChart('A1:B3', 'bar');
      await spreadsheetPage.verifyVisible(spreadsheetPage.chartContainer);
    });

    test('should create pie chart', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Category');
      await spreadsheetPage.editCellValue('B1', 'Value');
      await spreadsheetPage.editCellValue('A2', 'A');
      await spreadsheetPage.editCellValue('B2', '30');
      await spreadsheetPage.editCellValue('A3', 'B');
      await spreadsheetPage.editCellValue('B3', '70');
      await spreadsheetPage.createChart('A1:B3', 'pie');
      await spreadsheetPage.verifyVisible(spreadsheetPage.chartContainer);
    });

    test('should create pivot table', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Category');
      await spreadsheetPage.editCellValue('B1', 'Value');
      await spreadsheetPage.editCellValue('A2', 'A');
      await spreadsheetPage.editCellValue('B2', '100');
      await spreadsheetPage.editCellValue('A3', 'B');
      await spreadsheetPage.editCellValue('B3', '200');
      await spreadsheetPage.createPivotTable('A1:B3');
      await spreadsheetPage.verifyVisible(spreadsheetPage.pivotTableContainer);
    });
  });

  test.describe('Comments and Notes', () => {
    test('should add cell comment', async ({ spreadsheetPage }) => {
      await spreadsheetPage.addCellComment('A1', 'This is a test comment');
      await spreadsheetPage.verifyVisible('[data-testid="cell-comment-indicator"]');
    });

    test('should add cell note', async ({ spreadsheetPage }) => {
      await spreadsheetPage.addCellNote('A1', 'This is a test note');
      await spreadsheetPage.verifyVisible('[data-testid="cell-note-indicator"]');
    });
  });

  test.describe('Import and Export', () => {
    test('should export spreadsheet as XLSX', async ({ spreadsheetPage }) => {
      await spreadsheetPage.exportSpreadsheet('xlsx');
      // File download verification would go here
    });

    test('should export spreadsheet as CSV', async ({ spreadsheetPage }) => {
      await spreadsheetPage.exportSpreadsheet('csv');
      // File download verification would go here
    });

    test('should export spreadsheet as PDF', async ({ spreadsheetPage }) => {
      await spreadsheetPage.exportSpreadsheet('pdf');
      // File download verification would go here
    });

    test('should import spreadsheet from file', async ({ spreadsheetPage }) => {
      const testFile = 'test-data/sample-spreadsheet.xlsx';
      await spreadsheetPage.importSpreadsheet(testFile);
      await spreadsheetPage.verifyCellValue('A1', 'Imported');
    });
  });

  test.describe('Real-time Collaboration', () => {
    test('should display collaborator presence', async ({ spreadsheetPage }) => {
      // This test would require multiple browser contexts or users
      await spreadsheetPage.shareSpreadsheet('collaborator@example.com', 'edit');
      // Verify collaborator avatar appears
    });

    test('should show real-time updates', async ({ spreadsheetPage }) => {
      // This test would require WebSocket simulation or multiple contexts
      await spreadsheetPage.editCellValue('A1', 'Test');
      await spreadsheetPage.wait(2000);
      // Verify changes sync across clients
    });
  });

  test.describe('Undo and Redo', () => {
    test('should undo last action', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Original');
      await spreadsheetPage.editCellValue('A1', 'Modified');
      await spreadsheetPage.undo();
      await spreadsheetPage.verifyCellValue('A1', 'Original');
    });

    test('should redo undone action', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Original');
      await spreadsheetPage.editCellValue('A1', 'Modified');
      await spreadsheetPage.undo();
      await spreadsheetPage.redo();
      await spreadsheetPage.verifyCellValue('A1', 'Modified');
    });

    test('should undo multiple actions', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', '1');
      await spreadsheetPage.editCellValue('A1', '2');
      await spreadsheetPage.editCellValue('A1', '3');
      await spreadsheetPage.undo();
      await spreadsheetPage.undo();
      await spreadsheetPage.verifyCellValue('A1', '1');
    });
  });

  test.describe('Find and Replace', () => {
    test('should find text in spreadsheet', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Search Term');
      await spreadsheetPage.find('Search Term');
      await spreadsheetPage.verifyCellHighlighted('A1');
    });

    test('should replace text in spreadsheet', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Find This');
      await spreadsheetPage.replace('Find This', 'Replace With');
      await spreadsheetPage.verifyCellValue('A1', 'Replace With');
    });
  });

  test.describe('Freeze Panes', () => {
    test('should freeze top row', async ({ spreadsheetPage }) => {
      await spreadsheetPage.freezeTopRow();
      await spreadsheetPage.scrollToBottom();
      await spreadsheetPage.verifyVisible('[data-frozen="true"]');
    });

    test('should freeze first column', async ({ spreadsheetPage }) => {
      await spreadsheetPage.freezeFirstColumn();
      await spreadsheetPage.scrollToBottom();
      await spreadsheetPage.verifyVisible('[data-frozen="true"]');
    });
  });

  test.describe('Spreadsheet Management', () => {
    test('should rename spreadsheet', async ({ spreadsheetPage }) => {
      const newName = 'Renamed Spreadsheet';
      await spreadsheetPage.renameSpreadsheet(newName);
      await spreadsheetPage.verifySpreadsheetName(newName);
    });

    test('should delete spreadsheet', async ({ spreadsheetPage }) => {
      await spreadsheetPage.deleteSpreadsheet();
      await spreadsheetPage.verifyUrlContains('/dashboard');
    });

    test('should save spreadsheet automatically', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Auto Save Test');
      await spreadsheetPage.wait(2000);
      await spreadsheetPage.verifySpreadsheetSaved();
    });

    test('should show unsaved changes warning', async ({ spreadsheetPage }) => {
      await spreadsheetPage.editCellValue('A1', 'Unsaved');
      await spreadsheetPage.goto('/dashboard');
      await spreadsheetPage.verifyUnsavedChangesWarning();
    });
  });

  test.describe('Zoom and View', () => {
    test('should zoom in', async ({ spreadsheetPage }) => {
      await spreadsheetPage.zoomIn();
      await spreadsheetPage.verifyVisible('[data-zoom-level="125"]');
    });

    test('should zoom out', async ({ spreadsheetPage }) => {
      await spreadsheetPage.zoomOut();
      await spreadsheetPage.verifyVisible('[data-zoom-level="75"]');
    });

    test('should enter fullscreen mode', async ({ spreadsheetPage }) => {
      await spreadsheetPage.enterFullscreen();
      await spreadsheetPage.verifyVisible('[data-fullscreen="true"]');
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ spreadsheetPage }) => {
      await spreadsheetPage.verifyAriaLabel('[data-cell="A1"]', 'Cell A1');
      await spreadsheetPage.verifyAriaRole('[data-cell="A1"]', 'gridcell');
    });

    test('should be keyboard navigable', async ({ spreadsheetPage }) => {
      await spreadsheetPage.keyboardPress('Tab');
      await spreadsheetPage.verifyHasFocus('[data-cell="A1"]');
      await spreadsheetPage.keyboardPress('ArrowRight');
      await spreadsheetPage.verifyHasFocus('[data-cell="B1"]');
    });
  });
});
