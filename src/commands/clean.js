import tempFiles from "../cleaners/tempFiles.js";
import emptyFolders from "../cleaners/emptyFolders.js";

import { logger } from "../utils/logger.js";
import { startSpinner, stopSpinner } from "../utils/spinner.js";

export default async function cleanCommand() {
  try {
    startSpinner("Cleaning project...");

    const results = [];

    const tempResult = await tempFiles();
    results.push(tempResult);

    const folderResult = await emptyFolders();
    results.push(folderResult);

    stopSpinner(true, "Clean complete");

    logger.title("Clean Results");

    for (const r of results) {
      logger.result(r);
    }

    return results;

  } catch (err) {
    stopSpinner(false, "Clean command failed");
    logger.error(err.message);
  }
}