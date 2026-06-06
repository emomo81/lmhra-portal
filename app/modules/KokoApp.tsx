'use client';
import React, { useState } from 'react';
import { REQUESTS, USERS, facById, fmtUSD, fmtKg, wasteByCode, Request } from '../../lib/data';
import { Btn, StagePill, HazardTag, Pill, Card, CardHead, Stat, Field, Input, Select, PageHead, Modal, Drawer, useToast } from '../../components/ui';
import { DeskShell } from '../../components/layout';
import RequestDrawer from '../../components/RequestDrawer';
import Icon from '../../components/Icon';

// ---- Receipt Form (F6) ----
function ReceiptForm({ job, onClose, onConfirm }: { job: Request; onClose: () => void; onConfirm: () => void }) {
  const toast = useToast();
  const fac = facById[job.facilityId];
  const [wb, setWb] = useState("");
  const [sealOk, setSealOk] = useState(false);
  const [bay, setBay] = useState("Bay 1");
  const [decision, setDecision] = useState("accept");
  const wbn = +wb || 0;
  const vDeclared = +(wbn - job.declaredKg).toFixed(1);
  const vCollected = job.collection ? +(wbn - job.collection.collectedKg).toFixed(1) : 0;
  const within = job.collection ? Math.abs(vCollected) <= job.collection.collectedKg * 0.03 : false;
  const canDone = wbn > 0 && sealOk;
  return (
    <Drawer open={!!job} onClose={onClose}>
      <div className="drawer-head">
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={17} /></button>
        <div style={{ flex: 1 }}><div className="muted" style={{ fontSize: 12 }}>Form F6 · Waste receipt &amp; reconciliation</div><div style={{ fontWeight: 700, fontSize: 16, fontFamily: "var(--font-display)" }}>{job.id}</div></div>
        <span className="tag" style={{ color: "var(--c-accent)" }}>Seal {job.collection?.sealNo}</span>
      </div>
      <div style={{ padding: "20px var(--pad)", display: "flex", flexDirection: "column", gap: 16 }}>
        <Card className="card-pad">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div><div style={{ fontWeight: 700 }}>{fac.name}</div><div className="muted" style={{ fontSize: 12 }}>Arrived {job.collection?.time} · {job.collection?.verifiedBy}</div></div>
            <Icon name="truck" size={20} style={{ color: "var(--c-accent)" }} />
          </div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>Weighbridge reading</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Enter the gross verified weight at the Koko Town weighbridge.</div>
          <div className="row" style={{ gap: 10 }}>
            <Input type="number" placeholder="kg" value={wb} onChange={e => setWb(e.target.value)} style={{ flex: 1, fontSize: 18, fontWeight: 700 }} />
            <Select value={bay} onChange={e => setBay(e.target.value)} style={{ width: 120 }}><option>Bay 1</option><option>Bay 2</option><option>Bay 3</option></Select>
          </div>
        </Card>
        <Card>
          <CardHead title="Three-way reconciliation" sub="Declared → Collected → Received" icon="scale" />
          <table className="tbl">
            <thead><tr><th>Stage</th><th>Weight</th><th>Δ vs received</th></tr></thead>
            <tbody>
              <tr><td>Declared by facility</td><td className="mono">{fmtKg(job.declaredKg)}</td><td>{wbn ? (vDeclared > 0 ? "+" : "") + vDeclared + " kg" : "—"}</td></tr>
              <tr><td>Collected (field)</td><td className="mono">{fmtKg(job.collection?.collectedKg || 0)}</td><td>{wbn ? (vCollected > 0 ? "+" : "") + vCollected + " kg" : "—"}</td></tr>
              <tr><td className="strong">Received (weighbridge)</td><td className="mono">{wbn ? fmtKg(wbn) : "—"}</td><td>{wbn ? <Pill kind={within ? "ok" : "warn"} dot={false}>{within ? "Within tolerance" : "Review variance"}</Pill> : "—"}</td></tr>
            </tbody>
          </table>
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Category confirmation</div>
          <div className="wrap">{job.lines.map(l => <span key={l.code} className="checkrow" data-on="true" style={{ flex: "none" }}><Icon name="check" size={14} style={{ color: "var(--c-accent)" }} /><HazardTag code={l.code} />{wasteByCode[l.code]?.name}</span>)}</div>
          <label className="checkrow" data-on={String(sealOk)} style={{ cursor: "pointer", marginTop: 12 }}><input type="checkbox" checked={sealOk} onChange={e => setSealOk(e.target.checked)} />Seal {job.collection?.sealNo} verified intact on arrival</label>
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Decision</div>
          <div className="row" style={{ gap: 8 }}>
            {[["accept", "Accept", "ok"], ["hold", "Hold for review", "warn"], ["reject", "Reject", "danger"]].map(([k, l, c]) => (
              <button key={k} className={"btn btn-sm " + (decision === k ? "btn-soft" : "btn-ghost")} style={decision === k ? { background: `var(--c-${c}-soft)`, color: `var(--c-${c})` } : {}} onClick={() => setDecision(k)}>{l}</button>
            ))}
          </div>
        </Card>
        <Btn kind="primary" size="lg" icon="check" disabled={!canDone} style={{ width: "100%" }} onClick={() => { toast("Receipt reconciled — RCV-" + job.id.slice(-4)); onConfirm(); }}>Confirm receipt &amp; reconcile</Btn>
      </div>
    </Drawer>
  );
}

// ---- Disposal Form (F7) ----
function DisposalForm({ job, onClose, onConfirm }: { job: Request; onClose: () => void; onConfirm: () => void }) {
  const toast = useToast();
  const [method, setMethod] = useState("High-temperature incineration (1120°C)");
  const [batch, setBatch] = useState("");
  const [witness, setWitness] = useState("");
  const [done, setDone] = useState(false);
  const canDone = batch && witness && done;
  return (
    <Modal open={!!job} onClose={onClose}>
      <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--c-line)" }} className="between">
        <div><div className="muted" style={{ fontSize: 12 }}>Form F7 · Disposal / treatment record</div><div style={{ fontWeight: 700, fontSize: 16 }}>{job.id}</div></div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="row" style={{ justifyContent: "space-between", background: "var(--c-bg-2)", padding: 12, borderRadius: 10 }}>
          <span style={{ fontSize: 13 }}>{facById[job.facilityId].name}</span><span style={{ fontWeight: 700 }}>{fmtKg(job.receipt?.weighbridgeKg || 0)}</span>
        </div>
        <Field label="Disposal method" req><Select value={method} onChange={e => setMethod(e.target.value)}><option>High-temperature incineration (1120°C)</option><option>Encapsulation &amp; secure landfill</option><option>Chemical neutralisation</option><option>Witnessed destruction (controlled)</option></Select></Field>
        <div className="form-grid">
          <Field label="Batch / run no." req><Input placeholder="INC-2026-0xxx" value={batch} onChange={e => setBatch(e.target.value)} /></Field>
          <Field label="Disposal date" req><Input type="date" defaultValue="2026-06-04" /></Field>
        </div>
        <Field label="Witnessing inspector" req><Input placeholder="LMHRA Inspector name" value={witness} onChange={e => setWitness(e.target.value)} /></Field>
        <label className="checkrow" data-on={String(done)} style={{ cursor: "pointer" }}><input type="checkbox" checked={done} onChange={e => setDone(e.target.checked)} />Disposal completed &amp; witnessed per LMHRA protocol</label>
        <Btn kind="primary" icon="check" disabled={!canDone} onClick={() => { toast("Disposal logged for " + job.id); onConfirm(); }}>Log disposal</Btn>
      </div>
    </Modal>
  );
}

// ---- Certificate Form (F8) ----
function CertForm({ job, onClose, onConfirm }: { job: Request; onClose: () => void; onConfirm: () => void }) {
  const toast = useToast();
  const fac = facById[job.facilityId];
  const certNo = "LMHRA-DC-2026-0" + (90 + (+job.id.slice(-2) || 0));
  return (
    <Modal open={!!job} onClose={onClose}>
      <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--c-line)" }} className="between">
        <div><div className="muted" style={{ fontSize: 12 }}>Form F8 · Clearance certificate</div><div style={{ fontWeight: 700, fontSize: 16 }}>Issue certificate</div></div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ padding: 22 }}>
        <div style={{ border: "2px solid var(--c-primary)", borderRadius: 12, padding: 20, background: "linear-gradient(180deg, var(--c-primary-soft), #fff)" }}>
          <div className="between" style={{ marginBottom: 14 }}>
            <div className="row">
              <img src="/logo.png" alt="LMHRA" style={{ height: 30, display: "block" }} />
              <div className="muted" style={{ fontSize: 10.5, fontWeight: 600 }}>Certificate of Disposal</div>
            </div>
            <div style={{ width: 46, height: 46 }} className="ph">QR</div>
          </div>
          <div className="kv" style={{ marginBottom: 10 }}><div className="k">Certificate no.</div><div className="v" style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{certNo}</div></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="kv"><div className="k">Facility</div><div className="v" style={{ fontSize: 12.5 }}>{fac.name}</div></div>
            <div className="kv"><div className="k">Request</div><div className="v" style={{ fontSize: 12.5 }}>{job.id}</div></div>
            <div className="kv"><div className="k">Final weight</div><div className="v" style={{ fontSize: 12.5 }}>{fmtKg(job.receipt?.weighbridgeKg || 0)}</div></div>
            <div className="kv"><div className="k">Method</div><div className="v" style={{ fontSize: 12.5 }}>Incineration 1120°C</div></div>
          </div>
        </div>
        <Btn kind="primary" icon="cert" style={{ width: "100%", marginTop: 16 }} onClick={() => { toast("Certificate " + certNo + " issued to " + fac.name); onConfirm(); }}>Issue &amp; release to facility</Btn>
      </div>
    </Modal>
  );
}

// ---- Koko Dashboard ----
function KokoDashboard({ onGo }: { onGo: (page: string) => void }) {
  const incoming = REQUESTS.filter(r => r.stage === "transit");
  const awaitingDisposal = REQUESTS.filter(r => r.stage === "received");
  const disposed = REQUESTS.filter(r => ["disposed", "certified"].includes(r.stage));
  const tonnage = REQUESTS.filter(r => r.receipt).reduce((s, r) => s + (r.receipt?.weighbridgeKg || 0), 0);
  return (
    <>
      <PageHead eyebrow="Koko Town Waste Management Site" title="Site operations" desc="Receive, verify, dispose and certify pharmaceutical waste arriving from the field." />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 18 }}>
        <Stat label="Incoming shipments" num={incoming.length} icon="truck" accent="var(--c-accent)" delta="en route now" deltaDir="flat" />
        <Stat label="Awaiting disposal" num={awaitingDisposal.length} icon="pkg" accent="var(--c-warn)" delta="in holding bay" deltaDir="flat" />
        <Stat label="Disposed (this cycle)" num={disposed.length} icon="flask" accent="var(--c-primary)" />
        <Stat label="Tonnage processed" num={fmtKg(tonnage)} icon="scale" accent="var(--c-ok)" delta="+12% vs last month" />
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <Card>
          <CardHead title="Weighbridge queue" sub="Shipments inbound for receipt" icon="truck" right={<Btn kind="ghost" size="sm" iconR="arrowR" onClick={() => onGo("incoming")}>Open</Btn>} />
          {incoming.length === 0
            ? <div className="card-pad"><div className="ph" style={{ height: 90 }}>No inbound shipments</div></div>
            : <table className="tbl"><thead><tr><th>Facility</th><th>Request</th><th>Sealed</th><th>Seal</th><th></th></tr></thead>
              <tbody>{incoming.map(r => (
                <tr key={r.id} className="clickable" onClick={() => onGo("incoming")}><td className="strong">{facById[r.facilityId].name}</td><td>{r.id}</td><td className="mono">{fmtKg(r.collection?.collectedKg || 0)}</td><td><span className="tag">{r.collection?.sealNo}</span></td><td style={{ textAlign: "right" }}><Btn kind="soft" size="sm">Receive</Btn></td></tr>
              ))}</tbody>
            </table>}
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Site capacity</div>
          {[["Incineration throughput", 72, "var(--c-accent)"], ["Holding bay", 45, "var(--c-warn)"], ["Hazardous store", 30, "var(--c-primary)"]].map(([l, v, c]) => (
            <div key={String(l)} style={{ marginBottom: 14 }}>
              <div className="between" style={{ fontSize: 12.5, marginBottom: 6 }}><span className="muted">{l}</span><span style={{ fontWeight: 700 }}>{v}%</span></div>
              <div className="pbar"><i style={{ width: v + "%", background: String(c) }} /></div>
            </div>
          ))}
          <div className="divider" />
          <div className="row" style={{ justifyContent: "space-between" }}><span className="muted" style={{ fontSize: 12.5 }}>Next incineration run</span><span style={{ fontWeight: 700, fontSize: 13 }}>Today 16:00</span></div>
        </Card>
      </div>
    </>
  );
}

// ---- Incoming / receipt list ----
function KokoIncoming({ onReceive, onOpen }: { onReceive: (r: Request) => void; onOpen: (r: Request) => void }) {
  const incoming = REQUESTS.filter(r => r.stage === "transit");
  const recent = REQUESTS.filter(r => r.receipt);
  return (
    <>
      <PageHead eyebrow="Receipt" title="Incoming & verification" desc="Reconcile each shipment against what was declared and collected before acceptance." />
      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Awaiting weighbridge" sub={incoming.length + " inbound"} icon="truck" />
        {incoming.length === 0
          ? <div className="card-pad"><div className="ph" style={{ height: 80 }}>Nothing inbound</div></div>
          : <table className="tbl"><thead><tr><th>Facility</th><th>Request</th><th>Declared</th><th>Collected</th><th>Seal</th><th></th></tr></thead>
            <tbody>{incoming.map(r => (
              <tr key={r.id}><td className="strong">{facById[r.facilityId].name}</td><td>{r.id}</td><td className="mono">{fmtKg(r.declaredKg)}</td><td className="mono">{fmtKg(r.collection?.collectedKg || 0)}</td><td><span className="tag">{r.collection?.sealNo}</span></td><td style={{ textAlign: "right" }}><Btn kind="primary" size="sm" icon="scale" onClick={() => onReceive(r)}>Reconcile</Btn></td></tr>
            ))}</tbody>
          </table>}
      </Card>
      <Card>
        <CardHead title="Recently reconciled" icon="checkCircle" />
        <table className="tbl"><thead><tr><th>Receipt</th><th>Facility</th><th>Weighbridge</th><th>Variance</th><th>Result</th><th></th></tr></thead>
          <tbody>{recent.map(r => (
            <tr key={r.id} className="clickable" onClick={() => onOpen(r)}><td className="strong">{r.receipt!.no}</td><td>{facById[r.facilityId].name}</td><td className="mono">{fmtKg(r.receipt!.weighbridgeKg)}</td><td>{r.receipt!.variance > 0 ? "+" : ""}{r.receipt!.variance} kg</td><td><Pill kind="ok">Reconciled</Pill></td><td style={{ textAlign: "right" }}><Icon name="chevR" size={15} className="muted" /></td></tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Disposal log ----
function KokoDisposal({ onDispose }: { onDispose: (r: Request) => void }) {
  const awaiting = REQUESTS.filter(r => r.stage === "received");
  const done = REQUESTS.filter(r => r.certificate);
  return (
    <>
      <PageHead eyebrow="Treatment" title="Disposal log" desc="Record final treatment — method, batch, temperature and witnessing inspector." />
      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Awaiting disposal" sub={awaiting.length + " in holding bay"} icon="pkg" />
        {awaiting.length === 0
          ? <div className="card-pad"><div className="ph" style={{ height: 80 }}>Holding bay clear</div></div>
          : <table className="tbl"><thead><tr><th>Request</th><th>Facility</th><th>Received</th><th>Categories</th><th></th></tr></thead>
            <tbody>{awaiting.map(r => (
              <tr key={r.id}><td className="strong">{r.id}</td><td>{facById[r.facilityId].name}</td><td className="mono">{fmtKg(r.receipt?.weighbridgeKg || 0)}</td><td><div className="wrap">{r.lines.map(l => <HazardTag key={l.code} code={l.code} />)}</div></td><td style={{ textAlign: "right" }}><Btn kind="primary" size="sm" icon="flask" onClick={() => onDispose(r)}>Log disposal</Btn></td></tr>
            ))}</tbody>
          </table>}
      </Card>
      <Card>
        <CardHead title="Disposal register" icon="clipboard" />
        <table className="tbl"><thead><tr><th>Batch</th><th>Request</th><th>Method</th><th>Disposed</th><th>Witness</th></tr></thead>
          <tbody>{done.map(r => (
            <tr key={r.id}><td className="strong">{r.certificate!.batch}</td><td>{r.id}</td><td style={{ fontSize: 12 }}>{r.certificate!.method}</td><td className="mono">{fmtKg(r.certificate!.disposedKg)}</td><td>{r.certificate!.witness}</td></tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Certificates ----
function KokoCerts({ onIssue, onOpen }: { onIssue: (r: Request) => void; onOpen: (r: Request) => void }) {
  const toCertify = REQUESTS.filter(r => r.stage === "disposed");
  const issued = REQUESTS.filter(r => r.certificate);
  return (
    <>
      <PageHead eyebrow="Certification" title="Clearance certificates" desc="Issue the disposal certificate that closes the request and releases the facility." />
      {toCertify.length > 0 && (
        <Card style={{ marginBottom: 18 }}>
          <CardHead title="Ready to certify" icon="cert" />
          <table className="tbl"><thead><tr><th>Request</th><th>Facility</th><th>Disposed</th><th></th></tr></thead>
            <tbody>{toCertify.map(r => (
              <tr key={r.id}><td className="strong">{r.id}</td><td>{facById[r.facilityId].name}</td><td className="mono">{fmtKg(r.receipt?.weighbridgeKg || 0)}</td><td style={{ textAlign: "right" }}><Btn kind="primary" size="sm" icon="cert" onClick={() => onIssue(r)}>Issue certificate</Btn></td></tr>
            ))}</tbody>
          </table>
        </Card>
      )}
      <Card>
        <CardHead title="Issued certificates" sub={issued.length + " on register"} icon="shield" />
        <table className="tbl"><thead><tr><th>Certificate</th><th>Facility</th><th>Final weight</th><th>Issued</th><th></th></tr></thead>
          <tbody>{issued.map(r => (
            <tr key={r.id} className="clickable" onClick={() => onOpen(r)}><td className="strong">{r.certificate!.no}</td><td>{facById[r.facilityId].name}</td><td className="mono">{fmtKg(r.certificate!.disposedKg)}</td><td>{r.certificate!.issued}</td><td style={{ textAlign: "right" }}><Icon name="chevR" size={15} className="muted" /></td></tr>
          ))}</tbody>
        </table>
      </Card>
    </>
  );
}

// ---- Koko App ----
export default function KokoApp({ layout = "sidebar" }: { layout?: string }) {
  const user = USERS.koko;
  const incomingCount = REQUESTS.filter(r => r.stage === "transit").length;
  const [page, setPage] = useState("dash");
  const [receive, setReceive] = useState<Request | null>(null);
  const [dispose, setDispose] = useState<Request | null>(null);
  const [issue, setIssue] = useState<Request | null>(null);
  const [open, setOpen] = useState<Request | null>(null);

  const nav = [
    { section: "Site", items: [{ key: "dash", label: "Operations", icon: "grid" }, { key: "incoming", label: "Incoming & receipt", icon: "truck", badge: incomingCount }] },
    { section: "Process", items: [{ key: "disposal", label: "Disposal log", icon: "flask" }, { key: "certs", label: "Certificates", icon: "cert" }] },
  ];
  const titles: Record<string, string> = { dash: "Site operations", incoming: "Incoming & receipt", disposal: "Disposal log", certs: "Certificates" };

  let view: React.ReactNode;
  if (page === "dash") view = <KokoDashboard onGo={setPage} />;
  else if (page === "incoming") view = <KokoIncoming onReceive={setReceive} onOpen={setOpen} />;
  else if (page === "disposal") view = <KokoDisposal onDispose={setDispose} />;
  else if (page === "certs") view = <KokoCerts onIssue={setIssue} onOpen={setOpen} />;

  return (
    <>
      <DeskShell nav={nav} active={page} onNav={setPage} user={user} roleLabel="Site Officer" layout={layout} title={titles[page]} crumb="Koko Town Waste Management Site">
        {view}
      </DeskShell>
      {receive && <ReceiptForm job={receive} onClose={() => setReceive(null)} onConfirm={() => setReceive(null)} />}
      {dispose && <DisposalForm job={dispose} onClose={() => setDispose(null)} onConfirm={() => setDispose(null)} />}
      {issue && <CertForm job={issue} onClose={() => setIssue(null)} onConfirm={() => setIssue(null)} />}
      <RequestDrawer req={open} onClose={() => setOpen(null)} />
    </>
  );
}
