export type DescriptiveStats = {
  count: number;
  mean: number;
  median: number;
  sampleSd: number;
  min: number;
  q1: number;
  q3: number;
  max: number;
};

export function parseNumericData(value: string) {
  return value
    .trim()
    .split(/[\s,，;；\t]+/)
    .map(Number)
    .filter(Number.isFinite);
}

function median(values: number[]) {
  const middle = Math.floor(values.length / 2);
  return values.length % 2
    ? values[middle]
    : (values[middle - 1] + values[middle]) / 2;
}

export function describe(values: number[]): DescriptiveStats | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const sampleSd = sorted.length > 1
    ? Math.sqrt(sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (sorted.length - 1))
    : 0;
  const middle = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, middle);
  const upper = sorted.slice(sorted.length % 2 ? middle + 1 : middle);

  return {
    count: sorted.length,
    mean,
    median: median(sorted),
    sampleSd,
    min: sorted[0],
    q1: lower.length ? median(lower) : sorted[0],
    q3: upper.length ? median(upper) : sorted[sorted.length - 1],
    max: sorted[sorted.length - 1],
  };
}

export type TwoByTwoResult = {
  exposedRisk: number;
  controlRisk: number;
  riskRatio: number;
  riskRatioCi: [number, number];
  oddsRatio: number;
  oddsRatioCi: [number, number];
  riskDifference: number;
  nnt: number | null;
  usedCorrection: boolean;
};

export function calculateTwoByTwo(a: number, b: number, c: number, d: number): TwoByTwoResult | null {
  if (![a, b, c, d].every((value) => Number.isFinite(value) && value >= 0)) return null;
  if (a + b <= 0 || c + d <= 0) return null;

  const exposedRisk = a / (a + b);
  const controlRisk = c / (c + d);
  const riskDifference = exposedRisk - controlRisk;
  const usedCorrection = [a, b, c, d].some((value) => value === 0);
  const [aa, bb, cc, dd] = usedCorrection ? [a + 0.5, b + 0.5, c + 0.5, d + 0.5] : [a, b, c, d];
  const riskRatio = (aa / (aa + bb)) / (cc / (cc + dd));
  const oddsRatio = (aa * dd) / (bb * cc);
  const rrSe = Math.sqrt(1 / aa - 1 / (aa + bb) + 1 / cc - 1 / (cc + dd));
  const orSe = Math.sqrt(1 / aa + 1 / bb + 1 / cc + 1 / dd);

  return {
    exposedRisk,
    controlRisk,
    riskRatio,
    riskRatioCi: [Math.exp(Math.log(riskRatio) - 1.96 * rrSe), Math.exp(Math.log(riskRatio) + 1.96 * rrSe)],
    oddsRatio,
    oddsRatioCi: [Math.exp(Math.log(oddsRatio) - 1.96 * orSe), Math.exp(Math.log(oddsRatio) + 1.96 * orSe)],
    riskDifference,
    nnt: riskDifference === 0 ? null : 1 / Math.abs(riskDifference),
    usedCorrection,
  };
}

export type AcademicIdentifier = {
  type: "DOI" | "PMID" | "arXiv";
  value: string;
  url: string;
};

export function normalizeAcademicIdentifier(input: string): AcademicIdentifier | null {
  const value = input.trim();
  const doi = value.match(/10\.\d{4,9}\/[\w.()/:;-]+/i)?.[0].replace(/[.,;:)\]]+$/, "");
  if (doi) return { type: "DOI", value: doi, url: `https://doi.org/${doi}` };

  const pmid = value.match(/(?:pubmed\.ncbi\.nlm\.nih\.gov\/|pmid\s*:?\s*)(\d{5,9})/i)?.[1];
  if (pmid) return { type: "PMID", value: pmid, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` };

  const arxiv = value.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv\s*:?\s*)([a-z-]+\/\d{7}|\d{4}\.\d{4,5}(?:v\d+)?)/i)?.[1];
  if (arxiv) return { type: "arXiv", value: arxiv, url: `https://arxiv.org/abs/${arxiv}` };

  return null;
}

function criticalZ(confidence: 90 | 95 | 99) {
  return confidence === 90 ? 1.644854 : confidence === 99 ? 2.575829 : 1.959964;
}

export function meanConfidenceInterval(mean: number, sampleSd: number, sampleSize: number, confidence: 90 | 95 | 99 = 95) {
  if (![mean, sampleSd, sampleSize].every(Number.isFinite) || sampleSd < 0 || sampleSize < 2) return null;
  const df = sampleSize - 1;
  const z = criticalZ(confidence);
  const t = z
    + (z ** 3 + z) / (4 * df)
    + (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * df ** 2);
  const margin = t * sampleSd / Math.sqrt(sampleSize);
  return { lower: mean - margin, upper: mean + margin, margin, criticalValue: t };
}

export function proportionConfidenceInterval(successes: number, sampleSize: number, confidence: 90 | 95 | 99 = 95) {
  if (![successes, sampleSize].every(Number.isFinite) || sampleSize < 1 || successes < 0 || successes > sampleSize) return null;
  const z = criticalZ(confidence);
  const proportion = successes / sampleSize;
  const denominator = 1 + z ** 2 / sampleSize;
  const center = (proportion + z ** 2 / (2 * sampleSize)) / denominator;
  const margin = z * Math.sqrt(proportion * (1 - proportion) / sampleSize + z ** 2 / (4 * sampleSize ** 2)) / denominator;
  return { proportion, lower: Math.max(0, center - margin), upper: Math.min(1, center + margin), margin };
}

export function parseNumericMatrix(input: string) {
  const rows = input.trim().split(/\r?\n/).filter((row) => row.trim()).map((row) => row.trim().split(/[\t,，;； ]+/).map(Number));
  if (rows.length < 2 || rows.some((row) => row.length < 2 || row.some((value) => !Number.isFinite(value)))) return null;
  if (rows.some((row) => row.length !== rows[0].length)) return null;
  return rows;
}

function sampleVariance(values: number[]) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
}

export function cronbachAlpha(matrix: number[][]) {
  if (matrix.length < 2 || matrix[0]?.length < 2 || matrix.some((row) => row.length !== matrix[0].length)) return null;
  const itemCount = matrix[0].length;
  const itemVariances = Array.from({ length: itemCount }, (_, column) => sampleVariance(matrix.map((row) => row[column])));
  const totalVariance = sampleVariance(matrix.map((row) => row.reduce((sum, value) => sum + value, 0)));
  if (totalVariance === 0) return null;
  const alpha = itemCount / (itemCount - 1) * (1 - itemVariances.reduce((sum, value) => sum + value, 0) / totalVariance);
  return { alpha, respondents: matrix.length, items: itemCount };
}

function hashSeed(seed: string) {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ mixed >>> 15, mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ mixed >>> 7, mixed | 61);
    return ((mixed ^ mixed >>> 14) >>> 0) / 4294967296;
  };
}

export type RandomAssignment = { participant: string; group: string; order: number };

export function assignRandomGroups(participants: string[], groupNames: string[], seed: string): RandomAssignment[] {
  const cleanParticipants = [...new Set(participants.map((value) => value.trim()).filter(Boolean))];
  const cleanGroups = [...new Set(groupNames.map((value) => value.trim()).filter(Boolean))];
  if (!cleanParticipants.length || cleanGroups.length < 2 || !seed.trim()) return [];
  const random = seededRandom(hashSeed(seed));
  const shuffled = cleanParticipants.map((participant) => ({ participant, sort: random() })).sort((a, b) => a.sort - b.sort);
  return shuffled.map(({ participant }, index) => ({ participant, group: cleanGroups[index % cleanGroups.length], order: index + 1 }));
}
