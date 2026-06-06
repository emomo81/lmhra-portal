'use client';
import React, { useState } from 'react';
import { REQUESTS, USERS, MONTHLY, COUNTY, AUDIT, WASTE, FEES, facById, fmtUSD, fmtKg } from '../../lib/data';
import { Btn, StagePill, HazardTag, Pill, Card, CardHead, Stat, Field, Input, Select, PageHead, BarChart } from '../../components/ui';
import { DeskShell } from '../../components/layout';
import Icon from '../../components/Icon';

const STAGES_LIST = ["submitted","review","approved","scheduled","collected","transit","received","disposed","certified"];
const STAGE_LABELS: Record<string,string> = { submitted:"Submitted", review:"Under review", approved:"Approved", scheduled:"Scheduled", collected:"Collected", transit:"In transit", received:"Received", disposed:"Disposed", certified:"Certified" };

// ---- Management dashboard ----
function AdminOverview() {
  const totalReq = MONTHLY.reduce((s, m) => s + m.requests, 0);
  const totalKg = MONTHLY.reduce((s, m) => s + m.kg, 0);
  const revenue = MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const certs = MONTHLY.reduce((s, m) => s + m.certs, 0);
  return (
    <>
      <PageHead eyebrow="LMHRA HQ · Monrovia" title="Management dashboard" desc="System-wide oversight across all facilities, the collection fleet and the Koko Town site." actions={<Btn kind="ghost" icon="download">Export report</Btn>} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 18 }}>
        <Stat label="Requests (6 mo)" num={totalReq} icon="file" delta="+19% QoQ" />
        <Stat label="Waste processed" num={fmtKg(totalKg)} icon="pkg" accent="var(--c-accent)" delta="+24% QoQ" />
        <Stat label="Revenue collected" num={fmtUSD(revenue)} icon="money" accent="var(--c-ok)" delta="+16% QoQ" />
        <Stat label="Certificates issued" num={certs} icon="cert" accent="var(--c-primary)" delta="98% on-time" deltaDir="flat" />
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr", marginBottom: 18 }}>
        <Card>
          <CardHead title="Waste processed & revenue" sub="Last 6 months" icon="chart" />
          <div className="card-pad"><BarChart data={MONTHLY} valKey="kg" color="var(--c-accent)" fmt={v => (v / 1000).toFixed(1) + "t"} height={190} /></div>
        </Card>
        <Card>
          <CardHead title="By county" sub="Waste origin" icon="pin" />
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {COUNTY.map(c => (
              <div key={c.name}>
                <div className="between" style={{ fontSize: 12.5, marginBottom: 5 }}><span style={{ fontWeight: 600 }}>{c.name}</span><span className="muted">{fmtKg(c.kg)}</span></div>
                <div className="pbar"><i style={{ width: c.share + "%" }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Card>
          <CardHead title="Pipeline by stage" sub="Live across all facilities" icon="layers" />
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {STAGES_LIST.map(key => {
              const n = REQUESTS.filter(r => r.stage === key).length;
              return (
                <div key={key} className="row" style={{ gap: 10 }}>
                  <span style={{ width: 110, fontSize: 12, color: "var(--c-ink-3)", fontWeight: 600 }}>{STAGE_LABELS[key]}</span>
                  <div className="pbar" style={{ flex: 1 }}><i style={{ width: Math.max(n * 18, n ? 12 : 0) + "%", background: n ? "var(--c-primary)" : "transparent" }} /></div>
                  <span style={{ width: 18, fontWeight: 700, fontSize: 13, textAlign: "right" }}>{n}</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <CardHead title="Recent activity" sub="System audit trail" icon="clock" />
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {AUDIT.slice(0, 6).map((a, i) => (
              <div key={i} className="row" style={{ alignItems: "flex-start", gap: 11, padding: "11px var(--pad)", borderBottom: "1px solid var(--c-line-2)" }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--c-bg-2)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", flex: "none" }}><Icon name="pen" size={14} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.action}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{a.actor} · {a.role} · {a.ref}</div>
                </div>
                <span className="muted" style={{ fontSize: 11, whiteSpace: "nowrap" }}>{a.ts.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

// ---- Reports ----
const REPORT_TABS = [
  { key: "ops", label: "Operational", icon: "file" },
  { key: "billing", label: "Billing & payment", icon: "money" },
  { key: "transport", label: "Collection & transport", icon: "truck" },
  { key: "receipt", label: "Receipt & verification", icon: "scale" },
  { key: "disposal", label: "Disposal & certificates", icon: "cert" },
  { key: "summary", label: "Management summary", icon: "trend" },
];

function AdminReports() {
  const [tab, setTab] = useState("ops");
  function Toolbar() {
    return (
      <div className="card-head">
        <div className="row" style={{ gap: 8 }}>
          <Select style={{ width: 150 }}><option>Last 6 months</option><option>This quarter</option><option>This month</option></Select>
          <Select style={{ width: 150 }}><option>All counties</option><option>Montserrado</option><option>Margibi</option></Select>
        </div>
        <div className="right"><Btn kind="ghost" size="sm" icon="print">Print</Btn><Btn kind="primary" size="sm" icon="download">Export CSV</Btn></div>
      </div>
    );
  }
  let content: React.ReactNode;
  if (tab === "ops") content = (
    <Card>
      <Toolbar />
      <table className="tbl"><thead><tr><th>Request</th><th>Facility</th><th>Submitted</th><th>Stage</th><th>Age (days)</th></tr></thead>
        <tbody>{REQUESTS.map(r => (
          <tr key={r.id}><td className="strong">{r.id}</td><td>{facById[r.facilityId].name}</td><td>{r.created}</td><td><StagePill stage={r.stage} /></td><td className="mono">{Math.floor((new Date("2026-06-04").getTime() - new Date(r.created).getTime()) / 86400000)}</td></tr>
        ))}</tbody>
      </table>
    </Card>
  );
  else if (tab === "billing") content = (
    <Card>
      <Toolbar />
      <table className="tbl"><thead><tr><th>Invoice</th><th>Facility</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
        <tbody>{REQUESTS.filter(r => r.invoice).map(r => (
          <tr key={r.id}><td className="strong">{r.invoice!.no}</td><td>{facById[r.facilityId].name}</td><td className="mono">{fmtUSD(r.invoice!.total)}</td><td className="muted">{r.invoice!.method}</td><td><Pill kind={r.invoice!.status === "Paid" ? "ok" : "warn"}>{r.invoice!.status}</Pill></td></tr>
        ))}</tbody>
      </table>
    </Card>
  );
  else if (tab === "transport") content = (
    <Card>
      <Toolbar />
      <table className="tbl"><thead><tr><th>Request</th><th>Facility</th><th>Driver</th><th>Collected</th><th>Variance</th><th>Cash</th></tr></thead>
        <tbody>{REQUESTS.filter(r => r.collection).map(r => (
          <tr key={r.id}><td className="strong">{r.id}</td><td>{facById[r.facilityId].name}</td><td>{r.collection!.verifiedBy}</td><td className="mono">{fmtKg(r.collection!.collectedKg)}</td><td>{r.collection!.variance > 0 ? "+" : ""}{r.collection!.variance} kg</td><td className="mono">{fmtUSD(r.collection!.paidAmount)}</td></tr>
        ))}</tbody>
      </table>
    </Card>
  );
  else if (tab === "receipt") content = (
    <Card>
      <Toolbar />
      <table className="tbl"><thead><tr><th>Receipt</th><th>Facility</th><th>Declared</th><th>Collected</th><th>Received</th><th>Reconciliation</th></tr></thead>
        <tbody>{REQUESTS.filter(r => r.receipt).map(r => (
          <tr key={r.id}><td className="strong">{r.receipt!.no}</td><td>{facById[r.facilityId].name}</td><td className="mono">{fmtKg(r.declaredKg)}</td><td className="mono">{fmtKg(r.collection!.collectedKg)}</td><td className="mono">{fmtKg(r.receipt!.weighbridgeKg)}</td><td><Pill kind="ok" dot={false}>{r.receipt!.match}</Pill></td></tr>
        ))}</tbody>
      </table>
    </Card>
  );
  else if (tab === "disposal") content = (
    <Card>
      <Toolbar />
      <table className="tbl"><thead><tr><th>Certificate</th><th>Facility</th><th>Method</th><th>Weight</th><th>Witness</th><th>Issued</th></tr></thead>
        <tbody>{REQUESTS.filter(r => r.certificate).map(r => (
          <tr key={r.id}><td className="strong">{r.certificate!.no}</td><td>{facById[r.facilityId].name}</td><td style={{ fontSize: 12 }}>{r.certificate!.method}</td><td className="mono">{fmtKg(r.certificate!.disposedKg)}</td><td>{r.certificate!.witness}</td><td>{r.certificate!.issued}</td></tr>
        ))}</tbody>
      </table>
    </Card>
  );
  else content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <Card><CardHead title="Monthly throughput & revenue" icon="trend" /><div className="card-pad"><BarChart data={MONTHLY} valKey="revenue" color="var(--c-ok)" fmt={v => "$" + (v / 1000).toFixed(1) + "k"} height={180} /></div></Card>
        <Card><CardHead title="Waste mix by category" icon="pkg" />
          <div className="card-pad" style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {WASTE.slice(0, 5).map((w, i) => { const share = [38, 22, 8, 16, 16][i]; return (
              <div key={w.code}><div className="between" style={{ fontSize: 12.5, marginBottom: 5 }}><span className="row"><HazardTag code={w.code} />{w.name}</span><span className="muted">{share}%</span></div><div className="pbar"><i style={{ width: share + "%", background: w.color }} /></div></div>
            ); })}
          </div>
        </Card>
      </div>
      <Card className="card-pad" style={{ background: "var(--c-primary)", color: "#fff" }}>
        <div className="row" style={{ justifyContent: "space-around", textAlign: "center" }}>
          {[["98%", "On-time certification"], ["2.1%", "Avg. weight variance"], ["$44.4k", "Revenue YTD"], ["0", "Compliance breaches"]].map(([n, l]) => (
            <div key={String(l)}><div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700 }}>{n}</div><div style={{ fontSize: 12.5, color: "rgba(255,255,255,.78)" }}>{l}</div></div>
          ))}
        </div>
      </Card>
    </div>
  );
  return (
    <>
      <PageHead eyebrow="Reporting hierarchy" title="Reports" desc="Operational up to leadership — each report rolls into the management summary." />
      <div className="wrap" style={{ marginBottom: 18, gap: 8 }}>
        {REPORT_TABS.map(t => (
          <button key={t.key} className={"btn " + (tab === t.key ? "btn-primary" : "btn-ghost")} onClick={() => setTab(t.key)}><Icon name={t.icon} size={15} />{t.label}</button>
        ))}
      </div>
      {content}
    </>
  );
}

// ---- Users & Roles ----
const ROLE_ROWS = [
  { name: "James Doe", role: "Facility Officer", org: "Lucky Pharmacy", layer: "L1 · Data capture", access: "Own facility", status: "Active" },
  { name: "P. Nyema", role: "Facility Officer", org: "JFK Medical Center", layer: "L1 · Data capture", access: "Own facility", status: "Active" },
  { name: "Emmanuel Weah", role: "Collection Driver", org: "LMHRA Transport", layer: "L1–L2 · Capture & verify", access: "Assigned jobs", status: "Active" },
  { name: "Grace Mulbah", role: "Site Verification Officer", org: "Koko Town WMS", layer: "L2 · Verification", access: "Site operations", status: "Active" },
  { name: "R. Sumo", role: "Disposal Inspector", org: "Koko Town WMS", layer: "L2–L3 · Verify & report", access: "Disposal & certs", status: "Active" },
  { name: "Dr. T. Karnga", role: "System Administrator", org: "LMHRA HQ", layer: "L4 · Governance", access: "Full system", status: "Active" },
  { name: "Hon. Commissioner", role: "Leadership (read-only)", org: "LMHRA HQ", layer: "L4 · Governance", access: "Dashboards & reports", status: "Active" },
];

function AdminUsers() {
  return (
    <>
      <PageHead eyebrow="Access control" title="Users & roles" desc="Role-based access — each user sees only the modules and reports for their layer." actions={<Btn kind="primary" icon="plus">Add user</Btn>} />
      <Card>
        <CardHead title="System users" sub={ROLE_ROWS.length + " accounts across 4 layers"} icon="users" />
        <table className="tbl"><thead><tr><th>User</th><th>Role</th><th>Organisation</th><th>System layer</th><th>Data access</th><th>Status</th></tr></thead>
          <tbody>{ROLE_ROWS.map(u => (
            <tr key={u.name}>
              <td><div className="row"><span className="sb-avatar" style={{ width: 28, height: 28, fontSize: 11, background: "var(--c-primary)" }}>{u.name.split(" ").map(x => x[0]).join("").slice(0, 2)}</span><span className="strong">{u.name}</span></div></td>
              <td>{u.role}</td><td className="muted">{u.org}</td><td><span className="tag">{u.layer}</span></td><td className="muted">{u.access}</td><td><Pill kind="ok">{u.status}</Pill></td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Audit trail ----
function AdminAudit() {
  return (
    <>
      <PageHead eyebrow="Compliance" title="Audit trail" desc="Immutable log of every action across the workflow — the backbone of verification." actions={<Btn kind="ghost" icon="download">Export</Btn>} />
      <Card>
        <table className="tbl"><thead><tr><th>Timestamp</th><th>Actor</th><th>Role</th><th>Action</th><th>Reference</th><th>Detail</th></tr></thead>
          <tbody>{AUDIT.map((a, i) => (
            <tr key={i}><td className="mono" style={{ fontSize: 12 }}>{a.ts}</td><td className="strong">{a.actor}</td><td><Pill kind="neutral" dot={false}>{a.role}</Pill></td><td>{a.action}</td><td><span className="tag">{a.ref}</span></td><td className="muted" style={{ fontSize: 12 }}>{a.detail}</td></tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Fee schedule ----
function AdminFees() {
  return (
    <>
      <PageHead eyebrow="Configuration" title="Fee schedule" desc="Tariffs applied to every request. Updates are versioned in the audit trail." actions={<Btn kind="primary" icon="check">Save changes</Btn>} />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.3fr" }}>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Standard charges</div>
          <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
            <Field label="Base handling (USD / request)"><Input defaultValue={String(FEES.baseHandling)} type="number" /></Field>
            <Field label="Transport (USD / km)"><Input defaultValue={String(FEES.transportPerKm)} type="number" /></Field>
            <Field label="Certificate issuance (USD)"><Input defaultValue={String(FEES.certificate)} type="number" /></Field>
          </div>
          <div className="divider" />
          <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>{FEES.note}</div>
        </Card>
        <Card>
          <CardHead title="Per-category handling rate" sub="USD per kg" icon="pkg" />
          <table className="tbl"><thead><tr><th>Category</th><th>Hazard</th><th>Rate / kg</th></tr></thead>
            <tbody>{WASTE.map(w => (
              <tr key={w.code}>
                <td><div className="row"><HazardTag code={w.code} />{w.name}</div></td>
                <td><Pill kind={w.hazard === "high" ? "danger" : "warn"} dot={false}>{w.hazard}</Pill></td>
                <td><Input defaultValue={String(w.ratePerKg)} type="number" style={{ width: 90 }} /></td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

// ---- Admin App ----
export default function AdminApp({ layout = "sidebar" }: { layout?: string }) {
  const user = USERS.admin;
  const [page, setPage] = useState("dash");
  const nav = [
    { section: "Oversight", items: [{ key: "dash", label: "Management dashboard", icon: "grid" }, { key: "reports", label: "Reports", icon: "chart" }, { key: "audit", label: "Audit trail", icon: "shield" }] },
    { section: "Administration", items: [{ key: "users", label: "Users & roles", icon: "users" }, { key: "fees", label: "Fee schedule", icon: "money" }] },
  ];
  const titles: Record<string, string> = { dash: "Management dashboard", reports: "Reports", audit: "Audit trail", users: "Users & roles", fees: "Fee schedule" };
  let view: React.ReactNode;
  if (page === "dash") view = <AdminOverview />;
  else if (page === "reports") view = <AdminReports />;
  else if (page === "audit") view = <AdminAudit />;
  else if (page === "users") view = <AdminUsers />;
  else if (page === "fees") view = <AdminFees />;
  return (
    <DeskShell nav={nav} active={page} onNav={setPage} user={user} roleLabel="Administrator" layout={layout} title={titles[page]} crumb="LMHRA HQ · Monrovia">
      {view}
    </DeskShell>
  );
}
