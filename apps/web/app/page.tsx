"use client";
// 평생건강가이드북 — 화면 3개(차례·파트·입력). prototype/index.html 을 React 로 옮김.
// 벽보에 직접 지우고 쓰던 걸, "지금 무슨 화면인지"를 상태(useState)로 바꾸면
// 화면이 알아서 다시 그려지는 방식으로 바꿨다.

import { useEffect, useState } from "react";
import {
  SECTIONS, PROFILE_FIELDS, HABIT_FIELDS, PARTS, STATUS_LABEL, STORE_KEY, partByNum, buildSummary, buildScores, buildStrengths, buildWarnings,
} from "./lib/health";
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

  return (
    <>
      <header>
        <h1>평생건강가이드북</h1>
        <p>검진 수치를 입력하면 내 건강 상태를 한눈에 보여줍니다.</p>
      </header>

      <main>
        {screen === "toc" && <Toc onPart={goPart} onInput={goInput} />}
        {screen === "part" && (
          <PartView n={part} data={data} onToc={goToc} onPrev={prevPart} onNext={nextPart} onInput={goInput} />
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
  n, data, onToc, onPrev, onNext, onInput,
}: {
  n: number; data: Data; onToc: () => void; onPrev: () => void; onNext: () => void; onInput: () => void;
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
        {n === 2 ? <SummaryView data={data} onInput={onInput} /> :
         n === 3 ? <PridePart data={data} onInput={onInput} /> :
         n === 4 ? <WarnPart data={data} onInput={onInput} /> : (
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
