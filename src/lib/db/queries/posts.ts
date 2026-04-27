import { eq, arrayContains, sql } from "drizzle-orm";
import { db } from "..";
import { feed_follows, posts } from "../schema";

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
    .select()
    .from(posts)
    .where(
      arrayContains(
        posts.feedId,
        db
          .select({ feedId: feed_follows.feedId })
          .from(feed_follows)
          .where(eq(feed_follows.userId, userId)),
      ),
    )
    .orderBy(sql`${posts.publishedAt} DESC`)
    .limit(limit);
  return result;
}
