"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gender } from "@prisma/client";
import { ChevronLeft, ChevronRight, Plus, UserRound, X } from "lucide-react";
import { generateSignupTagsAction, signupAction } from "@/lib/service/admin/auth";
import { authUtils } from "@/lib/localdata";

type SignupStep = "details" | "bio" | "tags" | "summary";

function StepAside({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-8 text-center lg:px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--surface)] text-[var(--foreground)]">
        <UserRound className="h-7 w-7" />
      </div>
      <h2 className="font-ui mt-5 text-2xl text-[var(--foreground)]">{title}</h2>
      <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function FieldRow({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <span className="font-ui w-full text-base text-[var(--foreground)] lg:w-44">{label}</span>
      <div className="flex-1">{children}</div>
    </label>
  );
}

const inputClassName =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-4 py-3 text-[15px] text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--border-strong)]";

export default function SignupForm() {
  const [step, setStep] = useState<SignupStep>("details");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("12");
  const [gender, setGender] = useState<Gender>("MALE");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const summaryLines = useMemo(
    () => [
      { label: "Name", value: `${first || "-"} ${last || ""}`.trim() || "-" },
      { label: "Username", value: username ? `@${username}` : "-" },
      { label: "Email", value: email || "-" },
      { label: "Age", value: age || "-" },
      { label: "Gender", value: gender === "FEMALE" ? "Female" : "Male" }
    ],
    [age, email, first, gender, last, username]
  );

  const addTag = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setTags((current) => (current.includes(normalized) ? current : [...current, normalized].slice(0, 12)));
    setNewTag("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
  };

  const validateDetails = () => {
    if (!first.trim() || !last.trim() || !username.trim() || !email.trim() || !password || !age.trim()) {
      setError("Fill in all the account details first.");
      return false;
    }
    setError("");
    return true;
  };

  const validateBio = () => {
    if (!bio.trim()) {
      setError("Describe yourself before continuing.");
      return false;
    }
    setError("");
    return true;
  };

  const goToTagsStep = async () => {
    if (!validateBio()) {
      return;
    }

    setError("");
    setIsGeneratingTags(true);

    try {
      const result = await generateSignupTagsAction(bio);
      if (result?.error) {
        setError(result.error);
        return;
      }

      setTags(result?.tags ?? []);
      setStep("tags");
    } catch (e) {
      console.error(e);
      setError("Unable to generate tags right now.");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDetails() || !validateBio()) {
      return;
    }

    setIsPending(true);
    setError("");

    try {
      const result = await signupAction({
        first,
        last,
        username,
        email,
        password,
        age: Number(age),
        gender,
        bio,
        selectedTags: tags
      });

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
      setError("Unable to create account right now.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleCreateAccount} className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-[0_20px_48px_rgba(0,0,0,0.12)]">
      <div className="grid lg:grid-cols-[360px_1fr]">
        <div className="border-b border-[var(--border)] bg-[var(--surface-elevated)] lg:border-b-0 lg:border-r">
          <StepAside
            title={
              step === "details"
                ? "Tell us about yourself"
                : step === "bio"
                  ? "Describe what you like"
                  : step === "tags"
                    ? "Review your tags"
                    : "Summary"
            }
            description={
              step === "details"
                ? "Start with your basic account details."
                : step === "bio"
                  ? "Write about the things you enjoy and how you like learning."
                  : step === "tags"
                    ? "Remove or add any tag before creating the account."
                    : "Check everything once before finishing."
            }
          />
        </div>

        <div className="bg-[var(--surface)] px-4 py-5 sm:px-6 sm:py-6">
          <div className="rounded-2xl bg-[var(--surface-elevated)] px-4 py-6 sm:px-6 lg:min-h-[540px]">
            {step === "details" && (
              <div className="space-y-4">
                <FieldRow label="First name">
                  <input value={first} onChange={(e) => setFirst(e.target.value)} className={inputClassName} />
                </FieldRow>
                <FieldRow label="Last name">
                  <input value={last} onChange={(e) => setLast(e.target.value)} className={inputClassName} />
                </FieldRow>
                <FieldRow label="Username">
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputClassName} />
                </FieldRow>
                <FieldRow label="Email">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClassName} />
                </FieldRow>
                <FieldRow label="Password">
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClassName} />
                </FieldRow>
                <FieldRow label="Age">
                  <input type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} className={inputClassName} />
                </FieldRow>
                <FieldRow label="Gender">
                  <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputClassName}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </FieldRow>
              </div>
            )}

            {step === "bio" && (
              <div className="space-y-4">
                <div className="font-ui text-xl text-[var(--foreground)]">Describe yourself</div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={10}
                  placeholder="e.g. I like video games, coding, movies, science experiments, and clear visual explanations."
                  className={`${inputClassName} min-h-[320px] resize-none py-4`}
                />
              </div>
            )}

            {step === "tags" && (
              <div className="space-y-5">
                <div className="font-ui text-xl text-[var(--foreground)]">Remove or add any tag</div>
                <div className="flex min-h-[320px] flex-wrap content-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--button-bg)] px-4 py-2 text-sm font-medium"
                      style={{ color: "var(--button-fg)" }}
                    >
                      <span>{tag}</span>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10">
                        <X className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}

                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm text-[var(--foreground)]">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(newTag);
                        }
                      }}
                      placeholder="Add new"
                      className="w-28 bg-transparent outline-none placeholder:text-[var(--muted)]"
                    />
                    <button
                      type="button"
                      onClick={() => addTag(newTag)}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--foreground)]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-[var(--muted)]">
                  These tags will be saved to your profile and used for personalized content generation.
                </p>
              </div>
            )}

            {step === "summary" && (
              <div className="space-y-5">
                <div className="font-ui text-xl text-[var(--foreground)]">Summary</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {summaryLines.map((item) => (
                    <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{item.label}</div>
                      <div className="mt-1 text-sm text-[var(--foreground)]">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Description</div>
                  <div className="mt-2 text-sm leading-7 text-[var(--foreground)]">{bio}</div>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Tags</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-fg)]">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="text-sm text-[var(--muted)]">
                <Link href="/login" className="transition hover:text-[var(--foreground)]">
                  Already have an account?
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {step !== "details" && (
                  <button
                    type="button"
                    onClick={() =>
                      setStep((current) =>
                        current === "bio"
                          ? "details"
                          : current === "tags"
                            ? "bio"
                            : "tags"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-elevated)]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}

                {step === "details" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateDetails()) setStep("bio");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                    style={{ backgroundColor: "var(--button-bg)", color: "var(--button-fg)" }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {step === "bio" && (
                  <button
                    type="button"
                    onClick={goToTagsStep}
                    disabled={isGeneratingTags}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-70"
                    style={{ backgroundColor: "var(--button-bg)", color: "var(--button-fg)" }}
                  >
                    {isGeneratingTags ? "Generating tags..." : "Next"}
                    {!isGeneratingTags && <ChevronRight className="h-4 w-4" />}
                  </button>
                )}

                {step === "tags" && (
                  <button
                    type="button"
                    onClick={() => setStep("summary")}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                    style={{ backgroundColor: "var(--button-bg)", color: "var(--button-fg)" }}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}

                {step === "summary" && (
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-70"
                    style={{ backgroundColor: "var(--button-bg)", color: "var(--button-fg)" }}
                  >
                    {isPending ? "Creating account..." : "Create account"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
