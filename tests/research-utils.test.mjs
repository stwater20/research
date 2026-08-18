import assert from "node:assert/strict";
import test from "node:test";
import { calculateTwoByTwo, describe, normalizeAcademicIdentifier, parseNumericData } from "../lib/research-utils.ts";

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
