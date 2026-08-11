# Spreadsheet Moment - Component Library

## Component Philosophy

The Spreadsheet Moment component library is a collection of reusable, accessible, and performant UI components that embody our brand personality and design principles.

### Core Principles

1. **Composable** - Components can be combined and extended
2. **Accessible** - WCAG 2.1 AA compliant by default
3. **Thematic** - Support for light, dark, and high-contrast themes
4. **Responsive** - Mobile-first, works across all devices
5. **International** - RTL support and i18n ready

---

## Component Categories

### 1. Form Components
- Button
- Input
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Slider
- Date Picker
- File Upload

### 2. Data Display Components
- Table
- Card
- List
- Tree
- Badge
- Tag
- Avatar
- Progress Bar
- Skeleton
- Empty State

### 3. Feedback Components
- Alert
- Toast
- Modal
- Tooltip
- Popover
- Dropdown
- Notification
- Loading Spinner

### 4. Navigation Components
- Tabs
- Breadcrumbs
- Pagination
- Menu
- Sidebar
- Topbar
- Navbar
- Steps

### 5. Layout Components
- Container
- Grid
- Flex
- Stack
- Spacer
- Divider
- Panel

---

## Component API Pattern

### Standard Props Interface

```typescript
interface BaseComponentProps {
  // Display
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';

  // State
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  error?: boolean;

  // Layout
  fullWidth?: boolean;
  grow?: boolean;
  shrink?: boolean;

  // Spacing
  margin?: SpacingProps;
  padding?: SpacingProps;

  // Events
  onClick?: (event: Event) => void;
  onFocus?: (event: Event) => void;
  onBlur?: (event: Event) => void;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedby?: string;
  role?: string;

  // Styling
  className?: string;
  style?: React.CSSProperties;

  // Children
  children?: React.ReactNode;
}
```

---

## Button Component

### Variants
- **Primary** - Main call-to-action
- **Secondary** - Alternative actions
- **Accent** - Highlighted actions
- **Ghost** - Subtle, background actions
- **Link** - Text-only button

### Sizes
- **XS** - Extra small (compact layouts)
- **SM** - Small (forms, tables)
- **MD** - Medium (default)
- **LG** - Large (marketing, hero)
- **XL** - Extra large (prominent CTAs)

### States
- Default
- Hover
- Active/Pressed
- Focus
- Disabled
- Loading

### API

```typescript
interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'button',
        `button-${variant}`,
        `button-${size}`,
        disabled && 'button-disabled',
        loading && 'button-loading'
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {!loading && leftIcon && <span className="button-icon-left">{leftIcon}</span>}
      <span className="button-text">{children}</span>
      {!loading && rightIcon && <span className="button-icon-right">{rightIcon}</span>}
    </button>
  );
};
```

### Usage

```tsx
// Primary button
<Button variant="primary" size="md">
  Save Changes
</Button>

// Button with icon
<Button variant="secondary" leftIcon={<PlusIcon />}>
  Add New
</Button>

// Loading button
<Button loading loadingText="Saving...">
  Save
</Button>

// Disabled button
<Button variant="primary" disabled>
  Cannot Save
</Button>
```

---

## Input Component

### Types
- **Text** - Default text input
- **Email** - Email validation
- **Password** - Password with visibility toggle
- **Number** - Numeric input
- **Search** - Search with clear button
- **URL** - URL validation

### States
- Default
- Focus
- Filled
- Error
- Disabled
- Readonly

### API

```typescript
interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  error?: boolean;
  errorText?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
  readonly?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClear?: () => void;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  error,
  errorText,
  helperText,
  required,
  leftIcon,
  rightIcon,
  onClear,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className={clsx('input-container', focused && 'input-focused', error && 'input-error')}>
        {leftIcon && <span className="input-icon-left">{leftIcon}</span>}
        <input
          type={type}
          className="input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
        {onClear && <button className="input-clear" onClick={onClear} aria-label="Clear"><CloseIcon /></button>}
      </div>
      {error && errorText && <p className="input-error-text">{errorText}</p>}
      {!error && helperText && <p className="input-helper-text">{helperText}</p>}
    </div>
  );
};
```

### Usage

```tsx
// Basic input
<Input label="Name" placeholder="Enter your name" />

// Error state
<Input
  label="Email"
  type="email"
  error
  errorText="Please enter a valid email"
/>

// With icon
<Input
  label="Search"
  type="search"
  leftIcon={<SearchIcon />}
  placeholder="Search..."
/>
```

---

## Card Component

### Variants
- **Default** - Standard card with shadow
- **Elevated** - Higher shadow for emphasis
- **Bordered** - Border instead of shadow
- **Flat** - No shadow or border

### Sizes
- **SM** - Small compact card
- **MD** - Medium (default)
- **LG** - Large feature card

### API

```typescript
interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  image?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  title,
  subtitle,
  actions,
  image,
  header,
  footer,
  children,
  clickable,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        'card',
        `card-${variant}`,
        `card-${size}`,
        clickable && 'card-clickable'
      )}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {image && <div className="card-image"><img src={image} alt="" /></div>}
      {(header || title) && (
        <div className="card-header">
          {header || (
            <>
              {title && <h3 className="card-title">{title}</h3>}
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </>
          )}
        </div>
      )}
      {children && <div className="card-body">{children}</div>}
      {(actions || footer) && (
        <div className="card-footer">
          {actions || footer}
        </div>
      )}
    </div>
  );
};
```

### Usage

```tsx
// Basic card
<Card title="Card Title" subtitle="Card subtitle">
  <p>Card content goes here...</p>
</Card>

// Clickable card
<Card
  title="Clickable Card"
  clickable
  onClick={() => console.log('Clicked')}
>
  <p>Click me!</p>
</Card>

// With actions
<Card
  title="Actions Card"
  actions={
    <>
      <Button variant="ghost" size="sm">Cancel</Button>
      <Button variant="primary" size="sm">Save</Button>
    </>
  }
>
  <p>Card with action buttons</p>
</Card>
```

---

## Modal Component

### Variants
- **Default** - Standard modal
- **Alert** - Confirmation dialog
- **Fullscreen** - Fullscreen modal (mobile)

### Sizes
- **SM** - Small (400px)
- **MD** - Medium (600px)
- **LG** - Large (800px)
- **XL** - Extra large (1200px)
- **Full** - Full viewport width/height

### API

```typescript
interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'alert' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  children,
}) => {
  useEffect(() => {
    if (closeOnEscape) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [onClose, closeOnEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={closeOnBackdropClick ? onClose : undefined}>
      <div
        className={clsx('modal', `modal-${size}`)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
            {showCloseButton && (
              <button className="modal-close" onClick={onClose} aria-label="Close modal">
                <CloseIcon />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};
```

### Usage

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Modal content goes here...</p>
</Modal>
```

---

## Table Component

### Features
- Sortable columns
- Selectable rows
- Pagination
- Filterable
- Virtual scrolling for large datasets
- Responsive design

### API

```typescript
interface ColumnDef<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (props: { value: any; row: T }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
}

interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: ColumnDef<T>[];
  selectable?: boolean;
  onRowSelect?: (row: T) => void;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  pagination?: boolean;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyState?: React.ReactNode;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  selectable,
  onRowSelect,
  onRowClick,
  sortable,
  onSort,
  pagination,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  loading,
  emptyState,
}: TableProps<T>) {
  // Implementation
}
```

### Usage

```tsx
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns: ColumnDef<UserData>[] = [
  { id: 'name', header: 'Name', accessor: 'name', sortable: true },
  { id: 'email', header: 'Email', accessor: 'email', sortable: true },
  { id: 'role', header: 'Role', accessor: 'role', sortable: true },
];

<Table
  data={users}
  columns={columns}
  selectable
  onRowClick={(row) => console.log('Clicked:', row)}
  pagination
  pageSize={20}
/>
```

---

## Component Styling

### CSS Modules Pattern

```css
/* Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all var(--motion-hover);
  font-family: var(--font-family-primary);
}

.buttonPrimary {
  background-color: var(--color-primary-default);
  color: var(--color-text-inverse);
}

.buttonPrimary:hover {
  background-color: var(--color-primary-hover);
  box-shadow: var(--shadow-md);
}

.buttonMd {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
  border-radius: var(--radius-md);
}
```

### Tailwind Pattern

```tsx
<Button className="
  inline-flex items-center justify-center
  px-6 py-3
  bg-primary text-white
  rounded-md
  hover:bg-primary-hover hover:shadow-md
  transition-all duration-200
">
  Save Changes
</Button>
```

---

## Component Accessibility

### ARIA Attributes

```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  aria-expanded={isExpanded}
  aria-disabled={disabled}
>
  Close
</button>
```

### Keyboard Navigation

```tsx
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      handleClick();
      break;
    case 'Escape':
      handleCancel();
      break;
    case 'ArrowDown':
      handleNext();
      break;
    case 'ArrowUp':
      handlePrevious();
      break;
  }
};
```

### Focus Management

```tsx
useEffect(() => {
  if (isOpen) {
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    firstElement?.focus();
  }
}, [isOpen]);
```

---

## Component Testing

### Unit Tests

```typescript
describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Accessibility Tests

```typescript
describe('Button accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(<Button aria-label="Close dialog" />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Close dialog');
  });

  it('is keyboard accessible', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Component Documentation

Each component should include:

1. **Description** - What the component does
2. **Import** - How to import the component
3. **API** - Props interface with descriptions
4. **Usage** - Code examples
5. **Guidelines** - When to use/not use
6. **Accessibility** - ARIA support and keyboard navigation
7. **Examples** - Live examples with Storybook

---

## Component Versioning

### Semantic Versioning
- **Major** - Breaking changes to API
- **Minor** - New features, backward compatible
- **Patch** - Bug fixes, no API changes

### Deprecation Process
1. Mark as deprecated in documentation
2. Add deprecation warning in code
3. Provide migration guide
4. Remove in next major version

---

## Component Evolution Strategy

### Phase 1: Launch (v1.0)
- Core components (Button, Input, Card, Modal, Table)
- Basic variants and sizes
- Accessibility compliance
- Documentation and examples

### Phase 2: Expansion (v1.x)
- Additional components (Tabs, Dropdown, Tree, etc.)
- Advanced variants
- Enhanced accessibility
- Performance optimizations

### Phase 3: Maturity (v2.0)
- Component composition patterns
- Advanced theming
- Internationalization
- Component generator tool

---

**Last Updated:** 2026-03-15
**Version:** 1.0
**Owner:** Spreadsheet Moment Design System Team
