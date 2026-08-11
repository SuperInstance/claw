import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { Document } from '../types';
import { persist } from 'zustand/middleware';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDocuments: () => Promise<void>;
  loadDocument: (id: string) => Promise<Document>;
  saveDocument: (id: string, name: string, content: any, metadata?: any) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setCurrentDocument: (doc: Document | null) => void;
  createDocument: () => Promise<Document>;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      documents: [],
      currentDocument: null,
      isLoading: false,
      error: null,

      loadDocuments: async () => {
        set({ isLoading: true, error: null });
        try {
          const docs = await invoke<Document[]>('list_documents');
          set({ documents: docs, isLoading: false });
        } catch (error) {
          set({ error: String(error), isLoading: false });
        }
      },

      loadDocument: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const doc = await invoke<Document>('load_document', { id });
          set({ currentDocument: doc, isLoading: false });
          return doc;
        } catch (error) {
          set({ error: String(error), isLoading: false });
          throw error;
        }
      },

      saveDocument: async (id: string, name: string, content: any, metadata?: any) => {
        set({ isLoading: true, error: null });
        try {
          await invoke('save_document', { id, name, content, metadata });
          // Reload documents list
          await get().loadDocuments();
          set({ isLoading: false });
        } catch (error) {
          set({ error: String(error), isLoading: false });
          throw error;
        }
      },

      deleteDocument: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await invoke('delete_document', { id });
          await get().loadDocuments();
          set({ isLoading: false });
        } catch (error) {
          set({ error: String(error), isLoading: false });
          throw error;
        }
      },

      setCurrentDocument: (doc: Document | null) => {
        set({ currentDocument: doc });
      },

      createDocument: async () => {
        const id = crypto.randomUUID();
        const newDoc: Document = {
          id,
          name: 'Untitled Spreadsheet',
          content: JSON.stringify({ cells: [] }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await get().saveDocument(id, newDoc.name, JSON.parse(newDoc.content));
        return newDoc;
      },
    }),
    {
      name: 'document-storage',
      partialize: (state) => ({
        currentDocument: state.currentDocument,
      }),
    }
  )
);

// Set up file change listener
if (window.__TAURI__) {
  listen<string[]>('file-change', async (event) => {
    console.log('Files changed:', event.payload);
    // Handle file changes
  });
}
