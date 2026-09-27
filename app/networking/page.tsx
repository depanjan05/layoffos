"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ContactStatus =
  | "Not contacted"
  | "Contacted"
  | "Conversation"
  | "Referral";

type Application = {
  id: string;
  company: string;
  role: string;
  stage: string;
};

type Contact = {
  id: string;
  name: string;
  company: string;
  role: string;
  linkedin: string;
  status: ContactStatus;
  lastContact: string;
  nextAction: string;
  dueDate: string;
  linkedApplicationId: string;
};

const CONTACTS_KEY = "layoffos-networking";
const APPLICATIONS_KEY = "layoffos-applications";

const emptyForm = {
  name: "",
  company: "",
  role: "",
  linkedin: "",
  status: "Not contacted" as ContactStatus,
  lastContact: "",
  nextAction: "",
  dueDate: "",
  linkedApplicationId: "",
};

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function formatShortDate(date: string) {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

function normalizeContact(contact: Partial<Contact>): Contact {
  return {
    id: contact.id || crypto.randomUUID(),
    name: contact.name || "",
    company: contact.company || "",
    role: contact.role || "",
    linkedin: contact.linkedin || "",
    status: contact.status || "Not contacted",
    lastContact: contact.lastContact || "",
    nextAction: contact.nextAction || "",
    dueDate: contact.dueDate || "",
    linkedApplicationId:
      contact.linkedApplicationId || "",
  };
}

export default function NetworkingPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [applications, setApplications] = useState<Application[]>(
    []
  );
  const [hydrated, setHydrated] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const savedContacts =
      localStorage.getItem(CONTACTS_KEY);

    const savedApplications =
      localStorage.getItem(APPLICATIONS_KEY);

    if (savedContacts) {
      try {
        const parsed = JSON.parse(savedContacts);

        if (Array.isArray(parsed)) {
          setContacts(
            parsed.map(normalizeContact)
          );
        }
      } catch {
        console.error(
          "Could not load networking data"
        );
      }
    }

    if (savedApplications) {
      try {
        const parsed = JSON.parse(
          savedApplications
        );

        if (Array.isArray(parsed)) {
          setApplications(parsed);
        }
      } catch {
        console.error(
          "Could not load applications"
        );
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      CONTACTS_KEY,
      JSON.stringify(contacts)
    );
  }, [contacts, hydrated]);

  const getApplication = (
    applicationId: string
  ) => {
    return applications.find(
      (application) =>
        application.id === applicationId
    );
  };

  const metrics = useMemo(() => {
    const today = todayString();

    return {
      contacts: contacts.length,

      conversations: contacts.filter(
        (contact) =>
          contact.status === "Conversation" ||
          contact.status === "Referral"
      ).length,

      referrals: contacts.filter(
        (contact) =>
          contact.status === "Referral"
      ).length,

      followUps: contacts.filter(
        (contact) =>
          contact.nextAction.trim() !== "" &&
          contact.dueDate !== "" &&
          contact.dueDate <= today
      ).length,

      linked: contacts.filter(
        (contact) =>
          contact.linkedApplicationId !== ""
      ).length,
    };
  }, [contacts]);

  const attentionItems = useMemo(() => {
    const today = todayString();

    return contacts
      .filter(
        (contact) =>
          contact.nextAction.trim() !== "" &&
          contact.dueDate !== ""
      )
      .sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate)
      )
      .map((contact) => ({
        ...contact,
        overdue: contact.dueDate < today,
        today: contact.dueDate === today,
      }));
  }, [contacts]);

  const addContact = () => {
    if (!form.name.trim()) return;

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
      linkedin: form.linkedin.trim(),
      status: form.status,
      lastContact: form.lastContact,
      nextAction: form.nextAction.trim(),
      dueDate: form.dueDate,
      linkedApplicationId:
        form.linkedApplicationId,
    };

    setContacts((current) => [
      newContact,
      ...current,
    ]);

    setForm({
      ...emptyForm,
      lastContact: todayString(),
    });

    setShowForm(false);
  };

  const updateContact = (
    id: string,
    updates: Partial<Contact>
  ) => {
    setContacts((current) =>
      current.map((contact) =>
        contact.id === id
          ? { ...contact, ...updates }
          : contact
      )
    );
  };

  const deleteContact = (id: string) => {
    setContacts((current) =>
      current.filter(
        (contact) => contact.id !== id
      )
    );
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">L</span>
          <span>LayoffOS</span>
        </Link>

        <Link
          href="/dashboard"
          className="secondary-button"
        >
          ← Dashboard
        </Link>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">NETWORKING OS</p>

          <h1>
            Don't search
            <br />
            alone.
          </h1>

          <p className="hero-copy">
            Keep the people who can help you move
            forward visible, organized, and actionable.
          </p>
        </div>

        <div className="hero-actions">
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Add contact
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
              marginBottom: "20px",
            }}
          >
            <div>
              <p className="eyebrow">
                FOLLOW-UP QUEUE
              </p>

              <h2
                style={{
                  margin: "7px 0 0",
                  fontSize: "28px",
                  letterSpacing: "-0.03em",
                }}
              >
                People who need your attention
              </h2>
            </div>

            <span className="count-pill">
              {attentionItems.length} due
            </span>
          </div>

          <div>
            {attentionItems.map((contact) => {
              const application = getApplication(
                contact.linkedApplicationId
              );

              return (
                <div
                  key={contact.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0, 1fr) auto",
                    gap: "20px",
                    alignItems: "center",
                    padding: "18px 0",
                    borderTop:
                      "1px solid #ecece7",
                  }}
                >
                  <div>
                    <strong
                      style={{
                        display: "block",
                        marginBottom: "5px",
                      }}
                    >
                      {contact.nextAction}
                    </strong>

                    <span
                      style={{
                        color: "#777770",
                        fontSize: "14px",
                      }}
                    >
                      {contact.name}
                      {contact.company
                        ? ` · ${contact.company}`
                        : ""}
                    </span>

                    {application && (
                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "13px",
                          color: "#999991",
                        }}
                      >
                        Linked to:{" "}
                        <strong>
                          {application.company}
                        </strong>{" "}
                        · {application.role}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: contact.overdue
                        ? "#a33a2b"
                        : "#111",
                    }}
                  >
                    {contact.overdue
                      ? `Overdue · ${formatShortDate(
                          contact.dueDate
                        )}`
                      : contact.today
                      ? "Due today"
                      : `Due ${formatShortDate(
                          contact.dueDate
                        )}`}
                  </span>
                </div>
              );
            })}
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
              <p className="eyebrow">
                NEW CONNECTION
              </p>

              <h2
                style={{
                  margin: "7px 0 0",
                  fontSize: "28px",
                  letterSpacing: "-0.03em",
                }}
              >
                Add someone to your network
              </h2>
            </div>

            <button
              className="secondary-button"
              onClick={() => setShowForm(false)}
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
                Name
              </span>

              <input
                className="form-input"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Sarah Chen"
              />
            </label>

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
                placeholder="e.g. VP Growth"
              />
            </label>

            <label>
              <span className="form-label">
                LinkedIn
              </span>

              <input
                className="form-input"
                value={form.linkedin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    linkedin: e.target.value,
                  })
                }
                placeholder="https://linkedin.com/in/..."
              />
            </label>

            <label>
              <span className="form-label">
                Status
              </span>

              <select
                className="form-input"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target.value as ContactStatus,
                  })
                }
              >
                <option>Not contacted</option>
                <option>Contacted</option>
                <option>Conversation</option>
                <option>Referral</option>
              </select>
            </label>

            <label>
              <span className="form-label">
                Related opportunity
              </span>

              <select
                className="form-input"
                value={form.linkedApplicationId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    linkedApplicationId:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  No opportunity
                </option>

                {applications.map(
                  (application) => (
                    <option
                      key={application.id}
                      value={application.id}
                    >
                      {application.company} —{" "}
                      {application.role}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              <span className="form-label">
                Last contact
              </span>

              <input
                className="form-input"
                type="date"
                value={form.lastContact}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lastContact: e.target.value,
                  })
                }
              />
            </label>

            <label>
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
                placeholder="Ask for a referral"
              />
            </label>

            <label>
              <span className="form-label">
                Follow-up due
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
              onClick={addContact}
            >
              Save contact
            </button>
          </div>
        </section>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">CONTACTS</p>
          <p className="stat-value">
            {metrics.contacts}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">
            CONVERSATIONS
          </p>
          <p className="stat-value">
            {metrics.conversations}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">REFERRALS</p>
          <p className="stat-value">
            {metrics.referrals}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">
            FOLLOW-UPS DUE
          </p>
          <p className="stat-value">
            {metrics.followUps}
          </p>
        </div>

        <div className="stat-card">
          <p className="stat-label">
            OPPORTUNITIES LINKED
          </p>
          <p className="stat-value">
            {metrics.linked}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">
              YOUR NETWORK
            </p>

            <h2>People who can help</h2>
          </div>

          <span className="count-pill">
            {contacts.length} total
          </span>
        </div>

        {contacts.length === 0 ? (
          <div
            style={{
              border: "1px solid #deded9",
              borderRadius: "20px",
              padding: "55px 30px",
              textAlign: "center",
              background: "#ffffff",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Your network is empty.
            </p>

            <p
              style={{
                color: "#777770",
                marginBottom: "22px",
              }}
            >
              Start with former colleagues,
              recruiters, hiring managers,
              alumni, and people you've worked
              with before.
            </p>

            <button
              className="primary-button"
              onClick={() => setShowForm(true)}
            >
              + Add contact
            </button>
          </div>
        ) : (
          <div className="pipeline-table">
            <div
              className="pipeline-header"
              style={{
                gridTemplateColumns:
                  "1.1fr 1fr 0.9fr 1.2fr 1fr 0.9fr auto",
              }}
            >
              <span>PERSON</span>
              <span>ROLE</span>
              <span>STATUS</span>
              <span>OPPORTUNITY</span>
              <span>NEXT ACTION</span>
              <span>DUE</span>
              <span></span>
            </div>

            {contacts.map((contact) => {
              const application = getApplication(
                contact.linkedApplicationId
              );

              return (
                <div
                  className="pipeline-row"
                  key={contact.id}
                  style={{
                    gridTemplateColumns:
                      "1.1fr 1fr 0.9fr 1.2fr 1fr 0.9fr auto",
                  }}
                >
                  <div>
                    <strong>{contact.name}</strong>

                    <small>
                      {contact.company ||
                        "No company"}
                    </small>

                    {contact.linkedin && (
                      <a
                        href={contact.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display:
                            "inline-block",
                          marginTop: "5px",
                          fontSize: "12px",
                          color: "#777770",
                        }}
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>

                  <div>
                    {contact.role || "—"}
                  </div>

                  <div>
                    <select
                      className="stage-select"
                      value={contact.status}
                      onChange={(e) =>
                        updateContact(
                          contact.id,
                          {
                            status:
                              e.target
                                .value as ContactStatus,
                          }
                        )
                      }
                    >
                      <option>
                        Not contacted
                      </option>
                      <option>
                        Contacted
                      </option>
                      <option>
                        Conversation
                      </option>
                      <option>
                        Referral
                      </option>
                    </select>
                  </div>

                  <div>
                    <select
                      className="stage-select"
                      value={
                        contact.linkedApplicationId
                      }
                      onChange={(e) =>
                        updateContact(
                          contact.id,
                          {
                            linkedApplicationId:
                              e.target.value,
                          }
                        )
                      }
                    >
                      <option value="">
                        None
                      </option>

                      {applications.map(
                        (application) => (
                          <option
                            key={application.id}
                            value={application.id}
                          >
                            {application.company}{" "}
                            — {application.role}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <input
                      className="inline-input"
                      value={contact.nextAction}
                      onChange={(e) =>
                        updateContact(
                          contact.id,
                          {
                            nextAction:
                              e.target.value,
                          }
                        )
                      }
                      placeholder="Add next action"
                    />
                  </div>

                  <div>
                    <input
                      className="inline-date"
                      type="date"
                      value={contact.dueDate}
                      onChange={(e) =>
                        updateContact(
                          contact.id,
                          {
                            dueDate:
                              e.target.value,
                          }
                        )
                      }
                    />
                  </div>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteContact(contact.id)
                    }
                    title="Delete contact"
                  >
                    ×
                  </button>
                </div>
              );
            })}
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
          Your network is an active part of your
          recovery. Keep relationships visible,
          connect them to opportunities, and turn
          conversations into progress.
        </p>
      </section>
    </main>
  );
}
