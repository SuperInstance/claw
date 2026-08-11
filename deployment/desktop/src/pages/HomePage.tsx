import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Plus,
  Clock,
  Star,
  Download,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { useDocumentStore } from '../store/documentStore';
import { formatDate } from '../utils';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { documents } = useDocumentStore();

  const recentDocuments = documents.slice(0, 5);

  const actions = [
    {
      icon: Plus,
      label: 'New Spreadsheet',
      description: 'Create a new AI-powered spreadsheet',
      action: () => navigate('/spreadsheet/new'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FolderOpen,
      label: 'Open File',
      description: 'Open CSV or Excel file',
      action: () => navigate('/documents'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Download,
      label: 'Templates',
      description: 'Browse spreadsheet templates',
      action: () => {},
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome to Spreadsheet Moment
        </h1>
        <p className="text-gray-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Every cell is a SuperInstance agent
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.action}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 text-left hover:border-purple-500/40 transition-all group"
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {action.label}
            </h3>
            <p className="text-sm text-gray-400">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Recent Documents */}
      {recentDocuments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              Recent Spreadsheets
            </h2>
            <button
              onClick={() => navigate('/documents')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {recentDocuments.map((doc) => (
              <button
                key={doc.id}
                onClick={() => navigate(`/spreadsheet/${doc.id}`)}
                className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-800/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className="text-white font-medium group-hover:text-purple-300 transition-colors">
                      {doc.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Modified {formatDate(doc.updated_at)}
                    </p>
                  </div>
                </div>
                <Star className="w-5 h-5 text-gray-600 group-hover:text-yellow-400 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HomePage;
