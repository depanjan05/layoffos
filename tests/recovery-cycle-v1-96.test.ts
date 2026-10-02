import test from "node:test";
import assert from "node:assert/strict";

import {
  getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence,
} from "../lib/recovery-engine.ts";

test("V1.96 consequence persistence establishes initial context", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      null,
      "MAINTAIN",
    );

  assert.equal(result.previousConsequence, null);
  assert.equal(result.currentConsequence, "MAINTAIN");
  assert.equal(result.occurrences, 1);
  assert.equal(result.persistent, false);
});

test("V1.96 matching consequence increments persistence", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      {
        previousConsequence: "MAINTAIN",
        currentConsequence: "MAINTAIN",
        occurrences: 1,
        persistent: false,
        rationale: "initial",
      },
      "MAINTAIN",
    );

  assert.equal(result.currentConsequence, "MAINTAIN");
  assert.equal(result.occurrences, 2);
  assert.equal(result.persistent, false);
});

test("V1.96 consequence becomes persistent on third occurrence", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      {
        previousConsequence: "REASSESS",
        currentConsequence: "REASSESS",
        occurrences: 2,
        persistent: false,
        rationale: "second",
      },
      "REASSESS",
    );

  assert.equal(result.currentConsequence, "REASSESS");
  assert.equal(result.occurrences, 3);
  assert.equal(result.persistent, true);
});

test("V1.96 persistent consequence remains persistent after repetition", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      {
        previousConsequence: "RESET",
        currentConsequence: "RESET",
        occurrences: 3,
        persistent: true,
        rationale: "persistent",
      },
      "RESET",
    );

  assert.equal(result.occurrences, 4);
  assert.equal(result.persistent, true);
});

test("V1.96 consequence persistence resets when consequence changes", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      {
        previousConsequence: "MAINTAIN",
        currentConsequence: "MAINTAIN",
        occurrences: 5,
        persistent: true,
        rationale: "persistent",
      },
      "REASSESS",
    );

  assert.equal(result.previousConsequence, "MAINTAIN");
  assert.equal(result.currentConsequence, "REASSESS");
  assert.equal(result.occurrences, 1);
  assert.equal(result.persistent, false);
});

test("V1.96 consequence persistence tracks NONE independently", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      {
        previousConsequence: "NONE",
        currentConsequence: "NONE",
        occurrences: 2,
        persistent: false,
        rationale: "second",
      },
      "NONE",
    );

  assert.equal(result.currentConsequence, "NONE");
  assert.equal(result.occurrences, 3);
  assert.equal(result.persistent, true);
});

test("V1.96 persistence rationale explains established persistence", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistence(
      {
        previousConsequence: "RESET",
        currentConsequence: "RESET",
        occurrences: 2,
        persistent: false,
        rationale: "second",
      },
      "RESET",
    );

  assert.equal(result.persistent, true);
  assert.match(result.rationale, /RESET/);
  assert.match(result.rationale, /3 consecutive evaluations/);
  assert.match(result.rationale, /persistence is established/);
});
