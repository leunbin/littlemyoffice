import * as THREE from 'three';

const THEMES = [
  {accent:'#a18c73',carpet:'#b9bab2',wall:'#ded7cb',title:'01  CLIENT & PEOPLE',subtitle:'고객과 동료를 맞이하는 공간'},
  {accent:'#667f8a',carpet:'#aab6bb',wall:'#d7e1e2',title:'02  PRODUCT & CREATIVE',subtitle:'기획에서 제품까지, 함께 만드는 공간'},
  {accent:'#6e7767',carpet:'#b1b5a8',wall:'#d8dbd0',title:'03  MANAGEMENT',subtitle:'회사의 다음을 준비하는 공간'},
];

function carpetMaterial(color){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,128,128);
  // Deterministic woven fibers and seams keep the floor quiet at every zoom level.
  for(let y=0;y<128;y+=3)for(let x=0;x<128;x+=3){ctx.fillStyle=(x*13+y*7)%5<2?'#ffffff18':'#26303412';ctx.fillRect(x,y,1,2);}
  ctx.strokeStyle='#35413c16';ctx.strokeRect(.5,.5,127,127);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(6,10);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({map:texture,roughness:1});
}

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
    // Material zoning makes circulation, work areas and rooms read as separate spaces.
    box(0,.078,0,35.65,.022,25.6,floor===0?'#ddd8cc':floor===1?'#dce0dd':'#ddd9ce');
    box(-2.4,.097,0,25.4,.025,2.3,'#b7b5aa');
    [-1,1].forEach(side=>box(-2.4,.115,side*1.14,25.4,.01,.035,theme.accent));
    const departments=[...new Set(employees.filter(e=>e.homeFloor===floor&&e.role==='팀장').map(e=>e.dept))];
    departments.forEach(dept=>{
      const team=employees.filter(e=>e.dept===dept),cx=team.find(e=>e.role==='팀장').home[0];
      box(cx,.178,-6.5,5.44,.025,10.15,carpetMaterial(theme.carpet));
      cabinet(cx,-12.04,3.4);
      // Acoustic desk dividers, cable troughs and discreet team signs.
      box(cx,1.25,-6.7,3.3,.55,.09,theme.accent);
      box(cx,.64,-6.7,2.7,.16,.18,'#697471');
      box(cx+2.12,.68,-11.7,.55,1.3,.62,'#b7beb6');
      team.forEach(e=>{
        const direction=Math.cos(e.facing),z=e.home[1]+direction*.7;
        box(e.home[0]+.5,.4,z,.4,.6,.48,'#d1d4cf');
        [0,1,2].forEach(i=>box(e.home[0]+.5,.3+i*.17,z-direction*.25,.2,.022,.025,'#87938b'));
        if(dept===3){const monitor=new THREE.Group();monitor.position.set(e.home[0]+.56,1.38,e.home[1]+direction*1.02);monitor.rotation.y=e.facing;scene.add(monitor);box(0,0,0,.52,.48,.07,'#3e4a4d',monitor);box(0,0,-.04,.44,.38,.01,'#273f49',monitor);}
      });
      strip(cx,-6.6,3.9);
    });
    const centers=departments.map(dept=>employees.find(e=>e.dept===dept&&e.role==='팀장').home[0]).sort((a,b)=>a-b);
    for(let i=1;i<centers.length;i++){
      const x=(centers[i-1]+centers[i])/2,z=-7.2;
      // Slim drawer partitions keep both desk access lanes and the main corridor open.
      box(x,.72,z,.65,1.25,3.6,'#d6d8ce');box(x,1.39,z,.73,.09,3.7,'#a58c73');
      for(const side of [-1,1])for(let col=0;col<3;col++)for(let row=0;row<3;row++){
        const dz=z-1.2+col*1.2,y=.35+row*.36;
        box(x+side*.335,y,dz,.025,.32,1.1,'#e5e4db');box(x+side*.36,y+.04,dz,.035,.045,.3,'#7e8b82');
      }
      for(const dz of [-1.05,1.05]){
        box(x,1.59,z+dz,.38,.32,.38,'#d1b39a');
        sphere(x,1.98,z+dz,.3,'#789375',scene,[.85,1.15,.85]);sphere(x+.12,1.91,z+dz+.08,.19,'#a4b28b');
      }
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
    box(17.15,1.55,-3.1,.5,1.45,.12,'#586560');box(-17.86,1.5,1.6,.06,2.4,2.2,theme.wall);label(`${floor+1}F`,17.15,2.5,-3.1,theme.accent,.5);
    // Meeting rooms: presentation screens, cameras, notepads and service credenzas.
    [-12,-4].forEach(x=>{
      box(x,1.9,11.05,3.1,1.65,.12,'#344443');box(x,1.9,10.97,2.85,1.4,.035,'#67858b');
      box(x,2.82,10.98,.35,.1,.12,'#4f5b58');sphere(x,2.82,10.89,.035,'#192823');
      label(floor===0?'INTERVIEW & MEETING':floor===1?'PROJECT REVIEW':'MANAGEMENT MEETING',x,2,10.88,'#ecede2',.36);
      box(x,.99,7.1,.48,.035,.3,'#4d5b57');
      [-1,1].forEach(side=>{box(x+side*.65,1.035,7.2,.35,.025,.5,'#f0eddf');box(x+side*.64,1.08,7.65,.09,.13,.09,'#d9e0d9');});
      strip(x,7.2,3);
    });
    if(floor===0){
      // Client floor: stone, oak, branded reception and a properly equipped back office.
      box(13,.18,-2.65,3.6,.025,1.8,'#b6afa0');
      box(13,.52,-3.78,3.05,.9,.06,'#a58c73');
      for(let x=11.65;x<14.5;x+=.16)box(x,.52,-3.73,.035,.86,.045,'#d7c3a9');
      label('우리의 작은 회사',13,2.95,-11.85,'#536660',.63);
      label('WELCOME  /  INFORMATION',13,2.45,-11.8,'#8d9788',.33);
      box(15.5,.23,7.8,4.2,.045,6.1,'#c4bba9');
      strip(13,-7,4.2);strip(13,7,4.2);
    }
    if(floor===1){
      // Product floor: acoustic collaboration alcove and design review pin-up wall.
      box(13.3,.15,-7.7,6.1,.08,7.5,carpetMaterial('#b4b4a6'));
      box(13.3,1.45,-11.3,5.8,2.8,.18,'#7e918d');
      for(let x=10.6;x<16.3;x+=.38)box(x,1.45,-11.17,.075,2.7,.06,'#b9c6b6');
      sofa(13.3,-9.8,3.5,'#718a84');sofa(16,-7,2.2,'#9ca78e',-Math.PI/2);
      lowTable(13.3,-7.8,2,1.2);box(13.1,.58,-7.8,.65,.045,.42,'#e3dac6');
      label('COLLABORATION LAB',13.2,3,-11,'#536e6b',.62);
      board(11,-5,'DESIGN REVIEW',theme.accent);printer(10.5,-3);
      shelf(10.8,-12,2.6,'#c5bb9f');strip(13,-7.7,4.5);
      box(4,1.7,10.7,3.8,1.7,.1,'#43565a');label('SPRINT  /  THIS WEEK',4,2,10.55,'#e0e7dc',.45);
      [-1,0,1].forEach((n)=>box(4+n,1.5,10.6,.7,.4,.04,['#c9b994','#8caca2','#b7a7be'][n+1]));
    }
    if(floor===2){
      // Executive floor: quieter finishes, records storage and a strategy corner.
      shelf(6,-12,3.8,'#9e8b72');cabinet(-7,-12,3.4);printer(10.5,-3);
      box(6,.17,-7.4,4.5,.05,6,carpetMaterial('#bdb5a3'));
      sofa(6,-9.3,3.3,'#777f6d');lowTable(6,-7.3,2,1.1);
      board(6,-5,'STRATEGY & FINANCE',theme.accent);
      label('STRATEGY LOUNGE',6,2.8,-11.7,theme.accent,.5);
      // Executive room: walnut feature wall, framed art, closed storage and a leather desk pad.
      box(4,1.7,11.08,6.5,2.8,.08,'#85735e');
      for(let x=1;x<7.2;x+=.24)box(x,1.7,11.01,.045,2.7,.05,'#b49d7b');
      label('DIRECTOR  /  이정우',4,2.8,10.85,'#efeadc',.52);
      box(4,.985,7.03,1.1,.025,.55,'#596259');
      box(1.5,1.8,10.86,.95,1.1,.08,'#d8d2ba');box(1.5,1.8,10.79,.7,.85,.04,'#728577');
      sofa(1.7,5.7,1.6,'#887561',Math.PI/2);strip(4,7.4,3.4);
      // Garden decking stays inside its existing footprint, away from restroom doors.
      for(let z=-10.3;z<-3.8;z+=.32)box(12.5,.17,z,4.6,.045,.27,'#ac9579');
      label('QUIET GARDEN',12.5,2.8,-11.3,'#6c8068',.5);
    }
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
}
