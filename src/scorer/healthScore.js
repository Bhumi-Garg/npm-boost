import { checkUnusedPackages } from '../deps/unusedPackages.js';
import { checkHeavyPackages } from '../deps/heavyPackages.js';
import { checkLighterAlternatives } from '../deps/lighterAlternatives.js';
import envCommitted from '../security/envCommitted.js';
import hardcodedKeys from '../security/hardcodedKeys.js';
import auditWrapper from '../security/auditWrapper.js';
import tempFiles from '../cleaners/tempFiles.js';
import emptyFolders from '../cleaners/emptyFolders.js';
import { scanUnusedFiles } from '../scanners/unusedFiles.js';
import { scanLargeFiles } from '../scanners/largeFiles.js';
import { scanDuplicateCode } from '../scanners/duplicateCode.js';
import { scanUnusedAssets } from '../scanners/unusedAssets.js';
import { scanConsoleLogs } from '../scanners/consoleLogs.js';

// ─── Scoring config ───────────────────────────────────────────────────────────
//
// Each check has:
//   maxPts     — full marks if zero issues
//   deductPer  — points deducted per issue found
//   errorPts   — score assigned if the check itself errors out
//
// Security is weighted heaviest — a single committed .env wipes its check.
// Scan is second — code quality matters.
// Deps is third — dependency hygiene.
// Clean is lightest — cosmetic, not critical.
//
const CHECKS = {
  // Scan — 40 pts total
  unusedFiles:   { maxPts: 10, deductPer: 2, errorPts: 5 },
  largeFiles:    { maxPts: 8,  deductPer: 2, errorPts: 4 },
  duplicateCode: { maxPts: 10, deductPer: 3, errorPts: 5 },
  unusedAssets:  { maxPts: 6,  deductPer: 1, errorPts: 3 },
  consoleLogs:   { maxPts: 6,  deductPer: 1, errorPts: 3 },

  // Deps — 20 pts total
  unused:        { maxPts: 8,  deductPer: 2, errorPts: 4 },
  heavy:         { maxPts: 6,  deductPer: 2, errorPts: 3 },
  alternatives:  { maxPts: 6,  deductPer: 1, errorPts: 3 },

  // Security — 30 pts total
  envCommitted:  { maxPts: 12, deductPer: 12, errorPts: 0 },
  hardcodedKeys: { maxPts: 12, deductPer: 4,  errorPts: 0 },
  auditVulns:    { maxPts: 6,  deductPer: 2,  errorPts: 3 },

  // Clean — 10 pts total
  tempFiles:     { maxPts: 5,  deductPer: 1, errorPts: 2 },
  emptyFolders:  { maxPts: 5,  deductPer: 1, errorPts: 2 },
};

const CATEGORIES = {
  scan:     { label: 'Code Quality',  keys: ['unusedFiles', 'largeFiles', 'duplicateCode', 'unusedAssets', 'consoleLogs'], maxPts: 40 },
  security: { label: 'Security',      keys: ['envCommitted', 'hardcodedKeys', 'auditVulns'],                               maxPts: 30 },
  deps:     { label: 'Dependencies',  keys: ['unused', 'heavy', 'alternatives'],                                           maxPts: 20 },
  clean:    { label: 'Cleanliness',   keys: ['tempFiles', 'emptyFolders'],                                                 maxPts: 10 },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreCheck(result, check) {
  if (result.status === 'error') return check.errorPts;
  const deducted = result.count * check.deductPer;
  return Math.max(0, check.maxPts - deducted);
}

function letterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function computeHealthScore() {
  // run all checks in parallel
  const [
    unusedFilesResult, largeFilesResult, duplicateCodeResult,
    unusedAssetsResult, consoleLogsResult,
    unused, heavy, alternatives,
    envResult, keysResult, auditResult,
    tempResult, foldersResult,
  ] = await Promise.all([
    scanUnusedFiles(),
    scanLargeFiles(),
    scanDuplicateCode(),
    scanUnusedAssets(),
    scanConsoleLogs(),
    checkUnusedPackages(),
    checkHeavyPackages(),
    checkLighterAlternatives(),
    envCommitted(),
    hardcodedKeys(),
    auditWrapper(),
    tempFiles(),
    emptyFolders(),
  ]);

  const allResults = {
    // scan
    unusedFiles:   unusedFilesResult,
    largeFiles:    largeFilesResult,
    duplicateCode: duplicateCodeResult,
    unusedAssets:  unusedAssetsResult,
    consoleLogs:   consoleLogsResult,
    // deps
    unused,
    heavy,
    alternatives,
    // security
    envCommitted:  envResult,
    hardcodedKeys: keysResult,
    auditVulns:    auditResult,
    // clean
    tempFiles:     tempResult,
    emptyFolders:  foldersResult,
  };

  // score each individual check
  const checkScores = {};
  for (const [key, check] of Object.entries(CHECKS)) {
    checkScores[key] = {
      pts:    scoreCheck(allResults[key], check),
      maxPts: check.maxPts,
      result: allResults[key],
    };
  }

  // roll up into categories
  const categoryScores = {};
  for (const [catKey, cat] of Object.entries(CATEGORIES)) {
    const earned = cat.keys.reduce((sum, k) => sum + checkScores[k].pts, 0);
    categoryScores[catKey] = {
      label:  cat.label,
      earned,
      maxPts: cat.maxPts,
      pct:    Math.round((earned / cat.maxPts) * 100),
    };
  }

  const totalEarned = Object.values(categoryScores).reduce((s, c) => s + c.earned, 0);
  const totalMax    = Object.values(categoryScores).reduce((s, c) => s + c.maxPts, 0);
  const score       = Math.round((totalEarned / totalMax) * 100);

  return {
    score,
    grade:      letterGrade(score),
    categories: categoryScores,
    checks:     checkScores,
    results:    allResults,
  };
}