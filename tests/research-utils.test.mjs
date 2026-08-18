import assert from "node:assert/strict";
import test from "node:test";
import { assignRandomGroups, calculateTwoByTwo, cronbachAlpha, describe, meanConfidenceInterval, normalizeAcademicIdentifier, parseNumericData, parseNumericMatrix, proportionConfidenceInterval } from "../lib/research-utils.ts";

test("parses pasted numeric data and calculates descriptive statistics", () => {
  const values = parseNumericData("1, 2，3\n4; 5");
  assert.deepEqual(values, [1, 2, 3, 4, 5]);
  const result = describe(values);
  assert.equal(result?.count, 5);
  assert.equal(result?.mean, 3);
  assert.equal(result?.median, 3);
  assert.equal(result?.sampleSd, Math.sqrt(2.5));
  assert.equal(result?.q1, 1.5);
  assert.equal(result?.q3, 4.5);
});

test("calculates 2×2 study measures and handles zero cells", () => {
  const result = calculateTwoByTwo(30, 70, 15, 85);
  assert.ok(result);
  assert.equal(result.exposedRisk, 0.3);
  assert.equal(result.controlRisk, 0.15);
  assert.equal(result.riskRatio, 2);
  assert.ok(Math.abs(result.oddsRatio - 2.4285714286) < 1e-9);
  assert.ok(Math.abs(result.nnt - 6.6666666667) < 1e-9);
  assert.equal(result.usedCorrection, false);

  const corrected = calculateTwoByTwo(0, 20, 5, 15);
  assert.equal(corrected?.usedCorrection, true);
  assert.ok(Number.isFinite(corrected?.oddsRatio));
});

test("normalizes DOI, PMID and arXiv identifiers", () => {
  assert.deepEqual(normalizeAcademicIdentifier("https://doi.org/10.1016/j.cose.2025.104649."), {
    type: "DOI",
    value: "10.1016/j.cose.2025.104649",
    url: "https://doi.org/10.1016/j.cose.2025.104649",
  });
  assert.equal(normalizeAcademicIdentifier("PMID: 12345678")?.url, "https://pubmed.ncbi.nlm.nih.gov/12345678/");
  assert.equal(normalizeAcademicIdentifier("arXiv:2401.12345v2")?.url, "https://arxiv.org/abs/2401.12345v2");
  assert.equal(normalizeAcademicIdentifier("not an identifier"), null);
});

test("calculates mean and Wilson proportion confidence intervals", () => {
  const mean = meanConfidenceInterval(72.4, 10.8, 64, 95);
  assert.ok(mean);
  assert.ok(mean.lower > 69 && mean.lower < 70);
  assert.ok(mean.upper > 75 && mean.upper < 76);

  const proportion = proportionConfidenceInterval(84, 120, 95);
  assert.equal(proportion?.proportion, 0.7);
  assert.ok(proportion.lower > 0.61 && proportion.lower < 0.62);
  assert.ok(proportion.upper > 0.77 && proportion.upper < 0.79);
  assert.equal(proportionConfidenceInterval(12, 10, 95), null);
});

test("parses a response matrix and calculates Cronbach's alpha", () => {
  const matrix = parseNumericMatrix("4,5,4,5\n3,4,3,4\n5,5,4,5\n2,3,2,3\n4,4,5,4\n3,3,4,3");
  assert.ok(matrix);
  const result = cronbachAlpha(matrix);
  assert.equal(result?.respondents, 6);
  assert.equal(result?.items, 4);
  assert.ok(result.alpha > 0.7 && result.alpha <= 1);
  assert.equal(parseNumericMatrix("1,2\n3"), null);
});

test("creates deterministic and balanced random assignments", () => {
  const participants = ["P01", "P02", "P03", "P04", "P05"];
  const first = assignRandomGroups(participants, ["介入組", "對照組"], "research-2026");
  const second = assignRandomGroups(participants, ["介入組", "對照組"], "research-2026");
  assert.deepEqual(first, second);
  assert.equal(first.length, 5);
  const counts = first.reduce((all, item) => ({ ...all, [item.group]: (all[item.group] || 0) + 1 }), {});
  assert.equal(Math.abs(counts["介入組"] - counts["對照組"]), 1);
  assert.deepEqual(assignRandomGroups(participants, ["一組"], "seed"), []);
});
