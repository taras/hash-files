import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { hashFiles, hashFilesSync } from "../lib/hash.ts";

// Mock file system for testing
const mockFiles = new Map<string, Uint8Array>([
  ["test_file1.txt", new TextEncoder().encode("some content")],
  ["test_file2.txt", new TextEncoder().encode("some more content")],
  ["test_dir/file3.txt", new TextEncoder().encode("additional content")],
]);

// Create temporary test files
async function setupTestFiles() {
  await cleanupTestFiles(); // Clean first
  await Deno.mkdir("test_temp", { recursive: true });
  await Deno.mkdir("test_temp/test_dir", { recursive: true });

  for (const [filename, content] of mockFiles) {
    await Deno.writeFile(`test_temp/${filename}`, content);
  }
}

// Clean up test files
async function cleanupTestFiles() {
  try {
    await Deno.remove("test_temp", { recursive: true });
  } catch (_error) {
    // Directory may not exist
  }
}

Deno.test({
  name: "hashFiles - should hash contents of files with default algorithm",
  async fn() {
    await setupTestFiles();

    try {
      const result = await hashFiles({
        files: ["test_temp/test_file1.txt", "test_temp/test_file2.txt"],
        noGlob: true,
      });

      assertEquals(typeof result, "string");
      assertEquals(result.length > 0, true);
    } finally {
      await cleanupTestFiles();
    }
  },
});

Deno.test({
  name: "hashFiles - should hash contents with sha-256 algorithm",
  async fn() {
    await setupTestFiles();

    try {
      const result = await hashFiles({
        files: ["test_temp/test_file1.txt"],
        algorithm: "sha-256",
        noGlob: true,
      });

      assertEquals(typeof result, "string");
      assertEquals(result.length, 64); // SHA-256 produces 64 character hex string
    } finally {
      await cleanupTestFiles();
    }
  },
});

Deno.test({
  name: "hashFiles - should work with globbing",
  async fn() {
    await setupTestFiles();

    try {
      const result = await hashFiles({
        files: ["test_temp/*.txt"],
      });

      assertEquals(typeof result, "string");
      assertEquals(result.length > 0, true);
    } finally {
      await cleanupTestFiles();
    }
  },
});

Deno.test({
  name: "hashFiles - should throw error for invalid algorithm",
  async fn() {
    await assertRejects(
      async () => {
        await hashFiles({
          files: ["test_temp/test_file1.txt"],
          algorithm: "invalid-algo",
          noGlob: true,
        });
      },
      Error,
      "Invalid algorithm",
    );
  },
});

Deno.test({
  name: "hashFiles - should handle non-existent files",
  async fn() {
    await assertRejects(
      async () => {
        await hashFiles({
          files: ["non_existent_file.txt"],
          noGlob: true,
        });
      },
      Error,
      "Failed to read file",
    );
  },
});

Deno.test({
  name: "hashFiles - should work with different batch counts",
  async fn() {
    await setupTestFiles();

    try {
      const result = await hashFiles({
        files: ["test_temp/test_file1.txt", "test_temp/test_file2.txt"],
        batchCount: 1,
        noGlob: true,
      });

      assertEquals(typeof result, "string");
      assertEquals(result.length > 0, true);
    } finally {
      await cleanupTestFiles();
    }
  },
});

// Synchronous tests
Deno.test({
  name: "hashFilesSync - should hash contents of files with default algorithm",
  fn() {
    // Note: The sync version uses a simplified hash for demo purposes
    const result = hashFilesSync({
      files: ["README.md"],
      noGlob: true,
    });

    assertEquals(typeof result, "string");
    assertEquals(result.length > 0, true);
  },
});

Deno.test({
  name: "hashFilesSync - should throw error for invalid algorithm",
  fn() {
    assertThrows(
      () => {
        hashFilesSync({
          files: ["README.md"],
          algorithm: "invalid-algo",
          noGlob: true,
        });
      },
      Error,
      "Invalid algorithm",
    );
  },
});

Deno.test({
  name: "hashFilesSync - should handle non-existent files",
  fn() {
    assertThrows(
      () => {
        hashFilesSync({
          files: ["non_existent_file.txt"],
          noGlob: true,
        });
      },
      Error,
      "Failed to read file",
    );
  },
});

// Test different algorithms
const algorithms = ["sha-1", "sha-256", "sha-384", "sha-512"];

for (const algorithm of algorithms) {
  Deno.test({
    name: `hashFiles - should work with ${algorithm} algorithm`,
    async fn() {
      await setupTestFiles();

      try {
        const result = await hashFiles({
          files: ["test_temp/test_file1.txt"],
          algorithm,
          noGlob: true,
        });

        assertEquals(typeof result, "string");
        assertEquals(result.length > 0, true);
      } finally {
        await cleanupTestFiles();
      }
    },
  });
}
