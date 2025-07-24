import { parseArgs } from "jsr:@std/cli@1/parse-args";
import { hashFiles, hashFilesSync } from "./lib/hash.ts";

/**
 * Interface representing parsed command line arguments
 * @interface ParsedArgs
 * @property {string[]} [files] - Array of file patterns to hash
 * @property {string} [algorithm] - Hash algorithm to use
 * @property {boolean} [noGlob] - Whether to disable glob pattern matching
 * @property {number} [batchCount] - Maximum files to process at once
 * @property {boolean} [sync] - Whether to use synchronous processing
 * @property {boolean} [help] - Whether to show help message
 * @property {string[]} _ - Positional arguments
 */
interface ParsedArgs {
  files?: string[];
  algorithm?: string;
  noGlob?: boolean;
  batchCount?: number;
  sync?: boolean;
  help?: boolean;
  _: string[];
}

/**
 * Display help information for the CLI tool
 * @returns {void}
 */
function showHelp() {
  console.log(`
Hash Files - Generate hash of multiple files

Usage: deno run --allow-read main.ts [options] [files...]

Options:
  -f, --files <files...>     Files to hash (default: ./**)
  -a, --algorithm <algo>     Hash algorithm (default: sha-1)
                            Available: sha-1, sha-256, sha-384, sha-512
  -n, --noGlob              Treat file paths as exact paths (no globbing)
  -c, --batchCount <count>   Max files to read at once (default: 100)
  -s, --sync                Use synchronous version
  -h, --help                Show this help

Examples:
  deno run --allow-read main.ts
  deno run --allow-read main.ts -a sha-256 -f "src/**/*.ts"
  deno run --allow-read main.ts --sync "file1.txt" "file2.txt"
  `);
}

/**
 * Main CLI function that parses arguments and executes file hashing
 * @returns {Promise<void>} A promise that resolves when the operation completes
 * @throws {Error} When hashing fails or invalid arguments are provided
 */
async function main() {
  const args = parseArgs(Deno.args, {
    string: ["files", "algorithm", "batchCount"],
    boolean: ["noGlob", "sync", "help"],
    alias: {
      f: "files",
      a: "algorithm",
      n: "noGlob",
      c: "batchCount",
      s: "sync",
      h: "help",
    },
    default: {
      algorithm: "sha-1",
      batchCount: 100,
      noGlob: false,
      sync: false,
    },
  }) as ParsedArgs;

  if (args.help) {
    showHelp();
    return;
  }

  const files = args.files
    ? [args.files].flat()
    : args._.length > 0
    ? args._.map(String)
    : ["./**"];

  const hashOptions = {
    files,
    algorithm: args.algorithm,
    noGlob: args.noGlob,
    batchCount: args.batchCount,
  };

  try {
    let result: string;

    if (args.sync) {
      result = hashFilesSync(hashOptions);
    } else {
      result = await hashFiles(hashOptions);
    }

    console.log(result);
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}
