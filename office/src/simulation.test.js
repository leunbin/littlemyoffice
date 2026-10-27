import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSimulation,startDay,endDay,tick,makeSchedule,getMeetingMembers,DEPTS,DEPT_FLOORS,PROJECT_TEMPLATES,saveSimulation,loadSimulation} from './simulation.js';
import {TEAM_CENTERS,ROOMS,ROOM_SEATS,LOBBY,CEO_RECEIPT_SPOT,planRoute} from './layout.js';
test('eight unique team meetings followed by one leadership meeting',()=>{for(let i=0;i<100;i++){const schedule=makeSchedule(),team=schedule.filter(m=>m.kind==='team');assert.equal(schedule.length,9);assert.equal(new Set(team.map(x=>x.dept )).size,8);assert.equal(schedule[8].kind,'leadership');assert.equal(schedule[8].round,8);for(let round=0;round<9;round++){const ms=schedule.filter(x=>x.round===round);assert.ok(ms.length<=2);assert.equal(new Set(ms.map(x=>x.room)).size,ms.length);}}assert.ok(DEPTS.every(d=>d.name.endsWith('팀')));});
test('all 42 arrive, team and nine-person leadership meetings finish, and everyone leaves',()=>{const s=createSimulation(()=>0.4);assert.equal(s.employees.length,42);startDay(s);let sawAll=false;const done=new Set();for(let i=0;i<30000;i++){tick(s,0.1);if(s.employees.every(e=>e.visible))sawAll=true;assert.ok(s.schedule.filter(m=>['gathering','active'].includes(m.status)).length<=2);for(const m of s.schedule){if(m.status==='active'){const members=getMeetingMembers(s,m);assert.equal(members.length,m.kind==='leadership'?9:5);assert.ok(members.every(e=>e.visible&&e.state==='회의 중'));if(m.kind==='leadership'){assert.equal(members.filter(e=>e.role==='팀장').length,8);assert.equal(members.filter(e=>e.role==='대표').length,1);assert.ok(s.schedule.filter(x=>x.kind==='team').every(x=>x.status==='done'));assert.equal(new Set(members.map(e=>e.meetingSeat)).size,9);}}if(m.status==='done')done.add(m.id);}if(done.size===9)break;}assert.ok(sawAll);assert.equal(done.size,9);endDay(s);for(let i=0;i<1000&&s.mode!=='idle';i++)tick(s,0.1);assert.equal(s.mode,'idle');assert.ok(s.employees.every(e=>!e.visible));startDay(s);assert.equal(s.time,0);assert.equal(s.schedule.length,9);assert.ok(s.schedule.every(m=>m.status==='waiting'));});
test('immediate departure cancels pending arrivals and meetings',()=>{const s=createSimulation();startDay(s);tick(s,1);endDay(s);for(let i=0;i<1000;i++)tick(s,0.1);assert.equal(s.mode,'idle');assert.ok(s.employees.every(e=>!e.visible));assert.ok(s.schedule.every(m=>m.status==='cancelled'));});
test('each team has four facing staff, one leader and a unique appearance per person',()=>{const s=createSimulation();for(let dept=0;dept<8;dept++){const team=s.employees.filter(e=>e.dept===dept);assert.equal(team.filter(e=>e.role==='팀장').length,1);assert.equal(team.filter(e=>e.role==='팀원').length,4);assert.equal(team[0].home[0],team[2].home[0]);assert.equal(team[1].home[0],team[3].home[0]);assert.equal(Math.abs(team[0].facing-team[2].facing),Math.PI);assert.ok(TEAM_CENTERS.includes(team[4].home[0]));assert.equal(team[4].homeFloor,DEPT_FLOORS[dept]);}assert.equal(s.employees.filter(e=>e.role==='대표').length,1);assert.equal(new Set(s.employees.map(e=>JSON.stringify(e.appearance))).size,42);});
test('routes cross glass fronts only through their door openings',()=>{const s=createSimulation();const targets=[...s.employees.map(e=>e.home),...ROOM_SEATS.flat(),[12,6.1]];for(const from of targets)for(const to of targets){let a=from;for(const b of planRoute(from,to)){if((a[1]<3.5&&b[1]>3.5)||(a[1]>3.5&&b[1]<3.5)){const x=a[0]+(b[0]-a[0])*(3.5-a[1])/(b[1]-a[1]);assert.ok(ROOMS.some(r=>Math.abs(x-(r.x+2.6))<0.01));}a=b;}}});
test('meetings occur once per attendance while work and pantry routines continue',()=>{let seed=19;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const s=createSimulation(random);startDay(s);const original=s.schedule;let pantry=false;const starts=new Map();for(let i=0;i<15000;i++){const before=s.schedule.map(m=>m.status);tick(s,0.1);assert.ok(s.schedule.filter(m=>['gathering','active'].includes(m.status)).length<=2);s.schedule.forEach((m,j)=>{if(m.status==='active'&&before[j]!=='active')starts.set(m.id,(starts.get(m.id)||0)+1);});if(s.employees.some(e=>e.state==='커피 마시는 중'))pantry=true;}assert.equal(s.schedule,original);assert.ok(s.schedule.every(m=>m.status==='done'));assert.equal(starts.size,9);assert.ok([...starts.values()].every(n=>n===1));assert.ok(pantry);endDay(s);for(let i=0;i<1000&&s.mode!=='idle';i++)tick(s,0.1);assert.equal(s.mode,'idle');});
test('departure during leadership meeting cancels it and sends every participant home',()=>{const s=createSimulation(()=>0.4);startDay(s);for(let i=0;i<30000&&s.schedule.at(-1).status!=='active';i++)tick(s,0.1);assert.equal(s.schedule.at(-1).status,'active');endDay(s);assert.equal(s.schedule.at(-1).status,'cancelled');for(let i=0;i<1000&&s.mode!=='idle';i++)tick(s,0.1);assert.equal(s.mode,'idle');assert.ok(s.employees.every(e=>!e.visible));});

test('daily interviews escort visitors and include the three required interviewers',()=>{
 for(const random of [()=>0,()=>0.4,()=>0.99]){const s=createSimulation(random);startDay(s);assert.ok(s.interviews.length>=1&&s.interviews.length<=3);let escorted=false,active=false;for(let i=0;i<40000;i++){tick(s,0.1);for(const m of s.interviews){if(m.status==='면접 준비')escorted=true;if(m.status==='면접 중'){active=true;const members=m.members.map(id=>s.employees.find(e=>e.id===id));assert.equal(members.length,3);assert.ok(members.some(e=>e.role==='대표'));assert.ok(members.some(e=>e.dept===1&&e.role==='팀장'));assert.ok(members.some(e=>e.dept===m.dept&&e.role==='팀장'));assert.ok(members.every(e=>e.floor===0&&e.state==='면접 중'));assert.ok(!s.schedule.some(x=>x.floor===0&&x.room===0&&['active','gathering'].includes(x.status)));}}if(s.interviews.every(m=>m.status==='완료'))break;}assert.ok(escorted);assert.ok(active);assert.ok(s.interviews.every(m=>m.status==='완료'));assert.ok(s.visitors.filter(v=>v.role==='지원자').every(v=>!v.visible));}
});
test('departure cancels interviews and evacuates visitors',()=>{const s=createSimulation(()=>0.99);startDay(s);for(let i=0;i<1800;i++)tick(s,0.1);endDay(s);for(let i=0;i<3000&&s.mode!=='idle';i++)tick(s,0.1);assert.equal(s.mode,'idle');assert.ok(s.visitors.every(v=>!v.visible));assert.ok(s.interviews.every(m=>['완료','취소'].includes(m.status)));});
test('projects hand off and events finish',()=>{const s=createSimulation(()=>0.4);startDay(s);for(let i=0;i<30000;i++)tick(s,0.1);assert.ok(s.projects.every(p=>p.stage===p.teams.length));assert.ok(s.events.every(e=>e.status==='완료'));});

test('support deliveries stamp, hand out every parcel, refill three floors and deliver receipt',()=>{
 for(const random of [()=>0,()=>0.4,()=>0.99]){
  const s=createSimulation(random);startDay(s);
  let sawDeskReceipt=false;
  for(let i=0;i<40000&&!s.deliveries.every(d=>d.status==='완료');i++){
   tick(s,.1);
   for(const e of s.employees)if(e.carrying==='영수증'){
    assert.deepEqual(e.path.length?e.path.at(-1).slice(0,2):e.pos,CEO_RECEIPT_SPOT);
    if(!e.path.length)assert.equal(e.floor,2);
   }
   const desk=s.employees.find(e=>e.stationary);
   if(s.deliveries.some(d=>d.id===desk.assignment)){
    assert.deepEqual(desk.pos,LOBBY.staff);assert.equal(desk.path.length,0);
   }
   for(const d of s.deliveries)if(d.receivedCount>0){
    sawDeskReceipt=true;const driver=s.visitors.find(v=>v.id===d.driver);
    assert.ok(['퇴장 중','퇴장 완료'].includes(driver.state));assert.equal(driver.carrying,null);
    assert.ok(['경영지원팀 호출 중','물품 인수 중'].includes(d.status));
   }
  }
  assert.ok(sawDeskReceipt);
  for(const d of s.deliveries){assert.equal(d.status,'완료');assert.ok(d.stampedAt<=d.notifiedAt);assert.equal(d.members.length,d.kind==='parcel'?2:4);}
  const [parcel,supplies]=s.deliveries;assert.ok(parcel.count>=4&&parcel.count<=5);assert.equal(parcel.packages.length,parcel.count);assert.equal(new Set(parcel.packages.map(p=>p.recipient)).size,parcel.count);assert.ok(parcel.packages.every(p=>p.status==='완료'));assert.equal(Object.keys(supplies.arrivals).length,4);
 }
});

test('each new workday selects two fresh projects and saved days keep their progress',()=>{
 assert.equal(PROJECT_TEMPLATES.length,6);
 const s=createSimulation(()=>.4);startDay(s);
 const first=s.projects.map(p=>p.id);assert.equal(new Set(first).size,2);
 s.projects[0].stage=1;s.projects[0].progress=23;s.projects[0].history.push({day:1,time:1,from:4,to:5});
 let value;const storage={setItem:(key,data)=>{value=data;},getItem:()=>value};
 saveSimulation(s,storage);const restored=loadSimulation(storage);assert.deepEqual(restored.projects,s.projects);
 endDay(s);for(let i=0;i<3000&&s.mode!=='idle';i++)tick(s,.1);assert.equal(s.mode,'idle');startDay(s);
 assert.equal(s.projects.length,2);assert.equal(new Set(s.projects.map(p=>p.id)).size,2);
 assert.ok(s.projects.every(p=>!first.includes(p.id)&&p.stage===0&&p.progress===0&&p.history.length===0));
 assert.ok(PROJECT_TEMPLATES.every(p=>!('progress' in p)&&!('history' in p)));
});

test('parcels go to home desks without interrupting busy recipients',()=>{
 const s=createSimulation(()=>.4);startDay(s);s.schedule=[];s.interviews=[];s.clientMeetings=[];s.events=[];s.projects=[];
 for(const e of s.employees){e.visible=true;e.floor=e.homeFloor;e.pos=[...e.home];e.path=[];e.state='업무 중';e.assignment='busy';}
 const workers=s.employees.filter(e=>e.dept===7&&e.role==='팀원').slice(0,2);
 const recipients=s.employees.filter(e=>e.dept===3).slice(0,2);
 const d=s.deliveries[0];d.status='배달 중';d.members=workers.map(e=>e.id);d.packages=recipients.map((r,i)=>({recipient:r.id,worker:workers[i].id,status:'대기'}));s.deliveries=[d];
 recipients.forEach(e=>{e.floor=0;e.pos=[...LOBBY.welcome];e.state='회의 중';});
 workers.forEach(e=>e.assignment=d.id);
 for(let i=0;i<3000&&d.status!=='완료';i++){
  tick(s,.1);
  for(const r of recipients){assert.equal(r.assignment,'busy');assert.equal(r.state,'회의 중');assert.deepEqual(r.pos,LOBBY.welcome);}
  for(const pack of d.packages)if(pack.status==='이동 중'){
   const worker=workers.find(e=>e.id===pack.worker),recipient=recipients.find(e=>e.id===pack.recipient);
   assert.deepEqual(worker.path.at(-1)?.slice(0,2)??worker.pos,[recipient.home[0]+.6,recipient.home[1]]);
  }
 }
 assert.equal(d.status,'완료');assert.ok(d.packages.every(p=>p.deliveredAt!=null));
});
