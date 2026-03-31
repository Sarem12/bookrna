"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Lock, UserCircle2 } from "lucide-react";
import { loginAction } from "@/lib/service/admin/auth";
import { authUtils } from "@/lib/localdata";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setError("");
    setIsPending(true);

    try {
      const result = await loginAction(username.trim(), password);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (!result?.userId) {
        setError("Invalid response from server.");
        return;
      }

      authUtils.saveId(result.userId);
      window.location.assign("/");
    } catch (err) {
      console.error(err);
      setError("Unable to sign in right now.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
      <div className="border-b border-[var(--border)] px-6 py-6 sm:px-8 sm:py-7">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)]">
          <BookOpen className="h-5 w-5" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--foreground)]">Sign in</h1>
        <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
          Continue to Bekam.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8 sm:py-7">
        <div className="space-y-5">
          <div>
            <label htmlFor="username" className="mb-2.5 block text-sm font-medium text-[var(--foreground)]">
              Username
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 focus-within:border-[var(--border-strong)]">
              <UserCircle2 className="h-5 w-5 text-[var(--muted)]" />
              <input
                id="username"
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-2.5 block text-sm font-medium text-[var(--foreground)]">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 focus-within:border-[var(--border-strong)]">
              <Lock className="h-5 w-5 text-[var(--muted)]" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-fg)]">
              {error}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-7 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-elevated)] disabled:text-[var(--muted)]"
          style={{
            backgroundColor: "var(--button-bg)",
            color: "var(--button-fg)"
          }}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-4 text-center text-sm text-[var(--muted)]">
          <Link href="/signup" className="transition hover:text-[var(--foreground)]">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
