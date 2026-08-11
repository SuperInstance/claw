/**
 * NLP Cell Editor Component
 *
 * Natural language cell editor that allows users to create and modify
 * spreadsheet cells using natural language commands.
 *
 * Features:
 * - Natural language to formula translation
 * - Agent cell creation ("Create an agent cell that...")
 * - I/O configuration ("Connect to Arduino on port COM3...")
 * - Tensor operations ("Create a 3x3 matrix with...")
 *
 * @author SuperInstance Evolution Team
 * @date 2026-03-14
 * @version Round 2 Implementation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Code, Database, Network, Zap, Send, Loader2 } from 'lucide-react';
import TensorGrid, { TensorCell, CellType } from './TensorGrid';

// ============================================================================
// Types
// ============================================================================

interface NLPResponse {
  result: any;
  explanation?: string;
  confidence: number;
  suggestions?: string[];
}

interface NLPSuggestion {
  text: string;
  type: 'agent' | 'io' | 'formula' | 'tensor';
  icon: React.ReactNode;
}

// ============================================================================
// Props
// ============================================================================

interface NLPEditorProps {
  onCellCreate: (cell: Partial<TensorCell>) => void;
  onCellUpdate: (cellId: string, value: any) => void;
  cells: Map<string, TensorCell>;
  selectedCellId?: string;
}

// ============================================================================
// Component
// ============================================================================

export const NLPEditor: React.FC<NLPEditorProps> = ({
  onCellCreate,
  onCellUpdate,
  cells,
  selectedCellId
}) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<NLPResponse | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions: NLPSuggestion[] = [
    {
      text: 'Create an agent cell that monitors temperature',
      type: 'agent',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      text: 'Connect to Arduino on COM3 at 9600 baud',
      type: 'io',
      icon: <Database className="w-4 h-4" />
    },
    {
      text: 'Create a 3x3 matrix with random values',
      type: 'tensor',
      icon: <Code className="w-4 h-4" />
    },
    {
      text: 'Fetch data from https://api.example.com/data',
      type: 'api',
      icon: <Network className="w-4 h-4" />
    }
  ];

  /**
   * Process NLP query
   */
  const processQuery = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setResponse(null);

    try {
      const res = await fetch('/api/nlp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          cellId: selectedCellId,
          context: {
            cells: Array.from(cells.entries())
          }
        })
      });

      const data: NLPResponse = await res.json();
      setResponse(data);

      // Auto-apply if high confidence
      if (data.confidence > 0.9 && data.result) {
        if (selectedCellId) {
          onCellUpdate(selectedCellId, data.result);
        } else if (data.result.cell) {
          onCellCreate(data.result.cell);
        }
      }
    } catch (error) {
      console.error('NLP processing failed:', error);
      setResponse({
        result: null,
        explanation: 'Failed to process query. Please try again.',
        confidence: 0
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedCellId, cells, onCellCreate, onCellUpdate]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: NLPSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setTimeout(() => processQuery(suggestion.text), 100);
  }, [processQuery]);

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    processQuery(query);
  }, [query, processQuery]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="nlp-editor">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">NLP Cell Editor</h3>
          <p className="text-sm text-gray-600">
            {selectedCellId ? `Editing cell ${selectedCellId}` : 'Creating new cell'}
          </p>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Describe what you want to create or modify..."
            className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="p-2 bg-gray-100 rounded">
                    {suggestion.icon}
                  </div>
                  <span className="text-sm text-gray-700">{suggestion.text}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-100 rounded-lg"
          >
            {/* Confidence bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Confidence</span>
                <span className="text-sm text-gray-600">
                  {(response.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${response.confidence * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${
                    response.confidence > 0.8
                      ? 'bg-green-500'
                      : response.confidence > 0.5
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Explanation */}
            {response.explanation && (
              <div className="flex items-start gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{response.explanation}</p>
              </div>
            )}

            {/* Result preview */}
            {response.result && (
              <div className="p-3 bg-white rounded border border-gray-200">
                <pre className="text-xs text-gray-700 overflow-x-auto">
                  {JSON.stringify(response.result, null, 2)}
                </pre>
              </div>
            )}

            {/* Suggestions */}
            {response.suggestions && response.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Did you mean:</p>
                <div className="flex flex-wrap gap-2">
                  {response.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion);
                        processQuery(suggestion);
                      }}
                      className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Apply button (for low confidence results) */}
            {response.confidence <= 0.9 && response.result && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    if (selectedCellId) {
                      onCellUpdate(selectedCellId, response.result);
                    } else if (response.result.cell) {
                      onCellCreate(response.result.cell);
                    }
                    setResponse(null);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Apply
                </button>
                <button
                  onClick={() => setResponse(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> You can create agent cells, connect to hardware,
          define formulas, or create tensors using natural language.
          Try describing what you want in plain English!
        </p>
      </div>
    </div>
  );
};

export default NLPEditor;
