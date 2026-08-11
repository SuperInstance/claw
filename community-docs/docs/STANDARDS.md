# Documentation Standards

This document outlines the standards and guidelines for creating and maintaining Spreadsheet Moment documentation.

## Documentation Philosophy

### Our Approach to Documentation
- **User-First**: Write for the user, not yourself
- **Clear & Concise**: Simple language, short sentences
- **Accessible**: Inclusive and welcoming to all
- **Living**: Continuously updated and improved
- **Collaborative**: Community-driven maintenance

### Core Principles

#### 1. Clarity Over Cleverness
- Use simple, direct language
- Avoid jargon and technical terms when possible
- Explain technical concepts when necessary
- Use examples to illustrate complex ideas

#### 2. Structure Matters
- Organize information logically
- Use consistent formatting
- Include table of contents for long documents
- Follow established patterns

#### 3. Accessibility is Essential
- Use inclusive language
- Provide alternative text for images
- Consider color blindness in diagrams
- Write for non-native English speakers

#### 4. Accuracy Through Review
- Verify technical accuracy
- Test code examples
- Update as features change
- Review regularly for relevance

## Documentation Types

### 1. Getting Started Documentation
Target: New users, first-time contributors
Content: Installation, basic usage, first steps
Tone: Encouraging, patient, detailed

### 2. Reference Documentation
Target: Experienced users, developers
Content: API reference, configuration options, parameters
Tone: Precise, technical, concise

### 3. Tutorial Documentation
Target: Learners of all levels
Content: Step-by-step guides, examples, best practices
Tone: Instructional, supportive, clear

### 4. Conceptual Documentation
Target: Users wanting deeper understanding
Content: Architecture, design decisions, theory
Tone: Explanatory, thorough, analytical

### 5. Troubleshooting Documentation
Target: Users encountering problems
Content: Common issues, solutions, workarounds
Tone: Empathetic, practical, solution-oriented

## Writing Standards

### Language & Tone

#### Voice and Tone
- **Conversational but professional**
- **Direct and active voice**
- **Present tense** (generally)
- **Second person** ("you", "your")

#### Example

❌ **Bad**:
"The system will then be utilized by the user in order to..."

✅ **Good**:
"You'll use the system to..."

#### Inclusive Language
- **Avoid gendered pronouns** (use "they" or rephrase)
- **Use person-first language** ("person with disabilities" not "disabled person")
- **Avoid idioms and cultural references** (not universal)
- **Be welcoming to all skill levels**

### Style Guidelines

#### Headings
```markdown
# Level 1: Document title (one per document)

## Level 2: Main sections

### Level 3: Subsections

#### Level 4: Details (use sparingly)
```

#### Paragraphs
- Keep paragraphs short (2-4 sentences)
- One idea per paragraph
- Use bullet points for lists
- Number sequential steps

#### Code Blocks
````markdown
Inline code uses single backticks: `variable`

Code blocks use triple backticks:
```javascript
function example() {
  return "hello";
}
````

#### Emphasis
- **Bold**: Key terms, warnings, important concepts
- *Italic*: First use of technical terms, titles
- `Code`: Commands, variables, file names

#### Links
```markdown
[Link text](url)
[External link](https://example.com)
[Internal link](../other-document.md)
[Auto-link](https://github.com/SuperInstance/SuperInstance-papers)
```

## Document Structure

### Standard Template

```markdown
# Document Title

Brief description of what this document covers.

## Overview
[High-level introduction]

## Prerequisites
[What users need before starting]

## Main Content
[Core information, organized logically]

## Examples
[Practical examples]

## Troubleshooting
[Common issues and solutions]

## Related Resources
[Links to related docs]

## FAQ
[Frequently asked questions]

---
*Last Updated: YYYY-MM-DD | Maintainer: @username*
```

### Required Elements

#### Every Document Must Have:
1. **Clear title** - Descriptive and searchable
2. **Brief description** - One paragraph overview
3. **Last updated date** - Maintenance tracking
4. **Maintainer attribution** - Who owns this doc

#### Most Documents Should Have:
1. **Table of contents** - For longer docs (>500 words)
2. **Prerequisites** - What's needed before starting
3. **Examples** - Practical demonstrations
4. **Related resources** - Links to more info

## Content Guidelines

### Code Examples

#### Requirements
- **Test all code examples** - Ensure they work
- **Provide context** - Explain what the code does
- **Show output** - Include expected results
- **Handle errors** - Show error handling when relevant

#### Format
````markdown
To create a new spreadsheet, use the `createSpreadsheet` function:

```javascript
const spreadsheet = createSpreadsheet({
  name: "My Budget",
  rows: 100,
  columns: 20
});

console.log(spreadsheet.id);
// Output: "abc123"
```

This creates a spreadsheet with 100 rows and 20 columns.
````

### Screenshots & Images

#### When to Use
- UI elements and interfaces
- Complex diagrams or flows
- Visual demonstrations
- Before/after comparisons

#### Guidelines
- **High quality** - Clear, not blurry
- **Relevant** - Only include necessary information
- **Annotated** - Add arrows/labels for clarity
- **Alt text** - Describe images for accessibility
- **Optimized** - Compress images for web

#### Format
```markdown
![Descriptive alt text](path/to/image.png)

*Figure 1: Description of what the image shows*
```

### Warnings & Notes

#### Types of Callouts
```markdown
**Note:** Helpful additional information

**Tip:** Suggestion or best practice

**Warning:** Important caution

**Error:** What went wrong

**Success:** Confirmation that something worked
```

#### Usage Guidelines
- **Sparingly** - Only for important information
- **Specific** - Clear what the warning is about
- **Actionable** - Tell user what to do

## Quality Standards

### Before Publishing

#### Content Checklist
- [ ] Accurate and up-to-date
- [ ] Tested (if code examples)
- [ ] Complete (no unfinished sections)
- [ ] Proofread (no typos/grammar errors)
- [ ] Links work (internal and external)
- [ ] Images are accessible

#### Formatting Checklist
- [ ] Consistent heading levels
- [ ] Proper code block syntax
- [ ] Links use correct paths
- [ ] Tables formatted correctly
- [ ] No excessive whitespace
- [ ] Mobile-friendly formatting

### After Publishing

#### Maintenance
- **Review quarterly** - Check for accuracy
- **Update when features change** - Keep current
- **Monitor feedback** - Address user questions
- **Archive outdated docs** - Mark as deprecated

## Review Process

### Peer Review
- **Required for** - All new documentation
- **Reviewers** - At least one other person
- **Focus** - Accuracy, clarity, completeness

### Community Feedback
- **Encourage feedback** - Make it easy to suggest improvements
- **Address feedback** - Respond to suggestions
- **Credit contributors** - Acknowledge improvements

### Documentation Audits
- **Quarterly** - Comprehensive review
- **Focus areas** - Accuracy, relevance, accessibility
- **Action** - Update, archive, or create as needed

## Accessibility Standards

### General Accessibility
- **Readability** - 8th-grade reading level for general docs
- **Language** - Simple, direct, clear
- **Formatting** - Use headings, lists, white space
- **Color** - Don't rely on color alone to convey meaning

### Technical Accessibility
- **Alt text** - For all images and diagrams
- **Semantic HTML** - When applicable
- **Keyboard navigation** - For interactive elements
- **Screen readers** - Test with screen reader software

### Cultural Accessibility
- **Idioms** - Avoid culture-specific references
- **Time zones** - Specify when relevant
- **Dates** - Use full dates (YYYY-MM-DD)
- **Currency** - Specify currency (USD, EUR, etc.)

## Tools & Resources

### Recommended Tools
- **Markdown editor** - VS Code with Markdown extensions
- **Grammar checker** - Grammarly or similar
- **Link checker** - Markdown Link Checker
- **Spell checker** - cSpell or similar
- **Accessibility checker** - WAVE or similar

### Templates
- See [TEMPLATES.md](TEMPLATES.md) for document templates
- Use templates to ensure consistency

### Style Guide
- See [STYLE_GUIDE.md](STYLE_GUIDE.md) for detailed style guidelines
- Follow established patterns

## Localization

### Translation Guidelines
- **Universal language** - Avoid culture-specific references
- **Simple sentences** - Easier to translate
- **Avoid idioms** - Don't translate literally
- **Context** - Provide context for ambiguous terms
- See [TRANSLATIONS.md](TRANSLATIONS.md) for more details

## Metrics & Success

### How We Measure Quality
- **User feedback** - Positive vs. negative
- **Questions answered** - Reduction in repetitive questions
- **Contributor adoption** - New contributors can onboard quickly
- **Search rankings** - Docs appear in relevant searches
- **Link integrity** - Few broken links

### Continuous Improvement
- **Monthly reviews** - Check documentation metrics
- **User surveys** - Gather feedback on documentation
- **A/B testing** - Test improvements
- **Analytics** - Track which docs are used most

## Resources

### External Resources
- [Google Developer Documentation Style Guide](https://developers.google.com/tech-writing/)
- [Microsoft Writing Style Guide](https://docs.microsoft.com/en-us/style-guide/)
- [Documentation Style Guides](https://documentation.styleguides.io/)
- [Write the Docs](https://www.writethedocs.org/)

### Internal Resources
- [Documentation Templates](TEMPLATES.md)
- [Writing Style Guide](STYLE_GUIDE.md)
- [Translation Guide](TRANSLATIONS.md)
- [Review Process](REVIEW_PROCESS.md)

---

*Last Updated: 2026-03-15 | Maintained by: Documentation Team*
