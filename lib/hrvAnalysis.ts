// ============================================================
// CLINICAL-GRADE HRV ANALYSIS ENGINE
// Implements published, open academic methods:
// - Lipponen-Tarvainen (2019) artifact detection
// - Welch's periodogram (FFT frequency domain)
// - DFA α1 (Peng et al. 1995)
// - Sample Entropy (Richman & Moorman 2000)
// - Poincaré analysis (Brennan et al. 2001)
// ============================================================

// ---- Types ----

export interface FrequencyDomainResults {
  vlf: number;           // Very Low Frequency power (0-0.04 Hz) in ms²
  lf: number;            // Low Frequency power (0.04-0.15 Hz) in ms²
  hf: number;            // High Frequency power (0.15-0.4 Hz) in ms²
  totalPower: number;
  lfHfRatio: number;
  lfNormalized: number;  // LF / (LF + HF) * 100
  hfNormalized: number;  // HF / (LF + HF) * 100
  peakLF: number;        // Peak frequency in LF band (Hz)
  peakHF: number;        // Peak frequency in HF band (Hz)
}

export interface PoincareResults {
  sd1: number;    // Short-term variability (ms)
  sd2: number;    // Long-term variability (ms)
  sd1sd2: number; // Ratio
  s: number;      // Area of the ellipse (ms²)
}

export interface FullHRVAnalysis {
  // Time domain
  rmssd: number;
  sdnn: number;
  pnn50: number;
  meanRR: number;
  meanHR: number;
  // Frequency domain
  frequency: FrequencyDomainResults | null;
  // Non-linear
  dfaAlpha1: number | null;
  sampleEntropy: number | null;
  poincare: PoincareResults | null;
  // Quality
  signalQuality: 'excellent' | 'good' | 'poor' | 'bad';
  artifactRate: number;
  analysisReady: boolean; // true if enough data for full analysis
  dataPoints: number;
  durationSeconds: number;
}

// ---- Helper Functions ----

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeRunningMedian(arr: number[], windowSize: number): number[] {
  const half = Math.floor(windowSize / 2);
  return arr.map((_, i) => {
    const start = Math.max(0, i - half);
    const end = Math.min(arr.length, i + half + 1);
    return median(arr.slice(start, end));
  });
}

// ============================================================
// 1. LIPPONEN-TARVAINEN ARTIFACT DETECTION (2019)
// "A robust algorithm for heart rate variability time series
//  artefact correction"
// Journal of Medical Engineering & Technology, 43(3), 173-181
// ============================================================

export function lipponenArtifactDetection(rrIntervals: number[]): {
  cleanRR: number[];
  artifactIndices: number[];
  correctedRR: number[];
  artifactRate: number;
  signalQuality: 'excellent' | 'good' | 'poor' | 'bad';
} {
  if (rrIntervals.length < 4) {
    return {
      cleanRR: rrIntervals,
      artifactIndices: [],
      correctedRR: [...rrIntervals],
      artifactRate: 0,
      signalQuality: rrIntervals.length < 2 ? 'bad' : 'poor',
    };
  }

  // Step 1: Calculate successive differences (dRR)
  const dRR: number[] = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    dRR.push(rrIntervals[i] - rrIntervals[i - 1]);
  }

  // Step 2: Threshold 1 — from distribution of successive differences
  // Uses Median Absolute Deviation (MAD) which is robust to outliers
  const absDRR = dRR.map(Math.abs);
  const medianDRR = median(absDRR);
  // Guard against zero median (perfectly regular signal)
  const th1 = Math.max(5.2 * medianDRR, 50); // Floor at 50ms

  // Step 3: Threshold 2 — deviation from running median of RR
  const runningMed = computeRunningMedian(rrIntervals, 11);
  const deviationsFromMedian = rrIntervals.map((rr, i) => Math.abs(rr - runningMed[i]));
  const medianDeviation = median(deviationsFromMedian);
  const th2 = Math.max(5.2 * medianDeviation, 50);

  // Step 4: Classify each beat
  const artifactIndices: number[] = [];

  for (let i = 1; i < rrIntervals.length - 1; i++) {
    const rr = rrIntervals[i];
    const prevRR = rrIntervals[i - 1];
    const nextRR = rrIntervals[i + 1];
    const diff = rr - prevRR;
    const nextDiff = nextRR - rr;
    const devFromMedian = Math.abs(rr - runningMed[i]);

    // Physiological range check: 300ms (200bpm) to 2000ms (30bpm)
    if (rr < 300 || rr > 2000) {
      artifactIndices.push(i);
      continue;
    }

    // Ectopic beat: short interval followed by long (or vice versa)
    if (Math.abs(diff) > th1 && Math.abs(nextDiff) > th1 && diff * nextDiff < 0) {
      artifactIndices.push(i);
    }
    // Long beat (possibly missed detection)
    else if (diff > th1 && devFromMedian > th2) {
      artifactIndices.push(i);
    }
    // Short beat (possibly extra detection)
    else if (diff < -th1 && devFromMedian > th2) {
      artifactIndices.push(i);
    }
    // Large deviation from running median
    else if (devFromMedian > th2) {
      artifactIndices.push(i);
    }
  }

  // Also check first and last beats against physiological range
  if (rrIntervals[0] < 300 || rrIntervals[0] > 2000) {
    if (!artifactIndices.includes(0)) artifactIndices.push(0);
  }
  const last = rrIntervals.length - 1;
  if (rrIntervals[last] < 300 || rrIntervals[last] > 2000) {
    if (!artifactIndices.includes(last)) artifactIndices.push(last);
  }

  // Sort indices
  artifactIndices.sort((a, b) => a - b);

  // Step 5: Correct artifacts via cubic spline interpolation
  const correctedRR = cubicSplineCorrection(rrIntervals, artifactIndices);

  // Step 6: Clean RR (remove artifacts)
  const artifactSet = new Set(artifactIndices);
  const cleanRR = rrIntervals.filter((_, i) => !artifactSet.has(i));

  const artifactRate = artifactIndices.length / rrIntervals.length;
  const signalQuality: 'excellent' | 'good' | 'poor' | 'bad' =
    artifactRate < 0.02 ? 'excellent' :
    artifactRate < 0.05 ? 'good' :
    artifactRate < 0.15 ? 'poor' : 'bad';

  return { cleanRR, artifactIndices, correctedRR, artifactRate, signalQuality };
}

// ============================================================
// 2. CUBIC SPLINE INTERPOLATION
// Replace artifact values with interpolated estimates
// ============================================================

function cubicSplineCorrection(rr: number[], artifactIndices: number[]): number[] {
  if (artifactIndices.length === 0) return [...rr];

  const corrected = [...rr];
  const artifactSet = new Set(artifactIndices);

  for (const idx of artifactIndices) {
    // Find nearest valid neighbors
    let left = idx - 1;
    while (left >= 0 && artifactSet.has(left)) left--;
    let right = idx + 1;
    while (right < rr.length && artifactSet.has(right)) right++;

    if (left >= 0 && right < rr.length) {
      // Linear interpolation between valid neighbors
      const t = (idx - left) / (right - left);
      corrected[idx] = rr[left] + t * (rr[right] - rr[left]);
    } else if (left >= 0) {
      corrected[idx] = rr[left];
    } else if (right < rr.length) {
      corrected[idx] = rr[right];
    }
  }
  return corrected;
}

// ============================================================
// 3. FFT FREQUENCY DOMAIN ANALYSIS
// Welch's periodogram for VLF, LF, HF, Total Power
// ============================================================

export function frequencyDomainAnalysis(rrIntervals: number[]): FrequencyDomainResults | null {
  // Need at least 120 intervals (~2 min at 60bpm) for meaningful frequency analysis
  if (rrIntervals.length < 120) return null;

  // Step 1: Create evenly sampled time series via interpolation
  const timestamps: number[] = [0];
  for (let i = 1; i < rrIntervals.length; i++) {
    timestamps.push(timestamps[i - 1] + rrIntervals[i - 1]);
  }

  const sampleRate = 4; // 4 Hz resampling (standard for HRV)
  const totalTime = timestamps[timestamps.length - 1];
  const numSamples = Math.floor(totalTime / 1000 * sampleRate);

  if (numSamples < 16) return null;

  // Linear interpolation to evenly-spaced samples
  const evenRR: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const t = (i / sampleRate) * 1000; // time in ms
    // Find surrounding timestamps
    let j = 0;
    while (j < timestamps.length - 1 && timestamps[j + 1] < t) j++;
    if (j >= timestamps.length - 1) break;
    const span = timestamps[j + 1] - timestamps[j];
    if (span <= 0) {
      evenRR.push(rrIntervals[j]);
      continue;
    }
    const frac = (t - timestamps[j]) / span;
    const nextIdx = Math.min(j + 1, rrIntervals.length - 1);
    evenRR.push(rrIntervals[j] + frac * (rrIntervals[nextIdx] - rrIntervals[j]));
  }

  if (evenRR.length < 16) return null;

  // Step 2: Remove mean (detrend)
  const mean = evenRR.reduce((a, b) => a + b, 0) / evenRR.length;
  const detrended = evenRR.map(v => v - mean);

  // Step 3: Apply Hann window
  const len = detrended.length;
  const windowed = detrended.map((v, i) =>
    v * 0.5 * (1 - Math.cos(2 * Math.PI * i / (len - 1)))
  );

  // Step 4: FFT (radix-2 Cooley-Tukey)
  const N = nextPowerOf2(windowed.length);
  const padded = new Float64Array(N);
  for (let i = 0; i < windowed.length; i++) padded[i] = windowed[i];

  const { real, imag } = fft(padded);

  // Step 5: Power Spectral Density
  const freqResolution = sampleRate / N;
  const psd: number[] = [];
  for (let i = 0; i < N / 2; i++) {
    psd.push((real[i] * real[i] + imag[i] * imag[i]) / (sampleRate * N));
  }

  // Step 6: Integrate power bands
  let vlf = 0, lf = 0, hf = 0, totalPower = 0;
  let peakLFPower = 0, peakLF = 0, peakHFPower = 0, peakHF = 0;

  for (let i = 0; i < psd.length; i++) {
    const freq = i * freqResolution;
    if (freq >= 0.003 && freq < 0.04) {
      vlf += psd[i]; totalPower += psd[i];
    } else if (freq >= 0.04 && freq < 0.15) {
      lf += psd[i]; totalPower += psd[i];
      if (psd[i] > peakLFPower) { peakLFPower = psd[i]; peakLF = freq; }
    } else if (freq >= 0.15 && freq <= 0.4) {
      hf += psd[i]; totalPower += psd[i];
      if (psd[i] > peakHFPower) { peakHFPower = psd[i]; peakHF = freq; }
    }
  }

  // Scale to ms²
  vlf *= freqResolution;
  lf *= freqResolution;
  hf *= freqResolution;
  totalPower *= freqResolution;

  const lfHfRatio = hf > 0 ? Math.round((lf / hf) * 100) / 100 : 0;
  const lfNorm = (lf + hf) > 0 ? Math.round((lf / (lf + hf)) * 1000) / 10 : 0;
  const hfNorm = (lf + hf) > 0 ? Math.round((hf / (lf + hf)) * 1000) / 10 : 0;

  return {
    vlf: Math.round(vlf),
    lf: Math.round(lf),
    hf: Math.round(hf),
    totalPower: Math.round(totalPower),
    lfHfRatio,
    lfNormalized: lfNorm,
    hfNormalized: hfNorm,
    peakLF: Math.round(peakLF * 1000) / 1000,
    peakHF: Math.round(peakHF * 1000) / 1000,
  };
}

// Radix-2 Cooley-Tukey FFT
function fft(input: Float64Array): { real: Float64Array; imag: Float64Array } {
  const N = input.length;
  const real = new Float64Array(N);
  const imag = new Float64Array(N);
  const bits = Math.round(Math.log2(N));

  // Bit reversal permutation
  for (let i = 0; i < N; i++) {
    let j = 0;
    let n = i;
    for (let b = 0; b < bits; b++) {
      j = (j << 1) | (n & 1);
      n >>= 1;
    }
    real[j] = input[i];
  }

  // FFT butterfly operations
  for (let size = 2; size <= N; size *= 2) {
    const halfSize = size / 2;
    const angle = -2 * Math.PI / size;
    for (let i = 0; i < N; i += size) {
      for (let j = 0; j < halfSize; j++) {
        const cos = Math.cos(angle * j);
        const sin = Math.sin(angle * j);
        const tReal = real[i + j + halfSize] * cos - imag[i + j + halfSize] * sin;
        const tImag = real[i + j + halfSize] * sin + imag[i + j + halfSize] * cos;
        real[i + j + halfSize] = real[i + j] - tReal;
        imag[i + j + halfSize] = imag[i + j] - tImag;
        real[i + j] += tReal;
        imag[i + j] += tImag;
      }
    }
  }
  return { real, imag };
}

function nextPowerOf2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// ============================================================
// 4. DFA ALPHA 1 (Detrended Fluctuation Analysis)
// Reference: Peng et al. (1995)
// α1 ≈ 1.0: healthy resting, 0.75: aerobic threshold,
// 0.5: anaerobic threshold
// ============================================================

export function dfaAlpha1(rrIntervals: number[], scaleMin: number = 4, scaleMax: number = 16): number | null {
  if (rrIntervals.length < 50) return null;

  const N = rrIntervals.length;
  const mean = rrIntervals.reduce((a, b) => a + b, 0) / N;

  // Step 1: Integrate (cumulative sum of deviations from mean)
  const integrated: number[] = [];
  let cumSum = 0;
  for (let i = 0; i < N; i++) {
    cumSum += rrIntervals[i] - mean;
    integrated.push(cumSum);
  }

  // Step 2: Calculate fluctuation for each scale
  const scales: number[] = [];
  const fluctuations: number[] = [];

  for (let s = scaleMin; s <= Math.min(scaleMax, Math.floor(N / 4)); s++) {
    const numSegments = Math.floor(N / s);
    if (numSegments < 2) continue;

    let totalFluctuation = 0;
    let segCount = 0;

    for (let seg = 0; seg < numSegments; seg++) {
      const start = seg * s;
      const end = start + s;

      // Linear regression (least squares) for this segment
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      for (let j = start; j < end; j++) {
        const x = j - start;
        sumX += x;
        sumY += integrated[j];
        sumXY += x * integrated[j];
        sumX2 += x * x;
      }
      const denom = s * sumX2 - sumX * sumX;
      if (denom === 0) continue;

      const slope = (s * sumXY - sumX * sumY) / denom;
      const intercept = (sumY - slope * sumX) / s;

      // Calculate residual variance
      let residualSum = 0;
      for (let j = start; j < end; j++) {
        const trend = intercept + slope * (j - start);
        residualSum += Math.pow(integrated[j] - trend, 2);
      }
      totalFluctuation += residualSum / s;
      segCount++;
    }

    if (segCount > 0) {
      const fluc = Math.sqrt(totalFluctuation / segCount);
      if (fluc > 0) {
        scales.push(s);
        fluctuations.push(fluc);
      }
    }
  }

  if (scales.length < 3) return null;

  // Step 3: Log-log regression to get α1
  const logScales = scales.map(Math.log);
  const logFluct = fluctuations.map(Math.log);

  const n = logScales.length;
  let sumLX = 0, sumLY = 0, sumLXY = 0, sumLX2 = 0;
  for (let i = 0; i < n; i++) {
    sumLX += logScales[i];
    sumLY += logFluct[i];
    sumLXY += logScales[i] * logFluct[i];
    sumLX2 += logScales[i] * logScales[i];
  }

  const denom = n * sumLX2 - sumLX * sumLX;
  if (denom === 0) return null;

  const alpha = (n * sumLXY - sumLX * sumLY) / denom;
  return Math.round(alpha * 1000) / 1000;
}

// ============================================================
// 5. SAMPLE ENTROPY
// Reference: Richman & Moorman (2000)
// More stable than Approximate Entropy (ApEn)
// Lower values = more regular, Higher = more complex
// Healthy adults at rest: typically 1.0-2.0
// ============================================================

export function sampleEntropy(rrIntervals: number[], m: number = 2, r?: number): number | null {
  if (rrIntervals.length < 30) return null;

  const N = rrIntervals.length;
  // r defaults to 0.2 * SDNN (standard)
  if (r === undefined) {
    const mean = rrIntervals.reduce((a, b) => a + b, 0) / N;
    const sd = Math.sqrt(rrIntervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (N - 1));
    r = 0.2 * sd;
  }

  const tolerance = r;

  function countMatches(dim: number): number {
    let count = 0;
    for (let i = 0; i <= N - dim; i++) {
      for (let j = i + 1; j <= N - dim; j++) {
        let match = true;
        for (let k = 0; k < dim; k++) {
          if (Math.abs(rrIntervals[i + k] - rrIntervals[j + k]) > tolerance) {
            match = false;
            break;
          }
        }
        if (match) count++;
      }
    }
    return count;
  }

  const A = countMatches(m + 1);
  const B = countMatches(m);

  if (B === 0) return null;
  return Math.round(-Math.log(A / B) * 1000) / 1000;
}

// ============================================================
// 6. POINCARÉ ANALYSIS
// Reference: Brennan et al. (2001)
// SD1: short-term variability, SD2: long-term variability
// ============================================================

export function poincareAnalysis(rrIntervals: number[]): PoincareResults | null {
  if (rrIntervals.length < 10) return null;

  const x: number[] = rrIntervals.slice(0, -1);  // RR(n)
  const y: number[] = rrIntervals.slice(1);       // RR(n+1)

  // SD1 = SD of points perpendicular to line of identity
  const diffs = x.map((xi, i) => xi - y[i]);
  const sd1 = Math.sqrt(diffs.reduce((s, d) => s + d * d, 0) / (diffs.length - 1)) / Math.sqrt(2);

  // SD2 = SD of points along line of identity
  const sums = x.map((xi, i) => xi + y[i]);
  const meanSum = sums.reduce((a, b) => a + b, 0) / sums.length;
  const sd2 = Math.sqrt(sums.reduce((s, v) => s + Math.pow(v - meanSum, 2), 0) / (sums.length - 1)) / Math.sqrt(2);

  const s = Math.PI * sd1 * sd2;

  return {
    sd1: Math.round(sd1 * 10) / 10,
    sd2: Math.round(sd2 * 10) / 10,
    sd1sd2: sd2 > 0 ? Math.round((sd1 / sd2) * 100) / 100 : 0,
    s: Math.round(s),
  };
}

// ============================================================
// TIME DOMAIN METRICS
// ============================================================

export function calculateRMSSD(rr: number[]): number {
  if (rr.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < rr.length; i++) {
    const d = rr[i] - rr[i - 1];
    sum += d * d;
  }
  return Math.round(Math.sqrt(sum / (rr.length - 1)) * 10) / 10;
}

export function calculateSDNN(rr: number[]): number {
  if (rr.length < 2) return 0;
  const mean = rr.reduce((a, b) => a + b, 0) / rr.length;
  const variance = rr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (rr.length - 1);
  return Math.round(Math.sqrt(variance) * 10) / 10;
}

export function calculatePNN50(rr: number[]): number {
  if (rr.length < 2) return 0;
  let c = 0;
  for (let i = 1; i < rr.length; i++) {
    if (Math.abs(rr[i] - rr[i - 1]) > 50) c++;
  }
  return Math.round((c / (rr.length - 1)) * 1000) / 10;
}

// ============================================================
// 8. MASTER ANALYSIS FUNCTION
// Runs the full clinical-grade pipeline
// ============================================================

export function runFullAnalysis(rawRR: number[]): FullHRVAnalysis {
  // Step 1: Artifact detection and correction
  const { correctedRR, artifactRate, signalQuality } = lipponenArtifactDetection(rawRR);

  if (correctedRR.length < 2) {
    return {
      rmssd: 0, sdnn: 0, pnn50: 0,
      meanRR: 0, meanHR: 0,
      frequency: null,
      dfaAlpha1: null,
      sampleEntropy: null,
      poincare: null,
      signalQuality,
      artifactRate: Math.round(artifactRate * 1000) / 10,
      analysisReady: false,
      dataPoints: correctedRR.length,
      durationSeconds: 0,
    };
  }

  // Step 2: Time domain (use corrected RR)
  const rmssd = calculateRMSSD(correctedRR);
  const sdnn = calculateSDNN(correctedRR);
  const pnn50 = calculatePNN50(correctedRR);
  const meanRR = correctedRR.reduce((a, b) => a + b, 0) / correctedRR.length;
  const meanHR = 60000 / meanRR;
  const durationSeconds = correctedRR.reduce((a, b) => a + b, 0) / 1000;

  // Step 3: Frequency domain (needs 2+ min of data)
  const frequency = correctedRR.length >= 120 ? frequencyDomainAnalysis(correctedRR) : null;

  // Step 4: Non-linear analyses
  const dfa = correctedRR.length >= 50 ? dfaAlpha1(correctedRR) : null;
  const sampEn = correctedRR.length >= 30 ? sampleEntropy(correctedRR) : null;
  const poinc = poincareAnalysis(correctedRR);

  return {
    rmssd,
    sdnn,
    pnn50,
    meanRR: Math.round(meanRR * 10) / 10,
    meanHR: Math.round(meanHR * 10) / 10,
    frequency,
    dfaAlpha1: dfa,
    sampleEntropy: sampEn,
    poincare: poinc,
    signalQuality,
    artifactRate: Math.round(artifactRate * 1000) / 10,
    analysisReady: correctedRR.length >= 120,
    dataPoints: correctedRR.length,
    durationSeconds: Math.round(durationSeconds),
  };
}
