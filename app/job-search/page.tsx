"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Stage =
  | "Applied"
  | "Recruiter Screen"
  | "Interview"
  | "Final"
  | "Offer"
  | "Rejected";

type Application = {
  id: string;
  company: string;
  role: string;
  url: string;
  stage: Stage;
  dateApplied: string;
  nextAction: string;
  dueDate: string;
  actionCompleted: boolean;
};

const stages: Stage[] = [
  "Applied",
  "Recruiter Screen",
  "Interview",
  "Final",
  "Offer",
  "Rejected",
];

const emptyForm = {
  company: "",
  role: "",
  url: "",
  stage: "Applied" as Stage,
  dateApplied: new Date().toISOString().slice(0, 10),
  nextAction: "",
  dueDate: "",
};

const STORAGE_KEY = "layoffos-applications";

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: string) {
  if (!date) return "No date";

  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function normalizeApplication(app: Partial<Application>): Application {
  return {
    id: app.id || crypto.randomUUID(),
    company: app.company || "",
    role: app.role || "",
    url: app.url || "",
    stage: app.stage || "Applied",
    dateApplied: app.dateApplied || todayString(),
    nextAction: app.nextAction || "",
    dueDate: app.dueDate || "",
    actionCompleted: Boolean(app.actionCompleted),
  };
}

export default function JobSearchPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [showForm, setShowForm] = useState(false);
 const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState(emptyForm);

useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setApplications(parsed.map(normalizeApplication));
      }
    } catch {
      console.error("Could not load applications");
    }
  }

  setHydrated(true);
}, []);
useEffect(() => {
  if (!hydrated) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(applications)
  );
}, [applications, hydrated]);


  const metrics = useMemo(() => {
    return {
      applications: applications.length,
      responses: applications.filter(
        (app) =>
          app.stage !== "Applied" &&
          app.stage !== "Rejected"
      ).length,
      interviews: applications.filter(
        (app) =>
          app.stage === "Interview" ||
          app.stage === "Final" ||
          app.stage === "Offer"
      ).length,
      finals: applications.filter(
        (app) =>
          app.stage === "Final" ||
          app.stage === "Offer"
      ).length,
      offers: applications.filter(
        (app) => app.stage === "Offer"
      ).length,
    };
  }, [applications]);

  const funnel = useMemo(() => {
    const applicationToResponse =
      metrics.applications > 0
        ? Math.round((metrics.responses / metrics.applications) * 100)
        : 0;

    const responseToInterview =
      metrics.responses > 0
        ? Math.round((metrics.interviews / metrics.responses) * 100)
        : 0;

    const finalToOffer =
      metrics.finals > 0
        ? Math.round((metrics.offers / metrics.finals) * 100)
        : 0;

    return {
      applicationToResponse,
      responseToInterview,
      finalToOffer,
    };
  }, [metrics]);

  const attentionItems = useMemo(() => {
    const today = todayString();

    return applications
      .filter(
        (app) =>
          app.stage !== "Rejected" &&
          app.stage !== "Offer" &&
          app.nextAction.trim() !== "" &&
          !app.actionCompleted
      )
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.localeCompare(b.dueDate);
      })
      .map((app) => {
        let status = "upcoming";

        if (app.dueDate && app.dueDate < today) {
          status = "overdue";
        } else if (app.dueDate === today) {
          status = "today";
        }

        return {
          ...app,
          status,
        };
      });
  }, [applications]);

  const updateApplication = (
    id: string,
    updates: Partial<Application>
  ) => {
    setApplications((current) =>
      current.map((app) =>
        app.id === id
          ? { ...app, ...updates }
          : app
      )
    );
  };

  const addApplication = () => {
    if (!form.company.trim() || !form.role.trim()) {
      return;
    }

    const newApplication: Application = {
      id: crypto.randomUUID(),
      company: form.company.trim(),
      role: form.role.trim(),
      url: form.url.trim(),
      stage: form.stage,
      dateApplied: form.dateApplied || todayString(),
      nextAction: form.nextAction.trim(),
      dueDate: form.dueDate,
      actionCompleted: false,
    };

    setApplications((current) => [
      newApplication,
      ...current,
    ]);

    setForm({
      ...emptyForm,
      dateApplied: todayString(),
    });

    setShowForm(false);
  };

  const deleteApplication = (id: string) => {
    setApplications((current) =>
      current.filter((app) => app.id !== id)
    );
  };

  const markActionComplete = (id: string) => {
    updateApplication(id, {
      actionCompleted: true,
    });
  };

  const activeApplications = applications.filter(
    (app) => app.stage !== "Rejected"
  );

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">L</span>
          <span>LayoffOS</span>
        </Link>

        <Link href="/dashboard" className="secondary-button">
          ← Dashboard
        </Link>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">JOB SEARCH OS</p>

          <h1>
            Know where your search
            <br />
            stands.
          </h1>

          <p className="hero-copy">
            Track every opportunity, understand where your
            search is breaking down, and keep the next action
            visible.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Add application
          </button>
        </div>
      </section>

      {attentionItems.length > 0 && (
        <section
          style={{
            marginBottom: "34px",
            border: "1px solid #deded9",
            borderRadius: "20px",
            padding: "28px 30px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "20px",
              marginBottom: "22px",
            }}
          >
            <div>
              <p className="eyebrow">ACTION CENTER</p>

              <h2
                style={{
                  margin: "6px 0 0",
                  fontSize: "28px",
                  letterSpacing: "-0.03em",
                }}
              >
                What needs your attention
              </h2>
            </div>

            <span
              style={{
                background: "#f1f1ed",
                borderRadius: "999px",
                padding: "7px 13px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {attentionItems.length}{" "}
              {attentionItems.length === 1
                ? "action"
                : "actions"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            {attentionItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(0, 1fr) auto auto",
                  alignItems: "center",
                  gap: "20px",
                  padding: "18px 0",
                  borderTop: "1px solid #ecece7",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 650,
                      marginBottom: "5px",
                    }}
                  >
                    {item.nextAction}
                  </div>

                  <div
                    style={{
                      fontSize: "14px",
                      color: "#777770",
                    }}
                  >
                    {item.company} · {item.role}
                  </div>
                </div>

                <div
                  style={{
                    minWidth: "100px",
                    textAlign: "right",
                    fontSize: "13px",
                    fontWeight: 600,
                    color:
                      item.status === "overdue"
                        ? "#a33a2b"
                        : item.status === "today"
                        ? "#111111"
                        : "#777770",
                  }}
                >
                  {item.status === "overdue"
                    ? `Overdue · ${formatShortDate(item.dueDate)}`
                    : item.status === "today"
                    ? "Due today"
                    : item.dueDate
                    ? `Due ${formatShortDate(item.dueDate)}`
                    : "No due date"}
                </div>

                <button
                  onClick={() =>
                    markActionComplete(item.id)
                  }
                  style={{
                    border: "1px solid #d9d9d3",
                    background: "#fff",
                    borderRadius: "10px",
                    padding: "9px 13px",
                    fontSize: "13px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  Mark complete
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {showForm && (
        <section
          style={{
            marginBottom: "34px",
            border: "1px solid #deded9",
            borderRadius: "20px",
            padding: "30px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <p className="eyebrow">NEW OPPORTUNITY</p>

              <h2
                style={{
                  margin: "6px 0 0",
                  fontSize: "28px",
                  letterSpacing: "-0.03em",
                }}
              >
                Add an application
              </h2>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="secondary-button"
            >
              Cancel
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <label>
              <span className="form-label">
                Company
              </span>

              <input
                className="form-input"
                value={form.company}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company: e.target.value,
                  })
                }
                placeholder="e.g. Acme AI"
              />
            </label>

            <label>
              <span className="form-label">
                Role
              </span>

              <input
                className="form-input"
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
                placeholder="e.g. Growth Marketing Manager"
              />
            </label>

            <label>
              <span className="form-label">
                Job URL
              </span>

              <input
                className="form-input"
                value={form.url}
                onChange={(e) =>
                  setForm({
                    ...form,
                    url: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </label>

            <label>
              <span className="form-label">
                Stage
              </span>

              <select
                className="form-input"
                value={form.stage}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stage: e.target.value as Stage,
                  })
                }
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="form-label">
                Date applied
              </span>

              <input
                className="form-input"
                type="date"
                value={form.dateApplied}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dateApplied: e.target.value,
                  })
                }
              />
            </label>

            <label>
              <span className="form-label">
                Next action due
              </span>

              <input
                className="form-input"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dueDate: e.target.value,
                  })
                }
              />
            </label>

            <label
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <span className="form-label">
                Next action
              </span>

              <input
                className="form-input"
                value={form.nextAction}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nextAction: e.target.value,
                  })
                }
                placeholder="e.g. Follow up with recruiter"
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px",
            }}
          >
            <button
              className="primary-button"
              onClick={addApplication}
            >
              Save application
            </button>
          </div>
        </section>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">APPLICATIONS</p>
          <p className="stat-value">
            {metrics.applications}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">RESPONSES</p>
          <p className="stat-value">
            {metrics.responses}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">INTERVIEWS</p>
          <p className="stat-value">
            {metrics.interviews}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">FINALS</p>
          <p className="stat-value">
            {metrics.finals}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">OFFERS</p>
          <p className="stat-value">
            {metrics.offers}
          </p>
        </div>
      </section>

      <section className="funnel-card">
        <div>
          <p className="eyebrow">SEARCH HEALTH</p>

          <h2>Your search funnel</h2>
        </div>

        <div className="funnel-metrics">
          <div>
            <span>Application → response</span>
            <strong>
              {funnel.applicationToResponse}%
            </strong>
          </div>

          <div>
            <span>Response → interview</span>
            <strong>
              {funnel.responseToInterview}%
            </strong>
          </div>

          <div>
            <span>Final → offer</span>
            <strong>{funnel.finalToOffer}%</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">ACTIVE PIPELINE</p>

            <h2>Your opportunities</h2>
          </div>

          <span className="count-pill">
            {activeApplications.length} total
          </span>
        </div>

        {activeApplications.length === 0 ? (
          <div
            style={{
              border: "1px solid #deded9",
              borderRadius: "20px",
              padding: "50px 30px",
              textAlign: "center",
              background: "#fff",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              No opportunities yet.
            </p>

            <p
              style={{
                color: "#777770",
                marginBottom: "22px",
              }}
            >
              Add your first application and start
              building your pipeline.
            </p>

            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              + Add application
            </button>
          </div>
        ) : (
          <div className="pipeline-table">
            <div className="pipeline-header">
              <span>COMPANY</span>
              <span>ROLE</span>
              <span>STAGE</span>
              <span>NEXT ACTION</span>
              <span>DUE</span>
              <span></span>
            </div>

            {activeApplications.map((app) => (
              <div
                className="pipeline-row"
                key={app.id}
              >
                <div>
                  <strong>{app.company}</strong>

                  <small>
                    {formatDate(app.dateApplied)}
                  </small>
                </div>

                <div>{app.role}</div>

                <div>
                  <select
                    className="stage-select"
                    value={app.stage}
                    onChange={(e) =>
                      updateApplication(app.id, {
                        stage: e.target.value as Stage,
                      })
                    }
                  >
                    {stages.map((stage) => (
                      <option
                        key={stage}
                        value={stage}
                      >
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  {app.actionCompleted ? (
                    <span
                      style={{
                        color: "#777770",
                        textDecoration:
                          "line-through",
                      }}
                    >
                      {app.nextAction ||
                        "Action completed"}
                    </span>
                  ) : (
                    <input
                      className="inline-input"
                      value={app.nextAction}
                      onChange={(e) =>
                        updateApplication(app.id, {
                          nextAction:
                            e.target.value,
                        })
                      }
                      placeholder="Add next action"
                    />
                  )}
                </div>

                <div>
                  <input
                    className="inline-date"
                    type="date"
                    value={app.dueDate}
                    onChange={(e) =>
                      updateApplication(app.id, {
                        dueDate: e.target.value,
                        actionCompleted: false,
                      })
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  {app.nextAction &&
                    !app.actionCompleted && (
                      <button
                        onClick={() =>
                          markActionComplete(
                            app.id
                          )
                        }
                        title="Mark action complete"
                        style={{
                          border: "1px solid #d9d9d3",
                          background: "#fff",
                          borderRadius: "8px",
                          padding:
                            "6px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✓
                      </button>
                    )}

                  <button
                    onClick={() =>
                      deleteApplication(app.id)
                    }
                    className="delete-button"
                    title="Delete application"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          marginTop: "45px",
          paddingTop: "30px",
          borderTop: "1px solid #deded9",
        }}
      >
        <p
          style={{
            color: "#777770",
            fontSize: "14px",
            lineHeight: 1.6,
            maxWidth: "700px",
          }}
        >
          LayoffOS is designed to turn a job search
          into a manageable recovery system. Track the
          opportunity, identify the next action, and
          keep moving.
        </p>
      </section>
    </main>
  );
}
