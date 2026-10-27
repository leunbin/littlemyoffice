import {TEAM_CENTERS,TEAM_SEATS,ROOM_SEATS,CEO_HOME,CEO_RECEIPT_SPOT,ENTRY,PANTRY_SPOTS,ROOMS,LOBBY,RESTROOMS,TOUR_STOPS,ACTIVITY_VENUES,pantrySpotsForFloor,planRoute} from './layout.js';
export {ROOM_SEATS} from './layout.js';
export const FLOOR_NAMES=['1F · 고객과 만나는 공간','2F · 제품을 만드는 공간','3F · 경영과 휴식'];
export const DEPT_FLOORS=[0,0,2,1,1,1,2,0];
export const DEPTS = [
  {name:'영업팀',color:'#d68d9d',tasks:['고객과 통화 중','제안서 작성 중','거래처 확인 중','견적서 정리 중'],names:['김도윤','이서준','박지호','최하린','배수현']},
  {name:'인사팀',color:'#b19acb',tasks:['인사 서류 검토 중','면접 일정 조율 중','채용 공고 작성 중','복지 제도 검토 중'],names:['정서연','강지우','윤수빈','임예린','고나은']},
  {name:'회계팀',color:'#c6a17e',tasks:['정산 내역 확인 중','전표 입력 중','예산 검토 중','급여 내역 확인 중'],names:['한시우','오유진','서민준','신채원','남도현']},
  {name:'개발팀',color:'#8fa7cb',tasks:['코딩에 집중 중','코드 리뷰 중','버그 수정 중','테스트 실행 중'],names:['권준호','황은우','안소윤','송태오','백시온']},
  {name:'기획팀',color:'#c292b3',tasks:['기획서 작성 중','사용자 흐름 설계 중','리서치 정리 중','일정 조율 중'],names:['류다은','홍이안','전지안','문하준','조해린']},
];
DEPTS.push({name:'디자인팀',color:'#8aa99b',tasks:['시안 제작 중','디자인 리뷰 중','컬러 보드 검토 중','프로토타입 제작 중'],names:['유하늘','차예준','문서아','신도겸','진다인']},{name:'마케팅팀',color:'#d5aa68',tasks:['캠페인 기획 중','성과 분석 중','출시 준비 중','콘텐츠 제작 중'],names:['노지후','양서우','주연우','민하윤','장우빈']});
DEPTS.push({name:'경영지원팀',color:'#83aaa7',tasks:['회의·면접·외부 미팅 회의실 배정 확인 중','비품 재고 확인 및 발주 중','시설 점검·수리 요청 접수 중','우편물·공용 비품 관리 중'],names:['김지원','오지훈','이수아','박현우','최유나']});
const CLOTHES=['#b47e8b','#687b98','#d1b39a','#a59ab9','#646375','#cca2ae','#789095','#c2937a','#9c87ac','#8996af','#b69e83','#7e727a','#d0a3a0'];
export function appearanceFor(id){return {skin:['#efc6a6','#dca783','#b98061','#f5d8bf','#c58c6d'][id%5],hair:['#3c3037','#705141','#ad805b','#493e4c','#b79b83','#514542'][id%6],top:CLOTHES[id%CLOTHES.length],trousers:['#514b5e','#756c79','#646c7c','#8e817b'][id%4],style:id%6,glasses:id%4===1,height:0.94+(id%5)*0.035,build:0.9+(id%3)*0.1,accessory:id%5};}
export function makeSchedule(random=Math.random){
  const ids=DEPTS.map((_,i)=>i);
  for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
  const meetings=ids.map((dept,i)=>({id:`team-${dept}`,kind:'team',dept,room:i%2,floor:DEPT_FLOORS[dept],round:i,at:120*(i+1+(i>=2?1:0)),status:'waiting',started:null,ended:null}));
  meetings.push({id:'leadership',kind:'leadership',dept:null,room:Math.floor(random()*2),floor:2,round:DEPTS.length,at:120*(DEPTS.length+2),status:'waiting',started:null,ended:null});
  return meetings;
}
export function getMeetingMembers(s,m){return s.employees.filter(e=>m.kind==='leadership'?['팀장','대표'].includes(e.role):e.dept===m.dept);}
export function getMeetingName(m){return m.kind==='leadership'?'대표 · 팀장 회의':`${DEPTS[m.dept].name} 정기 회의`;}
export function createSimulation(random=Math.random){
  const employees=DEPTS.flatMap((d,dept)=>d.names.map((name,seat)=>{const id=dept===7?37+seat:dept*5+seat,spec=TEAM_SEATS[seat];return {id,name,dept,seat,floor:0,homeFloor:DEPT_FLOORS[dept],personality:['집중형','사교형','커피 애호가','꼼꼼함','멘토형'][id%5],energy:100,mood:'좋음',role:seat===4?'팀장':'팀원',home:[TEAM_CENTERS[DEPTS.map((_,i)=>i).filter(i=>DEPT_FLOORS[i]===DEPT_FLOORS[dept]).indexOf(dept)+1]+spec.offset[0],spec.offset[1]],facing:spec.facing,appearance:appearanceFor(id),pos:[...ENTRY],visible:false,path:[],state:'퇴근',next:0};}));
  employees.push({id:35,name:'이정우',dept:8,floor:0,homeFloor:2,personality:'멘토형',energy:100,mood:'좋음',seat:0,role:'대표',home:[...CEO_HOME],facing:Math.PI,appearance:appearanceFor(35),pos:[...ENTRY],visible:false,path:[],state:'퇴근',next:0});
  employees.push(createReceptionist());
  return {workflowVersion:8,mode:'idle',time:0,day:0,activeFloor:0,followId:null,schedule:[],clientMeetings:[],interviews:[],deliveries:[],visitors:[],projects:[],events:[],logs:[],random,employees};
}
function createReceptionist(){return {id:36,name:'서지은',dept:9,seat:0,role:'안내 담당',stationary:true,floor:0,homeFloor:0,personality:'친절함',energy:100,mood:'좋음',home:[...LOBBY.staff],facing:0,appearance:appearanceFor(36),pos:[...ENTRY],visible:false,path:[],state:'퇴근',next:0};}
function receptionistStatus(s,e){if(s.time<(e.contactUntil||0))return e.state;const notified=s.interviews.find(m=>m.status==='방문객 도착'&&m.notifiedAt!=null);return notified?`${notified.name} 담당자 도착 확인 중`:'방문객 응대 대기';}
function log(s,message){s.logs.unshift({time:s.time,message});s.logs=s.logs.slice(0,30);}
export function route(e,target,floor=e.homeFloor??0){e.path=e.floor===floor?planRoute(e.pos,target,floor):[...planRoute(e.pos,LOBBY.elevator,e.floor),[...LOBBY.elevator,floor],...planRoute(LOBBY.elevator,target,floor)];}
function work(s,e){e.state=e.stationary?receptionistStatus(s,e):e.role==='대표'?'경영 현황 확인 중':e.role==='팀장'?'팀 업무 검토 중':DEPTS[e.dept].tasks[Math.floor(s.random()*4)];e.next=s.time+8+s.random()*15;}
export function startDay(s){if(s.mode!=='idle')return;s.mode='working';s.time=0;s.day=(s.day||0)+1;s.followId=null;s.schedule=makeSchedule(s.random);s.logs=[];s.employees.forEach((e,i)=>{e.visible=false;e.floor=0;e.pos=[...ENTRY];e.path=[];e.state='출근 대기';e.next=i*0.5;e.visiting=null;e.meetingSeat=null;e.meetingKind=null;e.assignment=null;e.pendingInterview=null;e.pendingClient=null;e.restroom=null;e.restroomPreference=e.id%2;e.restroomAt=100+(e.id%9)*17+s.random()*60;});setupBusinessDay(s);log(s,'좋은 아침! 팀별 회의 1회와 대표·팀장 회의가 배정됐어요.');}
export function endDay(s){if(s.mode!=='working')return;s.mode='leaving';s.schedule.forEach(m=>{if(m.status!=='done')m.status='cancelled';});s.interviews.forEach(m=>{if(m.status!=='완료')m.status='취소';});s.clientMeetings.forEach(m=>{if(m.status!=='완료')m.status='취소';});s.events.forEach(event=>{if(event.status!=='완료')event.status='취소';});(s.deliveries||[]).forEach(d=>{if(d.status!=='완료')d.status='취소';});s.visitors.forEach(e=>{if(e.visible){e.state='퇴장 중';route(e,ENTRY,0);}});s.employees.forEach(e=>{e.assignment=null;e.pendingInterview=null;e.pendingClient=null;e.restroom=null;});s.employees.forEach(e=>{if(e.visible){e.state='퇴근 중';route(e,ENTRY,0);}else e.state='퇴근';});log(s,'오늘도 수고했어요. 모든 직원이 퇴근합니다.');}
export function tick(s,dt){
  if(s.mode==='idle')return;s.time+=dt;
  if(s.mode==='working'){
    const ceo=s.employees.find(e=>e.role==='대표');
    if(ceo){
      ceo.homeFloor=2;ceo.home=[...CEO_HOME];
      const liveInterview=id=>s.interviews.some(m=>m.id===id&&!['완료','취소','퇴장 중'].includes(m.status));
      if(ceo.pendingInterview&&!liveInterview(ceo.pendingInterview))ceo.pendingInterview=null;
      if(ceo.assignment&&ceo.assignment!=='event'&&!liveInterview(ceo.assignment))ceo.assignment=null;
      const inMeeting=s.schedule.some(m=>['gathering','active'].includes(m.status)&&getMeetingMembers(s,m).some(e=>e.id===ceo.id));
      if(ceo.visible&&!ceo.path.length&&!ceo.assignment&&!ceo.pendingInterview&&!ceo.restroom&&!inMeeting&&ceo.floor!==2){ceo.visiting=null;ceo.state='대표실로 복귀 중';route(ceo,CEO_HOME,2);}
    }
  }
  for(const e of [...s.employees,...s.visitors]){
    if(s.mode==='working'&&e.state==='출근 대기'&&s.time>=e.next){e.visible=true;e.state='출근 중';route(e,e.home);}
    if(!e.visible)continue;
    if(e.path.length){const p=e.path[0],dx=p[0]-e.pos[0],dz=p[1]-e.pos[1],dist=Math.hypot(dx,dz),step=dt*2.8;if(dist<=step){e.pos=p.slice(0,2);if(p.length===3)e.floor=p[2];e.path.shift();}else{e.pos[0]+=dx/dist*step;e.pos[1]+=dz/dist*step;}}
    if(!e.path.length){
      if(e.state==='퇴장 중'){e.visible=false;e.state='퇴장 완료';}
      else if(e.assignment||e.restroom||['지원자','외부 기업','배송 기사'].includes(e.role))continue;
      else if(e.state==='퇴근 중'){e.visible=false;e.state='퇴근';}
      else if(['출근 중','자리로 이동 중','대표실로 복귀 중'].includes(e.state))work(s,e);
      else if(e.state==='회의실로 이동 중')e.state='회의 대기';
      else if(e.state==='탕비실로 이동 중'){e.state='커피 마시는 중';e.next=s.time+5+s.random()*3;}
      else if(e.state==='동료에게 이동 중'){e.state='동료와 협업 중';e.next=s.time+6;}
      else if(e.state==='회의 참관 이동 중'){e.state='회의 참관 중';e.next=s.time+7;}
      else if(e.stationary){e.state=receptionistStatus(s,e);}
      else if(s.mode==='working'&&s.time>e.next&&!e.pendingInterview&&!e.pendingClient&&!['회의 중','회의 대기'].includes(e.state)){
        if(['커피 마시는 중','동료와 협업 중','회의 참관 중'].includes(e.state)){e.state='자리로 이동 중';route(e,e.home);}
        else if(e.role==='대표'){if(e.floor!==2||Math.hypot(e.pos[0]-CEO_HOME[0],e.pos[1]-CEO_HOME[1])>0.2){e.state='대표실로 복귀 중';route(e,CEO_HOME,2);continue;}const active=s.schedule.find(m=>m.status==='active'&&m.floor===e.floor);if(active){e.visiting=active.room;e.state='회의 참관 이동 중';route(e,[ROOMS[active.room].x,4.9],active.floor);}else e.next=s.time+10;}
        else if(s.random()<(e.personality==='커피 애호가'||e.energy<40?0.7:0.25)){e.state='탕비실로 이동 중';route(e,pantrySpotsForFloor(e.homeFloor)[e.id%PANTRY_SPOTS.length]);}
        else if(s.random()<(e.personality==='사교형'?0.8:0.4)){const coworker=s.employees.find(person=>person.dept===e.dept&&person.seat===(e.seat+1)%5);e.state='동료에게 이동 중';route(e,[coworker.home[0]+0.55,coworker.home[1]]);}
        else work(s,e);
      }
    }
  }
  if(s.mode==='leaving'){if([...s.employees,...s.visitors].every(e=>!e.visible)){s.mode='idle';log(s,'모두 퇴근했어요. 다음 출근을 기다립니다.');}return;}
  tickBusiness(s,dt);
  for(const m of s.schedule){
    const members=getMeetingMembers(s,m),previous=s.schedule.filter(x=>x.round<m.round);
    const roomClear=s.employees.every(e=>!e.visible||e.floor!==m.floor||Math.abs(e.pos[0]-ROOMS[m.room].x)>3.8||e.pos[1]<3.3);
    if(m.status==='waiting'&&(m.kind!=='leadership'||s.clientMeetings.every(x=>['완료','취소'].includes(x.status)))&&!s.interviews.some(x=>m.floor===0&&m.room===0&&['안내 중','면접 준비','면접 중'].includes(x.status))&&!s.clientMeetings.some(x=>x.floor===m.floor&&x.room===m.room&&['이동 중','미팅 중'].includes(x.status))&&s.time>=m.at-30&&members.every(e=>e.visible&&!e.assignment&&!e.pendingInterview&&!e.pendingClient&&!e.restroom&&e.state!=='출근 중'&&!['회의 중','회의 대기','회의실로 이동 중'].includes(e.state))&&previous.every(x=>x.status==='done')&&roomClear&&!s.schedule.some(x=>x!==m&&x.room===m.room&&x.floor===m.floor&&['gathering','active'].includes(x.status))){m.status='gathering';members.forEach((e,i)=>{e.state='회의실로 이동 중';e.meetingSeat=i;e.meetingKind=m.kind;route(e,ROOM_SEATS[m.room][i],m.floor);});log(s,`${getMeetingName(m)} · 회의실 ${m.room===0?'A':'B'}로 이동해요.`);}
    if(m.status==='gathering'&&s.time>=m.at&&s.time>=Math.max(-120,...[...s.schedule,...s.clientMeetings].filter(x=>x!==m&&x.started!=null).map(x=>x.started))+120&&members.every(e=>e.state==='회의 대기')){m.status='active';m.started=s.time;members.forEach(e=>e.state='회의 중');log(s,`${getMeetingName(m)} · ${members.length}명이 모여 시작했어요.`);}
    if(m.status==='active'&&s.time-m.started>=20){m.status='done';m.ended=s.time;members.forEach(e=>{e.state='자리로 이동 중';e.meetingSeat=null;e.meetingKind=null;route(e,e.home);});const ceo=s.employees.find(e=>e.role==='대표');if(ceo.visiting===m.room&&['회의 참관 중','회의 참관 이동 중'].includes(ceo.state)){ceo.state='자리로 이동 중';route(ceo,ceo.home);ceo.visiting=null;}log(s,`${getMeetingName(m)} 종료 · 업무로 복귀합니다.`);}
  }
}

export function businessTime(t){const minutes=9*60+Math.floor(t/2);return `${String(Math.floor(minutes/60)%24).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;}
export const PROJECT_TEMPLATES=[
 {id:1,name:'회사 홈페이지 개편',teams:[4,5,3,6]},
 {id:2,name:'신규 고객 서비스',teams:[0,4,3,6]},
 {id:3,name:'모바일 고객 포털 구축',teams:[0,4,5,3]},
 {id:4,name:'브랜드 리뉴얼 캠페인',teams:[4,5,6,0]},
 {id:5,name:'사내 업무 자동화',teams:[7,4,3,1]},
 {id:6,name:'고객 데이터 대시보드',teams:[0,4,5,3]},
];
function makeDailyProjects(s){
 const previous=new Set(s.projects.map(p=>p.id));
 const pool=PROJECT_TEMPLATES.filter(p=>!previous.has(p.id));
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(s.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,2).map(p=>({...p,teams:[...p.teams],stage:0,progress:0,history:[]}));
}
function setupBusinessDay(s){
 s.visitors=[];s.clientMeetings=makeClientMeetings(s);
 s.interviews=Array.from({length:1+Math.min(2,Math.floor(s.random()*3))},(_,i)=>({id:`d${s.day}-i${i}`,name:['이지우','박수아','최민재'][i],dept:[3,5,0][i],at:100+i*180,status:'예정',experience:['웹 서비스 개발 3년','제품 디자인 2년','고객 제안 및 협업 4년'][i],skills:['React · TypeScript · 협업','Figma · UX 리서치','고객 관리 · 제안서'][i]}));
 s.projects=makeDailyProjects(s);
 s.deliveries=makeDeliveries(s);
 s.events=[{name:'신입 오피스 투어',at:70,status:'예정',kind:'tour',routeVersion:1},
 {name:'제품 협업 워크숍',at:220,status:'예정',kind:'collaboration',venue:'collaboration'},
 {name:'함께하는 점심시간',at:420,status:'예정',kind:'lunch'},
 {name:'경영 전략 논의',at:620,status:'예정',kind:'strategy',venue:'strategy'},
 {name:'동료 생일 파티',at:800,status:'예정',kind:'party',venue:'project'},
 {name:'제품 출시 발표',at:1000,status:'예정',kind:'launch',venue:'project'}];
}
function tickBusiness(s,dt){
 const free=e=>e&&e.visible&&!e.stationary&&!e.assignment&&!e.pendingInterview&&!e.pendingClient&&!e.restroom&&!e.path.length&&!['회의 중','회의 대기','회의실로 이동 중','출근 중'].includes(e.state);
 for(const e of s.employees){e.energy=Math.max(15,Math.min(100,e.energy+dt*(e.state.includes('커피')?0.5:-0.012)));e.mood=e.energy<40?'휴식이 필요해요':'좋음';}
 tickInterviews(s);
 tickClientMeetings(s);
 tickRestrooms(s);
 tickDeliveries(s,free);
 const coordinator=s.employees.find(e=>e.dept===7&&e.role==='팀장'&&free(e));
 if(coordinator){
  const bookings=[...s.schedule,...s.interviews,...s.clientMeetings];
  const booking=bookings.find(m=>m.allocatedBy==null&&!['done','완료','취소','cancelled'].includes(m.status));
  if(booking){booking.allocatedBy=coordinator.id;booking.allocatedAt=s.time;coordinator.state='회의·면접·외부 미팅 회의실 배정 확인 중';}
 }
 const review=s.interviews.find(m=>m.status==='예정');
 if(review){const reviewer=s.employees.find(e=>e.dept===1&&e.role==='팀원'&&free(e));if(reviewer)reviewer.state=`${review.name} 이력서 검토 중`;}
 for(const p of s.projects){if(p.stage>=p.teams.length)continue;const team=p.teams[p.stage];const workers=s.employees.filter(e=>e.dept===team&&free(e));p.progress=Math.min(100,p.progress+dt*workers.length*0.12);workers.forEach(e=>e.state=`${p.name} · ${DEPTS[team].tasks[e.seat%4]}`);if(p.progress>=100){p.history.push({time:s.time,day:s.day,from:team,to:p.teams[p.stage+1]??null});p.stage++;p.progress=0;log(s,`${p.name} · ${DEPTS[team].name} 작업 완료${p.stage<p.teams.length?' → '+DEPTS[p.teams[p.stage]].name+' 인계':' · 출시 완료'}`);}}
 for(const event of s.events){
  if(event.kind==='tour'){tickOfficeTour(s,event,free);continue;}
  const venue=event.venue?ACTIVITY_VENUES[event.venue]:{name:'탕비실',floor:0,spots:pantrySpotsForFloor(0)};
  event.location=`${venue.floor+1}층 ${venue.name}`;
  if(event.status==='예정'&&s.time>=event.at){
   if(event.venue&&s.events.some(other=>other!==event&&other.venue===event.venue&&['이동 중','진행 중'].includes(other.status)))continue;
   let pool=s.employees.filter(e=>free(e)&&(event.kind==='collaboration'?[3,4,5].includes(e.dept):event.kind==='strategy'?['대표','팀장'].includes(e.role):true));
   if(event.kind==='strategy')pool.sort((a,b)=>(a.role==='대표'?-10:[2,6,4].indexOf(a.dept)<0?5:[2,6,4].indexOf(a.dept))-(b.role==='대표'?-10:[2,6,4].indexOf(b.dept)<0?5:[2,6,4].indexOf(b.dept)));
   if(event.kind==='collaboration'){const representatives=[3,4,5].map(dept=>pool.find(e=>e.dept===dept)).filter(Boolean);pool=[...representatives,...pool.filter(e=>!representatives.includes(e))];}
   if(pool.length<2){event.waitReason='참석자의 기존 일정이 끝나면 시작합니다.';continue;}
   event.status='이동 중';event.waitReason='';event.members=pool.slice(0,venue.spots.length).map(e=>e.id);
   event.members.forEach((id,i)=>{const e=s.employees.find(e=>e.id===id);e.assignment='event';e.state=`${event.name} · ${venue.name} 이동 중`;route(e,venue.spots[i],venue.floor);});log(s,`${event.name} · ${event.location}로 이동합니다.`);
  }
  if(event.status==='이동 중'&&event.members.every(id=>{const e=s.employees.find(e=>e.id===id);return !e.path.length&&e.floor===venue.floor;})){event.status='진행 중';event.started=s.time;event.members.forEach(id=>s.employees.find(e=>e.id===id).state=event.name+' 진행 중');}
  if(event.status==='진행 중'&&s.time-event.started>35){event.status='완료';event.members.forEach(id=>{const e=s.employees.find(e=>e.id===id);e.assignment=null;e.state='자리로 이동 중';route(e,e.home);});log(s,event.name+' 종료 · 업무 복귀');}
 }

}
function makeClientMeetings(s){
 const staff=s.employees.filter(e=>e.dept===0&&e.role==='팀원').map(e=>e.id);
 for(let i=staff.length-1;i>0;i--){const j=Math.floor(s.random()*(i+1));[staff[i],staff[j]]=[staff[j],staff[i]];}
 return [{id:`client-${s.day}`,company:'한빛테크',purpose:'신규 서비스 도입 및 견적 상담',at:360,floor:0,room:1,status:'예정',members:[s.employees.find(e=>e.dept===0&&e.role==='팀장').id,...staff.slice(0,2)],visitors:[]}];
}
function tickClientMeetings(s){
 const canJoin=(e,m)=>e&&e.visible&&(!e.assignment||e.assignment===m.id)&&!e.pendingInterview&&!e.restroom&&!['출근 대기','출근 중','퇴근 중'].includes(e.state)&&!s.schedule.some(meeting=>['gathering','active'].includes(meeting.status)&&getMeetingMembers(s,meeting).includes(e));
 for(const m of s.clientMeetings){
  if(m.status==='예정'&&s.time>=m.at-30){
   m.visitors=['김태현','윤서진','박준영'].map((name,i)=>{const id=200+i,appearance={...appearanceFor(id),top:['#34404c','#424652','#283641'][i],trousers:'#303b46',style:i,accessory:1};const v={id,name,company:m.company,dept:9,seat:i,role:'외부 기업',suited:true,floor:0,homeFloor:0,home:[...ENTRY],appearance,pos:[...ENTRY],visible:true,path:[],assignment:m.id,state:'라운지로 이동 중'};s.visitors.push(v);route(v,LOBBY.loungeSpots[i],0);return id;});
   m.status='라운지 입장 중';m.waitReason='방문객들이 라운지로 이동하고 있습니다.';log(s,`${m.company} 방문객 3명이 입장해 라운지로 이동합니다.`);
  }
  const visitors=m.visitors.map(id=>s.visitors.find(e=>e.id===id)),members=m.members.map(id=>s.employees.find(e=>e.id===id));
  const desk=s.employees.find(e=>e.stationary);
  if(m.status==='라운지 입장 중'&&visitors.every(v=>v&&!v.path.length)){m.status='안내 담당 마중 대기';visitors.forEach(v=>v.state='라운지에서 대기 중');}
  if(m.status==='안내 담당 마중 대기'){
   if(!desk?.visible||desk.path.length||desk.assignment||s.time<(desk.contactUntil||0)){m.waitReason='안내 담당이 기존 응대를 마치면 라운지로 찾아갑니다.';continue;}
   m.receptionist=desk.id;desk.assignment=m.id;desk.state=`${m.company} 방문 목적 확인하러 이동 중`;route(desk,LOBBY.welcome,0);m.status='안내 담당 이동 중';m.waitReason='서지은 안내 담당이 라운지로 마중 나갑니다.';
  }
  if(m.status==='안내 담당 이동 중'&&!desk.path.length){m.status='방문 목적 확인 중';m.askedAt=s.time;desk.state='어떤 일로 방문하셨나요?';visitors.forEach(v=>v.state='방문 목적 설명 중');m.waitReason=`${m.company} · ${m.purpose}`;log(s,`서지은 안내 담당이 라운지에서 ${m.company} 방문 목적을 확인합니다.`);}
  if(m.status==='방문 목적 확인 중'&&s.time-m.askedAt>=5){m.status='데스크 복귀 중';desk.state='방문 목적 확인 후 데스크 복귀 중';route(desk,LOBBY.staff,0);visitors.forEach(v=>v.state='영업 담당자 기다리는 중');m.waitReason='안내 담당이 데스크로 돌아가 영업팀에 연락합니다.';}
  if(m.status==='데스크 복귀 중'&&!desk.path.length){m.status='영업팀 연락 중';m.notifiedAt=s.time;desk.state=`${m.company} · 영업팀에 방문 목적 전달 중`;desk.contactUntil=s.time+4;m.waitReason=`영업팀에 ${m.purpose} 내용을 전달하고 있습니다.`;log(s,`서지은 안내 담당이 데스크에서 영업팀에 ${m.company} 방문 목적을 전달합니다.`);}
  if(m.status==='영업팀 연락 중'&&s.time-m.notifiedAt>=4){
   desk.assignment=null;desk.state='방문객 응대 대기';m.host=m.members[1];m.status='영업 담당자 마중 대기';members.forEach(e=>e.pendingClient=m.id);
  }
  const host=s.employees.find(e=>e.id===m.host);
  if(m.status==='영업 담당자 마중 대기'){
   if(!canJoin(host,m)){m.waitReason='영업 담당자의 기존 일정 종료 후 마중 나옵니다.';continue;}
   host.assignment=m.id;host.pendingClient=null;host.state=`${m.company} 방문객 마중`;route(host,LOBBY.welcome,0);m.status='영업 담당자 이동 중';m.waitReason=`${host.name} 영업 담당자가 라운지로 이동 중입니다.`;
  }
  if(m.status==='영업 담당자 이동 중'&&!host.path.length){m.status='영업 담당자 인사 중';m.hostGreetedAt=s.time;host.state=`${m.company} 방문객 인사 및 안내`;visitors.forEach(v=>v.state='영업 담당자와 인사 중');m.waitReason=`${host.name} 담당자가 방문객을 맞이하고 있습니다.`;}
  if(m.status==='영업 담당자 인사 중'&&s.time-m.hostGreetedAt>=4){
   const roomBusy=s.schedule.some(meeting=>meeting.floor===m.floor&&meeting.room===m.room&&['gathering','active'].includes(meeting.status));
   if(roomBusy||!members.every(e=>canJoin(e,m))){m.waitReason=roomBusy?'담당자와 함께 회의실 B 사용 종료를 기다립니다.':'담당자와 함께 나머지 영업팀 참석자를 기다립니다.';continue;}
   m.status='이동 중';m.waitReason=`${host.name} 담당자가 회의실 B로 안내합니다.`;
   members.forEach((e,i)=>{e.assignment=m.id;e.pendingClient=null;e.meetingSeat=[4,0,2][i];e.state=e.id===m.host?'외부 방문객 회의실 안내 중':'외부 미팅실로 이동 중';route(e,ROOM_SEATS[m.room][e.meetingSeat],0);});
   visitors.forEach((e,i)=>{e.meetingSeat=[1,3,5][i];e.state='영업 담당자를 따라 회의실 이동 중';e.path=[[e.pos[0],LOBBY.welcome[1]],[...LOBBY.welcome],...planRoute(LOBBY.welcome,ROOM_SEATS[m.room][e.meetingSeat],0)];});
   log(s,`${host.name} 담당자가 ${m.company} 방문객 3명을 회의실 B로 안내합니다.`);
  }
  if(m.status==='이동 중'&&[...members,...visitors].every(e=>e&&!e.path.length)){[...members,...visitors].forEach(e=>e.state='외부 미팅 대기');m.waitReason='모두 입실했습니다. 예약 시간과 이전 회의 간격에 맞춰 시작합니다.';}
  if(m.status==='이동 중'&&s.time>=m.at&&s.time>=Math.max(-120,...[...s.schedule,...s.clientMeetings].filter(x=>x!==m&&x.started!=null).map(x=>x.started))+120&&[...members,...visitors].every(e=>e&&!e.path.length&&e.floor===0)){m.status='미팅 중';m.waitReason='';m.started=s.time;[...members,...visitors].forEach(e=>e.state='외부 미팅 중');log(s,`${m.company} 3명 · 영업팀 3명 미팅 시작`);}
  if(m.status==='미팅 중'&&s.time-m.started>=40){m.status='퇴장 중';members.forEach(e=>{e.assignment=null;e.pendingClient=null;e.meetingSeat=null;e.state='자리로 이동 중';route(e,e.home);});visitors.forEach(v=>{v.state='퇴장 중';route(v,ENTRY,0);});log(s,`${m.company} 미팅을 마치고 방문객을 배웅합니다.`);}
  if(m.status==='퇴장 중'&&visitors.every(v=>!v.visible)){m.status='완료';m.ended=s.time;}
 }
}
function sendTourToStop(s,event){
 const stop=TOUR_STOPS[event.step];event.currentStop=stop.name;event.totalStops=TOUR_STOPS.length;event.arrivedAt=null;
 event.members.forEach((id,index)=>{const e=s.employees.find(person=>person.id===id);e.state=`오피스 투어 · ${stop.name} 이동 중`;route(e,[stop.position[0]+index*.6,stop.position[1]],stop.floor);});
}
function tickOfficeTour(s,event,free){
 if(event.status==='예정'&&s.time>=event.at){
  const guide=s.employees.find(e=>e.dept===1&&e.role==='팀원'&&free(e));
  const newcomer=s.employees.find(e=>e.role==='팀원'&&e.dept!==1&&free(e));
  if(!guide||!newcomer){event.waitReason='안내 담당자와 참여 직원의 기존 일정이 끝나면 시작합니다.';return;}
  event.status='진행 중';event.started=s.time;event.members=[guide.id,newcomer.id];event.guide=guide.id;event.step=0;event.waitReason='';event.routeVersion=1;
  event.members.forEach(id=>s.employees.find(e=>e.id===id).assignment='event');sendTourToStop(s,event);log(s,`${guide.name} 안내로 1층부터 3층까지 오피스 투어를 시작합니다.`);
 }
 if(event.status!=='진행 중')return;
 const stop=TOUR_STOPS[event.step],members=event.members.map(id=>s.employees.find(e=>e.id===id));
 if(!stop)return;
 if(members.every(e=>e&&!e.path.length&&e.floor===stop.floor)){
  if(event.arrivedAt==null){event.arrivedAt=s.time;members.forEach(e=>e.state=`오피스 투어 · ${stop.name} 둘러보는 중`);log(s,`오피스 투어 · ${stop.name}에 도착했습니다.`);}
  if(s.time-event.arrivedAt>=8){event.step++;
   if(event.step<TOUR_STOPS.length)sendTourToStop(s,event);
   else{event.status='완료';event.ended=s.time;event.currentStop='1~3층 전체 투어 완료';members.forEach(e=>{e.assignment=null;e.state='자리로 이동 중';route(e,e.home,e.homeFloor);});log(s,'1층·2층·3층 오피스 투어를 마치고 각자 자리로 복귀합니다.');}
  }
 }
}
function tickRestrooms(s){
 for(const e of s.employees){
  if(!e.visible||e.stationary)continue;
  if(e.restroomAt==null)e.restroomAt=s.time+45+(e.id%9)*13;
  if(!e.restroom){
   if(s.time<e.restroomAt||e.path.length||e.assignment||e.pendingInterview||e.pendingClient||['회의 중','회의 대기','회의실로 이동 중','출근 중','출근 대기','퇴근 중'].includes(e.state))continue;
   const roomIndex=e.restroomPreference??e.id%2;
   const occupied=s.employees.filter(other=>other.restroom?.floor===e.floor&&other.restroom.room===roomIndex).map(other=>other.restroom.slot);
   const slot=[0,1].find(index=>!occupied.includes(index));
   if(slot==null){e.restroomAt=s.time+10;continue;}
   e.restroom={floor:e.floor,room:roomIndex,slot,phase:'walking'};e.state='화장실로 이동 중';
   const room=RESTROOMS[roomIndex];route(e,[room.x+1.65,room.z],e.floor);
  }
  const visit=e.restroom,room=RESTROOMS[visit.room];
  if(visit.phase==='walking'&&!e.path.length){visit.phase='using';visit.until=s.time+12+s.random()*10;e.state='화장실 이용 중';e.pos=[room.x-.8,room.z+(visit.slot===0?-.92:.92)];}
  if(visit.phase==='using'&&s.time>=visit.until){visit.phase='to-sink';e.state='손 씻으러 이동 중';route(e,[room.x+.9,room.z-1.35],visit.floor);}
  if(visit.phase==='to-sink'&&!e.path.length){visit.phase='washing';visit.until=s.time+3.5;e.state='손 씻는 중';}
  if(visit.phase==='washing'&&s.time>=visit.until){e.restroom=null;e.restroomAt=s.time+180+s.random()*120;e.state='자리로 이동 중';route(e,e.home,e.homeFloor);}
 }
}
function tickInterviews(s){
 const ongoingMeeting=e=>s.schedule.some(m=>['gathering','active'].includes(m.status)&&getMeetingMembers(s,m).some(member=>member.id===e.id));
 const available=e=>e&&e.visible&&!e.restroom&&!e.assignment&&!ongoingMeeting(e)&&!['출근 대기','출근 중','퇴근 중'].includes(e.state);
 const panel=m=>[s.employees.find(e=>e.role==='대표'),s.employees.find(e=>e.dept===1&&e.role==='팀장'),s.employees.find(e=>e.dept===m.dept&&e.role==='팀장')];
 for(const m of s.interviews){
  if(m.status==='예정'&&s.time>=m.at){const v={id:100+s.interviews.indexOf(m),name:m.name,dept:m.dept,seat:0,role:'지원자',floor:0,homeFloor:0,home:[...ENTRY],appearance:appearanceFor(100+s.interviews.indexOf(m)),pos:[...ENTRY],visible:true,path:planRoute(ENTRY,LOBBY.waiting,0),state:'안내 데스크로 이동 중'};s.visitors.push(v);m.visitor=v.id;m.status='입장 중';log(s,`${m.name} 지원자가 면접을 위해 도착했습니다.`);}
  const v=s.visitors.find(e=>e.id===m.visitor);
  if(!v)continue;
  if(m.status==='입장 중'&&!v.path.length){m.status='방문객 도착';v.state='안내 데스크 대기';}
  if(m.status==='방문객 도착'&&m.notifiedAt==null){
   const receptionist=s.employees.find(e=>e.stationary&&e.visible&&!e.assignment);
   if(!receptionist||receptionist.path.length){m.waitReason='안내 직원이 데스크에 도착하는 중입니다.';continue;}
   m.notifiedAt=s.time;m.receptionist=receptionist.id;receptionist.state=`${m.name} 방문 · 인사팀에 연락 중`;receptionist.contactUntil=s.time+4;v.state='방문 접수 · 인사팀 연락 중';log(s,`${receptionist.name} 안내 담당이 ${m.name} 도착을 인사팀에 알렸습니다.`);
  }
  if(m.status==='방문객 도착'){
   if(s.time-m.notifiedAt<4){m.waitReason='안내 데스크에서 인사팀에 도착 연락 중입니다.';continue;}
   const ahead=s.interviews.find(x=>!['예정','입장 중','완료','취소','퇴장 중'].includes(x.status));
   if(ahead!==m){m.waitReason='앞선 지원자 면접을 기다리고 있습니다.';continue;}
   const escort=s.employees.filter(e=>e.dept===1&&e.role==='팀원'&&available(e)).sort((a,b)=>Math.hypot(a.pos[0]-v.pos[0],a.pos[1]-v.pos[1])-Math.hypot(b.pos[0]-v.pos[0],b.pos[1]-v.pos[1]))[0];
   if(!escort){m.waitReason='인사팀 회의 종료 후 안내 직원이 마중 나옵니다.';continue;}
   m.members=panel(m).map(e=>e.id);m.members.forEach(id=>s.employees.find(e=>e.id===id).pendingInterview=m.id);
   m.escort=escort.id;m.status='안내 중';m.waitReason='인사팀 직원이 로비로 이동 중입니다.';escort.assignment=m.id;escort.state=`${m.name} 지원자 마중`;route(escort,v.pos,0);log(s,`${escort.name} 직원이 ${m.name} 지원자를 안내하러 갑니다.`);
  }
  const escort=s.employees.find(e=>e.id===m.escort);
  if(m.status==='안내 중'&&escort&&!escort.path.length){
   const roomBusy=s.schedule.some(x=>x.floor===0&&x.room===0&&['gathering','active'].includes(x.status));
   if(roomBusy){escort.state='지원자와 면접실 배정 대기';v.state='인사팀과 면접실 대기';m.waitReason='회의실 A의 기존 회의가 끝나면 입실합니다.';continue;}
   m.status='면접 준비';m.waitReason='지원자를 안내하고 면접관을 호출하고 있습니다.';escort.state='지원자 면접실 안내 중';v.state='인사팀 안내로 이동 중';v.meetingSeat=3;route(escort,ROOM_SEATS[0][4],0);route(v,ROOM_SEATS[0][3],0);
  }
  if(m.status==='면접 준비'){
   for(const [i,id] of m.members.entries()){const e=s.employees.find(person=>person.id===id);if(e.assignment===m.id)continue;if(available(e)){e.pendingInterview=null;e.assignment=m.id;e.state='면접실로 이동 중';e.meetingSeat=i;route(e,ROOM_SEATS[0][i],0);}}
   const members=m.members.map(id=>s.employees.find(e=>e.id===id));
   const waiting=members.filter(e=>e.assignment!==m.id);
   m.waitReason=waiting.length?`${waiting.map(e=>e.name).join(' · ')} 기존 일정 종료 후 합류 예정`:'지원자와 면접관이 면접실로 이동 중입니다.';
   if(v.path.length===0&&escort&&!escort.path.length&&members.every(e=>e.assignment===m.id&&!e.path.length&&e.floor===0)){m.status='면접 중';m.waitReason='';m.started=s.time;v.state='면접 중';members.forEach(e=>e.state='면접 중');escort.assignment=null;escort.state='자리로 이동 중';route(escort,escort.home);log(s,`${m.name} 면접 시작 · 대표, 인사팀장, ${DEPTS[m.dept].name} 팀장 참석`);}
  }
  if(m.status==='면접 중'&&s.time-m.started>=35){m.status='퇴장 중';v.state='퇴장 중';route(v,ENTRY,0);m.members.forEach(id=>{const e=s.employees.find(person=>person.id===id);e.assignment=null;e.pendingInterview=null;e.state='자리로 이동 중';e.meetingSeat=null;route(e,e.home,e.role==='대표'?2:e.homeFloor);});log(s,`${m.name} 면접 종료 · 검토 결과 기록 완료`);}
  if(m.status==='퇴장 중'&&!v.visible){m.status='완료';m.result='면접 완료 · 채용 검토 대기';}
 }
}

export function saveSimulation(s,storage=globalThis.localStorage){
 storage.setItem('little-office-v2',JSON.stringify({...s,workflowVersion:8,random:undefined,followId:null,buildingOverview:false}));
}
export function loadSimulation(storage){
 try{
  storage=storage??globalThis.localStorage;
  const data=JSON.parse(storage.getItem('little-office-v2'));
  if(!data||!['idle','working','leaving'].includes(data.mode)||!Array.isArray(data.employees)||![36,37,42].includes(data.employees.length)||!Array.isArray(data.schedule)||!Array.isArray(data.interviews)||!Array.isArray(data.events)||!Number.isFinite(data.time))return null;
  const fresh=createSimulation(),s={...fresh,...data,random:Math.random,followId:null,buildingOverview:false};
  s.employees=fresh.employees.map(canonical=>{
   const saved=data.employees.find(e=>e.id===canonical.id&&e.role===canonical.role);
   if(!saved)return {...canonical,visible:s.mode==='working',floor:canonical.homeFloor,pos:[...canonical.home],state:s.mode==='working'?(canonical.stationary?'방문객 응대 대기':'회의실·비품 현황 확인 중'):'퇴근'};
   return {...canonical,...saved,name:!saved.name||/[?�]/.test(saved.name)?canonical.name:saved.name,home:[...canonical.home],homeFloor:canonical.homeFloor,dept:canonical.dept,stationary:!!canonical.stationary,path:Array.isArray(saved.path)?saved.path:[]};
  });
  s.deliveries=Array.isArray(data.deliveries)?data.deliveries:makeDeliveries(s);
  s.visitors=Array.isArray(data.visitors)?data.visitors:[];s.projects=Array.isArray(data.projects)?data.projects:[];s.logs=Array.isArray(data.logs)?data.logs.filter(log=>!/[?�]/.test(log.message)):[];
  s.clientMeetings=Array.isArray(data.clientMeetings)?data.clientMeetings:makeClientMeetings(s);
  for(const m of s.clientMeetings){
   m.purpose=m.purpose||'신규 서비스 도입 및 견적 상담';m.visitors=m.visitors||[];
   if((data.workflowVersion??0)<6&&!['예정','완료','취소','퇴장 중','미팅 중'].includes(m.status)){
    for(const e of s.employees)if(e.assignment===m.id||e.pendingClient===m.id){e.assignment=null;e.pendingClient=null;e.state='자리로 이동 중';route(e,e.home,e.homeFloor);}
    m.status='라운지 입장 중';m.host=null;m.notifiedAt=null;m.askedAt=null;
    m.visitors.forEach((id,i)=>{const v=s.visitors.find(person=>person.id===id);if(v){v.visible=true;v.floor=0;v.pos=[...LOBBY.loungeSpots[i]];v.path=[];v.assignment=m.id;v.state='라운지에서 대기 중';}});
   }
  }
  if((data.workflowVersion??0)<5){
   s.schedule.forEach((m,i)=>{m.at=120*(i+1+(i>=2?1:0));m.round=i;});
   s.events.forEach(event=>{if(['party','launch'].includes(event.kind))event.venue='project';});
   for(const event of [{name:'제품 협업 워크숍',at:220,kind:'collaboration',venue:'collaboration'},{name:'경영 전략 논의',at:620,kind:'strategy',venue:'strategy'},{name:'제품 출시 발표',at:1000,kind:'launch',venue:'project'}])if(!s.events.some(existing=>existing.kind===event.kind))s.events.push({...event,status:'예정'});
  }
  if((data.workflowVersion??0)<6)for(const e of [...s.employees,...s.visitors]){
   if(e.path?.length){const target=e.path.at(-1).slice(0,2),floor=[...e.path].reverse().find(point=>point.length===3)?.[2]??e.floor;route(e,['퇴근 중','퇴장 중'].includes(e.state)?ENTRY:target,floor);}
  }
  for(const event of s.events){if(event.kind==='tour'&&event.routeVersion!==1){if(event.status==='진행 중')for(const id of event.members||[]){const e=s.employees.find(person=>person.id===id);if(e?.assignment==='event'){e.assignment=null;e.state='자리로 이동 중';route(e,e.home,e.homeFloor);}}event.status='예정';event.routeVersion=1;event.members=[];event.step=0;event.arrivedAt=null;}}
  if(s.mode==='working'&&!s.schedule.some(m=>m.dept===7)){
   const leadership=s.schedule.find(m=>m.kind==='leadership');
   if(leadership?.status==='waiting'){
    s.schedule.splice(s.schedule.indexOf(leadership),0,{id:'team-7',kind:'team',dept:7,room:0,floor:0,round:7,at:Math.max(s.time+60,leadership.at),status:'waiting',started:null,ended:null});
    leadership.round=8;leadership.at=Math.max(s.time+180,leadership.at+120);
   }
  }
  if((data.workflowVersion??0)<8){
   const desk=s.employees.find(e=>e.stationary);
   const delivery=s.deliveries.find(d=>d.id===desk.assignment);
   if(delivery&&s.mode==='working'){
    desk.path=[];desk.state='배송 응대 후 데스크 복귀 중';route(desk,LOBBY.staff,0);
    if(['수령 확인 중','도장 확인 중'].includes(delivery.status)){delivery.status='수령 확인 중';delivery.stampedAt=null;}
   }
  }
  if(s.mode==='working')for(const e of s.employees){
   const delivery=s.deliveries.find(d=>d.id===e.assignment&&d.kind==='supplies'&&d.status==='배달 중');
   if(e.carrying==='영수증'&&delivery){
    const destination=e.path.at(-1)?.slice(0,2)??e.pos;
    if(Math.hypot(destination[0]-CEO_RECEIPT_SPOT[0],destination[1]-CEO_RECEIPT_SPOT[1])>.1){
     route(e,CEO_RECEIPT_SPOT,2);if(delivery.arrivals)delete delivery.arrivals[e.id];
    }
   }
  }
  if(s.mode==='working')for(const d of s.deliveries.filter(d=>d.kind==='parcel'&&d.status==='배달 중'))for(const pack of d.packages||[]){
   const recipient=s.employees.find(e=>e.id===pack.recipient),worker=s.employees.find(e=>e.id===pack.worker);
   if(recipient?.assignment===d.id){recipient.assignment=null;recipient.state='자리로 이동 중';route(recipient,recipient.home);}
   if(pack.status==='이동 중'&&worker&&recipient)route(worker,[recipient.home[0]+.6,recipient.home[1]],recipient.homeFloor);
  }
  s.workflowVersion=8;return s;
 }catch{return null;}
}

function makeDeliveries(s){return [{id:`parcel-${s.day}`,kind:'parcel',name:'CJ대한통운 택배 전달',at:160,count:4+Math.floor(s.random()*2),status:'예정'},{id:`supplies-${s.day}`,kind:'supplies',name:'식료품·비품 입고 및 탕비실 보충',at:600,count:3,status:'예정'}];}
function tickDeliveries(s,free){
 for(const d of s.deliveries||[]){
  const desk=s.employees.find(e=>e.stationary),workers=(d.members||[]).map(id=>s.employees.find(e=>e.id===id));
  let driver=s.visitors.find(v=>v.id===d.driver);
  if(driver&&['기사 도착 중','수령 확인 중','도장 확인 중'].includes(d.status)){
   const target=driver.path.at(-1)??driver.pos;
   if(Math.hypot(target[0]-LOBBY.delivery[0],target[1]-LOBBY.delivery[1])>.1)route(driver,LOBBY.delivery,0);
  }
  const release=e=>{e.assignment=null;e.carrying=null;e.state='자리로 이동 중';route(e,e.home);};
  if(d.status==='예정'&&s.time>=d.at){
   d.driver=d.kind==='parcel'?300:301;driver={id:d.driver,name:d.kind==='parcel'?'CJ대한통운 기사':'식료품·비품 배송 기사',dept:-3,role:'배송 기사',floor:0,homeFloor:0,home:[...ENTRY],pos:[...ENTRY],path:[],visible:true,appearance:{...appearanceFor(d.driver),top:'#35699b'},state:`${d.count}개 배송 · 데스크 앞 이동 중`,carrying:d.count};s.visitors.push(driver);route(driver,LOBBY.delivery,0);d.status='기사 도착 중';log(s,`${d.name} · 배송 기사 방문`);
  }
  if(d.status==='기사 도착 중'&&!driver.path.length&&desk.visible&&!desk.assignment&&!desk.path.length&&Math.hypot(desk.pos[0]-LOBBY.staff[0],desk.pos[1]-LOBBY.staff[1])<.1&&s.time>=(desk.contactUntil||0)){desk.assignment=d.id;desk.state='데스크에서 배송 수량 확인 중';d.status='수령 확인 중';}
  if(d.status==='수령 확인 중'&&!desk.path.length){desk.state='배송 수량 확인 · 수령 도장 찍는 중';d.stampedAt=s.time;d.status='도장 확인 중';}
  if(d.status==='도장 확인 중'&&s.time-d.stampedAt>=4){driver.carrying=null;driver.state='퇴장 중';route(driver,ENTRY,0);d.receivedCount=d.count;desk.state='경영지원팀에 입고 연락 중';desk.contactUntil=s.time+4;d.status='경영지원팀 호출 중';d.notifiedAt=s.time;log(s,`서지은 · ${d.count}개 수령 도장 확인 후 경영지원팀 연락`);}
  if(d.status==='경영지원팀 호출 중'&&s.time-d.notifiedAt>=4){
   if(desk.assignment===d.id){desk.assignment=null;desk.state='방문객 응대 대기';}
   const team=s.employees.filter(e=>e.dept===7&&e.role==='팀원'&&free(e)),needed=d.kind==='parcel'?2:4;
   if(team.length<needed){d.waitReason=`경영지원팀 ${needed}명의 기존 일정 종료 대기`;continue;}
   d.members=team.slice(0,needed).map(e=>e.id);d.waitReason='';d.status='물품 인수 중';d.members.forEach((id,i)=>{const e=s.employees.find(e=>e.id===id);e.assignment=d.id;e.state='데스크 앞 배송 물품 인수하러 이동 중';route(e,[11.3+i*.65,-2.3],0);});
  }
  if(d.status==='물품 인수 중'&&workers.length&&workers.every(e=>!e.path.length)){
   d.receivedCount=0;d.status='배달 중';
   if(d.kind==='parcel'){
    const pool=s.employees.filter(e=>!e.stationary&&e.dept!==7);for(let i=pool.length-1;i>0;i--){const j=Math.floor(s.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    d.packages=pool.slice(0,d.count).map((e,i)=>({recipient:e.id,worker:workers[i%2].id,status:'대기'}));
   }else workers.forEach((e,i)=>{e.carrying=i===3?'영수증':'식료품·비품';e.state=i===3?'대표에게 영수증 전달하러 이동 중':`${i+1}층 탕비실 보충하러 이동 중`;route(e,i===3?CEO_RECEIPT_SPOT:pantrySpotsForFloor(i)[0],i===3?2:i);});
  }
  if(d.status!=='배달 중')continue;
  if(d.kind==='parcel'){
   for(const e of workers){const pack=d.packages.find(p=>p.worker===e.id&&p.status!=='완료');if(!pack){if(e.assignment===d.id)release(e);continue;}const recipient=s.employees.find(p=>p.id===pack.recipient);
    if(pack.status==='대기'){pack.status='이동 중';e.carrying='택배';e.state=`${recipient.name} 자리에 택배 놓으러 이동 중`;route(e,[recipient.home[0]+.6,recipient.home[1]],recipient.homeFloor);}
    else if(!e.path.length){pack.status='완료';pack.deliveredAt=s.time;e.carrying=null;log(s,`${e.name} · ${recipient.name} 자리에 택배 놓기 완료`);}
   }
   if(d.packages.every(p=>p.status==='완료')){workers.forEach(release);d.status='완료';}
  }else{
   workers.forEach((e,i)=>{if(e.assignment!==d.id||e.path.length)return;if(i===3){const ceo=s.employees.find(p=>p.role==='대표');if(!free(ceo)||ceo.floor!==2||Math.hypot(ceo.pos[0]-CEO_HOME[0],ceo.pos[1]-CEO_HOME[1])>.5){e.state='대표 일정 종료 후 영수증 전달 대기';return;}}if(!d.arrivals)d.arrivals={};if(d.arrivals[e.id]==null){d.arrivals[e.id]=s.time;e.state=i===3?'대표에게 영수증 전달 중':`${i+1}층 간식·음료·공용 비품 채우는 중`;}if(s.time-d.arrivals[e.id]>=6){log(s,`${e.name} · ${i===3?'대표 영수증 전달':`${i+1}층 탕비실 보충`} 완료`);release(e);}});
   if(workers.every(e=>e.assignment!==d.id))d.status='완료';
  }
  if(d.status==='완료'){d.ended=s.time;log(s,`${d.name} 완료`);}
 }
}
