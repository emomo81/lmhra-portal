export const WASTE = [
  { code: "EXP", name: "Expired pharmaceuticals", note: "General expiry", ratePerKg: 2.5, color: "#e67e22", hazard: "medium" },
  { code: "SUB", name: "Substandard medicines", note: "Quality failure", ratePerKg: 2.5, color: "#e74c3c", hazard: "medium" },
  { code: "CYT", name: "Cytotoxic / antineoplastic", note: "Chemotherapy agents", ratePerKg: 8.0, color: "#9b59b6", hazard: "high" },
  { code: "INF", name: "Infectious / sharps", note: "Needles, biological waste", ratePerKg: 5.0, color: "#c0392b", hazard: "high" },
  { code: "CTL", name: "Controlled substances", note: "Narcotics, psychotropics", ratePerKg: 6.0, color: "#2c3e50", hazard: "high" },
  { code: "CHM", name: "Chemical / lab reagents", note: "Solvents, acids, reagents", ratePerKg: 4.5, color: "#16a085", hazard: "high" },
  { code: "RAD", name: "Radioactive materials", note: "Radiopharmaceuticals", ratePerKg: 15.0, color: "#f39c12", hazard: "high" },
];

export const wasteByCode: Record<string, typeof WASTE[0]> = Object.fromEntries(WASTE.map(w => [w.code, w]));

export const FEES = {
  baseHandling: 35,
  transportPerKm: 0.85,
  certificate: 25,
  note: "All fees are in USD. Cash collected at the point of collection by the LMHRA transport team. Rates effective Q1 2026.",
};

export const FACILITIES = [
  { id: "F-1067", name: "Lucky Pharmacy (Sinkor)", type: "Pharmacy", county: "Montserrado", city: "Monrovia", km: 18, license: "LMHRA-PH-1067", contact: "James Doe", phone: "+231 88 220 5512", status: "Licensed" },
  { id: "F-0821", name: "JFK Medical Center", type: "Hospital", county: "Montserrado", city: "Monrovia", km: 12, license: "LMHRA-HO-0821", contact: "P. Nyema", phone: "+231 77 330 4421", status: "Licensed" },
  { id: "F-0344", name: "Redemption Hospital", type: "Hospital", county: "Montserrado", city: "New Kru Town", km: 22, license: "LMHRA-HO-0344", contact: "S. Blah", phone: "+231 88 441 2210", status: "Licensed" },
  { id: "F-0512", name: "C.H. Rennie Hospital", type: "Hospital", county: "Margibi", city: "Kakata", km: 58, license: "LMHRA-HO-0512", contact: "A. Kamara", phone: "+231 77 552 9910", status: "Licensed" },
];

export const facById: Record<string, typeof FACILITIES[0]> = Object.fromEntries(FACILITIES.map(f => [f.id, f]));

export const USERS = {
  client: { name: "James Doe", initials: "JD", role: "Facility Officer", org: "Lucky Pharmacy (Sinkor)", facilityId: "F-1067" },
  transport: { name: "Emmanuel Weah", initials: "EW", role: "Collection Driver", org: "LMHRA Transport Unit" },
  koko: { name: "Grace Mulbah", initials: "GM", role: "Site Officer", org: "Koko Town WMS" },
  admin: { name: "Dr. T. Karnga", initials: "TK", role: "System Administrator", org: "LMHRA HQ" },
};

export const STAGES = [
  { key: "submitted", label: "Submitted", owner: "Facility" },
  { key: "review", label: "Under review", owner: "LMHRA HQ" },
  { key: "approved", label: "Approved & invoiced", owner: "LMHRA HQ" },
  { key: "scheduled", label: "Collection scheduled", owner: "Transport" },
  { key: "collected", label: "Collected & paid", owner: "Transport" },
  { key: "transit", label: "In transit", owner: "Transport" },
  { key: "received", label: "Received at Koko Town", owner: "Koko Site" },
  { key: "disposed", label: "Disposed", owner: "Koko Site" },
  { key: "certified", label: "Certificate issued", owner: "Koko Site" },
];

export const stageIndex: Record<string, number> = Object.fromEntries(STAGES.map((s, i) => [s.key, i]));

export interface WasteLine {
  code: string;
  declaredKg: number;
  units: number;
  packaging: string;
}

export interface Invoice {
  no: string;
  total: number;
  method: string;
  status: string;
}

export interface Schedule {
  date: string;
  window: string;
  driver: string;
  vehicle: string;
}

export interface Collection {
  time: string;
  collectedKg: number;
  variance: number;
  photos: number;
  sealNo: string;
  receiptNo: string;
  paidAmount: number;
  custody: string;
  verifiedBy: string;
}

export interface Receipt {
  no: string;
  bay: string;
  weighbridgeKg: number;
  variance: number;
  reconciled: boolean;
  match: string;
  verifiedBy: string;
  time: string;
}

export interface Certificate {
  no: string;
  issued: string;
  disposalDate: string;
  disposedKg: number;
  method: string;
  batch: string;
  witness: string;
}

export interface Request {
  id: string;
  facilityId: string;
  created: string;
  declaredKg: number;
  stage: string;
  lines: WasteLine[];
  invoice: Invoice | null;
  schedule: Schedule | null;
  collection: Collection | null;
  receipt: Receipt | null;
  certificate: Certificate | null;
}

export const REQUESTS: Request[] = [
  {
    id: "WDR-2406-0141", facilityId: "F-1067", created: "2026-05-28", declaredKg: 48,
    stage: "certified",
    lines: [{ code: "EXP", declaredKg: 32, units: 240, packaging: "Sealed drums" }, { code: "SUB", declaredKg: 16, units: 90, packaging: "Quarantine bags" }],
    invoice: { no: "INV-2406-0141", total: 249.90, method: "Cash on collection", status: "Paid" },
    schedule: { date: "2026-06-02", window: "09:00–11:00", driver: "Emmanuel Weah", vehicle: "LMHRA-T2 GH-4821" },
    collection: { time: "2026-06-02 09:47", collectedKg: 47.2, variance: -0.8, photos: 3, sealNo: "SL-77410", receiptNo: "RCT-0141", paidAmount: 249.90, custody: "Sealed · chain intact", verifiedBy: "Emmanuel Weah" },
    receipt: { no: "RCV-0141", bay: "Bay 2", weighbridgeKg: 47.0, variance: -0.2, reconciled: true, match: "Within tolerance (0.4%)", verifiedBy: "Grace Mulbah", time: "2026-06-02 14:12" },
    certificate: { no: "LMHRA-DC-2026-0141", issued: "2026-06-03", disposalDate: "2026-06-02", disposedKg: 47.0, method: "High-temperature incineration (1120°C)", batch: "INC-2026-0044", witness: "R. Sumo (LMHRA Inspector)" },
  },
  {
    id: "WDR-2406-0138", facilityId: "F-0821", created: "2026-05-22", declaredKg: 120,
    stage: "certified",
    lines: [{ code: "CYT", declaredKg: 45, units: 12, packaging: "Yellow rigid bins" }, { code: "CTL", declaredKg: 55, units: 30, packaging: "Sealed drums" }, { code: "INF", declaredKg: 20, units: 400, packaging: "Sharps boxes" }],
    invoice: { no: "INV-2406-0138", total: 789.60, method: "Cash on collection", status: "Paid" },
    schedule: { date: "2026-05-27", window: "11:00–13:00", driver: "Emmanuel Weah", vehicle: "LMHRA-T2 GH-4821" },
    collection: { time: "2026-05-27 11:22", collectedKg: 119.5, variance: -0.5, photos: 4, sealNo: "SL-77398", receiptNo: "RCT-0138", paidAmount: 789.60, custody: "Sealed · chain intact", verifiedBy: "Emmanuel Weah" },
    receipt: { no: "RCV-0138", bay: "Bay 1", weighbridgeKg: 119.2, variance: -0.3, reconciled: true, match: "Within tolerance (0.25%)", verifiedBy: "Grace Mulbah", time: "2026-05-27 15:04" },
    certificate: { no: "LMHRA-DC-2026-0138", issued: "2026-05-28", disposalDate: "2026-05-27", disposedKg: 119.2, method: "High-temperature incineration (1120°C)", batch: "INC-2026-0041", witness: "R. Sumo (LMHRA Inspector)" },
  },
  {
    id: "WDR-2406-0145", facilityId: "F-1067", created: "2026-06-01", declaredKg: 75,
    stage: "transit",
    lines: [{ code: "EXP", declaredKg: 40, units: 310, packaging: "Sealed drums" }, { code: "CHM", declaredKg: 35, units: 8, packaging: "Jerry cans" }],
    invoice: { no: "INV-2406-0145", total: 412.25, method: "Cash on collection", status: "Paid" },
    schedule: { date: "2026-06-04", window: "13:00–15:00", driver: "Emmanuel Weah", vehicle: "LMHRA-T2 GH-4821" },
    collection: { time: "2026-06-04 13:31", collectedKg: 74.8, variance: -0.2, photos: 3, sealNo: "SL-77441", receiptNo: "RCT-0145", paidAmount: 412.25, custody: "Sealed · chain intact", verifiedBy: "Emmanuel Weah" },
    receipt: null, certificate: null,
  },
  {
    id: "WDR-2406-0147", facilityId: "F-0821", created: "2026-06-02", declaredKg: 33,
    stage: "scheduled",
    lines: [{ code: "INF", declaredKg: 18, units: 320, packaging: "Sharps boxes" }, { code: "EXP", declaredKg: 15, units: 80, packaging: "Sealed drums" }],
    invoice: { no: "INV-2406-0147", total: 188.05, method: "Cash on collection", status: "Pending" },
    schedule: { date: "2026-06-06", window: "09:00–11:00", driver: "Emmanuel Weah", vehicle: "LMHRA-T2 GH-4821" },
    collection: null, receipt: null, certificate: null,
  },
  {
    id: "WDR-2406-0143", facilityId: "F-1067", created: "2026-05-30", declaredKg: 22,
    stage: "scheduled",
    lines: [{ code: "EXP", declaredKg: 22, units: 140, packaging: "Sealed drums" }],
    invoice: { no: "INV-2406-0143", total: 141.70, method: "Cash on collection", status: "Pending" },
    schedule: { date: "2026-06-07", window: "09:00–11:00", driver: "Emmanuel Weah", vehicle: "LMHRA-T2 GH-4821" },
    collection: null, receipt: null, certificate: null,
  },
  {
    id: "WDR-2406-0142", facilityId: "F-0344", created: "2026-05-29", declaredKg: 91,
    stage: "review",
    lines: [{ code: "SUB", declaredKg: 55, units: 200, packaging: "Quarantine bags" }, { code: "CTL", declaredKg: 36, units: 22, packaging: "Sealed drums" }],
    invoice: null, schedule: null, collection: null, receipt: null, certificate: null,
  },
];

export const AUDIT = [
  { ts: "2026-06-04 13:31", actor: "Emmanuel Weah", role: "Driver", action: "Collection verified and sealed", ref: "WDR-2406-0145", detail: "74.8 kg collected, seal SL-77441, cash $412.25 received" },
  { ts: "2026-06-04 09:14", actor: "LMHRA HQ", role: "Reviewer", action: "Request approved — invoice generated", ref: "WDR-2406-0143", detail: "Invoice INV-2406-0143 · $141.70 · collection 2026-06-07" },
  { ts: "2026-06-03 16:02", actor: "Grace Mulbah", role: "Site Officer", action: "Clearance certificate issued", ref: "WDR-2406-0141", detail: "Certificate LMHRA-DC-2026-0141 released to facility" },
  { ts: "2026-06-03 11:30", actor: "R. Sumo", role: "Inspector", action: "Disposal logged and witnessed", ref: "WDR-2406-0141", detail: "Batch INC-2026-0044 · 47.0 kg · incineration 1120°C" },
  { ts: "2026-06-02 14:12", actor: "Grace Mulbah", role: "Site Officer", action: "Waste received and reconciled", ref: "WDR-2406-0141", detail: "Weighbridge 47.0 kg · variance -0.2 kg · accepted" },
  { ts: "2026-06-02 09:47", actor: "Emmanuel Weah", role: "Driver", action: "Collection verified and sealed", ref: "WDR-2406-0141", detail: "47.2 kg collected, seal SL-77410, cash $249.90 received" },
  { ts: "2026-06-01 10:45", actor: "James Doe", role: "Facility Officer", action: "Disposal request submitted", ref: "WDR-2406-0145", detail: "75 kg declared across 2 categories" },
  { ts: "2026-05-30 14:22", actor: "LMHRA HQ", role: "Reviewer", action: "Request approved — invoice generated", ref: "WDR-2406-0141", detail: "Invoice INV-2406-0141 · $249.90 · collection 2026-06-02" },
];

export const MONTHLY = [
  { m: "Jan", requests: 28, kg: 2140, revenue: 6820, certs: 24 },
  { m: "Feb", requests: 31, kg: 2480, revenue: 7390, certs: 29 },
  { m: "Mar", requests: 26, kg: 1980, revenue: 6110, certs: 25 },
  { m: "Apr", requests: 35, kg: 3010, revenue: 8740, certs: 31 },
  { m: "May", requests: 42, kg: 3620, revenue: 10980, certs: 38 },
  { m: "Jun", requests: 18, kg: 1450, revenue: 4310, certs: 9 },
];

export const COUNTY = [
  { name: "Montserrado", kg: 9820, share: 64 },
  { name: "Margibi", kg: 2310, share: 15 },
  { name: "Bong", kg: 1480, share: 10 },
  { name: "Nimba", kg: 980, share: 6 },
  { name: "Other", kg: 720, share: 5 },
];

export function fmtUSD(n: number): string {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function fmtKg(n: number): string {
  return Number(n).toLocaleString("en-US") + " kg";
}
export function stageMeta(key: string) {
  return STAGES[stageIndex[key]];
}
export function computeFee(facilityId: string, lines: Array<{code: string; declaredKg: number}>) {
  const fac = facById[facilityId] || { km: 8 };
  const handling = lines.reduce((s, l) => s + l.declaredKg * (wasteByCode[l.code]?.ratePerKg ?? 2), 0);
  const transport = +(fac.km * FEES.transportPerKm).toFixed(2);
  const total = +(FEES.baseHandling + transport + handling + FEES.certificate).toFixed(2);
  return { base: FEES.baseHandling, transport, handling: +handling.toFixed(2), cert: FEES.certificate, total };
}
