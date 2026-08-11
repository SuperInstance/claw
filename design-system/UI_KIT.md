# Spreadsheet Moment - UI Kit

## UI Kit Overview

The Spreadsheet Moment UI Kit provides a comprehensive set of ready-to-use interface components designed for consistency, accessibility, and performance.

---

## UI Kit Structure

```
design-system/ui-kit/
├── figma/                    # Figma component library
│   ├── Spreadsheet-Moment-UI-Kit.figjam
│   └── components/
│       ├── buttons/
│       ├── inputs/
│       ├── cards/
│       └── ...
├── react/                    # React component library
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   └── ...
│   ├── hooks/
│   ├── utils/
│   └── index.ts
├── storybook/                # Storybook stories
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   └── ...
└── tailwind/                 # Tailwind CSS presets
    ├── components.js
    └── presets.js
```

---

## Component Categories

### 1. Buttons

#### Button Variants

**Primary Button**
```tsx
<Button variant="primary" size="md">
  Save Changes
</Button>
```
Use for: Primary call-to-action, main actions

**Secondary Button**
```tsx
<Button variant="secondary" size="md">
  Cancel
</Button>
```
Use for: Alternative actions, secondary options

**Accent Button**
```tsx
<Button variant="accent" size="md">
  Upgrade Now
</Button>
```
Use for: Prominent CTAs, upgrades, special actions

**Ghost Button**
```tsx
<Button variant="ghost" size="md">
  Learn More
</Button>
```
Use for: Low-emphasis actions, tertiary options

**Link Button**
```tsx
<Button variant="link" size="md">
  View Documentation
</Button>
```
Use for: Navigation, inline actions

#### Button Sizes

**XS (Extra Small)** - 32px height
```tsx
<Button size="xs">Delete</Button>
```
Use for: Compact layouts, tables, toolbars

**SM (Small)** - 36px height
```tsx
<Button size="sm">Edit</Button>
```
Use for: Forms, cards, list items

**MD (Medium)** - 40px height (default)
```tsx
<Button size="md">Submit</Button>
```
Use for: General purpose, most buttons

**LG (Large)** - 48px height
```tsx
<Button size="lg">Get Started</Button>
```
Use for: Marketing pages, hero sections

**XL (Extra Large)** - 56px height
```tsx
<Button size="xl">Create Account</Button>
```
Use for: Very prominent CTAs, marketing

#### Button States

**Default**
```tsx
<Button>Default State</Button>
```

**Hover**
```tsx
<Button className="hover">Hover State</Button>
```

**Active/Pressed**
```tsx
<Button className="active">Active State</Button>
```

**Focus**
```tsx
<Button className="focus">Focus State</Button>
```

**Disabled**
```tsx
<Button disabled>Disabled State</Button>
```

**Loading**
```tsx
<Button loading>Loading...</Button>
```

#### Button with Icons

**Left Icon**
```tsx
<Button leftIcon={<PlusIcon />}>Add New</Button>
```

**Right Icon**
```tsx
<Button rightIcon={<ArrowRightIcon />}>Continue</Button>
```

**Icon Only**
```tsx
<Button iconOnly={<SearchIcon />} aria-label="Search" />
```

---

### 2. Form Components

#### Input Fields

**Text Input**
```tsx
<Input
  label="Full Name"
  placeholder="Enter your name"
  required
/>
```

**Email Input**
```tsx
<Input
  type="email"
  label="Email Address"
  placeholder="you@example.com"
/>
```

**Password Input**
```tsx
<Input
  type="password"
  label="Password"
  showVisibilityToggle
/>
```

**Number Input**
```tsx
<Input
  type="number"
  label="Quantity"
  min="0"
  max="100"
/>
```

**Search Input**
```tsx
<Input
  type="search"
  placeholder="Search..."
  leftIcon={<SearchIcon />}
  onClear={() => console.log('Cleared')}
/>
```

**Error State**
```tsx
<Input
  label="Email"
  error
  errorText="Please enter a valid email address"
/>
```

**Disabled State**
```tsx
<Input
  label="Disabled Field"
  disabled
  value="Cannot edit"
/>
```

#### Textarea

```tsx
<Textarea
  label="Message"
  placeholder="Enter your message..."
  rows={4}
  maxLength={500}
  showCharacterCount
/>
```

#### Select

**Basic Select**
```tsx
<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
/>
```

**Multi-Select**
```tsx
<Select
  label="Tags"
  multiple
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ]}
/>
```

#### Checkbox

**Single Checkbox**
```tsx
<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={setAgreed}
/>
```

**Checkbox Group**
```tsx
<CheckboxGroup
  label="Preferences"
  options={[
    { value: 'email', label: 'Email notifications' },
    { value: 'sms', label: 'SMS notifications' },
    { value: 'push', label: 'Push notifications' },
  ]}
/>
```

#### Radio Group

```tsx
<RadioGroup
  label="Select Plan"
  options={[
    { value: 'free', label: 'Free Plan', description: '$0/month' },
    { value: 'pro', label: 'Pro Plan', description: '$29/month' },
    { value: 'enterprise', label: 'Enterprise', description: 'Custom pricing' },
  ]}
/>
```

#### Switch

```tsx
<Switch
  label="Enable notifications"
  checked={enabled}
  onChange={setEnabled}
/>
```

#### Slider

```tsx
<Slider
  label="Volume"
  min={0}
  max={100}
  value={volume}
  onChange={setVolume}
  showValue
/>
```

---

### 3. Data Display

#### Card

**Basic Card**
```tsx
<Card title="Card Title">
  <p>Card content goes here...</p>
</Card>
```

**Card with Image**
```tsx
<Card
  title="Product Name"
  image="/path/to/image.jpg"
  subtitle="$29.99"
>
  <p>Product description...</p>
</Card>
```

**Clickable Card**
```tsx
<Card
  title="Click Me"
  clickable
  onClick={() => console.log('Clicked')}
>
  <p>This card is clickable</p>
</Card>
```

**Card with Actions**
```tsx
<Card
  title="Settings"
  actions={
    <>
      <Button variant="ghost" size="sm">Cancel</Button>
      <Button variant="primary" size="sm">Save</Button>
    </>
  }
>
  <p>Configure your settings...</p>
</Card>
```

#### Table

**Basic Table**
```tsx
<Table
  data={users}
  columns={columns}
/>
```

**Selectable Table**
```tsx
<Table
  data={users}
  columns={columns}
  selectable
  onRowSelect={(row) => console.log('Selected:', row)}
/>
```

**Sortable Table**
```tsx
<Table
  data={users}
  columns={columns}
  sortable
  onSort={(column, direction) => console.log(`Sort ${column} ${direction}`)}
/>
```

**Paginated Table**
```tsx
<Table
  data={users}
  columns={columns}
  pagination
  pageSize={20}
  currentPage={page}
  onPageChange={setPage}
/>
```

#### Badge

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="info">New</Badge>
```

#### Tag

```tsx
<Tag removable onRemove={() => console.log('Removed')}>
  react
</Tag>
<Tag removable onRemove={() => console.log('Removed')}>
  typescript
</Tag>
```

#### Avatar

```tsx
<Avatar src="/path/to/avatar.jpg" alt="User name" />
<Avatar initials="JD" />
<Avatar icon={<UserIcon />} />
```

#### Progress Bar

```tsx
<Progress value={75} showLabel />
<Progress value={30} variant="warning" />
<Progress value={90} variant="success" />
```

---

### 4. Feedback Components

#### Alert

```tsx
<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="warning" title="Warning">
  Please review before proceeding.
</Alert>

<Alert variant="error" title="Error">
  Something went wrong.
</Alert>

<Alert variant="info" title="Info">
  Here's some helpful information.
</Alert>
```

#### Toast

```tsx
<Toast
  variant="success"
  message="Changes saved successfully"
  duration={3000}
/>
```

#### Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to proceed?</p>
  <Modal.Footer>
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary">Confirm</Button>
  </Modal.Footer>
</Modal>
```

#### Tooltip

```tsx
<Tooltip content="This is a tooltip">
  <Button>Hover me</Button>
</Tooltip>
```

#### Popover

```tsx
<Popover
  trigger={<Button>Click me</Button>}
  content={
    <div>
      <h4>Popover Title</h4>
      <p>Popover content goes here...</p>
    </div>
  }
/>
```

---

### 5. Navigation

#### Tabs

```tsx
<Tabs>
  <TabList>
    <Tab>Overview</Tab>
    <Tab>Features</Tab>
    <Tab>Pricing</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>Overview content...</TabPanel>
    <TabPanel>Features content...</TabPanel>
    <TabPanel>Pricing content...</TabPanel>
  </TabPanels>
</Tabs>
```

#### Breadcrumbs

```tsx
<Breadcrumbs>
  <Breadcrumb href="/">Home</Breadcrumb>
  <Breadcrumb href="/products">Products</Breadcrumb>
  <Breadcrumb>Current Page</Breadcrumb>
</Breadcrumbs>
```

#### Pagination

```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
/>
```

#### Menu

```tsx
<Menu>
  <MenuTrigger>
    <Button>Menu</Button>
  </MenuTrigger>
  <MenuContent>
    <MenuItem onClick={() => console.log('New')}>New</MenuItem>
    <MenuItem onClick={() => console.log('Open')}>Open</MenuItem>
    <MenuSeparator />
    <MenuItem onClick={() => console.log('Save')}>Save</MenuItem>
  </MenuContent>
</Menu>
```

---

## Layout Components

### Container

```tsx
<Container size="md">
  <h1>Page Title</h1>
  <p>Page content...</p>
</Container>
```

### Grid

```tsx
<Grid cols={3} gap={4}>
  <GridItem>Column 1</GridItem>
  <GridItem>Column 2</GridItem>
  <GridItem>Column 3</GridItem>
</Grid>
```

### Stack

```tsx
<Stack spacing={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

### Flex

```tsx
<Flex justify="between" align="center">
  <div>Left</div>
  <div>Right</div>
</Flex>
```

---

## Theme Support

### Light Theme (Default)

```tsx
<ThemeProvider theme="light">
  <App />
</ThemeProvider>
```

### Dark Theme

```tsx
<ThemeProvider theme="dark">
  <App />
</ThemeProvider>
```

### High Contrast Theme

```tsx
<ThemeProvider theme="high-contrast">
  <App />
</ThemeProvider>
```

### Theme Switcher

```tsx
const [theme, setTheme] = useState('light');

<ThemeProvider theme={theme}>
  <App />
  <ThemeSwitcher value={theme} onChange={setTheme} />
</ThemeProvider>
```

---

## Accessibility Features

### Keyboard Navigation

All components support keyboard navigation:
- Tab: Navigate between focusable elements
- Enter/Space: Activate buttons and links
- Arrow keys: Navigate lists, menus, tabs
- Escape: Close modals, dropdowns

### Screen Reader Support

All components include:
- Proper ARIA attributes
- Semantic HTML
- Screen reader announcements
- Focus management

### Focus Indicators

All interactive elements show clear focus indicators:
- 2px outline in brand primary color
- High contrast for visibility
- Consistent across all states

### Reduced Motion

Respects user's motion preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints

- **XS:** 320px
- **SM:** 384px
- **MD:** 768px
- **LG:** 1024px
- **XL:** 1280px
- **2XL:** 1536px

### Responsive Utilities

```tsx
// Responsive button size
<Button
  size={{ base: 'sm', md: 'md', lg: 'lg' }}
>
  Responsive Button
</Button>

// Responsive grid
<Grid
  cols={{ base: 1, md: 2, lg: 3 }}
  gap={4}
>
  {items.map(item => <GridItem key={item.id}>{item}</GridItem>)}
</Grid>

// Show/hide based on breakpoint
<Box display={{ base: 'none', md: 'block' }}>
  Only visible on medium screens and up
</Box>
```

---

## Storybook Integration

### Component Stories

```tsx
// Button.stories.tsx
import type { ComponentMeta } from '@storybook/react';
import { Button } from './Button';

export default {
  title: 'Components/Button',
  component: Button,
} as ComponentMeta<typeof Button>;

export const Primary = () => <Button variant="primary">Primary Button</Button>;
export const Secondary = () => <Button variant="secondary">Secondary Button</Button>;
export const Sizes = () => (
  <>
    <Button size="xs">XS</Button>
    <Button size="sm">SM</Button>
    <Button size="md">MD</Button>
    <Button size="lg">LG</Button>
    <Button size="xl">XL</Button>
  </>
);
export const WithIcon = () => (
  <Button leftIcon={<PlusIcon />}>Add New</Button>
);
```

---

## Installation

### npm

```bash
npm install @spreadsheet-moment/ui-kit
```

### yarn

```bash
yarn add @spreadsheet-moment/ui-kit
```

### pnpm

```bash
pnpm add @spreadsheet-moment/ui-kit
```

---

## Quick Start

```tsx
import { Button, Input, Card, Modal } from '@spreadsheet-moment/ui-kit';

function App() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Input label="Name" placeholder="Enter name" />
      <Card title="Card Title">
        <p>Card content</p>
      </Card>
    </div>
  );
}
```

---

## Documentation

Full documentation available at: https://docs.spreadsheetmoment.com/ui-kit

---

**Last Updated:** 2026-03-15
**Version:** 1.0
**Owner:** Spreadsheet Moment Design System Team
