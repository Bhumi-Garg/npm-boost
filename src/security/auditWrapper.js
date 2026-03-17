import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export default async function auditWrapper() {
  try {
    const { stdout } = await execAsync("npm audit --json");

    const audit = JSON.parse(stdout);

    const vulnerabilities =
      audit.metadata?.vulnerabilities?.total || 0;

    return {
      label: "npm Vulnerabilities",
      status: vulnerabilities ? "warn" : "ok",
      count: vulnerabilities,
      data: [],
      summary: vulnerabilities
        ? `${vulnerabilities} vulnerabilities found`
        : "No vulnerabilities found",
    };
  } catch (err) {
    return {
      label: "npm Vulnerabilities",
      status: "error",
      count: 0,
      data: [],
      summary: "npm audit failed",
    };
  }
}