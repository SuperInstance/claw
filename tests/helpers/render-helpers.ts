/**
 * Component Rendering Helpers
 * Utilities for testing React components
 */

import { render } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function with global providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: {
    route?: string;
    locale?: string;
    theme?: 'light' | 'dark';
    user?: any;
  } = {}
) {
  const { route = '/', locale = 'en-US', theme = 'light', user = null } = options;

  // Mock router
  window.history.pushState({}, '', route);

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div data-testid="provider-wrapper" data-locale={locale} data-theme={theme}>
        {children}
      </div>
    );
  };

  return {
    ...render(ui, { wrapper: Wrapper }),
    // Add custom helpers
    rerenderWithProviders: (ui: ReactElement, newOptions?: typeof options) =>
      renderWithProviders(ui, { ...options, ...newOptions }),
  };
}

/**
 * Render component with accessibility context
 */
export function renderWithA11y(ui: ReactElement) {
  return renderWithProviders(ui, {
    locale: 'en-US',
    theme: 'light',
  });
}

/**
 * Render component with mock user authentication
 */
export function renderWithAuth(ui: ReactElement, user: any) {
  return renderWithProviders(ui, { user });
}
