# Collaboration

Work with others in real-time with conflict-free collaboration.

## Real-time Editing

Spreadsheet Moment uses CRDTs (Conflict-free Replicated Data Types) to ensure multiple users can edit simultaneously without conflicts.

### Subscribe to Changes

```typescript
// Listen for cell changes
spreadsheet.on('cellChanged', (event) => {
  console.log(`Cell ${event.cellId} changed:`, event.value)
})

// Listen for user joins/leaves
spreadsheet.on('userJoined', (user) => {
  console.log(`${user.name} joined`)
})

spreadsheet.on('userLeft', (user) => {
  console.log(`${user.name} left`)
})
```

### Real-time Sync

All changes are automatically synced to all connected clients:

```typescript
// Connect multiple clients
const client1 = new SpreadsheetMoment({ apiKey: '...' })
const client2 = new SpreadsheetMoment({ apiKey: '...' })

const spreadsheet1 = await client1.spreadsheets.get('id')
const spreadsheet2 = await client2.spreadsheets.get('id')

// Changes from client1 appear on client2 automatically
await spreadsheet1.setCell('A1', 'Hello')

// Both clients see the change
console.log(await spreadsheet2.getCell('A1')) // 'Hello'
```

## Sharing & Permissions

### Share a Spreadsheet

```typescript
await spreadsheet.share({
  userEmail: 'user@example.com',
  role: 'editor' // 'viewer', 'editor', 'owner'
})
```

### Permission Levels

| Role | Permissions |
|------|-------------|
| `viewer` | Read-only access |
| `editor` | Edit cells, add comments |
| `owner` | Full control, can delete |

### List Collaborators

```typescript
const collaborators = await spreadsheet.listCollaborators()
console.log(collaborators)
/*
[
  { email: 'user1@example.com', role: 'owner' },
  { email: 'user2@example.com', role: 'editor' },
  { email: 'user3@example.com', role: 'viewer' }
]
*/
```

### Revoke Access

```typescript
await spreadsheet.unshare('user@example.com')
```

## Comments & Discussion

### Add Comments

```typescript
await spreadsheet.addComment({
  cellId: 'A1',
  content: 'Please update this value',
  authorId: 'user-id'
})
```

### Resolve Comments

```typescript
await spreadsheet.resolveComment(commentId)
```

## Version History

### View Versions

```typescript
const versions = await spreadsheet.listVersions()
console.log(versions)
/*
[
  { id: 'v1', createdAt: '...', createdBy: '...' },
  { id: 'v2', createdAt: '...', createdBy: '...' }
]
*/
```

### Restore Version

```typescript
await spreadsheet.restoreVersion('v1')
```

## Conflict Resolution

CRDTs automatically resolve conflicts using these rules:

1. **Last-write-wins** for concurrent edits to the same cell
2. **Operational transformation** for complex operations
3. **Automatic merging** for non-conflicting changes

Manual conflict resolution is rarely needed, but available:

```typescript
const conflicts = await spreadsheet.listConflicts()

for (const conflict of conflicts) {
  // Choose which version to keep
  await spreadsheet.resolveConflict(conflict.id, 'winner-version-id')
}
```

## Best Practices

### Batch Operations

```typescript
// Good: Batch multiple changes
await spreadsheet.setCells({
  'A1': 'Value 1',
  'B1': 'Value 2',
  'C1': 'Value 3'
})

// Avoid: Multiple individual calls
await spreadsheet.setCell('A1', 'Value 1')
await spreadsheet.setCell('B1', 'Value 2')
await spreadsheet.setCell('C1', 'Value 3')
```

### Optimize Listeners

```typescript
// Good: Filter events
spreadsheet.on('cellChanged', (event) => {
  if (event.cellId.startsWith('A')) {
    // Only process column A
  }
})

// Avoid: Processing all events
spreadsheet.on('cellChanged', (event) => {
  // Heavy processing for every change
})
```

## Next Steps

- [Real-time Editing Guide](../guides/collaboration/real-time-editing.md)
- [Sharing & Permissions](../guides/collaboration/sharing-permissions.md)
- [Version History](../guides/collaboration/version-history.md)
