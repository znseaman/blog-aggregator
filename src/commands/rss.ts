import { XMLParser } from "fast-xml-parser";
import { readConfig } from "../config";
import { getUserByName, User } from "../lib/db/queries/users";
import { createFeed, Feed, getFeeds } from "../lib/db/queries/feeds";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const result = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });
  const xmlString = await result.text();

  const parser = new XMLParser();
  const feed = parser.parse(xmlString);

  if (!feed.rss.channel) {
    throw new Error(`Invalid RSS feed missing "channel" field`);
  }

  if (
    !feed.rss.channel.title ||
    !feed.rss.channel.link ||
    !feed.rss.channel.description
  ) {
    throw new Error(
      `Invalid RSS feed missing "title", "channel", or "description" within "channel" field`,
    );
  }

  const { title, link, description } = feed.rss.channel;

  const items: RSSItem[] = [];
  if (feed.rss.channel.item) {
    // check if array
    if (Array.isArray(feed.rss.channel.item)) {
      for (const item of feed.rss.channel.item) {
        items.push({
          ...item,
        });
      }
    } else {
      // is object
      const item: RSSItem = feed.rss.channel.item;
      items.push({ ...item });
    }
  }

  const rssObject: RSSFeed = {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };

  return rssObject;
}

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feedURL = "https://www.wagslane.dev/index.xml";
  const rssFeed = await fetchFeed(feedURL);

  console.log(JSON.stringify(rssFeed, null, 2));
}

export async function handlerAddFeed(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }

  const { currentUserName } = readConfig();
  const user = await getUserByName(currentUserName);
  if (!user) {
    throw new Error(
      "No user logged in currently. Run 'login' command with user",
    );
  }

  const name = args[0];
  const url = args[1];
  const feed = await createFeed(name, url, user.id);
  printFeed(feed, user);
}

function printFeed(feed: Feed, user: User) {
  console.log(`Feed: ${JSON.stringify(feed, null, 2)}`);
  console.log(`User: ${JSON.stringify(user, null, 2)}`);
}

export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feeds = await getFeeds();

  console.log(JSON.stringify(feeds, null, 2));
}
