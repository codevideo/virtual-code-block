import { describe, expect } from "@jest/globals";
import { getAdjacentSpeechCaptionsBasedOnCodeActionIndex } from "../../src/utils/getAdjacentSpeechCaptionsBasedOnCodeActionIndex";
import { IAction } from "@fullstackcraftllc/codevideo-types";

describe("getSpeechCaptionBasedOnCodeActionIndex", () => {
  it("should return the correct speech caption when speak-before is before the provided index", () => {
    const actions: Array<IAction> = [
      { name: "speak-before", value: "here is some before speech" },
      { name: "type-editor", value: "console.log('hello world!')" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      1,
      actions
    );
    expect(speechCaption).toEqual([{
      speechType: "speak-before",
      speechValue: "here is some before speech",
    }]);
  });
  it("should return the nearest speech caption when speak-after is after the provided index", () => {
    const actions: Array<IAction> = [
      { name: "type-editor", value: "console.log('hello world!')" },
      { name: "speak-after", value: "here is some after speech" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      0,
      actions
    );
    expect(speechCaption).toEqual([
      {
        speechType: "speak-after",
        speechValue: "here is some after speech",
      },
    ]);
  });
  it("should return both speak-before and speak-before if both are adjacent", () => {
    const actions: Array<IAction> = [
      { name: "speak-before", value: "here is some before speech" },
      { name: "type-editor", value: "console.log('hello world!')" },
      { name: "speak-after", value: "here is some after speech" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      1,
      actions
    );
    expect(speechCaption).toEqual([
      {
        speechType: "speak-before",
        speechValue: "here is some before speech",
      },
      {
        speechType: "speak-after",
        speechValue: "here is some after speech",
      },
    ]);
  });
  it("should still return the most adjacent speak-before if there are multiple speak-before", () => {
    const actions: Array<IAction> = [
      { name: "speak-before", value: "here is some before speech" },
      { name: "speak-before", value: "here is some before speech 2" },
      { name: "type-editor", value: "console.log('hello world!')" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      2,
      actions
    );
    expect(speechCaption).toEqual([
      {
        speechType: "speak-before",
        speechValue: "here is some before speech 2",
      },
    ]);
  });
  it("should still return the most adjacent speak-after if there are multiple speak-after", () => {
    const actions: Array<IAction> = [
      { name: "type-editor", value: "console.log('hello world!')" },
      { name: "speak-after", value: "here is some after speech" },
      { name: "speak-after", value: "here is some after speech 2" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      0,
      actions
    );
    expect(speechCaption).toEqual([
      {
        speechType: "speak-after",
        speechValue: "here is some after speech",
      },
    ]);
  });
  it("should return an empty array if there are no speak-before or speak-after", () => {
    const actions: Array<IAction> = [
      { name: "type-editor", value: "console.log('hello world!')" },
      { name: "type-editor", value: "console.log('hello world!')" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      0,
      actions
    );
    expect(speechCaption).toEqual([]);
  });
  it("should return both speak-before and speak-before if both are adjacent and there are many on both sides", () => {
    const actions: Array<IAction> = [
      { name: "speak-before", value: "here is some before speech" },
      { name: "speak-before", value: "here is some before speech 2" },
      { name: "type-editor", value: "console.log('hello world!')" },
      { name: "speak-after", value: "here is some after speech" },
      { name: "speak-after", value: "here is some after speech 2" },
    ];
    const speechCaption = getAdjacentSpeechCaptionsBasedOnCodeActionIndex(
      2,
      actions
    );
    expect(speechCaption).toEqual([
      {
        speechType: "speak-before",
        speechValue: "here is some before speech 2",
      },
      {
        speechType: "speak-after",
        speechValue: "here is some after speech",
      },
    ]);
  });
});
