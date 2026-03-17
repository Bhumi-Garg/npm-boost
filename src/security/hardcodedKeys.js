import fg from "fast-glob";
import fs from "fs/promises";
import path from "path";
import { loadConfig } from "../utils/config.js";

const SECRET_PATTERNS = [
  /api[_-]?key\s*=\s*['"][A-Za-z0-9-_]{16,}['"]/i,
  /secret\s*=\s*['"][A-Za-z0-9-_]{16,}['"]/i,
  /token\s*=\s*['"][A-Za-z0-9-_]{16,}['"]/i,
  /password\s*=\s*['"][^'"]{6,}['"]/i,
];

export default async function hardcodedKeys() {
  try {
    const config = await loadConfig();

    const files = await fg(config.security.scanPatterns, {
      ignore: ["node_modules/**"],
      absolute: true,
    });

    const findings = [];

    for (const file of files) {
      const content = await fs.readFile(file, "utf8");

      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          findings.push(path.relative(process.cwd(), file));
          break;
        }
      }
    }

    return {
      label: "Hardcoded Secrets",
      status: findings.length ? "warn" : "ok",
      count: findings.length,
      data: findings,
      summary: findings.length
        ? `${findings.length} potential secret(s) found`
        : "No hardcoded secrets detected",
    };
  } catch (err) {
    return {
      label: "Hardcoded Secrets",
      status: "error",
      count: 0,
      data: [],
      summary: "Secret scan failed",
    };
  }
}