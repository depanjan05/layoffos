import test from "node:test";
import assert from "node:assert/strict";

import {
  getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory,
} from "../lib/recovery-engine.ts";

test("V1.95 consequence memory establishes initial context", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      null,
      "MAINTAIN",
    );

  assert.equal(result.previousConsequence, null);
  assert.equal(result.currentConsequence, "MAINTAIN");
  assert.equal(result.repeated, false);
  assert.match(result.rationale, /initial V1\.95 consequence memory context/);
});

test("V1.95 matching MAINTAIN consequence is remembered", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      "MAINTAIN",
      "MAINTAIN",
    );

  assert.equal(result.previousConsequence, "MAINTAIN");
  assert.equal(result.currentConsequence, "MAINTAIN");
  assert.equal(result.repeated, true);
});

test("V1.95 matching REASSESS consequence is remembered", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      "REASSESS",
      "REASSESS",
    );

  assert.equal(result.previousConsequence, "REASSESS");
  assert.equal(result.currentConsequence, "REASSESS");
  assert.equal(result.repeated, true);
});

test("V1.95 matching RESET consequence is remembered", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      "RESET",
      "RESET",
    );

  assert.equal(result.previousConsequence, "RESET");
  assert.equal(result.currentConsequence, "RESET");
  assert.equal(result.repeated, true);
});

test("V1.95 matching NONE consequence is remembered", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      "NONE",
      "NONE",
    );

  assert.equal(result.previousConsequence, "NONE");
  assert.equal(result.currentConsequence, "NONE");
  assert.equal(result.repeated, true);
});

test("V1.95 changed consequence is not repeated", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      "MAINTAIN",
      "REASSESS",
    );

  assert.equal(result.previousConsequence, "MAINTAIN");
  assert.equal(result.currentConsequence, "REASSESS");
  assert.equal(result.repeated, false);
  assert.match(result.rationale, /has changed/);
});

test("V1.95 consequence memory rationale explains repetition", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemory(
      "RESET",
      "RESET",
    );

  assert.match(result.rationale, /previous V1\.94 consequence was RESET/);
  assert.match(result.rationale, /current consequence is also RESET/);
  assert.match(result.rationale, /repeated and carried forward/);
});
