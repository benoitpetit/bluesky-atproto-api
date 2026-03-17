import { describe, it, expect } from 'bun:test';
import { fileExists } from './index';

describe('fileExists', () => {
    it('should return true when checking if package.json exists', () => {
        // package.json always exists in the project
        const result = fileExists('./package.json');
        expect(result).toBe(true);
    });

    it('should return false for non-existent file', () => {
        const result = fileExists('./nonexistent-file-12345.json');
        expect(result).toBe(false);
    });
});

describe('Type exports', () => {
    it('should export required functions', () => {
        const exports = require('./index');
        expect(exports.fileExists).toBeDefined();
        expect(typeof exports.fileExists).toBe('function');
    });
});
