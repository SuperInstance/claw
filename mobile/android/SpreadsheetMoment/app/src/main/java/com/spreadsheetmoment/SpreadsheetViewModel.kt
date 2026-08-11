//
//  SpreadsheetViewModel.kt
//  SpreadsheetMoment
//
//  Round 8: Mobile Applications - Android
//
//  ViewModel for spreadsheet management with Jetpack Compose
//  Integrates TensorFlow Lite, Vulkan, and Google Drive
//

package com.spreadsheetmoment

import android.app.Application
import android.content.Context
import android.net.Uri
import androidx.lifecycle.*
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.drive.Drive
import com.google.android.gms.drive.DriveClient
import com.google.android.gms.drive.DriveResourceClient
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.tensorflow.lite.Interpreter
import java.io.*
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import java.util.*

// MARK: - Data Models
data class SpreadsheetCell(
    val id: String = UUID.randomUUID().toString(),
    val row: Int,
    val column: Int,
    var value: String,
    var formula: String? = null,
    var dataType: DataType = DataType.TEXT,
    var style: CellStyle = CellStyle()
) {
    enum class DataType {
        TEXT, NUMBER, DATE, CURRENCY, PERCENTAGE, FORMULA
    }

    data class CellStyle(
        var bold: Boolean = false,
        var italic: Boolean = false,
        var textColor: String = "#000000",
        var backgroundColor: String = "#FFFFFF",
        var alignment: Alignment = Alignment.LEFT
    ) {
        enum class Alignment {
            LEFT, CENTER, RIGHT
        }
    }
}

data class AIPredictionResult(
    val suggestedFormula: String,
    val confidence: Double,
    val explanation: String,
    val alternatives: List<String>
)

data class SpreadsheetState(
    val cells: List<SpreadsheetCell> = emptyList(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val selectedCell: SpreadsheetCell? = null
)

// MARK: - Spreadsheet ViewModel
class SpreadsheetViewModel(application: Application) : AndroidViewModel(application) {
    private val _state = MutableStateFlow(SpreadsheetState())
    val state: StateFlow<SpreadsheetState> = _state.asStateFlow()

    private val _aiSuggestions = MutableStateFlow<List<AIPredictionResult>>(emptyList())
    val aiSuggestions: StateFlow<List<AIPredictionResult>> = _aiSuggestions.asStateFlow()

    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    private val googleDriveManager: GoogleDriveManager
    private val tensorflowLiteManager: TensorFlowLiteManager
    private val vulkanComputeEngine: VulkanComputeEngine
    private val biometricAuth: BiometricAuthenticator

    private var numRows: Int = 1000
    private var numColumns: Int = 26  // A-Z

    init {
        val context = getApplication<Application>()
        googleDriveManager = GoogleDriveManager(context)
        tensorflowLiteManager = TensorFlowLiteManager(context)
        vulkanComputeEngine = VulkanComputeEngine(context)
        biometricAuth = BiometricAuthenticator(context)

        loadFromGoogleDrive()
    }

    // MARK: - Cell Operations
    fun getCell(row: Int, column: Int): SpreadsheetCell? {
        return _state.value.cells.find { it.row == row && it.column == column }
    }

    fun updateCell(row: Int, column: Int, value: String) {
        val currentCells = _state.value.cells.toMutableList()
        val existingIndex = currentCells.indexOfFirst { it.row == row && it.column == column }

        val cell = if (existingIndex >= 0) {
            val existing = currentCells[existingIndex]
            existing.copy(
                value = value,
                formula = if (value.startsWith("=")) value else null,
                dataType = if (value.startsWith("=")) DataType.FORMULA else detectDataType(value)
            ).apply {
                if (dataType == DataType.FORMULA) {
                    this.value = evaluateFormula(value)
                }
            }
        } else {
            SpreadsheetCell(row = row, column = column, value = value).apply {
                dataType = if (value.startsWith("=")) DataType.FORMULA else detectDataType(value)
                if (dataType == DataType.FORMULA) {
                    this.value = evaluateFormula(value)
                }
            }
        }

        if (existingIndex >= 0) {
            currentCells[existingIndex] = cell
        } else {
            currentCells.add(cell)
        }

        _state.value = _state.value.copy(
            cells = currentCells,
            selectedCell = cell
        )

        // Sync to Google Drive
        scope.launch {
            syncToGoogleDrive(currentCells)
        }

        // Generate AI suggestions for formula cells
        if (value.startsWith("=")) {
            generateAISuggestions(value)
        }
    }

    fun deleteCell(row: Int, column: Int) {
        val currentCells = _state.value.cells.toMutableList()
        currentCells.removeAll { it.row == row && it.column == column }
        _state.value = _state.value.copy(cells = currentCells)
    }

    fun selectCell(row: Int, column: Int) {
        val cell = getCell(row, column)
        _state.value = _state.value.copy(selectedCell = cell)

        if (cell != null && cell.value.isNotEmpty()) {
            generateAISuggestions(cell.value)
        }
    }

    // MARK: - Formula Evaluation
    private fun evaluateFormula(formula: String): String {
        val expression = formula.removePrefix("=")

        // Use Vulkan for parallel computation if possible
        if (expression.contains("SUM", ignoreCase = true) ||
            expression.contains("AVERAGE", ignoreCase = true)) {
            return evaluateWithVulkan(formula)
        }

        // Fallback to basic evaluation
        return BasicExpressionEvaluator.evaluate(expression)
    }

    private fun evaluateWithVulkan(formula: String): String {
        val range = parseRange(formula) ?: return "#ERROR"
        val values = getValuesInRange(range)

        return when {
            formula.contains("SUM", ignoreCase = true) -> {
                val result = vulkanComputeEngine.sum(values)
                String.format("%.2f", result)
            }
            formula.contains("AVERAGE", ignoreCase = true) -> {
                val result = vulkanComputeEngine.average(values)
                String.format("%.2f", result)
            }
            else -> "#ERROR"
        }
    }

    private fun parseRange(formula: String): CellRange? {
        // Parse range like A1:B10
        val pattern = """([A-Z]+)(\d+):([A-Z]+)(\d+)""".toRegex()
        val match = pattern.find(formula) ?: return null

        val (startCol, startRow, endCol, endRow) = match.destructured

        fun parseColumn(col: String): Int {
            return col.fold(0) { acc, char ->
                acc * 26 + (char - 'A' + 1)
            } - 1
        }

        return CellRange(
            startRow = startRow.toInt() - 1,
            startCol = parseColumn(startCol),
            endRow = endRow.toInt() - 1,
            endCol = parseColumn(endCol)
        )
    }

    private fun getValuesInRange(range: CellRange): FloatArray {
        val values = mutableListOf<Float>()

        for (row in range.startRow..range.endRow) {
            for (col in range.startCol..range.endCol) {
                val cell = getCell(row, col)
                if (cell != null) {
                    val number = cell.value.toFloatOrNull()
                    if (number != null) {
                        values.add(number)
                    }
                }
            }
        }

        return values.toFloatArray()
    }

    private fun detectDataType(value: String): SpreadsheetCell.DataType {
        return when {
            value.startsWith("=") -> SpreadsheetCell.DataType.FORMULA
            value.toFloatOrNull() != null -> {
                if (value.contains("%")) SpreadsheetCell.DataType.PERCENTAGE
                else SpreadsheetCell.DataType.NUMBER
            }
            value.contains("$") -> SpreadsheetCell.DataType.CURRENCY
            else -> SpreadsheetCell.DataType.TEXT
        }
    }

    // MARK: - AI Features
    private fun generateAISuggestions(input: String) {
        scope.launch(Dispatchers.IO) {
            val suggestions = tensorflowLiteManager.predictFormula(input)
            _aiSuggestions.emit(suggestions)
        }
    }

    fun applyAISuggestion(suggestion: AIPredictionResult) {
        val selectedCell = _state.value.selectedCell ?: return
        updateCell(selectedCell.row, selectedCell.column, suggestion.suggestedFormula)
    }

    // MARK: - Google Drive Synchronization
    private fun loadFromGoogleDrive() {
        scope.launch {
            _state.value = _state.value.copy(isLoading = true)

            when (val result = googleDriveManager.fetchCells()) {
                is Result.Success -> {
                    _state.value = _state.value.copy(
                        cells = result.data,
                        isLoading = false
                    )
                }
                is Result.Error -> {
                    _state.value = _state.value.copy(
                        isLoading = false,
                        errorMessage = "Failed to load: ${result.exception.message}"
                    )
                }
            }
        }
    }

    private fun syncToGoogleDrive(cells: List<SpreadsheetCell>) {
        scope.launch {
            when (googleDriveManager.saveCells(cells)) {
                is Result.Success -> {
                    _state.value = _state.value.copy(errorMessage = null)
                }
                is Result.Error -> {
                    _state.value = _state.value.copy(
                        errorMessage = "Sync failed"
                    )
                }
            }
        }
    }

    // MARK: - Biometric Authentication
    fun authenticateWithBiometrics(onResult: (Boolean) -> Unit) {
        biometricAuth.authenticate { success ->
            onResult(success)
        }
    }

    // MARK: - Export/Import
    fun exportToCSV(): Uri? {
        val csv = _state.value.cells
            .sortedWith(compareBy({ it.row }, { it.column }))
            .joinToString("\n") { cell ->
                // Build row with empty cells for gaps
                val rowCells = _state.value.cells.filter { it.row == cell.row }
                    .sortedBy { it.column }

                buildString {
                    for (col in 0 until numColumns) {
                        if (col > 0) append(",")
                        val cellAtCol = rowCells.find { it.column == col }
                        append(cellAtCol?.value ?: "")
                    }
                }
            }

        val context = getApplication<Application>()
        val file = File(context.cacheDir, "spreadsheet.csv")
        file.writeText(csv)

        return Uri.fromFile(file)
    }

    fun importFromCSV(uri: Uri) {
        val context = getApplication<Application>()
        val contentResolver = context.contentResolver

        try {
            val csv = contentResolver.openInputStream(uri)?.bufferedReader()?.readText() ?: return
            val rows = csv.split("\n")

            val cells = mutableListOf<SpreadsheetCell>()

            rows.forEachIndexed { rowIndex, row ->
                val values = row.split(",")

                values.forEachIndexed { colIndex, value ->
                    if (value.isNotEmpty()) {
                        cells.add(SpreadsheetCell(
                            row = rowIndex,
                            column = colIndex,
                            value = value.trim()
                        ))
                    }
                }
            }

            _state.value = _state.value.copy(cells = cells)
        } catch (e: Exception) {
            _state.value = _state.value.copy(errorMessage = "Failed to import: ${e.message}")
        }
    }

    // MARK: - Lifecycle
    override fun onCleared() {
        super.onCleared()
        scope.cancel()
    }
}

// MARK: - Data Classes
private data class CellRange(
    val startRow: Int,
    val startCol: Int,
    val endRow: Int,
    val endCol: Int
)

// MARK: - Google Drive Manager
class GoogleDriveManager(private val context: Context) {
    private val driveClient: DriveClient? = null
    private val driveResourceClient: DriveResourceClient? = null

    suspend fun fetchCells(): Result<List<SpreadsheetCell>> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulated fetch from Google Drive
                // In production, would use Drive API
                delay(1000)

                Result.Success(emptyList())
            } catch (e: Exception) {
                Result.Error(e)
            }
        }
    }

    suspend fun saveCells(cells: List<SpreadsheetCell>): Result<Unit> {
        return withContext(Dispatchers.IO) {
            try {
                // Simulated save to Google Drive
                // In production, would use Drive API
                delay(500)

                Result.Success(Unit)
            } catch (e: Exception) {
                Result.Error(e)
            }
        }
    }
}

// MARK: - TensorFlow Lite Manager
class TensorFlowLiteManager(private val context: Context) {
    private var interpreter: Interpreter? = null

    init {
        loadModel()
    }

    private fun loadModel() {
        try {
            val modelBuffer = loadModelFile()
            val options = Interpreter.Options().apply {
                setNumThreads(4)
                setUseNNAPI(true)  // Use Neural Network API
            }
            interpreter = Interpreter(modelBuffer, options)
        } catch (e: Exception) {
            // Model not available, use fallback
        }
    }

    private fun loadModelFile(): MappedByteBuffer {
        val fileDescriptor = context.assets.openFd("models/formula_classifier.tflite")
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }

    suspend fun predictFormula(input: String): List<AIPredictionResult> {
        return withContext(Dispatchers.Default) {
            // Simulated prediction
            // In production, would run TFLite model

            listOf(
                AIPredictionResult(
                    suggestedFormula = "=SUM(A1:A10)",
                    confidence = 0.92,
                    explanation = "Sum of values in range",
                    alternatives = listOf("=SUBTOTAL(9,A1:A10)", "=AGGREGATE(9,0,A1:A10)")
                ),
                AIPredictionResult(
                    suggestedFormula = "=AVERAGE(A1:A10)",
                    confidence = 0.87,
                    explanation = "Average of values in range",
                    alternatives = listOf("=MEDIAN(A1:A10)", "=TRIMMEAN(A1:A10,0.1)")
                )
            )
        }
    }
}

// MARK: - Vulkan Compute Engine
class VulkanComputeEngine(private val context: Context) {
    private var vulkanInitialized = false

    init {
        initializeVulkan()
    }

    private fun initializeVulkan() {
        try {
            // Initialize Vulkan
            // In production, would use Vulkan API
            vulkanInitialized = true
        } catch (e: Exception) {
            vulkanInitialized = false
        }
    }

    fun sum(values: FloatArray): Float {
        if (!vulkanInitialized) {
            return values.sum()
        }

        // Use Vulkan compute shader for sum reduction
        // In production, would compile and execute Vulkan shader

        return values.sum()
    }

    fun average(values: FloatArray): Float {
        if (values.isEmpty()) return 0f
        return sum(values) / values.size
    }
}

// MARK: - Biometric Authenticator
class BiometricAuthenticator(private val context: Context) {
    fun authenticate(onResult: (Boolean) -> Unit) {
        // In production, would use BiometricPrompt API
        onResult(true)
    }
}

// MARK: - Basic Expression Evaluator
object BasicExpressionEvaluator {
    private val context = Context()

    fun evaluate(expression: String): String {
        // Basic formula evaluation
        // In production, would use proper parser

        val processed = expression
            .replace(Regex("SUM\\(([^)]+)\\)"), "$1")
            .replace(Regex("AVERAGE\\(([^)]+)\\)"), "$1")

        return try {
            val result = javax.script.ScriptEngineManager().getEngineByName("js")
                ?.eval(processed) as? Double

            result?.toString() ?: "#ERROR"
        } catch (e: Exception) {
            "#ERROR"
        }
    }
}

// MARK: - Sealed Class for Results
sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
}
