import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Trash2, Search, Plus } from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { formatDate } from '../utils';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, loadDocuments, deleteDocument, createDocument, isLoading } =
    useDocumentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDocs, setFilteredDocs] = useState(documents);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredDocs(
        documents.filter((doc) =>
          doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredDocs(documents);
    }
  }, [searchQuery, documents]);

  const handleCreateNew = async () => {
    const newDoc = await createDocument();
    navigate(`/spreadsheet/${newDoc.id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-400">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Spreadsheet
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Loading documents...</div>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileSpreadsheet className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">
            {searchQuery ? 'No documents found' : 'No documents yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateNew}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Create your first spreadsheet
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc, index) => (
            <motion.button
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/spreadsheet/${doc.id}`)}
              className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-4 text-left hover:border-purple-500/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <FileSpreadsheet className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <button
                  onClick={(e) => handleDelete(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-white font-medium mb-1 truncate">
                {doc.name}
              </h3>
              <p className="text-sm text-gray-500">
                Created {formatDate(doc.created_at)}
              </p>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
