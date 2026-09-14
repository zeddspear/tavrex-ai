import ts from 'typescript';
import { readFile, writeFile } from 'node:fs/promises';

// Typechecked by the root build first; this worker has no runtime imports.
const source = await readFile('apps/worker/src/index.ts', 'utf8');
const result = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
  },
});
await writeFile('apps/web/dist/_worker.js', result.outputText);
