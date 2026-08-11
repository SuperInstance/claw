# Contribute

Join the community and help improve Spreadsheet Moment.

## Ways to Contribute

### Documentation

Improve documentation by:
- Fixing typos and errors
- Adding examples
- Writing tutorials
- Translating content

### Code Contributions

Submit code for:
- Bug fixes
- New features
- Performance improvements
- Tests

### Plugins & Integrations

Create and share:
- Custom functions
- Data sources
- UI components
- Integrations with other tools

### Community Support

Help others by:
- Answering questions
- Sharing examples
- Writing blog posts
- Creating videos

## Getting Started

### 1. Set Up Development Environment

```bash
# Fork repository
git clone https://github.com/your-username/spreadsheet-moment.git
cd spreadsheet-moment

# Install dependencies
npm install

# Run development server
npm run dev
```

### 2. Make Changes

Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

Make your changes following our:
- [Code Style Guide](./style-guide.md)
- [Commit Guidelines](https://www.conventionalcommits.org/)

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linting
npm run lint

# Build project
npm run build
```

### 4. Submit Pull Request

1. Push to your fork
2. Create pull request
3. Describe your changes
4. Link related issues

## Documentation Contributions

### Fixing Documentation

Edit documentation files in the `docs/` directory:

```bash
cd docs
npm run dev
```

Make changes and preview locally.

### Adding Examples

Add practical examples:

```markdown
## Example: Calculate Sales Tax

```typescript
const taxRate = 0.08
const price = 100
const tax = price * taxRate
console.log(`Tax: $${tax}`)
```
```

### Writing Tutorials

Create step-by-step tutorials:

1. Define learning objectives
2. Provide prerequisites
3. Include code examples
4. Add troubleshooting tips

## Code Contributions

### Bug Reports

Report bugs with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

### Feature Requests

Request features with:
- Use case description
- Proposed solution
- Alternatives considered
- Implementation ideas (optional)

### Pull Request Guidelines

- One feature per PR
- Clear commit messages
- Update tests
- Update documentation
- Pass all CI checks

## Plugin Contributions

### Sharing Your Plugin

1. Create repository
2. Add README with:
   - Description
   - Installation
   - Usage examples
   - Screenshots
3. Publish to npm
4. Submit to plugin registry

### Plugin Template

```bash
npx @spreadsheetmoment/plugin init my-plugin
```

## Community Guidelines

### Be Respectful

- Welcome newcomers
- Assume good intentions
- Provide constructive feedback
- Acknowledge contributions

### Be Collaborative

- Work in the open
- Discuss changes first
- Seek consensus
- Credit contributors

### Be Professional

- Use inclusive language
- Focus on what is best for the community
- Show empathy towards other community members

## Recognition

Contributors are recognized through:
- Contributor list on website
- Badges on profile
- Annual contributor awards
- Shoutouts in blog posts

## Getting Help

- GitHub Issues: Bug reports and feature requests
- Discord: Real-time chat
- Discussions: Questions and ideas
- Email: support@spreadsheetmoment.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Next Steps

- [Style Guide](./style-guide.md)
- [Examples](./examples.md)
- [GitHub Repository](https://github.com/spreadsheetmoment/spreadsheet-moment)
