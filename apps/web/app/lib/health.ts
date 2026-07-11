// 검진 항목 정의 + 판정 계산 (화면과 분리한 "머리 쓰는 부분")
// prototype/index.html 의 SECTIONS·PARTS·BMI·판정 로직을 그대로 옮김.

export type Status = "good" | "warn" | "bad" | "none";

export type Item = {
  key: string;
  name: string;
  unit: string;
  type?: "select" | "text";
  options?: string[];
  placeholder?: string;
  ref?: (sex: string) => string;
  eval?: (v: number, sex: string) => Status;
};

export type Section = { title: string; items: Item[] };

// ===== 검진 항목 정의 (기준치 = 표준 검진 참고치) =====
export const SECTIONS: Section[] = [
  { title: "기본 정보", items: [
    { key: "sex", name: "성별", unit: "", type: "select", options: ["남", "여"] },
    { key: "height", name: "키", unit: "cm" },
    { key: "weight", name: "몸무게", unit: "kg" },
    { key: "waist", name: "허리둘레", unit: "cm",
      ref: (s) => s === "여" ? "여 <85" : "남 <90",
      eval: (v, s) => { const lim = s === "여" ? 85 : 90; return v < lim ? "good" : "bad"; } },
  ]},
  { title: "혈압", items: [
    { key: "sbp", name: "수축기 혈압", unit: "mmHg", ref: () => "<120",
      eval: (v) => v < 120 ? "good" : v < 140 ? "warn" : "bad" },
    { key: "dbp", name: "이완기 혈압", unit: "mmHg", ref: () => "<80",
      eval: (v) => v < 80 ? "good" : v < 90 ? "warn" : "bad" },
  ]},
  { title: "당뇨", items: [
    { key: "glucose", name: "공복혈당", unit: "mg/dL", ref: () => "<100",
      eval: (v) => v < 100 ? "good" : v < 126 ? "warn" : "bad" },
  ]},
  { title: "콜레스테롤 (혈관건강)", items: [
    { key: "tchol", name: "총콜레스테롤", unit: "mg/dL", ref: () => "<200",
      eval: (v) => v < 200 ? "good" : v < 240 ? "warn" : "bad" },
    { key: "hdl", name: "HDL(좋은)", unit: "mg/dL", ref: () => "≥60 좋음",
      eval: (v) => v >= 60 ? "good" : v >= 40 ? "warn" : "bad" },
    { key: "ldl", name: "LDL(나쁜)", unit: "mg/dL", ref: () => "<130",
      eval: (v) => v < 130 ? "good" : v < 160 ? "warn" : "bad" },
    { key: "tg", name: "중성지방", unit: "mg/dL", ref: () => "<150",
      eval: (v) => v < 150 ? "good" : v < 200 ? "warn" : "bad" },
  ]},
  { title: "간 기능", items: [
    { key: "ast", name: "AST(SGOT)", unit: "U/L", ref: () => "≤40",
      eval: (v) => v <= 40 ? "good" : v <= 50 ? "warn" : "bad" },
    { key: "alt", name: "ALT(SGPT)", unit: "U/L", ref: () => "≤40",
      eval: (v) => v <= 40 ? "good" : v <= 50 ? "warn" : "bad" },
    { key: "ggt", name: "감마-GTP", unit: "U/L",
      ref: (s) => s === "여" ? "여 8~35" : "남 11~63",
      eval: (v, s) => { const hi = s === "여" ? 35 : 63; return v <= hi ? "good" : v <= hi * 1.5 ? "warn" : "bad"; } },
  ]},
  { title: "신장 기능", items: [
    { key: "cr", name: "혈청 크레아티닌", unit: "mg/dL", ref: () => "0.7~1.4",
      eval: (v) => (v >= 0.5 && v <= 1.4) ? "good" : (v < 0.5 || v <= 1.6) ? "warn" : "bad" },
    { key: "egfr", name: "eGFR(사구체여과율)", unit: "", ref: () => "≥60",
      eval: (v) => v >= 60 ? "good" : v >= 45 ? "warn" : "bad" },
  ]},
  { title: "빈혈", items: [
    { key: "hb", name: "혈색소(Hb)", unit: "g/dL",
      ref: (s) => s === "여" ? "여 12~16" : "남 13~16.5",
      eval: (v, s) => { const lo = s === "여" ? 12 : 13; return v >= lo ? "good" : v >= lo - 1 ? "warn" : "bad"; } },
  ]},
];

// ===== 나에 대해 (건강 수치 아님 — 입력만 받고 Part 2 점수엔 안 나옴) =====
// Part 6(다음 검진까지 프로젝트)·Part 9(미래 질환 위험)에서 쓸 재료.
export const PROFILE_FIELDS: Item[] = [
  { key: "birthYear", name: "출생연도", unit: "년", placeholder: "예: 1958" },
  { key: "job", name: "직업", unit: "", type: "text", placeholder: "예: 주부, 회사원" },
  { key: "nextCheckup", name: "다음 검진 예정", unit: "", type: "text", placeholder: "예: 2028년 1월" },
];

// ===== 생활 습관 문진 (건강 수치 아님 — Part 9 미래 질환 위험에서 쓸 재료) =====
export const HABIT_FIELDS: Item[] = [
  { key: "exercise", name: "운동을 얼마나 하세요?", unit: "", type: "select",
    options: ["거의 안 함", "주 1~2회", "주 3회 이상"] },
  { key: "sweetDrink", name: "단 음료 자주 드세요?", unit: "", type: "select",
    options: ["거의 안 마심", "가끔", "자주"] },
  { key: "smoke", name: "담배 피우세요?", unit: "", type: "select",
    options: ["안 피움", "끊음", "피움"] },
  { key: "alcohol", name: "술을 얼마나 드세요?", unit: "", type: "select",
    options: ["거의 안 마심", "가끔", "자주"] },
  { key: "salty", name: "짜게 드시는 편이에요?", unit: "", type: "select",
    options: ["싱겁게", "보통", "짜게"] },
];

// BMI는 키·몸무게로 자동 계산하는 특별 항목
export function computeBMI(d: Record<string, string>): number | null {
  const h = parseFloat(d.height), w = parseFloat(d.weight);
  if (!h || !w) return null;
  const bmi = w / ((h / 100) ** 2);
  return Math.round(bmi * 10) / 10;
}
export function bmiStatus(bmi: number | null): Status {
  if (bmi == null) return "none";
  if (bmi < 18.5) return "warn";       // 저체중
  if (bmi < 23) return "good";         // 정상
  if (bmi < 25) return "warn";         // 과체중
  return "bad";                        // 비만
}

export const STORE_KEY = "health-guide-data";
export const STATUS_LABEL: Record<Status, string> = { good: "정상", warn: "주의", bad: "위험", none: "-" };

// ===== 책 구조: 파트 목록 =====
// status: 'live' = 지금 동작, 'prep' = 준비 중(내용은 다음에)
export type Part = { n: number; icon: string; title: string; status: "live" | "prep" };
export const PARTS: Part[] = [
  { n: 1,  icon: "✉️", title: "의사 선생님의 편지",       status: "prep" },
  { n: 2,  icon: "⭐", title: "내 건강 점수",             status: "live" },
  { n: 3,  icon: "🛡️", title: "내 몸의 믿는 구석",        status: "prep" },
  { n: 4,  icon: "⚠️", title: "내 몸에 보내는 경고",       status: "prep" },
  { n: 5,  icon: "📖", title: "그게 무슨 뜻이에요?",       status: "prep" },
  { n: 6,  icon: "🎯", title: "다음 검진까지 프로젝트",     status: "prep" },
  { n: 7,  icon: "💊", title: "내 영양제, 잘 먹고 있나요?", status: "prep" },
  { n: 8,  icon: "🌱", title: "오늘부터 하는 건강습관",     status: "prep" },
  { n: 9,  icon: "🔮", title: "앞으로 생길 가능성 높은 질환", status: "prep" },
  { n: 10, icon: "🤝", title: "의사의 마지막 이야기",       status: "prep" },
];
export function partByNum(n: number): Part {
  return PARTS.find((p) => p.n === n)!;
}

// ===== 한눈에 보기(내 건강 점수) 계산 =====
export type MetricRow = { name: string; valText: string; refText: string; status: Status };
export type Summary = {
  hasData: boolean;
  good: number; warn: number; bad: number;
  missing: number; // 판정 가능한 항목 중 아직 안 넣은 칸 수
  bySection: Record<string, MetricRow[]>;
  updated: string | undefined;
};

export function buildSummary(data: Record<string, string>): Summary {
  const hasData = Object.keys(data).some((k) => k !== "_updated");
  const sex = data.sex ?? "";
  const bmi = computeBMI(data);
  const bySection: Record<string, MetricRow[]> = {};
  let good = 0, warn = 0, bad = 0, missing = 0;

  for (const sec of SECTIONS) {
    for (const it of sec.items) {
      if (it.type === "select") continue;
      const raw = data[it.key];
      if (raw == null || raw === "") {
        if (it.eval) missing++; // 판정 가능한 칸인데 아직 안 넣음
        continue;
      }
      const num = parseFloat(raw);
      let status: Status = "none";
      if (it.eval && !isNaN(num)) status = it.eval(num, sex);
      const refText = it.ref ? it.ref(sex) : "";
      (bySection[sec.title] ??= []).push({ name: it.name, valText: raw + " " + it.unit, refText, status });
    }
  }
  // BMI를 기본 정보 섹션 앞에 끼워넣기
  if (bmi != null) (bySection["기본 정보"] ??= []).unshift(
    { name: "BMI(체질량지수)", valText: String(bmi), refText: "18.5~22.9", status: bmiStatus(bmi) });

  for (const arr of Object.values(bySection)) {
    for (const r of arr) {
      if (r.status === "good") good++;
      else if (r.status === "warn") warn++;
      else if (r.status === "bad") bad++;
    }
  }
  return { hasData, good, warn, bad, missing, bySection, updated: data._updated };
}

// ===== Part 2: 영역별 건강 점수 + 별점 =====
// 규칙: 정상=100 · 주의=60 · 위험=30, 영역 안 항목 평균. 값 없는 항목은 평균에서 제외.
// 한 영역에 넣은 값이 하나도 없으면 score=null(아직 점수 없음).
const STATUS_SCORE: Record<"good" | "warn" | "bad", number> = { good: 100, warn: 60, bad: 30 };

const ITEM_BY_KEY: Record<string, Item> = {};
for (const sec of SECTIONS) for (const it of sec.items) ITEM_BY_KEY[it.key] = it;

export type AreaScore = {
  key: string; name: string; icon: string;
  score: number | null; stars: number; filled: number; total: number;
};

const SCORE_AREAS: { key: string; name: string; icon: string; itemKeys: string[] }[] = [
  { key: "vascular", name: "혈관 건강", icon: "🫀", itemKeys: ["sbp", "dbp", "tchol", "hdl", "ldl", "tg"] },
  { key: "glucose",  name: "혈당",      icon: "🍬", itemKeys: ["glucose"] },
  { key: "liver",    name: "간 건강",   icon: "🫁", itemKeys: ["ast", "alt", "ggt"] },
  { key: "kidney",   name: "콩팥 건강", icon: "🫘", itemKeys: ["cr", "egfr"] },
  { key: "weight",   name: "체중·비만", icon: "⚖️", itemKeys: ["bmi", "waist"] },
];

// 항목 하나의 판정(정상/주의/위험). 값이 없거나 판정 불가면 null.
function statusOfKey(key: string, data: Record<string, string>, sex: string): Status | null {
  if (key === "bmi") { const bmi = computeBMI(data); return bmi == null ? null : bmiStatus(bmi); }
  const it = ITEM_BY_KEY[key];
  if (!it || !it.eval) return null;
  const raw = data[key];
  if (raw == null || raw === "") return null;
  const num = parseFloat(raw);
  if (isNaN(num)) return null;
  return it.eval(num, sex);
}

export function buildScores(data: Record<string, string>): AreaScore[] {
  const sex = data.sex ?? "";
  return SCORE_AREAS.map((area) => {
    const scores: number[] = [];
    for (const k of area.itemKeys) {
      const st = statusOfKey(k, data, sex);
      if (st === "good" || st === "warn" || st === "bad") scores.push(STATUS_SCORE[st]);
    }
    const total = area.itemKeys.length;
    const filled = scores.length;
    if (filled === 0) return { key: area.key, name: area.name, icon: area.icon, score: null, stars: 0, filled, total };
    const score = Math.round(scores.reduce((a, b) => a + b, 0) / filled);
    const stars = score >= 90 ? 5 : score >= 70 ? 4 : score >= 50 ? 3 : score >= 30 ? 2 : 1;
    return { key: area.key, name: area.name, icon: area.icon, score, stars, filled, total };
  });
}
