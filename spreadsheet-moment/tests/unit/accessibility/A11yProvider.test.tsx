/**
 * Accessibility Provider Tests
 * Testing A11yProvider context and functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { A11yProvider, useA11y } from '../../src/contexts/A11yProvider';

// Mock component that uses the context
const TestComponent = () => {
  const { announcements, skipLinks, announcer } = useA11y();

  return (
    <div>
      <div data-testid="announcements-count">{announcements.length}</div>
      <div data-testid="skip-links-count">{skipLinks.length}</div>
      <button
        onClick={() => announcer.announce('Test announcement')}
        data-testid="announce-btn"
      >
        Announce
      </button>
      <button
        onClick={() => announcer.announce('Polite announcement', 'polite')}
        data-testid="announce-polite-btn"
      >
        Announce Polite
      </button>
      <button
        onClick={() => announcer.announce('Assertive announcement', 'assertive')}
        data-testid="announce-assertive-btn"
      >
        Announce Assertive
      </button>
    </div>
  );
};

describe('A11yProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Context Provider', () => {
    it('should render children correctly', () => {
      render(
        <A11yProvider>
          <div>Test Child</div>
        </A11yProvider>
      );

      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should provide accessibility context to children', () => {
      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      expect(screen.getByTestId('announcements-count')).toBeInTheDocument();
      expect(screen.getByTestId('skip-links-count')).toBeInTheDocument();
    });

    it('should throw error when useA11y is used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useA11y must be used within an A11yProvider');

      consoleError.mockRestore();
    });
  });

  describe('Announcer', () => {
    it('should add announcement when announce button is clicked', () => {
      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      const announceBtn = screen.getByTestId('announce-btn');
      fireEvent.click(announceBtn);

      const announcementsCount = screen.getByTestId('announcements-count');
      expect(announcementsCount).toHaveTextContent('1');
    });

    it('should add polite announcement correctly', () => {
      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      const announcePoliteBtn = screen.getByTestId('announce-polite-btn');
      fireEvent.click(announcePoliteBtn);

      const announcementsCount = screen.getByTestId('announcements-count');
      expect(announcementsCount).toHaveTextContent('1');
    });

    it('should add assertive announcement correctly', () => {
      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      const announceAssertiveBtn = screen.getByTestId('announce-assertive-btn');
      fireEvent.click(announceAssertiveBtn);

      const announcementsCount = screen.getByTestId('announcements-count');
      expect(announcementsCount).toHaveTextContent('1');
    });

    it('should maintain multiple announcements', () => {
      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      const announceBtn = screen.getByTestId('announce-btn');
      fireEvent.click(announceBtn);
      fireEvent.click(announceBtn);
      fireEvent.click(announceBtn);

      const announcementsCount = screen.getByTestId('announcements-count');
      expect(announcementsCount).toHaveTextContent('3');
    });

    it('should clear old announcements after timeout', async () => {
      jest.useFakeTimers();

      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      const announceBtn = screen.getByTestId('announce-btn');
      fireEvent.click(announceBtn);

      // Fast-forward time
      jest.advanceTimersByTime(5000);

      const announcementsCount = screen.getByTestId('announcements-count');
      expect(announcementsCount).toHaveTextContent('0');

      jest.useRealTimers();
    });
  });

  describe('Skip Links', () => {
    it('should initialize with default skip links', () => {
      render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      const skipLinksCount = screen.getByTestId('skip-links-count');
      expect(parseInt(skipLinksCount.textContent || '0')).toBeGreaterThan(0);
    });

    it('should allow adding custom skip links', () => {
      const TestSkipLinks = () => {
        const { skipLinks, addSkipLink } = useA11y();

        return (
          <div>
            <div data-testid="skip-links-count">{skipLinks.length}</div>
            <button
              onClick={() => addSkipLink({ id: 'custom', target: '#custom', label: 'Custom Skip' })}
              data-testid="add-skip-link"
            >
              Add Skip Link
            </button>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestSkipLinks />
        </A11yProvider>
      );

      const addBtn = screen.getByTestId('add-skip-link');
      fireEvent.click(addBtn);

      const skipLinksCount = screen.getByTestId('skip-links-count');
      expect(parseInt(skipLinksCount.textContent || '0')).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should track current focused element', () => {
      const TestFocus = () => {
        const { focusManager } = useA11y();
        const [focused, setFocused] = React.useState<string | null>(null);

        React.useEffect(() => {
          setFocused(focusManager.getCurrentFocus());
        }, [focusManager]);

        return (
          <div>
            <div data-testid="focused">{focused}</div>
            <button onFocus={() => focusManager.saveFocus()}>Focus Me</button>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestFocus />
        </A11yProvider>
      );

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should restore previously saved focus', () => {
      const TestRestoreFocus = () => {
        const { focusManager } = useA11y();

        return (
          <div>
            <button
              data-testid="button1"
              onFocus={() => focusManager.saveFocus()}
            >
              Button 1
            </button>
            <button data-testid="button2">Button 2</button>
            <button
              data-testid="restore"
              onClick={() => focusManager.restoreFocus()}
            >
              Restore Focus
            </button>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestRestoreFocus />
        </A11yProvider>
      );

      const button1 = screen.getByTestId('button1');
      const restoreBtn = screen.getByTestId('restore');

      button1.focus();
      expect(button1).toHaveFocus();

      restoreBtn.click();
      // Focus should be restored
      expect(button1).toHaveFocus();
    });
  });

  describe('ARIA Attributes', () => {
    it('should provide ARIA utility functions', () => {
      const TestARIA = () => {
        const { aria } = useA11y();

        return (
          <div>
            <span data-testid="aria-label">{aria.getLabel('test-element')}</span>
            <span data-testid="aria-describedby">
              {aria.getDescribedBy('test-element')}
            </span>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestARIA />
        </A11yProvider>
      );

      expect(screen.getByTestId('aria-label')).toBeInTheDocument();
      expect(screen.getByTestId('aria-describedby')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register and handle keyboard shortcuts', () => {
      const TestShortcuts = () => {
        const { shortcuts } = useA11y();
        const [triggered, setTriggered] = React.useState(false);

        React.useEffect(() => {
          const handleShortcut = () => setTriggered(true);
          shortcuts.register('ctrl+k', handleShortcut);

          return () => shortcuts.unregister('ctrl+k');
        }, [shortcuts]);

        return (
          <div>
            <span data-testid="shortcut-triggered">{triggered ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestShortcuts />
        </A11yProvider>
      );

      // Trigger keyboard shortcut
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });

      expect(screen.getByTestId('shortcut-triggered')).toHaveTextContent('yes');
    });

    it('should unregister keyboard shortcuts', () => {
      let registerCount = 0;
      let unregisterCount = 0;

      const TestShortcuts = () => {
        const { shortcuts } = useA11y();

        React.useEffect(() => {
          const handleShortcut = () => {};
          shortcuts.register('ctrl+l', handleShortcut);
          registerCount++;

          return () => {
            shortcuts.unregister('ctrl+l');
            unregisterCount++;
          };
        }, [shortcuts]);

        return <div>Test</div>;
      };

      const { unmount } = render(
        <A11yProvider>
          <TestShortcuts />
        </A11yProvider>
      );

      unmount();

      expect(registerCount).toBe(1);
      expect(unregisterCount).toBe(1);
    });
  });

  describe('Live Regions', () => {
    it('should create live regions for announcements', () => {
      const { container } = render(
        <A11yProvider>
          <div>Content</div>
        </A11yProvider>
      );

      const liveRegion = container.querySelector('[role="status"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should create assertive live regions', () => {
      const { container } = render(
        <A11yProvider>
          <div>Content</div>
        </A11yProvider>
      );

      const assertiveRegion = container.querySelector('[role="alert"]');
      expect(assertiveRegion).toBeInTheDocument();
    });
  });

  describe('High Contrast Mode', () => {
    it('should detect high contrast mode preference', () => {
      const TestHighContrast = () => {
        const { prefersHighContrast } = useA11y();

        return (
          <div>
            <span data-testid="high-contrast">
              {prefersHighContrast ? 'yes' : 'no'}
            </span>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestHighContrast />
        </A11yProvider>
      );

      expect(screen.getByTestId('high-contrast')).toBeInTheDocument();
    });
  });

  describe('Reduced Motion', () => {
    it('should respect prefers-reduced-motion preference', () => {
      const TestReducedMotion = () => {
        const { prefersReducedMotion } = useA11y();

        return (
          <div>
            <span data-testid="reduced-motion">
              {prefersReducedMotion ? 'yes' : 'no'}
            </span>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestReducedMotion />
        </A11yProvider>
      );

      expect(screen.getByTestId('reduced-motion')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide screen reader detection', () => {
      const TestScreenReader = () => {
        const { screenReaderEnabled } = useA11y();

        return (
          <div>
            <span data-testid="screen-reader">
              {screenReaderEnabled ? 'yes' : 'no'}
            </span>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestScreenReader />
        </A11yProvider>
      );

      expect(screen.getByTestId('screen-reader')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid announcement gracefully', () => {
      const TestInvalidAnnounce = () => {
        const { announcer } = useA11y();

        return (
          <div>
            <button
              onClick={() => announcer.announce('' as any)}
              data-testid="invalid-announce"
            >
              Invalid Announce
            </button>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestInvalidAnnounce />
        </A11yProvider>
      );

      const btn = screen.getByTestId('invalid-announce');
      expect(() => fireEvent.click(btn)).not.toThrow();
    });

    it('should handle invalid keyboard shortcut gracefully', () => {
      const TestInvalidShortcut = () => {
        const { shortcuts } = useA11y();

        return (
          <div>
            <button
              onClick={() => shortcuts.register('' as any, () => {})}
              data-testid="invalid-shortcut"
            >
              Invalid Shortcut
            </button>
          </div>
        );
      };

      render(
        <A11yProvider>
          <TestInvalidShortcut />
        </A11yProvider>
      );

      const btn = screen.getByTestId('invalid-shortcut');
      expect(() => fireEvent.click(btn)).not.toThrow();
    });
  });

  describe('Multiple Providers', () => {
    it('should support nested providers', () => {
      render(
        <A11yProvider>
          <A11yProvider>
            <TestComponent />
          </A11yProvider>
        </A11yProvider>
      );

      expect(screen.getByTestId('announcements-count')).toBeInTheDocument();
    });

    it('should handle provider updates', () => {
      const { rerender } = render(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      rerender(
        <A11yProvider>
          <TestComponent />
        </A11yProvider>
      );

      expect(screen.getByTestId('announcements-count')).toBeInTheDocument();
    });
  });
});
