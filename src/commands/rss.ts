import { XMLParser } from "fast-xml-parser";
import { readConfig } from "../config";
import { getUserByName, User } from "../lib/db/queries/users";
import {
  createFeed,
  Feed,
  getFeeds,
  getNextFeedToFetch,
  markFeedFetched,
} from "../lib/db/queries/feeds";
import { createFeedFollow } from "../lib/db/queries/feed_follows";

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
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }

  const timeArg = args[0];
  const timeBetweenRequests = parseDuration(timeArg);
  if (!timeBetweenRequests) {
    throw new Error(
      `invalid duration: ${timeArg} - use format 1h 30m 15s or 3500ms`,
    );
  }

  console.log(`Collecting feeds every ${timeArg}...`);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }

  const name = args[0];
  const url = args[1];
  const feed = await createFeed(name, url, user.id);

  // create a feed follow for the user
  const feedFollow = await createFeedFollow(user.id, feed.id);

  console.log(
    `${feedFollow.userName} is now following ${feedFollow.feedName}!`,
  );
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

export async function scrapeFeeds() {
  const nextFeed = await getNextFeedToFetch();
  if (!nextFeed) {
    console.log(`No feeds to fetch.`);
    return;
  }
  console.log(`Found a feed to fetch!`);
  scrapeFeed(nextFeed);
}

export async function scrapeFeed(feed: Feed) {
  await markFeedFetched(feed.id);
  const feedData = await fetchFeed(feed.url);

  console.log(
    `Feed ${feed.name} collected, ${feedData.channel.item.length} posts found`,
  );
}

export function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    return 0;
  }

  if (match.length !== 3) return 0;

  let number = Number(match[1]);
  let multiplier = timeUnitToMultipler(match[2]);

  return number * multiplier;
}

export function timeUnitToMultipler(unit: string): number {
  switch (unit) {
    case "ms":
      return 1;
    case "s":
      return 1_000;
    case "m":
      return 60_000;
    case "h":
      return 360_000;
    default:
      return 0;
  }
}

function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
}
