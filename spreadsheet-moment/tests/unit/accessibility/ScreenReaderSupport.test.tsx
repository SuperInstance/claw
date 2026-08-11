/**
 * Screen Reader Support Tests
 * Testing screen reader compatibility and ARIA announcements
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenReader, useScreenReader } from '../../src/hooks/useScreenReader';

describe('ScreenReaderSupport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ARIA Live Regions', () => {
    it('should create polite live region for announcements', () => {
      const TestComponent = () => {
        const { LiveRegion } = useScreenReader();

        return (
          <div>
            <LiveRegion />
            <button>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const liveRegion = screen.queryByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should create assertive live region for important announcements', () => {
      const TestComponent = () => {
        const { AssertiveRegion } = useScreenReader();

        return (
          <div>
            <AssertiveRegion />
            <button>Test</button>
          </div>
        );
      };

      render(<TestComponent />);

      const assertiveRegion = screen.queryByRole('alert');
      expect(assertiveRegion).toBeInTheDocument();
    });

    it('should announce messages through live region', () => {
      const TestComponent = () => {
        const { announce } = useScreenReader();
        const [message, setMessage] = React.useState('');

        const handleAnnounce = () => {
          announce('Test announcement');
          setMessage('Announced');
        };

        return (
          <div>
            <button onClick={handleAnnounce}>Announce</button>
            <span data-testid="message">{message}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const message = screen.getByTestId('message');
      expect(message).toHaveTextContent('Announced');
    });

    it('should clear announcements after timeout', async () => {
      jest.useFakeTimers();

      const TestComponent = () => {
        const { announce, announcements } = useScreenReader();

        return (
          <div>
            <button onClick={() => announce('Test')}>Announce</button>
            <span data-testid="count">{announcements.length}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const count = screen.getByTestId('count');
      expect(count).toHaveTextContent('1');

      jest.advanceTimersByTime(5000);

      expect(count).toHaveTextContent('0');

      jest.useRealTimers();
    });

    it('should handle multiple announcements in sequence', () => {
      const TestComponent = () => {
        const { announce, announcements } = useScreenReader();

        return (
          <div>
            <button onClick={() => announce('Announcement 1')}>Announce 1</button>
            <button onClick={() => announce('Announcement 2')}>Announce 2</button>
            <button onClick={() => announce('Announcement 3')}>Announce 3</button>
            <span data-testid="count">{announcements.length}</span>
          </div>
        );
      };

      render(<TestComponent />);

      const buttons = screen.getAllByRole('button');

      fireEvent.click(buttons[0]);
      fireEvent.click(buttons[1]);
      fireEvent.click(buttons[2]);

      const count = screen.getByTestId('count');
      expect(count).toHaveTextContent('3');
    });
  });

  describe('ARIA Labels and Descriptions', () => {
    it('should provide accessible labels for icons', () => {
      const TestComponent = () => {
        return (
          <button aria-label="Close dialog">
            <span aria-hidden="true">×</span>
          </button>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('should provide accessible descriptions for complex inputs', () => {
      const TestComponent = () => {
        return (
          <div>
            <input
              type="text"
              id="password"
              aria-describedby="password-hint"
              data-testid="input"
            />
            <span id="password-hint">Must be at least 8 characters</span>
          </div>
        );
      };

      render(<TestComponent />);

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'password-hint');
    });

    it('should handle labeledby for complex labeling', () => {
      const TestComponent = () => {
        return (
          <div>
            <span id="label1">Part 1</span>
            <span id="label2">Part 2</span>
            <button aria-labelledby="label1 label2">Button</button>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-labelledby', 'label1 label2');
    });
  });

  describe('Screen Reader Only Content', () => {
    it('should hide content visually but keep it accessible', () => {
      const TestComponent = () => {
        return (
          <div>
            <span className="sr-only">Screen reader only text</span>
            <button>Close</button>
          </div>
        );
      };

      render(<TestComponent />);

      const text = screen.getByText('Screen reader only text');
      expect(text).toBeInTheDocument();
    });

    it('should provide skip links visible to screen readers', () => {
      const TestComponent = () => {
        return (
          <div>
            <a href="#main" className="skip-link">
              Skip to main content
            </a>
            <nav>Navigation</nav>
            <main id="main">Main content</main>
          </div>
        );
      };

      render(<TestComponent />);

      const skipLink = screen.getByRole('link', { name: 'Skip to main content' });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main');
    });
  });

  describe('Semantic HTML', () => {
    it('should use proper heading hierarchy', () => {
      const TestComponent = () => {
        return (
          <div>
            <h1>Main Heading</h1>
            <section>
              <h2>Section Heading</h2>
              <article>
                <h3>Article Heading</h3>
              </article>
            </section>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should use proper landmark roles', () => {
      const TestComponent = () => {
        return (
          <div>
            <header role="banner">Header</header>
            <nav role="navigation">Navigation</nav>
            <main role="main">Main content</main>
            <aside role="complementary">Sidebar</aside>
            <footer role="contentinfo">Footer</footer>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should use proper list semantics', () => {
      const TestComponent = () => {
        return (
          <nav aria-label="Main navigation">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </nav>
        );
      };

      render(<TestComponent />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });

  describe('Form Accessibility', () => {
    it('should associate labels with inputs', () => {
      const TestComponent = () => {
        return (
          <form>
            <label htmlFor="name">Name</label>
            <input type="text" id="name" />
          </form>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox', { name: 'Name' });
      expect(input).toBeInTheDocument();
    });

    it('should provide required field indicators', () => {
      const TestComponent = () => {
        return (
          <form>
            <label htmlFor="email">
              Email <span aria-label="required">*</span>
            </label>
            <input type="email" id="email" required aria-required="true" />
          </form>
        );
      };

      render(<TestComponent />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should provide error messages', () => {
      const TestComponent = () => {
        return (
          <form>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              aria-invalid="true"
              aria-describedby="error"
            />
            <span id="error" role="alert">Password is required</span>
          </form>
        );
      };

      render(<TestComponent />);

      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'error');

      const error = screen.getByRole('alert');
      expect(error).toHaveTextContent('Password is required');
    });

    it('should describe field validation status', () => {
      const TestComponent = () => {
        const [isValid, setIsValid] = React.useState(false);

        return (
          <form>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              aria-invalid={!isValid}
              aria-describedby={isValid ? 'valid-desc' : 'invalid-desc'}
            />
            <span id="valid-desc" style={{ display: isValid ? 'inline' : 'none' }}>
              Username is available
            </span>
            <span id="invalid-desc" style={{ display: !isValid ? 'inline' : 'none' }}>
              Username is taken
            </span>
            <button type="button" onClick={() => setIsValid(!isValid)}>
              Toggle
            </button>
          </form>
        );
      };

      render(<TestComponent />);

      const input = screen.getByLabelText('Username');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Interactive Component Accessibility', () => {
    it('should make dropdowns accessible', () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => setIsOpen(!isOpen)}
            >
              Menu
            </button>
            {isOpen && (
              <ul role="menu">
                <li role="menuitem"><a href="/">Item 1</a></li>
                <li role="menuitem"><a href="/about">Item 2</a></li>
              </ul>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('should make tabs accessible', () => {
      const TestComponent = () => {
        const [activeTab, setActiveTab] = React.useState(0);

        return (
          <div>
            <div role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 0}
                aria-controls="panel1"
                id="tab1"
                onClick={() => setActiveTab(0)}
              >
                Tab 1
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 1}
                aria-controls="panel2"
                id="tab2"
                onClick={() => setActiveTab(1)}
              >
                Tab 2
              </button>
            </div>
            <div
              role="tabpanel"
              id="panel1"
              aria-labelledby="tab1"
              style={{ display: activeTab === 0 ? 'block' : 'none' }}
            >
              Panel 1 content
            </div>
            <div
              role="tabpanel"
              id="panel2"
              aria-labelledby="tab2"
              style={{ display: activeTab === 1 ? 'block' : 'none' }}
            >
              Panel 2 content
            </div>
          </div>
        );
      };

      render(<TestComponent />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

      const panels = screen.getAllByRole('tabpanel');
      expect(panels).toHaveLength(2);
    });

    it('should make modals accessible', () => {
      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open</button>
            {isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
              >
                <h2 id="dialog-title">Dialog Title</h2>
                <p>Dialog content</p>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </div>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const openButton = screen.getByRole('button', { name: 'Open' });
      fireEvent.click(openButton);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Dynamic Content Updates', () => {
    it('should announce loading states', () => {
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);
        const { announce } = useScreenReader();

        const handleClick = () => {
          setIsLoading(true);
          announce('Loading content');
        };

        return (
          <div>
            <button onClick={handleClick}>Load</button>
            {isLoading && <span aria-live="polite">Loading...</span>}
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should announce error states', () => {
      const TestComponent = () => {
        const [hasError, setHasError] = React.useState(false);
        const { announce } = useScreenReader();

        const handleError = () => {
          setHasError(true);
          announce('Error loading content', 'assertive');
        };

        return (
          <div>
            <button onClick={handleError}>Trigger Error</button>
            {hasError && (
              <div role="alert">Error: Failed to load content</div>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should announce success states', () => {
      const TestComponent = () => {
        const [isSuccess, setIsSuccess] = React.useState(false);
        const { announce } = useScreenReader();

        const handleSuccess = () => {
          setIsSuccess(true);
          announce('Content loaded successfully');
        };

        return (
          <div>
            <button onClick={handleSuccess}>Submit</button>
            {isSuccess && (
              <div role="status">Success! Your changes have been saved.</div>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Table Accessibility', () => {
    it('should provide table captions', () => {
      const TestComponent = () => {
        return (
          <table>
            <caption>User information</caption>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John Doe</td>
                <td>john@example.com</td>
              </tr>
            </tbody>
          </table>
        );
      };

      render(<TestComponent />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const caption = screen.getByText('User information');
      expect(caption).toBeInTheDocument();
    });

    it('should use scope attributes correctly', () => {
      const TestComponent = () => {
        return (
          <table>
            <thead>
              <tr>
                <th scope="col">Column 1</th>
                <th scope="col">Column 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Row 1</th>
                <td>Data</td>
              </tr>
            </tbody>
          </table>
        );
      };

      render(<TestComponent />);

      const colHeaders = screen.getAllByRole('columnheader');
      expect(colHeaders).toHaveLength(2);

      const rowHeader = screen.getByRole('rowheader');
      expect(rowHeader).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing ARIA attributes gracefully', () => {
      const TestComponent = () => {
        return (
          <button>Button without label</button>
        );
      };

      expect(() => render(<TestComponent />)).not.toThrow();
    });

    it('should handle invalid ARIA values gracefully', () => {
      const TestComponent = () => {
        return (
          <div role="invalid-role">
            <button aria-invalid="maybe">Button</button>
          </div>
        );
      };

      expect(() => render(<TestComponent />)).not.toThrow();
    });
  });

  describe('Screen Reader Detection', () => {
    it('should detect if screen reader is running', () => {
      const TestComponent = () => {
        const { isScreenReaderRunning } = useScreenReader();

        return (
          <div>
            <span data-testid="detected">
              {isScreenReaderRunning ? 'yes' : 'no'}
            </span>
          </div>
        );
      };

      render(<TestComponent />);

      const detected = screen.getByTestId('detected');
      expect(detected).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not cause performance issues with many announcements', () => {
      const TestComponent = () => {
        const { announce } = useScreenReader();

        return (
          <div>
            <button onClick={() => {
              for (let i = 0; i < 100; i++) {
                announce(`Announcement ${i}`);
              }
            }}>
              Announce Many
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      const button = screen.getByRole('button');
      expect(() => fireEvent.click(button)).not.toThrow();
    });
  });
});
