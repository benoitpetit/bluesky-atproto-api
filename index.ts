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
 * @param poll optional poll configuration
 * @returns post
 */
export async function createPost(
    text: string, 
    langs: string[], 
    labels: string[],
    media?: MediaAttachment[],
    poll?: {
        options: string[];
        endDate: Date;
    }
): Promise<PostResponse> {
    // Build post record
    const record: AppBskyFeedPost.Record = {
        text,
        langs,
    };

    // Handle media attachments
    if (media && media.length > 0) {
        const uploadedBlobs = await Promise.all(
            media.map(async (m) => {
                const blob = await agent.uploadBlob(m.data, { 
                    mimeType: m.mimeType 
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

    // Handle poll
    if (poll && poll.options.length > 0) {
        record.embed = {
            $type: "app.bsky.embed.poll",
            pods: poll.options.map(option => ({ 
                name: option,
                votes: 0 
            })),
            endDate: poll.endDate.toISOString()
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
 * block a user
 * @param uri the URI of the actor to block
 * @returns block action result
 */
export async function blockUser(uri: string): Promise<ActionResponse> {
    const result = await agent.block(uri);
    return result as unknown as ActionResponse;
}

/**
 * unblock a user
 * @param uri the URI of the block to remove
 * @returns unblock action result
 */
export async function unblockUser(uri: string): Promise<ActionResponse> {
    const result = await agent.unblock(uri);
    return result as unknown as ActionResponse;
}

/**
 * search for users
 * @param query search query
 * @param limit maximum number of results
 * @returns search results
 */
export async function searchUsers(query: string, limit: number): Promise<SearchUsersResponse> {
    const result = await agent.searchUsers({
        term: query,
        limit
    });
    return result as unknown as SearchUsersResponse;
}

/**
 * search for posts
 * @param query search query
 * @param limit maximum number of results
 * @returns search results
 */
export async function searchPosts(query: string, limit: number): Promise<SearchPostsResponse> {
    const result = await agent.searchPosts({
        q: query,
        limit
    });
    return result as unknown as SearchPostsResponse;
}

/**
 * get user notifications
 * @param limit maximum number of notifications
 * @param cursor cursor for pagination
 * @returns notifications
 */
export async function getNotifications(limit: number, cursor: string): Promise<NotificationsResponse> {
    const result = await agent.listNotifications({
        limit,
        cursor
    });
    return result as unknown as NotificationsResponse;
}

/**
 * update user profile
 * @param displayName new display name
 * @param description new bio/description
 * @returns updated profile
 */
export async function updateProfile(displayName?: string, description?: string): Promise<ProfileResponse> {
    const result = await agent.updateProfile({
        displayName,
        description
    });
    return result as unknown as ProfileResponse;
}

/**
 * update user handle
 * @param handle new handle (must be a valid DNS handle)
 * @returns update result
 */
export async function updateHandle(handle: string): Promise<ActionResponse> {
    const result = await agent.updateHandle(handle);
    return result as unknown as ActionResponse;
}