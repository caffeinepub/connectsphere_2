// Local data store using localStorage for user profiles, posts, messages

export interface UserProfile {
  principal: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  location: string;
  interests: string[];
  joinedAt: string;
}

export interface Post {
  id: string;
  authorPrincipal: string;
  content: string;
  imageUrl?: string;
  hashtags: string[];
  likes: string[]; // principals who liked
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  authorPrincipal: string;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  fromPrincipal: string;
  toPrincipal: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  otherPrincipal: string;
  messages: Message[];
  lastMessage?: Message;
}

const PROFILES_KEY = "cs_profiles";
const POSTS_KEY = "cs_posts";
const MESSAGES_KEY = "cs_messages";

// --------------- Profiles ---------------
export function getProfiles(): Record<string, UserProfile> {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getProfile(principal: string): UserProfile | null {
  return getProfiles()[principal] ?? null;
}

export function saveProfile(profile: UserProfile): void {
  const all = getProfiles();
  all[profile.principal] = profile;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(all));
}

export function getAllUserProfiles(): UserProfile[] {
  return Object.values(getProfiles());
}

// --------------- Posts ---------------
export function getPosts(): Post[] {
  try {
    return JSON.parse(localStorage.getItem(POSTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function savePosts(posts: Post[]): void {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function createPost(
  authorPrincipal: string,
  content: string,
  imageUrl?: string,
): Post {
  const hashtags = (content.match(/#\w+/g) ?? []).map((h) => h.toLowerCase());
  const post: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    authorPrincipal,
    content,
    imageUrl,
    hashtags,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };
  const posts = getPosts();
  savePosts([post, ...posts]);
  return post;
}

export function toggleLike(postId: string, principal: string): Post[] {
  const posts = getPosts().map((p) => {
    if (p.id !== postId) return p;
    const hasLiked = p.likes.includes(principal);
    return {
      ...p,
      likes: hasLiked
        ? p.likes.filter((l) => l !== principal)
        : [...p.likes, principal],
    };
  });
  savePosts(posts);
  return posts;
}

export function addComment(
  postId: string,
  authorPrincipal: string,
  content: string,
): Post[] {
  const comment: Comment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    authorPrincipal,
    content,
    createdAt: new Date().toISOString(),
  };
  const posts = getPosts().map((p) => {
    if (p.id !== postId) return p;
    return { ...p, comments: [...p.comments, comment] };
  });
  savePosts(posts);
  return posts;
}

// --------------- Messages ---------------
export function getMessages(): Message[] {
  try {
    return JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function sendMessage(
  fromPrincipal: string,
  toPrincipal: string,
  content: string,
): Message[] {
  const msg: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fromPrincipal,
    toPrincipal,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const msgs = [...getMessages(), msg];
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
  return msgs;
}

export function getConversations(myPrincipal: string): Conversation[] {
  const messages = getMessages();
  const conversationMap = new Map<string, Message[]>();

  for (const msg of messages) {
    if (msg.fromPrincipal === myPrincipal || msg.toPrincipal === myPrincipal) {
      const other =
        msg.fromPrincipal === myPrincipal ? msg.toPrincipal : msg.fromPrincipal;
      const existing = conversationMap.get(other) ?? [];
      conversationMap.set(other, [...existing, msg]);
    }
  }

  return Array.from(conversationMap.entries()).map(([otherPrincipal, msgs]) => {
    const sorted = msgs.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    return {
      otherPrincipal,
      messages: sorted,
      lastMessage: sorted[sorted.length - 1],
    };
  });
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Seed sample data if no data exists
export function seedSampleData(): void {
  const existingProfiles = getProfiles();
  if (Object.keys(existingProfiles).length > 0) return;

  const samplePrincipal1 = "sample-user-aurora-7f4k9";
  const samplePrincipal2 = "sample-user-nova-2m8x3";
  const samplePrincipal3 = "sample-user-echo-5p1q7";
  const samplePrincipal4 = "sample-user-zenith-3r6w2";

  const profiles: UserProfile[] = [
    {
      principal: samplePrincipal1,
      displayName: "Aurora Chen",
      bio: "Digital artist & UI/UX designer. Building beautiful things on Web3. Coffee lover ☕",
      location: "San Francisco, CA",
      interests: ["Design", "Web3", "Art", "Photography"],
      joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      principal: samplePrincipal2,
      displayName: "Nova Williams",
      bio: "Full-stack developer. Open source enthusiast. Building the decentralized future.",
      location: "Berlin, Germany",
      interests: ["Coding", "Open Source", "Music", "Travel"],
      joinedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      principal: samplePrincipal3,
      displayName: "Echo Martinez",
      bio: "Blockchain researcher & writer. Exploring the intersection of technology and society.",
      location: "Madrid, Spain",
      interests: ["Blockchain", "Writing", "Philosophy", "Science"],
      joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      principal: samplePrincipal4,
      displayName: "Zenith Okafor",
      bio: "Product manager turned entrepreneur. Always shipping. Sometimes sleeping.",
      location: "Lagos, Nigeria",
      interests: ["Startups", "Product", "Fitness", "Gaming"],
      joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  for (const p of profiles) saveProfile(p);

  const posts: Post[] = [
    {
      id: "post_sample_1",
      authorPrincipal: samplePrincipal1,
      content:
        "Just launched my new NFT collection on the Internet Computer! Each piece captures the spirit of the decentralized web. Check it out 🎨 #NFT #DigitalArt #ICP #Web3",
      hashtags: ["#nft", "#digitalart", "#icp", "#web3"],
      likes: [samplePrincipal2, samplePrincipal3, samplePrincipal4],
      comments: [
        {
          id: "cmt_1",
          authorPrincipal: samplePrincipal2,
          content: "This is incredible work! Love the color palette 🔥",
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post_sample_2",
      authorPrincipal: samplePrincipal2,
      content:
        "The Internet Computer is genuinely impressive tech. Smart contracts that serve web content directly? Mind blown. Been building for 3 months now. #ICP #BuildingOnChain #Motoko",
      hashtags: ["#icp", "#buildingonchain", "#motoko"],
      likes: [samplePrincipal1, samplePrincipal4],
      comments: [
        {
          id: "cmt_2",
          authorPrincipal: samplePrincipal3,
          content:
            "Totally agree! The scalability is what gets me. Traditional L1s can't compete.",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post_sample_3",
      authorPrincipal: samplePrincipal3,
      content:
        "Fascinating paper on cryptographic identity systems. We're moving toward a world where your online identity is truly yours — no central authority required. This is the future. #Identity #Cryptography #Privacy",
      hashtags: ["#identity", "#cryptography", "#privacy"],
      likes: [samplePrincipal1, samplePrincipal2, samplePrincipal4],
      comments: [],
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post_sample_4",
      authorPrincipal: samplePrincipal4,
      content:
        "Shipped 3 features today. The grind never stops but neither does the satisfaction 💪 Reminder: progress > perfection. Keep building. #Startup #ProductManagement #Shipping",
      hashtags: ["#startup", "#productmanagement", "#shipping"],
      likes: [samplePrincipal2],
      comments: [
        {
          id: "cmt_3",
          authorPrincipal: samplePrincipal1,
          content: "Congrats! What features? Would love to see 👀",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post_sample_5",
      authorPrincipal: samplePrincipal1,
      content:
        "Morning sketch session 🌅 There's something magical about creating art when the world is quiet. #Art #Morning #Creative #Design",
      hashtags: ["#art", "#morning", "#creative", "#design"],
      likes: [samplePrincipal3],
      comments: [],
      createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "post_sample_6",
      authorPrincipal: samplePrincipal2,
      content:
        "Hot take: The best code is the code you don't write. Simplicity is the ultimate sophistication. #Programming #SoftwareEngineering #CleanCode",
      hashtags: ["#programming", "#softwareengineering", "#cleancode"],
      likes: [samplePrincipal1, samplePrincipal3, samplePrincipal4],
      comments: [],
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
  ];

  savePosts(posts);
}
