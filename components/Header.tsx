"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import { authUtils } from "@/lib/localdata";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    authUtils.clearId();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="flex h-16 w-full items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="block">
          <h1 className="font-brand text-xl tracking-tight text-foreground">Bekam</h1>
        </Link>

        {user && !isAuthPage ? (
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full p-1 transition"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Account menu"
              >
                {user.imgUrl && !hasImageError ? (
                  <img
                    src={user.imgUrl}
                    alt={user.first || user.username || user.email || "Profile"}
                    className="h-10 w-10 rounded-full border border-[var(--border)] object-cover"
                    onError={() => setHasImageError(true)}
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] transition">
                    <UserIcon className="h-4 w-4" />
                  </span>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
                  <div className="border-b border-[var(--border)] px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.imgUrl && !hasImageError ? (
                        <img
                          src={user.imgUrl}
                          alt={user.first || user.username || user.email || "Profile"}
                          className="h-12 w-12 rounded-full border border-[var(--border)] object-cover"
                          onError={() => setHasImageError(true)}
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)]">
                          <UserIcon className="h-5 w-5" />
                        </span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {user.first || user.username}
                        </p>
                        <p className="text-xs text-[var(--muted)]">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 px-2 py-2.5 text-[var(--foreground)]">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-[var(--surface-elevated)]"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-[var(--surface-elevated)]"
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </button>
                    <ThemeToggle variant="menu" className="text-[var(--foreground)]" />
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm transition hover:bg-[var(--surface-elevated)]"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ThemeToggle />
        )}
      </div>
    </header>
  );
}
