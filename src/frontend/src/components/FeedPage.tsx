import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronRight,
  Heart,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Send,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import type { Comment, Post, UserProfile } from "../store/localStore";
import {
  addComment,
  createPost,
  formatRelativeTime,
  getPosts,
  getProfile,
  toggleLike,
} from "../store/localStore";

interface FeedPageProps {
  posts: Post[];
  profiles: Record<string, UserProfile>;
  myProfile: UserProfile;
  onPostCreated: (posts: Post[]) => void;
  onPostsUpdated: (posts: Post[]) => void;
  onNavigateToMessages: (principal: string) => void;
  myPrincipal: string;
}

interface PostComposerProps {
  myProfile: UserProfile;
  onPost: (content: string, imageUrl?: string) => void;
}

function PostComposer({ myProfile, onPost }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const initials = myProfile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePost = useCallback(async () => {
    if (!content.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 300));
    onPost(content);
    setContent("");
    setPosting(false);
  }, [content, onPost]);

  return (
    <div className="gradient-border rounded-2xl mb-4">
      <div className="bg-card rounded-2xl p-4 glow-card">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={myProfile.avatarUrl} />
            <AvatarFallback
              className="text-xs font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                color: "white",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              data-ocid="feed.textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handlePost();
              }}
              placeholder={`What's on your mind, ${myProfile.displayName.split(" ")[0]}?`}
              rows={2}
              className="bg-secondary/40 border-border focus:border-primary/50 resize-none text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                  title="Add image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  {content.length}/500
                </span>
              </div>
              <Button
                data-ocid="feed.submit_button"
                onClick={handlePost}
                disabled={!content.trim() || posting}
                size="sm"
                className="btn-gradient text-white border-0 font-semibold rounded-full px-5"
              >
                {posting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Share
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({
  post,
  profiles,
  myPrincipal,
  onLike,
  onCommentAdded,
  onNavigateToMessages,
  index,
}: {
  post: Post;
  profiles: Record<string, UserProfile>;
  myPrincipal: string;
  onLike: (postId: string) => void;
  onCommentAdded: (postId: string, comment: string) => void;
  onNavigateToMessages: (principal: string) => void;
  index: number;
}) {
  const author = profiles[post.authorPrincipal];
  const hasLiked = post.likes.includes(myPrincipal);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const initials = author
    ? author.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const renderContent = (text: string) => {
    return text.split(/(#\w+)/g).map((part, i) =>
      part.startsWith("#") ? (
        <span
          key={part + String(i)}
          style={{ color: "var(--aurora-cyan)" }}
          className="font-medium"
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      data-ocid={`feed.post.item.${index + 1}`}
      className="gradient-border rounded-2xl glow-card glow-card-hover transition-all duration-300"
    >
      <div className="bg-card rounded-2xl p-4">
        {/* Author */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={author?.avatarUrl} />
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                    color: "white",
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card"
                style={{ background: "oklch(0.7 0.2 165)" }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {author?.displayName ?? "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
              </p>
            </div>
          </div>
          {post.authorPrincipal !== myPrincipal && (
            <button
              type="button"
              onClick={() => onNavigateToMessages(post.authorPrincipal)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              Message
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-foreground leading-relaxed mb-3">
          {renderContent(post.content)}
        </p>

        {/* Post image */}
        {post.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-3">
            <img
              src={post.imageUrl}
              alt="Post content"
              className="w-full object-cover max-h-64"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
          <button
            type="button"
            data-ocid={`feed.post.toggle.${index + 1}`}
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${
              hasLiked
                ? "text-red-400"
                : "text-muted-foreground hover:text-red-400"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                hasLiked ? "fill-current scale-110" : ""
              }`}
            />
            {post.likes.length}
          </button>
          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            {post.comments.length}
          </button>
        </div>

        {/* Comments */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                {post.comments.map((comment) => {
                  const commentAuthor = profiles[comment.authorPrincipal];
                  const cInitials = commentAuthor
                    ? commentAuthor.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?";
                  return (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="w-6 h-6 flex-shrink-0">
                        <AvatarImage src={commentAuthor?.avatarUrl} />
                        <AvatarFallback
                          className="text-[9px] font-bold"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                            color: "white",
                          }}
                        >
                          {cInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-secondary/40 rounded-xl px-3 py-1.5 flex-1">
                        <span className="text-xs font-semibold text-foreground mr-2">
                          {commentAuthor?.displayName ?? "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.content}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-2 pt-1">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentText.trim()) {
                        onCommentAdded(post.id, commentText);
                        setCommentText("");
                      }
                    }}
                    placeholder="Write a comment..."
                    className="flex-1 bg-secondary/40 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (commentText.trim()) {
                        onCommentAdded(post.id, commentText);
                        setCommentText("");
                      }
                    }}
                    className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function FeedPage({
  posts,
  profiles,
  myProfile,
  onPostCreated,
  onPostsUpdated,
  onNavigateToMessages,
  myPrincipal,
}: FeedPageProps) {
  const [displayCount, setDisplayCount] = useState(6);

  const trendingHashtags = Array.from(
    posts
      .flatMap((p) => p.hashtags)
      .reduce((acc, tag) => {
        acc.set(tag, (acc.get(tag) ?? 0) + 1);
        return acc;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const recentConversationUsers = Array.from(
    new Set(
      posts
        .filter((p) => p.authorPrincipal !== myPrincipal)
        .slice(0, 3)
        .map((p) => p.authorPrincipal),
    ),
  );

  const handlePost = useCallback(
    (content: string) => {
      createPost(myPrincipal, content);
      onPostCreated(getPosts());
    },
    [myPrincipal, onPostCreated],
  );

  const handleLike = useCallback(
    (postId: string) => {
      const updated = toggleLike(postId, myPrincipal);
      onPostsUpdated(updated);
    },
    [myPrincipal, onPostsUpdated],
  );

  const handleComment = useCallback(
    (postId: string, comment: string) => {
      const updated = addComment(postId, myPrincipal, comment);
      onPostsUpdated(updated);
    },
    [myPrincipal, onPostsUpdated],
  );

  return (
    <div className="aurora-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero heading */}
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-1">
            Home Feed
          </p>
          <h1
            className="font-display text-4xl md:text-5xl font-extrabold leading-tight"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.95 0.02 270), oklch(0.75 0.22 300), oklch(0.8 0.18 195))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connect. Share. Shine.
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main feed - 2 cols */}
          <div className="lg:col-span-2">
            <PostComposer myProfile={myProfile} onPost={handlePost} />

            {posts.length === 0 ? (
              <div
                data-ocid="feed.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No posts yet</p>
                <p className="text-sm">Be the first to share something!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.slice(0, displayCount).map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    profiles={profiles}
                    myPrincipal={myPrincipal}
                    onLike={handleLike}
                    onCommentAdded={handleComment}
                    onNavigateToMessages={onNavigateToMessages}
                    index={i}
                  />
                ))}
                {displayCount < posts.length && (
                  <div className="flex justify-center pt-2">
                    <Button
                      data-ocid="feed.pagination_next"
                      variant="outline"
                      onClick={() => setDisplayCount((c) => c + 6)}
                      className="rounded-full border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                    >
                      Show More Posts
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - 1 col */}
          <aside className="space-y-4">
            {/* Suggested connections */}
            <div className="gradient-border rounded-2xl">
              <div className="bg-card rounded-2xl p-4 glow-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare
                    className="w-4 h-4"
                    style={{ color: "var(--aurora-cyan)" }}
                  />
                  Active Members
                </h3>
                <div className="space-y-3">
                  {recentConversationUsers.map((principal) => {
                    const p = profiles[principal];
                    if (!p) return null;
                    const initials = p.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={principal}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={p.avatarUrl} />
                              <AvatarFallback
                                className="text-[10px] font-bold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                                  color: "white",
                                }}
                              >
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-card"
                              style={{ background: "oklch(0.7 0.2 165)" }}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              {p.displayName}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-32">
                              {p.bio.slice(0, 30)}...
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onNavigateToMessages(principal)}
                          className="text-[10px] px-2 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                        >
                          Message
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trending */}
            <div className="gradient-border rounded-2xl">
              <div className="bg-card rounded-2xl p-4 glow-card">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: "var(--aurora-purple)" }}
                  />
                  Trending Topics
                </h3>
                {trendingHashtags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No trending topics yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {trendingHashtags.map(([tag, count], i) => (
                      <div
                        key={tag}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">
                            {i + 1}.
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--aurora-cyan)" }}
                          >
                            {tag}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {count} post{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
