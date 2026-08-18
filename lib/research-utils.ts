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
