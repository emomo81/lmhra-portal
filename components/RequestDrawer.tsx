'use client';
import React from 'react';
import { Request, facById, fmtUSD, fmtKg, wasteByCode } from '../lib/data';
import { Drawer, StagePill, HazardTag, Pill, Btn, Card, CardHead, Tracker } from './ui';
import Icon from './Icon';

interface RequestDrawerProps {
  req: Request | null;
  onClose: () => void;
}

export default function RequestDrawer({ req, onClose }: RequestDrawerProps) {
  if (!req) return null;
  const fac = facById[req.facilityId];
  const stamps: Record<string, string> = {
    submitted: "Submitted " + req.created,
    review: "LMHRA HQ",
    approved: req.invoice ? "Invoice " + req.invoice.no : "LMHRA HQ",
    scheduled: req.schedule ? req.schedule.date + " · " + req.schedule.window : "Transport",
    collected: req.collection ? req.collection.time : "Transport",
    transit: req.collection ? "Seal " + req.collection.sealNo : "Transport",
    received: req.receipt ? req.receipt.time : "Koko Site",
    disposed: req.certificate ? req.certificate.disposalDate : "Koko Site",
    certified: req.certificate ? req.certificate.no : "Koko Site",
  };

  return (
    <Drawer open={!!req} onClose={onClose}>
      <div className="drawer-head">
        <button className="icon-btn" onClick={onClose}><Icon name="x" size={17} /></button>
        <div style={{ flex: 1 }}>
          <div className="muted" style={{ fontSize: 12 }}>{fac && fac.name}</div>
          <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "var(--font-display)" }}>{req.id}</div>
        </div>
        <StagePill stage={req.stage} />
      </div>
      <div style={{ padding: "20px var(--pad)" }}>
        <Card className="card-pad" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 14 }}>Lifecycle &amp; audit trail</div>
          <Tracker stageKey={req.stage} stamps={stamps} />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Declared waste" sub={fmtKg(req.declaredKg) + " across " + req.lines.length + " categories"} icon="pkg" />
          <table className="tbl">
            <thead>
              <tr><th>Category</th><th>Declared</th><th>Units</th><th>Packaging</th></tr>
            </thead>
            <tbody>
              {req.lines.map((l) => (
                <tr key={l.code}>
                  <td>
                    <div className="row">
                      <HazardTag code={l.code} />
                      <span className="strong">{wasteByCode[l.code]?.name}</span>
                    </div>
                  </td>
                  <td className="mono">{l.declaredKg} kg</td>
                  <td>{l.units}</td>
                  <td>{l.packaging}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {req.collection && (
          <Card style={{ marginBottom: 16 }}>
            <CardHead
              title="Collection verification (field)"
              sub={"Seal " + req.collection.sealNo}
              icon="truck"
              right={
                <Pill kind={req.collection.variance === 0 ? "ok" : "warn"} dot={false}>
                  {req.collection.variance > 0 ? "+" : ""}{req.collection.variance} kg vs declared
                </Pill>
              }
            />
            <div className="card-pad" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              <div className="kv"><div className="k">Field weight</div><div className="v">{fmtKg(req.collection.collectedKg)}</div></div>
              <div className="kv"><div className="k">Cash received</div><div className="v">{fmtUSD(req.collection.paidAmount)}</div></div>
              <div className="kv"><div className="k">Receipt</div><div className="v">{req.collection.receiptNo}</div></div>
              <div className="kv"><div className="k">Photos</div><div className="v">{req.collection.photos} attached</div></div>
              <div className="kv"><div className="k">Custody</div><div className="v">{req.collection.custody}</div></div>
              <div className="kv"><div className="k">Officer</div><div className="v">{req.collection.verifiedBy}</div></div>
            </div>
          </Card>
        )}

        {req.receipt && (
          <Card style={{ marginBottom: 16 }}>
            <CardHead
              title="Koko Town receipt & reconciliation"
              sub={req.receipt.bay}
              icon="scale"
              right={<Pill kind={req.receipt.reconciled ? "ok" : "warn"} dot={false}>{req.receipt.match}</Pill>}
            />
            <div className="card-pad" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              <div className="kv"><div className="k">Weighbridge</div><div className="v">{fmtKg(req.receipt.weighbridgeKg)}</div></div>
              <div className="kv"><div className="k">Variance</div><div className="v">{req.receipt.variance > 0 ? "+" : ""}{req.receipt.variance} kg</div></div>
              <div className="kv"><div className="k">Officer</div><div className="v">{req.receipt.verifiedBy}</div></div>
            </div>
          </Card>
        )}

        {req.certificate ? (
          <Card className="card-pad" style={{ background: "var(--c-ok-soft)", border: "1px solid #bfe0cd" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="row">
                <Icon name="cert" size={20} style={{ color: "var(--c-ok)" }} />
                <div>
                  <div style={{ fontWeight: 700 }}>Clearance certificate issued</div>
                  <div className="muted" style={{ fontSize: 12 }}>{req.certificate.no}</div>
                </div>
              </div>
              <Btn kind="primary" size="sm" icon="download">Download</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 14 }}>
              <div className="kv"><div className="k">Method</div><div className="v" style={{ fontSize: 12.5 }}>{req.certificate.method}</div></div>
              <div className="kv"><div className="k">Disposed</div><div className="v">{fmtKg(req.certificate.disposedKg)}</div></div>
              <div className="kv"><div className="k">Witness</div><div className="v" style={{ fontSize: 12.5 }}>{req.certificate.witness}</div></div>
            </div>
          </Card>
        ) : (
          <Card className="card-pad" style={{ textAlign: "center", color: "var(--c-ink-3)", fontSize: 13 }}>
            <Icon name="clock" size={22} style={{ opacity: .5 }} />
            <div style={{ marginTop: 6 }}>Certificate pending final disposal</div>
          </Card>
        )}
      </div>
    </Drawer>
  );
}
