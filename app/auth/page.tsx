"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setMessage(
        "Account created. Check your email to confirm your address, then sign in."
      );
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] px-6 py-16 text-[#111]">
      <div className="mx-auto max-w-md">
        <div className="mb-10">
          <a href="/" className="inline-flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111] text-sm font-bold text-white">
              L
            </span>
            <span className="text-lg font-bold tracking-tight">LayoffOS</span>
          </a>
        </div>

        <div className="rounded-3xl border border-[#deded7] bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#77776f]">
              Your recovery workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "signin"
                ? "Welcome back."
                : "Create your account."}
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#66665f]">
              {mode === "signin"
                ? "Sign in to continue your recovery plan."
                : "Save your recovery plan and access it across devices."}
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[#f3f3ef] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "signin"
                  ? "bg-white text-[#111] shadow-sm"
                  : "text-[#666]"
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setMessage("");
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mode === "signup"
                  ? "bg-white text-[#111] shadow-sm"
                  : "text-[#666]"
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full rounded-xl border border-[#d8d8d1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#111]"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-[#d8d8d1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#111]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                className="w-full rounded-xl border border-[#d8d8d1] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#111]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-[#e0c3be] bg-[#fbefed] px-4 py-3 text-sm leading-5 text-[#75463f]">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-[#cddbcf] bg-[#f0f7f1] px-4 py-3 text-sm leading-5 text-[#3f6547]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#111] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign in →"
                  : "Create account →"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-[#888880]">
            Your recovery data will be stored securely with your account.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[#77776f]">
          <a href="/" className="font-semibold text-[#111] hover:underline">
            ← Back to LayoffOS
          </a>
        </p>
      </div>
    </main>
  );
}
