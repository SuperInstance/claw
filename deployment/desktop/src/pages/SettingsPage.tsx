import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Bell, Palette, Keyboard } from 'lucide-react';
import { useSystemStore } from '../store/systemStore';

const SettingsPage: React.FC = () => {
  const { systemInfo, appVersion, getSystemInfo, getAppVersion, sendNotification } =
    useSystemStore();

  useEffect(() => {
    getSystemInfo();
    getAppVersion();
  }, [getSystemInfo, getAppVersion]);

  const settingsSections = [
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure how you receive notifications',
    },
    {
      icon: Palette,
      title: 'Appearance',
      description: 'Customize the app appearance and theme',
    },
    {
      icon: Keyboard,
      title: 'Shortcuts',
      description: 'View and customize keyboard shortcuts',
    },
    {
      icon: Info,
      title: 'About',
      description: `Spreadsheet Moment v${appVersion || '1.0.0'}`,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <motion.button
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-6 text-left hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <section.icon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-400">{section.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* System Information */}
      {systemInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Operating System</p>
              <p className="text-white font-medium">{systemInfo.os}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Architecture</p>
              <p className="text-white font-medium">{systemInfo.arch}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Version</p>
              <p className="text-white font-medium">{systemInfo.version}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test Notification Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <button
          onClick={() => sendNotification('Test Notification', 'This is a test notification from Spreadsheet Moment')}
          className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors"
        >
          Test Notification
        </button>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
