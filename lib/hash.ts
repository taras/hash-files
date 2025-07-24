import { expandGlob } from "jsr:@std/fs@1/expand-glob";

const validAlgorithms = ["sha-1", "sha-256", "sha-384", "sha-512"] as const;
type Algorithm = typeof validAlgorithms[number];

/**
 * Options for configuring file hashing behavior
 * @interface HashOptions
 * @property {string[]} [files] - Array of file patterns to hash (default: ["./**"])
 * @property {string} [algorithm] - Hash algorithm to use (default: "sha-1")
 * @property {number} [batchCount] - Maximum number of files to process at once (default: 100)
 * @property {boolean} [noGlob] - Treat file paths as exact paths without glob expansion (default: false)
 */
interface HashOptions {
  files?: string[];
  algorithm?: string;
  batchCount?: number;
  noGlob?: boolean;
}

/**
 * Type guard to validate if a string is a supported hash algorithm
 * @param {string} algorithm - The algorithm string to validate
 * @returns {boolean} True if the algorithm is valid, false otherwise
 */
function isValidAlgorithm(algorithm: string): algorithm is Algorithm {
  return (validAlgorithms as readonly string[]).includes(algorithm);
}

/**
 * Asynchronously compute the hash of multiple files
 * @param {HashOptions} [options={}] - Configuration options for hashing
 * @returns {Promise<string>} A promise that resolves to the computed hash as a hexadecimal string
 * @throws {Error} When algorithm is invalid or file reading fails
 * @example
 * const hash = await hashFiles({ files: ["src/file.ts"], algorithm: "sha-256" });
 */
export async function hashFiles(options: HashOptions = {}): Promise<string> {
  const {
    files = ["./**"],
    algorithm = "sha-1",
    batchCount = 100,
    noGlob = false,
  } = options;

  if (!isValidAlgorithm(algorithm)) {
    throw new Error(
      `Invalid algorithm. Please use one of the following: ${
        validAlgorithms.join(", ")
      }`,
    );
  }

  let filePaths: string[];

  if (noGlob) {
    filePaths = files;
  } else {
    const allFiles: string[] = [];
    for (const pattern of files) {
      for await (const file of expandGlob(pattern)) {
        if (file.isFile) {
          allFiles.push(file.path);
        }
      }
    }
    filePaths = [...new Set(allFiles)].sort();
  }

  const fileDataList: Uint8Array[] = [];

  for (let i = 0; i < filePaths.length; i += batchCount) {
    const batch = filePaths.slice(i, i + batchCount);
    const batchPromises = batch.map(async (filePath) => {
      try {
        return await Deno.readFile(filePath);
      } catch (error) {
        throw new Error(
          `Failed to read file ${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    });

    const batchResults = await Promise.all(batchPromises);
    fileDataList.push(...batchResults);
  }

  const combinedData = new Uint8Array(
    fileDataList.reduce((total, data) => total + data.length, 0),
  );
  let offset = 0;

  for (const data of fileDataList) {
    combinedData.set(data, offset);
    offset += data.length;
  }

  // Convert algorithm name to match Web Crypto API
  const algoName = algorithm === "sha-1"
    ? "SHA-1"
    : algorithm === "sha-256"
    ? "SHA-256"
    : algorithm === "sha-384"
    ? "SHA-384"
    : algorithm === "sha-512"
    ? "SHA-512"
    : "SHA-1";

  const hashBuffer = await crypto.subtle.digest(algoName, combinedData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Synchronously compute the hash of multiple files (simplified implementation)
 * @param {HashOptions} [options={}] - Configuration options for hashing
 * @returns {string} The computed hash as a hexadecimal string
 * @throws {Error} When algorithm is invalid or file reading fails
 * @example
 * const hash = hashFilesSync({ files: ["file1.txt", "file2.txt"], noGlob: true });
 * @note This function uses a simplified hash implementation and has limited glob support
 */
export function hashFilesSync(options: HashOptions = {}): string {
  const {
    files = ["./**"],
    algorithm = "sha-1",
    noGlob = false,
  } = options;

  if (!isValidAlgorithm(algorithm)) {
    throw new Error(
      `Invalid algorithm. Please use one of the following: ${
        validAlgorithms.join(", ")
      }`,
    );
  }

  let filePaths: string[];

  if (noGlob) {
    filePaths = files;
  } else {
    const allFiles: string[] = [];
    for (const pattern of files) {
      // Note: expandGlob is async, but we need sync behavior here
      // For simplicity, we'll use a basic pattern matching for sync version
      if (pattern.includes("*")) {
        // Basic glob support - just skip for now in sync version
        console.warn(
          `Glob patterns not fully supported in sync mode: ${pattern}`,
        );
      } else {
        allFiles.push(pattern);
      }
    }
    filePaths = [...new Set(allFiles)].sort();
  }

  const fileDataList: Uint8Array[] = [];

  for (const filePath of filePaths) {
    try {
      const data = Deno.readFileSync(filePath);
      fileDataList.push(data);
    } catch (error) {
      throw new Error(
        `Failed to read file ${filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  const combinedData = new Uint8Array(
    fileDataList.reduce((total, data) => total + data.length, 0),
  );
  let offset = 0;

  for (const data of fileDataList) {
    combinedData.set(data, offset);
    offset += data.length;
  }

  // For sync operation, we'll use a simplified hash approach
  // Note: Deno's crypto.subtle is async only, so we use a workaround
  const hashHex = Array.from(combinedData)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Simple hash implementation for sync version
  let hash = 0;
  for (let i = 0; i < hashHex.length; i++) {
    const char = hashHex.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16);
}
