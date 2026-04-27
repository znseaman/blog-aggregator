import { db } from "..";
import { feeds, users } from "../schema";
import { eq, sql } from "drizzle-orm";
import { firstOrUndefined } from "./utils";

export type Feed = typeof feeds.$inferSelect;

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name, url, userId })
    .returning();
  return result;
}

export async function getFeeds() {
  const result = await db
    .select({
      name: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .leftJoin(users, eq(feeds.userId, users.id));
  return result;
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
}

export async function markFeedFetched(feedId: string) {
  const result = await db
    .update(feeds)
    .set({ lastFetchedAt: sql`NOW()` })
    .where(eq(feeds.id, feedId))
    .returning();
  return firstOrUndefined(result);
}

export async function getNextFeedToFetch() {
  const result = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);
  return firstOrUndefined(result);
}
