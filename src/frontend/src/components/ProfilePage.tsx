import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Camera,
  Check,
  Edit3,
  Loader2,
  MapPin,
  Plus,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import type { Post, UserProfile } from "../store/localStore";
import { formatRelativeTime, saveProfile } from "../store/localStore";

interface ProfilePageProps {
  profile: UserProfile;
  posts: Post[];
  onProfileUpdated: (profile: UserProfile) => void;
  myPrincipal: string;
}

export function ProfilePage({
  profile,
  posts,
  onProfileUpdated,
  myPrincipal,
}: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editDisplayName, setEditDisplayName] = useState(profile.displayName);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editInterests, setEditInterests] = useState<string[]>([
    ...profile.interests,
  ]);
  const [newInterest, setNewInterest] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const myPosts = posts.filter((p) => p.authorPrincipal === myPrincipal);

  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const startEditing = useCallback(() => {
    setEditDisplayName(profile.displayName);
    setEditBio(profile.bio);
    setEditLocation(profile.location);
    setEditInterests([...profile.interests]);
    setErrors({});
    setEditing(true);
  }, [profile]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
    setErrors({});
  }, []);

  const handleSave = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!editDisplayName.trim())
      newErrors.displayName = "Display name required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    const updated: UserProfile = {
      ...profile,
      displayName: editDisplayName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      interests: editInterests,
    };
    saveProfile(updated);
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    setEditing(false);
    onProfileUpdated(updated);
  }, [
    profile,
    editDisplayName,
    editBio,
    editLocation,
    editInterests,
    onProfileUpdated,
  ]);

  const toggleInterest = useCallback((interest: string) => {
    setEditInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }, []);

  const addInterest = useCallback(() => {
    const trimmed = newInterest.trim();
    if (trimmed && !editInterests.includes(trimmed)) {
      setEditInterests((prev) => [...prev, trimmed]);
    }
    setNewInterest("");
  }, [newInterest, editInterests]);

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadingAvatar(true);
      try {
        // Use blob URL as avatar for now (StorageClient requires full setup)
        const objectUrl = URL.createObjectURL(file);
        const updated: UserProfile = { ...profile, avatarUrl: objectUrl };
        saveProfile(updated);
        onProfileUpdated(updated);
      } catch (err) {
        console.error("Avatar upload failed:", err);
      } finally {
        setUploadingAvatar(false);
      }
    },
    [profile, onProfileUpdated],
  );

  return (
    <div className="aurora-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <div className="gradient-border rounded-2xl mb-6">
          <div className="bg-card rounded-2xl p-6 glow-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback
                    className="text-2xl font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                      color: "white",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  data-ocid="profile.upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                  }}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <Input
                        data-ocid="profile.edit.input"
                        value={editDisplayName}
                        onChange={(e) => {
                          setEditDisplayName(e.target.value);
                          setErrors((prev) => ({ ...prev, displayName: "" }));
                        }}
                        className="bg-secondary/50 border-border font-semibold text-lg h-9"
                        placeholder="Display name"
                      />
                      {errors.displayName && (
                        <p
                          data-ocid="profile.edit.error_state"
                          className="text-xs text-red-400 mt-0.5"
                        >
                          {errors.displayName}
                        </p>
                      )}
                    </div>
                    <Textarea
                      data-ocid="profile.edit.textarea"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Your bio..."
                      rows={2}
                      className="bg-secondary/50 border-border resize-none text-sm"
                    />
                    <Input
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location"
                      className="bg-secondary/50 border-border text-sm h-8"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-foreground">
                      {profile.displayName}
                    </h2>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {profile.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined{" "}
                        {new Date(profile.joinedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Edit button */}
              {editing ? (
                <div className="flex gap-2">
                  <Button
                    data-ocid="profile.cancel_button"
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    className="border-border h-8"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    data-ocid="profile.save_button"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-gradient text-white border-0 h-8"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  data-ocid="profile.edit_button"
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  className="border-border hover:border-primary/50 h-8"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>

            {/* Interests */}
            {editing ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {editInterests.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                    >
                      {interest} <X className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInterest()}
                    placeholder="Add interest..."
                    className="bg-secondary/50 border-border text-sm h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addInterest}
                    className="border-border h-8"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {profile.interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              )
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  {myPosts.length}
                </p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  {myPosts.reduce((acc, p) => acc + p.likes.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Likes received</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">
                  {myPosts.reduce((acc, p) => acc + p.comments.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Posts */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            My Posts
            <span className="text-xs text-muted-foreground">
              ({myPosts.length})
            </span>
          </h3>
          {myPosts.length === 0 ? (
            <div
              data-ocid="profile.posts.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <p className="font-medium">No posts yet</p>
              <p className="text-sm">Share something with the community!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  data-ocid={`profile.post.item.${i + 1}`}
                  className="gradient-border rounded-xl glow-card"
                >
                  <div className="bg-card rounded-xl p-4">
                    <p className="text-sm text-foreground leading-relaxed mb-3 line-clamp-4">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>♥ {post.likes.length}</span>
                        <span>💬 {post.comments.length}</span>
                      </div>
                      <span>{formatRelativeTime(post.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
