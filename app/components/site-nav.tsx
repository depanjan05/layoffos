"use client";

import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plan", label: "Plan" },
  { href: "/first-72-hours", label: "72 Hours" },
  { href: "/runway", label: "Runway" },
  { href: "/job-search", label: "Job Search" },
  { href: "/networking", label: "Networking" },
  { href: "/companies", label: "Companies" },
  { href: "/interviews", label: "Interviews" },
  { href: "/data", label: "Data" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/") return null;

  const isStart = pathname === "/start";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="site-nav">
      <div className="site-nav-inner">
        <a href="/" className="site-brand">
          <span className="site-brand-mark">L</span>
          <span>LayoffOS</span>
        </a>

        {!isStart && (
          <nav className="site-nav-links">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : ""}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a
            href={isStart ? "/dashboard" : "/start"}
            className="site-nav-cta"
          >
            {isStart ? "Back to dashboard →" : "My recovery →"}
          </a>

          {!isStart && (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                border: "1px solid #ddd",
                background: "#fff",
                color: "#111",
                borderRadius: "999px",
                padding: "9px 14px",
                cursor: "pointer",
                fontSize: "14px",
                whiteSpace: "nowrap",
              }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
