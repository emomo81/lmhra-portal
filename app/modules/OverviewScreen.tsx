'use client';
import React from 'react';
import Image from 'next/image';
import Icon from '../../components/Icon';
import { Btn, Pill, Card } from '../../components/ui';

const POINTS = [
  {
    n: "01", key: "client", role: "client", title: "Client / Generator Facility", device: "Desktop",
    who: "Hospitals · Pharmacies · Clinics · Laboratories",
    icon: "building", color: "var(--c-info)",
    stages: ["Submitted", "Under Review", "Approved & Invoiced"],
    blurb: "Registers, declares waste, submits disposal requests, and tracks them to certificate.",
  },
  {
    n: "02", key: "transport", role: "transport", title: "LMHRA Transport & Collection", device: "Desktop",
    who: "Drivers · Collection officers",
    icon: "truck", color: "var(--c-accent)",
    stages: ["Scheduled", "Collected & Paid", "In Transit"],
    blurb: "Collects from the facility, verifies declared vs actual, weighs, photographs, takes cash, seals custody.",
  },
  {
    n: "03", key: "koko", role: "koko", title: "Koko Town Waste Site", device: "Desktop",
    who: "Verification officers · Disposal supervisors",
    icon: "flask", color: "var(--c-primary)",
    stages: ["Received & Reconciled", "Disposed", "Certified"],
    blurb: "Reconciles weighbridge vs collected vs declared, disposes, and issues the clearance certificate.",
  },
];

const ROLE_CARDS = [
  { role: "client", icon: "building", title: "Facility User", desc: "Submit & track disposal requests", color: "var(--c-info)" },
  { role: "transport", icon: "truck", title: "Transport & Collection", desc: "Field collection on mobile", color: "var(--c-accent)" },
  { role: "koko", icon: "flask", title: "Koko Town Site", desc: "Receive, verify & dispose", color: "var(--c-primary)" },
  { role: "admin", icon: "shield", title: "Admin & Reporting", desc: "Oversight, reports & users", color: "#7a2e8f" },
];

const LAYERS = [
  { n: "L1", title: "Data capture", icon: "filePlus", desc: "Registration, waste declaration, collection & receipt forms — the operational front line.", users: "All field & facility users" },
  { n: "L2", title: "Verification & reconciliation", icon: "scale", desc: "Three-way match: declared → collected → received. Variance flags & chain-of-custody.", users: "Transport · Koko officers" },
  { n: "L3", title: "Reporting & analytics", icon: "chart", desc: "Operational, billing, transport, receipt and disposal reports aggregated by county & period.", users: "Supervisors · Reporting users" },
  { n: "L4", title: "Management & governance", icon: "shield", desc: "Executive summary dashboards, audit trail, fee policy and role administration.", users: "LMHRA leadership · Admin" },
];

const FORMS = [
  { point: "01 · Client / Generator", color: "var(--c-info)", items: [
    { id: "F1", name: "Facility Registration & Profile", fields: ["Facility name & type", "LMHRA license no.", "County / city / GPS", "Responsible pharmacist", "Contact & access details"] },
    { id: "F2", name: "Waste Disposal Request", fields: ["Waste categories & quantities (kg/units)", "Packaging type", "Hazard declaration", "Preferred collection window", "On-site contact & access notes"] },
    { id: "F3", name: "Payment Acknowledgement", fields: ["Invoice reference", "Amount (USD/LRD)", "Cash-on-collection consent", "Authorising officer"] },
  ]},
  { point: "02 · Transport & Collection", color: "var(--c-accent)", items: [
    { id: "F4", name: "Collection Verification & Manifest", fields: ["Declared vs actual per category", "Field weight (kg)", "Variance & reason", "Photographs", "Cash received & receipt no.", "Container seal numbers"] },
    { id: "F5", name: "Chain-of-Custody / Transport Log", fields: ["Driver & vehicle", "Departure / arrival times", "Seal integrity check", "GPS route", "Handover signatures"] },
  ]},
  { point: "03 · Koko Town Site", color: "var(--c-primary)", items: [
    { id: "F6", name: "Waste Receipt & Reconciliation", fields: ["Weighbridge weight", "Seal verification", "3-way variance (declared/collected/received)", "Category confirmation", "Accept / hold / reject"] },
    { id: "F7", name: "Disposal / Treatment Record", fields: ["Disposal method (incineration etc.)", "Batch no. & temperature", "Disposed weight", "Witnessing inspector", "Date & time"] },
    { id: "F8", name: "Clearance / Disposal Certificate", fields: ["Certificate no.", "Linked request & facility", "Categories & final weight", "Method & witness", "QR verification & seal"] },
  ]},
];

const REPORTS = [
  { icon: "file", name: "Operational reports", desc: "Requests by status, ageing, SLA breaches, throughput by facility & county.", who: "Supervisors" },
  { icon: "money", name: "Billing & payment reports", desc: "Invoices issued, cash collected, outstanding, revenue by category & period.", who: "Finance · Admin" },
  { icon: "truck", name: "Collection & transport reports", desc: "Jobs completed, distance, variance at collection, driver productivity.", who: "Transport lead" },
  { icon: "scale", name: "Receipt & verification reports", desc: "3-way reconciliation, variance flags, holds & rejections at Koko Town.", who: "Site manager" },
  { icon: "cert", name: "Disposal & certificate reports", desc: "Tonnage disposed by method, certificates issued, witness register.", who: "Site · Regulatory" },
  { icon: "trend", name: "Management summary", desc: "KPIs, trend lines, county distribution, compliance posture for leadership.", who: "LMHRA leadership" },
];

export default function OverviewScreen({ onEnterRole }: { onEnterRole: (role: string) => void }) {
  return (
    <div className="content viewfade" style={{ background: "var(--c-bg)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Hero */}
        <div className="card" style={{ overflow: "hidden", marginBottom: 22, border: "none" }}>
          <div style={{ background: "linear-gradient(135deg, var(--c-primary), var(--c-primary-700))", color: "#fff", padding: "40px 44px", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, opacity: .14, backgroundImage: "radial-gradient(circle at 88% 12%, var(--c-accent) 0, transparent 38%)" }} />
            <div style={{ position: "relative" }}>
              <span style={{ display: "inline-flex", background: "#fff", borderRadius: 12, padding: "10px 16px", marginBottom: 18, boxShadow: "0 4px 16px rgba(0,0,0,.18)" }}>
                <Image src="/logo.png" alt="LMHRA" width={120} height={40} style={{ height: 40, width: "auto", display: "block" }} />
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, letterSpacing: ".02em", color: "rgba(255,255,255,.82)", marginBottom: 14 }}>
                <Icon name="shield" size={14} /> Liberia Medicines &amp; Health Products Regulatory Authority
              </div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.02em", maxWidth: 760 }}>
                Pharmaceutical Waste Disposal Portal
              </h1>
              <p style={{ fontSize: 15.5, color: "rgba(255,255,255,.82)", marginTop: 14, maxWidth: 660, lineHeight: 1.55 }}>
                One connected system from request to certificate — across the generator facility, the LMHRA collection team, and the Koko Town Waste Management Site. Role-based, verifiable, and fully auditable.
              </p>
              <div className="wrap" style={{ marginTop: 24, gap: 22 }}>
                {[["6", "active requests"], ["3", "workflow points"], ["9", "tracked stages"], ["8", "core forms"], ["4", "user roles"]].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{n}</div>
                    <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.7)" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enter as a role */}
        <div className="page-head" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Explore the prototype</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Enter as a role</h1>
          <p>Each role sees only the modules, data and reports relevant to their responsibility. Switch any time from the bar above.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 30 }}>
          {ROLE_CARDS.map((r) => (
            <button
              key={r.role}
              className="card card-pad"
              onClick={() => onEnterRole(r.role)}
              style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--c-line)", transition: "transform .14s, box-shadow .14s", background: "var(--c-surface)", borderRadius: "var(--r-lg)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; }}
            >
              <span style={{ width: 44, height: 44, borderRadius: 11, background: r.color + "18", color: r.color, display: "grid", placeItems: "center", marginBottom: 14 }}>
                <Icon name={r.icon} size={22} />
              </span>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>{r.title}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{r.desc}</div>
              <div className="row" style={{ marginTop: 14, color: r.color, fontSize: 13, fontWeight: 600 }}>
                Open dashboard <Icon name="arrowR" size={15} />
              </div>
            </button>
          ))}
        </div>

        {/* Workflow pipeline */}
        <div className="page-head" style={{ marginBottom: 14 }}>
          <div className="eyebrow">How it flows</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>The three workflow points</h1>
          <p>Data is captured once and verified twice — declared at request, confirmed at collection, reconciled at the site.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 14 }}>
          {POINTS.map((p) => (
            <Card key={p.key} className="card-pad" style={{ borderTop: "3px solid " + p.color }}>
              <div className="between">
                <span style={{ width: 40, height: 40, borderRadius: 10, background: p.color + "18", color: p.color, display: "grid", placeItems: "center" }}>
                  <Icon name={p.icon} size={20} />
                </span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--c-line)" }}>{p.n}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15.5, marginTop: 12 }}>{p.title}</div>
              <Pill kind="neutral" dot={false}>
                <Icon name="grid" size={12} />&nbsp;{p.device}
              </Pill>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 8 }}>{p.who}</div>
              <p style={{ fontSize: 13, color: "var(--c-ink-2)", marginTop: 10, lineHeight: 1.5 }}>{p.blurb}</p>
              <div className="divider" style={{ margin: "14px 0" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {p.stages.map((s) => (
                  <div key={s} className="row" style={{ fontSize: 12.5, color: "var(--c-ink-2)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />{s}
                  </div>
                ))}
              </div>
              <Btn kind="soft" size="sm" iconR="arrowR" style={{ marginTop: 16, width: "100%" }} onClick={() => onEnterRole(p.role)}>
                Open this view
              </Btn>
            </Card>
          ))}
        </div>

        {/* Data flow strip */}
        <Card className="card-pad" style={{ marginBottom: 30, background: "var(--c-bg-2)" }}>
          <div className="row" style={{ flexWrap: "wrap", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)" }}>
            {["Request", "Review", "Invoice", "Schedule", "Collect + Pay", "Transit", "Receive", "Dispose", "Certify"].map((s, i, arr) => (
              <React.Fragment key={s}>
                <span style={{ padding: "6px 12px", background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: 999 }}>{s}</span>
                {i < arr.length - 1 && <Icon name="chevR" size={14} className="muted" />}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* System layers */}
        <div className="page-head" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Architecture</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>System layers &amp; reporting hierarchy</h1>
          <p>Four layers, each feeding the one above it — from the data captured in the field up to leadership oversight.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 16 }}>
          {LAYERS.map((l) => (
            <Card key={l.n} className="card-pad">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--c-primary-soft)", color: "var(--c-primary)", display: "grid", placeItems: "center" }}>
                  <Icon name={l.icon} size={18} />
                </span>
                <span className="tag">{l.n}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14.5, marginTop: 12 }}>{l.title}</div>
              <p style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginTop: 6, lineHeight: 1.5 }}>{l.desc}</p>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 10, fontWeight: 600 }}>{l.users}</div>
            </Card>
          ))}
        </div>

        {/* Reports grid */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 30 }}>
          {REPORTS.map((r) => (
            <Card key={r.name} className="card-pad">
              <div className="row">
                <span style={{ width: 34, height: 34, borderRadius: 9, background: "var(--c-accent-soft)", color: "var(--c-accent)", display: "grid", placeItems: "center" }}>
                  <Icon name={r.icon} size={17} />
                </span>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.name}</div>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginTop: 10, lineHeight: 1.5 }}>{r.desc}</p>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 10 }}>Audience · {r.who}</div>
            </Card>
          ))}
        </div>

        {/* Forms inventory */}
        <div className="page-head" style={{ marginBottom: 14 }}>
          <div className="eyebrow">Data capture</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>Forms inventory — organised by workflow point</h1>
          <p>Eight core forms. Each request carries its data forward so every point verifies against the last.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 40 }}>
          {FORMS.map((g) => (
            <div key={g.point} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="row" style={{ fontSize: 12.5, fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />{g.point}
              </div>
              {g.items.map((f) => (
                <Card key={f.id} className="card-pad">
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{f.name}</div>
                    <span className="tag" style={{ color: g.color, borderColor: g.color + "55" }}>{f.id}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {f.fields.map((fl) => (
                      <div key={fl} className="row" style={{ fontSize: 12, color: "var(--c-ink-2)", alignItems: "flex-start" }}>
                        <Icon name="check" size={13} style={{ color: g.color, marginTop: 2, flex: "none" }} />{fl}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
