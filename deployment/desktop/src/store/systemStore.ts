import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';
import { SystemInfo } from '../types';

interface SystemState {
  systemInfo: SystemInfo | null;
  appVersion: string;
  updateAvailable: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  getSystemInfo: () => Promise<SystemInfo>;
  getAppVersion: () => Promise<string>;
  checkForUpdates: () => Promise<boolean>;
  sendNotification: (title: string, body: string) => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  systemInfo: null,
  appVersion: '',
  updateAvailable: false,
  isLoading: false,
  error: null,

  getSystemInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const info = await invoke<SystemInfo>('get_system_info');
      set({ systemInfo: info, isLoading: false });
      return info;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  getAppVersion: async () => {
    set({ isLoading: true, error: null });
    try {
      const version = await invoke<string>('get_app_version');
      set({ appVersion: version, isLoading: false });
      return version;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  checkForUpdates: async () => {
    set({ isLoading: true, error: null });
    try {
      await invoke('check_updates');
      // The updater plugin will handle the actual update check
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      return false;
    }
  },

  sendNotification: async (title: string, body: string) => {
    try {
      await invoke('send_notification', { title, body });
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  },
}));
