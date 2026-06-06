'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { REQUESTS, USERS, WASTE, facById, fmtUSD, fmtKg, wasteByCode, computeFee, Request } from '../../lib/data';
import { Btn, StagePill, HazardTag, Pill, Card, CardHead, Stat, Field, Input, Textarea, Select, Stepper, PageHead, useToast } from '../../components/ui';
import { DeskShell } from '../../components/layout';
import RequestDrawer from '../../components/RequestDrawer';
import Icon from '../../components/Icon';

// ---- Dashboard ----
function ClientDashboard({ reqs, onOpen, onNew }: { reqs: Request[]; onOpen: (r: Request | string) => void; onNew: () => void }) {
  const active = reqs.filter((r) => r.stage !== "certified");
  const certified = reqs.filter((r) => r.stage === "certified");
  const totalKg = reqs.reduce((s, r) => s + r.declaredKg, 0);
  const pendingPay = reqs.filter((r) => r.invoice && r.invoice.status !== "Paid").length;
  return (
    <>
      <PageHead eyebrow="Lucky Pharmacy (Sinkor)" title="Facility dashboard" desc="Submit and track your pharmaceutical waste disposal requests through to certification."
        actions={<Btn kind="primary" icon="plus" onClick={onNew}>New disposal request</Btn>} />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 18 }}>
        <Stat label="Active requests" num={active.length} icon="file" delta="2 awaiting collection" deltaDir="flat" />
        <Stat label="Waste declared (YTD)" num={fmtKg(totalKg)} icon="pkg" accent="var(--c-accent)" delta="+18% vs last yr" />
        <Stat label="Certificates issued" num={certified.length} icon="cert" accent="var(--c-ok)" delta="all compliant" deltaDir="flat" />
        <Stat label="Awaiting payment" num={pendingPay} icon="money" accent="var(--c-warn)" delta="cash on collection" deltaDir="flat" />
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1.7fr 1fr" }}>
        <Card>
          <CardHead title="Your requests" sub="Most recent first" icon="file"
            right={<Btn kind="ghost" size="sm" iconR="arrowR" onClick={() => onOpen("__all")}>View all</Btn>} />
          <table className="tbl">
            <thead><tr><th>Request</th><th>Declared</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reqs.slice(0, 5).map((r) => (
                <tr key={r.id} className="clickable" onClick={() => onOpen(r)}>
                  <td><div className="strong">{r.id}</div><div className="muted" style={{ fontSize: 11.5 }}>{r.created}</div></td>
                  <td className="mono">{fmtKg(r.declaredKg)}</td>
                  <td><StagePill stage={r.stage} /></td>
                  <td style={{ textAlign: "right" }}><Icon name="chevR" size={16} className="muted" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Next collection</div>
          <div className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>Scheduled pickup from your facility</div>
          {(() => {
            const next = reqs.find((r) => r.stage === "scheduled" && r.schedule);
            if (!next || !next.schedule || !next.invoice) return <div className="ph" style={{ height: 120 }}>No collection scheduled</div>;
            return (
              <div style={{ background: "var(--c-primary-soft)", borderRadius: 12, padding: 16 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--c-primary)" }}>{next.schedule.date}</div>
                  <Icon name="calendar" size={20} style={{ color: "var(--c-primary)" }} />
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Window {next.schedule.window}</div>
                <div className="divider" style={{ margin: "12px 0" }} />
                <div className="kv" style={{ marginBottom: 8 }}><div className="k">Request</div><div className="v" style={{ fontSize: 13 }}>{next.id}</div></div>
                <div className="kv" style={{ marginBottom: 8 }}><div className="k">Driver</div><div className="v" style={{ fontSize: 13 }}>{next.schedule.driver}</div></div>
                <div className="kv"><div className="k">Pay on collection</div><div className="v" style={{ fontSize: 13 }}>{fmtUSD(next.invoice.total)} cash</div></div>
              </div>
            );
          })()}
          <div className="divider" />
          <div style={{ fontWeight: 600, fontSize: 12.5, marginBottom: 8 }}>Need help?</div>
          <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Collection enquiries: <strong style={{ color: "var(--c-ink)" }}>LMHRA Transport Unit</strong> · +231 77 000 0000</div>
        </Card>
      </div>
    </>
  );
}

// ---- New Request ----
function NewRequest({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Record<string, { kg: string; units: string; pkg: string }>>({});
  const [meta, setMeta] = useState({ priority: "Normal", window: "", contact: "James Doe", access: "", notes: "", consent: false });
  const steps = ["Waste declaration", "Collection details", "Review & fees"];

  function toggle(code: string) {
    setSel((s) => {
      const n = { ...s };
      if (n[code]) delete n[code];
      else n[code] = { kg: "", units: "", pkg: "Sealed drums" };
      return n;
    });
  }

  const lines = Object.entries(sel).map(([code, v]) => ({ code, declaredKg: +v.kg || 0, units: +v.units || 0, packaging: v.pkg }));
  const fee = computeFee("F-1067", lines.length ? lines : [{ code: "EXP", declaredKg: 0 }]);
  const totalKg = lines.reduce((s, l) => s + l.declaredKg, 0);
  const canStep0 = lines.length > 0 && lines.every((l) => l.declaredKg > 0);
  const fac = facById["F-1067"];

  function submit() { toast("Request submitted — WDR-2406-0148 created"); onDone(); }

  const declaration = (
    <Card className="card-pad">
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Select waste categories</div>
      <p className="muted" style={{ fontSize: 12.5, marginBottom: 14 }}>Declare each category you need disposed. This is verified at collection and again at the Koko Town site.</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {WASTE.map((w) => {
          const on = !!sel[w.code];
          return (
            <div key={w.code} className="checkrow" data-on={on ? "true" : "false"} onClick={() => toggle(w.code)} style={{ alignItems: "flex-start", cursor: "pointer" }}>
              <input type="checkbox" checked={on} readOnly style={{ marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600 }}>{w.name}</span><HazardTag code={w.code} />
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>{w.note} · {fmtUSD(w.ratePerKg)}/kg</div>
              </div>
            </div>
          );
        })}
      </div>
      {lines.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Quantities</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.keys(sel).map((code) => (
              <div key={code} className="row" style={{ gap: 12, background: "var(--c-bg-2)", padding: 12, borderRadius: 10 }}>
                <div className="row" style={{ width: 200 }}>
                  <HazardTag code={code} />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{wasteByCode[code].name}</span>
                </div>
                <Input type="number" placeholder="kg" value={sel[code].kg} onChange={(e) => setSel((s) => ({ ...s, [code]: { ...s[code], kg: e.target.value } }))} style={{ width: 90 }} />
                <Input type="number" placeholder="units" value={sel[code].units} onChange={(e) => setSel((s) => ({ ...s, [code]: { ...s[code], units: e.target.value } }))} style={{ width: 90 }} />
                <Select value={sel[code].pkg} onChange={(e) => setSel((s) => ({ ...s, [code]: { ...s[code], pkg: e.target.value } }))} style={{ flex: 1 }}>
                  {["Sealed drums", "Quarantine bags", "Sharps boxes", "Yellow rigid bins", "Cold box", "Jerry cans"].map((p) => <option key={p}>{p}</option>)}
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  const details = (
    <Card className="card-pad">
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Collection details</div>
      <div className="form-grid">
        <Field label="Priority">
          <Select value={meta.priority} onChange={(e) => setMeta({ ...meta, priority: e.target.value })}>
            <option>Normal</option><option>High</option><option>Urgent (hazardous)</option>
          </Select>
        </Field>
        <Field label="Preferred collection window">
          <Select value={meta.window} onChange={(e) => setMeta({ ...meta, window: e.target.value })}>
            <option value="">Select…</option><option>09:00–11:00</option><option>11:00–13:00</option><option>13:00–15:00</option>
          </Select>
        </Field>
        <Field label="On-site contact" req><Input value={meta.contact} onChange={(e) => setMeta({ ...meta, contact: e.target.value })} /></Field>
        <Field label="Contact phone"><Input defaultValue="+231 88 220 5512" /></Field>
        <Field label="Access notes" span hint="Loading bay, opening hours, gate code, etc.">
          <Textarea value={meta.access} onChange={(e) => setMeta({ ...meta, access: e.target.value })} placeholder="e.g. Rear loading bay, open 8am–4pm, ask for pharmacy store" />
        </Field>
        <Field label="Additional notes" span>
          <Textarea value={meta.notes} onChange={(e) => setMeta({ ...meta, notes: e.target.value })} />
        </Field>
      </div>
    </Card>
  );

  const review = (
    <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
      <Card>
        <CardHead title="Declaration summary" icon="clipboard" />
        <table className="tbl">
          <thead><tr><th>Category</th><th>Declared</th><th>Units</th></tr></thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.code}>
                <td><div className="row"><HazardTag code={l.code} />{wasteByCode[l.code].name}</div></td>
                <td className="mono">{l.declaredKg} kg</td>
                <td>{l.units}</td>
              </tr>
            ))}
            <tr><td className="strong">Total</td><td className="mono">{totalKg} kg</td><td></td></tr>
          </tbody>
        </table>
        <div className="card-pad">
          <label className="checkrow" data-on={meta.consent ? "true" : "false"} style={{ cursor: "pointer" }}>
            <input type="checkbox" checked={meta.consent} onChange={(e) => setMeta({ ...meta, consent: e.target.checked })} />
            <span style={{ fontSize: 12.5 }}>I confirm this declaration is accurate and consent to <strong>cash payment on collection</strong>. I understand weights are verified at collection and at the Koko Town site.</span>
          </label>
        </div>
      </Card>
      <Card className="card-pad" style={{ alignSelf: "flex-start" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Estimated fees</div>
        <div className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Final amount confirmed at collection</div>
        {[["Base handling", fee.base], ["Transport (" + fac.km + " km)", fee.transport], ["Category handling", fee.handling], ["Certificate", fee.cert]].map(([k, v]) => (
          <div key={k as string} className="between" style={{ fontSize: 13, padding: "7px 0", borderBottom: "1px solid var(--c-line-2)" }}>
            <span className="muted">{k}</span>
            <span className="mono">{fmtUSD(v as number)}</span>
          </div>
        ))}
        <div className="between" style={{ marginTop: 12 }}>
          <span style={{ fontWeight: 700 }}>Total (cash)</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--c-primary)" }}>{fmtUSD(fee.total)}</span>
        </div>
        <Btn kind="primary" size="lg" icon="check" disabled={!meta.consent} style={{ width: "100%", marginTop: 16 }} onClick={submit}>
          Submit request
        </Btn>
      </Card>
    </div>
  );

  return (
    <>
      <PageHead eyebrow="New disposal request" title="Submit waste for disposal" desc="Three steps — declaration, collection details, then review." />
      <Stepper steps={steps} current={step} />
      <div style={{ marginBottom: 18 }}>{step === 0 ? declaration : step === 1 ? details : review}</div>
      <div className="between">
        <Btn kind="ghost" icon="back" onClick={() => (step === 0 ? onDone() : setStep(step - 1))}>{step === 0 ? "Cancel" : "Back"}</Btn>
        {step < 2 && <Btn kind="primary" iconR="arrowR" disabled={step === 0 && !canStep0} onClick={() => setStep(step + 1)}>Continue</Btn>}
      </div>
    </>
  );
}

// ---- Requests list ----
function ClientRequests({ reqs, onOpen }: { reqs: Request[]; onOpen: (r: Request) => void }) {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? reqs : reqs.filter((r) => filter === "active" ? r.stage !== "certified" : r.stage === "certified");
  return (
    <>
      <PageHead eyebrow="Tracking" title="My requests" desc="Every disposal request from your facility, with live status." />
      <Card>
        <div className="card-head">
          <div className="row" style={{ gap: 6 }}>
            {[["all", "All"], ["active", "Active"], ["certified", "Completed"]].map(([k, l]) => (
              <button key={k} className={"btn btn-sm " + (filter === k ? "btn-soft" : "btn-ghost")} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="right"><span className="muted" style={{ fontSize: 12.5 }}>{shown.length} requests</span></div>
        </div>
        <table className="tbl">
          <thead><tr><th>Request</th><th>Submitted</th><th>Categories</th><th>Declared</th><th>Invoice</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="clickable" onClick={() => onOpen(r)}>
                <td className="strong">{r.id}</td>
                <td>{r.created}</td>
                <td><div className="wrap">{r.lines.map((l) => <HazardTag key={l.code} code={l.code} />)}</div></td>
                <td className="mono">{fmtKg(r.declaredKg)}</td>
                <td>{r.invoice ? <span className="mono">{fmtUSD(r.invoice.total)}</span> : <span className="muted">—</span>}</td>
                <td><StagePill stage={r.stage} /></td>
                <td style={{ textAlign: "right" }}><Icon name="chevR" size={16} className="muted" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Billing ----
function ClientBilling({ reqs, onOpen }: { reqs: Request[]; onOpen: (r: Request) => void }) {
  const withInv = reqs.filter((r) => r.invoice);
  const paid = withInv.filter((r) => r.invoice!.status === "Paid").reduce((s, r) => s + r.invoice!.total, 0);
  const due = withInv.filter((r) => r.invoice!.status !== "Paid").reduce((s, r) => s + r.invoice!.total, 0);
  return (
    <>
      <PageHead eyebrow="Finance" title="Billing & invoices" desc="All settled on cash payment at the point of collection." />
      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}>
        <Stat label="Paid (YTD)" num={fmtUSD(paid)} icon="check" accent="var(--c-ok)" />
        <Stat label="Due on collection" num={fmtUSD(due)} icon="money" accent="var(--c-warn)" />
        <Stat label="Invoices" num={withInv.length} icon="invoice" />
      </div>
      <Card>
        <CardHead title="Invoices" icon="invoice" />
        <table className="tbl">
          <thead><tr><th>Invoice</th><th>Request</th><th>Amount</th><th>Method</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {withInv.map((r) => (
              <tr key={r.id} className="clickable" onClick={() => onOpen(r)}>
                <td className="strong">{r.invoice!.no}</td>
                <td>{r.id}</td>
                <td className="mono">{fmtUSD(r.invoice!.total)}</td>
                <td className="muted">{r.invoice!.method}</td>
                <td><Pill kind={r.invoice!.status === "Paid" ? "ok" : "warn"}>{r.invoice!.status}</Pill></td>
                <td style={{ textAlign: "right" }}>
                  <Btn kind="ghost" size="sm" icon="download" onClick={(e) => e.stopPropagation()}>PDF</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Schedule ----
function ClientSchedule({ reqs }: { reqs: Request[] }) {
  const upcoming = reqs.filter((r) => r.schedule && ["scheduled", "collected", "transit"].includes(r.stage));
  return (
    <>
      <PageHead eyebrow="Logistics" title="Collection schedule" desc="Confirmed pickups from your facility." />
      {upcoming.length === 0
        ? <Card className="card-pad"><div className="ph" style={{ height: 140 }}>No scheduled collections</div></Card>
        : (
          <div className="grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
            {upcoming.map((r) => (
              <Card key={r.id} className="card-pad">
                <div className="between">
                  <div className="row">
                    <Icon name="calendar" size={18} style={{ color: "var(--c-primary)" }} />
                    <span style={{ fontWeight: 700 }}>{r.schedule!.date}</span>
                  </div>
                  <StagePill stage={r.stage} />
                </div>
                <div className="divider" style={{ margin: "12px 0" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="kv"><div className="k">Window</div><div className="v" style={{ fontSize: 13 }}>{r.schedule!.window}</div></div>
                  <div className="kv"><div className="k">Request</div><div className="v" style={{ fontSize: 13 }}>{r.id}</div></div>
                  <div className="kv"><div className="k">Driver</div><div className="v" style={{ fontSize: 13 }}>{r.schedule!.driver}</div></div>
                  <div className="kv"><div className="k">Vehicle</div><div className="v" style={{ fontSize: 13 }}>{r.schedule!.vehicle}</div></div>
                </div>
              </Card>
            ))}
          </div>
        )}
    </>
  );
}

// ---- Certificates ----
function ClientCerts({ reqs, onOpen }: { reqs: Request[]; onOpen: (r: Request) => void }) {
  const certs = reqs.filter((r) => r.certificate);
  return (
    <>
      <PageHead eyebrow="Records" title="Disposal certificates" desc="Downloadable clearance certificates for completed disposals." />
      <div className="grid" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {certs.map((r) => (
          <Card key={r.id} className="card-pad" style={{ borderLeft: "3px solid var(--c-ok)" }}>
            <div className="between">
              <div className="row">
                <span style={{ width: 38, height: 38, borderRadius: 9, background: "var(--c-ok-soft)", color: "var(--c-ok)", display: "grid", placeItems: "center" }}>
                  <Icon name="cert" size={19} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.certificate!.no}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>Issued {r.certificate!.issued}</div>
                </div>
              </div>
              <Pill kind="ok">Valid</Pill>
            </div>
            <div className="divider" style={{ margin: "12px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div className="kv"><div className="k">Request</div><div className="v" style={{ fontSize: 12.5 }}>{r.id}</div></div>
              <div className="kv"><div className="k">Disposed</div><div className="v" style={{ fontSize: 12.5 }}>{fmtKg(r.certificate!.disposedKg)}</div></div>
              <div className="kv" style={{ gridColumn: "span 2" }}><div className="k">Method</div><div className="v" style={{ fontSize: 12.5 }}>{r.certificate!.method}</div></div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <Btn kind="primary" size="sm" icon="download" style={{ flex: 1 }}>Download PDF</Btn>
              <Btn kind="ghost" size="sm" icon="eye" onClick={() => onOpen(r)}>View</Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

// ---- Profile ----
function ClientProfile() {
  const fac = facById["F-1067"];
  return (
    <>
      <PageHead eyebrow="Account" title="Facility profile" desc="Your registered facility details (Form F1). Kept current for licensing & collection."
        actions={<Btn kind="ghost" icon="pen">Edit</Btn>} />
      <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <Card>
          <CardHead title="Registration details" icon="building" right={<Pill kind="ok">{fac.status}</Pill>} />
          <div className="card-pad form-grid">
            <div className="kv"><div className="k">Facility name</div><div className="v">{fac.name}</div></div>
            <div className="kv"><div className="k">Type</div><div className="v">{fac.type}</div></div>
            <div className="kv"><div className="k">LMHRA license</div><div className="v">{fac.license}</div></div>
            <div className="kv"><div className="k">Facility ID</div><div className="v">{fac.id}</div></div>
            <div className="kv"><div className="k">County</div><div className="v">{fac.county}</div></div>
            <div className="kv"><div className="k">City</div><div className="v">{fac.city}</div></div>
            <div className="kv"><div className="k">Responsible officer</div><div className="v">{fac.contact}</div></div>
            <div className="kv"><div className="k">Phone</div><div className="v">{fac.phone}</div></div>
            <div className="kv"><div className="k">Distance to Koko Town</div><div className="v">{fac.km} km</div></div>
          </div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>License document</div>
          <div className="ph" style={{ height: 180 }}>LMHRA license scan</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Renewed annually. Required for disposal eligibility.</div>
        </Card>
      </div>
    </>
  );
}

// ---- ClientApp shell ----
export default function ClientApp({ layout = "sidebar" }: { layout?: string }) {
  const user = USERS.client;
  const myReqs = useMemo(() => REQUESTS.filter((r) => r.facilityId === user.facilityId), []);
  const active = myReqs.filter((r) => r.stage !== "certified").length;
  const [page, setPage] = useState("dash");
  const [open, setOpen] = useState<Request | null>(null);

  const nav = [
    { section: "Workspace", items: [
      { key: "dash", label: "Dashboard", icon: "grid" },
      { key: "new", label: "New request", icon: "filePlus" },
    ]},
    { section: "Track", items: [
      { key: "requests", label: "My requests", icon: "file", badge: active },
      { key: "schedule", label: "Schedule", icon: "calendar" },
    ]},
    { section: "Finance & records", items: [
      { key: "billing", label: "Billing & invoices", icon: "invoice" },
      { key: "certs", label: "Certificates", icon: "cert" },
      { key: "profile", label: "Facility profile", icon: "building" },
    ]},
  ];

  const titles: Record<string, string> = { dash: "Dashboard", new: "New request", requests: "My requests", schedule: "Schedule", billing: "Billing & invoices", certs: "Certificates", profile: "Facility profile" };

  function openReq(r: Request | string) { if (r === "__all") { setPage("requests"); return; } setOpen(r as Request); }

  let view;
  if (page === "dash") view = <ClientDashboard reqs={myReqs} onOpen={openReq} onNew={() => setPage("new")} />;
  else if (page === "new") view = <NewRequest onDone={() => setPage("requests")} />;
  else if (page === "requests") view = <ClientRequests reqs={myReqs} onOpen={setOpen} />;
  else if (page === "schedule") view = <ClientSchedule reqs={myReqs} />;
  else if (page === "billing") view = <ClientBilling reqs={myReqs} onOpen={setOpen} />;
  else if (page === "certs") view = <ClientCerts reqs={myReqs} onOpen={setOpen} />;
  else view = <ClientProfile />;

  return (
    <>
      <DeskShell nav={nav} active={page} onNav={setPage} user={user} roleLabel="Facility User" layout={layout} title={titles[page]} crumb={"Facility · " + user.org}>
        {view}
      </DeskShell>
      <RequestDrawer req={open} onClose={() => setOpen(null)} />
    </>
  );
}
