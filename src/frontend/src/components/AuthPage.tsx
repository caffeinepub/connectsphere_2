import { Button } from "@/components/ui/button";
import { Globe, Loader2, MessageCircle, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function AuthPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-aurora-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.52 0.28 300), transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-aurora-pulse"
          style={{
            animationDelay: "2s",
            background:
              "radial-gradient(circle, oklch(0.78 0.2 195), transparent)",
          }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-aurora-pulse"
          style={{
            animationDelay: "1s",
            background:
              "radial-gradient(circle, oklch(0.6 0.28 330), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 text-center w-full max-w-xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <img
            src="/assets/generated/connectsphere-logo-transparent.dim_120x120.png"
            alt="ConnectSphere"
            className="w-14 h-14 rounded-2xl"
          />
          <span className="font-display text-3xl font-bold text-foreground">
            ConnectSphere
          </span>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1
            className="font-display text-6xl font-extrabold leading-tight mb-4"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.95 0.02 270), oklch(0.75 0.22 300), oklch(0.8 0.18 195))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connect.
            <br />
            Share. Shine.
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            A public communication platform for the decentralized web. No phone
            number required — just your identity.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="grid grid-cols-2 gap-3 my-8 text-left"
        >
          {[
            {
              icon: Globe,
              label: "Public Feed",
              desc: "Share posts with the world",
            },
            {
              icon: MessageCircle,
              label: "Direct Messages",
              desc: "Private conversations",
            },
            {
              icon: Users,
              label: "Explore People",
              desc: "Discover new connections",
            },
            {
              icon: Zap,
              label: "Your Profile",
              desc: "Own your online identity",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 bg-card/60 rounded-xl p-3 border border-border"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.3), oklch(0.78 0.2 195 / 0.2))",
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: "var(--aurora-cyan)" }}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            data-ocid="auth.primary_button"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="btn-gradient w-full h-13 text-white font-semibold text-base rounded-xl border-0 px-8 py-3"
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isInitializing ? "Initializing..." : "Connecting..."}
              </>
            ) : (
              "Sign In to ConnectSphere"
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Secure, anonymous login via Internet Identity — no email or phone
            required
          </p>
        </motion.div>
      </div>
    </div>
  );
}
