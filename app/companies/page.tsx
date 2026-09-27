"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Priority = "High" | "Medium" | "Low";

type Status =
  | "Target"
  | "Researching"
  | "Contacted"
  | "Applied"
  | "Interviewing"
  | "Closed";

type Company = {
  id: string;
  name: string;
  website: string;
  role: string;
  location: string;
  priority: Priority;
  status: Status;
  contact: string;
  nextAction: string;
  dueDate: string;
  notes: string;
};

const STORAGE_KEY = "layoffos-companies";

const priorities: Priority[] = ["High", "Medium", "Low"];

const statuses: Status[] = [
  "Target",
  "Researching",
  "Contacted",
  "Applied",
  "Interviewing",
  "Closed",
];

const emptyForm: Omit<Company, "id"> = {
  name: "",
  website: "",
  role: "",
  location: "",
  priority: "High",
  status: "Target",
  contact: "",
  nextAction: "",
  dueDate: "",
  notes: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCompanies(parsed);
        }
      }
    } catch {
      console.error("Could not load companies");
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  }, [companies, hydrated]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      highPriority: companies.filter((c) => c.priority === "High").length,
      active: companies.filter((c) => c.status !== "Closed").length,
      interviewing: companies.filter(
        (c) => c.status === "Interviewing"
      ).length,
    };
  }, [companies]);

  function startAdding() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEditing(company: Company) {
    const { id, ...companyData } = company;

    setEditingId(id);
    setForm(companyData);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  function saveCompany() {
    if (!form.name.trim() || !form.role.trim()) return;

    if (editingId) {
      setCompanies((current) =>
        current.map((company) =>
          company.id === editingId
            ? {
                ...company,
                ...form,
              }
            : company
        )
      );
    } else {
      const company: Company = {
        id: crypto.randomUUID(),
        ...form,
      };

      setCompanies((current) => [company, ...current]);
    }

    cancelForm();
  }

  function updateCompany(
    id: string,
    field: keyof Company,
    value: string
  ) {
    setCompanies((current) =>
      current.map((company) =>
        company.id === id
          ? { ...company, [field]: value }
          : company
      )
    );
  }

  function deleteCompany(id: string) {
    setCompanies((current) =>
      current.filter((company) => company.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#111]">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <header className="flex h-20 items-center justify-between border-b border-[#deded7]">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#111] text-sm text-white">
              L
            </span>
            <span>LayoffOS</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-[#ccc] bg-white px-4 py-2 text-sm font-semibold"
          >
            ← Dashboard
          </Link>
        </header>

        <section className="py-14">
          <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
            TARGET COMPANIES OS
          </p>

          <div className="mt-5 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-bold tracking-[-0.06em] md:text-7xl">
                Know where you want to go.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#6b6b65]">
                Build a focused list of companies worth your time, then turn
                targets into conversations, applications and opportunities.
              </p>
            </div>

            <button
              onClick={startAdding}
              className="shrink-0 rounded-lg bg-[#111] px-6 py-3 text-sm font-semibold !text-white"
            >
              + Add company
            </button>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-4">
            <Stat label="TARGETS" value={stats.total} />
            <Stat label="HIGH PRIORITY" value={stats.highPriority} />
            <Stat label="ACTIVE" value={stats.active} />
            <Stat label="INTERVIEWING" value={stats.interviewing} />
          </div>

          {showForm && (
            <section className="mt-8 rounded-2xl border border-[#deded7] bg-white p-7 md:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                    {editingId ? "EDIT TARGET" : "NEW TARGET"}
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    {editingId ? "Edit company" : "Add a company"}
                  </h2>
                </div>

                <button
                  onClick={cancelForm}
                  className="text-sm text-[#777770]"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <Field
                  label="Company"
                  value={form.name}
                  onChange={(value) =>
                    setForm({ ...form, name: value })
                  }
                  placeholder="Acme AI"
                />

                <Field
                  label="Target role"
                  value={form.role}
                  onChange={(value) =>
                    setForm({ ...form, role: value })
                  }
                  placeholder="Growth Marketing Manager"
                />

                <Field
                  label="Website"
                  value={form.website}
                  onChange={(value) =>
                    setForm({ ...form, website: value })
                  }
                  placeholder="https://example.com"
                />

                <Field
                  label="Location"
                  value={form.location}
                  onChange={(value) =>
                    setForm({ ...form, location: value })
                  }
                  placeholder="Remote / New York"
                />

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as Priority,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#deded7] bg-white px-4 py-3"
                  >
                    {priorities.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Status,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#deded7] bg-white px-4 py-3"
                  >
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <Field
                  label="Contact"
                  value={form.contact}
                  onChange={(value) =>
                    setForm({ ...form, contact: value })
                  }
                  placeholder="Sarah Chen — VP Growth"
                />

                <Field
                  label="Next action"
                  value={form.nextAction}
                  onChange={(value) =>
                    setForm({ ...form, nextAction: value })
                  }
                  placeholder="Ask for referral"
                />

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                    Due date
                  </label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dueDate: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#deded7] bg-white px-4 py-3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                    Notes
                  </label>

                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Why this company matters..."
                    className="mt-2 w-full resize-none rounded-xl border border-[#deded7] bg-white px-4 py-3"
                  />
                </div>
              </div>

              <button
                onClick={saveCompany}
                style={{ color: "#fff", backgroundColor: "#111" }}
                className="mt-6 rounded-lg px-6 py-3 text-sm font-semibold"
              >
                {editingId ? "Save changes" : "+ Add company"}
              </button>
            </section>
          )}

          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#777770]">
                  YOUR TARGET LIST
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  Companies worth pursuing
                </h2>
              </div>

              <span className="rounded-full bg-[#f0f0eb] px-3 py-1 text-xs font-semibold">
                {companies.length} total
              </span>
            </div>

            {companies.length === 0 ? (
              <div className="rounded-2xl border border-[#deded7] bg-white px-6 py-20 text-center">
                <h3 className="text-xl font-bold">
                  No target companies yet.
                </h3>

                <p className="mt-2 text-[#777770]">
                  Add the companies you actually want to work for.
                </p>

                <button
                  onClick={startAdding}
                  className="mt-6 rounded-lg bg-[#111] px-6 py-3 text-sm font-semibold text-white"
                >
                  + Add your first company
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {companies.map((company) => (
                  <article
                    key={company.id}
                    className="rounded-2xl border border-[#deded7] bg-white p-6"
                  >
                    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-center">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold">
                            {company.name}
                          </h3>

                          <span className="rounded-full bg-[#f0f0eb] px-3 py-1 text-xs font-semibold">
                            {company.priority}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-[#777770]">
                          {company.role}
                          {company.location
                            ? ` · ${company.location}`
                            : ""}
                        </p>

                        {company.website && (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-sm underline"
                          >
                            Website
                          </a>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
                          STATUS
                        </p>

                        <select
                          value={company.status}
                          onChange={(e) =>
                            updateCompany(
                              company.id,
                              "status",
                              e.target.value
                            )
                          }
                          className="mt-2 rounded-lg border border-[#deded7] bg-white px-3 py-2 text-sm font-semibold"
                        >
                          {statuses.map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
                          NEXT ACTION
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          {company.nextAction || "No action set"}
                        </p>

                        {company.dueDate && (
                          <p className="mt-1 text-xs text-[#777770]">
                            Due{" "}
                            {new Date(
                              `${company.dueDate}T00:00:00`
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 lg:justify-end">
                        <button
                          onClick={() => startEditing(company)}
                          className="rounded-lg border border-[#ccc] bg-white px-4 py-2 text-sm font-semibold text-[#111] hover:bg-[#f5f5f2]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteCompany(company.id)}
                          className="rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm font-semibold text-[#777770] hover:border-[#aaa] hover:text-[#111]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {(company.contact || company.notes) && (
                      <div className="mt-5 grid gap-4 border-t border-[#eee] pt-5 md:grid-cols-2">
                        {company.contact && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
                              CONTACT
                            </p>
                            <p className="mt-1 text-sm">
                              {company.contact}
                            </p>
                          </div>
                        )}

                        {company.notes && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-[#999]">
                              NOTES
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[#66665f]">
                              {company.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <footer className="pb-14 pt-8 text-center text-sm text-[#999990]">
          LayoffOS · A practical recovery system for your next move.
        </footer>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest text-[#777770]">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#deded7] bg-white px-4 py-3"
      />
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#deded7] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-[#999990]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}
