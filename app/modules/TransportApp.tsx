'use client';
import React, { useState } from 'react';
import { REQUESTS, USERS, facById, fmtUSD, fmtKg, wasteByCode, Request } from '../../lib/data';
import { Btn, StagePill, HazardTag, Pill, Card, CardHead, Stat, Field, Input, PageHead, Modal, Drawer, useToast } from '../../components/ui';
import { DeskShell } from '../../components/layout';
import RequestDrawer from '../../components/RequestDrawer';
import Icon from '../../components/Icon';

// ---- Transport Dashboard ----
function TransportDashboard({ onCollect, onDeliver }: { onCollect: (r: Request) => void; onDeliver: (r: Request) => void }) {
  const toCollect = REQUESTS.filter(r => r.stage === "scheduled");
  const inTransit = REQUESTS.filter(r => r.stage === "transit");
  const collected = REQUESTS.filter(r => r.collection);
  const cash = collected.reduce((s, r) => s + (r.collection?.paidAmount || 0), 0);
  return (
    <>
      <PageHead eyebrow="LMHRA Transport & Collection Unit" title="Field operations" desc="Assigned collections for today — verify, weigh, take cash payment and move waste to the Koko Town site." />
      <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", marginBottom: 18 }}>
        <Stat label="To collect" num={toCollect.length} icon="clipboard" accent="var(--c-accent)" delta="scheduled today" deltaDir="flat" />
        <Stat label="In transit" num={inTransit.length} icon="route" accent="var(--c-primary)" delta="to deliver" deltaDir="flat" />
        <Stat label="Collected" num={collected.length} icon="check" accent="var(--c-ok)" />
        <Stat label="Cash received" num={fmtUSD(cash)} icon="money" accent="var(--c-warn)" delta="cash on collection" deltaDir="flat" />
      </div>
      <Card style={{ marginBottom: 18 }}>
        <CardHead title="Scheduled pickups" sub={toCollect.length + " assigned to LMHRA-T2 (GH-4821)"} icon="truck" />
        {toCollect.length === 0
          ? <div className="card-pad"><div className="ph" style={{ height: 80 }}>No pickups scheduled</div></div>
          : (
            <table className="tbl">
              <thead><tr><th>Window</th><th>Facility</th><th>Distance</th><th>Categories</th><th>Declared</th><th>Cash due</th><th></th></tr></thead>
              <tbody>
                {toCollect.map(r => {
                  const f = facById[r.facilityId];
                  return (
                    <tr key={r.id}>
                      <td><span className="tag">{r.schedule!.window}</span></td>
                      <td className="strong">{f.name}</td>
                      <td className="muted">{f.km} km</td>
                      <td><div className="wrap">{r.lines.map(l => <HazardTag key={l.code} code={l.code} />)}</div></td>
                      <td className="mono">{fmtKg(r.declaredKg)}</td>
                      <td style={{ color: "var(--c-warn)", fontWeight: 700 }}>{fmtUSD(r.invoice!.total)}</td>
                      <td style={{ textAlign: "right" }}><Btn kind="primary" size="sm" icon="clipboard" onClick={() => onCollect(r)}>Collect</Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </Card>
      <Card>
        <CardHead title="In transit to Koko Town" icon="route" />
        {inTransit.length === 0
          ? <div className="card-pad"><div className="ph" style={{ height: 70 }}>Nothing in transit</div></div>
          : (
            <table className="tbl">
              <thead><tr><th>Facility</th><th>Request</th><th>Sealed</th><th>Seal</th><th></th></tr></thead>
              <tbody>
                {inTransit.map(r => (
                  <tr key={r.id}>
                    <td className="strong">{facById[r.facilityId].name}</td>
                    <td>{r.id}</td>
                    <td className="mono">{fmtKg(r.collection!.collectedKg)}</td>
                    <td><span className="tag">{r.collection!.sealNo}</span></td>
                    <td style={{ textAlign: "right" }}><Btn kind="soft" size="sm" icon="check" onClick={() => onDeliver(r)}>Confirm handover</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>
    </>
  );
}

// ---- Collect Drawer ----
function CollectDrawer({ job, onClose, onConfirm }: { job: Request; onClose: () => void; onConfirm: (r: Request) => void }) {
  const toast = useToast();
  const fac = facById[job.facilityId];
  const [actual, setActual] = useState<Record<string, string>>(Object.fromEntries(job.lines.map(l => [l.code, ""])));
  const [photos, setPhotos] = useState(0);
  const [seal, setSeal] = useState("");
  const [cash, setCash] = useState(job.invoice!.total.toFixed(2));
  const [confirmMatch, setConfirmMatch] = useState(false);
  const totalActual = Object.values(actual).reduce((s, v) => s + (+v || 0), 0);
  const variance = +(totalActual - job.declaredKg).toFixed(1);
  const canDone = totalActual > 0 && seal && photos > 0 && confirmMatch;

  return (
    <Drawer open={!!job} onClose={onClose}>
      <div className="drawer-head">
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={17} /></button>
        <div style={{ flex: 1 }}>
          <div className="muted" style={{ fontSize: 12 }}>Form F4 · Collection & verification</div>
          <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "var(--font-display)" }}>{fac.name}</div>
        </div>
        <span className="tag" style={{ color: "var(--c-accent)" }}>{job.id}</span>
      </div>
      <div style={{ padding: "20px var(--pad)", display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <CardHead title="Weigh & verify each category" sub="Actual field weight vs facility declaration" icon="scale" />
          <table className="tbl">
            <thead><tr><th>Category</th><th>Declared</th><th>Actual (kg)</th><th>Variance</th></tr></thead>
            <tbody>
              {job.lines.map(l => {
                const a = +actual[l.code] || 0;
                const dv = +(a - l.declaredKg).toFixed(1);
                const ok = Math.abs(dv) <= l.declaredKg * 0.05;
                return (
                  <tr key={l.code}>
                    <td><div className="row"><HazardTag code={l.code} /><span style={{ fontSize: 12.5 }}>{wasteByCode[l.code].name}</span></div></td>
                    <td className="mono">{l.declaredKg} kg</td>
                    <td><Input type="number" placeholder="kg" value={actual[l.code]} onChange={e => setActual({ ...actual, [l.code]: e.target.value })} style={{ width: 110 }} /></td>
                    <td>{a > 0 ? <Pill kind={ok ? "ok" : "warn"} dot={false}>{dv > 0 ? "+" : ""}{dv} kg</Pill> : <span className="muted">—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="card-pad between">
            <div>
              <div style={{ fontWeight: 700 }}>Actual total</div>
              <div className="muted" style={{ fontSize: 11.5 }}>declared {job.declaredKg} kg</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--c-primary)" }}>{totalActual} kg</div>
              {totalActual > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: Math.abs(variance) <= job.declaredKg * 0.05 ? "var(--c-ok)" : "var(--c-warn)" }}>{variance > 0 ? "+" : ""}{variance} kg variance</span>}
            </div>
          </div>
        </Card>
        <Card className="card-pad">
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 10 }}>Evidence & custody</div>
          <div className="row" style={{ gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            {[0, 1, 2].map(idx => (
              <button key={idx} onClick={() => setPhotos(Math.max(photos, idx + 1))}
                style={{ width: 92, height: 72, borderRadius: 10, border: "1px dashed var(--c-line)", background: idx < photos ? "var(--c-accent-soft)" : "var(--c-bg-2)", display: "grid", placeItems: "center", color: idx < photos ? "var(--c-accent)" : "var(--c-ink-3)", cursor: "pointer" }}>
                <Icon name={idx < photos ? "check" : "camera"} size={20} />
              </button>
            ))}
            <span className="muted" style={{ fontSize: 12 }}>Attach photo evidence</span>
          </div>
          <Field label="Container seal number(s)">
            <Input placeholder="e.g. SL-77410" value={seal} onChange={e => setSeal(e.target.value)} />
          </Field>
        </Card>
        <Card className="card-pad" style={{ background: "var(--c-warn-soft)", border: "1px solid #ecdcb0" }}>
          <div className="between">
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Cash payment (Form F3)</div>
            <span className="muted" style={{ fontSize: 12 }}>Invoiced {fmtUSD(job.invoice!.total)}</span>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "var(--c-warn)" }}>$</span>
            <Input type="number" value={cash} onChange={e => setCash(e.target.value)} style={{ maxWidth: 200 }} />
            <span className="muted" style={{ fontSize: 12 }}>receipt auto-generated on confirm</span>
          </div>
        </Card>
        <label className="checkrow" data-on={confirmMatch ? "true" : "false"} style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={confirmMatch} onChange={e => setConfirmMatch(e.target.checked)} />
          <span style={{ fontSize: 12.5 }}>I confirm the waste collected matches the declaration, has been sealed, and cash payment received.</span>
        </label>
        <Btn kind="primary" size="lg" icon="check" disabled={!canDone} style={{ width: "100%" }}
          onClick={() => { toast("Collected · receipt RCT-" + job.id.slice(-4) + " issued"); onConfirm(job); }}>
          Confirm collection & seal
        </Btn>
      </div>
    </Drawer>
  );
}

// ---- Handover Modal ----
function HandoverModal({ job, onClose, onConfirm }: { job: Request; onClose: () => void; onConfirm: (r: Request) => void }) {
  const toast = useToast();
  const fac = facById[job.facilityId];
  const [arrived, setArrived] = useState(false);
  return (
    <Modal open={!!job} onClose={onClose}>
      <div style={{ padding: "20px 22px", borderBottom: "1px solid var(--c-line)" }} className="between">
        <div>
          <div className="muted" style={{ fontSize: 12 }}>Form F5 · Chain of custody</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Handover to Koko Town</div>
        </div>
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
      </div>
      <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="between" style={{ background: "var(--c-bg-2)", padding: 12, borderRadius: 10 }}>
          <span style={{ fontSize: 13 }}>{fac.name}</span>
          <span className="tag">Seal {job.collection!.sealNo} · {fmtKg(job.collection!.collectedKg)}</span>
        </div>
        <div>
          {["Vehicle departed facility", "Seal integrity intact in transit", "Arrived Koko Town gate"].map((s, k) => (
            <div key={s} className="row" style={{ padding: "8px 0", borderBottom: k < 2 ? "1px solid var(--c-line-2)" : "none" }}>
              <Icon name="checkCircle" size={17} style={{ color: "var(--c-ok)" }} />{s}
            </div>
          ))}
        </div>
        <label className="checkrow" data-on={arrived ? "true" : "false"} style={{ cursor: "pointer" }}>
          <input type="checkbox" checked={arrived} onChange={e => setArrived(e.target.checked)} />
          <span style={{ fontSize: 12.5 }}>Seal handed to site officer intact for weighbridge verification.</span>
        </label>
        <Btn kind="primary" icon="check" disabled={!arrived} onClick={() => { toast("Handover logged — awaiting site receipt"); onConfirm(job); }}>
          Confirm handover
        </Btn>
      </div>
    </Modal>
  );
}

// ---- Jobs ----
function TransportJobs({ onCollect }: { onCollect: (r: Request) => void }) {
  const list = REQUESTS.filter(r => r.stage === "scheduled");
  return (
    <>
      <PageHead eyebrow="Field operations" title="Collection jobs" desc="Scheduled pickups assigned to your vehicle." />
      <Card>
        <CardHead title="Scheduled" sub={list.length + " jobs"} icon="truck" />
        {list.length === 0
          ? <div className="card-pad"><div className="ph" style={{ height: 80 }}>No jobs assigned</div></div>
          : (
            <table className="tbl">
              <thead><tr><th>Window</th><th>Facility</th><th>Distance</th><th>Categories</th><th>Declared</th><th>Cash due</th><th></th></tr></thead>
              <tbody>
                {list.map(r => {
                  const f = facById[r.facilityId];
                  return (
                    <tr key={r.id}>
                      <td><span className="tag">{r.schedule!.window}</span></td>
                      <td className="strong">{f.name}</td>
                      <td className="muted">{f.km} km</td>
                      <td><div className="wrap">{r.lines.map(l => <HazardTag key={l.code} code={l.code} />)}</div></td>
                      <td className="mono">{fmtKg(r.declaredKg)}</td>
                      <td style={{ color: "var(--c-warn)", fontWeight: 700 }}>{fmtUSD(r.invoice!.total)}</td>
                      <td style={{ textAlign: "right" }}><Btn kind="primary" size="sm" icon="clipboard" onClick={() => onCollect(r)}>Collect & verify</Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </Card>
    </>
  );
}

// ---- Transit ----
function TransportTransit({ onDeliver }: { onDeliver: (r: Request) => void }) {
  const list = REQUESTS.filter(r => r.stage === "transit");
  return (
    <>
      <PageHead eyebrow="Field operations" title="In transit" desc="Sealed loads en route to the Koko Town site." />
      <Card>
        <CardHead title="En route" sub={list.length + " loads"} icon="route" />
        {list.length === 0
          ? <div className="card-pad"><div className="ph" style={{ height: 70 }}>Nothing in transit</div></div>
          : (
            <table className="tbl">
              <thead><tr><th>Facility</th><th>Request</th><th>Sealed</th><th>Seal</th><th>Cash held</th><th></th></tr></thead>
              <tbody>
                {list.map(r => (
                  <tr key={r.id}>
                    <td className="strong">{facById[r.facilityId].name}</td>
                    <td>{r.id}</td>
                    <td className="mono">{fmtKg(r.collection!.collectedKg)}</td>
                    <td><span className="tag">{r.collection!.sealNo}</span></td>
                    <td className="mono">{fmtUSD(r.collection!.paidAmount)}</td>
                    <td style={{ textAlign: "right" }}><Btn kind="primary" size="sm" icon="check" onClick={() => onDeliver(r)}>Confirm handover</Btn></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Card>
    </>
  );
}

// ---- Completed ----
function TransportCompleted({ onOpen }: { onOpen: (r: Request) => void }) {
  const list = REQUESTS.filter(r => r.collection && ["received", "disposed", "certified"].includes(r.stage));
  return (
    <>
      <PageHead eyebrow="Records" title="Completed collections" desc="Delivered and reconciled at the Koko Town site." />
      <Card>
        <CardHead title="Collection history" icon="checkCircle" />
        <table className="tbl">
          <thead><tr><th>Request</th><th>Facility</th><th>Collected</th><th>Variance</th><th>Receipt</th><th>Cash</th><th></th></tr></thead>
          <tbody>
            {list.map(r => (
              <tr key={r.id} className="clickable" onClick={() => onOpen(r)}>
                <td className="strong">{r.id}</td>
                <td>{facById[r.facilityId].name}</td>
                <td className="mono">{fmtKg(r.collection!.collectedKg)}</td>
                <td>{r.collection!.variance > 0 ? "+" : ""}{r.collection!.variance} kg</td>
                <td>{r.collection!.receiptNo}</td>
                <td className="mono">{fmtUSD(r.collection!.paidAmount)}</td>
                <td style={{ textAlign: "right" }}><Icon name="chevR" size={15} className="muted" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ---- TransportApp shell ----
export default function TransportApp({ layout = "sidebar" }: { layout?: string }) {
  const user = USERS.transport;
  const toCollectN = REQUESTS.filter(r => r.stage === "scheduled").length;
  const transitN = REQUESTS.filter(r => r.stage === "transit").length;
  const [page, setPage] = useState("dash");
  const [collect, setCollect] = useState<Request | null>(null);
  const [deliver, setDeliver] = useState<Request | null>(null);
  const [open, setOpen] = useState<Request | null>(null);

  const nav = [
    { section: "Field operations", items: [
      { key: "dash", label: "Today", icon: "grid" },
      { key: "jobs", label: "Collection jobs", icon: "truck", badge: toCollectN },
      { key: "transit", label: "In transit", icon: "route", badge: transitN },
    ]},
    { section: "Records", items: [
      { key: "done", label: "Completed", icon: "checkCircle" },
    ]},
  ];

  const titles: Record<string, string> = { dash: "Field operations", jobs: "Collection jobs", transit: "In transit", done: "Completed collections" };

  let view;
  if (page === "dash") view = <TransportDashboard onCollect={setCollect} onDeliver={setDeliver} />;
  else if (page === "jobs") view = <TransportJobs onCollect={setCollect} />;
  else if (page === "transit") view = <TransportTransit onDeliver={setDeliver} />;
  else view = <TransportCompleted onOpen={setOpen} />;

  return (
    <>
      <DeskShell nav={nav} active={page} onNav={setPage} user={user} roleLabel="Collection Driver" layout={layout} title={titles[page]} crumb="LMHRA Transport & Collection Unit">
        {view}
      </DeskShell>
      {collect && <CollectDrawer job={collect} onClose={() => setCollect(null)} onConfirm={() => setCollect(null)} />}
      {deliver && <HandoverModal job={deliver} onClose={() => setDeliver(null)} onConfirm={() => setDeliver(null)} />}
      <RequestDrawer req={open} onClose={() => setOpen(null)} />
    </>
  );
}
