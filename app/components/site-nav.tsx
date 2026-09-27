"use client";

import { usePathname } from "next/navigation";

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

  if (pathname === "/") {
    return null;
  }

  const isStart = pathname === "/start";

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

        <a
          href={isStart ? "/dashboard" : "/start"}
          className="site-nav-cta"
        >
          {isStart ? "Back to dashboard →" : "My recovery →"}
        </a>
      </div>
    </div>
  );
}
