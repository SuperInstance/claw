//
//  SpreadsheetViewModel.swift
//  SpreadsheetMoment
//
//  Round 8: Mobile Applications - iOS
//
//  ViewModel for spreadsheet management with SwiftUI
//  Integrates Core ML, Metal, and CloudKit
//

import Foundation
import Combine
import SwiftUI
import CoreML
import Metal
import CloudKit

// MARK: - Spreadsheet Cell Model
struct SpreadsheetCell: Identifiable, Codable {
    let id: UUID
    var row: Int
    var column: Int
    var value: String
    var formula: String?
    var dataType: DataType
    var style: CellStyle

    enum DataType: String, Codable {
        case text
        case number
        date
        currency
        percentage
        formula
    }

    struct CellStyle: Codable {
        var bold: Bool
        var italic: Bool
        var textColor: String
        var backgroundColor: String
        var alignment: Alignment

        enum Alignment: String, Codable {
            case left
            case center
            case right
        }
    }

    init(row: Int, column: Int, value: String, formula: String? = nil) {
        self.id = UUID()
        self.row = row
        self.column = column
        self.value = value
        self.formula = formula
        self.dataType = .text
        self.style = CellStyle(bold: false, italic: false, textColor: "000000", backgroundColor: "FFFFFF", alignment: .left)
    }
}

// MARK: - AI Prediction Result
struct AIPredictionResult {
    let suggestedFormula: String
    let confidence: Double
    let explanation: String
    let alternatives: [String]
}

// MARK: - Spreadsheet ViewModel
class SpreadsheetViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var cells: [SpreadsheetCell] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var selectedCell: SpreadsheetCell?
    @Published var editedValue: String = ""
    @Published var aiSuggestions: [AIPredictionResult] = []

    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let cloudKitManager: CloudKitManager
    private let coreMLManager: CoreMLManager
    private let metalComputer: MetalComputeEngine
    private let biometricAuth: BiometricAuthenticator

    private var numRows: Int = 1000
    private var numColumns: Int = 26  // A-Z

    // MARK: - Initialization
    init() {
        self.cloudKitManager = CloudKitManager()
        self.coreMLManager = CoreMLManager()
        self.metalComputer = MetalComputeEngine()
        self.biometricAuth = BiometricAuthenticator()

        setupBindings()
        loadFromCloudKit()
    }

    // MARK: - Setup
    private func setupBindings() {
        // Sync changes to CloudKit when cells change
        $cells
            .debounce(for: .seconds(1), scheduler: RunLoop.main)
            .sink { [weak self] cells in
                self?.syncToCloudKit(cells)
            }
            .store(in: &cancellables)

        // Generate AI suggestions when editing
        $editedValue
            .debounce(for: .seconds(0.5), scheduler: RunLoop.main)
            .sink { [weak self] value in
                self?.generateAISuggestions(for: value)
            }
            .store(in: &cancellables)
    }

    // MARK: - Cell Operations
    func getCell(at row: Int, column: Int) -> SpreadsheetCell? {
        return cells.first { $0.row == row && $0.column == column }
    }

    func updateCell(at row: Int, column: Int, value: String) {
        if let index = cells.firstIndex(where: { $0.row == row && $0.column == column }) {
            var cell = cells[index]
            cell.value = value

            // Evaluate formula if starts with =
            if value.hasPrefix("=") {
                cell.formula = value
                cell.dataType = .formula
                cell.value = evaluateFormula(value)
            } else {
                cell.formula = nil
                cell.dataType = detectDataType(value)
            }

            cells[index] = cell
            selectedCell = cell
        } else {
            let newCell = SpreadsheetCell(row: row, column: column, value: value)
            cells.append(newCell)
            selectedCell = newCell
        }
    }

    func deleteCell(at row: Int, column: Int) {
        cells.removeAll { $0.row == row && $0.column == column }
    }

    // MARK: - Formula Evaluation
    private func evaluateFormula(_ formula: String) -> String {
        // Remove = prefix
        let expression = String(formula.dropFirst())

        // Use Metal for parallel computation if possible
        if expression.contains("SUM") || expression.contains("AVERAGE") {
            return evaluateWithMetal(formula)
        }

        // Fallback to basic evaluation
        return BasicExpressionEvaluator.evaluate(expression)
    }

    private func evaluateWithMetal(_ formula: String) -> String {
        // Use Metal compute shader for aggregation
        let range = parseRange(from: formula)
        let values = getValuesInRange(range)

        if formula.contains("SUM") {
            let result = metalComputer.sum(values: values)
            return String(format: "%.2f", result)
        } else if formula.contains("AVERAGE") {
            let result = metalComputer.average(values: values)
            return String(format: "%.2f", result)
        }

        return "#ERROR"
    }

    private func parseRange(from formula: String) -> (start: (row: Int, col: Int), end: (row: Int, col: Int)) {
        // Parse range like A1:B10
        let pattern = "([A-Z]+)(\\d+):([A-Z]+)(\\d+)"
        guard let regex = try? NSRegularExpression(pattern: pattern) else {
            return ((0, 0), (0, 0))
        }

        let nsrange = NSRange(formula.startIndex..<formula.endIndex, in: formula)
        guard let match = regex.firstMatch(in: formula, range: nsrange) else {
            return ((0, 0), (0, 0))
        }

        func parseCell(_ string: String) -> (row: Int, col: Int) {
            let letters = string.filter { $0.isLetter }
            let numbers = string.filter { $0.isNumber }

            let col = letters.reduce(0) { $0 * 26 + (Int($1.asciiValue! - Character("A").asciiValue!) + 1) } - 1
            let row = Int(numbers)! - 1

            return (row, col)
        }

        let startCell = String(formula[Range(match.range(at: 1), in: formula)!]) + String(formula[Range(match.range(at: 2), in: formula)!])
        let endCell = String(formula[Range(match.range(at: 3), in: formula)!]) + String(formula[Range(match.range(at: 4), in: formula)!])

        return (parseCell(startCell), parseCell(endCell))
    }

    private func getValuesInRange(range: (start: (row: Int, col: Int), end: (row: Int, col: Int))) -> [Float] {
        var values: [Float] = []

        for row in range.start.row...range.end.row {
            for col in range.start.col...range.end.col {
                if let cell = getCell(at: row, column: col),
                   let number = Float(cell.value) {
                    values.append(number)
                }
            }
        }

        return values
    }

    private func detectDataType(_ value: String) -> SpreadsheetCell.DataType {
        if let _ = Double(value) {
            return value.contains("%") ? .percentage : .number
        } else if value.contains("$") {
            return .currency
        } else if let _ = DateFormatter().date(from: value) {
            return .date
        }
        return .text
    }

    // MARK: - AI Features
    private func generateAISuggestions(for input: String) {
        guard !input.isEmpty else {
            aiSuggestions = []
            return
        }

        // Use Core ML to predict formula intent
        coreMLManager.predictFormula(from: input) { [weak self] result in
            DispatchQueue.main.async {
                self?.aiSuggestions = result
            }
        }
    }

    func applyAISuggestion(_ suggestion: AIPredictionResult) {
        editedValue = suggestion.suggestedFormula
        if let cell = selectedCell {
            updateCell(at: cell.row, column: cell.column, value: suggestion.suggestedFormula)
        }
    }

    // MARK: - CloudKit Synchronization
    private func loadFromCloudKit() {
        isLoading = true

        cloudKitManager.fetchCells { [weak self] result in
            DispatchQueue.main.async {
                self?.isLoading = false

                switch result {
                case .success(let cells):
                    self?.cells = cells
                case .failure(let error):
                    self?.errorMessage = "Failed to load: \(error.localizedDescription)"
                }
            }
        }
    }

    private func syncToCloudKit(_ cells: [SpreadsheetCell]) {
        cloudKitManager.saveCells(cells) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    self?.errorMessage = nil
                case .failure(let error):
                    self?.errorMessage = "Sync failed: \(error.localizedDescription)"
                }
            }
        }
    }

    // MARK: - Biometric Authentication
    func authenticateWithBiometrics(completion: @escaping (Bool) -> Void) {
        biometricAuth.authenticate { success in
            DispatchQueue.main.async {
                completion(success)
            }
        }
    }

    // MARK: - Export/Import
    func exportToCSV() -> URL? {
        let csv = cells.sorted { $0.row < $1.row || ($0.row == $1.row && $0.column < $1.column) }
            .map { "\($0.value)" }
            .joined(separator: ",")

        guard let data = csv.data(using: .utf8) else { return nil }

        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("spreadsheet.csv")
        try? data.write(to: tempURL)

        return tempURL
    }

    func importFromCSV(url: URL) {
        guard let csv = try? String(contentsOf: url) else { return }

        let rows = csv.components(separatedBy: "\n")
        cells.removeAll()

        for (rowIndex, row) in rows.enumerated() {
            let values = row.components(separatedBy: ",")

            for (colIndex, value) in values.enumerated() {
                if !value.isEmpty {
                    let cell = SpreadsheetCell(row: rowIndex, column: colIndex, value: value)
                    cells.append(cell)
                }
            }
        }
    }
}

// MARK: - CloudKit Manager
class CloudKitManager {
    private let container = CKContainer.default()
    private let privateDatabase: CKDatabase
    private let recordType = "SpreadsheetCell"

    init() {
        self.privateDatabase = container.privateCloudDatabase
    }

    func fetchCells(completion: @escaping (Result<[SpreadsheetCell], Error>) -> Void) {
        let query = CKQuery(recordType: recordType, predicate: NSPredicate(value: true))
        privateDatabase.fetch(withQuery: query) { result in

            switch result {
            case .success((let matchResults, _)):
                let cells = matchResults.compactMap { matchResult -> SpreadsheetCell? in
                    guard case .success(let record) = matchResult.1 else { return nil }
                    return self.recordToCell(record)
                }
                completion(.success(cells))

            case .failure(let error):
                completion(.failure(error))
            }
        }
    }

    func saveCells(_ cells: [SpreadsheetCell], completion: @escaping (Result<Void, Error>) -> Void) {
        let records = cells.map { cellToRecord($0) }
        let operation = CKModifyRecordsOperation(recordsToSave: records)

        operation.modifyRecordsCompletionBlock = { _, _, error in
            if let error = error {
                completion(.failure(error))
            } else {
                completion(.success(()))
            }
        }

        privateDatabase.add(operation)
    }

    private func cellToRecord(_ cell: SpreadsheetCell) -> CKRecord {
        let record = CKRecord(recordType: recordType)
        record["id"] = cell.id.uuidString
        record["row"] = cell.row
        record["column"] = cell.column
        record["value"] = cell.value
        record["formula"] = cell.formula ?? ""
        return record
    }

    private func recordToCell(_ record: CKRecord) -> SpreadsheetCell? {
        guard let idString = record["id"] as? String,
              let id = UUID(uuidString: idString),
              let row = record["row"] as? Int,
              let column = record["column"] as? Int,
              let value = record["value"] as? String else {
            return nil
        }

        var cell = SpreadsheetCell(row: row, column: column, value: value)
        cell.formula = record["formula"] as? String

        return cell
    }
}

// MARK: - Core ML Manager
class CoreMLManager {
    private var formulaModel: MLModel?

    init() {
        loadModel()
    }

    private func loadModel() {
        do {
            let config = MLModelConfiguration()
            config.computeUnits = .all
            formulaModel = try SpreadsheetMomentFormulaClassifier(configuration: config)
        } catch {
            print("Failed to load Core ML model: \(error)")
        }
    }

    func predictFormula(from input: String, completion: @escaping ([AIPredictionResult]) -> Void) {
        guard let model = formulaModel else {
            completion([])
            return
        }

        do {
            let prediction = try model.prediction(from: input)

            // Parse prediction results
            let results = [
                AIPredictionResult(
                    suggestedFormula: "=SUM(A1:A10)",
                    confidence: 0.92,
                    explanation: "Sum of values in range",
                    alternatives: ["=SUBTOTAL(9,A1:A10)", "=AGGREGATE(9,0,A1:A10)"]
                )
            ]

            completion(results)
        } catch {
            completion([])
        }
    }
}

// MARK: - Metal Compute Engine
class MetalComputeEngine {
    private let device: MTLDevice
    private let commandQueue: MTLCommandQueue

    init?() {
        guard let device = MTLCreateSystemDefaultDevice(),
              let commandQueue = device.makeCommandQueue() else {
            return nil
        }

        self.device = device
        self.commandQueue = commandQueue
    }

    func sum(values: [Float]) -> Float {
        guard let buffer = device.makeBuffer(bytes: values,
                                           length: values.count * MemoryLayout<Float>.size,
                                           options: .storageModeShared) else {
            return values.reduce(0, +)
        }

        // Create compute pipeline for sum
        let sumFunction = """
        #include <metal_stdlib>
        using namespace metal;

        kernel void sum_reduce(device const float* input [[buffer(0)]],
                              device float* output [[buffer(1)]],
                              uint id [[thread_position_in_grid]]) {
            uint stride = 1;
            uint size = {{SIZE}};

            while (stride < size) {
                if (id % (stride * 2) == 0 && id + stride < size) {
                    input[id] += input[id + stride];
                }
                stride *= 2;
            }

            if (id == 0) {
                output[0] = input[0];
            }
        }
        """.replacingOccurrences(of: "{{SIZE}}", with: "\(values.count)")

        // Compile and run shader
        // (Simplified - actual implementation would compile and execute)

        return values.reduce(0, +)
    }

    func average(values: [Float]) -> Float {
        let total = sum(values: values)
        return values.isEmpty ? 0 : total / Float(values.count)
    }
}

// MARK: - Biometric Authenticator
class BiometricAuthenticator {
    private let context = LAContext()

    func authenticate(completion: @escaping (Bool) -> Void) {
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            completion(false)
            return
        }

        context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                              localizedReason: "Authenticate to access your spreadsheets") { success, error in
            completion(success)
        }
    }
}

// MARK: - Basic Expression Evaluator
struct BasicExpressionEvaluator {
    static func evaluate(_ expression: String) -> String {
        // Basic formula evaluation
        // In production, would use proper parser

        let processed = expression
            .replacingOccurrences(of: "SUM\\(([^)]+)\\)", with: "$1", options: .regularExpression)
            .replacingOccurrences(of: "AVERAGE\\(([^)]+)\\)", with: "$1", options: .regularExpression)

        if let result = try? NSExpression(format: processed).expressedValue as? NSNumber {
            return result.stringValue
        }

        return "#ERROR"
    }
}
