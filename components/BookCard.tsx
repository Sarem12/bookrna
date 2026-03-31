"use client";

import { useState } from "react";
import Link from "next/link";
import { Image } from "lucide-react";

interface BookCardProps {
  title: string;
  grade: number | string;
  imageUrl: string;
  subject: string;
  id: string;
}

export const BookCard = ({ title, grade, imageUrl, subject, id }: BookCardProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const normalizedImageUrl = imageUrl?.trim();
  const isPlaceholderImageUrl =
    !normalizedImageUrl ||
    normalizedImageUrl === "null" ||
    normalizedImageUrl === "undefined" ||
    normalizedImageUrl.includes("example.com");
  const showImage = Boolean(
    normalizedImageUrl &&
      !isPlaceholderImageUrl &&
      !hasImageError
  );

  return (
    <Link href={`/book/${id}`} className="group block w-full max-w-[360px]">
      <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] transition duration-200 hover:border-[var(--border-strong)] hover:bg-[var(--surface-elevated)]">
        <div className="relative h-52 overflow-hidden border-b border-[var(--border)] bg-[var(--surface-elevated)]">
          {showImage ? (
            <img
              src={normalizedImageUrl}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              onError={() => setHasImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
              <Image className="h-14 w-14" strokeWidth={1.8} />
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full border border-black/10 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            Grade {grade}
          </div>
        </div>

        <div className="space-y-2 px-5 py-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{subject}</p>
          <h3 className="font-ui text-xl text-[var(--foreground)]">{title}</h3>
        </div>
      </div>
    </Link>
  );
};
