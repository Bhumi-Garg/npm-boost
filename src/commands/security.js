import envCommitted from "../security/envCommitted.js";
import hardcodedKeys from "../security/hardcodedKeys.js";
import auditWrapper from "../security/auditWrapper.js";

import { logger } from "../utils/logger.js";
import { startSpinner, stopSpinner } from "../utils/spinner.js";

export default async function securityCommand() {
  try {
    startSpinner("Running security checks...");

    const results = [];

    const envResult = await envCommitted();
    results.push(envResult);

    const secretResult = await hardcodedKeys();
    results.push(secretResult);

    const auditResult = await auditWrapper();
    results.push(auditResult);

    stopSpinner(true, "Security scan complete");

    logger.title("Security Results");

    for (const r of results) {
      logger.result(r);
    }

    return results;

  } catch (err) {
    stopSpinner(false, "Security scan failed");
    logger.error(err.message);
  }
}