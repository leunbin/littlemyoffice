import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createSimulation, startDay, endDay, tick, DEPTS, getMeetingName} from './simulation.js';
import {createOffice} from './scene.js';
import './style.css';

const sim = createSimulation();
const elapsed = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const meetingStates = {waiting: '예정', gathering: '이동 중', active: '진행 중', done: '완료', cancelled: '취소'};
const directorColor = '#98718c';

function Icon({type, ...props}) {
  const paths = {
    play: 'm9 5 11 7-11 7V5Z',
    exit: 'M9 4H4v16h5m6-12 4 4-4 4m-6-4h10',
    reset: 'M3 10a9 9 0 1 1 2 8M3 4v6h6',
    pause: 'M9 5v14M15 5v14',
    expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
    collapse: 'M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5',
  };
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}><path d={paths[type]}/></svg>;
}

function App() {
  const canvas = useRef(), scene = useRef(), speed = useRef(1), paused = useRef(false);
  const viewport = useRef(), expandButton = useRef();
  const [expanded, setExpanded] = useState(false);
  const [, refresh] = useState(0);
  const [rate, setRate] = useState(1), [pause, setPause] = useState(false);
  const [tab, setTab] = useState('schedule'), [selected, setSelected] = useState(null), [error, setError] = useState('');

  useEffect(() => {
    let handle, last = performance.now(), ui = 0;
    try {
      scene.current = createOffice(canvas.current, sim, setSelected);
    } catch {
      setError('3D 화면을 시작할 수 없습니다. 브라우저의 하드웨어 가속 설정을 확인한 뒤 새로고침해 주세요.');
      return;
    }
    function animate(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      if (!paused.current) tick(sim, dt * speed.current);
      scene.current.render(sim.time);
      ui += dt;
      if (ui > 0.2) { refresh(v => v + 1); ui = 0; }
      handle = requestAnimationFrame(animate);
    }
    handle = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(handle); scene.current?.dispose(); };
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setExpanded(document.fullscreenElement === viewport.current);
    const exitFallback = e => {
      if (e.key === 'Escape' && !document.fullscreenElement) setExpanded(false);
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('keydown', exitFallback);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('keydown', exitFallback);
    };
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    viewport.current?.querySelector('[data-exit-fullscreen]')?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      expandButton.current?.focus();
    };
  }, [expanded]);

  async function toggleFullscreen() {
    if (document.fullscreenElement === viewport.current) {
      await document.exitFullscreen().catch(() => {});
    } else if (expanded) {
      setExpanded(false);
    } else {
      try {
        if (!viewport.current.requestFullscreen || !document.fullscreenEnabled) {
          setExpanded(true);
          return;
        }
        await viewport.current.requestFullscreen();
      } catch {
        // Browsers without native fullscreen still get an expanded, viewport-filling view.
        setExpanded(true);
      }
    }
  }

  const present = sim.employees.filter(e => e.visible).length;
  const occupied = sim.schedule.filter(m => ['active', 'gathering'].includes(m.status)).length;
  const completed = sim.schedule.filter(m => m.status === 'done').length;
  const person = sim.employees.find(e => e.id === selected);
  const status = error ? '화면 오류' : sim.mode === 'idle' ? (sim.logs.length ? '퇴근 완료' : '출근 전') : pause ? '일시정지' : sim.mode === 'leaving' ? '퇴근 중' : '근무 중';

  function changeAttendance() {
    paused.current = false;
    setPause(false);
    (sim.mode === 'idle' ? startDay : endDay)(sim);
    refresh(v => v + 1);
  }

  return <main className="app">
    <header className="page-heading">
      <h1>우리의 작은 회사</h1>
      <div className="day-control">
        <span className={`status ${sim.mode === 'working' && !pause ? 'live' : ''}`}><i/>{status}</span>
        <button className={`primary ${sim.mode === 'working' ? 'leave' : ''}`} disabled={sim.mode === 'leaving' || !!error} onClick={changeAttendance}>
          <Icon type={sim.mode === 'idle' ? 'play' : 'exit'}/>
          {sim.mode === 'idle' ? '출근하기' : sim.mode === 'leaving' ? '퇴근 중…' : '퇴근하기'}
        </button>
      </div>
    </header>

    <div className="workspace">
      <section className="office-card" aria-label="사무실 시뮬레이션">
        <div className="card-top">
          <div className="office-summary">
            <h2>사무실</h2>
            <span>직원 <strong>{present}/{sim.employees.length}명</strong></span>
            <span>회의실 <strong>{occupied}/2</strong></span>
            <span className="elapsed">경과 <strong>{elapsed(sim.time)}</strong></span>
          </div>
          <div className="view-actions">
            <button className="text-button" disabled={!!error} onClick={() => scene.current?.reset()}><Icon type="reset"/>시점 초기화</button>
            <button ref={expandButton} className="text-button" disabled={!!error} aria-label="3D 사무실 전체화면" aria-pressed={expanded} onClick={toggleFullscreen}><Icon type="expand"/>전체화면</button>
          </div>
        </div>

        <div ref={viewport} className={`viewport${expanded ? ' is-expanded' : ''}`}>
          <canvas ref={canvas} aria-label="직원 26명과 두 회의실, 대표실, 탕비실이 있는 3D 사무실"/>
          {expanded && <>
            <div className="expanded-controls" role="group" aria-label="전체화면 조작">
              <button className="text-button" disabled={sim.mode === 'leaving'} onClick={changeAttendance}><Icon type={sim.mode === 'idle' ? 'play' : 'exit'}/>{sim.mode === 'idle' ? '출근하기' : sim.mode === 'leaving' ? '퇴근 중…' : '퇴근하기'}</button>
              <button className="text-button" onClick={() => scene.current?.reset()}><Icon type="reset"/>시점 초기화</button>
              <button data-exit-fullscreen className="text-button" onClick={toggleFullscreen}><Icon type="collapse"/>전체화면 닫기</button>
            </div>
            <p className="expanded-hint">휠 버튼 드래그로 이동 · 드래그로 회전 · 스크롤로 확대 · Esc로 닫기</p>
          </>}
          {error ? <div className="notice error" role="alert"><h2>화면을 열 수 없습니다</h2><p>{error}</p></div> : sim.mode === 'idle' && <div className="notice"><h2>{sim.logs.length ? '모두 퇴근했습니다' : '출근 전입니다'}</h2><p>상단의 출근하기를 누르면 직원들이 입장합니다.</p></div>}
          {person && <div className="person-pop">
            <button aria-label="직원 정보 닫기" onClick={() => setSelected(null)}>×</button>
            <strong><i style={{background: DEPTS[person.dept]?.color || directorColor}}/>{person.name} {person.role === '팀원' ? '' : person.role}</strong>
            <small>{DEPTS[person.dept]?.name || '대표'} · {person.state}</small>
          </div>}
        </div>

        <div className="scene-footer">
          <div className="legend" aria-label="팀별 색상">{[...DEPTS, {name: '대표', color: directorColor}].map(d => <span key={d.name}><i style={{background: d.color}}/>{d.name}</span>)}</div>
          <div className="playback" role="group" aria-label="시뮬레이션 재생 설정">
            <button disabled={sim.mode === 'idle' || !!error} aria-label={pause ? '시뮬레이션 재생' : '시뮬레이션 일시정지'} aria-pressed={pause} title={pause ? '재생' : '일시정지'} onClick={() => { paused.current = !pause; setPause(!pause); }}><Icon type={pause ? 'play' : 'pause'}/></button>
            {[1, 2, 4].map(n => <button key={n} disabled={!!error} className={rate === n ? 'chosen' : ''} aria-pressed={rate === n} aria-label={`${n}배속`} onClick={() => { speed.current = n; setRate(n); }}>{n}×</button>)}
          </div>
        </div>
        <p className="scene-hint">휠 버튼 드래그로 이동 · 드래그로 회전 · 스크롤로 확대 · 직원 클릭으로 상태 확인</p>
      </section>

      <aside className="side-panel" aria-label="회의 및 직원 정보">
        <div className="tabs" role="tablist" aria-label="사무실 정보">
          {[['schedule', '회의 일정'], ['people', `직원 ${sim.employees.length}`]].map(([id, label], index) => <button key={id} id={`${id}-tab`} type="button" role="tab" aria-selected={tab === id} aria-controls={`${id}-panel`} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const next = e.key === 'Home' ? 'schedule' : e.key === 'End' ? 'people' : index === 0 ? 'people' : 'schedule'; setTab(next); document.getElementById(`${next}-tab`)?.focus(); } }}>{label}</button>)}
        </div>

        {tab === 'schedule' ? <div id="schedule-panel" role="tabpanel" aria-labelledby="schedule-tab">
          <div className="panel-heading"><h2>오늘의 회의</h2><span className="count-tag">{completed}/{sim.schedule.length || 6} 완료</span></div>
          <div className="room-chips">{[0, 1].map(room => {
            const meeting = sim.schedule.find(m => m.room === room && ['active', 'gathering'].includes(m.status));
            return <div key={room}><span>회의실 {room === 0 ? 'A' : 'B'}</span><strong>{meeting ? (meeting.kind === 'leadership' ? '대표 · 팀장' : DEPTS[meeting.dept].name) : '비어 있음'}</strong><small>{meeting ? meetingStates[meeting.status] : '사용 가능'}</small></div>;
          })}</div>
          <div className="schedule-list">{sim.schedule.length ? sim.schedule.map(m => <div className={`meeting ${m.status}`} key={m.id}>
            <div className="sequence" aria-label={`${m.round + 1}번째 순서`}>{m.status === 'done' ? '✓' : String(m.round + 1).padStart(2, '0')}</div>
            <div className="meeting-info"><strong><i style={{background: m.kind === 'leadership' ? directorColor : DEPTS[m.dept].color}}/>{getMeetingName(m)}</strong><small>회의실 {m.room === 0 ? 'A' : 'B'} · {m.kind === 'leadership' ? '대표 + 팀장 5명' : '팀장 포함 5명'}</small></div>
            <span className="meeting-state">{meetingStates[m.status]}</span>
          </div>) : <p className="empty-state">출근하면 오늘의 회의 일정이 배정됩니다.</p>}</div>
          <p className="schedule-note">팀별 회의는 하루 한 번, 대표·팀장 회의는 마지막에 진행합니다.</p>
        </div> : <div id="people-panel" className="employee-list" role="tabpanel" aria-labelledby="people-tab">
          {[...DEPTS, {name: '대표', color: directorColor}].map((d, dept) => <section key={d.name}>
            <h3><i style={{background: d.color}}/>{d.name}<span>{sim.employees.filter(e => e.dept === dept).length}명</span></h3>
            {sim.employees.filter(e => e.dept === dept).map(e => <button key={e.id} aria-pressed={selected === e.id} onClick={() => setSelected(e.id)}>
              <span className="initial" style={{background: `${d.color}30`}}>{e.name.slice(0, 1)}</span>
              <span><strong>{e.name}{e.role === '팀장' && <span className="leader-badge">팀장</span>}</strong><small>{e.state}</small></span>
              <span className={`presence ${e.visible ? 'on' : ''}`} aria-label={e.visible ? '사무실에 있음' : '사무실에 없음'}/>
            </button>)}
          </section>)}
        </div>}

        {sim.logs.length > 0 && <section className="activity" aria-label="최근 활동"><h3>최근 활동</h3>{sim.logs.slice(0, 3).map((log, i) => <div key={`${log.time}-${i}`}><time>{elapsed(log.time)}</time><p>{log.message}</p></div>)}</section>}
      </aside>
    </div>
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
