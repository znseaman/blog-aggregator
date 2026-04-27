import { db } from "..";
import { feeds, feed_follows, users } from "../schema";
import { and, eq } from "drizzle-orm";

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFeedFollow] = await db
    .insert(feed_follows)
    .values({ userId, feedId })
    .returning();

  // get user and feed name
  const feedFollow = await getFeedFollow(
    newFeedFollow.userId,
    newFeedFollow.feedId,
  );

  return feedFollow;
}

export async function getFeedFollow(userId: string, feedId: string) {
  const [result] = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(
      and(eq(feed_follows.feedId, feedId), eq(feed_follows.userId, userId)),
    );
  return result;
}

export async function getFeedFollowsForUser(userId: string) {
  const result = await db
    .select({
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.userId, userId));
  return result;
}
