import { AtpSessionData, AtpSessionEvent, BskyAgent, AppBskyFeedPost } from "@atproto/api";
// import { QueryParams } from "@atproto/api/dist/client/types/app/bsky/actor/getProfile"; // reference type
// https://github.com/waverlyai/atproto_old/blob/waverly/packages/api/README.md

const agent = new BskyAgent({
    service: "https://bsky.social",
    persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
        console.log("persistSession", evt, sess);
    },
});

const identifier = process.env.BLUESKY_IDENTIFIER || '';
const password = process.env.BLUESKY_PASSWORD || '';

// // login
await agent.login({ identifier, password });

// recuperer le profile
// console.log(await agent.getProfile({ actor: "codingben.bsky.social"}));

// recuperer les posts
agent.getAuthorFeed({
    actor: "codingben.bsky.social",
    limit: 10,
    cursor: "",
    filter: "posts_no_replies"
}).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});

// creer un posts
// agent.post({
//     text: "Hello World",
//     langs: ["en"],
//     labels: {
//         $type: "SelfLabels",
//         self: true,
//         labels: ["test"]
//     }
// }).then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// });
