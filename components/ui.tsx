'use client';
import React, { useState, useEffect, createContext, useContext } from 'react';
import Icon from './Icon';
import { STAGES, stageIndex, wasteByCode } from '../lib/data';

// ---- Buttons ----
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: string;
  size?: string;
  icon?: string;
  iconR?: string;
  children?: React.ReactNode;
}
export function Btn({ kind = "ghost", size, icon, iconR, children, className = "", ...rest }: BtnProps) {
  const cls = ["btn", "btn-" + kind, size ? "btn-" + size : "", className].filter(Boolean).join(" ");
  const iconSize = size === "sm" ? 15 : 16;
  return (
    <button className={cls} {...rest}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconR && <Icon name={iconR} size={iconSize} />}
    </button>
  );
}

// ---- Pills / Status ----
const STAGE_PILL: Record<string, [string, string]> = {
  submitted: ["pill-info", "Submitted"],
  review: ["pill-warn", "Under Review"],
  approved: ["pill-accent", "Approved"],
  scheduled: ["pill-info", "Scheduled"],
  collected: ["pill-accent", "Collected"],
  transit: ["pill-accent", "In Transit"],
  received: ["pill-info", "Received"],
  disposed: ["pill-accent", "Disposed"],
  certified: ["pill-ok", "Certified"],
};

export function StagePill({ stage }: { stage: string }) {
  const [cls, label] = STAGE_PILL[stage] || ["pill-neutral", stage];
  return (
    <span className={"pill " + cls}>
      <span className="dot" />{label}
    </span>
  );
}

export function Pill({ kind = "neutral", dot = true, children }: { kind?: string; dot?: boolean; children?: React.ReactNode }) {
  return (
    <span className={"pill pill-" + kind}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

export function HazardTag({ code }: { code: string }) {
  const w = wasteByCode[code];
  if (!w) return null;
  return (
    <span className="tag" style={{ borderColor: w.color + "55", color: w.color, background: w.color + "0d" }}>
      <span style={{ width: 7, height: 7, borderRadius: 2, background: w.color }} />
      {code}
    </span>
  );
}

// ---- Cards & Stats ----
export function Card({ children, className = "", style }: { children?: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={"card " + className} style={style}>{children}</div>;
}

export function CardHead({ title, sub, icon, right }: { title: string; sub?: string; icon?: string; right?: React.ReactNode }) {
  return (
    <div className="card-head">
      {icon && (
        <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--c-primary-soft)", color: "var(--c-primary)", display: "grid", placeItems: "center" }}>
          <Icon name={icon} size={17} />
        </span>
      )}
      <div>
        <h3>{title}</h3>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right && <div className="right">{right}</div>}
    </div>
  );
}

export function Stat({ label, num, icon, delta, deltaDir = "up", accent }: {
  label: string; num: string | number; icon?: string; delta?: string; deltaDir?: string; accent?: string;
}) {
  return (
    <div className="stat">
      {icon && (
        <span className="stat-ico" style={accent ? { background: accent + "1a", color: accent } : {}}>
          <Icon name={icon} size={18} />
        </span>
      )}
      <div className="lab">{label}</div>
      <div className="num" style={accent ? { color: accent } : {}}>{num}</div>
      {delta && (
        <div className={"delta " + deltaDir}>
          {deltaDir !== "flat" && <Icon name="trend" size={13} />}
          {delta}
        </div>
      )}
    </div>
  );
}

// ---- Form Fields ----
export function Field({ label, req, hint, children, span }: {
  label?: string; req?: boolean; hint?: string; children?: React.ReactNode; span?: boolean;
}) {
  return (
    <div className="field" style={span ? { gridColumn: "span 2" } : {}}>
      {label && <label>{label}{req && <span className="req"> *</span>}</label>}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="input" {...props} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="textarea" {...props} />;
}

export function Select({ children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { children?: React.ReactNode }) {
  return <select className="select" {...rest}>{children}</select>;
}

// ---- Stepper ----
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="stepper">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <React.Fragment key={i}>
            <div className="step" data-state={state} style={{ flex: "none" }}>
              <div className="dot">{i < current ? <Icon name="check" size={14} /> : i + 1}</div>
              <div className="lab">{s}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                background: i < current ? "var(--c-ok)" : "var(--c-line)",
                flex: 1, height: 2, margin: "0 12px"
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---- Tracker ----
export function Tracker({ stageKey, stamps = {} }: { stageKey: string; stamps?: Record<string, string> }) {
  const cur = stageIndex[stageKey];
  return (
    <div className="tracker">
      {STAGES.map((s, i) => {
        const state = i < cur ? "done" : i === cur ? "active" : "todo";
        return (
          <div className="trk" data-state={state} key={s.key}>
            <div className="rail">
              <div className="node">
                {i < cur
                  ? <Icon name="check" size={13} />
                  : i === cur
                    ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
                    : i + 1}
              </div>
              {i < STAGES.length - 1 && <div className="bar" />}
            </div>
            <div className="body">
              <div className="t">{s.label}</div>
              <div className="d">{stamps[s.key] || s.owner}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Drawer / Modal ----
export function Drawer({ open, onClose, children }: { open: boolean; onClose: () => void; children?: React.ReactNode }) {
  useEffect(() => {
    function esc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children?: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="scrim center" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// ---- Toast ----
const ToastCtx = createContext<(msg: string) => void>(() => {});
export function useToast() { return useContext(ToastCtx); }

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string }>>([]);
  function push(msg: string) {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <span className="tk"><Icon name="check" size={12} /></span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---- PageHead ----
export function PageHead({ eyebrow, title, desc, actions }: {
  eyebrow?: string; title: string; desc?: string; actions?: React.ReactNode;
}) {
  return (
    <div className={`page-head ${actions ? "between" : ""}`} style={actions ? { alignItems: "flex-end" } : {}}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

// ---- BarChart ----
export function BarChart({ data, valKey, labKey = "m", color = "var(--c-accent)", fmt = (v: number) => String(v), height = 150 }: {
  data: Array<Record<string, number | string>>;
  valKey: string;
  labKey?: string;
  color?: string;
  fmt?: (v: number) => string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d[valKey] as number));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, padding: "8px 4px 0" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-ink-2)" }}>{fmt(d[valKey] as number)}</div>
          <div style={{
            width: "100%", maxWidth: 42,
            height: ((d[valKey] as number) / max) * (height - 50),
            background: color, borderRadius: "6px 6px 0 0",
            opacity: i === data.length - 1 ? .55 : 1,
            transition: "height .4s ease"
          }} />
          <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", fontWeight: 600 }}>{d[labKey]}</div>
        </div>
      ))}
    </div>
  );
}
