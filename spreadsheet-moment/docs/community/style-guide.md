# Style Guide

Guidelines for writing Spreadsheet Moment documentation and code.

## Documentation Style

### Voice and Tone

- **Clear and concise**: Get to the point
- **Friendly but professional**: Be approachable but maintain professionalism
- **Active voice**: Use active voice instead of passive
- **Present tense**: Use present tense for descriptions

### Writing Guidelines

#### Headings

```markdown
# Level 1 - Page title (one per page)
## Level 2 - Main sections
### Level 3 - Subsections
#### Level 4 - Minor sections
```

#### Code Blocks

Use language-specific syntax highlighting:

\`\`\`typescript
const greeting: string = "Hello"
\`\`\`

#### Inline Code

Use backticks for `code` references.

#### Links

Use descriptive link text:

- Good: [API Reference](../api/overview.md)
- Bad: [click here](../api/overview.md)

### Formatting

#### Emphasis

- **Bold**: For UI elements, buttons, key terms
- *Italic*: For variables, placeholders, emphasis
- `Code`: For commands, filenames, code elements

#### Lists

Use bullet lists for items without order:
1. Use numbered lists for sequential steps
2. Keep list items parallel in structure

#### Notes and Warnings

::: info
Informational notes
:::

::: warning
Warning messages
:::

::: tip
Tips and suggestions
:::

::: danger
Critical warnings
:::

### Code Examples

#### TypeScript

```typescript
// Good: Clear variable names, comments
async function createSpreadsheet(name: string) {
  const spreadsheet = await client.spreadsheets.create({ name })
  return spreadsheet
}

// Bad: Unclear names, no comments
async function cs(n: string) {
  const s = await client.spreadsheets.create({ n })
  return s
}
```

#### JavaScript

```javascript
// Use modern JavaScript syntax
const createSpreadsheet = async (name) => {
  const spreadsheet = await client.spreadsheets.create({ name })
  return spreadsheet
}
```

#### Python

```python
# Follow PEP 8 style guide
async def create_spreadsheet(name: str) -> Spreadsheet:
    spreadsheet = await client.spreadsheets.create(name=name)
    return spreadsheet
```

## Code Style

### TypeScript/JavaScript

#### Naming Conventions

- **Variables**: camelCase (`myVariable`)
- **Functions**: camelCase (`myFunction`)
- **Classes**: PascalCase (`MyClass`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)
- **Interfaces**: PascalCase with `I` prefix (`IMyInterface`)

#### File Naming

- **Components**: PascalCase (`MyComponent.tsx`)
- **Utilities**: camelCase (`myUtility.ts`)
- **Types**: PascalCase (`MyType.ts`)
- **Tests**: `.test.ts` suffix (`myUtility.test.ts`)

#### Code Organization

```typescript
// 1. Imports
import { Something } from 'somewhere'

// 2. Types
interface MyProps {
  // ...
}

// 3. Constants
const CONSTANT = 'value'

// 4. Functions
function myFunction() {
  // ...
}

// 5. Exports
export default myFunction
```

### Python

#### Naming Conventions

- **Variables**: snake_case (`my_variable`)
- **Functions**: snake_case (`my_function`)
- **Classes**: PascalCase (`MyClass`)
- **Constants**: UPPER_SNAKE_CASE (`MY_CONSTANT`)

#### Code Style

```python
# Follow PEP 8
# Use type hints
from typing import List

def process_items(items: List[str]) -> None:
    """Process a list of items."""
    for item in items:
        print(item)
```

## API Documentation

### Endpoint Documentation

```markdown
## Get Spreadsheet

Retrieve a single spreadsheet.

### Request

\`\`\`http
GET /v1/spreadsheets/:id
\`\`\`

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| \`id\` | string | Yes | Spreadsheet ID |

### Example

\`\`\`bash
curl https://api.spreadsheetmoment.com/v1/spreadsheets/spr_12345
\`\`\`

### Response

\`\`\`json
{
  "data": {
    "id": "spr_12345"
  }
}
\`\`\`
```

### Function Documentation

```typescript
/**
 * Creates a new spreadsheet
 * @param name - The name of the spreadsheet
 * @param columns - Number of columns (default: 26)
 * @returns The created spreadsheet
 * @throws {AuthenticationError} If API key is invalid
 * @example
 * ```typescript
 * const spreadsheet = await createSpreadsheet('My Data', 26)
 * ```
 */
async function createSpreadsheet(
  name: string,
  columns: number = 26
): Promise<Spreadsheet>
```

## Content Guidelines

### Tutorial Structure

1. **Overview**: What you'll build
2. **Prerequisites**: What you need
3. **Steps**: Numbered instructions
4. **Testing**: How to verify it works
5. **Next Steps**: Where to go from here

### Guide Structure

1. **Introduction**: Concept overview
2. **Key Concepts**: Main ideas
3. **Examples**: Practical applications
4. **Best Practices**: Recommendations
5. **Troubleshooting**: Common issues

### Reference Structure

1. **Description**: What it does
2. **Parameters**: Input details
3. **Return**: Output details
4. **Throws**: Possible errors
5. **Example**: Usage example

## Accessibility

### Alt Text

Provide descriptive alt text for images:

```markdown
![Screenshot of the spreadsheet interface showing cell A1 selected](screenshot.png)
```

### Link Text

Use descriptive link text (not "click here"):

- Good: [View the API documentation](api.md)
- Bad: [Click here](api.md) to view the API documentation

### Headings

Use proper heading hierarchy (don't skip levels).

## Review Process

All content goes through:

1. **Self-review**: Check against this guide
2. **Peer review**: Get feedback from team
3. **Technical review**: Verify accuracy
4. **Final approval**: Merge to main

## Resources

- [Google Developer Documentation Style Guide](https://developers.google.com/tech-writing/one-pagers)
- [Microsoft Writing Style Guide](https://docs.microsoft.com/en-us/style-guide/)
- [Vue Documentation Style Guide](https://vuejs.org/style-guide/)

## Next Steps

- [Contribute](./contribute.md)
- [Examples](./examples.md)
- [Guidelines](./guidelines.md)
