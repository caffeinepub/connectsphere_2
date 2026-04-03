import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Sparkles, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { type UserProfile, saveProfile } from "../store/localStore";

const SUGGESTED_INTERESTS = [
  "Design",
  "Coding",
  "Music",
  "Photography",
  "Travel",
  "Art",
  "Science",
  "Gaming",
  "Writing",
  "Fitness",
  "Web3",
  "Blockchain",
  "AI",
  "Open Source",
  "Startups",
  "Philosophy",
];

interface ProfileSetupProps {
  principal: string;
  onComplete: (profile: UserProfile) => void;
}

export function ProfileSetup({ principal, onComplete }: ProfileSetupProps) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleInterest = useCallback((interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }, []);

  const addCustomInterest = useCallback(() => {
    const trimmed = customInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
    }
    setCustomInterest("");
  }, [customInterest, interests]);

  const handleSubmit = useCallback(async () => {
    const newErrors: Record<string, string> = {};
    if (!displayName.trim()) newErrors.displayName = "Display name is required";
    if (displayName.trim().length > 50)
      newErrors.displayName = "Max 50 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    const profile: UserProfile = {
      principal,
      displayName: displayName.trim(),
      bio: bio.trim(),
      location: location.trim(),
      interests,
      joinedAt: new Date().toISOString(),
    };
    saveProfile(profile);
    // Tiny delay for UX
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    onComplete(profile);
  }, [principal, displayName, bio, location, interests, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen aurora-bg flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles
              className="w-6 h-6 text-aurora-purple"
              style={{ color: "var(--aurora-purple)" }}
            />
            <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
              Welcome to ConnectSphere
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Set Up Your Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Tell the world a little about yourself
          </p>
        </div>

        {/* Form Card */}
        <div className="gradient-border rounded-2xl">
          <div className="bg-card rounded-2xl p-6 space-y-5 glow-card">
            {/* Display Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-display-name"
                className="text-sm font-medium text-foreground"
              >
                Display Name <span className="text-red-400">*</span>
              </label>
              <Input
                id="profile-display-name"
                data-ocid="profile.input"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setErrors((prev) => ({ ...prev, displayName: "" }));
                }}
                placeholder="How should we call you?"
                className="bg-secondary/50 border-border focus:border-primary"
              />
              {errors.displayName && (
                <p
                  data-ocid="profile.error_state"
                  className="text-xs text-red-400"
                >
                  {errors.displayName}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-bio"
                className="text-sm font-medium text-foreground"
              >
                Bio
              </label>
              <Textarea
                id="profile-bio"
                data-ocid="profile.textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell people what you're about..."
                rows={3}
                className="bg-secondary/50 border-border focus:border-primary resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-location"
                className="text-sm font-medium text-foreground"
              >
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                id="profile-location"
                placeholder="Where are you based?"
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>

            {/* Interests */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Interests</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      interests.includes(interest)
                        ? "bg-primary/20 text-primary border border-primary/50"
                        : "bg-secondary text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {/* Custom interest input */}
              <div className="flex gap-2">
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomInterest()}
                  placeholder="Add custom interest..."
                  className="bg-secondary/50 border-border focus:border-primary text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomInterest}
                  className="border-border hover:border-primary/50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((interest) => (
                    <Badge
                      key={interest}
                      variant="secondary"
                      className="gap-1 pr-1 bg-primary/10 text-primary border-primary/30"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="rounded-full hover:bg-primary/20 p-0.5"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              data-ocid="profile.submit_button"
              onClick={handleSubmit}
              disabled={saving}
              className="w-full btn-gradient text-white font-semibold h-11 rounded-xl border-0"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up your space...
                </>
              ) : (
                "Launch My Profile ✨"
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
