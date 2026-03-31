"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import { Flag, Lightbulb, MoreVertical, RefreshCw, Trash2, ThumbsDown, ThumbsUp } from "lucide-react";
import { Analogy as Analogytype, User, UserAnalogy } from "@prisma/client";
import { authUtils } from "@/lib/localdata";

type AnalogyProps = {
  analogy?: Analogytype & { userActions?: UserAnalogy[] };
  user?: User;
  text?: string;
};

function LoadingDots({ label }: { label: string }) {
  return (
    <div className="rounded-b-lg px-6 py-4 text-sm text-[var(--muted)]">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:240ms]" />
      </div>
    </div>
  );
}

export function Analogy({ analogy, text }: AnalogyProps) {
  const currentUserId = authUtils.getId();
  const initialStatus = analogy?.userActions?.[0]?.status ?? "neutral";
  const initialFlagged = analogy?.userActions?.[0]?.flaged ?? false;
  const initialOnUse = analogy?.userActions?.[0]?.onuse ?? true;

  const [currentAnalogy, setCurrentAnalogy] = useState(analogy);
  const [showMenu, setShowMenu] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number } | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [changeStatus, setChangeStatus] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<"liked" | "disliked" | "neutral">(initialStatus);
  const [isFlagged, setIsFlagged] = useState(initialFlagged);
  const [isOnUse, setIsOnUse] = useState(initialOnUse);
  const [loadingAction, setLoadingAction] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setCurrentAnalogy(analogy);
    setUserStatus(initialStatus);
    setIsFlagged(initialFlagged);
    setIsOnUse(initialOnUse);
  }, [analogy, initialStatus, initialFlagged, initialOnUse]);

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

  const sendAction = async (action: "like" | "dislike" | "flag") => {
    if (!currentAnalogy?.id || !currentUserId) return null;
    setLoadingAction(true);
    const previousStatus = userStatus;
    const previousFlagged = isFlagged;

    if (action === "like") {
      setUserStatus((current) => (current === "liked" ? "neutral" : "liked"));
    }

    if (action === "dislike") {
      setUserStatus((current) => (current === "disliked" ? "neutral" : "disliked"));
    }

    try {
      const response = await fetch(`/api/analogy/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, analogyId: currentAnalogy.id })
      });

      const result = await parseJsonResponse(response);
      if (!response.ok || !result || result?.error) {
        console.error(result?.error || "Analogy action failed");
        setUserStatus(previousStatus);
        setIsFlagged(previousFlagged);
        return null;
      }

      if (action === "flag") {
        setIsFlagged(Boolean(result.flagged));
        setChangeStatus(null);
        return result;
      }

      const newStatus = result.newStatus as "liked" | "disliked" | "neutral";
      setUserStatus(newStatus);
      return result;
    } catch (error) {
      console.error("Analogy action error", error);
      setUserStatus(previousStatus);
      setIsFlagged(previousFlagged);
      return null;
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentAnalogy?.defaultAnalogyId || !currentUserId) return;
    setShowMenu(false);
    setIsChanging(true);
    setChangeStatus(null);

    try {
      const response = await fetch("/api/analogy/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, defaultAnalogyId: currentAnalogy.defaultAnalogyId })
      });
      const result = await parseJsonResponse(response);

      if (!response.ok || !result || result?.error) {
        const message = result?.error || "Unable to regenerate analogy right now.";
        console.error(message);
        setChangeStatus(message);
        return;
      }

      setCurrentAnalogy((prev) => ({ ...(prev ?? {}), ...result } as any));
      setUserStatus(result.userActions?.[0]?.status ?? "neutral");
      setIsFlagged(result.userActions?.[0]?.flaged ?? false);
      setIsOnUse(result.userActions?.[0]?.onuse ?? true);
    } catch (error) {
      console.error("Change analogy error", error);
      setChangeStatus("Unable to regenerate analogy right now.");
    } finally {
      setIsChanging(false);
    }
  };

  const handleFlagAndRegenerate = async () => {
    if (!currentAnalogy?.defaultAnalogyId || !currentAnalogy?.id || !currentUserId) return;
    setShowMenu(false);
    setLoadingAction(true);

    try {
      const flagResult = await sendAction("flag");
      if (flagResult?.flagged) {
        await handleRegenerate();
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAnalogy?.id || !currentUserId) return;
    setShowMenu(false);
    setLoadingAction(true);

    try {
      const response = await fetch("/api/analogy/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, analogyId: currentAnalogy.id })
      });

      const result = await response.json();
      if (!response.ok || result?.error) {
        console.error(result?.error || "Remove analogy failed");
        setChangeStatus("Unable to remove analogy.");
        return;
      }

      setIsOnUse(false);
      setChangeStatus(null);
    } catch (error) {
      console.error("Remove analogy error", error);
      setChangeStatus("Unable to remove analogy.");
    } finally {
      setLoadingAction(false);
    }
  };

  const content = currentAnalogy?.content ?? text ?? "";

  const toggleMenu = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 208;
      const menuHeight = 260;
      let left = rect.left;
      const rightAlignedLeft = rect.right - menuWidth;

      if (left + menuWidth > window.innerWidth - 12) {
        left = Math.max(12, rightAlignedLeft);
      }
      if (left < 12) {
        left = 12;
      }

      let top = rect.bottom + 8;
      if (top + menuHeight > window.innerHeight - 12) {
        top = rect.top - menuHeight - 8;
      }
      if (top < 12) {
        top = 12;
      }

      setMenuCoords({ top, left });
    }
    setShowMenu((prev) => !prev);
  };

  const renderMenuPortal = () => {
    if (!showMenu || !menuCoords) return null;

    return createPortal(
      <>
        <div className="fixed inset-0 z-9998" onClick={() => setShowMenu(false)} />
        <div
          style={{ top: menuCoords.top, left: menuCoords.left }}
          className="fixed z-9999 w-52 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-2xl"
        >
          <div className="mb-1 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
            Actions
          </div>
          <MenuOption
            icon={<ThumbsUp size={14} className={userStatus === "liked" ? "fill-current text-emerald-500" : "text-[var(--muted)]"} />}
            label={userStatus === "liked" ? "Remove Like" : "Like"}
            onClick={() => {
              void sendAction("like");
              setShowMenu(false);
            }}
          />
          <MenuOption
            icon={<ThumbsDown size={14} className={userStatus === "disliked" ? "fill-current text-rose-500" : "text-[var(--muted)]"} />}
            label={userStatus === "disliked" ? "Remove Dislike" : "Dislike"}
            onClick={() => {
              void sendAction("dislike");
              setShowMenu(false);
            }}
          />
          <MenuOption icon={<Flag size={14} />} label={isFlagged ? "Flagged" : "Flag and regenerate"} onClick={handleFlagAndRegenerate} />
          <MenuOption icon={<RefreshCw size={14} />} label="Regenerate" onClick={handleRegenerate} />
          <div className="my-1 border-t border-[var(--border)]" />
          <MenuOption
            icon={<Trash2 size={14} />}
            label="Remove Analogy"
            className="text-rose-500 hover:bg-[var(--surface-elevated)]"
            onClick={handleRemove}
          />
        </div>
      </>,
      document.body
    );
  };

  if (!isOnUse && currentAnalogy?.id) return null;

  return (
    <div className={`relative my-6 ml-4 w-fit min-w-[320px] max-w-[95%] rounded-lg border border-amber-500/25 bg-[var(--surface)] shadow-sm ${showMenu ? "z-60" : "z-10"}`}>
      <div className="flex items-center rounded-t-lg border-b border-amber-500/20 bg-amber-500/10 px-4 py-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h4 className="flex-1 text-center text-[12px] font-medium uppercase tracking-[0.2em] text-amber-500">Analogy</h4>

        <div className="relative">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            className="flex h-6 w-6 items-center justify-center rounded-full text-amber-500 transition-all hover:bg-amber-500/10 active:scale-90"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {renderMenuPortal()}
        </div>
      </div>

      {isChanging ? (
        <LoadingDots label="Regenerating analogy" />
      ) : (
        <div className="rounded-b-lg px-6 py-4 text-[13px] leading-relaxed text-[var(--foreground)]">
          <ReactMarkdown>{content}</ReactMarkdown>
          {changeStatus && <div className="mt-2 text-xs text-[var(--muted)]">{changeStatus}</div>}
          {isFlagged && <div className="mt-4 text-[12px] text-amber-500">This analogy has been flagged.</div>}
        </div>
      )}
    </div>
  );
}

function MenuOption({ icon, label, onClick, className = "" }: { icon: any; label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[11px] font-medium text-[var(--foreground)] transition-all hover:bg-[var(--surface-elevated)] ${className}`}
    >
      <span className="opacity-70 group-hover:opacity-100">{icon}</span>
      {label}
    </button>
  );
}
