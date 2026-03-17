import { AtpSessionData, AtpSessionEvent, BskyAgent, AppBskyFeedPost } from "@atproto/api";

import fs from "fs";

// Centralized session file path
export const SESSION_FILE_PATH = './session.json';

// Type definitions for return types
export interface TimelineResponse {
    data: unknown;
    headers: unknown;
}

export interface FeedResponse {
    feed: unknown[];
    cursor?: string;
    headers: unknown;
}

export interface ProfileResponse {
    did: string;
    handle: string;
    displayName?: string;
    description?: string;
    avatar?: string;
    banner?: string;
    followersCount?: number;
    followsCount?: number;
    postsCount?: number;
    indexedAt?: string;
    labels?: unknown[];
    headers: unknown;
}

export interface FollowersResponse {
    subject: ProfileResponse;
    followers: Array<{
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
        labels?: unknown[];
        createdAt?: string;
    }>;
    cursor?: string;
    headers: unknown;
}

export interface FollowsResponse {
    subject: ProfileResponse;
    follows: Array<{
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
        labels?: unknown[];
        createdAt?: string;
    }>;
    cursor?: string;
    headers: unknown;
}

export interface PostResponse {
    uri: string;
    cid: string;
    author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
    };
    record: {
        text: string;
        createdAt: string;
        langs?: string[];
        labels?: unknown;
        embed?: unknown;
        reply?: unknown;
    };
    embed?: unknown;
    labels?: unknown[];
    replyCount?: number;
    repostCount?: number;
    likeCount?: number;
    indexedAt: string;
    headers: unknown;
}

export interface LikeResponse {
    uri: string;
    cid: string;
    headers: unknown;
}

export interface SearchUsersResponse {
    users: Array<{
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
        description?: string;
        indexedAt?: string;
    }>;
    cursor?: string;
    headers: unknown;
}

export interface SearchPostsResponse {
    posts: PostResponse[];
    cursor?: string;
    headers: unknown;
}

export interface Notification {
    uri: string;
    cid: string;
    author: {
        did: string;
        handle: string;
        displayName?: string;
        avatar?: string;
    };
    reason: string;
    reasonSubject?: string;
    record: unknown;
    isRead: boolean;
    indexedAt: string;
    labels?: unknown[];
}

export interface NotificationsResponse {
    notifications: Notification[];
    cursor?: string;
    headers: unknown;
}

export interface ActionResponse {
    uri: string;
    cid: string;
    headers: unknown;
}

const agent = new BskyAgent({
    service: process.env.BLUESKY_SERVICE || "https://bluesky.social",
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
        // console.log("persistSession", evt, sess);
    },
});

export async function getTimeline(algorithm: string, limit: number, cursor: string): Promise<TimelineResponse> {
    const result = await agent.getTimeline({
        algorithm,
        limit,
        cursor,
    });
    return result as unknown as TimelineResponse;
}

/**
 * resume session from session.json
 */
export async function resumeSession(): Promise<boolean> {
    if (fileExists(SESSION_FILE_PATH)) {
        const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH, 'utf8'));
        const result = await agent.resumeSession(sessionData);
        return result.success;
    }
    return false;
}
/**
 * check if file exists
 * @param filePath path to file
 * @returns true if file exists, false otherwise
 */
export function fileExists(filePath: string) {
    return fs.existsSync(filePath);
}

/**
 * login to bluesky.social or other instance with identifier and password
 * @param identifier login identifier
 * @param password password for login
 */
/**
 * Connects to the agent using the provided identifier and password, and saves the session data to a file.
 * @param identifier The user identifier.
 * @param password The user password.
 */
export async function login(identifier: string, password: string): Promise<void> {
    await agent.login({ 
        identifier, 
        password 
    });
    const sessionData = await getSessionData();
    fs.writeFileSync(SESSION_FILE_PATH, JSON.stringify(sessionData));
}

/**
 * return actor profile
 * @param actor user actor exemple : codingben.bsky.social
 * @returns actor profile
 */
export async function getProfile(actor: string): Promise<ProfileResponse> {
    const result = await agent.getProfile({ 
        actor
    });
    return result as unknown as ProfileResponse;
}

/**
 * get session data
 * @returns session data
 */
export async function getSessionData(): Promise<AtpSessionData | undefined> {
    return agent.session;
}

/**
 * return post feed for actor
 * @param actor user actor exemple : codingben.bsky.social
 * @param limit limit of post
 * @param cursor cursor for pagination
 * @param filter filter for post
 * @returns post feed
 */
export async function getAuthorFeed(actor: string, limit: number, cursor: string, filter: string): Promise<FeedResponse> {
    const result = await agent.getAuthorFeed({
        actor,
        limit,
        cursor,
        filter
    });
    return result as unknown as FeedResponse;
}

// Media type for post attachments
export interface MediaAttachment {
    mimeType: string;
    data: Uint8Array;
}

/**
 * create a post to bluesky
 * @param text text for post
 * @param langs langs for post
 * @param labels labels for post
 * @param media optional array of media attachments
 * @returns post
 */
export async function createPost(
    text: string, 
    langs: string[], 
    labels: string[],
    media?: MediaAttachment[]
): Promise<PostResponse> {
    // Build post record
    const record: AppBskyFeedPost.Record = {
        text,
        langs,
        createdAt: new Date().toISOString(),
    };

    // Handle media attachments
    if (media && media.length > 0) {
        const uploadedBlobs = await Promise.all(
            media.map(async (m) => {
                const blob = await agent.uploadBlob(m.data, { 
                    encoding: m.mimeType 
                });
                return blob;
            })
        );
        
        record.embed = {
            $type: "app.bsky.embed.images",
            images: uploadedBlobs.map((blob, index) => ({
                alt: `Image ${index + 1}`,
                image: blob.data.blob,
            }))
        };
    }

    const result = await agent.post(record);
    return result as unknown as PostResponse;
}

/**
 * like a post to bluesky
 * @param uri uri of post
 * @param cid cid of post
 * @returns post
 */
export async function likePost(uri: string, cid: string): Promise<LikeResponse> {
    const result = await agent.like(uri, cid);
    return result as unknown as LikeResponse;
}

/**
 * get followers of user
 * @param actor actor of user
 * @param limit limit of followers
 * @param cursor cursor for pagination
 * @returns followers of user
 */
export async function getFollowers(actor: string, limit: number, cursor: string): Promise<FollowersResponse> {
    const result = await agent.getFollowers({
        actor,
        limit,
        cursor
    });
    return result as unknown as FollowersResponse;
}

/**
 * get follows of user
 * @param actor actor of user
 * @param limit limit of follows
 * @param cursor cursor for pagination
 * @returns follows of user
 */
export async function getFollows(actor: string, limit: number, cursor: string): Promise<FollowsResponse> {
    const result = await agent.getFollows({
        actor,
        limit,
        cursor
    });
    return result as unknown as FollowsResponse;
}

/**
 * repost a post to bluesky
 * @param uri uri of post to repost
 * @param cid cid of post to repost
 * @returns repost action result
 */
export async function repost(uri: string, cid: string): Promise<ActionResponse> {
    const result = await agent.repost(uri, cid);
    return result as unknown as ActionResponse;
}

/**
 * unfollow a user
 * @param uri uri of the follow relationship to remove
 * @returns unfollow action result
 */
export async function unfollow(uri: string): Promise<ActionResponse> {
    const result = await agent.deleteFollow(uri);
    return result as unknown as ActionResponse;
}

/**
 * mute a user (hide their posts from your timeline)
 * @param actor the user to mute
 * @returns mute action result
 */
export async function muteUser(actor: string): Promise<ActionResponse> {
    const result = await agent.mute(actor);
    return result as unknown as ActionResponse;
}

/**
 * unmute a user (show their posts on your timeline again)
 * @param actor the user to unmute
 * @returns unmute action result
 */
export async function unmuteUser(actor: string): Promise<ActionResponse> {
    const result = await agent.unmute(actor);
    return result as unknown as ActionResponse;
}

/**
 * follow a user
 * @param actor the user to follow
 * @returns follow action result with uri
 */
export async function follow(actor: string): Promise<ActionResponse> {
    const result = await agent.follow(actor);
    return result as unknown as ActionResponse;
}

/**
 * delete a post
 * @param uri uri of the post to delete
 * @returns delete action result
 */
export async function deletePost(uri: string): Promise<ActionResponse> {
    const result = await agent.deletePost(uri);
    return result as unknown as ActionResponse;
}

/**
 * delete a like
 * @param uri uri of the like to delete
 * @returns delete action result
 */
export async function deleteLike(uri: string): Promise<ActionResponse> {
    const result = await agent.deleteLike(uri);
    return result as unknown as ActionResponse;
}

/**
 * delete a repost
 * @param uri uri of the repost to delete
 * @returns delete action result
 */
export async function deleteRepost(uri: string): Promise<ActionResponse> {
    const result = await agent.deleteRepost(uri);
    return result as unknown as ActionResponse;
}

/**
 * get a single post by URI
 * @param uri the URI of the post
 * @returns post data
 */
export async function getPost(uri: string): Promise<PostResponse> {
    // Using type assertion to work with the API
    const result = await (agent as any).getPost(uri);
    return result as unknown as PostResponse;
}

/**
 * upload a blob (image/video)
 * @param data the binary data
 * @param mimeType the MIME type
 * @returns uploaded blob
 */
export async function uploadBlob(data: Uint8Array, mimeType: string): Promise<{ data: { blob: unknown }; mimeType: string }> {
    const result = await agent.uploadBlob(data, { encoding: mimeType });
    return result as unknown as { data: { blob: unknown }; mimeType: string };
}

/**
 * get a list of posts by URIs
 * @param uris array of post URIs
 * @returns array of posts
 */
export async function getPosts(uris: string[]): Promise<PostResponse[]> {
    const result = await (agent as any).getPosts(uris);
    return result as unknown as PostResponse[];
}

/**
 * get likes for a post
 * @param uri the post URI
 * @param limit limit of results
 * @param cursor cursor for pagination
 * @returns likes data
 */
export async function getLikes(uri: string, limit: number, cursor: string): Promise<{ likes: Array<{ did: string; handle: string; actor: { did: string; handle: string } }>; cursor?: string }> {
    const result = await (agent as any).getLikes(uri, { limit, cursor });
    return result as unknown as { likes: Array<{ did: string; handle: string; actor: { did: string; handle: string } }>; cursor?: string };
}

/**
 * get who reposted a post
 * @param uri the post URI
 * @param limit limit of results
 * @param cursor cursor for pagination
 * @returns reposted by data
 */
export async function getRepostedBy(uri: string, limit: number, cursor: string): Promise<{ repostedBy: Array<{ did: string; handle: string }>; cursor?: string }> {
    const result = await (agent as any).getRepostedBy(uri, { limit, cursor });
    return result as unknown as { repostedBy: Array<{ did: string; handle: string }>; cursor?: string };
}

/**
 * get suggested users to follow
 * @param limit limit of results
 * @param cursor cursor for pagination
 * @returns suggestions data
 */
export async function getSuggestions(limit: number, cursor: string): Promise<{ suggestions: Array<{ did: string; handle: string; displayName?: string; avatar?: string }>; cursor?: string }> {
    const result = await (agent as any).getSuggestions(limit, { cursor });
    return result as unknown as { suggestions: Array<{ did: string; handle: string; displayName?: string; avatar?: string }>; cursor?: string };
}

/**
 * get user notifications
 * @param limit limit of results
 * @param cursor cursor for pagination
 * @returns notifications data
 */
export async function listNotifications(limit: number, cursor: string): Promise<NotificationsResponse> {
    const result = await (agent as any).listNotifications({ limit, cursor });
    return result as unknown as NotificationsResponse;
}

/**
 * count unread notifications
 * @returns count of unread notifications
 */
export async function countUnreadNotifications(): Promise<number> {
    const result = await (agent as any).countUnreadNotifications();
    return result as unknown as number;
}

/**
 * mark notifications as seen
 * @param seenAt the timestamp to mark as seen
 * @returns result
 */
export async function updateSeenNotifications(seenAt: string): Promise<{ count: number }> {
    const result = await (agent as any).updateSeenNotifications(seenAt);
    return result as unknown as { count: number };
}

/**
 * resolve a handle to DID
 * @param handle the handle to resolve
 * @returns DID
 */
export async function resolveHandle(handle: string): Promise<{ did: string }> {
    const result = await (agent as any).resolveHandle(handle);
    return result as unknown as { did: string };
}

/**
 * update user handle
 * @param handle the new handle
 * @returns result
 */
export async function updateHandle(handle: string): Promise<ActionResponse> {
    const result = await (agent as any).updateHandle(handle);
    return result as unknown as ActionResponse;
}