import { readFileSync } from "fs";
import { colorLog } from "./logger.mjs";

const COMMIT_MESSAGE_PATH = process.argv[2];

if (!COMMIT_MESSAGE_PATH) {
  console.error("❌ No commit message path provided.");
  console.error("Run manually with: node scripts/checkCommitMessage.mjs .git/COMMIT_EDITMSG");
  process.exit(1);
}


const commitRegexp =
  /^(\[(MP-\d+|MP)\]) (Add|Change|Fix|Improve|Remove|Rename|Update|Upgrade) .+/;

const checkCommitMessage = (commitMessagePath) => {
  try {
    const commitMessage = readFileSync(commitMessagePath).toString("utf8");
    const isValidMessage = commitRegexp.test(commitMessage);

    if (!isValidMessage) {
      const messageFormat = commitRegexp.toString();
      colorLog(
        `Commit message must follow the format: ${messageFormat}`,
        "red"
      );
      process.exit(1);
    }
  } catch (error) {
    colorLog(
      `Error while check commit message ${COMMIT_MESSAGE_PATH}: ${error}`,
      "red"
    );
  }
};

checkCommitMessage(COMMIT_MESSAGE_PATH);
