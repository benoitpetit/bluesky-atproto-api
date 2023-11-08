import { login, resumeSession, getSessionData, getFollows, getTimeline, getAuthorFeed, getProfile, getFollowers, createPost, likePost } from './index';
import fs from 'fs';

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
        console.log("resume session failed");
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

    // EXAMPLES
    // add to .env file BLUESKY_IDENTIFIER and BLUESKY_PASSWORD

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