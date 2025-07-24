import { assertEquals, assertMatch } from "@std/assert";
import { hashFiles, hashFilesSync } from "./lib/hash.ts";

// Integration tests for the main hash functionality
Deno.test({
  name: "Integration - hashFiles with real files",
  async fn() {
    // Test with the actual project files
    const result = await hashFiles({
      files: ['main.ts'],
      algorithm: 'sha-256',
      noGlob: true
    });
    
    assertEquals(typeof result, 'string');
    assertEquals(result.length, 64); // SHA-256 hex string length
    assertMatch(result, /^[a-f0-9]{64}$/); // Validate hex format
  }
});

Deno.test({
  name: "Integration - hashFiles with glob pattern",
  async fn() {
    const result = await hashFiles({
      files: ['lib/*.ts'],
      algorithm: 'sha-1'
    });
    
    assertEquals(typeof result, 'string');
    assertEquals(result.length, 40); // SHA-1 hex string length
    assertMatch(result, /^[a-f0-9]{40}$/); // Validate hex format
  }
});

Deno.test({
  name: "Integration - hashFilesSync with real files",
  fn() {
    const result = hashFilesSync({
      files: ['deno.json'],
      noGlob: true
    });
    
    assertEquals(typeof result, 'string');
    assertEquals(result.length > 0, true);
    assertMatch(result, /^[a-f0-9]+$/); // Validate hex format
  }
});

Deno.test({
  name: "Integration - consistent results between calls",
  async fn() {
    const options = {
      files: ['main.ts'],
      algorithm: 'sha-256' as const,
      noGlob: true
    };
    
    const result1 = await hashFiles(options);
    const result2 = await hashFiles(options);
    
    assertEquals(result1, result2, "Hash should be consistent between calls");
  }
});

Deno.test({
  name: "Integration - different algorithms produce different results",
  async fn() {
    const file = ['main.ts'];
    
    const sha1Result = await hashFiles({
      files: file,
      algorithm: 'sha-1',
      noGlob: true
    });
    
    const sha256Result = await hashFiles({
      files: file,
      algorithm: 'sha-256',
      noGlob: true
    });
    
    assertEquals(sha1Result.length, 40);
    assertEquals(sha256Result.length, 64);
    assertEquals(sha1Result !== sha256Result, true, "Different algorithms should produce different hashes");
  }
});
