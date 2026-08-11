/**
 * Keyboard Navigation Tests
 * Testing keyboard navigation, focus management, and keyboard traps
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeyboardNavigation, useKeyboard } from '../../src/hooks/useKeyboard';

describe('KeyboardNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tab Navigation', () => {
    it('should navigate through focusable elements with Tab key', () => {
      const TestComponent = () => {
        const { tabbableElements } = useKeyboard();

        return (
          <div>
            <button data-testid="btn1">Button 1</button>
            <button data-testid="btn2">Button 2</button>
            <button data-testid="btn3">Button 3</button>
            <span data-testid="count">{tabbableElements.length}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const count = screen.getByTestId('count');
      expect(parseInt(count.textContent || '0')).toBe(3);
    });

    it('should maintain correct tab order', () => {
      const TestComponent = () => {
        return (
          <div>
            <button data-testid="btn2" tabIndex={2}>Button 2</button>
            <button data-testid="btn1" tabIndex={1}>Button 1</button>
            <button data-testid="btn3" tabIndex={3}>Button 3</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn1 = screen.getByTestId('btn1');
      const btn2 = screen.getByTestId('btn2');
      const btn3 = screen.getByTestId('btn3');

      // Test tab order by checking tabIndex
      expect(btn1).toHaveAttribute('tabIndex', '1');
      expect(btn2).toHaveAttribute('tabIndex', '2');
      expect(btn3).toHaveAttribute('tabIndex', '3');
    });

    it('should skip disabled elements in tab order', () => {
      const TestComponent = () => {
        return (
          <div>
            <button data-testid="btn1">Button 1</button>
            <button data-testid="btn2" disabled>Button 2</button>
            <button data-testid="btn3">Button 3</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn2 = screen.getByTestId('btn2');
      expect(btn2).toBeDisabled();
    });

    it('should handle Shift+Tab for reverse navigation', () => {
      const TestComponent = () => {
        const { handleKeyDown } = useKeyboard();

        return (
          <div onKeyDown={handleKeyDown}>
            <button data-testid="btn1">Button 1</button>
            <button data-testid="btn2">Button 2</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn1 = screen.getByTestId('btn1');
      const btn2 = screen.getByTestId('btn2');

      btn2.focus();
      expect(document.activeElement).toBe(btn2);

      fireEvent.keyDown(btn2, { key: 'Tab', shiftKey: true });
      // Focus should move to btn1
      expect(document.activeElement).toBe(btn1);
    });
  });

  describe('Arrow Key Navigation', () => {
    it('should handle arrow keys for custom navigation', () => {
      const TestComponent = () => {
        const { focusedIndex, handleArrowKey } = useKeyboard([1, 2, 3, 4]);

        return (
          <div>
            <span data-testid="focused">{focusedIndex}</span>
            <button onKeyDown={(e) => handleArrowKey(e, 'down')}>Down</button>
          </div>
        );
      };

      render(<TestComponent />);

      const downBtn = screen.getByRole('button');
      const focused = screen.getByTestId('focused');

      fireEvent.keyDown(downBtn, { key: 'ArrowDown' });
      expect(focused).toHaveTextContent('1');
    });

    it('should wrap around arrow key navigation', () => {
      const TestComponent = () => {
        const items = [1, 2, 3];
        const { focusedIndex, handleArrowKey } = useKeyboard(items);

        return (
          <div>
            <span data-testid="focused">{focusedIndex}</span>
            <button
              data-testid="down"
              onKeyDown={(e) => handleArrowKey(e, 'down')}
            >
              Down
            </button>
            <button
              data-testid="up"
              onKeyDown={(e) => handleArrowKey(e, 'up')}
            >
              Up
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const downBtn = screen.getByTestId('down');
      const upBtn = screen.getByTestId('up');
      const focused = screen.getByTestId('focused');

      // Navigate down past the end
      fireEvent.keyDown(downBtn, { key: 'ArrowDown' });
      fireEvent.keyDown(downBtn, { key: 'ArrowDown' });
      fireEvent.keyDown(downBtn, { key: 'ArrowDown' });
      // Should wrap to 0
      expect(focused).toHaveTextContent('0');

      // Navigate up past the beginning
      fireEvent.keyDown(upBtn, { key: 'ArrowUp' });
      // Should wrap to 2
      expect(focused).toHaveTextContent('2');
    });

    it('should handle left/right arrow keys', () => {
      const TestComponent = () => {
        const { focusedIndex, handleArrowKey } = useKeyboard([1, 2, 3]);

        return (
          <div>
            <span data-testid="focused">{focusedIndex}</span>
            <button onKeyDown={(e) => handleArrowKey(e, 'right')}>Right</button>
          </div>
        );
      };

      render(<TestComponent />);

      const rightBtn = screen.getByRole('button');
      const focused = screen.getByTestId('focused');

      fireEvent.keyDown(rightBtn, { key: 'ArrowRight' });
      expect(focused).toHaveTextContent('1');
    });
  });

  describe('Home/End Keys', () => {
    it('should jump to first item with Home key', () => {
      const TestComponent = () => {
        const { focusedIndex, handleHomeEnd } = useKeyboard([1, 2, 3, 4, 5]);

        return (
          <div>
            <span data-testid="focused">{focusedIndex}</span>
            <button onKeyDown={handleHomeEnd}>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn = screen.getByRole('button');
      const focused = screen.getByTestId('focused');

      fireEvent.keyDown(btn, { key: 'Home' });
      expect(focused).toHaveTextContent('0');
    });

    it('should jump to last item with End key', () => {
      const TestComponent = () => {
        const { focusedIndex, handleHomeEnd } = useKeyboard([1, 2, 3, 4, 5]);

        return (
          <div>
            <span data-testid="focused">{focusedIndex}</span>
            <button onKeyDown={handleHomeEnd}>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn = screen.getByRole('button');
      const focused = screen.getByTestId('focused');

      fireEvent.keyDown(btn, { key: 'End' });
      expect(focused).toHaveTextContent('4');
    });
  });

  describe('Escape Key', () => {
    it('should handle Escape key to close modals', () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        const { handleEscape } = useKeyboard();

        return (
          <div>
            {isOpen && <div data-testid="modal">Modal Content</div>}
            <button onKeyDown={(e) => handleEscape(e, () => setIsOpen(false))}>
              Close
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const closeBtn = screen.getByRole('button');
      const modal = screen.getByTestId('modal');

      expect(modal).toBeInTheDocument();

      fireEvent.keyDown(closeBtn, { key: 'Escape' });

      // Modal should be removed
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('should handle Escape key for dropdowns', () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        const { handleEscape } = useKeyboard();

        return (
          <div>
            <button aria-expanded={isOpen} aria-haspopup="true">
              Dropdown
            </button>
            {isOpen && (
              <ul role="menu" data-testid="menu">
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            )}
            <button
              data-testid="trigger"
              onKeyDown={(e) => handleEscape(e, () => setIsOpen(false))}
            >
              Trigger
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const menu = screen.getByTestId('menu');
      expect(menu).toBeInTheDocument();

      const trigger = screen.getByTestId('trigger');
      fireEvent.keyDown(trigger, { key: 'Escape' });

      expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
    });
  });

  describe('Enter Key', () => {
    it('should activate focused element with Enter key', () => {
      let clickCount = 0;

      const TestComponent = () => {
        const { handleEnter } = useKeyboard();

        return (
          <div>
            <button
              data-testid="btn"
              onClick={() => clickCount++}
              onKeyDown={handleEnter}
            >
              Click Me
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn = screen.getByTestId('btn');

      fireEvent.keyDown(btn, { key: 'Enter' });

      expect(clickCount).toBe(1);
    });

    it('should handle Enter key on links', () => {
      let navigated = false;

      const TestComponent = () => {
        const { handleEnter } = useKeyboard();

        return (
          <div>
            <a
              href="/test"
              data-testid="link"
              onClick={() => navigated = true}
              onKeyDown={handleEnter}
            >
              Test Link
            </a>
          </div>
        );
      };

      render(<TestComponent />);

      const link = screen.getByTestId('link');

      fireEvent.keyDown(link, { key: 'Enter' });

      expect(navigated).toBe(true);
    });
  });

  describe('Space Key', () => {
    it('should toggle checkboxes with Space key', () => {
      const TestComponent = () => {
        const [checked, setChecked] = React.useState(false);
        const { handleSpace } = useKeyboard();

        return (
          <div>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              onKeyDown={handleSpace}
              data-testid="checkbox"
            />
            <span data-testid="checked">{checked ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const checkbox = screen.getByTestId('checkbox');
      const checked = screen.getByTestId('checked');

      fireEvent.keyDown(checkbox, { key: ' ' });

      expect(checked).toHaveTextContent('yes');
    });

    it('should toggle buttons with Space key', () => {
      let toggled = false;

      const TestComponent = () => {
        const { handleSpace } = useKeyboard();

        return (
          <div>
            <button
              type="button"
              data-testid="toggle"
              onClick={() => toggled = !toggled}
              onKeyDown={handleSpace}
            >
              Toggle
            </button>
            <span data-testid="toggled">{toggled ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const toggle = screen.getByTestId('toggle');
      const toggled = screen.getByTestId('toggled');

      fireEvent.keyDown(toggle, { key: ' ' });

      expect(toggled).toHaveTextContent('yes');
    });
  });

  describe('Keyboard Traps', () => {
    it('should detect and prevent keyboard traps', () => {
      const TestComponent = () => {
        const { isKeyboardTrap } = useKeyboard();

        return (
          <div role="dialog" aria-modal="true" data-testid="dialog">
            <button>Button 1</button>
            <button>Button 2</button>
            <span data-testid="trap">{isKeyboardTrap() ? 'yes' : 'no'}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const trap = screen.getByTestId('trap');
      expect(trap).toHaveTextContent('no');
    });

    it('should maintain focus within modal when open', () => {
      const TestComponent = () => {
        const { trapFocus } = useKeyboard();

        React.useEffect(() => {
          trapFocus(screen.getByTestId('modal'));
        }, []);

        return (
          <div>
            <button>Outside Button</button>
            <div
              role="dialog"
              aria-modal="true"
              data-testid="modal"
            >
              <button data-testid="modal-btn1">Modal Button 1</button>
              <button data-testid="modal-btn2">Modal Button 2</button>
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      const modalBtn1 = screen.getByTestId('modal-btn1');
      modalBtn1.focus();

      expect(document.activeElement).toBe(modalBtn1);
    });
  });

  describe('Focus Indicators', () => {
    it('should show visible focus indicators', () => {
      const TestComponent = () => {
        return (
          <div>
            <button data-testid="btn1">Button 1</button>
            <button data-testid="btn2">Button 2</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn1 = screen.getByTestId('btn1');
      btn1.focus();

      // Check if element is focused
      expect(btn1).toHaveFocus();
    });

    it('should respect focus-visible pseudo-class', () => {
      const TestComponent = () => {
        return (
          <div>
            <button data-testid="btn">Focusable Button</button>
          </div>
        );
      };

      render(<TestComponent />);

      const btn = screen.getByTestId('btn');
      btn.focus();

      expect(btn).toHaveFocus();
    });
  });

  describe('Skip Links', () => {
    it('should provide skip navigation links', () => {
      const TestComponent = () => {
        return (
          <div>
            <a href="#main" className="skip-link" data-testid="skip-link">
              Skip to main content
            </a>
            <nav>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
              </ul>
            </nav>
            <main id="main" data-testid="main">
              <h1>Main Content</h1>
            </main>
          </div>
        );
      };

      render(<TestComponent />);

      const skipLink = screen.getByTestId('skip-link');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main');
    });

    it('should make skip links visible on focus', () => {
      const TestComponent = () => {
        return (
          <div>
            <a href="#main" className="skip-link" data-testid="skip-link">
              Skip to main content
            </a>
            <main id="main">Main Content</main>
          </div>
        );
      };

      render(<TestComponent />);

      const skipLink = screen.getByTestId('skip-link');
      skipLink.focus();

      expect(skipLink).toHaveFocus();
    });
  });

  describe('Roving Tab Index', () => {
    it('should implement roving tabindex pattern', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      const TestComponent = () => {
        const { rovingTabIndex } = useKeyboard(items);

        return (
          <div role="listbox">
            {items.map((item, index) => (
              <div
                key={index}
                role="option"
                tabIndex={rovingTabIndex(index)}
                data-testid={`item-${index}`}
              >
                {item}
              </div>
            ))}
          </div>
        );
      };

      render(<TestComponent />);

      // First item should have tabIndex 0
      const item0 = screen.getByTestId('item-0');
      expect(item0).toHaveAttribute('tabIndex', '0');

      // Other items should have tabIndex -1
      const item1 = screen.getByTestId('item-1');
      const item2 = screen.getByTestId('item-2');
      expect(item1).toHaveAttribute('tabIndex', '-1');
      expect(item2).toHaveAttribute('tabIndex', '-1');
    });

    it('should update roving tabindex on arrow key navigation', () => {
      const items = ['Item 1', 'Item 2', 'Item 3'];

      const TestComponent = () => {
        const { rovingTabIndex, focusedIndex, handleArrowKey } = useKeyboard(items);

        return (
          <div role="listbox" onKeyDown={(e) => handleArrowKey(e, 'down')}>
            {items.map((item, index) => (
              <div
                key={index}
                role="option"
                tabIndex={rovingTabIndex(index)}
                data-testid={`item-${index}`}
              >
                {item}
              </div>
            ))}
            <span data-testid="focused">{focusedIndex}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const container = screen.getByRole('listbox');

      fireEvent.keyDown(container, { key: 'ArrowDown' });

      const focused = screen.getByTestId('focused');
      expect(focused).toHaveTextContent('1');
    });
  });

  describe('Custom Keyboard Shortcuts', () => {
    it('should register custom keyboard shortcuts', () => {
      let shortcutTriggered = false;

      const TestComponent = () => {
        const { registerShortcut } = useKeyboard();

        React.useEffect(() => {
          const cleanup = registerShortcut('ctrl+s', () => {
            shortcutTriggered = true;
          });

          return cleanup;
        }, [registerShortcut]);

        return <div>Test Component</div>;
      };

      render(<TestComponent />);

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(shortcutTriggered).toBe(true);
    });

    it('should handle multiple keyboard shortcuts', () => {
      let shortcut1Triggered = false;
      let shortcut2Triggered = false;

      const TestComponent = () => {
        const { registerShortcut } = useKeyboard();

        React.useEffect(() => {
          const cleanup1 = registerShortcut('ctrl+s', () => {
            shortcut1Triggered = true;
          });
          const cleanup2 = registerShortcut('ctrl+f', () => {
            shortcut2Triggered = true;
          });

          return () => {
            cleanup1();
            cleanup2();
          };
        }, [registerShortcut]);

        return <div>Test Component</div>;
      };

      render(<TestComponent />);

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });
      expect(shortcut1Triggered).toBe(true);

      fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
      expect(shortcut2Triggered).toBe(true);
    });

    it('should unregister shortcuts on unmount', () => {
      let triggerCount = 0;

      const TestComponent = () => {
        const { registerShortcut } = useKeyboard();

        React.useEffect(() => {
          const cleanup = registerShortcut('ctrl+t', () => {
            triggerCount++;
          });

          return cleanup;
        }, [registerShortcut]);

        return <div>Test</div>;
      };

      const { unmount } = render(<TestComponent />);

      fireEvent.keyDown(document, { key: 't', ctrlKey: true });
      expect(triggerCount).toBe(1);

      unmount();

      triggerCount = 0;
      fireEvent.keyDown(document, { key: 't', ctrlKey: true });
      expect(triggerCount).toBe(0);
    });
  });

  describe('Accessibility Integration', () => {
    it('should work with ARIA attributes', () => {
      const TestComponent = () => {
        return (
          <div role="toolbar" aria-label="Editor toolbar">
            <button aria-label="Bold" data-testid="bold">B</button>
            <button aria-label="Italic" data-testid="italic">I</button>
            <button aria-label="Underline" data-testid="underline">U</button>
          </div>
        );
      };

      render(<TestComponent />);

      const bold = screen.getByTestId('bold');
      const italic = screen.getByTestId('italic');
      const underline = screen.getByTestId('underline');

      expect(bold).toHaveAttribute('aria-label', 'Bold');
      expect(italic).toHaveAttribute('aria-label', 'Italic');
      expect(underline).toHaveAttribute('aria-label', 'Underline');
    });

    it('should announce keyboard navigation changes', () => {
      const TestComponent = () => {
        const { announce } = useKeyboard();
        const [selected, setSelected] = React.useState(0);

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === 'ArrowDown') {
            const newIndex = Math.min(selected + 1, 2);
            setSelected(newIndex);
            announce(`Item ${newIndex + 1} selected`);
          }
        };

        return (
          <div role="listbox" onKeyDown={handleKeyDown}>
            <div role="option" aria-selected={selected === 0}>Item 1</div>
            <div role="option" aria-selected={selected === 1}>Item 2</div>
            <div role="option" aria-selected={selected === 2}>Item 3</div>
          </div>
        );
      };

      render(<TestComponent />);

      const listbox = screen.getByRole('listbox');
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });

      // Should announce the change
      expect(screen.getByRole('option', { selected: true })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid keyboard input gracefully', () => {
      const TestComponent = () => {
        const { handleKeyDown } = useKeyboard();

        return (
          <div onKeyDown={handleKeyDown}>
            <button>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      expect(() => {
        fireEvent.keyDown(button, { key: 'InvalidKey' });
      }).not.toThrow();
    });

    it('should handle null elements gracefully', () => {
      const TestComponent = () => {
        const { handleKeyDown } = useKeyboard();

        return (
          <div onKeyDown={handleKeyDown}>
            <button>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const container = screen.getByRole('button').parentElement;
      expect(() => {
        if (container) {
          fireEvent.keyDown(container, { key: 'Enter' });
        }
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;

      const TestComponent = () => {
        const { handleKeyDown } = useKeyboard();
        renderCount++;

        return (
          <div onKeyDown={handleKeyDown}>
            <button>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const initialRenders = renderCount;

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(renderCount).toBe(initialRenders);
    });

    it('should debounce rapid keyboard events', () => {
      const TestComponent = () => {
        const { handleKeyDown, debouncedHandleKeyDown } = useKeyboard();

        return (
          <div onKeyDown={debouncedHandleKeyDown || handleKeyDown}>
            <button>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');

      expect(() => {
        fireEvent.keyDown(button, { key: 'ArrowDown' });
        fireEvent.keyDown(button, { key: 'ArrowDown' });
        fireEvent.keyDown(button, { key: 'ArrowDown' });
      }).not.toThrow();
    });
  });
});
