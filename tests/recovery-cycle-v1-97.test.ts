import test from "node:test";
import assert from "node:assert/strict";

import {
  getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence,
} from "../lib/recovery-engine.ts";

test("V1.97 non-persistent produces NONE", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "MAINTAIN",
        occurrences: 2,
        persistent: false,
        rationale: "test",
      },
    );

  assert.equal(result.consequence, "NONE");
});

test("V1.97 persistent MAINTAIN carries forward MAINTAIN", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "MAINTAIN",
        occurrences: 3,
        persistent: true,
        rationale: "test",
      },
    );

  assert.equal(result.consequence, "MAINTAIN");
});

test("V1.97 persistent REASSESS carries forward REASSESS", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "REASSESS",
        occurrences: 3,
        persistent: true,
        rationale: "test",
      },
    );

  assert.equal(result.consequence, "REASSESS");
});

test("V1.97 persistent RESET carries forward RESET", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "RESET",
        occurrences: 3,
        persistent: true,
        rationale: "test",
      },
    );

  assert.equal(result.consequence, "RESET");
});

test("V1.97 persistent NONE remains NONE", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "NONE",
        occurrences: 3,
        persistent: true,
        rationale: "test",
      },
    );

  assert.equal(result.consequence, "NONE");
});

test("V1.97 preserves persistence metadata", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "MAINTAIN",
        occurrences: 5,
        persistent: true,
        rationale: "test",
      },
    );

  assert.equal(result.currentConsequence, "MAINTAIN");
  assert.equal(result.occurrences, 5);
  assert.equal(result.persistent, true);
});

test("V1.97 rationale explains persistent consequence", () => {
  const result =
    getRecoveryCycleTransitionPatternConsequenceResponseConsequenceResponsePersistenceConsequencePersistenceResponseMemoryPersistenceConsequenceMemoryPersistenceConsequenceMemoryPersistenceConsequence(
      {
        currentConsequence: "REASSESS",
        occurrences: 4,
        persistent: true,
        rationale: "test",
      },
    );

  assert.match(result.rationale, /REASSESS/);
  assert.match(result.rationale, /4 consecutive evaluations/);
});
