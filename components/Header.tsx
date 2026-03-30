"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authUtils } from "@/lib/localdata";
import { User } from "@prisma/client";
import { Bell, ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authUtils.clearId();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between gap-4 bg-slate-950 px-5 py-4 shadow-lg shadow-slate-950/20">
      <div className="flex items-center gap-3">
       
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Bekam</h1>
        </div>
      </div>

      {user ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full 
             text-slate-100 transition hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full 
               px-3 py-2 text-sm font-medium text-slate-100 transition "
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              {user.imgUrl && !hasImageError ? (
                <img
                  src={user.imgUrl}
                  alt={user.first || user.username || user.email || "Profile"}
                  className="h-10 w-10 rounded-full object-cover hover:bg-slate-700/20"
                  onError={() => setHasImageError(true)}
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-slate-200 hover:bg-slate-600 transition">
                  <UserIcon className="h-5 w-5" />
                </span>
              )}
         
            </button>

            {menuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-xl">
                <div className="border-b border-slate-700 px-4 py-4">
                  <div className="flex items-center gap-3">
                    {user.imgUrl && !hasImageError ? (
                      <img
                        src={user.imgUrl}
                        alt={user.first || user.username || user.email || "Profile"}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={() => setHasImageError(true)}
                      />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                        <UserIcon className="h-6 w-6" />
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {user.first || user.username || user.email || "Account"}
                      </p>
                      <p className="text-xs text-slate-400">Account menu</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 px-2 py-2">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm text-slate-100 transition hover:bg-slate-900"
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
        <div className="text-slate-300">Welcome</div>
      )}
    </header>
  );
}
