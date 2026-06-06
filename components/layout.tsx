'use client';
import React from 'react';
import Image from 'next/image';
import Icon from './Icon';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  section?: string;
  items: NavItem[];
}

interface User {
  name: string;
  initials: string;
  role: string;
  org: string;
  facilityId?: string;
}

// ---- Sidebar ----
export function Sidebar({ nav, active, onNav, user, roleLabel }: {
  nav: NavGroup[];
  active: string;
  onNav: (key: string) => void;
  user: User;
  roleLabel: string;
}) {
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <span style={{ background: "#fff", borderRadius: 9, padding: "5px 9px", display: "inline-flex", alignItems: "center", flex: "none" }}>
          <Image src="/logo.png" alt="LMHRA" width={80} height={26} style={{ height: 26, width: "auto", display: "block" }} />
        </span>
        <div>
          <div className="t1">Waste Portal</div>
          <div className="t2">{roleLabel}</div>
        </div>
      </div>
      {nav.map((group, gi) => (
        <React.Fragment key={gi}>
          {group.section && <div className="sb-section">{group.section}</div>}
          <nav className="sb-nav">
            {group.items.map((it) => (
              <button key={it.key} className="sb-item" data-active={active === it.key ? "true" : "false"} onClick={() => onNav(it.key)}>
                <Icon name={it.icon} size={18} className="ico" />
                <span>{it.label}</span>
                {it.badge != null && <span className="badge-n">{it.badge}</span>}
              </button>
            ))}
          </nav>
        </React.Fragment>
      ))}
      <div className="sb-spacer" />
      <div className="sb-user">
        <div className="sb-avatar">{user.initials}</div>
        <div style={{ minWidth: 0 }}>
          <div className="t1">{user.name}</div>
          <div className="t2">{user.role}</div>
        </div>
      </div>
    </aside>
  );
}

// ---- TopNav (horizontal) ----
export function TopNav({ nav, active, onNav }: {
  nav: NavGroup[];
  active: string;
  onNav: (key: string) => void;
}) {
  const items = nav.flatMap((g) => g.items);
  return (
    <header className="topnav">
      <div className="tn-brand">
        <span style={{ background: "#fff", borderRadius: 8, padding: "4px 8px", display: "inline-flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="LMHRA" width={60} height={22} style={{ height: 22, width: "auto", display: "block" }} />
        </span>
        <div style={{ fontWeight: 700, fontSize: 15 }}>Waste Portal</div>
      </div>
      <nav className="tn-nav">
        {items.map((it) => (
          <button key={it.key} className="tn-item" data-active={active === it.key ? "true" : "false"} onClick={() => onNav(it.key)}>
            <Icon name={it.icon} size={16} />
            {it.label}
            {it.badge != null && (
              <span style={{ background: "var(--c-accent)", color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700, padding: "1px 6px" }}>
                {it.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </header>
  );
}

// ---- TopBar ----
export function TopBar({ title, crumb, user }: { title: string; crumb?: string; user: User }) {
  return (
    <header className="topbar">
      <div>
        {crumb && <div className="crumb">{crumb}</div>}
        <div className="pg-title">{title}</div>
      </div>
      <div className="search">
        <Icon name="search" size={15} />
        <input placeholder="Search requests, facilities, certificates…" />
      </div>
      <button className="icon-btn">
        <Icon name="bell" size={17} />
        <span className="ping" />
      </button>
      <div className="sb-avatar" style={{ background: "var(--c-primary)" }}>{user.initials}</div>
    </header>
  );
}

// ---- DeskShell (sidebar + topbar + content) ----
export function DeskShell({ nav, active, onNav, user, roleLabel, layout = "sidebar", title, crumb, children }: {
  nav: NavGroup[];
  active: string;
  onNav: (key: string) => void;
  user: User;
  roleLabel: string;
  layout?: string;
  title: string;
  crumb?: string;
  children: React.ReactNode;
}) {
  if (layout === "topnav") {
    return (
      <div className="main" style={{ flexDirection: "column" }}>
        <TopNav nav={nav} active={active} onNav={onNav} />
        <TopBar title={title} crumb={crumb} user={user} />
        <div className="content viewfade">
          <div className="content-inner">{children}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="body-row">
      <Sidebar nav={nav} active={active} onNav={onNav} user={user} roleLabel={roleLabel} />
      <div className="main">
        <TopBar title={title} crumb={crumb} user={user} />
        <div className="content viewfade">
          <div className="content-inner">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ---- PersonaBar ----
const ROLES = [
  { key: "overview", label: "Overview", dot: "#6b7c87" },
  { key: "client", label: "Facility", dot: "#1b6aa8" },
  { key: "transport", label: "Transport", dot: "#1b98a8" },
  { key: "koko", label: "Koko Site", dot: "#0b4f6c" },
  { key: "admin", label: "Admin", dot: "#7a2e8f" },
];

export function PersonaBar({ active, onChange }: { active: string; onChange: (role: string) => void }) {
  return (
    <div className="persona-bar">
      <div className="pb-brand">
        <span style={{ background: "#fff", borderRadius: 6, padding: "3px 7px", display: "inline-flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="LMHRA" width={50} height={18} style={{ height: 18, width: "auto", display: "block" }} />
        </span>
      </div>
      <span className="pb-sep">|</span>
      <span style={{ color: "#8a99a2" }}>Pharmaceutical Waste Disposal Portal</span>
      <span style={{ marginLeft: 14, fontSize: 11, color: "#6a7a83", display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="eye" size={13} /> Viewing as
      </span>
      <div className="pb-roles">
        {ROLES.map((r) => (
          <button
            key={r.key}
            className="pb-role"
            data-active={active === r.key ? "true" : "false"}
            onClick={() => onChange(r.key)}
          >
            <span className="dot" style={{ background: r.dot }} />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
