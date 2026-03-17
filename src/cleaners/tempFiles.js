import fg from "fast-glob";
import fs from "fs-extra";
import path from "path";
import { loadConfig } from "../utils/config.js";

export default async function tempFiles() {
  try {
    const config = await loadConfig();
    const patterns = config.clean?.tempPatterns || [];

    const files = await fg(patterns, {
      dot: true,
      absolute: true,
    });

    let removed = [];

    for (const file of files) {
      try {
        await fs.remove(file);
        removed.push(path.relative(process.cwd(), file));
      } catch (err) {
        // skip but continue
      }
    }

    return {
      label: "Temporary Files",
      status: removed.length > 0 ? "warn" : "ok",
      count: removed.length,
      data: removed,
      summary:
        removed.length > 0
          ? `${removed.length} temporary files removed`
          : "No temporary files found",
    };
  } catch (error) {
    return {
      label: "Temporary Files",
      status: "error",
      count: 0,
      data: [],
      summary: "Failed to clean temporary files",
    };
  }
}