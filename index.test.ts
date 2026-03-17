import { describe, it, expect } from 'bun:test';
import * as api from './index';

describe('fileExists', () => {
    it('should return true when checking if package.json exists', () => {
        const result = api.fileExists('./package.json');
        expect(result).toBe(true);
    });

    it('should return false for non-existent file', () => {
        const result = api.fileExists('./nonexistent-file-12345.json');
        expect(result).toBe(false);
    });
});

describe('Constant exports', () => {
    it('should export SESSION_FILE_PATH constant', () => {
        expect(api.SESSION_FILE_PATH).toBe('./session.json');
    });
});

describe('Function exports', () => {
    it('should export getTimeline function', () => {
        expect(typeof api.getTimeline).toBe('function');
    });

    it('should export resumeSession function', () => {
        expect(typeof api.resumeSession).toBe('function');
    });

    it('should export fileExists function', () => {
        expect(typeof api.fileExists).toBe('function');
    });

    it('should export login function', () => {
        expect(typeof api.login).toBe('function');
    });

    it('should export getProfile function', () => {
        expect(typeof api.getProfile).toBe('function');
    });

    it('should export getSessionData function', () => {
        expect(typeof api.getSessionData).toBe('function');
    });

    it('should export getAuthorFeed function', () => {
        expect(typeof api.getAuthorFeed).toBe('function');
    });

    it('should export createPost function', () => {
        expect(typeof api.createPost).toBe('function');
    });

    it('should export likePost function', () => {
        expect(typeof api.likePost).toBe('function');
    });

    it('should export getFollowers function', () => {
        expect(typeof api.getFollowers).toBe('function');
    });

    it('should export getFollows function', () => {
        expect(typeof api.getFollows).toBe('function');
    });

    it('should export repost function', () => {
        expect(typeof api.repost).toBe('function');
    });

    it('should export unfollow function', () => {
        expect(typeof api.unfollow).toBe('function');
    });

    it('should export muteUser function', () => {
        expect(typeof api.muteUser).toBe('function');
    });

    it('should export unmuteUser function', () => {
        expect(typeof api.unmuteUser).toBe('function');
    });

    it('should export follow function', () => {
        expect(typeof api.follow).toBe('function');
    });

    it('should export deletePost function', () => {
        expect(typeof api.deletePost).toBe('function');
    });

    it('should export deleteLike function', () => {
        expect(typeof api.deleteLike).toBe('function');
    });

    it('should export deleteRepost function', () => {
        expect(typeof api.deleteRepost).toBe('function');
    });

    it('should export getPost function', () => {
        expect(typeof api.getPost).toBe('function');
    });

    it('should export uploadBlob function', () => {
        expect(typeof api.uploadBlob).toBe('function');
    });
});
