"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Stage =
  | "Recruiter Screen"
  | "Interview"
  | "Final"
  | "Offer"
  | "Accepted"
  | "Rejected"
  | "Withdrawn";

type Interview = {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  interviewDate: string;
  interviewer: string;
  nextAction: string;
  followUpDate: string;
  compensation: string;
  decisionDate: string;
  notes: string;
};

const STORAGE_KEY = "layoffos-interviews";

const stages: Stage[] = [
  "Recruiter Screen",
  "Interview",
  "Final",
  "Offer",
  "Accepted",
  "Rejected",
  "Withdrawn",
];

const defaultForm: Omit<Interview, "id"> = {
  company: "",
  role: "",
  stage: "Recruiter Screen",
  interviewDate: "",
  interviewer: "",
  nextAction: "",
  followUpDate: "",
  compensation: "",
  decisionDate: "",
  notes: "",
};

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isPast(value: string) {
  if (!value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${value}T00:00:00`);

  return date < today;
}

function isUpcoming(value: string) {
  if (!value) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(`${value}T00:00:00`);

  return date >= today;
}

function stageClass(stage: Stage) {
  if (stage === "Offer" || stage === "Accepted") {
    return "bg-[#e9f4eb] text-[#315c38]";
  }

  if (stage === "Final") {
    return "bg-[#f2eee2] text-[#6b5b2c]";
  }

  if (stage === "Rejected" || stage === "Withdrawn") {
    return "bg-[#f4e9e7] text-[#75463f]";
  }

  return "bg-[#eeeeeb] text-[#55554f]";
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setInterviews(JSON.parse(saved));
      }
    } catch {
      setInterviews([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
  }, [interviews, hydrated]);

  const stats = useMemo(() => {
    const active = interviews.filter(
      (item) =>
        item.stage !== "Rejected" &&
        item.stage !== "Withdrawn" &&
        item.stage !== "Accepted"
    ).length;

    const finals = interviews.filter((item) => item.stage === "Final").length;

    const offers = interviews.filter(
      (item) => item.stage === "Offer" || item.stage === "Accepted"
    ).length;

    const pendingFollowUps = interviews.filter(
      (item) =>
        item.followUpDate &&
        isPast(item.followUpDate) &&
        item.stage !== "Rejected" &&
        item.stage !== "Withdrawn" &&
        item.stage !== "Accepted"
    ).length;

    return {
      total: interviews.length,
      active,
      finals,
      offers,
      pendingFollowUps,
    };
  }, [interviews]);

  const upcoming = useMemo(() => {
    return [...interviews]
      .filter(
        (item) =>
          isUpcoming(item.interviewDate) &&
          item.stage !== "Rejected" &&
          item.stage !== "Withdrawn" &&
          item.stage !== "Accepted"
      )
      .sort(
        (a, b) =>
          new Date(`${a.interviewDate}T00:00:00`).getTime() -
          new Date(`${b.interviewDate}T00:00:00`).getTime()
      );
  }, [interviews]);

  function updateForm(field: keyof typeof defaultForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function saveInterview() {
    if (!form.company.trim() || !form.role.trim()) return;

    if (editingId) {
      setInterviews((current) =>
        current.map((item) =>
          item.id === editingId
            ? {
                ...form,
                id: editingId,
              }
            : item
        )
      );
    } else {
      setInterviews((current) => [
        {
          ...form,
          id: crypto.randomUUID(),
        },
        ...current,
      ]);
    }

    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  function editInterview(item: Interview) {
    setForm({
      company: item.company,
      role: item.role,
      stage: item.stage,
      interviewDate: item.interviewDate,
      interviewer: item.interviewer,
      nextAction: item.nextAction,
      followUpDate: item.followUpDate,
      compensation: item.compensation,
      decisionDate: item.decisionDate,
      notes: item.notes,
    });

    setEditingId(item.id);
    setShowForm(true);
  }

  function deleteInterview(id: string) {
    setInterviews((current) => current.filter((item) => item.id !== id));
  }

  function updateStage(id: string, stage: Stage) {
    setInterviews((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              stage,
            }
          : item
      )
    );
  }

  function cancelForm() {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            LayoffOS
          </Link>

          <Link
            href="/dashboard"
            className="rounded-full border border-[#d8d8d2] bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-[#f0f0ec]"
          >
            Dashboard
          </Link>
        </header>

        <section className="mb-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#77776f]">
            Interviews & Offers OS
          </p>

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-bold tracking-[-0.04em] md:text-6xl">
                Don&apos;t lose momentum
                <br />
                between interviews.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#72726b]">
                Keep every interview, follow-up, final round, and offer in one
                place. Know what happened, what comes next, and where you stand.
              </p>
            </div>

            <button
              onClick={() => {
                setForm(defaultForm);
                setEditingId(null);
                setShowForm(true);
              }}
              style={{ color: "#fff", backgroundColor: "#111" }}
              className="shrink-0 rounded-xl px-6 py-3.5 text-sm font-bold transition hover:opacity-90"
            >
              + Add interview
            </button>
          </div>
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-5">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Finals" value={stats.finals} />
          <StatCard label="Offers" value={stats.offers} />
          <StatCard
            label="Follow-ups due"
            value={stats.pendingFollowUps}
            alert={stats.pendingFollowUps > 0}
          />
        </section>

        {showForm && (
          <section className="mb-10 rounded-3xl border border-[#dcdcd6] bg-white p-7 md:p-9">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                  {editingId ? "Edit record" : "New record"}
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  {editingId ? "Update interview" : "Add an interview"}
                </h2>
              </div>

              <button
                onClick={cancelForm}
                className="text-sm font-semibold text-[#77776f] hover:text-[#111]"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Company *"
                value={form.company}
                onChange={(value) => updateForm("company", value)}
                placeholder="Acme Inc."
              />

              <Field
                label="Role *"
                value={form.role}
                onChange={(value) => updateForm("role", value)}
                placeholder="Growth Marketing Manager"
              />

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Stage
                </label>

                <select
                  value={form.stage}
                  onChange={(e) =>
                    updateForm("stage", e.target.value as Stage)
                  }
                  className="w-full rounded-xl border border-[#d8d8d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#111]"
                >
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <Field
                label="Interview date"
                type="date"
                value={form.interviewDate}
                onChange={(value) => updateForm("interviewDate", value)}
              />

              <Field
                label="Interviewer"
                value={form.interviewer}
                onChange={(value) => updateForm("interviewer", value)}
                placeholder="Name / title"
              />

              <Field
                label="Follow-up date"
                type="date"
                value={form.followUpDate}
                onChange={(value) => updateForm("followUpDate", value)}
              />

              <Field
                label="Next action"
                value={form.nextAction}
                onChange={(value) => updateForm("nextAction", value)}
                placeholder="Send thank-you note"
              />

              <Field
                label="Compensation"
                value={form.compensation}
                onChange={(value) => updateForm("compensation", value)}
                placeholder="₹18–22 LPA"
              />

              <Field
                label="Decision deadline"
                type="date"
                value={form.decisionDate}
                onChange={(value) => updateForm("decisionDate", value)}
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Preparation / notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="Interview notes, questions, preparation, feedback..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#d8d8d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#111]"
                />
              </div>
            </div>

            <button
              onClick={saveInterview}
              style={{ color: "#fff", backgroundColor: "#111" }}
              className="mt-6 rounded-xl px-6 py-3 text-sm font-bold"
            >
              {editingId ? "Save changes" : "Add interview"}
            </button>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-10">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
                Coming up
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight">
                Your next conversations
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {upcoming.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#deded8] bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{item.company}</h3>
                      <p className="mt-1 text-sm text-[#77776f]">
                        {item.role}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${stageClass(
                        item.stage
                      )}`}
                    >
                      {item.stage}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#999990]">
                        Date
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatDate(item.interviewDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#999990]">
                        Interviewer
                      </p>
                      <p className="mt-1 font-semibold">
                        {item.interviewer || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-3xl border border-[#deded8] bg-white">
          <div className="border-b border-[#e4e4df] px-6 py-6 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#888880]">
              Interview pipeline
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Every conversation, one place.
            </h2>
          </div>

          {interviews.length === 0 ? (
            <div className="px-6 py-16 text-center md:px-8">
              <div className="mx-auto max-w-md">
                <div className="text-4xl">◎</div>

                <h3 className="mt-4 text-xl font-bold">
                  No interviews tracked yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-[#77776f]">
                  Add your first interview or final round. Once your pipeline
                  grows, this becomes your command center for follow-ups and
                  offers.
                </p>

                <button
                  onClick={() => {
                    setForm(defaultForm);
                    setEditingId(null);
                    setShowForm(true);
                  }}
                  style={{ color: "#fff", backgroundColor: "#111" }}
                  className="mt-6 rounded-xl px-5 py-3 text-sm font-bold"
                >
                  + Add your first interview
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#e7e7e2]">
              {interviews.map((item) => (
                <article key={item.id} className="p-6 md:p-8">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-bold">{item.company}</h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${stageClass(
                            item.stage
                          )}`}
                        >
                          {item.stage}
                        </span>
                      </div>

                      <p className="mt-1 font-medium text-[#55554f]">
                        {item.role}
                      </p>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Info label="Interview" value={formatDate(item.interviewDate)} />
                        <Info
                          label="Interviewer"
                          value={item.interviewer || "—"}
                        />
                        <Info
                          label="Follow-up"
                          value={formatDate(item.followUpDate)}
                          alert={
                            !!item.followUpDate &&
                            isPast(item.followUpDate) &&
                            item.stage !== "Rejected" &&
                            item.stage !== "Withdrawn" &&
                            item.stage !== "Accepted"
                          }
                        />
                        <Info
                          label="Compensation"
                          value={item.compensation || "—"}
                        />
                      </div>

                      {item.nextAction && (
                        <div className="mt-5 rounded-xl bg-[#f5f5f1] px-4 py-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#999990]">
                            Next action
                          </span>

                          <p className="mt-1 text-sm font-semibold">
                            → {item.nextAction}
                          </p>
                        </div>
                      )}

                      {item.notes && (
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#77776f]">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 xl:w-48 xl:flex-col">
                      <select
                        value={item.stage}
                        onChange={(e) =>
                          updateStage(item.id, e.target.value as Stage)
                        }
                        className="rounded-lg border border-[#d8d8d2] bg-white px-3 py-2 text-xs font-semibold outline-none"
                      >
                        {stages.map((stage) => (
                          <option key={stage}>{stage}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => editInterview(item)}
                        className="rounded-lg border border-[#d8d8d2] bg-white px-3 py-2 text-xs font-semibold hover:bg-[#f5f5f1]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteInterview(item.id)}
                        className="rounded-lg border border-[#e4d4d1] px-3 py-2 text-xs font-semibold text-[#75463f] hover:bg-[#faf2f0]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-3xl bg-[#111] p-8 text-white md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#999]">
            Keep the loop closed
          </p>

          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            An interview is not finished when the call ends.
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-[#b8b8b8]">
            Track the next action, follow up when you said you would, and keep
            the entire opportunity connected to the rest of your recovery
            system.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/job-search"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#111] hover:bg-[#e8e8e5]"
            >
              Job Search OS →
            </Link>

            <Link
              href="/networking"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d1d1d]"
            >
              Networking OS
            </Link>

            <Link
              href="/companies"
              className="rounded-xl border border-[#444] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d1d1d]"
            >
              Target Companies
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

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#deded8] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#888880]">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-bold tracking-tight ${
          alert ? "text-[#75463f]" : "text-[#111]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#d8d8d2] bg-white px-4 py-3 text-sm outline-none focus:border-[#111]"
      />
    </div>
  );
}

function Info({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#999990]">{label}</p>

      <p
        className={`mt-1 text-sm font-semibold ${
          alert ? "text-[#75463f]" : "text-[#33332f]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
