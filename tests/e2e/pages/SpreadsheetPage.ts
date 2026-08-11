import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Spreadsheet Page Object Model
 * Handles all spreadsheet operations including creation, editing, formulas, and collaboration
 */
export class SpreadsheetPage extends BasePage {
  // Locators
  readonly createSpreadsheetButton: string;
  readonly spreadsheetNameInput: string;
  readonly saveButton: string;
  readonly cancelButton: string;
  readonly deleteButton: string;
  readonly renameButton: string;
  readonly shareButton: string;
  readonly exportButton: string;
  readonly importButton: string;
  readonly cell: string;
  readonly cellEditor: string;
  readonly formulaBar: string;
  readonly sheetTabs: string;
  readonly addSheetButton: string;
  readonly deleteSheetButton: string;
  readonly renameSheetButton: string;
  readonly copySheetButton: string;
  readonly toolbar: string;
  readonly formatButton: string;
  readonly chartButton: string;
  readonly pivotTableButton: string;
  readonly filterButton: string;
  readonly sortButton: string;
  readonly collaboratorsList: string;
  readonly addCollaboratorButton: string;
  readonly collaboratorEmailInput: string;
  readonly collaboratorPermissionSelect: string;
  readonly cellContextMenu: string;
  readonly rowContextMenu: string;
  readonly columnContextMenu: string;
  readonly insertRowButton: string;
  readonly insertColumnButton: string;
  readonly deleteRowButton: string;
  readonly deleteColumnButton: string;
  readonly mergeCellsButton: string;
  readonly unmergeCellsButton: string;
  readonly freezePanesButton: string;
  readonly freezeTopRowButton: string;
  readonly freezeFirstColumnButton: string;
  readonly undoButton: string;
  readonly redoButton: string;
  readonly findButton: string;
  readonly replaceButton: string;
  readonly zoomInButton: string;
  readonly zoomOutButton: string;
  readonly fullscreenButton: string;
  readonly cellCommentButton: string;
  readonly cellNoteButton: string;
  readonly dataValidationButton: string;
  readonly conditionalFormattingButton: string;
  readonly autosumButton: string;
  readonly chartContainer: string;
  readonly pivotTableContainer: string;
  readonly errorMessage: string;
  readonly successMessage: string;
  readonly loadingSpinner: string;
  readonly cellValueDisplay: string;
  readonly formulaAutocomplete: string;
  readonly functionWizardButton: string;
  readonly namedRangesButton: string;
  readonly sparklineButton: string;
  readonly dataValidationDialog: string;
  readonly conditionalFormattingDialog: string;
  readonly shareDialog: string;
  readonly exportDialog: string;
  readonly importDialog: string;
  readonly chartDialog: string;
  readonly pivotTableDialog: string;
  readonly findDialog: string;
  readonly replaceDialog: string;
  readonly renameDialog: string;
  readonly deleteDialog: string;
  readonly collaboratorAvatar: string;
  readonly collaboratorPresenceIndicator: string;
  readonly collaboratorCursor: string;
  readonly revisionHistoryButton: string;
  readonly revisionHistoryPanel: string;
  readonly versionTime: string;
  readonly versionAuthor: string;
  readonly restoreVersionButton: string;
  readonly cellHighlight: string;
  readonly rangeSelector: string;
  readonly namedRangeDropdown: string;
  readonly formulaErrorIndicator: string;
  readonly circularReferenceWarning: string;
  readonly dependentCellsIndicator: string;
  readonly precedentsIndicator: string;

  constructor(page: Page) {
    super(page);
    this.createSpreadsheetButton = '[data-testid="create-spreadsheet"]';
    this.spreadsheetNameInput = '[data-testid="spreadsheet-name"]';
    this.saveButton = '[data-testid="save-button"]';
    this.cancelButton = '[data-testid="cancel-button"]';
    this.deleteButton = '[data-testid="delete-button"]';
    this.renameButton = '[data-testid="rename-button"]';
    this.shareButton = '[data-testid="share-button"]';
    this.exportButton = '[data-testid="export-button"]';
    this.importButton = '[data-testid="import-button"]';
    this.cell = '[data-cell]';
    this.cellEditor = '[data-testid="cell-editor"]';
    this.formulaBar = '[data-testid="formula-bar"]';
    this.sheetTabs = '[data-testid="sheet-tab"]';
    this.addSheetButton = '[data-testid="add-sheet"]';
    this.deleteSheetButton = '[data-testid="delete-sheet"]';
    this.renameSheetButton = '[data-testid="rename-sheet"]';
    this.copySheetButton = '[data-testid="copy-sheet"]';
    this.toolbar = '[data-testid="toolbar"]';
    this.formatButton = '[data-testid="format-button"]';
    this.chartButton = '[data-testid="chart-button"]';
    this.pivotTableButton = '[data-testid="pivot-table-button"]';
    this.filterButton = '[data-testid="filter-button"]';
    this.sortButton = '[data-testid="sort-button"]';
    this.collaboratorsList = '[data-testid="collaborators-list"]';
    this.addCollaboratorButton = '[data-testid="add-collaborator"]';
    this.collaboratorEmailInput = '[data-testid="collaborator-email"]';
    this.collaboratorPermissionSelect = '[data-testid="collaborator-permission"]';
    this.cellContextMenu = '[data-testid="cell-context-menu"]';
    this.rowContextMenu = '[data-testid="row-context-menu"]';
    this.columnContextMenu = '[data-testid="column-context-menu"]';
    this.insertRowButton = '[data-testid="insert-row"]';
    this.insertColumnButton = '[data-testid="insert-column"]';
    this.deleteRowButton = '[data-testid="delete-row"]';
    this.deleteColumnButton = '[data-testid="delete-column"]';
    this.mergeCellsButton = '[data-testid="merge-cells"]';
    this.unmergeCellsButton = '[data-testid="unmerge-cells"]';
    this.freezePanesButton = '[data-testid="freeze-panes"]';
    this.freezeTopRowButton = '[data-testid="freeze-top-row"]';
    this.freezeFirstColumnButton = '[data-testid="freeze-first-column"]';
    this.undoButton = '[data-testid="undo-button"]';
    this.redoButton = '[data-testid="redo-button"]';
    this.findButton = '[data-testid="find-button"]';
    this.replaceButton = '[data-testid="replace-button"]';
    this.zoomInButton = '[data-testid="zoom-in"]';
    this.zoomOutButton = '[data-testid="zoom-out"]';
    this.fullscreenButton = '[data-testid="fullscreen-button"]';
    this.cellCommentButton = '[data-testid="cell-comment"]';
    this.cellNoteButton = '[data-testid="cell-note"]';
    this.dataValidationButton = '[data-testid="data-validation"]';
    this.conditionalFormattingButton = '[data-testid="conditional-formatting"]';
    this.autosumButton = '[data-testid="autosum-button"]';
    this.chartContainer = '[data-testid="chart-container"]';
    this.pivotTableContainer = '[data-testid="pivot-table-container"]';
    this.errorMessage = '[data-testid="error-message"]';
    this.successMessage = '[data-testid="success-message"]';
    this.loadingSpinner = '[data-testid="loading-spinner"]';
    this.cellValueDisplay = '[data-testid="cell-value"]';
    this.formulaAutocomplete = '[data-testid="formula-autocomplete"]';
    this.functionWizardButton = '[data-testid="function-wizard"]';
    this.namedRangesButton = '[data-testid="named-ranges"]';
    this.sparklineButton = '[data-testid="sparkline"]';
    this.dataValidationDialog = '[data-testid="data-validation-dialog"]';
    this.conditionalFormattingDialog = '[data-testid="conditional-formatting-dialog"]';
    this.shareDialog = '[data-testid="share-dialog"]';
    this.exportDialog = '[data-testid="export-dialog"]';
    this.importDialog = '[data-testid="import-dialog"]';
    this.chartDialog = '[data-testid="chart-dialog"]';
    this.pivotTableDialog = '[data-testid="pivot-table-dialog"]';
    this.findDialog = '[data-testid="find-dialog"]';
    this.replaceDialog = '[data-testid="replace-dialog"]';
    this.renameDialog = '[data-testid="rename-dialog"]';
    this.deleteDialog = '[data-testid="delete-dialog"]';
    this.collaboratorAvatar = '[data-testid="collaborator-avatar"]';
    this.collaboratorPresenceIndicator = '[data-testid="collaborator-presence"]';
    this.collaboratorCursor = '[data-testid="collaborator-cursor"]';
    this.revisionHistoryButton = '[data-testid="revision-history"]';
    this.revisionHistoryPanel = '[data-testid="revision-history-panel"]';
    this.versionTime = '[data-testid="version-time"]';
    this.versionAuthor = '[data-testid="version-author"]';
    this.restoreVersionButton = '[data-testid="restore-version"]';
    this.cellHighlight = '[data-testid="cell-highlight"]';
    this.rangeSelector = '[data-testid="range-selector"]';
    this.namedRangeDropdown = '[data-testid="named-range-dropdown"]';
    this.formulaErrorIndicator = '[data-testid="formula-error"]';
    this.circularReferenceWarning = '[data-testid="circular-reference-warning"]';
    this.dependentCellsIndicator = '[data-testid="dependent-cells"]';
    this.precedentsIndicator = '[data-testid="precedents"]';
  }

  /**
   * Navigate to dashboard
   */
  async gotoDashboard(): Promise<void> {
    await this.goto('/dashboard');
    await this.waitForLoadState();
  }

  /**
   * Navigate to spreadsheet by ID
   */
  async gotoSpreadsheet(spreadsheetId: string): Promise<void> {
    await this.goto(`/spreadsheet/${spreadsheetId}`);
    await this.waitForLoadState();
  }

  /**
   * Create new spreadsheet
   */
  async createSpreadsheet(name: string): Promise<void> {
    await this.gotoDashboard();
    await this.click(this.createSpreadsheetButton);
    await this.fill(this.spreadsheetNameInput, name);
    await this.click(this.saveButton);
    await this.waitForLoadState();
    await this.verifyUrlContains('/spreadsheet/');
  }

  /**
   * Edit cell value
   */
  async editCellValue(cellRef: string, value: string): Promise<void> {
    const cellSelector = `[data-cell="${cellRef}"]`;
    await this.click(cellSelector);
    await this.keyboardPress('Enter');
    await this.type(cellSelector, value);
    await this.keyboardPress('Enter');
    await this.wait(500);
  }

  /**
   * Edit cell with formula
   */
  async editCellFormula(cellRef: string, formula: string): Promise<void> {
    const cellSelector = `[data-cell="${cellRef}"]`;
    await this.click(cellSelector);
    await this.fill(this.formulaBar, formula);
    await this.keyboardPress('Enter');
    await this.wait(500);
  }

  /**
   * Get cell value
   */
  async getCellValue(cellRef: string): Promise<string> {
    const cellSelector = `[data-cell="${cellRef}"]`;
    return await this.getText(`${cellSelector} ${this.cellValueDisplay}`);
  }

  /**
   * Verify cell value
   */
  async verifyCellValue(cellRef: string, expectedValue: string): Promise<void> {
    const actualValue = await this.getCellValue(cellRef);
    expect(actualValue).toBe(expectedValue);
  }

  /**
   * Select cell range
   */
  async selectRange(startCell: string, endCell: string): Promise<void> {
    const startSelector = `[data-cell="${startCell}"]`;
    const endSelector = `[data-cell="${endCell}"]`;

    await this.page.dragAndDrop(startSelector, endSelector);
    await this.wait(500);
  }

  /**
   * Delete spreadsheet
   */
  async deleteSpreadsheet(): Promise<void> {
    await this.click(this.deleteButton);
    await this.verifyVisible(this.deleteDialog);
    await this.click(this.deleteDialog + ' ' + this.deleteButton);
    await this.waitForLoadState();
  }

  /**
   * Rename spreadsheet
   */
  async renameSpreadsheet(newName: string): Promise<void> {
    await this.click(this.renameButton);
    await this.verifyVisible(this.renameDialog);
    await this.fill(this.renameDialog + ' ' + this.spreadsheetNameInput, newName);
    await this.click(this.renameDialog + ' ' + this.saveButton);
    await this.waitForLoadState();
  }

  /**
   * Share spreadsheet
   */
  async shareSpreadsheet(email: string, permission: 'view' | 'comment' | 'edit'): Promise<void> {
    await this.click(this.shareButton);
    await this.verifyVisible(this.shareDialog);
    await this.fill(this.shareDialog + ' ' + this.collaboratorEmailInput, email);
    await this.selectOption(this.shareDialog + ' ' + this.collaboratorPermissionSelect, permission);
    await this.click(this.shareDialog + ' ' + this.addCollaboratorButton);
    await this.wait(1000);
  }

  /**
   * Export spreadsheet
   */
  async exportSpreadsheet(format: 'xlsx' | 'csv' | 'pdf' | 'ods'): Promise<void> {
    await this.click(this.exportButton);
    await this.verifyVisible(this.exportDialog);
    await this.selectOption(this.exportDialog + ' [data-testid="export-format"]', format);
    await this.click(this.exportDialog + ' ' + this.exportButton);
    await this.wait(2000);
  }

  /**
   * Import spreadsheet
   */
  async importSpreadsheet(filePath: string): Promise<void> {
    await this.click(this.importButton);
    await this.verifyVisible(this.importDialog);
    await this.upload(this.importDialog + ' [data-testid="file-input"]', filePath);
    await this.click(this.importDialog + ' ' + this.saveButton);
    await this.waitForLoadState();
  }

  /**
   * Add new sheet
   */
  async addSheet(name: string): Promise<void> {
    await this.click(this.addSheetButton);
    await this.fill('[data-testid="new-sheet-name"]', name);
    await this.keyboardPress('Enter');
    await this.wait(500);
  }

  /**
   * Delete sheet
   */
  async deleteSheet(sheetName: string): Promise<void> {
    await this.click(`[data-sheet="${sheetName}"]`);
    await this.rightClick(`[data-sheet="${sheetName}"]`);
    await this.click(this.deleteSheetButton);
    await this.wait(500);
  }

  /**
   * Rename sheet
   */
  async renameSheet(oldName: string, newName: string): Promise<void> {
    await this.click(`[data-sheet="${oldName}"]`);
    await this.rightClick(`[data-sheet="${oldName}"]`);
    await this.click(this.renameSheetButton);
    await this.fill('[data-testid="sheet-name-input"]', newName);
    await this.keyboardPress('Enter');
    await this.wait(500);
  }

  /**
   * Copy sheet
   */
  async copySheet(sheetName: string): Promise<void> {
    await this.click(`[data-sheet="${sheetName}"]`);
    await this.rightClick(`[data-sheet="${sheetName}"]`);
    await this.click(this.copySheetButton);
    await this.wait(1000);
  }

  /**
   * Switch to sheet
   */
  async switchToSheet(sheetName: string): Promise<void> {
    await this.click(`[data-sheet="${sheetName}"]`);
    await this.wait(500);
  }

  /**
   * Insert row
   */
  async insertRow(rowNumber: number): Promise<void> {
    await this.click(`[data-row="${rowNumber}"]`);
    await this.rightClick(`[data-row="${rowNumber}"]`);
    await this.click(this.insertRowButton);
    await this.wait(500);
  }

  /**
   * Insert column
   */
  async insertColumn(columnLetter: string): Promise<void> {
    await this.click(`[data-column="${columnLetter}"]`);
    await this.rightClick(`[data-column="${columnLetter}"]`);
    await this.click(this.insertColumnButton);
    await this.wait(500);
  }

  /**
   * Delete row
   */
  async deleteRow(rowNumber: number): Promise<void> {
    await this.click(`[data-row="${rowNumber}"]`);
    await this.rightClick(`[data-row="${rowNumber}"]`);
    await this.click(this.deleteRowButton);
    await this.wait(500);
  }

  /**
   * Delete column
   */
  async deleteColumn(columnLetter: string): Promise<void> {
    await this.click(`[data-column="${columnLetter}"]`);
    await this.rightClick(`[data-column="${columnLetter}"]`);
    await this.click(this.deleteColumnButton);
    await this.wait(500);
  }

  /**
   * Merge cells
   */
  async mergeCells(startCell: string, endCell: string): Promise<void> {
    await this.selectRange(startCell, endCell);
    await this.click(this.mergeCellsButton);
    await this.wait(500);
  }

  /**
   * Unmerge cells
   */
  async unmergeCells(cellRef: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.click(this.unmergeCellsButton);
    await this.wait(500);
  }

  /**
   * Freeze top row
   */
  async freezeTopRow(): Promise<void> {
    await this.click(this.freezeTopRowButton);
    await this.wait(500);
  }

  /**
   * Freeze first column
   */
  async freezeFirstColumn(): Promise<void> {
    await this.click(this.freezeFirstColumnButton);
    await this.wait(500);
  }

  /**
   * Freeze panes
   */
  async freezePanes(cellRef: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.click(this.freezePanesButton);
    await this.wait(500);
  }

  /**
   * Undo action
   */
  async undo(): Promise<void> {
    await this.click(this.undoButton);
    await this.wait(500);
  }

  /**
   * Redo action
   */
  async redo(): Promise<void> {
    await this.click(this.redoButton);
    await this.wait(500);
  }

  /**
   * Find text
   */
  async find(searchText: string): Promise<void> {
    await this.click(this.findButton);
    await this.verifyVisible(this.findDialog);
    await this.fill(this.findDialog + ' [data-testid="find-input"]', searchText);
    await this.keyboardPress('Enter');
    await this.wait(500);
  }

  /**
   * Replace text
   */
  async replace(findText: string, replaceText: string): Promise<void> {
    await this.click(this.replaceButton);
    await this.verifyVisible(this.replaceDialog);
    await this.fill(this.replaceDialog + ' [data-testid="find-input"]', findText);
    await this.fill(this.replaceDialog + ' [data-testid="replace-input"]', replaceText);
    await this.click(this.replaceDialog + ' [data-testid="replace-all"]');
    await this.wait(500);
  }

  /**
   * Sort range
   */
  async sortRange(startCell: string, endCell: string, column: string, ascending: boolean = true): Promise<void> {
    await this.selectRange(startCell, endCell);
    await this.click(this.sortButton);
    await this.selectOption('[data-testid="sort-column"]', column);
    await this.click(ascending ? '[data-testid="sort-asc"]' : '[data-testid="sort-desc"]');
    await this.wait(500);
  }

  /**
   * Filter range
   */
  async filterRange(startCell: string, endCell: string): Promise<void> {
    await this.selectRange(startCell, endCell);
    await this.click(this.filterButton);
    await this.wait(500);
  }

  /**
   * Apply conditional formatting
   */
  async applyConditionalFormatting(range: string, condition: string, format: string): Promise<void> {
    await this.selectRange(range.split(':')[0], range.split(':')[1]);
    await this.click(this.conditionalFormattingButton);
    await this.verifyVisible(this.conditionalFormattingDialog);
    await this.selectOption(this.conditionalFormattingDialog + ' [data-testid="condition"]', condition);
    await this.selectOption(this.conditionalFormattingDialog + ' [data-testid="format"]', format);
    await this.click(this.conditionalFormattingDialog + ' ' + this.saveButton);
    await this.wait(500);
  }

  /**
   * Create chart
   */
  async createChart(range: string, chartType: string): Promise<void> {
    await this.selectRange(range.split(':')[0], range.split(':')[1]);
    await this.click(this.chartButton);
    await this.verifyVisible(this.chartDialog);
    await this.selectOption(this.chartDialog + ' [data-testid="chart-type"]', chartType);
    await this.click(this.chartDialog + ' ' + this.saveButton);
    await this.wait(1000);
    await this.verifyVisible(this.chartContainer);
  }

  /**
   * Create pivot table
   */
  async createPivotTable(sourceRange: string): Promise<void> {
    await this.selectRange(sourceRange.split(':')[0], sourceRange.split(':')[1]);
    await this.click(this.pivotTableButton);
    await this.verifyVisible(this.pivotTableDialog);
    await this.click(this.pivotTableDialog + ' ' + this.saveButton);
    await this.wait(1000);
    await this.verifyVisible(this.pivotTableContainer);
  }

  /**
   * Add cell comment
   */
  async addCellComment(cellRef: string, comment: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.click(this.cellCommentButton);
    await this.fill('[data-testid="comment-input"]', comment);
    await this.click('[data-testid="save-comment"]');
    await this.wait(500);
  }

  /**
   * Add cell note
   */
  async addCellNote(cellRef: string, note: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.click(this.cellNoteButton);
    await this.fill('[data-testid="note-input"]', note);
    await this.click('[data-testid="save-note"]');
    await this.wait(500);
  }

  /**
   * Set data validation
   */
  async setDataValidation(range: string, validation: string): Promise<void> {
    await this.selectRange(range.split(':')[0], range.split(':')[1]);
    await this.click(this.dataValidationButton);
    await this.verifyVisible(this.dataValidationDialog);
    await this.selectOption(this.dataValidationDialog + ' [data-testid="validation-type"]', validation);
    await this.click(this.dataValidationDialog + ' ' + this.saveButton);
    await this.wait(500);
  }

  /**
   * Apply autosum
   */
  async applyAutosum(range: string, targetCell: string): Promise<void> {
    await this.selectRange(range.split(':')[0], range.split(':')[1]);
    await this.click(`[data-cell="${targetCell}"]`);
    await this.click(this.autosumButton);
    await this.keyboardPress('Enter');
    await this.wait(500);
  }

  /**
   * Create named range
   */
  async createNamedRange(range: string, name: string): Promise<void> {
    await this.selectRange(range.split(':')[0], range.split(':')[1]);
    await this.click(this.namedRangesButton);
    await this.fill('[data-testid="named-range-name"]', name);
    await this.click('[data-testid="save-named-range"]');
    await this.wait(500);
  }

  /**
   * Add sparkline
   */
  async addSparkline(cellRef: string, dataRange: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.click(this.sparklineButton);
    await this.fill('[data-testid="sparkline-range"]', dataRange);
    await this.click('[data-testid="save-sparkline"]');
    await this.wait(500);
  }

  /**
   * View revision history
   */
  async viewRevisionHistory(): Promise<void> {
    await this.click(this.revisionHistoryButton);
    await this.verifyVisible(this.revisionHistoryPanel);
  }

  /**
   * Restore version
   */
  async restoreVersion(versionId: string): Promise<void> {
    await this.viewRevisionHistory();
    await this.click(`[data-version="${versionId}"]`);
    await this.click(this.restoreVersionButton);
    await this.wait(1000);
  }

  /**
   * Verify collaborator presence
   */
  async verifyCollaboratorPresent(email: string): Promise<void> {
    await this.verifyVisible(`[data-collaborator="${email}"]`);
  }

  /**
   * Verify real-time update
   */
  async verifyRealtimeUpdate(cellRef: string, expectedValue: string): Promise<void> {
    await this.wait(2000);
    await this.verifyCellValue(cellRef, expectedValue);
  }

  /**
   * Zoom in
   */
  async zoomIn(): Promise<void> {
    await this.click(this.zoomInButton);
    await this.wait(500);
  }

  /**
   * Zoom out
   */
  async zoomOut(): Promise<void> {
    await this.click(this.zoomOutButton);
    await this.wait(500);
  }

  /**
   * Enter fullscreen
   */
  async enterFullscreen(): Promise<void> {
    await this.click(this.fullscreenButton);
    await this.wait(500);
  }

  /**
   * Exit fullscreen
   */
  async exitFullscreen(): Promise<void> {
    await this.keyboardPress('Escape');
    await this.wait(500);
  }

  /**
   * Verify formula error
   */
  async verifyFormulaError(cellRef: string): Promise<void> {
    await this.verifyVisible(`[data-cell="${cellRef}"] ${this.formulaErrorIndicator}`);
  }

  /**
   * Verify circular reference warning
   */
  async verifyCircularReferenceWarning(): Promise<void> {
    await this.verifyVisible(this.circularReferenceWarning);
  }

  /**
   * Get dependent cells
   */
  async getDependentCells(cellRef: string): Promise<string[]> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.hover(this.dependentCellsIndicator);
    const dependentCells = await this.getText('[data-testid="dependent-cells-list"]');
    return dependentCells.split(',').map(s => s.trim());
  }

  /**
   * Get precedents
   */
  async getPrecedents(cellRef: string): Promise<string[]> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.hover(this.precedentsIndicator);
    const precedents = await this.getText('[data-testid="precedents-list"]');
    return precedents.split(',').map(s => s.trim());
  }

  /**
   * Verify cell highlight
   */
  async verifyCellHighlighted(cellRef: string): Promise<void> {
    await this.verifyVisible(`[data-cell="${cellRef}"].${this.cellHighlight}`);
  }

  /**
   * Copy range
   */
  async copyRange(startCell: string, endCell: string): Promise<void> {
    await this.selectRange(startCell, endCell);
    await this.keyboardPress('Control+C');
    await this.wait(500);
  }

  /**
   * Paste range
   */
  async pasteRange(targetCell: string): Promise<void> {
    await this.click(`[data-cell="${targetCell}"]`);
    await this.keyboardPress('Control+V');
    await this.wait(500);
  }

  /**
   * Cut range
   */
  async cutRange(startCell: string, endCell: string): Promise<void> {
    await this.selectRange(startCell, endCell);
    await this.keyboardPress('Control+X');
    await this.wait(500);
  }

  /**
   * Clear cell contents
   */
  async clearCell(cellRef: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.keyboardPress('Delete');
    await this.wait(500);
  }

  /**
   * Clear cell formatting
   */
  async clearFormatting(cellRef: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.rightClick(`[data-cell="${cellRef}"]`);
    await this.click('[data-testid="clear-formatting"]');
    await this.wait(500);
  }

  /**
   * Format cell
   */
  async formatCell(cellRef: string, format: string): Promise<void> {
    await this.click(`[data-cell="${cellRef}"]`);
    await this.click(this.formatButton);
    await this.selectOption('[data-testid="cell-format"]', format);
    await this.wait(500);
  }

  /**
   * Verify cell format
   */
  async verifyCellFormat(cellRef: string, format: string): Promise<void> {
    const cellSelector = `[data-cell="${cellRef}"]`;
    const cellFormat = await this.getAttribute(cellSelector, 'data-format');
    expect(cellFormat).toBe(format);
  }

  /**
   * Get sheet count
   */
  async getSheetCount(): Promise<number> {
    return await this.getElementCount(this.sheetTabs);
  }

  /**
   * Verify sheet exists
   */
  async verifySheetExists(sheetName: string): Promise<void> {
    await this.verifyExists(`[data-sheet="${sheetName}"]`);
  }

  /**
   * Verify sheet active
   */
  async verifySheetActive(sheetName: string): Promise<void> {
    await this.verifyHasClass(`[data-sheet="${sheetName}"]`, 'active');
  }

  /**
   * Get spreadsheet name
   */
  async getSpreadsheetName(): Promise<string> {
    return await this.getText('[data-testid="spreadsheet-title"]');
  }

  /**
   * Verify spreadsheet name
   */
  async verifySpreadsheetName(name: string): Promise<void> {
    await this.verifyTextEquals('[data-testid="spreadsheet-title"]', name);
  }

  /**
   * Get collaborators count
   */
  async getCollaboratorsCount(): Promise<number> {
    return await this.getElementCount(this.collaboratorAvatar);
  }

  /**
   * Verify unsaved changes warning
   */
  async verifyUnsavedChangesWarning(): Promise<void> {
    await this.verifyVisible('[data-testid="unsaved-changes-warning"]');
  }

  /**
   * Save spreadsheet
   */
  async saveSpreadsheet(): Promise<void> {
    await this.click(this.saveButton);
    await this.wait(1000);
  }

  /**
   * Verify spreadsheet saved
   */
  async verifySpreadsheetSaved(): Promise<void> {
    await this.verifyHidden('[data-testid="unsaved-indicator"]');
  }
}
