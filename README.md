# virtual-code-block

![NPM Version](https://img.shields.io/npm/v/:fullstackcraftllc/virtual-code-block)

`virtual-code-block` is a TypeScript class that simulates a code editor environment with features like cursor navigation, text insertion, and line manipulation. It provides a flexible interface for applying various code editing actions such as typing, moving the cursor, and executing commands. This lightweight and versatile library is ideal for building educational tools, code playgrounds, and interactive coding environments within web applications.

This library heavily relys on the types from [codevideo-types](https://github.com/codevideo/codevideo-types)

## Example Usage

```typescript
import { VirtualCodeBlock } from '@fullstackcraftllc/virtual-code-block';

// Initialize a VirtualCodeBlock instance with initial code lines
const initialCodeLines = [
  'function greet(name) {',
  '    return "Hello, " + name + "!";',
 '}'
];
const virtualCodeBlock = new VirtualCodeBlock(initialCodeLines);

// Apply code editing actions
virtualCodeBlock.applyActions([
  { name: 'arrow-down', value: '1' },  // Move cursor down one time
  { name: 'arrow-right', value: '13' }, // Move cursor right 13 times
  { name: 'type-editor', value: 'world' }, // Type 'world'
  { name: 'space', value: '1' }, // Insert space
  { name: 'type-text', value: '😊' } // Type emoji
]);

// Get the final code and actions applied
const finalCode = virtualCodeBlock.getCode();
const actionsApplied = virtualCodeBlock.getActionsApplied();

// Log the final code and actions applied
console.log('Final code:');
console.log(finalCode);
console.log('Actions applied:');
console.log(actionsApplied);
```

## Available Methods

### `applyAction(action: IAction): void`

Apply a single action to the code.

### `applyActions(actions: Array<IAction>): string`

Apply a series of actions to the code. Returns the final code as a string.

### `getCurrentCode(): Array<string>`

Get the current code lines.

### `getCurrentCaretPosition(): { row: number; column: number }`

Get the current caret position.

### `getActionsApplied(): Array<IAction>`

Get the actions that were applied to the code.

### `getCode(): string`

Get the code as a single string.

### `getCodeLinesHistory(): Array<Array<string>>`

Get the history of code lines.

### `getCodeAfterEachStep(): Array<string>`

Get the code after each step.

### `getEditorStateAfterEachStep(): Array<{ code: string; caretPosition: { row: number; col: number } }>`

Get the editor state after each step.

### `getDataForAnnotatedFrames(): Array<{ actionApplied: IAction; code: string; caretPosition: { row: number; col: number }; speechCaptions: Array<ISpeechCaption>; }>`

Get data for annotated frames.

## Why?

Why do we need a seemingly useless class? This library, along with [`syntax-spy`](https://github.com/codevideo/syntax-spy), are used to validate steps across the CodeVideo ecosystem. This is a small part of a larger project to create a declarative way to build step by step educational software courses.

See more at [codevideo.io](https://codevideo.com)