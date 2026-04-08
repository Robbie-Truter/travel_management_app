import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays, differenceInMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = "MMM d, yyyy") {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy HH:mm");
  } catch {
    return dateStr;
  }
}

export function calculateDuration(start: string, end: string) {
  try {
    return differenceInMinutes(parseISO(end), parseISO(start));
  } catch {
    return 0;
  }
}

export function tripDuration(startDate: string, endDate: string) {
  try {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate));
    return days === 1 ? "1 day" : `${days} days`;
  } catch {
    return "";
  }
}

export function formatCurrency(amount: number, currency: "USD" | "ZAR" | "EUR") {
  if (currency === "ZAR") {
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount);
  }

  if (currency === "EUR")
    return new Intl.NumberFormat("en-EU", { style: "currency", currency }).format(amount);

  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function formatDuration(minutes: number) {
  if (!minutes || minutes <= 0) return "0m";
  const d = Math.floor(minutes / (24 * 60));
  const h = Math.floor((minutes % (24 * 60)) / 60);
  const m = minutes % 60;

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || (d === 0 && h === 0)) parts.push(`${m}m`);

  return parts.join(" ");
}

export function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function timeToMinutes(time: string) {
  if (!time || !time.includes(":")) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function fileToBase64(file: File): Promise<{ type: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ type: file.type, base64: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64: string, filename: string): File {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/octet-stream" });
  return new File([blob], filename, { type: "application/octet-stream" });
}

// Mapping for Alpha-3 to Alpha-2 country codes for flag emoji support
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  AFG: "AF", ALA: "AX", ALB: "AL", DZA: "DZ", ASM: "AS", AND: "AD", AGO: "AO", AIA: "AI", ATA: "AQ", ATG: "AG",
  ARG: "AR", ARM: "AM", ABW: "AW", AUS: "AU", AUT: "AT", AZE: "AZ", BHS: "BS", BHR: "BH", BGD: "BD", BRB: "BB",
  BLR: "BY", BEL: "BE", BLZ: "BZ", BEN: "BJ", BMU: "BM", BTN: "BT", BOL: "BO", BES: "BQ", BIH: "BA", BWA: "BW",
  BVT: "BV", BRA: "BR", IOT: "IO", BRN: "BN", BGR: "BG", BFA: "BF", BDI: "BI", CPV: "CV", KHM: "KH", CMR: "CM",
  CAN: "CA", CYM: "KY", CAF: "CF", TCD: "TD", CHL: "CL", CHN: "CN", CXR: "CX", CCK: "CC", COL: "CO", COM: "KM",
  COG: "CG", COD: "CD", COK: "CK", CRI: "CR", CIV: "CI", HRV: "HR", CUB: "CU", CUW: "CW", CYP: "CY", CZE: "CZ",
  DNK: "DK", DJI: "DJ", DMA: "DM", DOM: "DO", ECU: "EC", EGY: "EG", SLV: "SV", GNQ: "GQ", ERI: "ER", EST: "EE",
  ETH: "ET", FLK: "FK", FRO: "FO", FJI: "FJ", FIN: "FI", FRA: "FR", GUF: "GF", PYF: "PF", ATF: "TF", GAB: "GA",
  GMB: "GM", GEO: "GE", DEU: "DE", GHA: "GH", GIB: "GI", GRC: "GR", GRL: "GL", GRD: "GD", GLP: "GP", GUM: "GU",
  GTM: "GT", GGY: "GG", GIN: "GN", GNB: "GW", GUY: "GY", HTI: "HT", HMD: "HM", VAT: "VA", HND: "HN", HKG: "HK",
  HUN: "HU", ISL: "IS", IND: "IN", IDN: "ID", IRN: "IR", IRQ: "IQ", IRL: "IE", IMN: "IM", ISR: "IL", ITA: "IT",
  JAM: "JM", JPN: "JP", JEY: "JE", JOR: "JO", KAZ: "KZ", KEN: "KE", KIR: "KI", PRK: "KP", KOR: "KR", KWT: "KW",
  KGZ: "KG", LAO: "LA", LVA: "LV", LBN: "LB", LSO: "LS", LBR: "LR", LBY: "LY", LIE: "LI", LTU: "LT", LUX: "LU",
  MAC: "MO", MKD: "MK", MDG: "MG", MWI: "MW", MYS: "MY", MDV: "MV", MLI: "ML", MLT: "MT", MHL: "MH", MTQ: "MQ",
  MRT: "MR", MUS: "MU", MYT: "YT", MEX: "MX", FSM: "FM", MDA: "MD", MCO: "MC", MNG: "MN", MNE: "ME", MSR: "MS",
  MAR: "MA", MOZ: "MZ", MMR: "MM", NAM: "NA", NRU: "NR", NPL: "NP", NLD: "NL", NCL: "NC", NZL: "NZ", NIC: "NI",
  NER: "NE", NGA: "NG", NIU: "NU", NFK: "NF", MNP: "MP", NOR: "NO", OMN: "OM", PAK: "PK", PLW: "PW", PSE: "PS",
  PAN: "PA", PNG: "PG", PRY: "PY", PER: "PE", PHL: "PH", PCN: "PN", POL: "PL", PRT: "PT", PRI: "PR", QAT: "QA",
  REU: "RE", ROU: "RO", RUS: "RU", RWA: "RW", BLM: "BL", SHN: "SH", KNA: "KN", LCA: "LC", MAF: "MF", SPM: "PM",
  VCT: "VC", WSM: "WS", SMR: "SM", STP: "ST", SAU: "SA", SEN: "SN", SRB: "RS", SYC: "SC", SLE: "SL", SGP: "SG",
  SXM: "SX", SVK: "SK", SVN: "SI", SLB: "SB", SOM: "SO", ZAF: "ZA", SGS: "GS", SSD: "SS", ESP: "ES", LKA: "LK",
  SDN: "SD", SUR: "SR", SJM: "SJ", SWZ: "SZ", SWE: "SE", CHE: "CH", SYR: "SY", TWN: "TW", TJK: "TJ", TZA: "TZ",
  THA: "TH", TLS: "TL", TGO: "TG", TKL: "TK", TON: "TO", TTO: "TT", TUN: "TN", TUR: "TR", TKM: "TM", TCA: "TC",
  TUV: "TV", UGA: "UG", UKR: "UA", ARE: "AE", GBR: "GB", USA: "US", UMI: "UM", URY: "UY", UZB: "UZ", VUT: "VU",
  VEN: "VE", VNM: "VN", VGB: "VG", VIR: "VI", WLF: "WF", ESH: "EH", YEM: "YE", ZMB: "ZM", ZWE: "ZW",
};

// Helper to get flag emoji from country code
export function getFlagEmoji(countryCode: string) {
  if (!countryCode) return "🌍";

  let code = countryCode.toUpperCase();

  // Convert Alpha-3 to Alpha-2 if necessary
  if (code.length === 3 && ALPHA3_TO_ALPHA2[code]) {
    code = ALPHA3_TO_ALPHA2[code];
  } else if (code.length > 2) {
    // Fallback for codes longer than 2: just take the first 2 characters
    // to avoid the "letter in a box" rendering of additional characters
    code = code.substring(0, 2);
  }

  const codePoints = code
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
