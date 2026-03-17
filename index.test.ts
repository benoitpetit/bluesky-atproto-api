import { describe, it, expect, beforeEach, jest } from 'bun:test';

// Mock the fs module
const mockFs = {
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
};

jest.mock('fs', () => mockFs);

// Import after mocking
import { fileExists } from './index';

describe('fileExists', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return true when file exists', () => {
        mockFs.existsSync.mockReturnValue(true);
        const result = fileExists('./test.json');
        expect(result).toBe(true);
        expect(mockFs.existsSync).toHaveBeenCalledWith('./test.json');
    });

    it('should return false when file does not exist', () => {
        mockFs.existsSync.mockReturnValue(false);
        const result = fileExists('./nonexistent.json');
        expect(result).toBe(false);
    });

    it('should handle different file paths', () => {
        mockFs.existsSync.mockReturnValue(true);
        fileExists('/path/to/file.txt');
        expect(mockFs.existsSync).toHaveBeenCalledWith('/path/to/file.txt');
    });
});

describe('Type exports', () => {
    it('should export required types', () => {
        // Import types to verify they exist
        const types = require('./index');
        
        expect(types).toBeDefined();
        expect(typeof types.fileExists).toBe('function');
    });
});
