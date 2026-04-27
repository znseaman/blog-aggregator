import { desc, eq, arrayContains, sql } from "drizzle-orm";
import { db } from "..";
import { feed_follows, feeds, posts } from "../schema";

export type Post = typeof posts.$inferSelect;

export async function createPost(
  title: string,
  url: string,
  description: string,
  publishedAt: Date,
  feedId: string,
) {
  const [result] = await db
    .insert(posts)
    .values({ title, url, feedId, description, publishedAt })
    .returning();
  return result;
}

export async function getPostsForUser(userId: string, limit: number) {
  const result = await db
    .select({
      id: posts.id,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(feed_follows, eq(posts.feedId, feed_follows.feedId))
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .where(eq(feed_follows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return result;
}
