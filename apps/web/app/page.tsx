"use client";
// 평생건강가이드북 — 화면 3개(차례·파트·입력). prototype/index.html 을 React 로 옮김.
// 벽보에 직접 지우고 쓰던 걸, "지금 무슨 화면인지"를 상태(useState)로 바꾸면
// 화면이 알아서 다시 그려지는 방식으로 바꿨다.

import { useEffect, useState } from "react";
import {
  SECTIONS, PROFILE_FIELDS, HABIT_FIELDS, PARTS, STATUS_LABEL, STORE_KEY, partByNum, buildSummary, buildScores, buildStrengths, buildWarnings, buildLetter, buildTerms, buildJourneyLine, PHILOSOPHY,
  DAILY_HABITS, HABITS_STORE_KEY, todayKey, computeStreak, buildProject, buildRisks,
  SUPP_DICT, SUPPS_STORE_KEY, diagnoseSupps,
} from "./lib/health";
import type { HabitRecords } from "./lib/health";
import type { Item } from "./lib/health";

type Data = Record<string, string>;
type Screen = "toc" | "part" | "input";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("toc");
  const [part, setPart] = useState(1);
  const [data, setData] = useState<Data>({});   // 저장된 검진 수치
  const [draft, setDraft] = useState<Data>({});  // 입력 화면에서 편집 중인 값

  // 처음 한 번: 브라우저에 저장해둔 값 불러오기 (localStorage 는 브라우저에서만 있어 여기서 읽는다)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch { /* 저장값이 깨졌으면 빈 값으로 시작 */ }
  }, []);

  // 화면·파트가 바뀌면 맨 위로
  useEffect(() => { window.scrollTo(0, 0); }, [screen, part]);

  // ===== 화면 이동 =====
  function goToc() { setScreen("toc"); }
  function goInput() { setDraft(data); setScreen("input"); }
  function goPart(n: number) { setPart(n); setScreen("part"); }
  function prevPart() { part > 1 ? goPart(part - 1) : goToc(); }
  function nextPart() { part < PARTS.length ? goPart(part + 1) : goToc(); }

  // ===== 저장 / 비우기 =====
  function save() {
    const clean: Data = {};
    for (const [k, v] of Object.entries(draft)) if (v !== "") clean[k] = v;
    clean._updated = new Date().toISOString();
    localStorage.setItem(STORE_KEY, JSON.stringify(clean));
    setData(clean);
    goPart(2); // 저장하면 Part 2(내 건강 점수)로
  }
  function resetForm() {
    if (!confirm("입력한 값을 모두 비울까요?")) return;
    localStorage.removeItem(STORE_KEY);
    setData({});
    setDraft({});
  }

  function setField(key: string, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  // Part 10: 나와의 약속 한 줄 저장 (검진 데이터와 함께 보관)
  function savePromise(text: string) {
    const next: Data = { ...data, promise: text, _updated: new Date().toISOString() };
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    setData(next);
  }

  return (
    <>
      <header>
        <h1>평생건강가이드북</h1>
        <p>검진 수치를 입력하면 내 건강 상태를 한눈에 보여줍니다.</p>
      </header>

      <main>
        {screen === "toc" && <Toc onPart={goPart} onInput={goInput} />}
        {screen === "part" && (
          <PartView n={part} data={data} onToc={goToc} onPrev={prevPart} onNext={nextPart} onInput={goInput} onPromise={savePromise} />
        )}
        {screen === "input" && (
          <InputForm draft={draft} onField={setField} onToc={goToc} onReset={resetForm} onSave={save} />
        )}
      </main>
    </>
  );
}

// ===== 차례(목차) =====
function Toc({ onPart, onInput }: { onPart: (n: number) => void; onInput: () => void }) {
  const hub = partByNum(8); // 오늘의 체크리스트
  return (
    <section>
      <button className="toc-hero" onClick={() => onPart(8)}>
        <span className="ic">{hub.icon}</span>
        <span><span className="t">오늘의 체크리스트</span><br /><span className="s">매일 여기부터 시작</span></span>
      </button>
      <button className="toc-input-btn" onClick={onInput}>✎ 검진 수치 입력·수정</button>
      {PARTS.map((p) => (
        <button className="toc-item" key={p.n} onClick={() => onPart(p.n)}>
          <span className="no">{p.n}</span>
          <span className="ic">{p.icon}</span>
          <span className="t">{p.title}</span>
          {p.status !== "live" && <span className="ready">준비 중</span>}
        </button>
      ))}
    </section>
  );
}

// ===== 파트 화면 =====
function PartView({
  n, data, onToc, onPrev, onNext, onInput, onPromise,
}: {
  n: number; data: Data; onToc: () => void; onPrev: () => void; onNext: () => void; onInput: () => void;
  onPromise: (text: string) => void;
}) {
  const p = partByNum(n);
  return (
    <section>
      <div className="partbar">
        <button className="toc-btn" onClick={onToc}>☰ 차례</button>
        <span className="counter">Part {n} / 10</span>
      </div>
      <div>
        <div className="part-title">{p.icon} {p.title}</div>
        {n === 1 ? <LetterPart data={data} onInput={onInput} /> :
         n === 2 ? <SummaryView data={data} onInput={onInput} /> :
         n === 3 ? <PridePart data={data} onInput={onInput} /> :
         n === 4 ? <WarnPart data={data} onInput={onInput} /> :
         n === 5 ? <TermsPart data={data} /> :
         n === 6 ? <ProjectPart data={data} onInput={onInput} /> :
         n === 7 ? <SuppsPart data={data} /> :
         n === 8 ? <HabitsPart /> :
         n === 9 ? <RisksPart data={data} onInput={onInput} /> :
         n === 10 ? <ClosingPart data={data} onPromise={onPromise} /> : (
          <div className="prep">
            <div className="big">{p.icon}</div>
            <div className="t">준비 중이에요</div>
            <div className="s">이 파트의 내용은 곧 채워질 거예요.</div>
          </div>
        )}
      </div>
      <div className="pager">
        <button className="prev" onClick={onPrev}>◀ 이전</button>
        <button className="next" onClick={onNext}>다음 ▶</button>
      </div>
    </section>
  );
}

// ===== Part 2: 내 건강 점수(한눈에 보기) =====
function SummaryView({ data, onInput }: { data: Data; onInput: () => void }) {
  const s = buildSummary(data);
  const scores = buildScores(data);
  if (!s.hasData) {
    return (
      <div className="empty">
        아직 입력한 수치가 없어요.<br /><br />
        <button className="btn-primary empty-btn" onClick={onInput}>검진 수치 입력하러 가기</button>
      </div>
    );
  }
  return (
    <>
      <div className="card">
        <h2>내 건강 점수</h2>
        <div className="body">
          {scores.map((a) => (
            <div className="score-row" key={a.key}>
              <span className="ic">{a.icon}</span>
              <span className="name">{a.name}</span>
              {a.score == null ? (
                <span className="none">아직 점수 없음</span>
              ) : (
                <>
                  <span className="score">{a.score}점</span>
                  <span className="stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={i <= a.stars ? "on" : "off"}>★</span>
                    ))}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="summary-top">
        <div className="box bg-good"><div className="num">{s.good}</div><div className="lbl">정상</div></div>
        <div className="box bg-warn"><div className="num">{s.warn}</div><div className="lbl">주의</div></div>
        <div className="box bg-bad"><div className="num">{s.bad}</div><div className="lbl">위험</div></div>
      </div>
      {SECTIONS.map((sec) => {
        const arr = s.bySection[sec.title];
        if (!arr || !arr.length) return null;
        return (
          <div className="card" key={sec.title}>
            <h2>{sec.title}</h2>
            <div className="body">
              {arr.map((r, i) => (
                <div className="metric" key={i}>
                  <span className="name">{r.name}</span>
                  <span className="val">{r.valText}</span>
                  <span className="ref">{r.refText}</span>
                  <span className={`badge ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {s.missing > 0 && (
        <div className="missing-note">
          아직 안 넣은 항목이 {s.missing}개 있어요. 검진 결과지에 있는 것만 넣어도 괜찮아요.
          <button className="btn-primary missing-btn" onClick={onInput}>수치 채우러 가기</button>
        </div>
      )}
      <div className="disclaimer">
        판정 기준은 국가건강검진·관련 학회 기준을 따릅니다. 점수와 별점은 이해를 돕기 위한 요약이며,
        의학적 진단이 아닙니다. 정확한 진단과 상담은 의사·의료기관에서 받으세요.
      </div>
      {s.updated && (
        <div className="updated">마지막 저장: {new Date(s.updated).toLocaleString("ko-KR")}</div>
      )}
    </>
  );
}

// ===== Part 1: 의사 선생님의 편지 =====
function LetterPart({ data, onInput }: { data: Data; onInput: () => void }) {
  const letter = buildLetter(data);
  if (letter === null) {
    return (
      <div className="empty">
        검진 수치를 넣으면 편지를 써드릴게요.<br /><br />
        <button className="btn-primary empty-btn" onClick={onInput}>검진 수치 입력하러 가기</button>
      </div>
    );
  }
  const dateStr = data._updated
    ? new Date(data._updated).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const body = letter.paragraphs.slice(0, -1);
  const sign = letter.paragraphs[letter.paragraphs.length - 1];
  return (
    <>
      <div className="letter">
        {body.map((p, i) => <p key={i}>{p}</p>)}
        {dateStr !== "" && <p className="date">{dateStr}</p>}
        <p className="sign">{sign}</p>
      </div>
      <div className="disclaimer">
        이 편지는 검진 수치를 쉽게 풀어 쓴 것이며, 의학적 진단이 아닙니다.
        정확한 진단과 상담은 의사·의료기관에서 받으세요.
      </div>
    </>
  );
}

// ===== Part 3: 내 몸의 믿는 구석 =====
function PridePart({ data, onInput }: { data: Data; onInput: () => void }) {
  const strengths = buildStrengths(data);
  if (!strengths.length) {
    return (
      <div className="empty">
        아직 정상으로 나온 항목이 없어요.<br />
        검진 수치를 넣으면 잘하고 있는 것부터 보여드릴게요.<br /><br />
        <button className="btn-primary empty-btn" onClick={onInput}>검진 수치 입력하러 가기</button>
      </div>
    );
  }
  return (
    <>
      <div className="pride-intro">잘하고 있는 것부터 볼게요 — 당신이 잘 지켜온 거예요. 💪</div>
      {strengths.map((a) => (
        <div className="card" key={a.key}>
          <h2>{a.icon} {a.name}</h2>
          <div className="body">
            {a.goodItems.map((nm, i) => (
              <div className="pride-item" key={i}>
                <span className="ck">✅</span>
                <span className="nm">{nm}</span>
                <span className="ok">정상</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ===== Part 4: 내 몸에 보내는 경고 =====
function WarnPart({ data, onInput }: { data: Data; onInput: () => void }) {
  const hasData = buildSummary(data).hasData;
  const warnings = buildWarnings(data);
  if (!hasData) {
    return (
      <div className="empty">
        아직 입력한 수치가 없어요.<br /><br />
        <button className="btn-primary empty-btn" onClick={onInput}>검진 수치 입력하러 가기</button>
      </div>
    );
  }
  if (!warnings.length) {
    return <div className="pride-intro">경고할 게 없어요! 아주 잘 지내고 계세요 🎉</div>;
  }
  return (
    <>
      <div className="warn-intro">지금 신경 써야 할 신호예요. 하나씩 볼게요.</div>
      {warnings.map((w) => (
        <div className="card" key={w.key}>
          <div className="warn-row">
            <span className={`sig ${w.status}`}>{w.status === "bad" ? "🔴 위험" : "🟡 주의"}</span>
            <div className="warn-text">
              <div className="warn-name">{w.name}</div>
              <div className="warn-msg">{w.msg}</div>
            </div>
          </div>
        </div>
      ))}
      <div className="disclaimer">
        이 신호는 검진 수치를 쉽게 풀어 설명한 것이며, 의학적 진단이 아닙니다.
        정확한 진단과 상담은 의사·의료기관에서 받으세요.
      </div>
    </>
  );
}

// ===== Part 5: 그게 무슨 뜻이에요? (용어 사전) =====
// 수치가 없어도 사전은 볼 수 있다. 수치가 있으면 "📌 당신의 수치"가 붙는다.
function TermsPart({ data }: { data: Data }) {
  const terms = buildTerms(data);
  const sections = [...new Set(terms.map((t) => t.section))];
  return (
    <>
      <div className="pride-intro">결과지에서 만나는 어려운 말들, 쉽게 풀어드릴게요.</div>
      {sections.map((sec) => (
        <div className="card" key={sec}>
          <h2>{sec}</h2>
          <div className="body">
            {terms.filter((t) => t.section === sec).map((t) => (
              <div className="term" key={t.key}>
                <div className="term-name">{t.name}</div>
                <div className="term-explain">{t.explain}</div>
                {t.myValText !== null && (
                  <div className="term-mine">
                    📌 당신의 수치: <b>{t.myValText}</b>
                    {t.myStatus !== null && t.myStatus !== "none" && (
                      <span className={`badge ${t.myStatus}`}>{STATUS_LABEL[t.myStatus]}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

// ===== Part 6: 다음 검진까지 프로젝트 =====
function ProjectPart({ data, onInput }: { data: Data; onInput: () => void }) {
  const proj = buildProject(data);
  if (proj === null) {
    return (
      <div className="empty">
        검진 수치를 넣으면 나만의 프로젝트를 짜드릴게요.<br /><br />
        <button className="btn-primary empty-btn" onClick={onInput}>검진 수치 입력하러 가기</button>
      </div>
    );
  }
  return (
    <>
      {proj.finish !== null ? (
        <div className="finish-line">🏁 결승선: {proj.finish} 검진</div>
      ) : (
        <div className="missing-note">
          다음 검진 예정을 입력하면 결승선이 생겨요.
          <button className="btn-primary missing-btn" onClick={onInput}>입력하러 가기</button>
        </div>
      )}

      {proj.allClear ? (
        <div className="pride-intro">고칠 목표가 없어요! 지금을 그대로 유지하는 게 이번 프로젝트예요 🎉<br />매일의 실천은 Part 8 체크리스트와 함께해요.</div>
      ) : (
        <>
          <div className="card">
            <h2>🎯 목표 수치</h2>
            <div className="body">
              {proj.goals.map((g, i) => (
                <div className="goal-row" key={i}>
                  <span className={`sig ${g.status}`}>{g.status === "bad" ? "🔴" : "🟡"}</span>
                  <span className="goal-name">{g.name}</span>
                  <span className="goal-move">지금 <b>{g.current}</b> → 목표 <b>{g.target}</b></span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h2>📅 이번 시즌 미션</h2>
            <div className="body">
              {proj.missions.map((m, i) => (
                <div className="mission-row" key={i}>🎯 {m}</div>
              ))}
              <div className="mission-note">매일의 실천 체크는 Part 8(오늘의 체크리스트)에서 — 곧 이 미션들이 거기로 연결될 거예요.</div>
            </div>
          </div>
        </>
      )}
      <div className="disclaimer">
        목표·미션은 검진 수치를 바탕으로 한 생활 제안이며, 의학적 처방이 아닙니다.
        약 복용·치료 중이라면 의사와 상의 후 실천하세요.
      </div>
    </>
  );
}

// ===== Part 7: 내 영양제, 잘 먹고 있나요? =====
function SuppsPart({ data }: { data: Data }) {
  const [myKeys, setMyKeys] = useState<string[]>([]);
  // 처음 한 번: 저장해둔 내 영양제 목록 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUPPS_STORE_KEY);
      if (raw) setMyKeys(JSON.parse(raw));
    } catch { /* 깨졌으면 빈 목록 */ }
  }, []);

  function toggle(key: string) {
    setMyKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem(SUPPS_STORE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const diag = diagnoseSupps(myKeys, data);
  const mine = SUPP_DICT.filter((s) => myKeys.includes(s.key));

  return (
    <>
      <div className="pride-intro">지금 드시는 영양제를 골라주세요. 겹치는 것·빠진 것·먹는 시간을 정리해드릴게요.</div>

      <div className="card">
        <h2>💊 내가 먹는 영양제 (누르면 선택)</h2>
        <div className="body supp-pick">
          {SUPP_DICT.map((s) => (
            <button key={s.key} className={`supp-chip ${myKeys.includes(s.key) ? "on" : ""}`} onClick={() => toggle(s.key)}>
              {myKeys.includes(s.key) ? "✅ " : ""}{s.name}
            </button>
          ))}
        </div>
      </div>

      {mine.length > 0 && (
        <>
          <div className="card">
            <h2>🔍 진단</h2>
            <div className="body">
              {diag.overlaps.map((o, i) => (
                <div className="supp-diag warn" key={i}>🔁 <b>{o.purpose}</b> 목적이 겹쳐요: {o.names.join(", ")} — 하나로 줄여도 될지 약사와 상담해보세요</div>
              ))}
              {diag.tooMany && (
                <div className="supp-diag warn">⚠️ 가짓수가 {mine.length}개예요 — 많을수록 몸이 흡수·처리하기 힘들어요. "왜 먹는지" 답 못 하는 것부터 정리 1순위!</div>
              )}
              {diag.missing.map((m, i) => (
                <div className="supp-diag info" key={i}>💡 {m}</div>
              ))}
              {diag.overlaps.length === 0 && !diag.tooMany && diag.missing.length === 0 && (
                <div className="supp-diag good">✅ 겹치는 것 없이 알맞게 드시고 있어요</div>
              )}
            </div>
          </div>

          <div className="card">
            <h2>⏰ 하루 복용 시간표 (약봉투처럼)</h2>
            <div className="body">
              {diag.schedule.map((g) => (
                <div className="supp-slot" key={g.slot}>
                  <div className="slot-name">{g.icon} {g.slot}</div>
                  {g.items.map((it, i) => (
                    <div className="slot-item" key={i}>{it.name}{it.tip !== undefined && <span className="tip"> — {it.tip}</span>}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>🗒️ 이건 왜 먹어요?</h2>
            <div className="body">
              {mine.map((s) => (
                <div className="supp-why" key={s.key}><b>{s.name}</b> — {s.why}</div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="disclaimer">
        이 정리는 일반 정보이며 복약 지도가 아닙니다. 병원 약을 드시는 분은
        영양제와 부딪힐 수 있으니 반드시 약사·의사와 상담하세요.
      </div>
    </>
  );
}

// ===== Part 8: 오늘부터 하는 건강습관 (매일 체크리스트) =====
function HabitsPart() {
  const [records, setRecords] = useState<HabitRecords>({});
  // 처음 한 번: 저장된 체크 기록 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HABITS_STORE_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch { /* 깨졌으면 빈 기록으로 시작 */ }
  }, []);

  const today = todayKey();
  const todayChecks = records[today] ?? {};
  const doneCount = DAILY_HABITS.filter((h) => todayChecks[h.key] === true).length;
  const streak = computeStreak(records);

  function toggle(key: string) {
    // 항상 "직전 상태" 기준으로 계산 — 연달아 눌러도 체크가 안 사라진다
    setRecords((prev) => {
      const day = prev[today] ?? {};
      const nextDay = { ...day, [key]: !(day[key] === true) };
      const next = { ...prev, [today]: nextDay };
      localStorage.setItem(HABITS_STORE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const d = new Date();
  const dateLabel = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });

  return (
    <>
      <div className="habit-head">
        <span className="habit-date">오늘 · {dateLabel}</span>
        <span className="habit-count">{doneCount} / {DAILY_HABITS.length} 완료</span>
      </div>
      {streak > 0 && <div className="streak">🔥 {streak}일 연속 달성 중!</div>}
      <div className="card">
        <div className="body">
          {DAILY_HABITS.map((h) => {
            const on = todayChecks[h.key] === true;
            return (
              <button key={h.key} className={`habit-row ${on ? "on" : ""}`} onClick={() => toggle(h.key)}>
                <span className="box">{on ? "✅" : "⬜"}</span>
                <span className="ic">{h.icon}</span>
                <span className="label">{h.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {doneCount === DAILY_HABITS.length && (
        <div className="pride-intro">오늘 것 다 해냈어요! 내일 또 만나요 🎉</div>
      )}
      <div className="habit-note">작게 시작하는 게 비결이에요. 습관이 자리 잡으면 하나씩 늘려가요.</div>
    </>
  );
}

// ===== Part 9: 앞으로 생길 가능성 높은 질환 (갈림길) =====
function RisksPart({ data, onInput }: { data: Data; onInput: () => void }) {
  const risks = buildRisks(data);
  if (risks === null) {
    return (
      <div className="empty">
        검진 수치와 생활 습관을 넣으면 나의 갈림길을 보여드릴게요.<br /><br />
        <button className="btn-primary empty-btn" onClick={onInput}>검진 수치 입력하러 가기</button>
      </div>
    );
  }
  if (risks.paths.length === 0) {
    return (
      <div className="pride-intro">
        지금 궤도라면 큰 위험 신호가 없어요! 🎉<br />
        이 길을 그대로 걸으면 돼요 — Part 8 체크리스트가 함께할 거예요.
      </div>
    );
  }
  return (
    <>
      <div className="warn-intro">
        이건 예언이 아니라, 지금 습관이 계속될 때의 이야기예요. 그리고 — 갈림길마다 다른 길이 있어요.
      </div>
      {risks.ageNote !== null && <div className="journey">{risks.ageNote}</div>}
      {risks.paths.map((p, i) => (
        <div className="card" key={i}>
          <h2>{p.icon} {p.title} — 이대로 가면</h2>
          <div className="body">
            <div className="risk-row"><span className="yr">1년 뒤</span><span className="tx">{p.y1}</span></div>
            <div className="risk-row"><span className="yr">5년 뒤</span><span className="tx">{p.y5}</span></div>
            <div className="risk-row"><span className="yr">10년 뒤</span><span className="tx">{p.y10}</span></div>
            <div className="risk-change">💚 바꾸면: {p.change}</div>
          </div>
        </div>
      ))}
      <div className="see-you">그 갈림길의 시작이 Part 6 프로젝트예요 🎯</div>
      <div className="disclaimer">
        위 내용은 통계적 경향을 바탕으로 한 생활 안내이며, 의학적 예측·진단이 아닙니다.
        정확한 평가는 의사·의료기관에서 받으세요.
      </div>
    </>
  );
}

// ===== Part 10: 의사의 마지막 이야기 & 나와의 약속 =====
function ClosingPart({ data, onPromise }: { data: Data; onPromise: (text: string) => void }) {
  const journey = buildJourneyLine(data);
  const saved = data.promise ?? "";
  const [text, setText] = useState(saved);
  const [editing, setEditing] = useState(saved === "");
  return (
    <>
      <div className="philosophy">“{PHILOSOPHY}”</div>
      {journey !== null && <div className="journey">{journey}</div>}

      <div className="card">
        <h2>✍️ 나와의 약속 한 줄</h2>
        <div className="body">
          {editing ? (
            <>
              <p className="promise-q">다음 검진까지, 딱 하나만 약속한다면?</p>
              <input
                className="promise-input" type="text" value={text}
                placeholder="예: 저녁 9시 이후엔 안 먹는다"
                onChange={(e) => setText(e.target.value)}
              />
              <button
                className="btn-primary promise-btn"
                onClick={() => { if (text.trim() !== "") { onPromise(text.trim()); setEditing(false); } }}
              >약속 저장하기</button>
            </>
          ) : (
            <>
              <p className="promise-saved">“{saved}”</p>
              <p className="promise-note">이 약속은 저장됐어요. 다음 검진 결과를 넣는 날, 다시 보여드릴게요.</p>
              <button className="btn-ghost promise-btn" onClick={() => setEditing(true)}>약속 고치기</button>
            </>
          )}
        </div>
      </div>

      {data.nextCheckup !== undefined && data.nextCheckup !== "" && (
        <div className="see-you">다음 검진에서 만나요 — {data.nextCheckup} 🤝</div>
      )}
    </>
  );
}

// ===== 검진 수치 입력 화면 =====
function InputForm({
  draft, onField, onToc, onReset, onSave,
}: {
  draft: Data; onField: (k: string, v: string) => void;
  onToc: () => void; onReset: () => void; onSave: () => void;
}) {
  return (
    <section>
      <div className="partbar">
        <button className="toc-btn" onClick={onToc}>☰ 차례</button>
        <span className="counter">검진 수치 입력</span>
      </div>
      <div className="input-hint">
        검진 결과지에 있는 수치만 넣으세요. 없는 항목은 비워두면 알아서 건너뜁니다.
      </div>
      <div>
        <div className="card">
          <h2>나에 대해</h2>
          <div className="body">
            {PROFILE_FIELDS.map((it) => (
              <FieldRow key={it.key} it={it} value={draft[it.key] ?? ""} onField={onField} />
            ))}
          </div>
        </div>
        <div className="card">
          <h2>생활 습관</h2>
          <div className="body">
            {HABIT_FIELDS.map((it) => (
              <FieldRow key={it.key} it={it} value={draft[it.key] ?? ""} onField={onField} />
            ))}
          </div>
        </div>
        {SECTIONS.map((sec) => (
          <div className="card" key={sec.title}>
            <h2>{sec.title}</h2>
            <div className="body">
              {sec.items.map((it) => (
                <FieldRow key={it.key} it={it} value={draft[it.key] ?? ""} onField={onField} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="actions">
        <button className="btn-ghost" onClick={onReset}>비우기</button>
        <button className="btn-primary" onClick={onSave}>저장하고 결과 보기</button>
      </div>
    </section>
  );
}

// 입력칸 한 줄 (선택 / 글자 / 숫자)
function FieldRow({ it, value, onField }: { it: Item; value: string; onField: (k: string, v: string) => void }) {
  return (
    <div className="row">
      <label>{it.name}</label>
      <span className="unit">{it.unit}</span>
      {it.type === "select" ? (
        <select value={value} onChange={(e) => onField(it.key, e.target.value)}>
          <option value="">선택</option>
          {it.options!.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : it.type === "text" ? (
        <input type="text" placeholder={it.placeholder ?? ""} value={value}
          onChange={(e) => onField(it.key, e.target.value)} />
      ) : (
        <input type="number" inputMode="decimal" step="any" placeholder={it.placeholder ?? "-"}
          value={value} onChange={(e) => onField(it.key, e.target.value)} />
      )}
    </div>
  );
}
