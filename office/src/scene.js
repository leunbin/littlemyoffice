import * as THREE from 'three';
import {remodelOffice} from './interiors.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {DEPTS,DEPT_FLOORS,FLOOR_NAMES} from './simulation.js';
import {TEAM_CENTERS,TEAM_SEATS,ROOM_SEATS,ROOMS,LOBBY,RESTROOMS,ENTRY} from './layout.js';

export function createOffice(canvas,sim,onSelect){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#e9ece7');renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.fog=new THREE.Fog('#e9ece7',80,130);
  const camera=new THREE.PerspectiveCamera(36,1,0.1,180);const initial=[36,39,43];camera.position.set(...initial);
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,0,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.35;controls.minDistance=20;controls.maxDistance=85;controls.maxAzimuthAngle=Math.PI/2;controls.minAzimuthAngle=-Math.PI/2;
  controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.PAN};
  controls.screenSpacePanning=false;
  const preventMiddleScroll=e=>{if(e.button===1)e.preventDefault();};
  canvas.addEventListener('mousedown',preventMiddleScroll);
  scene.add(new THREE.HemisphereLight(0xfffafb,0xb8c0b5,1.8));
  const sun=new THREE.DirectionalLight(0xfff4ec,2.2);sun.position.set(-15,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-29,right:29,top:29,bottom:-29});sun.shadow.normalBias=0.04;scene.add(sun);
  const materials=new Map();
  const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.75}));return materials.get(color);};
  function box(x,y,z,w,h,d,color,parent=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?mat(color):color);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(x,y,z,r,color,parent=scene,scale=[1,1,1]){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),mat(color));mesh.position.set(x,y,z);mesh.scale.set(...scale);mesh.castShadow=true;parent.add(mesh);return mesh;}
  function label(text,x,y,z,color='#79616d',size=0.65){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.font='600 38px "Malgun Gothic",sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,256,62);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(size*5.33,size,1);scene.add(sprite);return sprite;}
  const demoScreens=[];
  const platformPages=[
    ['CUSTOMER PORTAL','\uACE0\uAC1D \uD3EC\uD138','\uBB38\uC758 \uC811\uC218  /  \uC11C\uBE44\uC2A4 \uD604\uD669  /  \uC54C\uB9BC'],
    ['DATA DASHBOARD','\uB370\uC774\uD130 \uB300\uC2DC\uBCF4\uB4DC','\uACE0\uAC1D \uBD84\uC11D  /  \uC131\uACFC \uC9C0\uD45C  /  \uB9AC\uD3EC\uD2B8'],
    ['WORK AUTOMATION','\uC5C5\uBB34 \uC790\uB3D9\uD654','\uC694\uCCAD \uAD00\uB9AC  /  \uC5C5\uBB34 \uBC30\uC815  /  \uC9C4\uD589 \uD604\uD669'],
  ];
  function displayPanel(x,y,z,w,h,rotation,lines,interactive=false){
    const canvas=document.createElement('canvas');canvas.width=interactive?768:1024;canvas.height=interactive?1280:576;
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
    screen.position.set(x,y,z);screen.rotation.y=rotation;scene.add(screen);
    function draw(content){
      const ctx=canvas.getContext('2d');ctx.fillStyle='#102d36';ctx.fillRect(0,0,canvas.width,canvas.height);
      if(interactive){
        ctx.fillStyle='#7ce0ca';ctx.font='600 30px "Malgun Gothic",sans-serif';ctx.fillText('LITTLE OFFICE / EXPERIENCE',48,90);
        ctx.fillStyle='#f2f7ed';ctx.font='700 54px "Malgun Gothic",sans-serif';ctx.fillText(content[1],48,205,670);
        ctx.fillStyle='#aac9cd';ctx.font='25px "Malgun Gothic",sans-serif';ctx.fillText(content[0],48,265,670);
        ctx.fillStyle='#234c55';ctx.fillRect(48,325,672,390);
        for(let i=0;i<4;i++){
          ctx.fillStyle=['#367b85','#519f9d','#79c8b5','#a3dfc5'][i];ctx.fillRect(90+i*145,650-i*65,95,40+i*65);
        }
        ctx.fillStyle='#c8e6df';ctx.font='26px "Malgun Gothic",sans-serif';ctx.fillText(content[2],48,790,670);
        ctx.fillStyle='#275d60';ctx.fillRect(48,860,672,130);
        ctx.fillStyle='#f3fcf4';ctx.font='600 34px "Malgun Gothic",sans-serif';ctx.fillText('EXPLORE PLATFORM  >',90,940);
        ctx.fillStyle='#7ce0ca';ctx.font='28px "Malgun Gothic",sans-serif';ctx.fillText('TOUCH FOR NEXT PLATFORM',100,1140);
        texture.needsUpdate=true;return;
      }
      if(content[0]==='LITTLE OFFICE'){
        ctx.fillStyle='#79d9c4';ctx.fillRect(470,115,84,6);
        ctx.textAlign='center';ctx.font='500 28px "Malgun Gothic",sans-serif';ctx.fillText('LITTLE OFFICE',512,190);
        ctx.fillStyle='#f5fff5';ctx.font='700 84px "Malgun Gothic",sans-serif';ctx.fillText(content[1],512,320,920);
        ctx.fillStyle='#a2d1cc';ctx.font='30px "Malgun Gothic",sans-serif';ctx.fillText(content[2],512,405);
        ctx.textAlign='start';texture.needsUpdate=true;return;
      }
      ctx.fillStyle='#7ce0ca';ctx.fillRect(64,64,72,7);ctx.font='600 32px "Malgun Gothic",sans-serif';ctx.fillText(content[0],64,125);
      ctx.fillStyle='#f2f7ed';ctx.font='700 62px "Malgun Gothic",sans-serif';ctx.fillText(content[1],64,235,900);
      ctx.fillStyle='#b5d7d9';ctx.font='28px "Malgun Gothic",sans-serif';ctx.fillText(content[2],64,305,900);
      for(let i=0;i<3;i++){ctx.fillStyle=['#397d85','#56a9a6','#7cd6bd'][i];ctx.fillRect(64+i*300,365,270,95);}
      ctx.fillStyle='#deeee9';ctx.font='24px "Malgun Gothic",sans-serif';ctx.fillText(interactive?'TOUCH TO EXPLORE  >':'LITTLE OFFICE  /  CONNECTING PEOPLE & IDEAS',64,523);
      texture.needsUpdate=true;
    }
    draw(lines);
    if(interactive){let page=0;screen.userData.platformDemo=()=>{page=(page+1)%platformPages.length;draw(platformPages[page]);};demoScreens.push(screen);}
    return screen;
  }
  function plant(x,z,size=1){box(x,0.27,z,0.6,0.54,0.6,'#c5a6a2');sphere(x,0.95,z,0.53,'#8f9d89',scene,[size,1.3*size,size]);sphere(x+0.24,0.86,z+0.1,0.33,'#a7af94');}
  function chair(x,z,color,facing=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=facing;scene.add(g);box(0,0.48,0,0.67,0.14,0.63,color,g);box(0,0.86,-0.27,0.67,0.7,0.13,color,g);box(0,0.24,0,0.1,0.4,0.1,'#56625c',g);box(0,0.08,0,0.6,0.08,0.1,'#56625c',g);box(0,0.08,0,0.1,0.08,0.6,'#56625c',g);[-1,1].forEach(side=>{box(side*.38,.75,0,.08,.08,.4,'#4e5b55',g);box(side*.38,.59,.08,.05,.3,.05,'#56625c',g);});box(0,.82,-.18,.49,.15,.1,'#66776d',g);for(let i=0;i<5;i++){const angle=i*Math.PI*2/5;const spoke=box(Math.cos(angle)*.19,.12,Math.sin(angle)*.19,.42,.045,.045,'#56625c',g);spoke.rotation.y=-angle;sphere(Math.cos(angle)*.35,.08,Math.sin(angle)*.35,.055,'#394740',g);}}
  function desk(x,z,color,facing=0,leader=false,dual=false){
    const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=facing;scene.add(g);
    const w=(leader?1.9:1.5)*1.5;
    box(0,.91,1.05,w,.12,1.8,'#c9b496',g);
    [-1,1].forEach(s=>box(s*(w/2-.1),.45,1.05,.08,.85,1.54,'#737c76',g));
    // Keep the enlarged screens inside the far edge of the tabletop.
    function monitor(mx,width,height){
      box(mx,1.6,1.84,width,height,.105,'#364441',g);
      box(mx,1.6,1.78,width-.165,height-.18,.015,'#64828b',g);
      box(mx,1.1,1.84,.16,.26,.1,'#5f6b64',g);
      box(mx,.99,1.73,.46,.04,.32,'#5f6b64',g);
    }
    monitor(dual?-.45:0,1.245,.825);
    if(dual)monitor(.6225,.78,.72);
    box(0,1,.5,.63,.035,.24,'#d6d9d0',g);box(.53,1.04,.67,.13,.22,.13,color,g);
    chair(x,z,color,facing);
  }
  // Warm stone and oak shell, with a wide central circulation corridor.
  box(0,-0.34,0,36,0.68,26,'#ceb9b3');box(0,0.02,0,35.8,0.08,25.8,'#f1e8e3');
  for(let x=-17;x<18;x+=1.2)box(x,0.065,0,0.015,0.01,25.8,'#e5d9d2');
  box(0,1.5,-13,36,3,0.2,'#faf3f1');box(-18,0.7,0,0.2,1.4,26,'#f8eeed');
  TEAM_CENTERS.forEach(x=>{box(x,1.75,-12.85,4.5,1.7,0.07,'#d4cbdc');box(x,1.75,-12.78,0.05,1.7,0.04,'#f9f4f2');});
  const departmentObjects=[];
  DEPTS.forEach((dept,i)=>{const before=new Set(scene.children);const x=sim.employees.find(e=>e.dept===i&&e.role==='팀장').home[0];
    // A ceiling-hung department sign above the entrance.
    [-1,1].forEach(side=>box(x+side*1.05,3.65,-2.3,.035,1.1,.035,'#707974'));
    box(x,3.08,-2.3,3.4,.64,.14,'#faf8f1');
    label(dept.name,x,3.09,-2.2,dept.color,.54);
    // Four staff share a face-to-face island; the team lead sits at a separate desk.
    sim.employees.filter(e=>e.dept===i).forEach(e=>desk(...e.home,dept.color,e.facing,e.role==='팀장'));
    label('TEAM LEAD',x,0.29,-8.95,'#a37a8c',0.29);
    sim.employees.filter(e=>e.dept===i).forEach(e=>{box(e.home[0]+0.45,1.08,e.home[1]+Math.cos(e.facing)*0.75,0.16,0.2,0.16,e.id%2?'#b7c6a3':'#d8b8ca');});

    departmentObjects.push({floor:DEPT_FLOORS[i],objects:scene.children.filter(o=>!before.has(o))});
  });
  label('LITTLE OFFICE  /  EVERYDAY, TOGETHER',0,0.35,1.1,'#b0909e',0.7);label('출입구 →',16.3,0.5,-0.6,'#b38599',0.46);
  const glass=new THREE.MeshPhysicalMaterial({color:'#e7d5e1',transparent:true,opacity:0.17,roughness:0.12,metalness:0.05,depthWrite:false,side:THREE.DoubleSide});
  const storageDoors=[];
  const doors=[];const lobbyDoors=[];const entranceDoors=[];const floorLabels=[];
  function glassWall(x,z,width,depth){const isSide=depth>width;box(x,1.45,z,width,2.9,depth,glass).castShadow=false;box(x,0.12,z,isSide?0.12:width,0.15,isSide?depth:0.12,'#a28d9e');box(x,2.92,z,isSide?0.1:width,0.09,isSide?depth:0.1,'#a28d9e');if(isSide){[-1,1].forEach(s=>box(x,1.45,z+s*depth/2,0.09,2.9,0.09,'#ae98a7'));}else{[-1,1].forEach(s=>box(x+s*width/2,1.45,z,0.09,2.9,0.09,'#ae98a7'));}}
  function roomShell(r,index){const x=r.x;box(x,0.12,7.4,7.6,0.1,7.8,index===3?'#ead8cf':'#e6dbe3');box(x,0.18,7.4,7.3,0.03,7.5,index===3?'#f1e5dd':'#f1e8ed');glassWall(x-3.8,7.4,0.055,7.8);glassWall(x+3.8,7.4,0.055,7.8);glassWall(x,11.3,7.6,0.055);
    glassWall(x-0.95,3.5,5.7,0.055);glassWall(x+3.55,3.5,0.5,0.055);
    const door=new THREE.Group();door.position.set(x+2.6,0,3.5);scene.add(door);box(0,1.45,0,1.35,2.9,0.07,glass,door).castShadow=false;[-0.67,0.67].forEach(dx=>box(dx,1.45,0,0.06,2.9,0.08,'#a28d9e',door));box(0,2.9,0,1.4,0.07,0.1,'#a28d9e',door);box(-0.43,1.2,-0.09,0.05,0.36,0.07,'#8d7084',door);doors.push({group:door,x:x+2.6,open:0});
    if(index===2){['탕비실','프로젝트룸','대표실'].forEach((name,floor)=>floorLabels.push({floor,sprite:label(name,x-0.5,2.32,3.4,'#96788b',0.63)}));}else label(r.name,x-0.5,2.32,3.4,'#96788b',0.63);label(index<2?'MEETING ROOM':index===2?'SHARED SPACE':'PANTRY & LOUNGE',x,0.48,11.7,'#b398a8',0.35);
  }
  ROOMS.forEach((room,index)=>{
    if(index!==3){roomShell(room,index);return;}
    // The former first-floor pantry is now open lobby space.
    for(const floor of [1,2]){const before=new Set(scene.children);roomShell(room,index);doors.at(-1).floor=floor;departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});}
  });
  ROOMS.slice(0,2).forEach((r,i)=>{box(r.x,0.94,7.2,2.25,0.15,3.7,'#b49a78');box(r.x,0.47,7.2,0.6,0.88,2.6,'#78857d');ROOM_SEATS[i].forEach(([x,z],n)=>chair(x,z,'#727e76',n===5?0:n===4?Math.PI:(x<r.x?Math.PI/2:-Math.PI/2)));box(r.x,1.7,11.18,2.8,1.4,0.08,'#fdf7fa');box(r.x,1.65,11.1,1.8,0.025,0.025,'#c799b0');box(r.x-0.4,1.88,11.1,1,0.025,0.025,'#c799b0');plant(r.x-2.8,10.25,0.7);});
  const beforeCeo=new Set(scene.children);
  desk(4,7.8,'#a3849e',Math.PI,true);box(4,0.6,10.7,4.6,1.2,0.6,'#ac967b');box(4,1.23,10.7,4.7,0.08,0.7,'#ead8d0');plant(1.2,10,1.1);label('CEO',4,1.8,10.8,'#8e6e83',0.43);
  departmentObjects.push({floor:2,objects:scene.children.filter(o=>!beforeCeo.has(o))});
  const beforePantry=new Set(scene.children);
  // A separate pantry: cabinetry, coffee machine, fridge, sink, shelves and a lounge.
  box(11.3,0.62,10.55,4.8,1.24,0.9,'#b9b7a8');box(11.3,1.29,10.55,4.95,0.1,1,'#f8f0ea');
  [9.8,11.2,12.6].forEach(x=>box(x,0.67,10.03,0.75,0.06,0.04,'#a38c97'));
  box(13.3,1.37,10.5,0.8,0.05,0.56,'#a69caa');box(13.3,1.65,10.8,0.05,0.55,0.05,'#a69caa');box(13.15,1.9,10.8,0.35,0.05,0.05,'#a69caa');
  box(10,1.66,10.4,0.85,0.7,0.65,'#6e5d6c');box(10,1.65,10.05,0.55,0.37,0.025,'#cfacbd');box(10,1.35,9.98,0.65,0.05,0.3,'#a78c9c');
  box(14.8,1.16,10.5,0.9,2.3,0.9,'#e7dce4');box(14.5,1.15,10.01,0.05,0.55,0.05,'#9a8796');
  box(12,2.25,10.9,4.2,0.09,0.55,'#bca1aa');[11,11.5,12,12.5].forEach(x=>box(x,2.4,10.8,0.19,0.24,0.19,'#f8ebef'));
  box(12,0.52,7.35,3.6,0.12,1.15,'#b39c7f');[-1.4,0,1.4].forEach(dx=>{chair(12+dx,6.1,'#cba9b8',0);chair(12+dx,8.8,'#cba9b8',Math.PI);});plant(9.1,10,0.8);

  const pantryObjects=scene.children.filter(o=>!beforePantry.has(o));
  pantryObjects.forEach(o=>scene.remove(o));
  for(let floor=0;floor<3;floor++){const objects=pantryObjects.map(o=>{const copy=o.clone(true);if(floor===0)copy.position.x-=8;scene.add(copy);return copy;});departmentObjects.push({floor,objects});}

  const elevatorPortals=[];
  for(let floor=0;floor<3;floor++){
    const before=new Set(scene.children);
    const elevator=new THREE.Group();elevator.position.set(LOBBY.elevatorWall[0],0,LOBBY.elevatorWall[1]);elevator.rotation.y=-Math.PI/2;scene.add(elevator);
    box(0,1.4,0,2.6,2.8,.2,'#344a43',elevator);
    const leaves=[-1,1].map(side=>({side,mesh:box(side*.46,1.35,.15,.89,2.5,.1,'#c6cfca',elevator)}));
    box(0,2.95,.05,.8,.24,.15,'#485951',elevator);
    const indicator=label('1F',LOBBY.elevatorWall[0]-.22,3.25,LOBBY.elevatorWall[1],'#63796b',.3);
    elevatorPortals.push({floor,leaves,indicator,open:0});
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
  const liftCar=new THREE.Group();scene.add(liftCar);
  box(18.8,.15,LOBBY.elevator[1],1.8,.25,2.4,'#6f9388',liftCar);
  box(19.65,1.45,LOBBY.elevator[1],.12,2.7,2.4,'#9bb7ac',liftCar);
  box(18.8,2.85,LOBBY.elevator[1],1.8,.12,2.4,'#6f9388',liftCar);
  // Keep the moving cab out of the static floor clones.
  departmentObjects.push({floor:-1,objects:[liftCar]});
  [-7,0,7].forEach(x=>{box(x,0.65,-12.3,2,1.1,0.1,'#d6b5c5');label('IDEAS · CREATE',x,1.7,-12.2,'#876a83',0.32);});
  [1,2].forEach(i=>plant(-17,5+i*2,0.8));
  for(let floor=0;floor<3;floor++){const before=new Set(scene.children);
    if(floor===0){
      // Transparent automatic street entrance, aligned with the arrival and departure route.
      const entryLeaf=new THREE.Group();entryLeaf.position.set(ENTRY[0],0,ENTRY[1]);scene.add(entryLeaf);
      box(0,1.42,0,.075,2.84,1.9,glass,entryLeaf);[-.95,.95].forEach(dz=>box(0,1.42,dz,.09,2.84,.05,'#7e9488',entryLeaf));
      box(-.08,1.3,.6,.055,.55,.05,'#627f6b',entryLeaf);entranceDoors.push({group:entryLeaf,open:0});
      [-1.08,1.08].forEach(dz=>box(ENTRY[0],1.5,ENTRY[1]+dz,.14,3,.12,'#7e9488'));box(ENTRY[0],3,ENTRY[1],.16,.14,2.3,'#7e9488');
      label('MAIN ENTRANCE',17.2,3.3,ENTRY[1],'#647f6a',.34);
      // The lobby continues into the former pantry, separated from the staff pantry.
      box(13.1,0.11,8,9.4,0.12,10,'#dfd1c6');
      for(let x=8.8;x<18;x+=1.2)box(x,0.178,8,0.018,0.01,10,'#c9b9ae');
      box(8.15,1.9,8,0.22,3.8,9.8,'#e4d8d0');
      box(8.87,1.9,3.05,1.65,3.8,0.22,'#e4d8d0');
      box(13.4,0.48,9,4,0.7,1.25,'#bda0b1');box(13.4,0.94,9.55,4,0.8,0.2,'#bda0b1');
      box(13.4,0.43,6.8,2,0.13,1.2,'#d2b9a0');box(13.4,0.2,6.8,0.8,0.4,0.65,'#c2a68e');
      plant(16.6,10.8,1.1);label('WELCOME · WAITING',13.2,2,11.7,'#947084',0.6);
      // A private entrance lobby beside the elevator, with a screened staff entrance.
      box(13.8,0.11,-5,8.2,0.12,15.8,'#dfd1c6');
      for(let x=10.4;x<18;x+=1.2)box(x,0.178,-5,0.018,0.01,15.8,'#c9b9ae');
      box(9.6,1.9,-11.55,.24,3.8,2.9,'#e4d8d0');
      box(9.6,1.9,-5.45,.24,3.8,6.7,'#e4d8d0');
      box(9.6,1.9,2.15,0.24,3.8,1.9,'#e4d8d0');
      box(9.6,3.5,0,0.28,0.6,2.4,'#c4aaa8');

      const door=new THREE.Group();door.position.set(LOBBY.door[0],0,LOBBY.door[1]);scene.add(door);
      box(0,1.6,0,0.16,3.2,2.25,'#9c7e8e',door);box(0.11,1.45,0.6,0.08,0.6,0.06,'#ddc6a9',door);
      lobbyDoors.push({group:door,open:0});
      label('STAFF ONLY',10.1,3.3,0,'#8b6a7b',0.37);
      box(LOBBY.reception[0],0.65,LOBBY.reception[1],3.3,1.3,1.15,'#b899a5');
      box(LOBBY.reception[0],1.34,LOBBY.reception[1],3.45,0.12,1.25,'#f5eadd');
      box(13.6,1.72,-3.86,.975,.6,.12,'#736473');
      chair(...LOBBY.staff,'#8f9f9a',0);
      box(12,1.47,-4.3,0.55,0.16,0.42,'#716975');box(12,1.58,-4.3,0.64,0.1,0.16,'#514955');
      box(13.6,1.37,-4.3,0.6,0.035,0.2,'#efe7e6');
      label('INFORMATION',13,2.15,-4.55,'#8c687d',0.5);
      // Enclosed stockroom behind reception; access is on its west wall.
      box(13.8,1.7,-6.85,8.15,3,.16,'#102d36');
      box(17.8,1.6,-9.85,.16,3.2,5.9,'#d8ded5');
      const storageDoor=new THREE.Group();storageDoor.position.set(9.6,0,-9.45);scene.add(storageDoor);
      box(0,1.48,0,.13,2.9,1.3,'#718b82',storageDoor);
      box(.15,1.35,.43,.06,.35,.07,'#d7d3b7',storageDoor);
      storageDoors.push(storageDoor);
      [-10.15,-8.75].forEach(z=>box(9.6,1.5,z,.2,3,.08,'#4c655c'));
      box(9.6,3,-9.45,.2,.12,1.5,'#4c655c');
      label('STORAGE',10.2,3.35,-9.45,'#50685d',.35);
      for(const x of [11.3,14,16.8]){
        [1,2,2.9].forEach(y=>box(x,y,-11.8,2.1,.08,1,'#9ea89a'));
        [-.95,.95].forEach(dx=>box(x+dx,1.55,-11.8,.07,2.9,1,'#697b70'));
        for(let row=0;row<2;row++)for(let col=0;col<3;col++){
          box(x-.65+col*.65,1.28+row*.9,-11.8,.53,.48,.65,'#c2a682');
          box(x-.65+col*.65,1.29+row*.9,-11.46,.28,.15,.02,'#f1ebd9');
        }
      }
      // The entire reception-facing stockroom wall is the company display.
      displayPanel(13.8,1.7,-6.759,8.11,2.96,0,
        ['LITTLE OFFICE','\uC6B0\uB9AC\uC758 \uC791\uC740 \uD68C\uC0AC','EVERYDAY, TOGETHER']);
      // Across the lobby: platform showcase and two working demo touchscreens.
      box(8.4,2.05,8,.18,2.2,5.8,'#263e3b');
      displayPanel(8.51,2.05,8,5.5,1.9,Math.PI/2,
        ['OUR PLATFORMS','\uC5F0\uACB0\uB418\uB294 \uC77C\uC0C1, \uB354 \uB098\uC740 \uC5C5\uBB34','CUSTOMER PORTAL  /  DATA  /  AUTOMATION']);
      for(const z of [5.25,7.6]){
        const x=17.35;
        box(x,.3,z,.9,.18,1.8,'#566c64');
        box(x,.62,z,.38,.55,1.5,'#6a8178');
        box(x,1.88,z,.32,2.65,1.65,'#263e3b');
        displayPanel(x-.17,1.9,z,1.48,2.45,-Math.PI/2,platformPages[0],true);
        label('PLATFORM EXPERIENCE',x,3.5,z,'#527b71',.24);
      }
      plant(17,10.8,.9);
      label('LOBBY',15,0.4,1.6,'#aa8b98',0.56);
    }
    if(floor===1){box(4,1.4,10.8,4,1.8,0.1,'#fbf5f8');label('PROJECT BOARD',4,1.5,10.65,'#aa8b9e',0.45);}
    if(floor===2){box(12.5,0.1,-7,4.6,0.1,7,'#a8b99a');[11.3,14].forEach(x=>[-9,-6,-4].forEach(z=>plant(x,z,1.1)));box(12.5,0.45,-7,2,0.6,0.7,'#cdb6a5');label('SKY GARDEN',12.5,2,-10,'#84997a',0.5);}
    if(floor===1){box(4,0.5,8,3,0.8,1,'#c9b2c5');box(4,0.9,8.5,3,0.6,0.2,'#c9b2c5');}
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
  // Restrooms occupy the unused west edge, clear of desks and the main corridor.
  RESTROOMS.forEach(room=>{
    const {x,z,color}=room;
    box(x,0.12,z,3.5,0.14,3.8,'#e3e1dc');
    for(let dx=-1.5;dx<=1.5;dx+=0.5)box(x+dx,0.2,z,0.015,0.012,3.7,'#d0cec9');
    for(let dz=-1.5;dz<=1.5;dz+=0.5)box(x,0.2,z+dz,3.4,0.012,0.015,'#d0cec9');
    box(x-1.75,1.45,z,0.12,2.9,3.8,'#e5ddda');
    [-1,1].forEach(side=>box(x,1.45,z+side*1.9,3.5,2.9,0.12,'#e5ddda'));
    [-1,1].forEach(side=>box(x+1.75,1.45,z+side*1.25,0.12,2.9,1.3,'#e5ddda'));
    box(x+1.75,2.68,z,0.14,0.44,1.2,color);
    box(x+1.75,1.12,z+0.46,0.1,2.2,0.28,'#c7b6b6');
    box(x+1.83,1.15,z-0.28,0.07,0.28,0.045,'#8d7e87');
    // Two private cubicles, wash basin, mirror and hand dryer.
    box(x-0.35,1.05,z,2.6,2.1,0.08,'#c9ceca');
    [-0.92,0.92].forEach(dz=>{
      box(x-1.25,0.72,z+dz,0.38,0.78,0.6,'#f6f5f0');
      sphere(x-0.8,0.45,z+dz,0.36,'#faf9f5',scene,[1.3,0.65,0.9]);
      box(x-0.08,1.05,z+dz,0.08,2.05,1.7,'#cbd2cd');
    });
    box(x+0.9,0.72,z-1.35,0.85,1.05,0.68,'#b9aaa1');
    box(x+0.9,1.29,z-1.35,0.95,0.12,0.75,'#f5f3ec');
    sphere(x+0.9,1.35,z-1.35,0.25,'#c9d0cf',scene,[1,0.15,0.8]);
    box(x+0.9,1.55,z-1.62,0.045,0.4,0.045,'#9b9b9e');
    box(x+0.9,2,z-1.8,0.85,0.8,0.05,'#bacbd0');
    box(x+1.55,1.5,z+1.5,0.2,0.4,0.3,'#f2eee9');
    label(room.name,x,3.15,z-0.3,color,0.48);
    label(room.sign,x+1.8,2.8,z,color,0.28);
  });
  const frostedPrivacy=new THREE.MeshPhysicalMaterial({color:'#d8e4df',transparent:true,opacity:.58,roughness:.95,metalness:0,depthWrite:false,side:THREE.DoubleSide});
  for(const floor of [0,1,2]){
    const before=new Set(scene.children);
    // Empty vestibule: a continuous frosted screen with entry from the south end.
    box(-12.3,1.4,-7.8,.07,2.8,9.3,frostedPrivacy).castShadow=false;
    [-12.45,-8,-3.15].forEach(z=>box(-12.3,1.4,z,.1,2.9,.09,'#8d9e95'));
    [.12,2.85].forEach(y=>box(-12.3,y,-7.8,.11,.06,9.4,'#8d9e95'));
    [1.05,1.3,1.55].forEach(y=>box(-12.24,y,-7.8,.02,.055,9.2,'#ebf0e9'));
    label('RESTROOMS',-13.1,2.6,-2.8,'#7d9185',.34);
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
  remodelOffice({scene,box,sphere,label,plant,departmentObjects,employees:sim.employees});
  const eventProps=[];
  {
    const before=new Set(scene.children);
    const cake=new THREE.Group();scene.add(cake);
    box(4,.55,7,1.3,.1,.7,'#b79b7e',cake);box(4,.3,7,.12,.5,.12,'#617566',cake);
    box(4,.7,7,.6,.2,.45,'#e5cbbb',cake);box(4,.82,7,.62,.06,.47,'#faf0db',cake);
    [-.15,0,.15].forEach(dx=>{box(4+dx,.94,7,.035,.18,.035,'#b49da8',cake);sphere(4+dx,1.05,7,.03,'#e8bd6c',cake);});
    eventProps.push({object:cake,kind:'party'});
    const launch=label('PRODUCT LAUNCH',4,2.6,10.5,'#e0e9db',.5);eventProps.push({object:launch,kind:'launch'});
    departmentObjects.push({floor:1,objects:scene.children.filter(o=>!before.has(o))});
  }
  // Common shell and furniture are shared by each floor in the exploded building view.
  const floorSpecific=new Set([...departmentObjects.flatMap(d=>d.objects),...floorLabels.map(d=>d.sprite)]);
  const sharedObjects=scene.children.filter(o=>!o.isLight&&!floorSpecific.has(o));
  const overviewFloors=[0,1,2].map(floor=>{const group=new THREE.Group();group.position.y=floor*11;group.visible=false;sharedObjects.forEach(o=>group.add(o.clone(true)));group.traverse(o=>o.userData.overviewFloor=floor);scene.add(group);return group;});
  departmentObjects.forEach(d=>d.objects.forEach(o=>o.userData.floorBaseY=o.position.y));
  floorLabels.forEach(d=>d.sprite.userData.floorBaseY=d.sprite.position.y);
  const overviewTitles=FLOOR_NAMES.map((name,floor)=>{const sprite=label(name,-12,floor*11+1.2,-14.5,'#805e76',0.9);sprite.visible=false;return sprite;});
  let overviewWasActive=false;
  function speech(e){const c=document.createElement('canvas');c.width=512;c.height=176;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:true,depthWrite:false}));sprite.scale.set(2.65,0.91,1);sprite.position.y=2.05+(e.seat%2)*0.28;sprite.renderOrder=10;
    let previous='';return {sprite,update(){const key=e.state+'-'+e.meetingKind+'-'+(e.elevatorRide?'riding':e.path[0]?.length===3?'waiting':'');if(key===previous)return;previous=key;ctx.clearRect(0,0,512,176);ctx.fillStyle='#fff9fc';ctx.strokeStyle=e.role==='팀장'?'#be8aab':'#dfc8d6';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(5,4,502,145,25);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(239,148);ctx.lineTo(256,171);ctx.lineTo(273,148);ctx.fill();ctx.fillStyle=DEPTS[e.dept]?.color||'#88667f';ctx.font='600 29px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillText(`${e.name}${e.role==='팀원'?'':` · ${e.role}`}`,256,54);ctx.fillStyle='#685362';ctx.font='800 31px "Malgun Gothic",sans-serif';ctx.fillText(e.elevatorRide?'\uC5D8\uB9AC\uBCA0\uC774\uD130 \uD0D1\uC2B9 \uC911':e.path[0]?.length===3?'\uC5D8\uB9AC\uBCA0\uC774\uD130 \uB300\uAE30 \uC911':e.meetingKind==='leadership'&&e.state==='회의 중'?'대표·팀장 회의 중':e.state,256,108,465);tex.needsUpdate=true;}};
  }
  function makeAvatar(e){
    const group=new THREE.Group(),body=new THREE.Group(),a=e.appearance;group.add(body);body.scale.set(a.build,a.height,1);
    box(0,0.88,0,0.48,0.61,0.32,a.top,body);
    // Collars, jacket lapels and individual accessories.
    box(0,1.11,0.17,0.2,0.15,0.035,'#f9efeb',body);
    if(e.suited){box(0,.96,.18,.24,.4,.035,'#f1f2ec',body);[-1,1].forEach(side=>{const lapel=box(side*.12,1,.205,.11,.3,.035,a.top,body);lapel.rotation.z=side*.3;});box(.46,.58,.02,.2,.34,.42,'#4c4541',body);}
    if(e.role!=='팀원'){box(0,0.94,0.19,0.06,0.28,0.035,'#775773',body);box(-0.18,1.02,0.18,0.07,0.07,0.03,'#d8b985',body);}
    else if(a.accessory===0){box(0,0.99,0.19,0.04,0.31,0.03,'#dac2d3',body);box(0,0.79,0.19,0.14,0.16,0.025,'#faf0f4',body);}
    else if(a.accessory===2){box(0,1.13,0,0.52,0.12,0.4,'#e9d2c7',body);}
    sphere(0,1.42,0,0.25,a.skin,body,[1,1.08,0.95]);
    [-1,1].forEach(s=>{sphere(s*0.25,1.42,0,0.06,a.skin,body);sphere(s*0.085,1.43,0.222,0.021,'#44313e',body);});sphere(0,1.36,0.245,0.035,a.skin,body,[1,1,0.8]);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(0.263,14,10,0,Math.PI*2,0,Math.PI*0.5),mat(a.hair));hair.position.y=1.47;body.add(hair);
    if(a.style===0){box(-0.1,1.59,0.2,0.29,0.16,0.12,a.hair,body);}
    if(a.style===1){box(0,1.35,-0.14,0.5,0.43,0.2,a.hair,body);[-1,1].forEach(s=>box(s*0.23,1.38,0.01,0.08,0.3,0.2,a.hair,body));}
    if(a.style===2){sphere(0,1.62,-0.24,0.16,a.hair,body);}
    if(a.style===3){for(let i=0;i<7;i++)sphere(Math.cos(i)*0.18,1.63+Math.sin(i*2)*0.04,Math.sin(i)*0.15,0.11,a.hair,body);}
    if(a.style===4){box(0.12,1.63,0.08,0.24,0.2,0.23,a.hair,body);sphere(0,1.32,-0.28,0.14,a.hair,body,[0.8,1.8,1]);}
    if(a.style===5){box(0,1.69,0,0.52,0.12,0.4,a.top,body);box(0,1.63,0.22,0.52,0.05,0.24,a.top,body);}
    if(a.glasses){[-0.1,0.1].forEach(x=>{const rim=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.013,5,14),mat('#654d63'));rim.position.set(x,1.44,0.24);body.add(rim);});box(0,1.44,0.245,0.05,0.015,0.02,'#654d63',body);}
    if(a.accessory===3){sphere(-0.29,1.42,0,0.07,'#8e7699',body);sphere(0.29,1.42,0,0.07,'#8e7699',body);}
    const legs=[],arms=[];
    [-1,1].forEach(s=>{const leg=new THREE.Group();leg.position.set(s*0.13,0.57,0);body.add(leg);box(0,-0.26,0,0.18,0.5,0.22,a.trousers,leg);box(0,-0.49,0.055,0.2,0.1,0.32,e.id%2?'#f7edee':'#61535f',leg);legs.push(leg);
      const arm=new THREE.Group();arm.position.set(s*0.31,1.1,0);body.add(arm);box(0,-0.18,0,0.14,0.35,0.19,a.top,arm);sphere(0,-0.4,0,0.083,a.skin,arm);arms.push(arm);});
    const cargo=new THREE.Group();body.add(cargo);
    for(let i=0;i<5;i++){const parcel=box((i%2)*.32-.16,.62+Math.floor(i/2)*.22,.43,.35,.21,.3,'#c59c70',cargo);box(parcel.position.x,parcel.position.y+.11,.43,.08,.015,.3,'#e7d2ad',cargo);}
    const receipt=box(0,.85,.42,.36,.48,.025,'#fff8e9',body);
    const cart=new THREE.Group();body.add(cart);
    box(0,.26,1.55,1.45,.15,1.4,'#456b82',cart);
    for(const side of [-1,1]){
      box(side*.6,.78,.92,.065,1,.065,'#8d9eaa',cart);
      for(const z of [1.05,2.05])sphere(side*.56,.13,z,.13,'#3d454b',cart,[1,1,.65]);
    }
    box(0,1.27,.92,1.25,.07,.07,'#596975',cart);
    const bubble=speech(e);group.add(bubble.sprite);group.traverse(o=>o.userData.employee=e);scene.add(group);return {group,body,legs,arms,bubble,cargo,receipt,cart,employee:e};
  }
  const avatars=sim.employees.map(makeAvatar);
  const receivedParcels=new THREE.Group();scene.add(receivedParcels);
  const deskParcels=new Map();
  for(let i=0;i<5;i++){
    const x=15.3+(i%2)*.72,y=.48+Math.floor(i/2)*.57,z=-3;
    box(x,y,z,.68,.55,.58,'#c59c70',receivedParcels);box(x,y+.28,z,.12,.02,.58,'#e7d2ad',receivedParcels);
  }
  let tracked=null;
  const previousTarget=new THREE.Vector3();
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
  const pointerDown=e=>{down=e.button===0?[e.clientX,e.clientY]:null;};
  const pointerUp=e=>{if(e.button!==0||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(avatars.filter(a=>a.group.visible).map(a=>a.group),true).filter(h=>h.object.userData.employee?.visible&&(sim.buildingOverview||h.object.userData.employee.floor===sim.activeFloor));if(hits[0]){onSelect(hits[0].object.userData.employee.id);return;}if(!sim.buildingOverview&&sim.activeFloor===0){const demo=ray.intersectObjects(demoScreens)[0];if(demo){demo.object.userData.platformDemo();return;}}if(sim.buildingOverview){const floors=ray.intersectObjects(overviewFloors,true);if(floors[0]){sim.activeFloor=floors[0].object.userData.overviewFloor;sim.buildingOverview=false;}};};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
  function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  return {render(time){
    for(const e of sim.visitors)if(!avatars.some(a=>a.employee===e))avatars.push(makeAvatar(e));
    for(let i=avatars.length-1;i>=0;i--)if(!sim.employees.includes(avatars[i].employee)&&!sim.visitors.includes(avatars[i].employee)){const removed=avatars.splice(i,1)[0];scene.remove(removed.group);removed.group.traverse(o=>{o.geometry?.dispose();if(o.material?.map){o.material.map.dispose();o.material.dispose();}});}
    const overview=!!sim.buildingOverview;
    const deliveredPackages=(sim.deliveries||[]).flatMap(d=>d.packages||[]).filter(p=>p.status==='완료');
    for(const [pack,prop] of deskParcels)if(!deliveredPackages.includes(pack)){scene.remove(prop.group);prop.group.traverse(o=>o.geometry?.dispose());deskParcels.delete(pack);}
    for(const pack of deliveredPackages){
      const recipient=sim.employees.find(e=>e.id===pack.recipient);if(!recipient)continue;
      if(!deskParcels.has(pack)){
        const group=new THREE.Group();scene.add(group);
        box(0,0,0,.68,.55,.58,'#c59c70',group);box(0,.28,0,.12,.02,.58,'#e7d2ad',group);
        deskParcels.set(pack,{group});
      }
      const {group}=deskParcels.get(pack);group.position.set(recipient.home[0]-.48,1.25+(overview?recipient.homeFloor*11:0),recipient.home[1]+Math.cos(recipient.facing)*.75);group.visible=overview||sim.activeFloor===recipient.homeFloor;
    }
    const receivedCount=(sim.deliveries||[]).reduce((sum,d)=>sum+(d.receivedCount||0),0);
    receivedParcels.visible=receivedCount>0&&(overview||sim.activeFloor===0);receivedParcels.children.forEach((o,index)=>o.visible=Math.floor(index/2)<receivedCount);
    if(overview!==overviewWasActive){overviewWasActive=overview;if(overview)sim.followId=null;controls.maxDistance=overview?130:85;controls.target.set(0,overview?11:0,0);camera.position.set(...(overview?[48,52,65]:initial));}
    overviewTitles.forEach(sprite=>sprite.visible=overview);overviewFloors.forEach(group=>group.visible=overview);sharedObjects.forEach(o=>o.visible=!overview);
    const followed=[...sim.employees,...sim.visitors].find(e=>e.id===sim.followId&&e.visible);
    if(followed){sim.activeFloor=followed.floor;const target=new THREE.Vector3(followed.pos[0],0,followed.pos[1]);if(tracked!==followed.id){tracked=followed.id;previousTarget.copy(controls.target);camera.position.copy(controls.target.clone().add(camera.position.clone().sub(controls.target).normalize().multiplyScalar(30)));}const next=previousTarget.clone().lerp(target,0.08);camera.position.add(next.clone().sub(controls.target));controls.target.copy(next);previousTarget.copy(next);}else{sim.followId=null;tracked=null;}
    const evening=Math.min(1,time/1100);sun.color.setRGB(1,0.96-evening*0.22,0.92-evening*0.3);sun.intensity=2.2-evening*.65;floorLabels.forEach(d=>{d.sprite.visible=overview||d.floor===sim.activeFloor;d.sprite.position.y=d.sprite.userData.floorBaseY+(overview?d.floor*11:0);});
    departmentObjects.forEach(d=>d.objects.forEach(o=>{o.visible=overview||d.floor===sim.activeFloor;o.position.y=o.userData.floorBaseY+(overview?d.floor*11:0);}));
    const lift=sim.elevator??{floor:0,position:0,phase:'idle',passengers:[]};
    for(const portal of elevatorPortals){
      const opening=lift.floor===portal.floor&&['opening','open','closing'].includes(lift.phase);
      const amount=opening?(lift.phase==='opening'?1-lift.remaining/.7:lift.phase==='closing'?lift.remaining/.7:1):0;
      portal.leaves.forEach(({mesh,side})=>mesh.position.x=side*(.46+Math.max(0,amount)*.9));
      const progress=lift.phase==='moving'?Math.abs(lift.position-lift.floor):0;
      portal.indicator.material.color.set(lift.phase==='moving'?'#d4a461':opening?'#77c9a5':'#63796b');
      const floorText=`${Math.round(lift.position)+1}F${lift.phase==='moving'?(lift.target>lift.position?' \u2191':' \u2193'):''}`;
      if(portal.text!==floorText){
        portal.text=floorText;
        const canvas=portal.indicator.material.map.image,ctx=canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);ctx.font='600 38px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillStyle='#a7ddc9';ctx.fillText(floorText,256,62);
        portal.indicator.material.map.needsUpdate=true;
      }
      portal.indicator.scale.y=.3*(1+progress*.2);
    }
    liftCar.visible=overview;liftCar.position.y=lift.position*11;
    eventProps.forEach(prop=>prop.object.visible=(overview||sim.activeFloor===1)&&sim.events.some(event=>event.kind===prop.kind&&event.venue==='project'&&['이동 중','진행 중'].includes(event.status)));
    entranceDoors.forEach(d=>{const nearby=[...sim.employees,...sim.visitors].some(e=>e.visible&&e.floor===0&&Math.hypot(e.pos[0]-ENTRY[0],e.pos[1]-ENTRY[1])<2.4);d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,.15);d.group.position.z=ENTRY[1]-d.open*1.9;});
    storageDoors.forEach(door=>{
      const nearby=sim.employees.some(e=>e.visible&&e.floor===0&&Math.hypot(e.pos[0]-9.6,e.pos[1]+9.45)<2);
      door.position.z=THREE.MathUtils.lerp(door.position.z,nearby?-8:-9.45,.15);
    });
    lobbyDoors.forEach(d=>{const nearby=[...sim.employees,...sim.visitors].some(e=>e.visible&&e.floor===0&&Math.hypot(e.pos[0]-LOBBY.door[0],e.pos[1]-LOBBY.door[1])<2);d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,0.15);d.group.position.z=LOBBY.door[1]-d.open*2.4;});
    doors.forEach(d=>{const nearby=[...sim.employees,...sim.visitors].some(e=>e.visible&&e.floor===(d.floor??sim.activeFloor)&&Math.abs(e.pos[0]-d.x)<1.6&&Math.abs(e.pos[1]-3.5)<2.1);d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,0.15);d.group.position.x=d.x+d.open*1.4;});
    avatars.forEach((a,i)=>{const e=a.employee,moving=e.path.length>0;const home=Math.hypot(e.pos[0]-e.home[0],e.pos[1]-e.home[1])<0.1;const seated=!moving&&!e.carrying&&(home||['회의 중','회의 대기','면접 중','외부 미팅 중','외부 미팅 대기','라운지에서 대기 중','방문 목적 설명 중','영업 담당자 기다리는 중'].includes(e.state));
      a.receipt.visible=e.carrying==='영수증';a.cargo.visible=!!e.carrying&&!a.receipt.visible;const count=typeof e.carrying==='number'?e.carrying:1;a.cargo.children.forEach((o,index)=>o.visible=Math.floor(index/2)<count);
      a.cart.visible=e.role==='배송 기사';
      if(e.role==='배송 기사'){a.cargo.position.set(0,-.25,.87);a.cargo.scale.set(1.75,1.75,1.75);}else{a.cargo.scale.set(1.7,1.7,1.7);a.cargo.position.set(0,-.28,-.04);}
      a.group.visible=e.visible&&!e.elevatorRide&&e.restroom?.phase!=='using'&&(overview||e.floor===sim.activeFloor);if(!a.group.visible)return;a.group.position.set(e.pos[0],(overview?e.floor*11:0)+(moving?Math.sin(time*10+i)*0.035:0),e.pos[1]);a.bubble.sprite.visible=!overview;
      if(moving){const p=e.path[0];a.body.rotation.y=Math.atan2(p[0]-e.pos[0],p[1]-e.pos[1]);}
      else if(['picking','stocking'].includes(e.supplyTask?.phase))a.body.rotation.y=e.supplyTask.phase==='picking'?Math.PI:e.supplyTask.kind==='paper'?-Math.PI/2:0;
      else if(e.documentTask?.phase==='working')a.body.rotation.y=-Math.PI/2;
      else if(home)a.body.rotation.y=e.facing;
      else if(e.state==='회의 참관 중')a.body.rotation.y=0;
      else if(['라운지에서 대기 중','방문 목적 설명 중','영업 담당자 기다리는 중'].includes(e.state))a.body.rotation.y=Math.PI;
      else if(e.state==='손 씻는 중')a.body.rotation.y=Math.PI;
      else if(e.state==='커피 마시는 중')a.body.rotation.y=e.pos[1]<7?0:Math.PI;
      else if(['회의 중','회의 대기','면접 중','외부 미팅 중','외부 미팅 대기','라운지에서 대기 중','방문 목적 설명 중','영업 담당자 기다리는 중'].includes(e.state)){const cx=ROOMS.find(r=>Math.abs(r.x-e.pos[0])<3.8)?.x??0;const seat=e.meetingSeat??e.seat;a.body.rotation.y=seat===5?0:seat===4?Math.PI:(e.pos[0]<cx?Math.PI/2:-Math.PI/2);}
      a.body.position.y=seated?-0.12:0;a.legs.forEach((l,j)=>{l.rotation.x=seated?-1.35:moving?Math.sin(time*10+j*Math.PI)*0.5:0;});a.arms.forEach((arm,j)=>{arm.rotation.x=(e.documentTask?.phase==='working'||['picking','stocking'].includes(e.supplyTask?.phase))?-1+Math.sin(time*5+j)*.15:moving?Math.sin(time*10+j*Math.PI+Math.PI)*0.4:e.state==='손 씻는 중'?-0.9+Math.sin(time*6+j)*0.1:seated?-0.65+Math.sin(time*5+j)*0.06:Math.sin(time*1.7+i)*0.04;});a.bubble.update();
    });controls.update();renderer.render(scene,camera);
  },reset(){sim.followId=null;camera.position.set(...(sim.buildingOverview?[48,52,65]:initial));controls.target.set(0,sim.buildingOverview?11:0,0);},dispose(){observer.disconnect();canvas.removeEventListener('mousedown',preventMiddleScroll);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);controls.dispose();const allMaterials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)allMaterials.add(o.material);});allMaterials.forEach(m=>{m.map?.dispose();m.dispose();});renderer.dispose();}};
}
