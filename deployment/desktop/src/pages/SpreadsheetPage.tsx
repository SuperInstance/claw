import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Undo, Redo, Play, Info } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';

const SpreadsheetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentDocument, loadDocument, saveDocument } = useDocumentStore();
  const [cells, setCells] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      loadDocument(id);
    }
  }, [id, loadDocument]);

  const handleCellChange = (cellId: string, value: string) => {
    setCells((prev) => ({
      ...prev,
      [cellId]: value,
    }));
  };

  const handleSave = async () => {
    if (!currentDocument) return;
    setSaving(true);
    try {
      await saveDocument(
        currentDocument.id,
        currentDocument.name,
        { cells }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-14 bg-slate-900/50 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-medium">{currentDocument?.name || 'Untitled'}</h2>
          <span className="text-gray-500 text-sm">
            {selectedCell && `Selected: ${selectedCell}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-colors">
            <Redo className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-700" />
          <button className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-colors">
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Header Row */}
          <div className="flex border-b border-purple-500/20">
            <div className="w-12 h-8 flex items-center justify-center bg-slate-800/50 text-gray-400 text-xs font-medium">
              #
            </div>
            {Array.from({ length: 26 }, (_, i) => (
              <div
                key={i}
                className="w-24 h-8 flex items-center justify-center bg-slate-800/50 text-gray-400 text-xs font-medium border-l border-purple-500/20"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>

          {/* Data Rows */}
          {Array.from({ length: 100 }, (_, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-purple-500/20 last:border-b-0">
              <div className="w-12 h-8 flex items-center justify-center bg-slate-800/50 text-gray-400 text-xs font-medium">
                {rowIndex + 1}
              </div>
              {Array.from({ length: 26 }, (_, colIndex) => {
                const cellId = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`;
                return (
                  <input
                    key={cellId}
                    type="text"
                    value={cells[cellId] || ''}
                    onChange={(e) => handleCellChange(cellId, e.target.value)}
                    onFocus={() => setSelectedCell(cellId)}
                    onBlur={() => setSelectedCell(null)}
                    className="w-24 h-8 bg-transparent text-white text-sm px-2 border-l border-purple-500/20 focus:outline-none focus:bg-purple-500/10 focus:text-purple-300"
                  />
                );
              })}
            </div>
          ))}
        </div>

      {/* Agent Info Panel */}
      {selectedCell && (
        <div className="absolute bottom-4 right-4 w-80 bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-medium">Cell Agent: {selectedCell}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="text-white">Value</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetPage;
