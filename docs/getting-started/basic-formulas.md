# Basic Formulas

Learn to use formulas to perform calculations and data manipulation.

## Formula Syntax

Formulas always start with `=` followed by the expression:

```typescript
await spreadsheet.setCell('A1', '=SUM(B1:B10)')
await spreadsheet.setCell('A2', '=A1*2')
await spreadsheet.setCell('A3', '=CONCAT("Hello, ", B1)')
```

## Basic Functions

### Math Functions

```typescript
// SUM
await spreadsheet.setCell('A1', '=SUM(B1:B10)')

// AVERAGE
await spreadsheet.setCell('A2', '=AVERAGE(B1:B10)')

// COUNT
await spreadsheet.setCell('A3', '=COUNT(B1:B10)')

// MIN/MAX
await spreadsheet.setCell('A4', '=MIN(B1:B10)')
await spreadsheet.setCell('A5', '=MAX(B1:B10)')
```

### Text Functions

```typescript
// CONCAT - Join text
await spreadsheet.setCell('A1', '=CONCAT("Hello", " ", "World")')

// LEFT/RIGHT - Extract characters
await spreadsheet.setCell('A2', '=LEFT(B1, 5)')
await spreadsheet.setCell('A3', '=RIGHT(B1, 3)')

// UPPER/LOWER/PROPER
await spreadsheet.setCell('A4', '=UPPER(B1)')
await spreadsheet.setCell('A5', '=LOWER(B1)')
await spreadsheet.setCell('A6', '=PROPER(B1)')
```

### Logical Functions

```typescript
// IF
await spreadsheet.setCell('A1', '=IF(B1>100, "High", "Low")')

// AND/OR
await spreadsheet.setCell('A2', '=AND(B1>10, B1<100)')
await spreadsheet.setCell('A3', '=OR(B1="Yes", B1="Maybe")')

// NOT
await spreadsheet.setCell('A4', '=NOT(B1="No")')
```

## Cell References

### Relative References

```typescript
// B1 refers to the cell one column left
await spreadsheet.setCell('C1', '=B1*2')
```

### Absolute References

```typescript
// $B$1 always refers to B1
await spreadsheet.setCell('C1', '=$B$1*2')
```

### Mixed References

```typescript
// $B1 - Column locked, row relative
// B$1 - Column relative, row locked
await spreadsheet.setCell('C1', '=$B1*2')
```

## Named Ranges

Create named ranges for easier formulas:

```typescript
await spreadsheet.defineRange('SalesData', 'A1:B100')
await spreadsheet.setCell('C1', '=SUM(SalesData)')
```

## Common Formulas

### Running Total

```typescript
await spreadsheet.setCell('B2', '=A2')
await spreadsheet.setCell('B3', '=B2+A3')
// Copy B3 down for running total
```

### Percentage Change

```typescript
await spreadsheet.setCell('C2', '=(B2-A2)/A2')
// Format as percentage
```

### Conditional Sum

```typescript
// SUMIF
await spreadsheet.setCell('D1', '=SUMIF(A:A, ">100")')

// SUMIFS
await spreadsheet.setCell('D2', '=SUMIFS(A:A, B:B, ">100", C:C, "<200")')
```

## Error Handling

### Common Errors

| Error | Description |
|-------|-------------|
| `#DIV/0!` | Division by zero |
| `#N/A` | Value not available |
| `#NAME?` | Invalid function name |
| `#NULL!` | Invalid intersection |
| `#NUM!` | Invalid number |
| `#REF!` | Invalid reference |
| `#VALUE!` | Wrong type |

### Error Handling with IFERROR

```typescript
await spreadsheet.setCell('A1', '=IFERROR(B1/C1, "Cannot divide")')
```

## Next Steps

- [Formula Reference](../guides/formulas/reference.md)
- [Collaboration](./collaboration.md)
- [API Documentation](../api/overview.md)
