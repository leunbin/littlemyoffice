import {DOCUMENT_STATION,TEAM_BAYS} from './layout.js';
import * as THREE from 'three';

const THEMES = [
  {accent:'#a18c73',carpet:'#b9bab2',wall:'#ded7cb',title:'01  CLIENT & PEOPLE',subtitle:'고객과 동료를 맞이하는 공간'},
  {accent:'#667f8a',carpet:'#aab6bb',wall:'#d7e1e2',title:'02  PRODUCT & CREATIVE',subtitle:'기획에서 제품까지, 함께 만드는 공간'},
  {accent:'#6e7767',carpet:'#b1b5a8',wall:'#d8dbd0',title:'03  MANAGEMENT',subtitle:'회사의 다음을 준비하는 공간'},
];

export function remodelOffice({scene,box,sphere,label,plant,departmentObjects,employees}){
  const shelf=(x,z,width=2.5,color='#b5a18b')=>{
    box(x,1.05,z,width,2.1,.48,color);
    [0.15,.82,1.5,2.12].forEach(y=>box(x,y,z,width+.08,.07,.54,'#e4ddd0'));
    [-1,1].forEach(side=>box(x+side*width/2,1.05,z,.07,2.1,.54,'#827b70'));
    for(let row=0;row<3;row++)for(let i=0;i<6;i++){const bx=x-width/2+.2+i*.34;box(bx,.4+row*.67,z-.03,.2,.43,.32,['#c4b5a0','#7a8b89','#e2dacc','#8e9aa8'][i%4]);box(bx,.44+row*.67,z-.2,.1,.03,.012,'#eee9e0');}
  };
  const cabinet=(x,z,width=3)=>{
    box(x,.66,z,width,1.25,.6,'#e0ded5');box(x,1.31,z,width+.1,.08,.68,'#a58c73');
    for(let i=0;i<4;i++){const dx=x-width/2+(i+.5)*width/4;box(dx,.65,z-.315,.025,1.12,.025,'#b6b7b0');box(dx+.15,.9,z-.34,.18,.035,.035,'#737b78');}
  };
  const sofa=(x,z,width=3,color='#7e8c85',facing=0)=>{
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=facing;scene.add(group);
    box(0,.43,0,width,.65,1.05,color,group);box(0,.89,-.48,width,.8,.18,color,group);
    [-1,1].forEach(side=>{box(side*(width/2-.1),.7,0,.2,.65,1.05,color,group);box(side*(width/2-.3),.12,0,.08,.2,.65,'#505b59',group);});
    for(let i=0;i<3;i++)box(-width/3+i*width/3,.79,.05,width/3-.07,.12,.83,color,group);
  };
  const lowTable=(x,z,w=1.8,d=1)=>{box(x,.49,z,w,.12,d,'#b79b7e');[-1,1].forEach(side=>box(x+side*w*.34,.25,z,.08,.45,d*.7,'#586360'));};
  const printer=(x,z)=>{box(x,.6,z,1,1.2,.8,'#d4d9d6');box(x,1.25,z,1.05,.15,.85,'#56625f');box(x,1.37,z-.05,.75,.1,.55,'#eeeee8');box(x,.8,z-.42,.6,.13,.05,'#5c6563');box(x+.31,1.35,z-.3,.22,.08,.16,'#8ca5ad');};
  const board=(x,z,title,accent)=>{box(x,1.65,z,2.5,1.5,.1,'#535f5e');box(x,1.65,z-.065,2.35,1.36,.03,'#f0f0e8');label(title,x,2.68,z-.1,accent,.4);for(let col=0;col<3;col++){box(x-.72+col*.72,1.99,z-.09,.55,.035,.02,accent);for(let row=0;row<2;row++)box(x-.72+col*.72,1.72-row*.38,z-.1,.45,.25,.02,['#d7c8a8','#a6bcbb','#c7b6c7'][col]);}};
  const strip=(x,z,w)=>{box(x,3.05,z,w,.07,.22,'#59645f');box(x,3,z,w-.16,.035,.14,new THREE.MeshStandardMaterial({color:'#fff4d9',emissive:'#fff1d0',emissiveIntensity:.5}));};

  for(let floor=0;floor<3;floor++){
    const before=new Set(scene.children),theme=THEMES[floor];
    // Continuous porcelain tile flooring across departments and circulation.
    box(0,.19,0,35.65,.04,25.6,'#e5e1d8');
    for(let x=-17;x<18;x+=2)box(x,.212,0,.018,.004,25.6,'#cbc8c0');
    for(let z=-12;z<13;z+=2)box(0,.212,z,35.65,.004,.018,'#cbc8c0');
    // Equipment faces east toward the main entrance, with a shared access aisle.
    function equipment(position,build){
      const group=new THREE.Group();group.position.set(position[0],0,position[1]);
      group.rotation.y=DOCUMENT_STATION.facing;scene.add(group);
      const part=(x,y,z,w,h,d,color)=>box(x,y,z,w,h,d,color,group);
      build(part);
    }
    for(const cabinet of DOCUMENT_STATION.cabinets)equipment(cabinet.position,part=>{
      part(0,1.35,0,1.05,2.28,.6,'#d9ddd7');
      part(0,.25,0,1.08,.1,.64,'#707a74');
      part(0,2.51,0,1.1,.07,.65,'#abb5ab');
      for(const side of [-1,1]){
        part(side*.255,1.35,.315,.49,2.16,.035,'#e9ebe3');
        part(side*.08,1.35,.35,.035,.3,.04,'#6b7770');
        part(side*.255,1.94,.34,.27,.12,.02,'#faf8ee');
      }
    });
    equipment(DOCUMENT_STATION.copier.position,part=>{
      part(0,.91,0,1.55,1.38,1.15,'#d9dfdb');
      part(0,1.64,0,1.62,.12,1.2,'#53635d');
      part(-.14,1.77,-.1,1.18,.15,.9,'#f0f1e9');
      part(-.14,1.88,-.17,.95,.09,.58,'#a7b6ad');
      part(.55,1.83,.35,.36,.14,.28,'#45534f');
      part(.55,1.91,.35,.27,.025,.18,'#7fb3bb');
      for(const y of [.52,.86,1.2]){
        part(0,y,.59,1.4,.025,.025,'#9ba79f');
        part(0,y+.1,.62,.42,.055,.055,'#65766c');
      }
      part(-.45,1.42,.64,.65,.13,.1,'#3f4e48');
      part(-.45,1.37,.77,.69,.04,.35,'#a7b3ab');
    });
    const departments=[...new Set(employees.filter(e=>e.homeFloor===floor&&e.role==='팀장').map(e=>e.dept))];
    departments.forEach(dept=>{
      const team=employees.filter(e=>e.dept===dept),leader=team.find(e=>e.role==='팀장'),cx=leader.home[0],offset=leader.home[1]+11;
      // Cable troughs remain beneath the open desks.
      box(cx,.64,-6.1+offset,4.1,.16,.18,'#697471');
      team.forEach(e=>{
        const direction=Math.cos(e.facing),z=e.home[1]+direction*.7;
        box(e.home[0]+.5,.4,z,.4,.6,.48,'#d1d4cf');
        [0,1,2].forEach(i=>box(e.home[0]+.5,.3+i*.17,z-direction*.25,.2,.022,.025,'#87938b'));
      });
      strip(cx,-6.6+offset,3.9);
    });
    const centers=departments.map(dept=>employees.find(e=>e.dept===dept&&e.role==='팀장').home[0]).filter(x=>TEAM_BAYS.includes(x)).sort((a,b)=>a-b);
    for(const x of TEAM_BAYS.filter(x=>!centers.includes(x))){
      box(x,.23,-7.5,5.6,.035,10,'#dce0d5');
      label('확장 예정 · 공용 라운지',x,3.08,-2.2,theme.accent,.45);
      label('FLEX / FUTURE TEAM',x,.3,-1.6,'#7c8b79',.38);
    }
    for(let i=1;i<centers.length;i++){
      const x=(centers[i-1]+centers[i])/2;
      // Thin fixed partitions stop before the department entrance.
      box(x,1.4,-7.55,.18,2.8,9.5,'#dedbd4');
      box(x,.32,-7.55,.2,.22,9.5,'#b5b4ad');
      box(x,2.82,-7.55,.22,.06,9.5,'#c6c4bb');
    }
    // Window wall: dark mullions and spandrels replace pastel wall panels.
    box(0,.36,-12.65,35.5,.45,.15,'#a6ada8');
    for(let x=-16.8;x<17.5;x+=2.4){box(x,1.87,-12.61,2.28,2.48,.08,'#bdcdd1');box(x-1.18,1.86,-12.52,.075,2.6,.12,'#5e6e70');box(x,2,-12.5,2.3,.055,.12,'#647475');box(x,.92,-12.5,2.3,.06,.12,'#647475');}
    box(0,3.17,-12.52,35.5,.16,.2,'#63706e');
    // Structural columns, skirting and a floor directory give the cutaway a real shell.
    [-17.65,17.65].forEach(x=>[-12.6,12.6].forEach(z=>box(x,1.75,z,.42,3.5,.42,'#c6c5bc')));
    box(-17.85,.16,0,.08,.22,25.5,'#8c938b');
    label(theme.title,-4,3.5,-12.25,theme.accent,.78);
    label(theme.subtitle,-4,2.98,-12.2,'#70796e',.37);
    if(floor!==0){box(17.15,1.55,-3.1,.5,1.45,.12,'#586560');label(`${floor+1}F`,17.15,2.5,-3.1,theme.accent,.5);}
    box(-17.86,1.5,1.6,.06,2.4,2.2,theme.wall);
    // Meeting rooms: presentation screens, cameras, notepads and service credenzas.
    (floor===2?[]:[-12,-4]).forEach(x=>{
      box(x,1.9,11.05,3.1,1.65,.12,'#344443');box(x,1.9,10.97,2.85,1.4,.035,'#67858b');
      box(x,2.82,10.98,.35,.1,.12,'#4f5b58');sphere(x,2.82,10.89,.035,'#192823');
      label(floor===0?'INTERVIEW & MEETING':floor===1?'PROJECT REVIEW':'MANAGEMENT MEETING',x,2,10.88,'#ecede2',.36);
      box(x,.99,7.1,.48,.035,.3,'#4d5b57');
      [-1,1].forEach(side=>{box(x+side*.65,1.035,7.2,.35,.025,.5,'#f0eddf');box(x+side*.64,1.08,7.65,.09,.13,.09,'#d9e0d9');});
      strip(x,7.2,3);
    });
    if(floor===0){
      // Client floor: stone, oak, branded reception and a properly equipped back office.
      box(15.5,.23,7.8,4.2,.045,6.1,'#c4bba9');
      strip(13,-7,4.2);strip(13,7,4.2);
    }
    if(floor===1){
      printer(10.5,-3);
      box(4,1.7,10.7,3.8,1.7,.1,'#43565a');label('SPRINT  /  THIS WEEK',4,2,10.55,'#e0e7dc',.45);
      [-1,0,1].forEach((n)=>box(4+n,1.5,10.6,.7,.4,.04,['#c9b994','#8caca2','#b7a7be'][n+1]));
    }
    if(floor===2){
      // Executive floor: quieter finishes, records storage and a strategy corner.
      printer(10.5,-3);
      if(!centers.includes(6)){
        shelf(6,-12,3.8,'#9e8b72');sofa(6,-9.3,3.3,'#777f6d');lowTable(6,-7.3,2,1.1);
        board(6,-5,'STRATEGY & FINANCE',theme.accent);
        label('STRATEGY LOUNGE',6,2.8,-11.7,theme.accent,.5);
      }
      // Garden decking stays inside its existing footprint, away from restroom doors.
      for(let z=-10.3;z<-3.8;z+=.32)box(12.5,.17,z,4.6,.045,.27,'#ac9579');
      label('QUIET GARDEN',12.5,2.8,-11.3,'#6c8068',.5);
    }
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
}
