import fs from "fs-extra";
import path from "path";
import { loadConfig } from "../utils/config.js";

async function isEmpty(dir) {
  const files = await fs.readdir(dir);
  return files.length === 0;
}

async function walk(dir, removed = []) {
  const entries = await fs.readdir(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      await walk(fullPath, removed);

      if (await isEmpty(fullPath)) {
        await fs.remove(fullPath);
        removed.push(path.relative(process.cwd(), fullPath));
      }
    }
  }

  return removed;
}

export default async function emptyFolders() {
  try {
    await loadConfig(); // keeps pattern consistent even if unused

    const removed = await walk(process.cwd());

    return {
      label: "Empty Folders",
      status: removed.length > 0 ? "warn" : "ok",
      count: removed.length,
      data: removed,
      summary:
        removed.length > 0
          ? `${removed.length} empty folders removed`
          : "No empty folders found",
    };
  } catch (error) {
    return {
      label: "Empty Folders",
      status: "error",
      count: 0,
      data: [],
      summary: "Failed to clean empty folders",
    };
  }
}