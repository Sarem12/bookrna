"use client";

import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="w-full max-w-5xl">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
