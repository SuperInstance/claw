import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FileSpreadsheet,
  FolderOpen,
  Settings,
  Menu,
  X,
  Minus,
  Square,
  X as Close,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { minimizeWindow, maximizeWindow, closeWindow } from '../utils';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Spreadsheet', href: '/spreadsheet/new', icon: FileSpreadsheet },
    { name: 'Documents', href: '/documents', icon: FolderOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 70 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-slate-900/50 backdrop-blur-xl border-r border-purple-500/20 flex flex-col"
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white font-semibold"
              >
                Spreadsheet Moment
              </motion.span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.name}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20">
          {sidebarOpen && (
            <div className="text-xs text-gray-500">
              <p>Version 1.0.0</p>
              <p className="mt-1">Powered by SuperInstance</p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Title Bar (Custom Window Controls) */}
        {window.__TAURI__ && (
          <div className="h-14 bg-slate-900/50 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-end px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={minimizeWindow}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={maximizeWindow}
                className="p-2 text-gray-400 hover:text-white hover:bg-slate-800/50 rounded transition-colors"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={closeWindow}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800/50 rounded transition-colors"
              >
                <Close className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
