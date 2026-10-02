import { test } from "node:test";
import assert from "node:assert/strict";

import {
  getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory,
} from "../lib/recovery-engine.ts";

type Consequence = "NONE" | "MAINTAIN" | "REASSESS" | "RESET";

function makeMemory(consequence: Consequence) {
  return {
    previousConsequence: consequence,
    currentConsequence: consequence,
    changed: false,
    rationale: "Existing V1.98 consequence memory.",
  };
}

test("V1.98 initial consequence memory establishes context", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(null, "NONE");

  assert.equal(result.previousConsequence, null);
  assert.equal(result.currentConsequence, "NONE");
  assert.equal(result.changed, false);
});

test("V1.98 repeated NONE is unchanged", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(makeMemory("NONE"), "NONE");

  assert.equal(result.previousConsequence, "NONE");
  assert.equal(result.currentConsequence, "NONE");
  assert.equal(result.changed, false);
});

test("V1.98 repeated MAINTAIN is unchanged", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(makeMemory("MAINTAIN"), "MAINTAIN");

  assert.equal(result.previousConsequence, "MAINTAIN");
  assert.equal(result.currentConsequence, "MAINTAIN");
  assert.equal(result.changed, false);
});

test("V1.98 repeated REASSESS is unchanged", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(makeMemory("REASSESS"), "REASSESS");

  assert.equal(result.previousConsequence, "REASSESS");
  assert.equal(result.currentConsequence, "REASSESS");
  assert.equal(result.changed, false);
});

test("V1.98 repeated RESET is unchanged", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(makeMemory("RESET"), "RESET");

  assert.equal(result.previousConsequence, "RESET");
  assert.equal(result.currentConsequence, "RESET");
  assert.equal(result.changed, false);
});

test("V1.98 changed consequence is detected", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(makeMemory("NONE"), "REASSESS");

  assert.equal(result.previousConsequence, "NONE");
  assert.equal(result.currentConsequence, "REASSESS");
  assert.equal(result.changed, true);
});

test("V1.98 rationale explains the consequence transition", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(makeMemory("RESET"), "MAINTAIN");

  assert.equal(result.changed, true);
  assert.match(result.rationale, /previous V1\.98 consequence was RESET/i);
  assert.match(result.rationale, /current V1\.97 consequence is MAINTAIN/i);
});
