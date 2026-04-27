import { XMLParser } from "fast-xml-parser";

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
