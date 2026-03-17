import fg from "fast-glob";
import path from "path";
import { loadConfig } from "../utils/config.js";

export default async function envCommitted() {
  try {
    const config = await loadConfig();

    const files = await fg(["**/.env*", "!node_modules/**"], {
      dot: true,
      absolute: true,
    });

    const found = files.map((f) => path.relative(process.cwd(), f));

    return {
      label: ".env Files",
      status: found.length ? "warn" : "ok",
      count: found.length,
      data: found,
      summary: found.length
        ? `${found.length} .env file(s) detected`
        : "No committed .env files found",
    };
  } catch (err) {
    return {
      label: ".env Files",
      status: "error",
      count: 0,
      data: [],
      summary: "Failed to scan for .env files",
    };
  }
}