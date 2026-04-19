import path from "node:path";
import fs from "fs-extra";
import pluralize from "pluralize";

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSafeReplacement(
  content: string,
  oldStr: string,
  newStr: string,
): string {
  const regex = new RegExp(escapeRegExp(oldStr), "ig");

  return content.replace(regex, (match: string) => {
    // Simple checks for casing
    const isAllUpperCase =
      match === match.toUpperCase() && match !== match.toLowerCase();
    const isFirstUpperCase =
      match[0] === match[0].toUpperCase() &&
      match[0] !== match[0].toLowerCase();

    if (isAllUpperCase) {
      return newStr.toUpperCase();
    } else if (isFirstUpperCase) {
      return newStr[0].toUpperCase() + newStr.slice(1);
    }
    return newStr.toLowerCase();
  });
}

/**
 * Recursively walks through a directory,
 * renames files and replaces content.
 */
async function walkAndReplace(
  dir: string,
  oldName: string,
  newName: string,
): Promise<void> {
  const oldNamePlural = pluralize(oldName);
  const newNamePlural = pluralize(newName);

  const files = await fs.readdir(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);

    const newFileBasePluralFirst = getSafeReplacement(
      file,
      oldNamePlural,
      newNamePlural,
    );
    const newFileBase = getSafeReplacement(
      newFileBasePluralFirst,
      oldName,
      newName,
    );

    const newFilePath = path.join(dir, newFileBase);

    if (newFilePath !== fullPath) {
      await fs.move(fullPath, newFilePath, { overwrite: true });
    }

    if (stat.isDirectory()) {
      await walkAndReplace(newFilePath, oldName, newName);
    } else {
      // ✅ Replace inside file
      await replaceInsideFile(newFilePath, oldName, newName);
    }
  }
}

async function replaceInsideFile(
  filePath: string,
  oldName: string,
  newName: string,
): Promise<void> {
  const allowedExts = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".css",
    ".scss",
    ".html",
  ];
  if (!allowedExts.includes(path.extname(filePath))) {
    return;
  }

  const content = await fs.readFile(filePath, "utf8");

  const oldNamePlural = pluralize(oldName);
  const newNamePlural = pluralize(newName);

  const newContentPluralFirst = getSafeReplacement(
    content,
    oldNamePlural,
    newNamePlural,
  );
  const newContent = getSafeReplacement(
    newContentPluralFirst,
    oldName,
    newName,
  );

  if (content !== newContent) {
    await fs.writeFile(filePath, newContent, "utf8");
  }
}

export async function main(argv: string[] = process.argv) {
  const [, , src, dest, oldName, newName, ...unexpected] = argv;

  if (!src || !dest || !oldName || !newName || unexpected.length > 0) {
    throw new Error(
      "Usage: npm run make:clone -- <src> <dest> <OldName> <NewName>",
    );
  }

  // thx https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#identifiers
  const isValidJsIdentifier = (name: string) =>
    /^[$_\p{ID_Start}][$\p{ID_Continue}]*$/u.test(name);

  if (!isValidJsIdentifier(oldName)) {
    throw new Error(`❌ ${oldName} is not a valid identifier in JavaScript`);
  }
  if (!isValidJsIdentifier(newName)) {
    throw new Error(`❌ ${newName} is not a valid identifier in JavaScript`);
  }

  const srcPath = path.resolve(src);
  const destPath = path.resolve(dest);

  if (!(await fs.pathExists(srcPath))) {
    throw new Error(`❌ Source path does not exist: ${srcPath}`);
  }

  const stat = await fs.stat(srcPath);

  if (stat.isFile()) {
    // ✅ Handle single file cloning
    await fs.copy(srcPath, destPath);

    await replaceInsideFile(destPath, oldName, newName);

    console.info(`✅ Cloned file ${srcPath} → ${destPath}`);
  } else if (stat.isDirectory()) {
    // ✅ Handle folder cloning
    await fs.copy(srcPath, destPath);
    await walkAndReplace(destPath, oldName, newName);
    console.info(`✅ Cloned folder ${srcPath} → ${destPath}`);
  } else {
    throw new Error("❌ Source is neither a file nor a directory.");
  }

  // Provide contextual feedback
  if (destPath.includes(path.normalize("src/express/modules"))) {
    console.info(
      `\n💡 Don't forget to import and use your new routes in src/express/routes.ts!`,
    );
  } else if (destPath.includes(path.normalize("src/react/components"))) {
    console.info(
      `\n💡 Don't forget to add your new routes in src/react/routes.tsx!`,
    );
  }
}

/* v8 ignore next 6 */
if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
