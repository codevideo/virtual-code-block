import {
  CodeAction,
  IAction,
  SpeakAction,
  ISpeechCaption,
  isCodeAction,
  isSpeakAction,
  isRepeatableAction,
} from "@fullstackcraftllc/codevideo-types";
import { getAdjacentSpeechCaptionsBasedOnCodeActionIndex } from "./utils/getAdjacentSpeechCaptionsBasedOnCodeActionIndex";

// TODO: needs highlighting feature later (moving cursor while shift / command is pressed)

/**
 * Represents a virtual code block that can be manipulated by a series of actions.
 */
export class VirtualCodeBlock {
  private caretRow = 0; // 'X'
  private caretColumn = 0; // 'Y'
  private codeLines: Array<string>;
  private actionsApplied: Array<IAction>;
  private codeActionsApplied: Array<CodeAction>;
  private speakActionsApplied: Array<SpeakAction>;
  private verbose: boolean = false;
  private codeLinesHistory: Array<Array<string>> = [];
  private speechCaptionHistory: Array<ISpeechCaption> = [];

  constructor(initialCodeLines: Array<string>, verbose?: boolean) {
    // if the initial code lines are empty, add an empty string to start
    if (initialCodeLines.length === 0) {
      initialCodeLines.push("");
    }

    this.codeLines = initialCodeLines;
    this.actionsApplied = [];
    this.codeActionsApplied = [];
    this.speakActionsApplied = [];
    this.speechCaptionHistory = [];
    this.codeLinesHistory.push(initialCodeLines.slice());
  }

  /**
   * Applies a series of actions to the virtual code block.
   * @param actions The actions to apply.
   * @returns The code after the actions have been applied.
   */
  applyActions(actions: Array<IAction>): string {
    actions.forEach((action) => {
      this.applyAction(action);
    });

    return this.getCode();
  }

  /**
   * Applies a single action to the virtual code block.
   * @param action The action to apply.
   * @returns The code after the action has been applied. Note the code can be identical to a previous step if the action applied was not a code action.
   */
  applyAction(action: IAction): string {
    // parse number out from action.value
    // if it fails we know it is something else like a code string, so default numTimes to 1
    let numTimes = 1;
    if (isRepeatableAction(action)) {
      numTimes = parseInt(action.value);
    }
    const currentLineLength = this.codeLines[this.caretRow].length;
    switch (action.name) {
      case "enter":
        // for numTimes, enter moves everything after the caret position to a new line (and all other lines below it)
        for (let i = 0; i < numTimes; i++) {
          this.codeLines.splice(
            this.caretRow + 1,
            0,
            this.codeLines[this.caretRow].substring(this.caretColumn)
          );
          this.codeLines[this.caretRow] = this.codeLines[
            this.caretRow
          ].substring(0, this.caretColumn);
          this.caretRow++;
          this.caretColumn = 0;
        }
        break;
      case "type-editor":
        // with type-editor, the caret is always at the end of the typed text
        const typedStringLength = action.value.length;
        for (let i = 0; i < numTimes; i++) {
          this.codeLines[this.caretRow] =
            this.codeLines[this.caretRow].substring(0, this.caretColumn) +
            action.value +
            this.codeLines[this.caretRow].substring(this.caretColumn);
          this.caretColumn += typedStringLength;
        }
        break;
      case "arrow-down":
        // for numTimes, move the caret down if the current row is not the last row
        for (let i = 0; i < numTimes; i++) {
          if (this.caretRow < this.codeLines.length - 1) {
            this.caretRow++;
          }
        }
        break;
      case "arrow-up":
        // for numTimes, move the caret up if the current row is not the first row
        for (let i = 0; i < numTimes; i++) {
          if (this.caretRow > 0) {
            this.caretRow--;
          }
        }
        break;
      case "arrow-right":
        // for numTimes, move the caret right - if we are at the end of a line and there are more lines below the current line, move to the start of the next line
        for (let i = 0; i < numTimes; i++) {
          if (this.caretColumn < currentLineLength - 1) {
            this.caretColumn++;
          } else if (this.caretRow < this.codeLines.length - 1) {
            this.caretRow++;
            this.caretColumn = 0;
          }
        }
        break;
      case "arrow-left":
        // for numTimes, move the caret left - if we are at the start of a line and there are more lines above the current line, move to the end of the previous line
        for (let i = 0; i < numTimes; i++) {
          if (this.caretColumn > 0) {
            this.caretColumn--;
          } else if (this.caretRow > 0) {
            this.caretRow--;
            this.caretColumn = this.codeLines[this.caretRow].length - 1;
          }
        }
        break;
      case "backspace":
        // for numTimes, remove the character to the left of the caret. if we are at the start of a line and there are more lines above the current line, move the entire current line to the end of the previous line
        for (let i = 0; i < numTimes; i++) {
          if (this.caretColumn > 0) {
            this.codeLines[this.caretRow] =
              this.codeLines[this.caretRow].substring(0, this.caretColumn - 1) +
              this.codeLines[this.caretRow].substring(this.caretColumn);
            this.caretColumn--;
          } else if (this.caretRow > 0) {
            this.caretColumn = this.codeLines[this.caretRow - 1].length;
            this.codeLines[this.caretRow - 1] += this.codeLines[this.caretRow];
            this.codeLines.splice(this.caretRow, 1);
            this.caretRow--;
          }
        }
        break;
      case "space":
        // for numTimes, insert a space at the current caret position
        for (let i = 0; i < numTimes; i++) {
          this.codeLines[this.caretRow] =
            this.codeLines[this.caretRow].substring(0, this.caretColumn) +
            " " +
            this.codeLines[this.caretRow].substring(this.caretColumn);
          this.caretColumn++;
        }
        break;
      case "tab":
        // for numTimes, insert a tab at the current caret position
        for (let i = 0; i < numTimes; i++) {
          this.codeLines[this.caretRow] =
            this.codeLines[this.caretRow].substring(0, this.caretColumn) +
            "\t" +
            this.codeLines[this.caretRow].substring(this.caretColumn);
          this.caretColumn++;
        }
        break;
      case "command-left":
        // for numTimes, move the caret to the start of the current line if the current caretColumn is not 0
        for (let i = 0; i < numTimes; i++) {
          if (this.caretColumn > 0) {
            this.caretColumn = 0;
          }
        }
        break;
      case "command-right":
        // for numTimes, move the caret to the end of the current line if the current caretColumn is not the length of the current line
        for (let i = 0; i < numTimes; i++) {
          if (this.caretColumn < currentLineLength) {
            this.caretColumn = currentLineLength;
          }
        }
        break;
      case "speak-before":
      case "speak-after":
      case "speak-during":
        // known actions, but nothing to do here. they are appended to proper models as
        break;
      default:
        console.log(
          `WARNING: Action ${action.name} not recognized. Skipping...`
        );
        break;
    }

    // ALWAYS append the action to the end of the actionsApplied
    this.actionsApplied.push(action);

    // append code actions to code actions applied
    if (isCodeAction(action)) {
      this.codeActionsApplied.push(action);
    }

    // append speak actions to speak actions applied
    if (isSpeakAction(action)) {
      this.speakActionsApplied.push(action);
      // can also push to speechCaptionHistory
      this.speechCaptionHistory.push({
        speechType: action.name,
        speechValue: action.value,
      });
    } else {
      // if its not a speak action, push an empty speechCaption to the history
      this.speechCaptionHistory.push({
        speechType: "",
        speechValue: "",
      });
    }

    // Append the current code to the code history
    this.codeLinesHistory.push(this.codeLines.slice());

    // If verbose is true, log the action and the current code
    if (this.verbose) {
      console.log(this.getCodeLines());
    }

    // Return the code after the action has been applied
    return this.getCode();
  }

  /**
   * Returns the code lines of the virtual code block.
   * @returns The code lines of the virtual code block.
   */
  getCodeLines(): Array<string> {
    return this.codeLines;
  }

  /**
   * Returns the current caret position of the virtual code block.
   * @returns The current caret position of the virtual code block.
   */
  getCurrentCaretPosition(): { row: number; column: number } {
    return { row: this.caretRow, column: this.caretColumn };
  }

  /**
   * Sets the current caret position of the virtual code block.
   * @param row The row to set the caret position to.
   * @param column The column to set the caret position to.
   */
  setCurrentCaretPosition(row: number, column: number) {
    this.caretRow = row;
    this.caretColumn = column;
  }

  /**
   * Gets the actions applied to the virtual code block.
   * @returns The actions applied to the virtual code block.
   */
  getActionsApplied(): Array<IAction> {
    return this.actionsApplied;
  }

  /**
   * Gets the code after the actions have been applied.
   * @returns The code after the actions have been applied.
   */
  getCode(): string {
    return this.codeLines.join("\n");
  }

  /**
   * Gets the code at a specific action index that has been applied.
   * @param actionIndex The index of the action to get the code after.
   * @returns The code after the action has been applied.
   * @throws An error if the action index is out of bounds.
   */
  getCodeAtActionIndex(actionIndex: number): string {
    if (actionIndex > this.codeLinesHistory.length - 1) {
      throw new Error("Action index out of bounds");
    }
    return this.codeLinesHistory[actionIndex].join("\n");
  }

  /**
   * Returns all historical changes to the code block.
   * @returns An array of code lines at each step.
   */
  getCodeLinesHistory(): Array<Array<string>> {
    return this.codeLinesHistory;
  }

  getSpeakActionsApplied(): Array<SpeakAction> {
    return this.speakActionsApplied;
  }

  getCodeActionsApplied(): Array<CodeAction> {
    return this.codeActionsApplied;
  }

  getCodeAfterEachStep(): Array<string> {
    return this.codeLinesHistory.map((codeLines) => codeLines.join("\n"));
  }

  getEditorStateAfterEachStep(): Array<{
    code: string;
    caretPosition: { row: number; col: number };
  }> {
    return this.codeLinesHistory.map((codeLines) => {
      return {
        code: codeLines.join("\n"),
        caretPosition: { row: this.caretRow, col: this.caretColumn },
      };
    });
  }

  getDataForAnnotatedFrames(): Array<{
    actionApplied: IAction;
    code: string;
    caretPosition: { row: number; col: number };
    speechCaptions: Array<ISpeechCaption>;
  }> {
    return this.codeLinesHistory.map((codeLines, index) => {
      const speechCaptions = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
        index,
        this.actionsApplied
      );
      return {
        actionApplied: this.actionsApplied[index],
        code: codeLines.join("\n"),
        caretPosition: { row: this.caretRow, col: this.caretColumn },
        speechCaptions,
      };
    });
  }
}
