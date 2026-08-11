// Tauri type definitions for v1.x
export {};

declare global {
  interface Window {
    __TAURI__?: {
      invoke: <T = any>(command: string, args?: Record<string, any>) => Promise<T>;
      once: (event: string, handler: (...args: any[]) => void) => void;
      convertFileSrc: (src: string, protocol?: string) => string;
      core?: {
        invoke: <T = any>(command: string, args?: Record<string, any>) => Promise<T>;
        once: (event: string, handler: (...args: any[]) => void) => void;
      };
      notification?: any;
    };
  }

  const __TAURI__: {
    invoke: <T = any>(command: string, args?: Record<string, any>) => Promise<T>;
    once: (event: string, handler: (...args: any[]) => void) => void;
    convertFileSrc: (src: string, protocol?: string) => string;
    core?: {
      invoke: <T = any>(command: string, args?: Record<string, any>) => Promise<T>;
      once: (event: string, handler: (...args: any[]) => void) => void;
    };
    notification?: any;
  };
}
