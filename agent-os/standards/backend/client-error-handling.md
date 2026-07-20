# Client Error Handling

`client.GetAccount` currently calls `os.Exit(1)` on error rather than
returning the error to the caller. This is a known rough edge.

```go
// Current (avoid this pattern)
if err != nil {
    fmt.Printf("Error: %v\n", err)
    os.Exit(1)
}

// Preferred pattern for new client functions
func GetSomething(...) (Result, error) {
    ...
    if err != nil {
        return Result{}, fmt.Errorf("GetSomething: %w", err)
    }
    ...
}
```

- Do NOT add new `os.Exit(1)` calls in client code
- New client functions must return errors to callers
- `GetAccount` is the only exception and should be refactored when touched
