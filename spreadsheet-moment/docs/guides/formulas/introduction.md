# Formulas Introduction

Learn to harness the power of formulas in Spreadsheet Moment.

## What are Formulas?

Formulas are expressions that calculate values, manipulate data, and automate workflows. They always start with `=` and can include:

- **Functions**: Built-in operations like SUM, AVERAGE, CONCAT
- **References**: Links to other cells (A1, B2, etc.)
- **Operators**: Mathematical (+, -, *, /) and logical (>, <, =)
- **Constants**: Fixed values like numbers and text

## Formula Structure

```
=FUNCTION(argument1, argument2, ...)
```

Example:

```
=SUM(A1:A10)
=A1+B1
=CONCAT("Hello, ", B1)
```

## Cell References

### Relative References

Change when copied:

```
A1: =B1+C1
Copy to A2: =B2+C2
```

### Absolute References

Don't change when copied:

```
A1: =$B$1+$C$1
Copy to A2: =$B$1+$C$1
```

### Mixed References

Partial absolute:

```
A1: =$B1+C$1
Copy to A2: =$B2+C$1
```

## Operators

### Mathematical

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | =A1+B1 |
| `-` | Subtraction | =A1-B1 |
| `*` | Multiplication | =A1*B1 |
| `/` | Division | =A1/B1 |
| `^` | Exponentiation | =A1^2 |
| `%` | Percentage | =A1% |

### Comparison

| Operator | Description | Example |
|----------|-------------|---------|
| `=` | Equal to | =A1=B1 |
| `<>` | Not equal to | =A1<>B1 |
| `>` | Greater than | =A1>B1 |
| `<` | Less than | =A1<B1 |
| `>=` | Greater or equal | =A1>=B1 |
| `<=` | Less or equal | =A1<=B1 |

### Text

| Operator | Description | Example |
|----------|-------------|---------|
| `&` | Concatenate | =A1&B1 |

## Function Categories

### Math & Trigonometry

```excel
=SUM(A1:A10)
=AVERAGE(B1:B20)
=ROUND(C1, 2)
=MAX(D1:D100)
=MIN(E1:E50)
```

### Text

```excel
=CONCAT(A1, " ", B1)
=LEFT(C1, 5)
=RIGHT(D1, 3)
=MID(E1, 2, 4)
=LEN(F1)
```

### Logical

```excel
=IF(A1>100, "High", "Low")
=AND(B1>10, B1<100)
=OR(C1="Yes", C1="Maybe")
=NOT(D1="No")
```

### Date & Time

```excel
=TODAY()
=NOW()
=DATE(2024, 1, 1)
=TIME(12, 30, 0)
=DATEDIF(A1, B1, "D")
```

### Lookup & Reference

```excel
=VLOOKUP(A1, B1:D10, 2, FALSE)
=HLOOKUP(A1, B1:Z10, 2, FALSE)
=INDEX(A1:C10, 2, 3)
=MATCH(A1, B1:B10, 0)
```

## Nested Functions

Combine functions for complex calculations:

```excel
=IF(AND(A1>0, A1<100), "Valid", "Invalid")
=ROUND(SUM(A1:A10)/COUNT(A1:A10), 2)
=CONCAT("Total: ", TEXT(SUM(B1:B10), "$#,##0.00"))
```

## Array Formulas

Perform operations on arrays:

```excel
=SUM(A1:A10*B1:B10)
=SUM(IF(A1:A10>100, B1:B10, 0))
```

## Error Handling

Handle errors gracefully:

```excel
=IFERROR(A1/B1, "Cannot divide")
=IF(ISERROR(A1), "Error", A1)
```

## Best Practices

### 1. Use Named Ranges

```excel
=SUM(SalesData)  // Better than =SUM(A1:A100)
```

### 2. Break Complex Formulas

```excel
// Instead of:
=IF(AND(A1>0, A1<100, B1>0, B1<100, OR(C1="Yes", C1="Maybe")), "Valid", "Invalid")

// Break into:
=AND(A1>0, A1<100) -> A1_Valid
=AND(B1>0, B1<100) -> B1_Valid
=OR(C1="Yes", C1="Maybe") -> C1_Valid
=IF(AND(A1_Valid, B1_Valid, C1_Valid), "Valid", "Invalid")
```

### 3. Use Helper Columns

```excel
// Instead of complex nested formula in one cell:
=IF(VLOOKUP(A1, Data, 2, FALSE)>100, VLOOKUP(A1, Data, 3, FALSE)*1.1, VLOOKUP(A1, Data, 3, FALSE))

// Use helper columns:
B1: =VLOOKUP(A1, Data, 2, FALSE)
C1: =VLOOKUP(A1, Data, 3, FALSE)
D1: =IF(B1>100, C1*1.1, C1)
```

## Next Steps

- [Formula Reference](./reference.md)
- [Formula Examples](./examples.md)
- [Troubleshooting](./troubleshooting.md)
