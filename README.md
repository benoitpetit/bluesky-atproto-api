# Bluesky Social API

help me here ❤️ : https://liberapay.com/devbyben/donate

>This project is an interface for interacting with the Bluesky Social API. It is currently under development.

>This project was created for my personal use, but feel free to use it if you wish.

## Features

- Login to Bluesky Social
- Session management (resume/save)
- Retrieve the timeline
- Retrieve an author's feed
- Get a single post / multiple posts
- Create posts (with text, labels, and media)
- Delete posts
- Like posts / Get likes
- Delete likes
- Repost posts / Get who reposted
- Delete reposts
- Follow/Unfollow users
- Mute/Unmute users
- Upload blobs (media)
- Get suggested users to follow
- Get user notifications
- Count unread notifications
- Mark notifications as seen
- Resolve handle to DID
- Update user handle
- Retrieve a user's followers
- Retrieve the users followed by a user

## Installation

Install the dependencies with the following command:

```bash
npm install
```

Or with Bun:

```bash
bun install
```

## Usage

To use this project, you need to set the following environment variables:

- `BLUESKY_SERVICE`: The URL of the Bluesky service you want to use (default is "https://bluesky.social")
- `BLUESKY_IDENTIFIER`: Your Bluesky identifier (e.g., username.bsky.social)
- `BLUESKY_PASSWORD`: Your Bluesky app password

You can set these variables in a `.env` file at the root of the project. See `.env.example` for reference.

## Examples

Here are some examples of how you can use this project:

```typescript
// Login to Bluesky Social
await login(identifier, password);

// Or resume a previous session
await resumeSession();

// Retrieve the timeline
const timeline = await getTimeline('', 1, '');

// Retrieve an author's feed
const feed = await getAuthorFeed("codingben.bsky.social", 10, '', 'posts_no_replies');

// Create a simple post
const post = await createPost('Hello Bluesky!', ['en'], []);

// Create a post with media
const mediaBuffer = fs.readFileSync('./image.jpg');
const postWithMedia = await createPost('Check out this image!', ['en'], [], [
    { mimeType: 'image/jpeg', data: mediaBuffer }
]);

// Like a post
const like = await likePost(post.uri, post.cid);

// Repost a post
const repost = await repost(post.uri, post.cid);

// Follow a user (returns the follow URI needed to unfollow)
const follow = await agent.follow('user.bsky.social');
// Later, to unfollow:
// await unfollow(follow.uri);

// Mute a user
await muteUser('user.bsky.social');

// Unmute a user
await unmuteUser('user.bsky.social');

// Retrieve a user's followers
const followers = await getFollowers("codingben.bsky.social", 10, '');

// Retrieve the users followed by a user
const follows = await getFollows("codingben.bsky.social", 10, '');

// Get user profile
const profile = await getProfile("codingben.bsky.social");
```

## Development

Run tests:

```bash
npm test
```

Or with Bun:

```bash
bun test
```

Run typecheck:

```bash
npm run typecheck
```

> **this project is a development project for the Bluesky Social API. It is currently under development**

## License

This project is licensed under the MIT license.
