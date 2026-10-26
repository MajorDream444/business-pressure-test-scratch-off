```markdown
# business-pressure-test-scratch-off Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `business-pressure-test-scratch-off` repository. The codebase is a TypeScript project scaffolded with Vite, designed for rapid web application development. You'll learn how to structure files, write imports/exports, follow commit message patterns, and implement and run tests in alignment with the repository's standards.

## Coding Conventions

### File Naming
- Use **camelCase** for file and folder names.
  - Example: `scratchOffGame.ts`, `pressureTestUtils.ts`

### Import Style
- Both default and named imports are used.
  - Example (default import):
    ```typescript
    import React from 'react';
    ```
  - Example (named import):
    ```typescript
    import { useState } from 'react';
    ```
  - Mixed imports:
    ```typescript
    import React, { useEffect } from 'react';
    ```

### Export Style
- Both default and named exports are present.
  - Example (default export):
    ```typescript
    export default ScratchOffGame;
    ```
  - Example (named export):
    ```typescript
    export function calculatePressure() { ... }
    ```

### Commit Messages
- Freeform style, no strict prefixes.
- Average commit message length: ~59 characters.
  - Example: `Add scratch-off animation and pressure calculation logic`

## Workflows

### Creating a New Feature
**Trigger:** When adding new functionality to the app  
**Command:** `/new-feature`

1. Create a new file using camelCase naming.
2. Implement the feature using TypeScript.
3. Use appropriate import/export style as per the codebase.
4. Write or update tests in a corresponding `*.test.*` file.
5. Commit changes with a clear, descriptive message.

### Running the Application
**Trigger:** When you want to start the development server  
**Command:** `/run-dev`

1. Open your terminal in the project root.
2. Run the Vite development server (usually `npm run dev` or `yarn dev`).
3. Access the app in your browser at the provided local URL.

### Writing and Running Tests
**Trigger:** When you need to verify code correctness  
**Command:** `/run-tests`

1. Add or update test files matching the pattern `*.test.*`.
2. Use the project's test runner (framework unknown; check `package.json` for scripts).
3. Run tests via the appropriate command (e.g., `npm test` or `yarn test`).

## Testing Patterns

- Test files follow the `*.test.*` naming convention.
  - Example: `scratchOffGame.test.ts`
- The specific testing framework is not identified; check the project scripts for details.
- Place test files alongside the code they test or in a dedicated `tests` directory.

## Commands

| Command        | Purpose                                   |
|----------------|-------------------------------------------|
| /new-feature   | Scaffold and implement a new feature      |
| /run-dev       | Start the Vite development server         |
| /run-tests     | Run the test suite                        |
```