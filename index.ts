import { AtpSessionData, AtpSessionEvent, BskyAgent, AppBskyFeedPost } from "@atproto/api";

import fs from "fs";
const agent = new BskyAgent({
    service: process.env.BLUESKY_SERVICE || "https://bluesky.social",
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
        // console.log("persistSession", evt, sess);
    },
});

export async function getTimeline(algorithm: string,  limit: number, cursor: string){
    return await agent.getTimeline({
        algorithm,
        limit,
        cursor,
    })
}

/**
 * resume session from session.json
 */
export async function resumeSession() {
    if (fileExists('./session.json')) {
        const sessionData = JSON.parse(fs.readFileSync('./session.json', 'utf8'));
        return await agent.resumeSession(sessionData);;
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
export async function login(identifier: string, password: string) {
    await agent.login({ 
        identifier, 
        password 
    });
    const sessionData = await getSessionData();
    fs.writeFileSync('./session.json', JSON.stringify(sessionData));
}

/**
 * return actor profile
 * @param actor user actor exemple : codingben.bsky.social
 * @returns actor profile
 */
export async function getProfile(actor: string) {
    return await agent.getProfile({ 
        actor
    });
}

/**
 * get session data
 * @returns session data
 */
export async function getSessionData(){
    return agent.session
}

/**
 * return post feed for actor
 * @param actor user actor exemple : codingben.bsky.social
 * @param limit limit of post
 * @param cursor cursor for pagination
 * @param filter filter for post
 * @returns post feed
 */
export async function getAuthorFeed(actor: string, limit: number, cursor: string, filter: string) {
    return await agent.getAuthorFeed({
        actor,
        limit,
        cursor,
        filter
    });
}

/**
 * create a post to bluesky
 * @param text text for post
 * @param langs langs for post
 * @param labels labels for post
 * @returns post
 */
export async function createPost(text: string, langs: string[], labels: string[]) {
    return await agent.post({
        text,
        langs,
        labels: {
            $type: "SelfLabels",
            self: true,
            labels
        }
    });
}

/**
 * like a post to bluesky
 * @param uri uri of post
 * @param cid cid of post
 * @returns post
 */
export async function likePost(uri: string, cid: string) {
    return await agent.like(uri, cid);
}

/**
 * get followers of user
 * @param actor actor of user
 * @param limit limit of followers
 * @param cursor cursor for pagination
 * @returns followers of user
 */
export async function getFollowers(actor: string, limit: number, cursor: string) {
    return await agent.getFollowers({
        actor,
        limit,
        cursor
    });
}

/**
 * get follows of user
 * @param actor actor of user
 * @param limit limit of follows
 * @param cursor cursor for pagination
 * @returns follows of user
 */
export async function getFollows(actor: string, limit: number, cursor: string) {
    return await agent.getFollows({
        actor,
        limit,
        cursor
    });
}


// start test
(async () => {
    const identifier = process.env.BLUESKY_IDENTIFIER || '';
    const password = process.env.BLUESKY_PASSWORD || '';
    
    // check if identifier and password are set
    if (!identifier || !password) {
        console.log("BLUESKY_IDENTIFIER or BLUESKY_PASSWORD not set");
        return;
    }

    // check if resume exist
    if (!await resumeSession()) {
        console.log("resume session failed, connexion...");
        // login to bluesky.social
        await login(identifier, password);
        // set session data
        const sessionData = await getSessionData();
        // write session data to session.json
        fs.writeFileSync('./session.json', JSON.stringify(sessionData));
        console.log("login success, logged in...");
        // return
    } else {
        console.log("resume session success, logged in...");
        // set session data
        const sessionData = await getSessionData();
        // return
    }

    // get follows
    // const follows = await getFollows("codingben.bsky.social", 10, '');
    // console.log(follows);

    // get timeline
    // const timeline = await getTimeline('', 1, '');
    // console.log(timeline);
    
    // get post feed
    // const feed = await getAuthorFeed("codingben.bsky.social", 10, '', 'posts_no_replies');
    // console.log(feed);

    // get profile
    // const profile = await getProfile("codingben.bsky.social");
    // console.log(profile);

    // // get followers
    // const followers = await getFollowers("codingben.bsky.social", 10, '');
    // console.log(followers);

    // create post
    // const post = await createPost('test', ['en'], []);
    // console.log(post);

    // const feed = await getAuthorFeed("codingben.bsky.social", 10, '', 'posts_no_replies');
    // console.log(feed);
    // const like = await likePost(post.uri, post.cid);
    // console.log(like);
})();