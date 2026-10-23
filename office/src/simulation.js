import {TEAM_CENTERS,TEAM_SEATS,ROOM_SEATS,CEO_HOME,ENTRY,PANTRY_SPOTS,ROOMS,planRoute} from './layout.js';
export {ROOM_SEATS} from './layout.js';
export const DEPTS = [
  {name:'영업팀',color:'#d68d9d',tasks:['고객과 통화 중','제안서 작성 중','거래처 확인 중','견적서 정리 중'],names:['김도윤','이서준','박지호','최하린','배수현']},
  {name:'인사팀',color:'#b19acb',tasks:['인사 서류 검토 중','면접 일정 조율 중','채용 공고 작성 중','복지 제도 검토 중'],names:['정서연','강지우','윤수빈','임예린','고나은']},
  {name:'회계팀',color:'#c6a17e',tasks:['정산 내역 확인 중','전표 입력 중','예산 검토 중','급여 내역 확인 중'],names:['한시우','오유진','서민준','신채원','남도현']},
  {name:'개발팀',color:'#8fa7cb',tasks:['코딩에 집중 중','코드 리뷰 중','버그 수정 중','테스트 실행 중'],names:['권준호','황은우','안소윤','송태오','백시온']},
  {name:'기획팀',color:'#c292b3',tasks:['기획서 작성 중','사용자 흐름 설계 중','리서치 정리 중','일정 조율 중'],names:['류다은','홍이안','전지안','문하준','조해린']},
];
const CLOTHES=['#b47e8b','#687b98','#d1b39a','#a59ab9','#646375','#cca2ae','#789095','#c2937a','#9c87ac','#8996af','#b69e83','#7e727a','#d0a3a0'];
export function appearanceFor(id){return {skin:['#efc6a6','#dca783','#b98061','#f5d8bf','#c58c6d'][id%5],hair:['#3c3037','#705141','#ad805b','#493e4c','#b79b83','#514542'][id%6],top:CLOTHES[id%CLOTHES.length],trousers:['#514b5e','#756c79','#646c7c','#8e817b'][id%4],style:id%6,glasses:id%4===1,height:0.94+(id%5)*0.035,build:0.9+(id%3)*0.1,accessory:id%5};}
export function makeSchedule(random=Math.random){
  const ids=[0,1,2,3,4];
  for(let i=4;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
  const meetings=ids.map((dept,i)=>({id:`team-${dept}`,kind:'team',dept,room:i%2,round:Math.floor(i/2),status:'waiting',started:null,ended:null}));
  meetings.push({id:'leadership',kind:'leadership',dept:null,room:Math.floor(random()*2),round:3,status:'waiting',started:null,ended:null});
  return meetings;
}
export function getMeetingMembers(s,m){return s.employees.filter(e=>m.kind==='leadership'?['팀장','대표'].includes(e.role):e.dept===m.dept);}
export function getMeetingName(m){return m.kind==='leadership'?'대표 · 팀장 회의':`${DEPTS[m.dept].name} 정기 회의`;}
export function createSimulation(random=Math.random){
  const employees=DEPTS.flatMap((d,dept)=>d.names.map((name,seat)=>{const id=dept*5+seat,spec=TEAM_SEATS[seat];return {id,name,dept,seat,role:seat===4?'팀장':'팀원',home:[TEAM_CENTERS[dept]+spec.offset[0],spec.offset[1]],facing:spec.facing,appearance:appearanceFor(id),pos:[...ENTRY],visible:false,path:[],state:'퇴근',next:0};}));
  employees.push({id:25,name:'이정우',dept:5,seat:0,role:'대표',home:[...CEO_HOME],facing:Math.PI,appearance:appearanceFor(25),pos:[...ENTRY],visible:false,path:[],state:'퇴근',next:0});
  return {mode:'idle',time:0,schedule:[],logs:[],random,employees};
}
function log(s,message){s.logs.unshift({time:s.time,message});s.logs=s.logs.slice(0,30);}
function route(e,target){e.path=planRoute(e.pos,target);}
function work(s,e){e.state=e.dept===5?'경영 현황 확인 중':e.role==='팀장'?'팀 업무 검토 중':DEPTS[e.dept].tasks[Math.floor(s.random()*4)];e.next=s.time+8+s.random()*15;}
export function startDay(s){if(s.mode!=='idle')return;s.mode='working';s.time=0;s.schedule=makeSchedule(s.random);s.logs=[];s.employees.forEach((e,i)=>{e.visible=false;e.pos=[...ENTRY];e.path=[];e.state='출근 대기';e.next=i*0.5;e.visiting=null;e.meetingSeat=null;e.meetingKind=null;});log(s,'좋은 아침! 팀별 회의 1회와 대표·팀장 회의가 배정됐어요.');}
export function endDay(s){if(s.mode!=='working')return;s.mode='leaving';s.schedule.forEach(m=>{if(m.status!=='done')m.status='cancelled';});s.employees.forEach(e=>{if(e.visible){e.state='퇴근 중';route(e,ENTRY);}else e.state='퇴근';});log(s,'오늘도 수고했어요. 모든 직원이 퇴근합니다.');}
export function tick(s,dt){
  if(s.mode==='idle')return;s.time+=dt;
  for(const e of s.employees){
    if(s.mode==='working'&&e.state==='출근 대기'&&s.time>=e.next){e.visible=true;e.state='출근 중';route(e,e.home);}
    if(!e.visible)continue;
    if(e.path.length){const p=e.path[0],dx=p[0]-e.pos[0],dz=p[1]-e.pos[1],dist=Math.hypot(dx,dz),step=dt*2.8;if(dist<=step){e.pos=[...p];e.path.shift();}else{e.pos[0]+=dx/dist*step;e.pos[1]+=dz/dist*step;}}
    if(!e.path.length){
      if(e.state==='퇴근 중'){e.visible=false;e.state='퇴근';}
      else if(['출근 중','자리로 이동 중'].includes(e.state))work(s,e);
      else if(e.state==='회의실로 이동 중')e.state='회의 대기';
      else if(e.state==='탕비실로 이동 중'){e.state='커피 마시는 중';e.next=s.time+5+s.random()*3;}
      else if(e.state==='동료에게 이동 중'){e.state='동료와 협업 중';e.next=s.time+6;}
      else if(e.state==='회의 참관 이동 중'){e.state='회의 참관 중';e.next=s.time+7;}
      else if(s.mode==='working'&&s.time>e.next&&!['회의 중','회의 대기'].includes(e.state)){
        if(['커피 마시는 중','동료와 협업 중','회의 참관 중'].includes(e.state)){e.state='자리로 이동 중';route(e,e.home);}
        else if(e.dept===5){const active=s.schedule.find(m=>m.status==='active');if(active){e.visiting=active.room;e.state='회의 참관 이동 중';route(e,[ROOMS[active.room].x,4.9]);}else e.next=s.time+10;}
        else if(s.random()<0.35){e.state='탕비실로 이동 중';route(e,PANTRY_SPOTS[e.id%PANTRY_SPOTS.length]);}
        else if(s.random()<0.5){const coworker=s.employees[e.dept*5+(e.seat+1)%5];e.state='동료에게 이동 중';route(e,[coworker.home[0]+0.55,coworker.home[1]]);}
        else work(s,e);
      }
    }
  }
  if(s.mode==='leaving'){if(s.employees.every(e=>!e.visible)){s.mode='idle';log(s,'모두 퇴근했어요. 다음 출근을 기다립니다.');}return;}
  for(const m of s.schedule){
    const members=getMeetingMembers(s,m),previous=s.schedule.filter(x=>x.round<m.round);
    const roomClear=s.employees.every(e=>!e.visible||Math.abs(e.pos[0]-ROOMS[m.room].x)>3.8||e.pos[1]<3.3);
    if(m.status==='waiting'&&s.time>22&&members.every(e=>e.visible&&e.state!=='출근 중')&&previous.every(x=>x.status==='done'&&s.time>x.ended+5)&&roomClear&&!s.schedule.some(x=>x!==m&&x.room===m.room&&['gathering','active'].includes(x.status))){m.status='gathering';members.forEach((e,i)=>{e.state='회의실로 이동 중';e.meetingSeat=i;e.meetingKind=m.kind;route(e,ROOM_SEATS[m.room][i]);});log(s,`${getMeetingName(m)} · 회의실 ${m.room===0?'A':'B'}로 이동해요.`);}
    if(m.status==='gathering'&&members.every(e=>e.state==='회의 대기')){m.status='active';m.started=s.time;members.forEach(e=>e.state='회의 중');log(s,`${getMeetingName(m)} · ${members.length}명이 모여 시작했어요.`);}
    if(m.status==='active'&&s.time-m.started>=20){m.status='done';m.ended=s.time;members.forEach(e=>{e.state='자리로 이동 중';e.meetingSeat=null;e.meetingKind=null;route(e,e.home);});const ceo=s.employees[25];if(ceo.visiting===m.room&&['회의 참관 중','회의 참관 이동 중'].includes(ceo.state)){ceo.state='자리로 이동 중';route(ceo,ceo.home);ceo.visiting=null;}log(s,`${getMeetingName(m)} 종료 · 업무로 복귀합니다.`);}
  }
}
