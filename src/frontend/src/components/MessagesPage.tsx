import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Message, UserProfile } from "../store/localStore";
import {
  formatRelativeTime,
  getConversations,
  sendMessage as sendMsg,
} from "../store/localStore";

interface MessagesPageProps {
  myPrincipal: string;
  profiles: Record<string, UserProfile>;
  initialRecipient?: string | null;
  onClearRecipient: () => void;
}

export function MessagesPage({
  myPrincipal,
  profiles,
  initialRecipient,
  onClearRecipient,
}: MessagesPageProps) {
  const [conversations, setConversations] = useState(() =>
    getConversations(myPrincipal),
  );
  const [selectedPrincipal, setSelectedPrincipal] = useState<string | null>(
    initialRecipient ?? null,
  );
  const [messageText, setMessageText] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(!!initialRecipient);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialRecipient) {
      setSelectedPrincipal(initialRecipient);
      setMobileShowChat(true);
    }
  }, [initialRecipient]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional scroll on selection change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedPrincipal]);

  const handleSend = useCallback(() => {
    if (!messageText.trim() || !selectedPrincipal) return;
    sendMsg(myPrincipal, selectedPrincipal, messageText.trim());
    setMessageText("");
    setConversations(getConversations(myPrincipal));
  }, [messageText, selectedPrincipal, myPrincipal]);

  const handleSelectConversation = useCallback(
    (principal: string) => {
      setSelectedPrincipal(principal);
      setMobileShowChat(true);
      onClearRecipient();
    },
    [onClearRecipient],
  );

  const selectedConversation = conversations.find(
    (c) => c.otherPrincipal === selectedPrincipal,
  );

  const selectedProfile = selectedPrincipal
    ? profiles[selectedPrincipal]
    : null;
  const selectedInitials =
    selectedProfile?.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-10rem)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 h-full gradient-border rounded-2xl overflow-hidden">
        {/* Conversations list */}
        <div
          className={`bg-card border-r border-border flex flex-col ${
            mobileShowChat ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare
                className="w-4 h-4"
                style={{ color: "var(--aurora-cyan)" }}
              />
              Messages
            </h2>
          </div>
          <ScrollArea className="flex-1 scrollbar-thin">
            {conversations.length === 0 ? (
              <div
                data-ocid="messages.empty_state"
                className="p-6 text-center text-muted-foreground text-sm"
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No conversations yet.
                <br />
                Start messaging from the Feed!
              </div>
            ) : (
              <div className="p-2">
                {conversations.map(({ otherPrincipal, lastMessage }) => {
                  const p = profiles[otherPrincipal];
                  const initials =
                    p?.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) ?? "?";
                  const isSelected = selectedPrincipal === otherPrincipal;
                  return (
                    <button
                      type="button"
                      key={otherPrincipal}
                      data-ocid="messages.row"
                      onClick={() => handleSelectConversation(otherPrincipal)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                        isSelected
                          ? "bg-primary/10 border border-primary/30"
                          : "hover:bg-secondary/40"
                      }`}
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={p?.avatarUrl} />
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
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-foreground truncate">
                          {p?.displayName ?? "Unknown"}
                        </p>
                        {lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">
                            {lastMessage.fromPrincipal === myPrincipal
                              ? "You: "
                              : ""}
                            {lastMessage.content}
                          </p>
                        )}
                      </div>
                      {lastMessage && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {formatRelativeTime(lastMessage.createdAt)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat view */}
        <div
          className={`md:col-span-2 flex flex-col bg-card ${
            mobileShowChat ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedProfile ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button
                  type="button"
                  className="md:hidden p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setMobileShowChat(false);
                    onClearRecipient();
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedProfile.avatarUrl} />
                  <AvatarFallback
                    className="text-xs font-bold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.52 0.28 300), oklch(0.78 0.2 195))",
                      color: "white",
                    }}
                  >
                    {selectedInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedProfile.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProfile.location || "No location"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4 scrollbar-thin">
                <div className="space-y-3">
                  {!selectedConversation ||
                  selectedConversation.messages.length === 0 ? (
                    <div
                      data-ocid="messages.chat.empty_state"
                      className="text-center text-muted-foreground text-sm py-8"
                    >
                      Start your conversation with {selectedProfile.displayName}
                    </div>
                  ) : (
                    selectedConversation.messages.map((msg) => {
                      const isMine = msg.fromPrincipal === myPrincipal;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          data-ocid="messages.item.1"
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                              isMine
                                ? "rounded-br-sm text-white"
                                : "bg-secondary/60 text-foreground rounded-bl-sm"
                            }`}
                            style={
                              isMine
                                ? {
                                    background:
                                      "linear-gradient(135deg, oklch(0.48 0.25 300), oklch(0.58 0.26 330))",
                                  }
                                : undefined
                            }
                          >
                            <p>{msg.content}</p>
                            <p
                              className={`text-[10px] mt-0.5 ${
                                isMine
                                  ? "text-white/60"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    data-ocid="messages.input"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder={`Message ${selectedProfile.displayName}...`}
                    className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <Button
                    data-ocid="messages.submit_button"
                    onClick={handleSend}
                    disabled={!messageText.trim()}
                    size="sm"
                    className="btn-gradient text-white border-0 rounded-xl w-10 h-10 p-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div
              data-ocid="messages.panel.empty_state"
              className="flex-1 flex items-center justify-center text-muted-foreground text-sm"
            >
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Select a conversation</p>
                <p className="text-xs">Choose from the left panel</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
