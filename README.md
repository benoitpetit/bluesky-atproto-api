# Bluesky Social API

help me here ❤️ : https://patreon.com/benoitpetit

>This project is an interface for interacting with the Bluesky Social API. It is currently under development.

>This project was created for my personal use, but feel free to use it if you wish.

## Features

- Login to Bluesky Social
- Retrieve the timeline
- Retrieve an author's feed
- Create posts
- Like posts
- Retrieve a user's followers
- Retrieve the users followed by a user

## Installation

Install the dependencies with the following command:

```bash
npm install
```

## Usage

To use this project, you need to set the following environment variables:

- `BLUESKY_SERVICE`: The URL of the Bluesky service you want to use (default is "https://bluesky.social")
- `BLUESKY_IDENTIFIER`: Your Bluesky identifier
- `BLUESKY_PASSWORD`: Your Bluesky password

You can set these variables in a `.env` file at the root of the project.

## Examples

Here are some examples of how you can use this project:

```typescript
// Login to Bluesky Social
await login(identifier, password);

// Retrieve the timeline
const timeline = await getTimeline('', 1, '');

// Retrieve an author's feed
const feed = await getAuthorFeed("codingben.bsky.social", 10, '', 'posts_no_replies');

// Create a post
const post = await createPost('test', ['en'], []);

// Like a post
const like = await likePost(post.uri, post.cid);

// Retrieve a user's followers
const followers = await getFollowers("codingben.bsky.social", 10, '');

// Retrieve the users followed by a user
const follows = await getFollows("codingben.bsky.social", 10, '');
```

## Development
> **this project is a development project for the Bluesky Social API. It is currently under development**

## License

This project is licensed under the MIT license.
