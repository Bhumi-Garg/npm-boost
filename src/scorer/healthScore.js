import { checkUnusedPackages } from '../deps/unusedPackages.js';
import { checkHeavyPackages } from '../deps/heavyPackages.js';
import { checkLighterAlternatives } from '../deps/lighterAlternatives.js';
import envCommitted from '../security/envCommitted.js';
import hardcodedKeys from '../security/hardcodedKeys.js';
import auditWrapper from '../security/auditWrapper.js';
import tempFiles from '../cleaners/tempFiles.js';
import emptyFolders from '../cleaners/emptyFolders.js';

// ─── Scoring config ───────────────────────────────────────────────────────────
//
// Each check has:
//   maxPts     — full marks if zero issues
//   deductPer  — points deducted per issue found
//   errorPts   — score assigned if the check itself errors out
//
// Security is weighted heaviest — a single committed .env wipes its check.
// Clean is lightest — cosmetic, not critical.
//
const CHECKS = {
  // Deps — 30 pts total
  unused:        { maxPts: 10, deductPer: 2, errorPts: 5 },
  heavy:         { maxPts: 10, deductPer: 2, errorPts: 5 },
  alternatives:  { maxPts: 10, deductPer: 1, errorPts: 5 },

  // Security — 50 pts total
  envCommitted:  { maxPts: 20, deductPer: 20, errorPts: 0 },
  hardcodedKeys: { maxPts: 20, deductPer: 5,  errorPts: 0 },
  auditVulns:    { maxPts: 10, deductPer: 2,  errorPts: 5 },

  // Clean — 20 pts total
  tempFiles:     { maxPts: 10, deductPer: 1, errorPts: 5 },
  emptyFolders:  { maxPts: 10, deductPer: 1, errorPts: 5 },
};

const CATEGORIES = {
  security: { label: 'Security',     keys: ['envCommitted', 'hardcodedKeys', 'auditVulns'], maxPts: 50 },
  deps:     { label: 'Dependencies', keys: ['unused', 'heavy', 'alternatives'],             maxPts: 30 },
  clean:    { label: 'Cleanliness',  keys: ['tempFiles', 'emptyFolders'],                   maxPts: 20 },
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
  // Run all checks in parallel
  const [
    unused, heavy, alternatives,
    envResult, keysResult, auditResult,
    tempResult, foldersResult,
  ] = await Promise.all([
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
    unused,
    heavy,
    alternatives,
    envCommitted:  envResult,
    hardcodedKeys: keysResult,
    auditVulns:    auditResult,
    tempFiles:     tempResult,
    emptyFolders:  foldersResult,
  };

  // Score each individual check
  const checkScores = {};
  for (const [key, check] of Object.entries(CHECKS)) {
    checkScores[key] = {
      pts:    scoreCheck(allResults[key], check),
      maxPts: check.maxPts,
      result: allResults[key],
    };
  }

  // Roll up into categories
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
    grade: letterGrade(score),
    categories: categoryScores,
    checks: checkScores,
    results: allResults,
  };
}