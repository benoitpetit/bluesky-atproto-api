import { describe, it, expect, beforeEach } from 'bun:test';
import { fileExists } from './index';

// Mock fs module
const mockFs = {
    existsSync: (path: string) => true,
};

describe('fileExists', () => {
    it('should return true when file exists', () => {
        const result = fileExists('./test.json');
        expect(result).toBe(true);
    });

    it('should return false when file does not exist', () => {
        const result = fileExists('./nonexistent.json');
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
