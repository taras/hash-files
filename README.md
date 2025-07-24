# hash-files

Compute the hash of the contents of a set of files

**Note: This project has been converted from Node.js to Deno.**

## Installation

No installation required! Run directly with Deno:

```bash
deno run --allow-read jsr:@taras/hash-files/cli [options] [files...]
```

## Usage

### As a Library

```typescript
import { hashFiles, hashFilesSync } from "jsr:@taras/hash-files";

// Async version
const hash = await hashFiles({
  files: ['file1.txt', 'file2.txt'],
  algorithm: 'sha-256',
  noGlob: true
});

console.log(hash);

// Sync version  
const hashSync = hashFilesSync({
  files: ['file1.txt'],
  algorithm: 'sha-1'
});

console.log(hashSync);
```

### As a CLI Tool

```bash
# Run directly from JSR
deno run jsr:@taras/hash-files/cli --help

# Hash files with specific algorithm
deno run jsr:@taras/hash-files/cli -a sha-256 main.ts

# Hash multiple files without globbing
deno run jsr:@taras/hash-files/cli --noGlob file1.txt file2.txt

# Use sync version
deno run jsr:@taras/hash-files/cli --sync deno.json
```

### CLI Options

```
Usage: deno run jsr:@taras/hash-files/cli [options] [files...]

Options:
  -f, --files <files...>     Files to hash (default: ./**)
  -a, --algorithm <algo>     Hash algorithm (default: sha-1)
                            Available: sha-1, sha-256, sha-384, sha-512
  -n, --noGlob              Treat file paths as exact paths (no globbing)
  -c, --batchCount <count>   Max files to read at once (default: 100)
  -s, --sync                Use synchronous version
  -h, --help                Show this help
```

### hashFiles(options?)

Performs a hash of the contents of the given files asynchronously.

* `options` - (Object) see below for more details
* Returns `Promise<string>` - the computed hash value

### hashFilesSync(options?)

Performs a hash of the contents of the given files synchronously.

* `options` - (Object) see below for more details  
* Returns `string` - the computed hash value

### Options

* `files` - (optional) A collection of file paths to hash the contents of. Defaults to `['./**']` (all the files in the current working directory)
* `algorithm` - (optional) The algorithm to use to hash the content: 'sha-1', 'sha-256', 'sha-384', or 'sha-512'. Defaults to 'sha-1'.
* `noGlob` - (optional) Don't bother running a glob function on the files. Use this if you know all of the files in the collection are exact paths. Setting this to `true` speeds up the call slightly.
* `batchCount` - (optional) Only used for the async function. The maximum number of files to read into memory at any given time. Defaults to 100.


## License

The MIT License (MIT) Copyright (c) 2013 Mac Angell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

