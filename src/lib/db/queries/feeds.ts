import { db } from "..";
import { feeds, users } from "../schema";
import { eq } from "drizzle-orm";

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
