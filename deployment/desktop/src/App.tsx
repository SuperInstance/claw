import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTauriContext } from './contexts/TauriContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SpreadsheetPage from './pages/SpreadsheetPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import { useDocumentStore } from './store/documentStore';
import { useSystemStore } from './store/systemStore';

function App() {
  const { initTauri } = useTauriContext();
  const loadDocuments = useDocumentStore((state) => state.loadDocuments);
  const checkForUpdates = useSystemStore((state) => state.checkForUpdates);

  useEffect(() => {
    const init = async () => {
      await initTauri();
      await loadDocuments();

      // Check for updates on startup
      const updateAvailable = await checkForUpdates();
      if (updateAvailable) {
        // Show notification about update
        if (window.__TAURI__) {
          // Will show update notification
        }
      }
    };

    init();
  }, [initTauri, loadDocuments, checkForUpdates]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="spreadsheet/:id" element={<SpreadsheetPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
