import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Compass, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { UserProfile } from "../store/localStore";

interface ExplorePageProps {
  profiles: Record<string, UserProfile>;
  myPrincipal: string;
  onNavigateToMessages: (principal: string) => void;
}

export function ExplorePage({
  profiles,
  myPrincipal,
  onNavigateToMessages,
}: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allProfiles = Object.values(profiles).filter(
    (p) => p.principal !== myPrincipal,
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allProfiles;
    const q = searchQuery.toLowerCase();
    return allProfiles.filter(
      (p) =>
        p.displayName.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q) ||
        p.interests.some((i) => i.toLowerCase().includes(q)) ||
        p.location?.toLowerCase().includes(q),
    );
  }, [allProfiles, searchQuery]);

  return (
    <div className="aurora-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-1">
            Discover
          </p>
          <h1 className="font-display text-4xl font-extrabold text-foreground mb-2">
            Explore People
          </h1>
          <p className="text-muted-foreground text-sm">
            Find and connect with interesting people in the ConnectSphere
            community
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-ocid="explore.search_input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, interests, or location..."
            className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
            {searchQuery && " found"}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div
            data-ocid="explore.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <Compass className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No members found</p>
            <p className="text-sm">
              {searchQuery ? "Try a different search" : "Be the first to join!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((profile, i) => {
              const initials = profile.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              return (
                <motion.div
                  key={profile.principal}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  data-ocid={`explore.user.item.${i + 1}`}
                  className="gradient-border rounded-2xl glow-card glow-card-hover transition-all duration-300"
                >
                  <div className="bg-card rounded-2xl p-5">
                    {/* Avatar + name */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile.avatarUrl} />
                          <AvatarFallback
                            className="text-sm font-bold"
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
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card"
                          style={{ background: "oklch(0.7 0.2 165)" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">
                          {profile.displayName}
                        </p>
                        {profile.location && (
                          <p className="text-xs text-muted-foreground">
                            📍 {profile.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Interests */}
                    {profile.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {profile.interests.slice(0, 4).map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                          >
                            {interest}
                          </Badge>
                        ))}
                        {profile.interests.length > 4 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-2 py-0.5 bg-secondary text-muted-foreground"
                          >
                            +{profile.interests.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Message button */}
                    <button
                      type="button"
                      data-ocid={`explore.message.button.${i + 1}`}
                      onClick={() => onNavigateToMessages(profile.principal)}
                      className="w-full py-2 rounded-xl text-xs font-semibold btn-gradient text-white transition-all"
                    >
                      Send Message
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
