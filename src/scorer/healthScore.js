export function calculateScore(allResults) {
  const flat = allResults.flat().filter(Boolean);

  let score = 100;
  const breakdown = [];

  const deductions = {
    // scan
    'Unused Files':           { warn: 10, error: 15 },
    'Large Files':            { warn: 5,  error: 10 },
    'Duplicate Code':         { warn: 8,  error: 12 },
    'Unused Assets':          { warn: 3,  error: 6  },
    'Console Logs':           { warn: 5,  error: 8  },
    // deps — match exact labels from deps.js
    'Unused packages':        { warn: 8,  error: 12 },
    'Heavy packages':         { warn: 4,  error: 8  },
    'Lighter alternatives':   { warn: 2,  error: 4  },
    // clean — match exact labels from cleaners
    'Temporary Files':        { warn: 3,  error: 5  },
    'Empty Folders':          { warn: 2,  error: 3  },
    // security — match exact labels from security files
    '.env Files':             { warn: 15, error: 20 },
    'Hardcoded Secrets':      { warn: 15, error: 20 },
    'npm Vulnerabilities':    { warn: 10, error: 15 },
  };

  for (const result of flat) {
    if (!result?.label) continue;

    const rule = deductions[result.label];
    if (!rule) continue;

    if (result.status === 'warn') {
      score -= rule.warn;
      breakdown.push({ label: result.label, status: 'warn', summary: result.summary });
    } else if (result.status === 'error') {
      score -= rule.error;
      breakdown.push({ label: result.label, status: 'error', summary: result.summary });
    } else {
      breakdown.push({ label: result.label, status: 'ok', summary: result.summary });
    }
  }

  return {
    score: Math.max(0, score),
    breakdown,
  };
}