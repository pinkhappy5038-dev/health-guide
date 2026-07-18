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
  { key: "name", name: "이름", unit: "", type: "text", placeholder: "예: 숙경" },
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
  { n: 1,  icon: "✉️", title: "의사 선생님의 편지",       status: "live" },
  { n: 2,  icon: "⭐", title: "내 건강 점수",             status: "live" },
  { n: 3,  icon: "🛡️", title: "내 몸의 믿는 구석",        status: "live" },
  { n: 4,  icon: "⚠️", title: "내 몸에 보내는 경고",       status: "live" },
  { n: 5,  icon: "📖", title: "그게 무슨 뜻이에요?",       status: "live" },
  { n: 6,  icon: "🎯", title: "다음 검진까지 프로젝트",     status: "live" },
  { n: 7,  icon: "💊", title: "내 영양제, 잘 먹고 있나요?", status: "live" },
  { n: 8,  icon: "🌱", title: "오늘부터 하는 건강습관",     status: "live" },
  { n: 9,  icon: "🔮", title: "앞으로 생길 가능성 높은 질환", status: "live" },
  { n: 10, icon: "🤝", title: "의사의 마지막 이야기",       status: "live" },
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

// ===== Part 3: 내 몸의 믿는 구석 (정상 판정 항목만 모으기) =====
export type StrengthArea = { key: string; name: string; icon: string; goodItems: string[] };

function nameOfKey(key: string): string {
  if (key === "bmi") return "BMI(체질량지수)";
  return ITEM_BY_KEY[key]?.name ?? key;
}

export function buildStrengths(data: Record<string, string>): StrengthArea[] {
  const sex = data.sex ?? "";
  const out: StrengthArea[] = [];
  for (const area of SCORE_AREAS) {
    const goodItems: string[] = [];
    for (const k of area.itemKeys) {
      if (statusOfKey(k, data, sex) === "good") goodItems.push(nameOfKey(k));
    }
    if (goodItems.length) out.push({ key: area.key, name: area.name, icon: area.icon, goodItems });
  }
  return out;
}

// ===== Part 4: 내 몸에 보내는 경고 (주의·위험만, 생활 비유 문구) =====
const WARN_MSG: Record<string, string> = {
  sbp: "혈관이 평소보다 힘을 더 주고 버티는 중이에요",
  dbp: "혈관이 평소보다 힘을 더 주고 버티는 중이에요",
  glucose: "몸이 당(설탕)을 처리하는 속도가 느려졌다는 신호예요",
  tchol: "혈관에 기름때가 쌓이기 시작한다는 신호예요",
  ldl: "혈관에 기름때가 쌓이기 시작한다는 신호예요",
  tg: "핏속 기름기가 많다는 뜻이에요",
  hdl: "혈관을 청소하는 좋은 일꾼이 부족해요",
  ast: "간이 요즘 좀 지쳐 있다는 신호예요",
  alt: "간이 요즘 좀 지쳐 있다는 신호예요",
  ggt: "간이 요즘 좀 지쳐 있다는 신호예요",
  cr: "콩팥이 힘들어하고 있다는 신호예요",
  egfr: "콩팥이 힘들어하고 있다는 신호예요",
  bmi: "몸에 살이 좀 붙어서 관리가 필요해요",
  waist: "몸에 살이 좀 붙어서 관리가 필요해요",
  hb: "피 속 산소 배달부가 부족해요",
};

export type Warning = { key: string; name: string; status: "warn" | "bad"; msg: string };

export function buildWarnings(data: Record<string, string>): Warning[] {
  const sex = data.sex ?? "";
  const keys = ["bmi", ...SECTIONS.flatMap((s) => s.items.filter((i) => i.eval).map((i) => i.key))];
  const out: Warning[] = [];
  for (const k of keys) {
    const st = statusOfKey(k, data, sex);
    if (st === "warn" || st === "bad") out.push({ key: k, name: nameOfKey(k), status: st, msg: WARN_MSG[k] ?? "" });
  }
  // 위험(bad) 먼저, 그다음 주의(warn)
  out.sort((a, b) => (a.status === b.status ? 0 : a.status === "bad" ? -1 : 1));
  return out;
}

// ===== Part 5: 그게 무슨 뜻이에요? (결과지 용어 쉬운말 사전) =====
const TERM_EXPLAIN: Record<string, string> = {
  sbp: "심장이 피를 쫙 밀어낼 때 혈관이 받는 압력이에요. 물호스를 세게 틀었을 때의 세기 같은 거죠.",
  dbp: "심장이 쉬는 순간에도 혈관에 남아 있는 압력이에요.",
  glucose: "8시간 굶은 뒤 피 속에 남아 있는 당(설탕)의 양이에요. 아침 공복에 재는 이유예요.",
  tchol: "피 속 기름기의 전체 합계예요. 좋은 것(HDL)과 나쁜 것(LDL)이 섞여 있어요.",
  hdl: "혈관에 낀 기름때를 청소해 가는 청소부예요. 이건 높을수록 좋아요.",
  ldl: "혈관 벽에 기름때를 붙이고 다니는 배달트럭이에요. 많으면 때가 쌓여요.",
  tg: "쓰고 남은 열량이 기름 형태로 피에 떠다니는 거예요. 야식·단것·술과 친해요.",
  ast: "간세포가 다치면 피로 흘러나오는 효소예요. 높으면 간이 힘들다는 신호예요.",
  alt: "간에 더 특화된 효소예요. 이게 높으면 간 자체가 지쳤을 가능성이 커요.",
  ggt: "술·약물에 민감하게 반응하는 간 효소예요. 술 드시는 분의 간 상태를 잘 보여줘요.",
  cr: "근육을 쓰고 남은 찌꺼기예요. 콩팥이 잘 거르면 피에 조금만 남아요.",
  egfr: "콩팥이 1분에 피를 얼마나 걸러내는지 계산한 성적표예요. 클수록 좋아요.",
  hb: "피 속에서 산소를 실어 나르는 배달부예요. 부족하면 빈혈 — 쉽게 지치고 어지러워요.",
  bmi: "키에 비해 몸무게가 적당한지 보는 숫자예요. 몸무게(kg)를 키(m)의 제곱으로 나눠 계산해요.",
  waist: "뱃속 내장 사이에 낀 지방을 가늠하는 줄자예요. 내장지방은 혈관·혈당의 적이에요.",
};

export type TermEntry = {
  key: string; name: string; explain: string;
  section: string;
  myValText: string | null;   // 입력했으면 "120 mg/dL"
  myStatus: Status | null;    // 입력했으면 판정
};

export function buildTerms(data: Record<string, string>): TermEntry[] {
  const sex = data.sex ?? "";
  const out: TermEntry[] = [];
  for (const sec of SECTIONS) {
    for (const it of sec.items) {
      const explain = TERM_EXPLAIN[it.key];
      if (!explain) continue;
      const raw = data[it.key];
      const has = raw != null && raw !== "";
      out.push({
        key: it.key, name: it.name, explain, section: sec.title,
        myValText: has ? `${raw} ${it.unit}`.trim() : null,
        myStatus: has ? statusOfKey(it.key, data, sex) : null,
      });
    }
  }
  // BMI (자동 계산 항목) — '기본 정보' 묶음의 맨 앞에 끼워넣기
  const bmi = computeBMI(data);
  const firstBasic = out.findIndex((t) => t.section === "기본 정보");
  out.splice(firstBasic === -1 ? 0 : firstBasic, 0, {
    key: "bmi", name: "BMI(체질량지수)", explain: TERM_EXPLAIN.bmi, section: "기본 정보",
    myValText: bmi != null ? String(bmi) : null,
    myStatus: bmi != null ? bmiStatus(bmi) : null,
  });
  return out;
}

// ===== Part 1: 의사 선생님의 편지 (규칙 기반 조립 — AI 연결은 나중) =====
// 칭찬: 영역별 "몸이 잘하는 일"을 구체적으로 + 문진 답이 좋을 때만 습관을 연결(지어내지 않기).
const PRAISE_BODY: Record<string, string> = {
  vascular: "혈관이 깨끗하고 탄력을 잘 유지하고 있어요",
  glucose: "몸이 당을 처리하는 힘이 좋아요",
  liver: "간이 피로·해독 일을 잘 해내고 있어요",
  kidney: "콩팥이 노폐물을 잘 걸러내고 있어요",
  weight: "체중이 건강한 범위에 잘 있어요",
};
// 영역 정상 + 이 습관 답이면 → 이 문장을 덧붙인다
const PRAISE_HABIT: Record<string, { habitKey: string; goodAnswer: string; line: string }[]> = {
  liver: [{ habitKey: "alcohol", goodAnswer: "거의 안 마심", line: "술을 절제해오신 덕이 커요." }],
  glucose: [{ habitKey: "sweetDrink", goodAnswer: "거의 안 마심", line: "단 음료를 멀리하신 게 그대로 나타나네요." }],
  vascular: [
    { habitKey: "exercise", goodAnswer: "주 3회 이상", line: "꾸준한 운동의 힘이에요." },
    { habitKey: "salty", goodAnswer: "싱겁게", line: "싱겁게 드시는 습관이 혈관을 지켜주고 있어요." },
  ],
};

export type Letter = { paragraphs: string[] } | null; // null = 수치 없음

export function buildLetter(data: Record<string, string>): Letter {
  const s = buildSummary(data);
  if (!s.hasData) return null;
  const total = s.good + s.warn + s.bad;
  const warnings = buildWarnings(data);
  const sex = data.sex ?? "";
  const paras: string[] = [];

  // ① 인사 (이름이 있으면 "숙경님" 하고 불러준다)
  const who = data.name != null && data.name !== "" ? `, ${data.name}님` : "";
  paras.push(`안녕하세요${who}. 이번 검진 결과지를 저와 함께 차근차근 보시죠.`);

  // ② 전체 그림
  let overview = `이번 검진에서 ${total}개 항목을 살펴봤어요. 정상 ${s.good}개, 주의 ${s.warn}개, 위험 ${s.bad}개예요.`;
  if (s.bad + s.warn === 0) overview += " 아주 잘 관리되고 있어요. 이대로만 가면 됩니다.";
  else overview += " 숫자만 보면 걱정되실 수 있지만, 하나씩 보면 생각보다 괜찮아요.";
  paras.push(overview);

  // ③ 칭찬 (영역 전체가 정상일 때 — 구체적으로 + 습관 연결)
  const praise: string[] = [];
  for (const area of SCORE_AREAS) {
    const sts = area.itemKeys.map((k) => statusOfKey(k, data, sex)).filter((x) => x !== null);
    if (sts.length && sts.every((x) => x === "good")) {
      let line = PRAISE_BODY[area.key] ?? `${area.name}이(가) 잘 유지되고 있어요`;
      for (const h of PRAISE_HABIT[area.key] ?? []) {
        if (data[h.habitKey] === h.goodAnswer) { line += ". " + h.line.replace(/\.$/, ""); break; }
      }
      praise.push(line);
    }
  }
  if (praise.length) paras.push("먼저 잘 지켜온 것부터 볼게요. " + praise.join(". ") + ".");

  // ④ 신경 쓸 것 (위험 먼저 정렬돼 있음, 최대 3개만 편지에)
  // 한글 받침 유무에 따라 은/는, 이/가 자동 선택
  const josa = (word: string, withBatchim: string, without: string) => {
    const ch = word.replace(/[^가-힣]/g, "").slice(-1);
    if (!ch) return word + without;
    return word + (((ch.charCodeAt(0) - 0xac00) % 28) > 0 ? withBatchim : without);
  };
  if (warnings.length) {
    const top = warnings.slice(0, 3);
    const lines = top.map((w) => `${w.status === "bad" ? josa(w.name, "은", "는") + " 지금 챙겨야 할 수준이에요" : josa(w.name, "이", "가") + " 조금 높게 나왔어요"}. ${w.msg}`);
    let att = "이제 같이 신경 쓸 것을 볼게요. " + lines.join(". ") + ".";
    if (warnings.length > 3) att += ` (자세한 건 Part 4에 ${warnings.length}개 모두 정리해뒀어요.)`;
    att += " 놀라실 일은 아니지만, 이번 기회에 챙겨보면 좋겠어요.";
    paras.push(att);
  }

  // ⑤ 마무리 격려 (+ 다음 검진일)
  let close = "건강은 하루아침에 무너지지 않아요. 오늘부터 작은 것 하나씩이면 충분합니다.";
  if (data.nextCheckup) close += ` 다음 검진(${data.nextCheckup}) 때 더 좋아진 결과지로 만나요.`;
  paras.push(close);
  paras.push("— 당신의 건강을 지켜보는 가이드북 드림");
  return { paragraphs: paras };
}

// ===== Part 7: 내 영양제, 잘 먹고 있나요? =====
export const SUPPS_STORE_KEY = "health-guide-supps";

// 흔한 영양제 사전: 목적(purpose)이 같으면 "겹침"으로 진단. when = 먹기 좋은 때.
export type SuppInfo = { key: string; name: string; purpose: string; why: string; when: "아침 공복" | "식후" | "저녁" ; tip?: string };
export const SUPP_DICT: SuppInfo[] = [
  { key: "probiotic", name: "유산균", purpose: "장 건강", why: "장 속 좋은 균을 늘려 배변·면역을 도와요", when: "아침 공복", tip: "따뜻한 물과 함께" },
  { key: "omega3", name: "오메가3", purpose: "혈행·혈관", why: "핏속 기름기(중성지방) 관리와 혈행을 도와요", when: "식후", tip: "기름진 식사와 흡수↑" },
  { key: "lutein", name: "루테인", purpose: "눈 건강", why: "나이 들며 줄어드는 눈의 황반 색소를 보충해요", when: "식후" },
  { key: "eyeomega", name: "눈 영양제(오메가 함유)", purpose: "눈 건강", why: "눈 피로·건조감 관리를 도와요", when: "식후" },
  { key: "vitd", name: "비타민D", purpose: "뼈·면역", why: "칼슘 흡수와 면역에 필요해요. 실내 생활이 많으면 부족하기 쉬워요", when: "식후", tip: "지용성 — 식후에" },
  { key: "calcium", name: "칼슘", purpose: "뼈·면역", why: "뼈를 지키는 기본 재료예요", when: "식후" },
  { key: "magnesium", name: "마그네슘", purpose: "근육·수면", why: "눈 떨림·근육 뭉침·수면의 질에 관여해요", when: "저녁" },
  { key: "vitb", name: "비타민B군", purpose: "피로 회복", why: "에너지 대사를 도와 피로 관리에 쓰여요", when: "식후", tip: "아침·점심 식후 (저녁엔 수면 방해 가능)" },
  { key: "vitc", name: "비타민C", purpose: "항산화·면역", why: "면역과 피부, 철분 흡수를 도와요", when: "식후" },
  { key: "iron", name: "철분", purpose: "빈혈", why: "혈색소(피 속 산소 배달부)의 재료예요", when: "아침 공복", tip: "비타민C와 함께, 커피·우유와는 띄워서" },
  { key: "ginkgo", name: "은행잎 추출물", purpose: "기억력·혈행", why: "말초 혈행과 기억력 관리에 쓰여요", when: "식후" },
  { key: "memory", name: "기억력 영양제(포스파티딜세린 등)", purpose: "기억력·혈행", why: "인지 건강 관리에 쓰여요", when: "식후" },
  { key: "redginseng", name: "홍삼", purpose: "피로 회복", why: "활력·면역 관리에 널리 쓰여요", when: "식후" },
  { key: "milkthistle", name: "밀크씨슬", purpose: "간 건강", why: "간 건강 관리에 쓰이는 성분(실리마린)이에요", when: "식후" },
];

export type SuppDiagnosis = {
  overlaps: { purpose: string; names: string[] }[];  // 겹친다
  tooMany: boolean;                                   // 넘친다 (6개 이상)
  missing: string[];                                  // 빠졌다 (검진 근거)
  schedule: { slot: string; icon: string; items: { name: string; tip?: string }[] }[]; // 시간표
};

export function diagnoseSupps(myKeys: string[], data: Record<string, string>): SuppDiagnosis {
  const mine = SUPP_DICT.filter((s) => myKeys.includes(s.key));
  // 겹친다: 같은 purpose 2개 이상
  const byPurpose: Record<string, string[]> = {};
  for (const s of mine) (byPurpose[s.purpose] ??= []).push(s.name);
  const overlaps = Object.entries(byPurpose)
    .filter(([, names]) => names.length >= 2)
    .map(([purpose, names]) => ({ purpose, names }));
  // 넘친다: 6개 이상
  const tooMany = mine.length >= 6;
  // 빠졌다: 검진 근거 있는 것만 (지어내지 않기)
  const sex = data.sex ?? "";
  const missing: string[] = [];
  const st = (k: string) => statusOfKey(k, data, sex);
  if ((st("hb") === "warn" || st("hb") === "bad") && !myKeys.includes("iron"))
    missing.push("혈색소가 낮게 나왔는데 철분제가 없어요 — 의사와 상담해보세요");
  if ((st("tg") === "warn" || st("tg") === "bad") && !myKeys.includes("omega3"))
    missing.push("중성지방이 높게 나왔어요 — 오메가3가 도움될 수 있어요 (의사·약사와 상담)");
  // 시간표
  const slots: { slot: "아침 공복" | "식후" | "저녁"; icon: string }[] = [
    { slot: "아침 공복", icon: "☀️" }, { slot: "식후", icon: "🍚" }, { slot: "저녁", icon: "🌙" },
  ];
  const schedule = slots
    .map(({ slot, icon }) => ({
      slot, icon,
      items: mine.filter((s) => s.when === slot).map((s) => ({ name: s.name, tip: s.tip })),
    }))
    .filter((g) => g.items.length > 0);
  return { overlaps, tooMany, missing, schedule };
}

// ===== Part 9: 앞으로 생길 가능성 높은 질환 (갈림길, 규칙 기반 — AI 업그레이드는 나중) =====
export type RiskPath = { icon: string; title: string; y1: string; y5: string; y10: string; change: string };

export function buildRisks(data: Record<string, string>): { paths: RiskPath[]; ageNote: string | null } | null {
  if (!buildSummary(data).hasData) return null;
  const sex = data.sex ?? "";
  const isBadOrWarn = (k: string) => { const s = statusOfKey(k, data, sex); return s === "warn" || s === "bad"; };
  const paths: RiskPath[] = [];

  if (isBadOrWarn("glucose") || data.sweetDrink === "자주") {
    paths.push({ icon: "🍬", title: "혈당 경로",
      y1: "체중 증가와 함께 혈당이 더 오르기 쉬워요",
      y5: "당뇨 전단계를 지나 제2형 당뇨로 들어설 위험이 커져요",
      y10: "당뇨 합병증(눈·콩팥·신경) 위험까지 이어질 수 있어요",
      change: "단 음료만 끊어도 이 경로에서 내려올 수 있어요. 지금이 되돌리기 가장 쉬운 때예요." });
  }
  if (["sbp", "dbp", "tchol", "ldl", "tg", "hdl"].some(isBadOrWarn) || data.salty === "짜게") {
    paths.push({ icon: "🫀", title: "혈관 경로",
      y1: "혈관 벽의 부담과 기름때가 조용히 쌓여가요",
      y5: "고혈압이 굳어지고 동맥경화가 진행될 수 있어요",
      y10: "심근경색·뇌졸중 같은 큰 사고의 위험이 올라가요",
      change: "싱겁게 먹기 + 주 3회 걷기 — 이 둘이면 혈관은 다시 부드러워지기 시작해요." });
  }
  if (["ast", "alt", "ggt"].some(isBadOrWarn) || data.alcohol === "자주") {
    paths.push({ icon: "🫁", title: "간 경로",
      y1: "지방간이 생기거나 깊어질 수 있어요",
      y5: "간염·간기능 저하로 이어질 위험이 있어요",
      y10: "간경변처럼 되돌리기 어려운 단계의 위험이 커져요",
      change: "술 쉬는 날을 주 3일만 만들어도 간은 그날부터 회복을 시작해요." });
  }
  if (isBadOrWarn("bmi") || isBadOrWarn("waist")) {
    paths.push({ icon: "⚖️", title: "체중 경로",
      y1: "지금 습관이 그대로면 체중은 조금씩 더 늘어요",
      y5: "당뇨·고혈압이 함께 오는 몸이 되기 쉬워요",
      y10: "무릎 관절과 심장이 무게를 견디느라 지쳐가요",
      change: "저녁 9시 이후 안 먹기 — 이 하나가 체중 곡선을 꺾는 첫 단추예요." });
  }
  if (data.smoke === "피움") {
    paths.push({ icon: "🚬", title: "흡연 경로",
      y1: "폐 기능이 조금씩 떨어지기 시작해요",
      y5: "만성 기관지염과 혈관 손상이 진행돼요",
      y10: "폐암·심혈관 질환 위험이 크게 올라가요",
      change: "몸은 담배를 끊는 그 순간부터 회복을 시작해요. 늦은 때는 없어요." });
  }
  if (["cr", "egfr"].some(isBadOrWarn)) {
    paths.push({ icon: "🫘", title: "콩팥 경로",
      y1: "콩팥의 거르는 힘이 서서히 떨어질 수 있어요",
      y5: "만성콩팥병으로 진행될 위험이 있어요",
      y10: "투석까지 가는 길을 미리 막는 게 중요해요",
      change: "짜게 먹지 않기 + 혈압 관리 — 콩팥을 지키는 두 기둥이에요." });
  }

  // 연령 한 줄 (출생연도 있을 때만)
  let ageNote: string | null = null;
  const by = parseInt(data.birthYear ?? "", 10);
  if (!isNaN(by)) {
    const age = new Date().getFullYear() - by;
    if (age >= 50 && paths.length > 0) ageNote = `${age}세부터는 같은 습관이라도 몸에 쌓이는 속도가 빨라져요. 그래서 지금 바꾸는 게 더 값져요.`;
  }
  return { paths, ageNote };
}

// ===== Part 6: 다음 검진까지 프로젝트 (목표 수치 + 시즌 미션, 규칙 기반) =====
// 문제 영역별 실천 미션 (연령 맞춤·AI 제안은 나중 단계)
const AREA_MISSIONS: Record<string, string[]> = {
  vascular: ["싱겁게 먹기 — 국물은 남기기", "주 3회, 30분 빠르게 걷기"],
  glucose: ["단 음료 대신 물·차 마시기", "밥은 천천히 — 20분 이상 들여 먹기"],
  liver: ["술 쉬는 날, 주 3일 만들기", "밤늦은 야식 줄이기"],
  kidney: ["물 자주 마시기", "짜게 먹지 않기 (콩팥 부담 줄이기)"],
  weight: ["저녁 9시 이후 안 먹기", "엘리베이터 대신 계단 이용"],
  anemia: ["살코기·시금치 같은 철분 음식 챙겨 먹기"],
};
// 항목 → 영역 찾기 (미션 고르기용)
function areaOfKey(key: string): string {
  if (key === "hb") return "anemia";
  if (key === "bmi") return "weight";
  for (const a of SCORE_AREAS) if (a.itemKeys.includes(key)) return a.key;
  return "";
}
// 목표 표시용 기준 (기존 ref 재사용, BMI만 별도)
function targetOfKey(key: string, sex: string): string {
  if (key === "bmi") return "18.5~22.9";
  const it = ITEM_BY_KEY[key];
  return it && it.ref ? it.ref(sex) : "";
}

export type ProjectGoal = { name: string; current: string; target: string; status: "warn" | "bad" };
export type Project = {
  finish: string | null;          // 다음 검진 예정 (없으면 null)
  goals: ProjectGoal[];           // 최대 3개 (위험 먼저)
  missions: string[];             // 중복 제거, 최대 4개
  allClear: boolean;              // 문제 없음 = 유지 프로젝트
} | null;                         // null = 수치 없음

export function buildProject(data: Record<string, string>): Project {
  if (!buildSummary(data).hasData) return null;
  const sex = data.sex ?? "";
  const warnings = buildWarnings(data); // 위험 먼저 정렬돼 있음
  const goals: ProjectGoal[] = warnings.slice(0, 3).map((w) => ({
    name: w.name,
    current: w.key === "bmi" ? String(computeBMI(data)) : `${data[w.key]} ${ITEM_BY_KEY[w.key]?.unit ?? ""}`.trim(),
    target: targetOfKey(w.key, sex),
    status: w.status,
  }));
  const missions: string[] = [];
  for (const w of warnings) {
    for (const m of AREA_MISSIONS[areaOfKey(w.key)] ?? []) {
      if (!missions.includes(m) && missions.length < 4) missions.push(m);
    }
  }
  return {
    finish: data.nextCheckup != null && data.nextCheckup !== "" ? data.nextCheckup : null,
    goals, missions,
    allClear: warnings.length === 0,
  };
}

// ===== Part 8: 오늘부터 하는 건강습관 (매일 체크리스트) =====
export const HABITS_STORE_KEY = "health-guide-habits";
export const DAILY_HABITS: { key: string; label: string; icon: string }[] = [
  { key: "water", label: "아침에 일어나 물 한 컵", icon: "💧" },
  { key: "walk", label: "하루 30분 걷기", icon: "🚶" },
  { key: "nosnack", label: "저녁 9시 이후 안 먹기", icon: "🌙" },
];

// 오늘 날짜를 "2026-07-14" 형태로 (컴퓨터의 현지 날짜 기준)
export function todayKey(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export type HabitRecords = Record<string, Record<string, boolean>>; // 날짜 → (습관key → 체크)

// 하루 "달성" = 그날 습관을 전부 체크. 연속 달성일 계산 —
// 오늘 달성이면 오늘부터, 아니면 어제부터 거꾸로 센다 (오늘은 아직 진행 중이니까).
export function computeStreak(records: HabitRecords): number {
  const done = (dateKey: string) => {
    const day = records[dateKey];
    return day != null && DAILY_HABITS.every((h) => day[h.key] === true);
  };
  const d = new Date();
  if (!done(todayKey())) d.setDate(d.getDate() - 1); // 오늘 미달성이면 어제부터
  let streak = 0;
  const p = (n: number) => String(n).padStart(2, "0");
  while (true) {
    const key = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (!done(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ===== Part 10: 의사의 마지막 이야기 =====
export const PHILOSOPHY =
  "건강은 하루아침에 무너지지 않습니다. 반대로 건강도 하루아침에 만들어지지 않습니다. 오늘의 작은 습관 하나가 10년 뒤의 건강한 나를 만듭니다.";

// "당신의 믿는 구석은 ○○이었고, 챙길 것은 ○○이었습니다" — 수치 없으면 null
export function buildJourneyLine(data: Record<string, string>): string | null {
  if (!buildSummary(data).hasData) return null;
  const goodAreas = buildStrengths(data).map((a) => a.name);
  const warnNames = [...new Set(buildWarnings(data).map((w) => w.name))];
  if (!goodAreas.length && !warnNames.length) return null;
  const parts: string[] = [];
  if (goodAreas.length) parts.push(`당신의 믿는 구석은 ${goodAreas.join("·")}이었고`);
  if (warnNames.length) parts.push(`${goodAreas.length ? "챙길" : "당신이 챙길"} 것은 ${warnNames.slice(0, 3).join("·")}이었습니다`);
  else parts.push("특별히 챙길 것 없이 잘 지내고 계셨습니다");
  return parts.join(", ") + ". 이제 어디를 보면 되는지 아시죠?";
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
