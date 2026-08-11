/**
 * Tensor Grid Component
 *
 * Displays tensor-based spreadsheet cells with:
 * - 2D matrix visualization
 * - Temperature-based coloring (data propagation visualization)
 * - Real-time collaboration cursors
 * - NLP cell input
 * - Agent cell indicators
 *
 * @author SuperInstance Evolution Team
 * @date 2026-03-14
 * @version Round 2 Implementation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Activity, Network, Cpu, Database } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface TensorCell {
  id: string;
  position: [number, number];
  value: number | string | TensorData;
  type: CellType;
  formula?: string;
  metadata: CellMetadata;
}

export interface TensorData {
  shape: number[];
  data: number[];
  dtype: 'float32' | 'float64' | 'int32' | 'int64' | 'bool';
}

export type CellType = 'scalar' | 'vector' | 'matrix' | 'tensor' | 'agent' | 'io' | 'api';

export interface CellMetadata {
  temperature: number;
  confidence: number;
  author: string;
  tags: string[];
  description?: string;
  nlpProcessed: boolean;
}

export interface UserCursor {
  userId: string;
  userName: string;
  cellId: string;
  color: string;
}

// ============================================================================
// Props
// ============================================================================

interface TensorGridProps {
  rows: number;
  cols: number;
  cells: Map<string, TensorCell>;
  cursors: Map<string, UserCursor>;
  onCellUpdate: (cellId: string, value: any) => void;
  onCellSelect: (cellId: string) => void;
  selectedCellId?: string;
  readonly?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const TensorGrid: React.FC<TensorGridProps> = ({
  rows,
  cols,
  cells,
  cursors,
  onCellUpdate,
  onCellSelect,
  selectedCellId,
  readonly = false
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /**
   * Get cell at position
   */
  const getCellAt = useCallback((row: number, col: number): TensorCell | null => {
    const cellId = `${row}-${col}`;
    return cells.get(cellId) || null;
  }, [cells]);

  /**
   * Get cell color based on temperature
   */
  const getCellColor = useCallback((cell: TensorCell | null): string => {
    if (!cell) return 'bg-gray-50';

    const temp = cell.metadata.temperature || 0.5;

    // Temperature-based color gradient
    // Low temp: blue (cold), High temp: red (hot)
    if (temp < 0.3) {
      return 'bg-blue-100';
    } else if (temp < 0.5) {
      return 'bg-green-100';
    } else if (temp < 0.7) {
      return 'bg-yellow-100';
    } else {
      return 'bg-red-100';
    }
  }, []);

  /**
   * Get cell icon based on type
   */
  const getCellIcon = useCallback((type: CellType) => {
    switch (type) {
      case 'agent':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'io':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'api':
        return <Network className="w-4 h-4 text-green-600" />;
      case 'tensor':
        return <Activity className="w-4 h-4 text-orange-600" />;
      case 'matrix':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      default:
        return null;
    }
  }, []);

  /**
   * Format cell value for display
   */
  const formatCellValue = useCallback((cell: TensorCell): string => {
    const { value, type } = cell;

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number') {
      return value.toFixed(2);
    }

    if (type === 'tensor' || type === 'matrix' || type === 'vector') {
      const tensor = value as TensorData;
      const dims = tensor.shape.join('×');
      return `[${dims}]`;
    }

    return '';
  }, []);

  /**
   * Handle cell click
   */
  const handleCellClick = useCallback((row: number, col: number) => {
    if (readonly) return;

    const cellId = `${row}-${col}`;
    const cell = getCellAt(row, col);

    if (cell && cell.type === 'agent') {
      // Agent cells open in dialog, not inline edit
      onCellSelect(cellId);
    } else {
      setEditingCell(cellId);
      setEditValue(cell ? formatCellValue(cell) : '');
    }
  }, [readonly, getCellAt, formatCellValue, onCellSelect]);

  /**
   * Handle cell edit complete
   */
  const handleEditComplete = useCallback(() => {
    if (!editingCell) return;

    // Try to parse as number
    let value: any = editValue;
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue)) {
      value = numValue;
    }

    onCellUpdate(editingCell, value);
    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onCellUpdate]);

  /**
   * Handle key press in edit mode
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditComplete();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  }, [handleEditComplete]);

  /**
   * Handle NLP query
   */
  const handleNLPQuery = useCallback(async (query: string) => {
    // Send NLP query to backend
    try {
      const response = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('NLP query failed:', error);
      return null;
    }
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="tensor-grid">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Tensor Grid</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 rounded" />
            <span className="text-sm text-gray-600">Cold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 rounded" />
            <span className="text-sm text-gray-600">Hot</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div
        ref={gridRef}
        className="grid gap-1 bg-gray-200 p-1 rounded-lg overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(100px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(40px, 1fr))`,
          maxHeight: '600px'
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const cellId = `${row}-${col}`;
            const cell = getCellAt(row, col);
            const isSelected = selectedCellId === cellId;
            const isEditing = editingCell === cellId;
            const isHovered = hoveredCell === cellId;

            // Get cursors for this cell
            const cellCursors = Array.from(cursors.values()).filter(c => c.cellId === cellId);

            return (
              <motion.div
                key={cellId}
                className={`
                  relative p-2 rounded cursor-pointer transition-all
                  ${getCellColor(cell)}
                  ${isSelected ? 'ring-2 ring-purple-500' : ''}
                  ${isHovered && !isEditing ? 'ring-1 ring-gray-400' : ''}
                `}
                onClick={() => handleCellClick(row, col)}
                onMouseEnter={() => setHoveredCell(cellId)}
                onMouseLeave={() => setHoveredCell(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Cell content */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleEditComplete}
                    onKeyDown={handleKeyPress}
                    className="w-full bg-transparent outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-2">
                      {cell && getCellIcon(cell.type)}
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {cell ? formatCellValue(cell) : ''}
                      </span>
                    </div>

                    {/* Confidence indicator */}
                    {cell && cell.metadata.confidence < 0.8 && (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* Collaboration cursors */}
                {cellCursors.map(cursor => (
                  <div
                    key={cursor.userId}
                    className="absolute top-0 right-0 w-2 h-2 rounded-full"
                    style={{ backgroundColor: cursor.color }}
                    title={cursor.userName}
                  />
                ))}

                {/* Temperature indicator (hover) */}
                {isHovered && cell && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white text-xs p-1 rounded">
                    <div>Temp: {cell.metadata.temperature.toFixed(2)}</div>
                    <div>Conf: {cell.metadata.confidence.toFixed(2)}</div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* NLP Input */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span className="font-semibold text-gray-700">NLP Command</span>
        </div>
        <input
          type="text"
          placeholder="Enter natural language command... (e.g., 'Make cell A1 the sum of row 2')"
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onKeyPress={async (e) => {
            if (e.key === 'Enter') {
              const input = e.currentTarget;
              const result = await handleNLPQuery(input.value);
              if (result) {
                console.log('NLP Result:', result);
                input.value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default TensorGrid;
