import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createSimulation, startDay, endDay, tick, DEPTS, FLOOR_NAMES, businessTime, saveSimulation, loadSimulation, getMeetingName} from './simulation.js';
import {createOffice} from './scene.js';
import './style.css';

const sim = loadSimulation() || createSimulation();
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
  const [saveMessage,setSaveMessage]=useState('');
  const [expanded, setExpanded] = useState(false);
  const [, refresh] = useState(0);
  const [rate, setRate] = useState(1), [pause, setPause] = useState(false);
  const building=!!sim.buildingOverview;
  const setBuilding=value=>{sim.buildingOverview=typeof value==='function'?value(!!sim.buildingOverview):value;sim.followId=null;refresh(v=>v+1);};
  const [tab, setTab] = useState('overview'), [selected, setSelected] = useState(null), [error, setError] = useState('');

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
      if(e.key==='Escape')sim.followId=null;
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

  useEffect(()=>{const id=setInterval(()=>{try{saveSimulation(sim);}catch{}},10000);const save=()=>{try{saveSimulation(sim);}catch{}};window.addEventListener('pagehide',save);return()=>{clearInterval(id);window.removeEventListener('pagehide',save);};},[]);

  const present = sim.employees.filter(e => e.visible).length;
  const occupied = sim.schedule.filter(m => m.floor===sim.activeFloor && ['active', 'gathering'].includes(m.status)).length;
  const completed = sim.schedule.filter(m => m.status === 'done').length;
  const person = [...sim.employees,...sim.visitors].find(e => e.id === selected);
  const status = error ? '화면 오류' : sim.mode === 'idle' ? (sim.logs.length ? '퇴근 완료' : '출근 전') : pause ? '일시정지' : sim.mode === 'leaving' ? '퇴근 중' : '근무 중';

  function chooseFloor(floor){sim.activeFloor=floor;setBuilding(false);scene.current?.reset();}

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
            <h2>{building?'우리 회사 · 전체 3개 층':FLOOR_NAMES[sim.activeFloor]}</h2>
            <span>직원 <strong>{present}/{sim.employees.length}명</strong></span>
            <span>회의실 <strong>{occupied+(sim.activeFloor===0&&sim.interviews.some(m=>['안내 중','면접 준비','면접 중'].includes(m.status))?1:0)}/2</strong></span>
            <span className="elapsed">경과 <strong>{elapsed(sim.time)}</strong></span>
          </div>
          <div className="view-actions">
            <button className="text-button" disabled={!!error} onClick={() => scene.current?.reset()}><Icon type="reset"/>시점 초기화</button>
            <button ref={expandButton} className="text-button" disabled={!!error} aria-label="3D 사무실 전체화면" aria-pressed={expanded} onClick={toggleFullscreen}><Icon type="expand"/>전체화면</button>
          </div>
        </div>

        <div className="floor-bar" aria-label="층 선택"><button aria-pressed={building} onClick={()=>setBuilding(v=>!v)}>건물 전체 보기</button>{FLOOR_NAMES.map((name,i)=><button key={i} aria-pressed={!building&&sim.activeFloor===i} onClick={()=>chooseFloor(i)}>{name}<small>{sim.employees.filter(e=>e.visible&&e.floor===i).length}명</small></button>)}<button onClick={()=>{try{saveSimulation(sim);setSaveMessage('저장했습니다');}catch{setSaveMessage('저장 공간을 확인해 주세요');}}}>저장</button><span role="status">{saveMessage}</span></div>
        <div ref={viewport} className={`viewport${expanded ? ' is-expanded' : ''}`}>
          {building&&<div className="building-caption"><strong>우리 회사 · 전체 층</strong><span>1·2·3층 도면을 겹쳐 보고, 원하는 층을 클릭해 들어가세요.</span><button onClick={()=>setBuilding(false)}>층별 보기로 돌아가기</button></div>}

          <canvas ref={canvas} aria-label="3층 회사와 직원 및 면접 지원자가 있는 3D 사무실"/>
          {expanded && <>
            <div className="expanded-controls" role="group" aria-label="전체화면 조작">
              <div className="expanded-floor-nav" role="group" aria-label="전체화면 층 선택">
                <button aria-pressed={building} onClick={()=>setBuilding(true)}>건물 전체 보기</button>
                {FLOOR_NAMES.map((name,floor)=><button key={floor} title={name} aria-pressed={!building&&sim.activeFloor===floor} onClick={()=>chooseFloor(floor)}>{floor+1}층</button>)}
              </div>
              <span className="expanded-floor-label">{building?'전체 건물':FLOOR_NAMES[sim.activeFloor]}</span>
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
            <small>{DEPTS[person.dept]?.name || (person.stationary?'안내 데스크':'대표')} · {person.state}</small><small>{person.personality||'외부 지원자'} · {person.floor+1}층{person.energy!=null&&` · 에너지 ${Math.round(person.energy)}% · ${person.mood}`}</small><small>담당: {sim.projects.filter(p=>p.stage<p.teams.length&&p.teams[p.stage]===person.dept).map(p=>p.name).join(' · ')||(person.stationary?'방문객 접수 · 인사팀 연락':'일상 업무')}</small><small>다음 일정: {person.restroom?'손 씻기 후 자리 복귀':sim.interviews.find(m=>m.members?.includes(person.id)&&!['완료','취소'].includes(m.status))?.name ? '면접 참석' : sim.schedule.some(m=>m.status==='waiting'&&(m.kind==='leadership'?['대표','팀장'].includes(person.role):m.dept===person.dept))?'정기 회의':'업무 및 휴식'}</small><div className="follow-actions"><button disabled={!person.visible} onClick={()=>{sim.buildingOverview=false;sim.followId=sim.followId===person.id?null:person.id;}}>{sim.followId===person.id?'따라가기 해제':'따라가기'}</button></div>
          </div>}
        </div>

        <div className="scene-footer">
          <div className="legend" aria-label="팀별 색상">{[...DEPTS, {name: '대표', color: directorColor}, {name:'안내 데스크',color:'#93a8a3'}].map(d => <span key={d.name}><i style={{background: d.color}}/>{d.name}</span>)}</div>
          <div className="playback" role="group" aria-label="시뮬레이션 재생 설정">
            <button disabled={sim.mode === 'idle' || !!error} aria-label={pause ? '시뮬레이션 재생' : '시뮬레이션 일시정지'} aria-pressed={pause} title={pause ? '재생' : '일시정지'} onClick={() => { paused.current = !pause; setPause(!pause); }}><Icon type={pause ? 'play' : 'pause'}/></button>
            {[1, 2, 4].map(n => <button key={n} disabled={!!error} className={rate === n ? 'chosen' : ''} aria-pressed={rate === n} aria-label={`${n}배속`} onClick={() => { speed.current = n; setRate(n); }}>{n}×</button>)}
          </div>
        </div>
        <p className="scene-hint">휠 버튼 드래그로 이동 · 드래그로 회전 · 스크롤로 확대 · 직원 클릭으로 상태 확인</p>
      </section>

      <aside className={`side-panel${['schedule','people'].includes(tab)?' directory-active':''}`} aria-label="회의 및 직원 정보">
        <BusinessPanel sim={sim} tab={tab} setTab={setTab} onSelect={id=>{setSelected(id);const e=[...sim.employees,...sim.visitors].find(e=>e.id===id);if(e?.visible){sim.buildingOverview=false;sim.activeFloor=e.floor;sim.followId=id;}}}/>
        <div className={`directory-section${['schedule','people'].includes(tab)?'':' is-hidden'}`}>
        {tab === 'schedule' ? <div id="schedule-panel" role="tabpanel" aria-label="회의 일정">
          <div className="panel-heading"><h2>오늘의 회의</h2><span className="count-tag">{completed}/{sim.schedule.length || 8} 완료</span></div>
          <div className="room-chips">{[0, 1].map(room => {
            const meeting = sim.schedule.find(m => m.floor===sim.activeFloor && m.room === room && ['active', 'gathering'].includes(m.status));
            const interview=sim.activeFloor===0&&room===0?sim.interviews.find(m=>['안내 중','면접 준비','면접 중'].includes(m.status)):null;
            return <div key={room}><span>회의실 {room === 0 ? 'A' : 'B'}</span><strong>{meeting ? (meeting.kind === 'leadership' ? '대표 · 팀장' : DEPTS[meeting.dept].name) : interview?interview.name+' 면접':'비어 있음'}</strong><small>{meeting ? meetingStates[meeting.status] : interview?interview.status:'사용 가능'}</small></div>;
          })}</div>
          <div className="schedule-list">{sim.schedule.length ? sim.schedule.map(m => <div className={`meeting ${m.status}`} key={m.id}>
            <div className="sequence" aria-label={`${m.round + 1}번째 순서`}>{m.status === 'done' ? '✓' : String(m.round + 1).padStart(2, '0')}</div>
            <div className="meeting-info"><strong><i style={{background: m.kind === 'leadership' ? directorColor : DEPTS[m.dept].color}}/>{getMeetingName(m)}</strong><small>{m.floor+1}층 · 회의실 {m.room === 0 ? 'A' : 'B'} · {m.kind === 'leadership' ? '대표 + 팀장 7명' : '팀장 포함 5명'}</small></div>
            <span className="meeting-state">{meetingStates[m.status]}</span>
          </div>) : <p className="empty-state">출근하면 오늘의 회의 일정이 배정됩니다.</p>}</div>
          <p className="schedule-note">팀별 회의는 하루 한 번, 대표·팀장 회의는 마지막에 진행합니다.</p>
        </div> : <div id="people-panel" className="employee-list" role="tabpanel" aria-label="직원 목록">
          {[...DEPTS, {name: '대표', color: directorColor}, {name:'안내 데스크',color:'#93a8a3'}].map((d, dept) => <section key={d.name}>
            <h3><i style={{background: d.color}}/>{d.name}<span>{sim.employees.filter(e => e.dept === dept).length}명</span></h3>
            {sim.employees.filter(e => e.dept === dept).map(e => <button key={e.id} aria-pressed={selected === e.id} onClick={() => setSelected(e.id)}>
              <span className="initial" style={{background: `${d.color}30`}}>{e.name.slice(0, 1)}</span>
              <span><strong>{e.name}{e.role === '팀장' && <span className="leader-badge">팀장</span>}</strong><small>{e.state}</small></span>
              <span className={`presence ${e.visible ? 'on' : ''}`} aria-label={e.visible ? '사무실에 있음' : '사무실에 없음'}/>
            </button>)}
          </section>)}
        </div>}

        </div>
        {sim.logs.length > 0 && <section className="activity" aria-label="최근 활동"><h3>최근 활동</h3>{sim.logs.slice(0, 3).map((log, i) => <div key={`${log.time}-${i}`}><time>{elapsed(log.time)}</time><p>{log.message}</p></div>)}</section>}
      </aside>
    </div>
  </main>;
}

function BusinessPanel({sim,onSelect,tab,setTab}){
 const states={waiting:'예정',gathering:'이동 중',active:'진행 중',done:'완료',cancelled:'취소'};
 return <section className="business-pc"><header><span className="pc-dot"/><strong>대표 PC</strong><small>DAY {sim.day} · {businessTime(sim.time)}</small></header><nav aria-label="대표 업무">{[['overview','현황'],['hiring','채용'],['projects','프로젝트'],['events','일정'],['schedule','회의'],['people','직원']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
 <div key={tab} className={`pc-content${['schedule','people'].includes(tab)?' is-hidden':''}`}>
 {tab==='overview'&&<><div className="pc-stats"><span>직원<strong>{sim.employees.filter(e=>e.visible).length} / {sim.employees.length}</strong></span><span>오늘 면접<strong>{sim.interviews.filter(m=>m.status==='완료').length} / {sim.interviews.length}</strong></span></div><h3>지금 진행 중인 업무</h3>{sim.schedule.filter(m=>['active','gathering'].includes(m.status)).map(m=><article key={m.id}><strong>{getMeetingName(m)} · {states[m.status]}</strong><p>{m.floor+1}층 회의실 {m.room===0?'A':'B'}</p><div className="people-chips">{sim.employees.filter(e=>m.kind==='leadership'?['대표','팀장'].includes(e.role):e.dept===m.dept).map(e=><button key={e.id} onClick={()=>onSelect(e.id)}>{e.name}</button>)}</div></article>)}{sim.interviews.filter(m=>!['예정','완료','취소'].includes(m.status)).map(m=><article key={m.id}><strong>{m.name} · {m.status}</strong><p>{DEPTS[m.dept].name} 지원 · 1층 회의실 A</p><button onClick={()=>onSelect(m.visitor)}>지원자 따라가기</button></article>)}<h3>안내 데스크</h3>{sim.employees.filter(e=>e.stationary).map(e=><button className="work-row" key={e.id} onClick={()=>onSelect(e.id)}><strong>{e.name} · 상주 안내 담당</strong><small>{e.state}</small></button>)}<h3>인사팀 업무</h3>{sim.employees.filter(e=>e.dept===1).map(e=><button className="work-row" key={e.id} onClick={()=>onSelect(e.id)}><strong>{e.name}</strong><small>{e.state}</small></button>)}</>}
 {tab==='hiring'&&<><p className="pc-help">매일 1~3건 · 방문객 안내 후 대표·인사팀장·채용 부서 팀장이 면접합니다. 인사팀이 먼저 마중 나오고, 면접관은 기존 일정을 마친 뒤 합류합니다.</p>{sim.interviews.length===0&&<p>출근하면 오늘의 면접이 배정됩니다.</p>}{sim.interviews.map(m=><article key={m.id}><div className="article-top"><strong>{m.name} · {DEPTS[m.dept].name}</strong><span>{m.status}</span></div><p>{businessTime(m.at)} 예약 · 1층 회의실 A</p>{m.notifiedAt!=null&&<p>안내 데스크 접수 · {businessTime(m.notifiedAt)} 인사팀 연락 완료</p>}{m.waitReason&&<p className="interview-wait">{m.waitReason}</p>}<details><summary>가상 지원자 이력서</summary><p>{m.experience}</p><p>{m.skills}</p><p>지원 동기: 팀과 함께 제품을 개선하고 싶습니다.</p></details><p>면접관: 대표 · 인사팀장 · {DEPTS[m.dept].name} 팀장</p>{m.escort!=null&&<button onClick={()=>onSelect(m.escort)}>안내 담당자 따라가기</button>}{m.visitor!=null&&<button disabled={!sim.visitors.find(v=>v.id===m.visitor)?.visible} onClick={()=>onSelect(m.visitor)}>지원자 따라가기</button>}{m.result&&<p>{m.result}</p>}</article>)}</>}
 {tab==='projects'&&<>{sim.projects.length===0&&<p>출근하면 프로젝트가 시작됩니다.</p>}{sim.projects.map(p=><article key={p.id}><strong>{p.name}</strong><p>{p.teams.map((d,i)=>`${i===p.stage?'▶ ':''}${DEPTS[d].name}`).join(' → ')}</p><label>{p.stage>=p.teams.length?'출시 완료':`${DEPTS[p.teams[p.stage]].name} 작업 중 · ${Math.floor(p.progress)}%`}<progress value={p.stage>=p.teams.length?100:p.progress} max="100"/></label><p>{p.stage<p.teams.length?'다음 팀은 현재 팀의 결과물을 기다리고 있습니다.':'모든 팀의 작업이 완료되었습니다.'}</p><div className="people-chips">{sim.employees.filter(e=>e.dept===p.teams[p.stage]).map(e=><button key={e.id} onClick={()=>onSelect(e.id)}>{e.name}</button>)}</div>{p.history.map((h,i)=><p key={i}>DAY {h.day} {businessTime(h.time)} · {DEPTS[h.from].name} → {h.to==null?'출시':DEPTS[h.to].name} 인계</p>)}</article>)}</>}
 {tab==='events'&&<>{sim.events.map(e=><article key={e.name}><strong>{businessTime(e.at)} · {e.name}</strong><p>{e.status}</p>{e.kind==='tour'&&<>{e.currentStop&&<p>{e.currentStop} · {Math.min((e.step??0)+1,e.totalStops||6)}/{e.totalStops||6}</p>}{e.waitReason&&<p>{e.waitReason}</p>}<div className="people-chips">{(e.members||[]).map(id=>{const person=sim.employees.find(p=>p.id===id);return person&&<button key={id} onClick={()=>onSelect(id)}>{person.name}{id===e.guide?' · 안내':' · 참여'}</button>;})}</div></>}</article>)}<p className="pc-help">층 버튼으로 이동 · 직원을 클릭해 따라가기 · Esc로 추적 해제. 10초마다 자동 저장됩니다.</p></>}
 </div></section>;
}

createRoot(document.getElementById('root')).render(<App/>);
