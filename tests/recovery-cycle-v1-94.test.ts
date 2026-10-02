import assert from "node:assert/strict";
import test from "node:test";

import {
  getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence,
} from "../lib/recovery-engine.ts";

test("V1.94 nonpersistent consequence returns NONE", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "MAINTAIN",
    occurrences: 1,
    persistent: false,
    rationale: "not persistent",
  });

  assert.strictEqual(result.currentConsequence, "MAINTAIN");
  assert.strictEqual(result.occurrences, 1);
  assert.strictEqual(result.persistent, false);
  assert.strictEqual(result.consequence, "NONE");
});

test("V1.94 persistent MAINTAIN consequence returns MAINTAIN", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "MAINTAIN",
    occurrences: 3,
    persistent: true,
    rationale: "persistent",
  });

  assert.strictEqual(result.consequence, "MAINTAIN");
});

test("V1.94 persistent REASSESS consequence returns REASSESS", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "REASSESS",
    occurrences: 3,
    persistent: true,
    rationale: "persistent",
  });

  assert.strictEqual(result.consequence, "REASSESS");
});

test("V1.94 persistent RESET consequence returns RESET", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "RESET",
    occurrences: 3,
    persistent: true,
    rationale: "persistent",
  });

  assert.strictEqual(result.consequence, "RESET");
});

test("V1.94 persistent NONE consequence returns NONE", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "NONE",
    occurrences: 3,
    persistent: true,
    rationale: "persistent",
  });

  assert.strictEqual(result.consequence, "NONE");
});

test("V1.94 preserves consequence identity and persistence", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "RESET",
    occurrences: 7,
    persistent: true,
    rationale: "persistent",
  });

  assert.strictEqual(result.currentConsequence, "RESET");
  assert.strictEqual(result.occurrences, 7);
  assert.strictEqual(result.persistent, true);
});

test("V1.94 rationale explains persistent consequence", () => {
  const result = getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequence({
    currentConsequence: "REASSESS",
    occurrences: 4,
    persistent: true,
    rationale: "persistent",
  });

  assert.ok(result.rationale.includes("REASSESS"));
  assert.ok(result.rationale.includes("4"));
});
