"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Flag, Lightbulb, MoreVertical, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { authUtils } from "@/lib/localdata";
import { Analogy } from "./Analogy";

type ParagraphProps = {
  paragraph: {
    id: string;
    content: string;
  };
};

function LoadingDots({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 text-sm text-[var(--muted)]">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:240ms]" />
      </div>
    </div>
  );
}

export function Paragraph({ paragraph }: ParagraphProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAnalogy, setGeneratedAnalogy] = useState<any | null>(null);
  const [analogyOnUse, setAnalogyOnUse] = useState(false);
  const [userStatus, setUserStatus] = useState<"liked" | "disliked" | "neutral">("neutral");
  const [isFlagged, setIsFlagged] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isRegeneratingParagraph, setIsRegeneratingParagraph] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>(paragraph.content || "");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  useEffect(() => {
    setCurrentContent(paragraph.content || "");
  }, [paragraph.content]);

  const parseJsonResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Response JSON parse failed:", text, error);
      return { error: "Invalid JSON response" };
    }
  };

  const handleGenerateAnalogy = async () => {
    const userId = authUtils.getId();
    if (!userId) {
      setFeedbackMessage("Sign in to generate an analogy.");
      setShowMenu(false);
      return;
    }

    setShowMenu(false);
    setIsGenerating(true);
    setGeneratedAnalogy(null);
    setAnalogyOnUse(false);
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/paragraph/generate-analogy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, paragraphId: paragraph.id })
      });
      const result = await parseJsonResponse(response);

      if (!response.ok || !result || result?.error) {
        console.error(result?.error || "Failed to generate analogy");
        setFeedbackMessage("Unable to generate analogy right now.");
        return;
      }

      setGeneratedAnalogy({ ...result, activeInSlots: { onuse: true } });
      setAnalogyOnUse(true);
    } catch (error) {
      console.error("Generate Analogy error", error);
      setFeedbackMessage("Unable to generate analogy right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  const sendParagraphAction = async (action: "like" | "dislike" | "flag" | "change") => {
    const userId = authUtils.getId();
    if (!userId) {
      setFeedbackMessage("Sign in to perform this action.");
      setShowMenu(false);
      return;
    }

    if (action === "change") {
      setIsRegeneratingParagraph(true);
      setGeneratedAnalogy(null);
      setAnalogyOnUse(false);
      setFeedbackMessage(null);
    }

    setLoadingAction(true);
    try {
      const path = action === "change" ? "/api/paragraph/change" : `/api/paragraph/${action}`;
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, realParagraphId: paragraph.id })
      });
      const result = await parseJsonResponse(response);
      if (!response.ok || !result || result?.error) {
        const errorMessage = result?.error || "Paragraph action failed";
        console.error(errorMessage);
        setFeedbackMessage("Action failed.");
        return;
      }

      if (action === "change") {
        if (typeof result.content === "string") {
          setCurrentContent(result.content);
        }
      } else if (action === "flag") {
        setIsFlagged(Boolean(result.flagged));
      } else if (action === "like" || action === "dislike") {
        setUserStatus(result.newStatus ?? "neutral");
      }
    } catch (error) {
      console.error("Paragraph action error", error);
      setFeedbackMessage("Action failed.");
    } finally {
      setLoadingAction(false);
      setShowMenu(false);
      if (action === "change") {
        setIsRegeneratingParagraph(false);
      }
    }
  };

  return (
    <div className="relative text-[var(--foreground)]">
      {isRegeneratingParagraph ? (
        <LoadingDots label="Regenerating paragraph" />
      ) : (
        <div className="text-base leading-7 text-[var(--foreground)]">
          <ReactMarkdown>{currentContent}</ReactMarkdown>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((open) => !open)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-elevated)]"
            aria-label="Paragraph menu"
          >
            <MoreVertical className="h-4 w-4 text-[var(--muted)]" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-left text-sm text-[var(--foreground)] shadow-xl">
                <button
                  type="button"
                  onClick={() => sendParagraphAction("like")}
                  disabled={loadingAction}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${userStatus === "liked" ? "text-emerald-500" : "hover:bg-[var(--surface-elevated)]"} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Like
                </button>
                <button
                  type="button"
                  onClick={() => sendParagraphAction("dislike")}
                  disabled={loadingAction}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${userStatus === "disliked" ? "text-rose-500" : "hover:bg-[var(--surface-elevated)]"} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Dislike
                </button>
                <button
                  type="button"
                  onClick={() => sendParagraphAction("flag")}
                  disabled={loadingAction}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition ${isFlagged ? "text-amber-500" : "hover:bg-[var(--surface-elevated)]"} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <Flag className="h-4 w-4" />
                  Flag
                </button>
                <button
                  type="button"
                  onClick={() => sendParagraphAction("change")}
                  disabled={loadingAction || isRegeneratingParagraph}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </button>
                <div className="my-1 border-t border-[var(--border)]" />
                <button
                  type="button"
                  onClick={handleGenerateAnalogy}
                  disabled={isGenerating}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  {isGenerating ? "Generating..." : "Generate Analogy"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {feedbackMessage && <div className="mt-2 text-xs text-[var(--muted)]">{feedbackMessage}</div>}

      {isFlagged && <div className="mt-3 text-xs text-[var(--muted)]">Paragraph flagged.</div>}

      {isGenerating ? (
        <div className="mt-4">
          <LoadingDots label="Generating analogy" />
        </div>
      ) : generatedAnalogy && analogyOnUse ? (
        <div className="mt-4">
          <Analogy analogy={generatedAnalogy} />
        </div>
      ) : null}
    </div>
  );
}
