# Contributing to Spreadsheet Moment

**Thank you for your interest in contributing!** We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or spreading the word.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Conventions](#commit-conventions)
- [Documentation Standards](#documentation-standards)
- [Community Guidelines](#community-guidelines)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Any other conduct which could reasonably be considered inappropriate

### Reporting Issues

If you experience or witness unacceptable behavior, please contact us at:
- Email: conduct@superinstance.ai
- GitHub: Report via [GitHub Code of Conduct](https://github.com/SuperInstance/spreadsheet-moment/blob/main/CODE_OF_CONDUCT.md)

---

## Getting Started

### Ways to Contribute

1. **Report Bugs** - Help us fix issues
2. **Suggest Features** - Share your ideas
3. **Submit Pull Requests** - Fix bugs or add features
4. **Improve Documentation** - Make docs clearer
5. **Review Code** - Help review PRs
6. **Answer Questions** - Help in issues and discussions
7. **Spread the Word** - Share the project

### First-Time Contributors

We love first-time contributors! Here are some good places to start:

- Look for issues labeled `good first issue`
- Check documentation for improvements
- Fix typos or small bugs
- Add missing tests

---

## Development Setup

### Prerequisites

- **Node.js:** 18.0 or higher
- **npm:** 9.0 or higher
- **Git:** Latest version
- **Editor:** VS Code (recommended) with extensions

### Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/spreadsheet-moment.git
cd spreadsheet-moment

# Add upstream remote
git remote add upstream https://github.com/SuperInstance/spreadsheet-moment.git
```

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install website dependencies
cd website
npm install

# Install desktop dependencies
cd ../desktop
npm install
```

### Start Development Server

```bash
# Start development server
npm run dev

# Or start specific components
npm run dev:website   # Website only
npm run dev:workers   # Workers only
npm run dev:desktop   # Desktop app
```

### Project Structure

```
spreadsheet-moment/
├── website/          # React website
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
├── workers/          # Cloudflare Workers
│   ├── src/
│   └── wrangler.toml
├── desktop/          # Desktop application
│   ├── src/
│   ├── src-tauri/
│   └── package.json
├── api/              # API implementations
├── tests/            # Test files
├── docs/             # Documentation
└── examples/         # Example code
```

---

## Code Standards

### TypeScript

**Use TypeScript for type safety:**

```typescript
// ✅ Good - Typed interfaces
interface CellProps {
  id: string;
  type: CellType;
  data: unknown;
  onUpdate?: (data: unknown) => void;
}

const Cell: React.FC<CellProps> = ({ id, type, data, onUpdate }) => {
  // Component logic
};

// ❌ Bad - No types
const Cell = ({ id, type, data, onUpdate }) => {
  // Component logic
};
```

**Best Practices:**
- Use interfaces for object shapes
- Use types for unions and aliases
- Avoid `any` - use `unknown` instead
- Enable strict mode in `tsconfig.json`
- Use type inference where appropriate

### React

**Follow React best practices:**

```typescript
// ✅ Good - Functional component with hooks
const Cell: React.FC<CellProps> = ({ id, data }) => {
  const [state, setState] = useState<CellState>('initializing');

  useEffect(() => {
    // Side effect
    return () => {
      // Cleanup
    };
  }, [id]);

  return <div>{data}</div>;
};

// ❌ Bad - Class component (unless necessary)
class Cell extends React.Component {
  // Class logic
}
```

**Component Guidelines:**
- Use functional components
- Use hooks for state and side effects
- Keep components small and focused
- Use proper TypeScript types
- Follow React naming conventions

### CSS

**Use Tailwind CSS utilities:**

```tsx
// ✅ Good - Tailwind utilities
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Bad - Inline styles
<div style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>

// ❌ Bad - Custom CSS (unless necessary)
<div className="custom-cell-style">
```

**Styling Guidelines:**
- Use Tailwind utilities
- Create component-specific classes when needed
- Use semantic color names
- Ensure responsive design
- Test dark mode if applicable

### Python

**Follow PEP 8 style:**

```python
# ✅ Good - PEP 8 compliant
class CellManager:
    """Manages cell lifecycle."""

    def __init__(self, config: dict):
        self.config = config
        self.cells = {}

    async def create_cell(self, cell_id: str, data: dict) -> Cell:
        """Create a new cell."""
        cell = Cell(cell_id, data)
        await cell.initialize()
        self.cells[cell_id] = cell
        return cell

# ❌ Bad - Not PEP 8 compliant
class cellmanager:
    def __init__(self, config):
        self.config=config
        self.cells={}
```

**Python Guidelines:**
- Follow PEP 8 style guide
- Use type hints for functions
- Write docstrings for classes and functions
- Use async/await for I/O operations
- Handle exceptions appropriately

### Rust

**Follow Rust conventions:**

```rust
// ✅ Good - Idiomatic Rust
use std::collections::HashMap;

pub struct CellManager {
    cells: HashMap<String, Cell>,
}

impl CellManager {
    pub fn new() -> Self {
        Self {
            cells: HashMap::new(),
        }
    }

    pub fn create_cell(&mut self, id: String, data: Vec<u8>) -> Result<Cell> {
        let cell = Cell::new(id, data)?;
        self.cells.insert(id.clone(), cell);
        Ok(cell)
    }
}

// ❌ Bad - Not idiomatic
pub struct CellManager {
    pub cells: HashMap<String, Cell>,
}
```

**Rust Guidelines:**
- Use rustfmt for formatting
- Use clippy for linting
- Prefer `Result` over panic
- Use meaningful error types
- Document public APIs

---

## Testing Requirements

### Test Coverage

**We require 82%+ code coverage for all PRs.**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:a11y
```

### Writing Tests

**Unit Tests:**

```typescript
describe('CellComponent', () => {
  it('renders cell data correctly', () => {
    const { getByText } = render(
      <Cell id="test" type="PREDICTOR" data={{ value: 42 }} />
    );
    expect(getByText('42')).toBeInTheDocument();
  });

  it('calls onUpdate when data changes', () => {
    const onUpdate = jest.fn();
    const { rerender } = render(
      <Cell id="test" type="PREDICTOR" data={{ value: 42 }} onUpdate={onUpdate} />
    );

    rerender(
      <Cell id="test" type="PREDICTOR" data={{ value: 100 }} onUpdate={onUpdate} />
    );

    expect(onUpdate).toHaveBeenCalledWith({ value: 100 });
  });
});
```

**Integration Tests:**

```typescript
describe('Cell API Integration', () => {
  beforeAll(() => {
    // Setup test server
  });

  afterAll(() => {
    // Cleanup
  });

  it('creates a new cell', async () => {
    const response = await fetch('/api/v2/cells', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'PREDICTOR',
        data: { value: 42 }
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });
});
```

**Accessibility Tests:**

```typescript
describe('Cell Accessibility', () => {
  it('has proper ARIA attributes', () => {
    const { container } = render(
      <Cell id="test" type="PREDICTOR" data={{ value: 42 }} />
    );

    const cell = container.querySelector('[role="gridcell"]');
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveAttribute('aria-label', 'Cell PREDICTOR');
  });

  it('is keyboard navigable', () => {
    const { container } = render(
      <Cell id="test" type="PREDICTOR" data={{ value: 42 }} />
    );

    const cell = container.querySelector('[tabindex="0"]');
    cell.focus();
    expect(cell).toHaveFocus();
  });
});
```

### Test Guidelines

**What to Test:**
- ✅ Test user interactions
- ✅ Test error handling
- ✅ Test edge cases
- ✅ Test accessibility
- ✅ Test performance

**What NOT to Test:**
- ❌ Don't test implementation details
- ❌ Don't test third-party libraries
- ❌ Don't test obvious behavior

---

## Pull Request Process

### Before Submitting

1. **Update Your Branch**

```bash
# Fetch upstream changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Push to your fork
git push origin feature-branch
```

2. **Run Tests**

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Check formatting
npm run format:check
```

3. **Build Project**

```bash
# Build production bundle
npm run build
```

### Creating a Pull Request

1. **Go to GitHub** and click "New Pull Request"
2. **Select your branch** from your fork
3. **Fill in the PR template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Coverage maintained

## Checklist
- [ ] Code follows project standards
- [ ] Self-reviewed the code
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Commits follow conventions
```

4. **Title Your PR** using conventional commits:

```
feat: add cell export feature
fix: resolve memory leak in cell manager
docs: update API documentation
```

### PR Review Process

1. **Automated Checks**
   - All tests must pass
   - Coverage must be 82%+
   - No linting errors
   - Build must succeed

2. **Code Review**
   - At least one approval required
   - Address review comments
   - Make requested changes

3. **Integration**
   - Maintainer will merge
   - Changes deployed to staging
   - Final testing before production

---

## Commit Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Examples

```
feat(cell): add export to CSV functionality

- Export cell data to CSV format
- Include cell metadata in export
- Add option to export connections

Closes #123
```

```
fix(api): resolve race condition in cell creation

- Use mutex for concurrent cell creation
- Add error handling for duplicate IDs
- Update unit tests

Fixes #456
```

```
docs(readme): update installation instructions

- Clarify prerequisite requirements
- Add troubleshooting section
- Fix broken links
```

### Commit Guidelines

- **Subject line:** 50 characters or less
- **Body:** Wrap at 72 characters
- **Use imperative mood** ("add" not "added")
- **Reference issues** in footer
- **Break large changes** into multiple commits

---

## Documentation Standards

### Code Comments

**When to Comment:**
- ✅ Explain "why" not "what"
- ✅ Document complex algorithms
- ✅ Provide usage examples
- ✅ Note workarounds or hacks

```typescript
// ✅ Good - Explains why
// We use a debounce here to prevent excessive API calls
// during rapid user input. The 300ms delay balances
// responsiveness with API load.
const debouncedUpdate = debounce(updateCell, 300);

// ❌ Bad - Restates the obvious
// Set the delay to 300ms
const debouncedUpdate = debounce(updateCell, 300);
```

### JSDoc Comments

**Document functions and components:**

```typescript
/**
 * Creates a new cell with the specified configuration
 *
 * @param config - Cell configuration object
 * @param config.type - Type of cell to create
 * @param config.data - Initial cell data
 * @param config.behavior - Cell behavior definition
 * @returns Promise resolving to the created cell
 * @throws {CellCreationError} If cell creation fails
 *
 * @example
 * ```typescript
 * const cell = await createCell({
 *   type: 'PREDICTOR',
 *   data: { value: 42 },
 *   behavior: { predict: 'return data.value * 2' }
 * });
 * ```
 */
async function createCell(config: CellConfig): Promise<Cell> {
  // Implementation
}
```

### README Documentation

**Keep READMEs clear and complete:**

```markdown
# Feature Name

## Overview
Brief description of what this feature does

## Installation
How to install or set up

## Usage
How to use with examples

## API
API reference if applicable

## Examples
Real-world usage examples

## Contributing
How to contribute to this feature

## License
License information
```

---

## Community Guidelines

### Communication Channels

- **GitHub Issues:** Bug reports and feature requests
- **GitHub Discussions:** General questions and ideas
- **Discord:** Real-time chat (discord.gg/superinstance)
- **Email:** support@superinstance.ai

### Asking for Help

**When asking for help, provide:**

1. **Context** - What are you trying to do?
2. **Code** - Minimal reproducible example
3. **Error** - Full error message and stack trace
4. **Environment** - OS, Node version, browser version
5. **Steps** - What you've already tried

**Example:**

```
I'm trying to create a cell that connects to an HTTP endpoint,
but I'm getting a connection error.

**Code:**
```typescript
const cell = await createCell({
  type: 'IO',
  connections: [{
    type: 'HTTP',
    url: 'https://api.example.com/data'
  }]
});
```

**Error:**
ConnectionError: Failed to establish connection
    at CellManager.connect (cell-manager.ts:123)

**Environment:**
- OS: Windows 11
- Node: 18.16.0
- Browser: Chrome 114

**What I've tried:**
- Verified URL is accessible
- Checked network tab in DevTools
- Tried with different URLs
```

### Recognition

**We recognize contributors through:**

- **Contributors section** in README
- **Release notes** for significant contributions
- **Hall of Fame** for top contributors
- **Swag** for exceptional contributions

---

## Additional Resources

### Learning Resources

- **React Documentation:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Testing Library:** https://testing-library.com/docs/

### Project Resources

- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Project Status:** [PROJECT_STATUS.md](PROJECT_STATUS.md)

### Getting Help

- **GitHub Issues:** https://github.com/SuperInstance/spreadsheet-moment/issues
- **GitHub Discussions:** https://github.com/SuperInstance/spreadsheet-moment/discussions
- **Discord:** https://discord.gg/superinstance
- **Email:** support@superinstance.ai

---

## Thank You!

**Thank you for contributing to Spreadsheet Moment!** Every contribution helps make this project better, whether it's a bug fix, feature request, documentation improvement, or just helping others in the community.

Together, we're building the next evolution of spreadsheets!

---

**Document Version:** 1.0.0
**Last Updated:** March 15, 2026
**Maintained By:** Spreadsheet Moment Community Team
