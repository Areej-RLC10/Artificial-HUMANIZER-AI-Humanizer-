import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTextFromFile, calculatePlagiarismScore } from './fileParsers.js';

test('extractTextFromFile reads plain text files', async () => {
  const file = new File(['This is a sample document for upload.'], 'sample.txt', { type: 'text/plain' });
  const text = await extractTextFromFile(file);
  assert.match(text, /sample document/i);
});

test('calculatePlagiarismScore increases for repeated wording', () => {
  const score = calculatePlagiarismScore('This is a repeated sentence. This is a repeated sentence. This is a repeated sentence.');
  assert(score > 0.6);
});
