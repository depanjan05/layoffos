"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const STORAGE_KEYS = [
  "layoffos-recovery",
  "layoffos-completed-tasks",
  "layoffos-72-hours",
  "layoffos-applications",
  "layoffos-companies",
  "layoffos-interviews",
  "layoffos-weekly-plan",
];

const KEY_LABELS: Record<string, string> = {
  "layoffos-recovery": "Recovery profile",
  "layoffos-completed-tasks": "Dashboard tasks",
  "layoffos-72-hours": "First 72 Hours",
  "layoffos-applications": "Job Search",
  "layoffos-companies": "Target Companies",
  "layoffos-interviews": "Interviews & Offers",
  "layoffos-weekly-plan": "Recovery Plan",
};

type Backup = {
  app: string;
  version: number;
  exportedAt: string;
  data: Record<string, unknown>;
};

export default function DataPage() {
  const [storedKeys, setStoredKeys] = useState<string[]>([]);
  const [lastBackup, setLastBackup] = useState<string>("");
  const [message, setMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  function refreshStorage() {
    const found = STORAGE_KEYS.filter(
      (key) => localStorage.getItem(key) !== null
    );

    setStoredKeys(found);
  }

  useEffect(() => {
    refreshStorage();

    const savedBackup = localStorage.getItem("layoffos-last-backup");

    if (savedBackup) {
      setLastBackup(savedBackup);
    }

    setHydrated(true);
  }, []);

  const storageCount = storedKeys.length;

  const progress = useMemo(
    () => Math.round((storageCount / STORAGE_KEYS.length) * 100),
    [storageCount]
  );

  function exportData() {
    const data: Record<string, unknown> = {};

    STORAGE_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);

      if (value !== null) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    const backup: Backup = {
      app: "LayoffOS",
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `layoffos-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);

    const timestamp = new Date().toISOString();

    localStorage.setItem("layoffos-last-backup", timestamp);
    setLastBackup(timestamp);
    setMessage("Backup exported successfully.");
  }

  function importData(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Backup;

        if (
          !parsed ||
          parsed.app !== "LayoffOS" ||
          !parsed.data ||
          typeof parsed.data !== "object"
        ) {
          throw new Error("Invalid LayoffOS backup.");
        }

        Object.entries(parsed.data).forEach(([key, value]) => {
          if (!STORAGE_KEYS.includes(key)) return;

          localStorage.setItem(key, JSON.stringify(value));
        });

        refreshStorage();

        setMessage(
          "Backup restored. Refreshing LayoffOS with your restored data..."
        );

        setTimeout(() => {
          window.location.reload();
        }, 900);
      } catch {
        setMessage(
          "That file could not be restored. Please choose a valid LayoffOS backup."
        );
      }
    };

    reader.readAsText(file);
  }

  function resetEverything() {
    const confirmed = window.confirm(
      "This will permanently remove all LayoffOS data stored in this browser. Continue?"
    );

    if (!confirmed) return;

    STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });

    localStorage.removeItem("layoffos-last-backup");

    refreshStorage();
    setLastBackup("");
    setMessage("All LayoffOS browser data has been reset.");
  }

  function formatBackupDate(value: string) {
    if (!value) return "";

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-sm text-[#77776f]">
            Loading your data settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <header className="mb-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LayoffOS
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-[#d8d8d2] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-[#f0f0ec]"
          >
            Dashboard
          </Link>
        </header>

        <section className="mb-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#77776f]">
            Data & Backup
          </p>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-0.045em] md:text-6xl">
            Your recovery data
            <br />
            belongs to you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#72726b]">
            Export everything from LayoffOS into one file. Keep a backup,
            move to another browser, or restore your recovery system later.
          </p>
        </section>

        {message && (
          <div className="mb-8 rounded-2xl border border-[#d8d8d2] bg-white px-5 py-4 text-sm font-semibold">
            {message}
          </div>
        )}

        <section className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl bg-[#111] p-7 text-white md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999]">
              Your LayoffOS data
            </p>

            <p className="mt-4 text-6xl font-bold tracking-[-0.06em]">
              {storageCount}
              <span className="text-2xl text-[#777]">
                /{STORAGE_KEYS.length}
              </span>
            </p>

            <p className="mt-3 text-sm text-[#aaa]">
              data areas currently stored in this browser
            </p>

            <div className="mt-7 h-2 overflow-hidden rounded-full bg-[#333]">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
              />
            </div>

            {lastBackup && (
              <p className="mt-5 text-xs text-[#999]">
                Last backup: {formatBackupDate(lastBackup)}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-[#deded8] bg-white p-7 md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
              Backup
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Keep a copy of your system.
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#77776f]">
              Your backup contains your LayoffOS data, not passwords or
              anything outside this application.
            </p>

            <button
              onClick={exportData}
              style={{ color: "#fff", backgroundColor: "#111" }}
              className="mt-6 rounded-xl px-6 py-3 text-sm font-bold"
            >
              ↓ Export LayoffOS backup
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-[#deded8] bg-white p-7 md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
            Stored locally
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            What&apos;s currently in your system
          </h2>

          <div className="mt-6 divide-y divide-[#e7e7e2]">
            {STORAGE_KEYS.map((key) => {
              const exists = storedKeys.includes(key);

              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-semibold">{KEY_LABELS[key]}</p>
                    <p className="mt-1 text-xs text-[#999990]">{key}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      exists
                        ? "bg-[#e9f4eb] text-[#315c38]"
                        : "bg-[#eeeeeb] text-[#77776f]"
                    }`}
                  >
                    {exists ? "Stored" : "Empty"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-[#deded8] bg-white p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
              Restore
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Restore from a backup
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#77776f]">
              Select a LayoffOS JSON backup. Your existing LayoffOS data for
              matching areas will be replaced.
            </p>

            <label
              htmlFor="backup-upload"
              className="mt-5 inline-block cursor-pointer rounded-xl border border-[#d8d8d2] px-5 py-3 text-sm font-bold hover:bg-[#f5f5f1]"
            >
              ↑ Choose backup file
            </label>

            <input
              id="backup-upload"
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  importData(file);
                }

                event.target.value = "";
              }}
            />
          </div>

          <div className="rounded-3xl border border-[#ead8d4] bg-[#fffaf8] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a6d65]">
              Danger zone
            </p>

            <h2 className="mt-2 text-xl font-bold">
              Reset LayoffOS
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#77776f]">
              Remove all LayoffOS data from this browser. Export a backup first
              if you may want to restore it later.
            </p>

            <button
              onClick={resetEverything}
              className="mt-5 rounded-xl border border-[#d9bcb6] px-5 py-3 text-sm font-bold text-[#75463f] hover:bg-[#fff0ec]"
            >
              Reset all data
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-[#111] p-8 text-white md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999]">
            One principle
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Your recovery shouldn&apos;t depend on one browser.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-[#b8b8b8]">
            LayoffOS currently stores your information locally on your device.
            Backing it up gives you control while we build the next layer of
            the product.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#111] hover:bg-[#e8e8e5]"
            >
              Back to Dashboard →
            </Link>

            <Link
              href="/plan"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d1d1d]"
            >
              Open Recovery Plan
            </Link>
          </div>
        </section>

        <footer className="py-12 text-center text-sm text-[#999990]">
          LayoffOS · A practical recovery system for your next move.
        </footer>
      </div>
    </main>
  );
}
