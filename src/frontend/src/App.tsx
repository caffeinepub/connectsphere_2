import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthPage } from "./components/AuthPage";
import { ExplorePage } from "./components/ExplorePage";
import { FeedPage } from "./components/FeedPage";
import { Layout } from "./components/Layout";
import { MessagesPage } from "./components/MessagesPage";
import { ProfilePage } from "./components/ProfilePage";
import { ProfileSetup } from "./components/ProfileSetup";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  type Post,
  type UserProfile,
  getAllUserProfiles,
  getPosts,
  getProfile,
  seedSampleData,
} from "./store/localStore";

type Page = "feed" | "messages" | "explore" | "profile";

// Seed once on app load
seedSampleData();

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  const [currentPage, setCurrentPage] = useState<Page>("feed");
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingMessageRecipient, setPendingMessageRecipient] = useState<
    string | null
  >(null);

  const principal = identity?.getPrincipal().toString();

  // Load data once identity is known
  useEffect(() => {
    if (!principal) {
      setMyProfile(null);
      setPosts([]);
      setProfiles({});
      return;
    }

    const profile = getProfile(principal);
    setMyProfile(profile);

    const allPosts = getPosts();
    setPosts(allPosts);

    const allProfiles = getAllUserProfiles();
    const profileMap: Record<string, UserProfile> = {};
    for (const p of allProfiles) {
      profileMap[p.principal] = p;
    }
    setProfiles(profileMap);
  }, [principal]);

  const handleProfileComplete = useCallback((profile: UserProfile) => {
    setMyProfile(profile);
    setProfiles((prev) => ({ ...prev, [profile.principal]: profile }));
    toast.success(`Welcome to ConnectSphere, ${profile.displayName}! 🎉`);
  }, []);

  const handleProfileUpdated = useCallback((profile: UserProfile) => {
    setMyProfile(profile);
    setProfiles((prev) => ({ ...prev, [profile.principal]: profile }));
    toast.success("Profile updated!");
  }, []);

  const handlePostCreated = useCallback((updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    toast.success("Post shared with the community!");
  }, []);

  const handlePostsUpdated = useCallback((updatedPosts: Post[]) => {
    setPosts(updatedPosts);
  }, []);

  const handleNavigateToMessages = useCallback((recipientPrincipal: string) => {
    setPendingMessageRecipient(recipientPrincipal);
    setCurrentPage("messages");
  }, []);

  const handleClearRecipient = useCallback(() => {
    setPendingMessageRecipient(null);
  }, []);

  const notificationCount = 0; // Placeholder for unread messages

  // Reload profiles whenever we go to explore/messages
  useEffect(() => {
    if (currentPage === "explore" || currentPage === "messages") {
      const allProfiles = getAllUserProfiles();
      const profileMap: Record<string, UserProfile> = {};
      for (const p of allProfiles) {
        profileMap[p.principal] = p;
      }
      setProfiles(profileMap);
    }
    if (currentPage === "feed" || currentPage === "profile") {
      setPosts(getPosts());
    }
  }, [currentPage]);

  // Loading state
  if (isInitializing) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 animate-pulse"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
            }}
          />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!identity) {
    return (
      <>
        <AuthPage />
        <Toaster />
      </>
    );
  }

  // Logged in but no profile
  if (!myProfile && principal) {
    return (
      <>
        <ProfileSetup
          principal={principal}
          onComplete={handleProfileComplete}
        />
        <Toaster />
      </>
    );
  }

  if (!myProfile || !principal) return null;

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        profile={myProfile}
        notificationCount={notificationCount}
        onStartPost={() => {
          setCurrentPage("feed");
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      >
        {currentPage === "feed" && (
          <FeedPage
            posts={posts}
            profiles={profiles}
            myProfile={myProfile}
            onPostCreated={handlePostCreated}
            onPostsUpdated={handlePostsUpdated}
            onNavigateToMessages={handleNavigateToMessages}
            myPrincipal={principal}
          />
        )}
        {currentPage === "messages" && (
          <MessagesPage
            myPrincipal={principal}
            profiles={profiles}
            initialRecipient={pendingMessageRecipient}
            onClearRecipient={handleClearRecipient}
          />
        )}
        {currentPage === "explore" && (
          <ExplorePage
            profiles={profiles}
            myPrincipal={principal}
            onNavigateToMessages={handleNavigateToMessages}
          />
        )}
        {currentPage === "profile" && (
          <ProfilePage
            profile={myProfile}
            posts={posts}
            onProfileUpdated={handleProfileUpdated}
            myPrincipal={principal}
          />
        )}
      </Layout>
      <Toaster richColors />
    </>
  );
}
