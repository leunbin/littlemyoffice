import * as THREE from 'three';
import {remodelOffice} from './interiors.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {DEPTS,DEPARTMENT_LAYOUT,DEPT_FLOORS,FLOOR_NAMES} from './simulation.js';
import {BOARDROOM,BOARDROOM_SEATS,CHAIRMAN_OFFICE,CEO_HOME,PANTRY_ROOM,pantryPositionForFloor,floorLevel,elevatorDoor,elevatorQueuePoint,ENTRANCE_HALL,STOCKROOM,STAFF_ROOM,CAFE,DIETITIAN_OFFICE,CAFETERIA,CAFETERIA_SEATS,TEAM_CENTERS,TEAM_SEATS,ROOM_SEATS,ROOMS,LOBBY,RESTROOMS,ENTRY} from './layout.js';

export function createOffice(canvas,sim,onSelect){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#e9ece7');renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.fog=new THREE.Fog('#e9ece7',80,130);
  const camera=new THREE.PerspectiveCamera(36,1,0.1,180);const initial=[45,43,49];camera.position.set(...initial);
  const controls=new OrbitControls(camera,canvas);controls.target.set(6,0,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.35;controls.minDistance=20;controls.maxDistance=85;controls.maxAzimuthAngle=Math.PI/2;controls.minAzimuthAngle=-Math.PI/2;
  controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.PAN,RIGHT:THREE.MOUSE.PAN};
  controls.screenSpacePanning=false;controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;
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
  DEPTS.forEach((dept,i)=>{const before=new Set(scene.children);const x=sim.employees.find(e=>e.dept===i&&e.role==='팀장').home[0],offset=DEPARTMENT_LAYOUT[i].zOffset;
    box(x,.23,-7.5+offset,5.6,.04,10,'#d7dbd0');
    // A ceiling-hung department sign above the entrance.
    [-1,1].forEach(side=>box(x+side*1.05,3.65,-2.3+offset,.035,1.1,.035,'#707974'));
    box(x,3.08,-2.3+offset,3.4,.64,.14,'#faf8f1');
    label(dept.name,x,3.09,-2.2+offset,dept.color,.54);
    // Four staff share a face-to-face island; the team lead sits at a separate desk.
    sim.employees.filter(e=>e.dept===i).forEach(e=>desk(...e.home,dept.color,e.facing,e.role==='팀장'));
    label('TEAM LEAD',x,0.29,-8.95+offset,'#a37a8c',0.29);
    sim.employees.filter(e=>e.dept===i).forEach(e=>{box(e.home[0]+0.45,1.08,e.home[1]+Math.cos(e.facing)*0.75,0.16,0.2,0.16,e.id%2?'#b7c6a3':'#d8b8ca');});

    departmentObjects.push({floor:DEPT_FLOORS[i],objects:scene.children.filter(o=>!before.has(o))});
  });
  label('LITTLE OFFICE  /  EVERYDAY, TOGETHER',0,0.35,1.1,'#b0909e',0.7);label('출입구 →',16.3,0.5,-0.6,'#b38599',0.46);
  const glass=new THREE.MeshPhysicalMaterial({color:'#e7d5e1',transparent:true,opacity:0.17,roughness:0.12,metalness:0.05,depthWrite:false,side:THREE.DoubleSide});
  const storageDoors=[];
  const doors=[];const entranceDoors=[];const floorLabels=[];
  function glassWall(x,z,width,depth){const isSide=depth>width;box(x,1.45,z,width,2.9,depth,glass).castShadow=false;box(x,0.12,z,isSide?0.12:width,0.15,isSide?depth:0.12,'#a28d9e');box(x,2.92,z,isSide?0.1:width,0.09,isSide?depth:0.1,'#a28d9e');if(isSide){[-1,1].forEach(s=>box(x,1.45,z+s*depth/2,0.09,2.9,0.09,'#ae98a7'));}else{[-1,1].forEach(s=>box(x+s*width/2,1.45,z,0.09,2.9,0.09,'#ae98a7'));}}
  function roomShell(r,index,floor){const x=r.x;box(x,0.12,7.4,7.6,0.1,7.8,index===3?'#ead8cf':'#e6dbe3');box(x,0.18,7.4,7.3,0.03,7.5,index===3?'#f1e5dd':'#f1e8ed');glassWall(x-3.8,7.4,0.055,7.8);glassWall(x+3.8,7.4,0.055,7.8);glassWall(x,11.3,7.6,0.055);
    glassWall(x-0.95,3.5,5.7,0.055);glassWall(x+3.55,3.5,0.5,0.055);
    const door=new THREE.Group();door.position.set(x+2.6,0,3.5);scene.add(door);box(0,1.45,0,1.35,2.9,0.07,glass,door).castShadow=false;[-0.67,0.67].forEach(dx=>box(dx,1.45,0,0.06,2.9,0.08,'#a28d9e',door));box(0,2.9,0,1.4,0.07,0.1,'#a28d9e',door);box(-0.43,1.2,-0.09,0.05,0.36,0.07,'#8d7084',door);doors.push({group:door,x:x+2.6,open:0});
    label(index===2?(floor===0?'탕비실':'프로젝트룸'):r.name,x-0.5,2.32,3.4,'#96788b',0.63);label(index<2?'MEETING ROOM':index===2?'SHARED SPACE':'PANTRY & LOUNGE',x,0.48,11.7,'#b398a8',0.35);
  }
  for(const floor of [0,1]){
    const before=new Set(scene.children);
    ROOMS.forEach((room,index)=>{if(index!==3){roomShell(room,index,floor);doors.at(-1).floor=floor;}});
    ROOMS.slice(0,2).forEach((r,i)=>{
      box(r.x,.94,7.2,2.25,.15,3.7,'#b49a78');box(r.x,.47,7.2,.6,.88,2.6,'#78857d');
      ROOM_SEATS[i].forEach(([x,z],n)=>chair(x,z,'#727e76',n===5?0:n===4?Math.PI:x<r.x?Math.PI/2:-Math.PI/2));
      box(r.x,1.7,11.18,2.8,1.4,.08,'#fdf7fa');plant(r.x-2.8,10.25,.7);
    });
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
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
  for(let floor=0;floor<3;floor++){const objects=pantryObjects.map(o=>{const copy=o.clone(true);const [x,z]=pantryPositionForFloor([copy.position.x,copy.position.z],floor);copy.position.x=x;copy.position.z=z;if(floor!==0){copy.scale.x*=PANTRY_ROOM.scale;copy.scale.z*=PANTRY_ROOM.scale;}scene.add(copy);return copy;});departmentObjects.push({floor,objects});}

  const floorY=floor=>(floor===3?-1:floor)*11;
  const elevatorPortals=[];
  for(let floor=0;floor<4;floor++)for(let index=0;index<2;index++){
    const before=new Set(scene.children);
    const [portalX,portalZ]=elevatorDoor(index);
    const rotation=0;
    const elevator=new THREE.Group();elevator.position.set(portalX,0,portalZ);elevator.rotation.y=rotation;scene.add(elevator);
    box(0,1.4,0,2.6,2.8,.2,'#344a43',elevator);
    const leaves=[-1,1].map(side=>({side,mesh:box(side*.46,1.35,.15,.89,2.5,.1,'#c6cfca',elevator)}));
    box(0,2.95,.05,.8,.24,.15,'#485951',elevator);
    const indicator=label(`${index+1} / 1F`,portalX+Math.sin(rotation)*.22,3.25,portalZ+Math.cos(rotation)*.22,'#63796b',.3);
    elevatorPortals.push({floor,index,leaves,indicator,open:0});
    {
      const cabinZ=portalZ-1.2;
      box(portalX,.1,cabinZ,3,.2,2.4,'#6f9388');
      for(const side of [-1,1])box(portalX+side*1.5,1.5,cabinZ,.12,3,2.4,'#b4c2b7');
      box(portalX,1.5,portalZ-2.4,3,3,.12,'#9bb7ac');
    }
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
  const liftCars=[0,1].map(index=>{
    const car=new THREE.Group();scene.add(car);
    const [x,doorZ]=elevatorDoor(index),z=doorZ-1.2;
    box(x,.15,z,2.8,.25,2.2,'#6f9388',car);
    box(x,2.85,z,2.8,.12,2.2,'#6f9388',car);
    departmentObjects.push({floor:-1,objects:[car]});return car;
  });
  [-7,0,7].forEach(x=>{box(x,0.65,-12.3,2,1.1,0.1,'#d6b5c5');label('IDEAS · CREATE',x,1.7,-12.2,'#876a83',0.32);});
  [1,2].forEach(i=>plant(-17,5+i*2,0.8));
  const concrete=new THREE.MeshStandardMaterial({color:'#b6b8b1',roughness:.96});
  function hallDoor(x,z,floor,rotation=0,gateWidth=4.8,gateHeight=3.4){
    const gate=new THREE.Group();gate.position.set(x,0,z);gate.rotation.y=rotation;scene.add(gate);
    const leafWidth=gateWidth/2;
    for(const side of [-1,1]){
      const leaf=new THREE.Group(),baseZ=side*leafWidth/2;leaf.position.set(0,0,baseZ);gate.add(leaf);
      box(0,gateHeight/2,0,.09,gateHeight,leafWidth,glass,leaf).castShadow=false;
      for(const edge of [-1,1])box(0,gateHeight/2,edge*leafWidth/2,.12,gateHeight,.06,'#627f6b',leaf);
      for(const y of [.08,gateHeight])box(0,y,0,.12,.08,leafWidth,'#627f6b',leaf);
      box(-.1,1.4,-side*(leafWidth/2-.2),.07,.65,.06,'#627f6b',leaf);
      entranceDoors.push({group:leaf,floor,x,z,baseZ,side,travel:leafWidth,open:0});
      box(0,gateHeight/2,side*(gateWidth/2+.08),.2,gateHeight,.12,'#627f6b',gate);
    }
    box(0,gateHeight+.08,0,.24,.16,gateWidth+.28,'#627f6b',gate);
  }
  for(let floor=0;floor<4;floor++){
    const before=new Set(scene.children),hall=ENTRANCE_HALL.bounds,hallX=(hall.left+hall.right)/2,hallZ=(hall.front+hall.back)/2;
    box(hallX,-.34,hallZ,12,.68,hall.back-hall.front,'#ceb9b3');
    box(hallX,.13,hallZ,12,.1,hall.back-hall.front,floor===0?'#e7e2d8':'#dedfd4');
    for(let x=hall.left+.8;x<hall.right;x+=1.6)box(x,.186,hallZ,.018,.012,hall.back-hall.front,'#c5c4b9');
    // Both shafts share one concrete wall on every floor.
    for(const [start,end] of [[18,19.8],[22.8,23.8],[26.8,30]]){
      box((start+end)/2,1.7,hall.front,end-start,3.4,.3,concrete);
      for(let x=start+.8;x<end;x+=1.6)box(x,1.7,hall.front+.155,.018,3.35,.012,'#9c9f99');
    }
    for(const x of ENTRANCE_HALL.liftXs){
      for(const side of [-1,1])box(x+side*1.4,1.4,hall.front,.2,2.8,.3,concrete);
      box(x,3.1,hall.front,3,.6,.3,concrete);
    }
    box(hallX,.194,.2,12,.016,1.1,'#d4c5ac');
    for(const index of [0,1])for(let slot=0;slot<12;slot++){
      const [x,z]=elevatorQueuePoint(index,slot);box(x,.205,z,.4,.016,.38,'#a6b5a6');
    }
    if(floor===0)box(hallX,1.7,hall.back,12,3.4,.3,concrete);
    else if(floor!==3)glassWall(hallX,PANTRY_ROOM.back,12,.08);
    label(`${floor===3?'B1':floor+1+'F'} / ELEVATORS`,23.3,3.6,hall.front+.3,'#547660',.58);
    // Every floor shares the same entrance between the main workspace and lift hall.
    const [officeDoorX,officeDoorZ]=ENTRANCE_HALL.companyDoor;
    const jambOutside=4.8/2+.14;
    const partitionBack=floor===CAFE.floor?CAFE.bounds.front:13;
    // Continue to the original office edge, including the area behind the lift hall.
    for(const [start,end] of [[-13,officeDoorZ-jambOutside],[officeDoorZ+jambOutside,partitionBack]])box(officeDoorX,1.9,(start+end)/2,.25,3.8,end-start,concrete);
    box(officeDoorX,3.65,officeDoorZ,.25,.3,4.8+.28,concrete);hallDoor(officeDoorX,officeDoorZ,floor);
    if(floor===CAFE.floor){
      // Complete the landing's outer wall while keeping the cafe glazing and side door.
      box(hall.right,1.7,(hall.front+CAFE.bounds.front)/2,.3,3.4,CAFE.bounds.front-hall.front,concrete);
      box(officeDoorX,1.9,(CAFE.bounds.back+13)/2,.25,3.8,13-CAFE.bounds.back,concrete);
    }
    if(floor===0){
      // A generous public hall and lounge, screened from the existing office.
      for(const [start,end] of [[hall.front,4.6],[9.4,hall.back]])box(30,1.7,(start+end)/2,.3,3.4,end-start,concrete);
      hallDoor(...ENTRANCE_HALL.streetDoor,floor);
      label('MAIN ENTRANCE',30,4,7,'#547660',.5);
      label('WELCOME / LOUNGE',23,3.5,3.5,'#547660',.65);
      const [rx,rz]=LOBBY.reception;
      box(rx,.65,rz,3.3,1.3,1.15,'#b899a5');box(rx,1.34,rz,3.45,.12,1.25,'#f5eadd');
      box(rx+.6,1.72,rz-.54,.975,.6,.12,'#736473');chair(...LOBBY.staff,'#8f9f9a',Math.PI);
      box(rx-.7,1.47,rz,.55,.16,.42,'#716975');box(rx+.6,1.37,rz,.6,.035,.2,'#efe7e6');
      label('INFORMATION',rx,2.2,rz,'#8c687d',.5);
      const [lx,lz]=LOBBY.loungeCenter;
      box(lx,.48,lz,4,.7,1.25,'#bda0b1');box(lx,.94,lz-.55,4,.8,.2,'#bda0b1');
      box(lx,.43,lz+1.9,2,.13,1.2,'#d2b9a0');box(lx,.2,lz+1.9,.8,.4,.65,'#c2a68e');
      displayPanel(rx,1.85,hall.back-.155,8.11,2.8,Math.PI,
        ['LITTLE OFFICE','\uC6B0\uB9AC\uC758 \uC791\uC740 \uD68C\uC0AC','EVERYDAY, TOGETHER']);
      plant(19.3,11.5,.9);plant(28.6,11.5,.9);
    }else{
      // Only the compact landing remains public; the southern wing is usable floor area.
      if(floor!==3)box(hall.right,1.7,hallZ,.3,3.4,hall.back-hall.front,concrete);
      if(floor!==3){
        const {front,doorX,doorWidth,left,right}=PANTRY_ROOM;
        const jambOutside=doorWidth/2+.14;
        const leftEnd=doorX-jambOutside,rightStart=doorX+jambOutside;
        box((left+leftEnd)/2,1.45,front,leftEnd-left,2.9,.24,concrete);
        box((rightStart+right)/2,1.45,front,right-rightStart,2.9,.24,concrete);
        hallDoor(doorX,front,floor,Math.PI/2,doorWidth,2.9);
        label('PANTRY / LOUNGE',PANTRY_ROOM.centerX,3,front+.65,'#547660',.5);
      } // The partition meets the main door jamb; no wall crosses its clear opening.
      if(floor===3){
        for(const [x,z] of CAFETERIA.extraTables){
          box(x,.86,z,7,.12,1.25,'#e4e6dc');
          for(const side of [-1,1])for(const dx of [-2.2,0,2.2])chair(x+dx,z+side,'#94b2bf',side<0?0:Math.PI);
        }
        box(16.8,1.15,11.5,.8,2.2,.6,'#9cad97');label('WATER / RETURN',16.8,2.7,11.5,'#547660',.4);
      }else{
        box(PANTRY_ROOM.centerX,.23,PANTRY_ROOM.back-PANTRY_ROOM.depth/2,PANTRY_ROOM.floorWidth,.04,PANTRY_ROOM.depth,'#d7dbd0');
      }
    }
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
  for(let floor=0;floor<3;floor++){const before=new Set(scene.children);
    if(floor===0){
      label('STAFF SUPPORT',13,.4,1.6,'#7e8e80',.5);
      // Stockroom beside the first-floor pantry, with access from the shared aisle.
      const stock=STOCKROOM.bounds,stockX=(stock.left+stock.right)/2,stockZ=(stock.front+stock.back)/2;
      const [doorX,doorZ]=STOCKROOM.door,halfDoor=STOCKROOM.doorWidth/2;
      box(stockX,.25,stockZ,stock.right-stock.left,.08,stock.back-stock.front,'#d6d8cb');
      for(const x of [stock.left,stock.right])box(x,1.6,stockZ,.24,3.2,stock.back-stock.front,concrete);
      box(stockX,1.6,stock.back,stock.right-stock.left,3.2,.24,concrete);
      for(const [start,end] of [[stock.left,doorX-halfDoor],[doorX+halfDoor,stock.right]])box((start+end)/2,1.6,doorZ,end-start,3.2,.24,concrete);
      box(doorX,3.05,doorZ,STOCKROOM.doorWidth,.3,.24,concrete);
      const storageDoor=new THREE.Group();storageDoor.position.set(doorX,0,doorZ);scene.add(storageDoor);
      box(0,1.45,0,1.3,2.9,.13,'#718b82',storageDoor);
      box(.43,1.35,-.15,.06,.35,.07,'#d7d3b7',storageDoor);
      storageDoors.push({group:storageDoor,x:doorX,z:doorZ,open:0});
      for(const side of [-1,1])box(doorX+side*(halfDoor-.05),1.45,doorZ,.1,2.9,.28,'#4c655c');
      box(doorX,2.95,doorZ,STOCKROOM.doorWidth,.1,.28,'#4c655c');
      label('STORAGE',doorX,3.5,doorZ,'#50685d',.42);
      for(const x of STOCKROOM.shelfXs){
        [1,2,2.9].forEach(y=>box(x,y,stock.back-.8,2.1,.08,1,'#9ea89a'));
        [-.95,.95].forEach(dx=>box(x+dx,1.55,stock.back-.8,.07,2.9,1,'#697b70'));
        for(let row=0;row<2;row++)for(let col=0;col<3;col++){
          box(x-.65+col*.65,1.28+row*.9,stock.back-.8,.53,.48,.65,'#c2a682');
          box(x-.65+col*.65,1.29+row*.9,stock.back-1.14,.28,.15,.02,'#f1ebd9');
        }
      }
      // Across the lobby: platform showcase and two working demo touchscreens.
      box(18.3,2.05,8,.18,2.2,5.8,'#263e3b');
      displayPanel(18.41,2.05,8,5.5,1.9,Math.PI/2,
        ['OUR PLATFORMS','\uC5F0\uACB0\uB418\uB294 \uC77C\uC0C1, \uB354 \uB098\uC740 \uC5C5\uBB34','CUSTOMER PORTAL  /  DATA  /  AUTOMATION']);
      for(const z of [2.8,10.6]){
        const x=29.35;
        box(x,.3,z,.9,.18,1.8,'#566c64');
        box(x,.62,z,.38,.55,1.5,'#6a8178');
        box(x,1.88,z,.32,2.65,1.65,'#263e3b');
        displayPanel(x-.17,1.9,z,1.48,2.45,-Math.PI/2,platformPages[0],true);
        label('PLATFORM EXPERIENCE',x,3.5,z,'#527b71',.24);
      }

    }
    if(floor===1){box(4,1.4,10.8,4,1.8,0.1,'#fbf5f8');label('PROJECT BOARD',4,1.5,10.65,'#aa8b9e',0.45);}
    if(floor===2){box(12.5,0.1,-7,4.6,0.1,7,'#a8b99a');[11.3,14].forEach(x=>[-9,-6,-4].forEach(z=>plant(x,z,1.1)));box(12.5,0.45,-7,2,0.6,0.7,'#cdb6a5');label('SKY GARDEN',12.5,2,-10,'#84997a',0.5);}
    if(floor===1){box(4,0.5,8,3,0.8,1,'#c9b2c5');box(4,0.9,8.5,3,0.6,0.2,'#c9b2c5');}
    departmentObjects.push({floor,objects:scene.children.filter(o=>!before.has(o))});
  }
  {
    const before=new Set(scene.children);
    function executiveShell(room,color){
      const b=room.bounds,cx=(b.left+b.right)/2,cz=(b.front+b.back)/2,[dx,dz]=room.door;
      box(cx,.22,cz,b.right-b.left,.12,b.back-b.front,color);
      for(const x of [b.left,b.right])box(x,1.7,cz,.18,3.4,b.back-b.front,'#d5cfc1');
      box(cx,1.7,b.back,b.right-b.left,3.4,.18,'#7d6652');
      for(const [start,end] of [[b.left,dx-1],[dx+1,b.right]])box((start+end)/2,1.7,dz,end-start,3.4,.18,'#ded7cb');
      box(dx,3.15,dz,2,.5,.22,'#907d63');
      const door=new THREE.Group();door.position.set(dx,0,dz);scene.add(door);
      box(0,1.4,0,1.8,2.8,.13,'#8b725a',door);box(.62,1.25,-.11,.055,.4,.065,'#c8b58a',door);
      doors.push({group:door,x:dx,floor:2,travel:room===BOARDROOM?-2:2,open:0});
      label(room.name,dx,3.65,dz,'#78664f',.64);
    }
    executiveShell(BOARDROOM,'#acb3a8');
    const [tx,tz]=BOARDROOM.table;
    box(tx,.96,tz,10,.18,2.2,'#8b7055');box(tx,.49,tz,7.8,.85,.8,'#5c625b');
    BOARDROOM_SEATS.forEach(([x,z])=>chair(x,z,'#4f625b',Math.atan2(tx-x,tz-z)));
    for(const x of [-12.6,-10.4,-8.2,-6,-3.8])for(const side of [-1,1]){
      box(x,1.07,tz+side*.7,.55,.025,.35,'#e9e5da');box(x+.36,1.14,tz+side*.6,.1,.15,.1,'#d7ddd0');
    }
    displayPanel(tx,2.1,12.39,7,1.9,Math.PI,['BOARDROOM','STRATEGY & DECISIONS','LITTLE OFFICE / LEADERSHIP']);
    for(const x of [-12,-8.2,-4.4])box(x,3.35,tz,2.8,.08,.28,'#c8b58a');
    label('12 SEATS / EXECUTIVE BOARDROOM',tx,.36,4.3,'#677463',.5);
    executiveShell(CHAIRMAN_OFFICE,'#c5b69d');
    const [cx,cz]=CHAIRMAN_OFFICE.desk;
    box(cx,.93,cz,4.4,.18,2,'#75543e');box(cx,.45,cz,3.6,.85,1.5,'#8b6b50');
    box(cx,.985,cz,2.1,.035,1.2,'#46514a');
    box(cx,1.7,cz-.55,1.6,.9,.12,'#35433e');box(cx,1.7,cz-.48,1.43,.73,.025,'#8eaba8');
    box(cx,1.1,cz+.35,.9,.05,.3,'#d3d6cd');box(cx+1.35,1.06,cz+.2,.6,.08,.8,'#e9e2cf');
    chair(...CEO_HOME,'#5d4c3f',Math.PI);
    chair(cx-1.1,7.3,'#a49076',0);chair(cx+1.1,7.3,'#a49076',0);
    box(12.4,1.2,12.05,6.2,2.2,.65,'#72583f');
    for(const y of [.35,1.1,1.85,2.35])box(12.4,y,11.98,6.3,.07,.75,'#c2aa83');
    for(let i=0;i<12;i++)box(9.7+i*.46,1.48,11.9,.25,.55,.35,['#7b8a7b','#c3b18d','#695b50'][i%3]);
    label('CHAIRMAN / LITTLE OFFICE',12.4,3,12.3,'#eee4cc',.58);
    box(4.9,.3,7.5,6.6,.05,5.4,'#9d9b88');
    box(4.9,.48,8.5,4.8,.7,1.2,'#6b5548');box(4.9,.93,9.04,4.8,.8,.18,'#6b5548');
    for(const x of [2.6,7.2])box(x,.7,8.5,.2,.7,1.2,'#6b5548');
    box(4.9,.53,6.8,2.6,.14,1.2,'#937756');box(4.9,.28,6.8,1.8,.45,.6,'#5f5d50');
    chair(3.5,5.3,'#8b7764',0);chair(6.3,5.3,'#8b7764',0);
    box(1.55,1.9,11.6,1.2,1.4,.1,'#cbbd9d');box(1.55,1.9,11.52,.95,1.15,.04,'#748472');
    plant(16,11.6,.8);plant(1.5,10.4,.7);
    label('PRIVATE RECEPTION',4.9,.4,10.8,'#766951',.45);
    departmentObjects.push({floor:2,objects:scene.children.filter(o=>!before.has(o))});
  }
  const cafeteriaFood=[],kitchenFlames=[],kitchenOfficeDoors=[],cafeDoors=[];
  {
    const before=new Set(scene.children);
    box(0,-.32,0,36,.64,26,'#b9b7a8');box(0,.13,0,35.8,.1,25.8,'#e8e3d2');
    box(0,1.5,-12.8,36,3,.16,'#c8d5c5');box(-17.9,1.5,0,.16,3,26,'#c8d5c5');
    label('사내식당',0,3.4,-11.8,'#547660',.85);
    
    
    const boundary=CAFETERIA.kitchenBoundary;
    box(0,.22,-13+CAFETERIA.kitchenDepth/2,35.7,.08,CAFETERIA.kitchenDepth,'#c4d3d2');
    for(let x=-17;x<18;x++)box(x,.266,-13+CAFETERIA.kitchenDepth/2,.015,.006,CAFETERIA.kitchenDepth,'#a8bab8');
    const counterEnd=DIETITIAN_OFFICE.staffPassage.left;
    box((-17.5+counterEnd)/2,.65,boundary,counterEnd+17.5,1.3,.15,'#d3dfdc');
    // Separate self-service buffet with a tray rail and glass sneeze guards.
    box(-4.25,.75,-3.65,22.5,1.4,1.2,'#708774');
    box(-4.25,1.49,-3.65,22.7,.12,1.35,'#e3d7be');
    label('SELF BUFFET / RICE / MAIN / SALAD / SIDES',-4,2.9,-3.65,'#446c55',.57);
    // Clear opening between the serving counter and office: no countertop across it.
    box(DIETITIAN_OFFICE.staffPassage.center,.29,boundary,DIETITIAN_OFFICE.staffPassage.right-counterEnd,.035,3.2,'#d6ddd0');
    
    
    for(const x of [-12,-6,0,6]){
      box(x,.83,-10.8,3.8,1.6,1.4,'#a6b2b1');box(x,1.68,-10.8,4,.12,1.5,'#dce2df');
      box(x,3.1,-10.8,4.2,.28,1.8,'#8a9998');box(x,2.1,-6,3.4,.12,1,'#a8b6b3');
      box(x,1.57,-3.65,2.2,.08,.7,'#697e78');
      box(x,1.65,-3.65,2.5,.17,.95,'#c7d1c9');
      box(x,1.75,-3.65,2.22,.04,.74,'#627b70');
      const dish=new THREE.Group();dish.position.set(x,1.79,-3.65);scene.add(dish);
      const foodColor=['#fff5cf','#cb8a42','#71a34e','#da6747'][[-12,-6,0,6].indexOf(x)];
      for(let i=0;i<18;i++)sphere(-.88+(i%6)*.35,.06+(i%3)*.035,-.21+Math.floor(i/6)*.21,.16,foodColor,dish,[1.15,.65,.85]);
      cafeteriaFood.push(dish);
      for(const side of [-1,1])box(x+side*1.25,2.12,-3.65,.055,.95,.055,'#718b85');
      box(x,2.6,-3.65,2.65,.06,1.05,glass).castShadow=false;
      box(x,1.27,-2.91,2.6,.07,.28,'#aabbb3');

    }
    const office=DIETITIAN_OFFICE.bounds;
    const officeWidth=office.right-office.left,officeDepth=office.front-office.back;
    box((office.left+office.right)/2,.3,(office.back+office.front)/2,officeWidth,.08,officeDepth,'#d9d1bd');
    const [connectionX,connectionZ]=DIETITIAN_OFFICE.kitchenDoor;
    const halfOpening=DIETITIAN_OFFICE.kitchenDoorWidth/2;
    const doorBack=connectionZ-halfOpening,doorFront=connectionZ+halfOpening;
    box(office.left,1.55,(office.back+doorBack)/2,.15,3.1,doorBack-office.back,'#c8d5c9');
    box(office.left,1.55,(doorFront+office.front)/2,.15,3.1,office.front-doorFront,'#c8d5c9');
    box(connectionX,2.9,connectionZ,.2,.4,DIETITIAN_OFFICE.kitchenDoorWidth,'#91a796');
    for(const z of [doorBack,doorFront])box(connectionX,1.35,z,.2,2.7,.1,'#91a796');
    const connectingDoor=new THREE.Group();connectingDoor.position.set(connectionX,0,connectionZ);scene.add(connectingDoor);
    const panel=new THREE.Group();connectingDoor.add(panel);
    box(0,1.3,0,.1,2.6,1.85,'#b6cdbd',panel);
    box(-.065,1.7,0,.025,.85,1.3,'#dce9e1',panel);
    box(-.1,1.2,.63,.06,.28,.06,'#5e7868',panel);
    kitchenOfficeDoors.push({panel,x:connectionX,z:connectionZ,axis:'z',travel:-2,open:0});
    // Full-height walls meet the frame around the opaque door exactly.
    const officeDoorX=DIETITIAN_OFFICE.door[0],officeDoorWidth=1.65,officeDoorHeight=2.6,frameWidth=.08,officeWallHeight=3.1;
    const openingLeft=officeDoorX-officeDoorWidth/2-frameWidth,openingRight=officeDoorX+officeDoorWidth/2+frameWidth;
    for(const [start,end] of [[office.left,openingLeft],[openingRight,office.right]])box((start+end)/2,officeWallHeight/2,office.front,end-start,officeWallHeight,.15,'#c8d5c9');
    for(const side of [-1,1])box(officeDoorX+side*(officeDoorWidth/2+frameWidth/2),officeDoorHeight/2,office.front,frameWidth,officeDoorHeight,.19,'#91a796');
    box(officeDoorX,officeDoorHeight+frameWidth/2,office.front,officeDoorWidth+frameWidth*2,frameWidth,.19,'#91a796');
    const upperWallHeight=officeWallHeight-officeDoorHeight-frameWidth;
    box(officeDoorX,officeWallHeight-upperWallHeight/2,office.front,officeDoorWidth+frameWidth*2,upperWallHeight,.15,'#c8d5c9');
    const officeDoor=new THREE.Group();officeDoor.position.set(officeDoorX,0,office.front);scene.add(officeDoor);
    box(0,officeDoorHeight/2,0,officeDoorWidth,officeDoorHeight,.12,'#8eaa99',officeDoor);
    box(.56,1.2,.1,.05,.35,.07,'#4c695a',officeDoor);
    kitchenOfficeDoors.push({panel:officeDoor,x:14.5,z:office.front,axis:'x',travel:1.8,base:14.5,open:0});
    box(17.8,1.55,(office.back+office.front)/2,.12,3.1,officeDepth,'#d6dfd1');
    box(13,.86,-10.7,3,.14,1.4,'#c6b69a');
    for(const side of [-1,1])box(13+side*1.3,.44,-10.7,.1,.8,1.15,'#7a8e7f');
    box(13,1.42,-10.35,1.1,.65,.08,'#415c53');box(13,1.42,-10.4,.95,.5,.025,'#9fc6b0');
    box(13,1,-11.1,.75,.04,.25,'#d5ded1');box(13.8,1,-11.1,.3,.04,.4,'#fff7e6');
    chair(...DIETITIAN_OFFICE.seat,'#9bac96',0);
    box(16.5,1.55,-11.9,1.65,3.1,.7,'#b1c0a8');
    for(const side of [-1,1]){box(16.5+side*.4,1.55,-11.52,.77,2.9,.06,'#dae1cd');box(16.5+side*.12,1.6,-11.46,.04,.42,.05,'#6b8271');}
    box(16.4,.75,-6,1.5,1.5,.7,'#bdc8b3');box(16.4,1.55,-6,1.6,.08,.8,'#dddfcb');
    // Private changing and rest room in the corner opposite the cafe.
    const staffRoom=STAFF_ROOM.bounds,roomX=(staffRoom.left+staffRoom.right)/2,roomZ=(staffRoom.front+staffRoom.back)/2;
    box(roomX,.28,roomZ,staffRoom.right-staffRoom.left,.12,staffRoom.back-staffRoom.front,'#d3c4ae');
    box(roomX,1.5,staffRoom.front,3.8,3,.14,'#c7d1c1');
    box(roomX,1.5,staffRoom.back,3.8,3,.14,'#c7d1c1');
    box(staffRoom.left,1.5,roomZ,.14,3,7.4,'#c7d1c1');
    for(const [start,end] of [[staffRoom.front,7.6],[9.4,staffRoom.back]])box(staffRoom.right,1.5,(start+end)/2,.14,3,end-start,'#c7d1c1');
    const staffDoor=new THREE.Group();staffDoor.position.set(STAFF_ROOM.door[0],0,STAFF_ROOM.door[1]);scene.add(staffDoor);
    box(0,1.3,0,.12,2.6,1.8,'#8eaa99',staffDoor);box(.1,1.2,.6,.07,.3,.05,'#4c695a',staffDoor);
    kitchenOfficeDoors.push({panel:staffDoor,x:STAFF_ROOM.door[0],z:STAFF_ROOM.door[1],axis:'z',travel:1.9,base:STAFF_ROOM.door[1],open:0});
    label('조리사 탈의 · 휴게실',roomX,3.25,staffRoom.front,'#547660',.48);
    for(let i=0;i<4;i++){
      const x=staffRoom.left+.55+i*.9;
      box(x,1.35,5.95,.8,2.4,.7,'#8c9f93');box(x,1.35,6.32,.72,2.22,.04,'#cbd6ca');box(x+.2,1.3,6.37,.04,.28,.04,'#526c5c');
      label(String(i+1),x,2.1,6.4,'#547660',.2);
    }
    box(roomX,.43,11.3,2.8,.55,2.2,'#819b87');box(roomX,.92,12.3,2.8,.7,.18,'#819b87');
    box(roomX,.55,9.6,1.8,.12,.65,'#d9c3a0');
    for(const z of CAFETERIA.tableZs)for(const x of CAFETERIA.tableXs){
      box(x,.86,z,7,.12,1.25,'#e4e6dc');
      for(const side of [-1,1]){
        box(x+side*2.7,.43,z,.09,.8,1,'#7d8c8b');
        for(const dx of [-2.2,0,2.2]){
          const cx=x+dx,cz=z+side;
          box(cx,.47,cz,.64,.1,.62,'#94b2bf');box(cx,.82,cz+side*.27,.64,.55,.08,'#94b2bf');
          for(const leg of [-1,1])box(cx+leg*.23,.23,cz,.05,.44,.48,'#7d8c8b');

        }
      }
    }
    

    for(const x of [-16,-14]){
      box(x,1.55,-11.5,1.7,3.1,1.4,'#b6c5c4');
      for(const side of [-1,1]){box(x+side*.4,1.55,-10.76,.77,2.88,.09,'#d8dfdc');box(x+side*.12,1.55,-10.66,.045,.65,.07,'#6c7d78');}
    }
    for(const x of [-12,-6,0,6]){
      box(x,.8,-10.8,3.3,1.5,1.3,'#727f7d');
      for(const dx of [-.7,.7]){
        box(x+dx,1.61,-10.8,.9,.06,.9,'#354642');
        for(let i=0;i<10;i++){
          const angle=i*Math.PI/5;
          const flameMaterial=new THREE.MeshBasicMaterial({color:i%2?'#ffad38':'#53bcff',toneMapped:false});
          const flame=new THREE.Mesh(new THREE.ConeGeometry(.09,.4,7),flameMaterial);
          flame.position.set(x+dx+Math.cos(angle)*.48,1.85,-10.8+Math.sin(angle)*.48);
          scene.add(flame);kitchenFlames.push(flame);
        }
        sphere(x+dx,2,-10.8,.43,'#afbcba',scene,[1,.6,1]);
        box(x+dx,.96,-10.08,.14,.14,.06,'#263d36');
      }
      box(x,2.75,-11.6,.28,.65,.25,'#8c9a98');
    }
    box(8.7,1.1,-11.2,2.4,1.7,1.4,'#a7b9b5');box(8.7,2,-11.2,2.3,.12,1.25,'#e1e8e3');
    for(const x of [8.1,9.3])sphere(x,2.03,-11.2,.44,'#798f8b',scene,[1,.1,1]);
    // Stainless preparation stations: sinks, cutting boards, knives and produce.
    for(const x of [-12,-6,0,6]){
      box(x,1.02,-6,3.4,1.8,1,'#b8c5c1');
      box(x-.9,2.12,-6,.95,.04,.75,'#ece4c5');
      box(x-.8,2.16,-6,.65,.035,.35,'#89a782');
      for(let i=0;i<3;i++)sphere(x-.98+i*.2,2.23,-6,.11,'#91b575',scene,[1,.8,1]);
      box(x+.05,2.16,-6,.04,.035,.55,'#5d6d65');box(x+.05,2.19,-6.28,.055,.04,.18,'#cbd5d1');
      sphere(x+.95,2.13,-6,.37,'#6c8984',scene,[1.2,.12,1]);
      box(x+.95,2.38,-5.55,.06,.5,.06,'#718b85');box(x+.95,2.62,-5.73,.06,.06,.36,'#718b85');
      for(const side of [-1,1])box(x+side*1.2,.45,-6,.08,.8,1,'#788e85');
    }
    // Wall tiles, extraction ducts, drains and a dishwashing station.
    for(let x=-17;x<18;x+=1.2)box(x,1.6,-12.69,.018,2.6,.018,'#b3c4bc');
    for(const y of [.4,1,1.6,2.2,2.8])box(0,y,-12.68,35.6,.018,.018,'#b3c4bc');
    box(-3,3.55,-11.8,26,.5,.75,'#98aaa3');
    for(const x of [-12,-6,0,6]){
      box(x,.29,-8.55,2,.025,.28,'#798e86');
      for(let i=0;i<9;i++)box(x-.9+i*.22,.31,-8.55,.035,.015,.25,'#455e54');
      box(x+1.35,2.36,-6,.16,.22,.22,'#ded5bb');
    }
    box(-16,1,-6.1,2.2,1.8,1.5,'#b3c5bc');box(-16,1.95,-6.1,2.1,.12,1.4,'#dce5dc');
    box(-16,2.36,-6.6,1.7,.7,.12,'#92a89e');
    for(let i=0;i<8;i++)box(-16.6+i*.17,2.5,-6.3,.04,.4,.55,'#e7eee3');
    const pickup=box(-16,.7,-2.5,2.4,1.2,1.3,'#b4c6bf');
    for(let i=0;i<12;i++)box(-16,.89+i*.055,-2.5,.9,.035,.6,'#b5c4c1');
    for(const x of [-15.4,-15.1]){box(x,1.36,-2.5,.2,.22,.3,'#e0e6dc');for(let i=0;i<7;i++)box(x-.07+i*.022,1.58,-2.5,.015,.36,.025,'#7c918a');}
    // Cafe directly opposite the elevator bank; the central entrance faces the landing.
    const cafeWidth=CAFE.bounds.right-CAFE.bounds.left,cafeLength=CAFE.bounds.back-CAFE.bounds.front;
    const cafeX=(CAFE.bounds.left+CAFE.bounds.right)/2,cafeZ=(CAFE.bounds.front+CAFE.bounds.back)/2;
    box(cafeX,.3,cafeZ,cafeWidth,.09,cafeLength,'#bca98d');
    for(let x=CAFE.bounds.left+.3;x<CAFE.bounds.right;x+=.65)box(x,.35,cafeZ,.015,.008,cafeLength-.1,'#a59176');
    const sideDoorZ=CAFE.sideEntry[1],sideDoorWidth=1.8;
    const sideBack=sideDoorZ+sideDoorWidth/2,sideFront=sideDoorZ-sideDoorWidth/2;
    glassWall(CAFE.bounds.left,(CAFE.bounds.front+sideFront)/2,.06,sideFront-CAFE.bounds.front);
    glassWall(CAFE.bounds.left,(sideBack+CAFE.bounds.back)/2,.06,CAFE.bounds.back-sideBack);
    const sideDoor=new THREE.Group();sideDoor.position.set(CAFE.bounds.left,0,sideDoorZ);scene.add(sideDoor);
    box(0,1.45,0,.07,2.9,sideDoorWidth,glass,sideDoor).castShadow=false;
    for(const side of [-1,1])box(0,1.45,side*sideDoorWidth/2,.09,2.9,.06,'#718b85',sideDoor);
    box(0,2.91,0,.1,.08,sideDoorWidth,'#718b85',sideDoor);
    box(-.09,1.3,.58,.06,.45,.05,'#526c5c',sideDoor);
    cafeDoors.push({group:sideDoor,x:CAFE.bounds.left,z:sideDoorZ,axis:'z',open:0});
    glassWall(CAFE.bounds.right,cafeZ,.06,cafeLength);
    glassWall(cafeX,CAFE.bounds.back,cafeWidth,.06);
    const doorX=CAFE.entry[0],doorWidth=1.8,front=CAFE.bounds.front;
    const leftEnd=doorX-doorWidth/2,rightStart=doorX+doorWidth/2;
    glassWall((CAFE.bounds.left+leftEnd)/2,front,leftEnd-CAFE.bounds.left,.06);
    glassWall((rightStart+CAFE.bounds.right)/2,front,CAFE.bounds.right-rightStart,.06);
    const cafeDoor=new THREE.Group();cafeDoor.position.set(doorX,0,front);scene.add(cafeDoor);
    box(0,1.45,0,doorWidth,2.9,.07,glass,cafeDoor).castShadow=false;
    for(const side of [-1,1])box(side*doorWidth/2,1.45,0,.06,2.9,.09,'#718b85',cafeDoor);
    box(0,2.91,0,doorWidth,.08,.1,'#718b85',cafeDoor);
    box(.58,1.3,-.09,.05,.45,.06,'#526c5c',cafeDoor);
    cafeDoors.push({group:cafeDoor,x:doorX,z:front,open:0});
    label('CAFE',CAFE.entry[0],3.25,front,'#446c55',.6);
    const cafeOffset=CAFE.bounds.left-5.8;
    const cafeBox=(x,...args)=>box(x+cafeOffset,...args),cafeSphere=(x,...args)=>sphere(x+cafeOffset,...args);
    cafeBox(13.55,.77,10.8,6.1,1.45,1,'#708774');
    cafeBox(13.55,1.55,10.8,6.2,.12,1.15,'#e3d7be');
    for(let x=10.65;x<16.6;x+=.3)cafeBox(x,.8,10.28,.04,1.3,.025,'#8da18a');
    cafeBox(12,1.85,10.8,.6,.5,.4,'#334e41');cafeBox(12,1.85,10.56,.48,.35,.03,'#b5d6b5');
    cafeBox(15,1.9,10.9,1.4,.6,.75,'#526c5c');cafeBox(15,2.25,10.9,1.45,.1,.8,'#aebeb0');
    for(const x of [14.65,15.3]){cafeBox(x,1.7,10.53,.07,.26,.18,'#b7c8bb');cafeSphere(x,1.66,10.38,.12,'#fff7e2',scene,[1,.85,1]);}
    cafeBox(13.5,1.85,10.95,.45,.55,.5,'#8a9e89');cafeSphere(13.5,2.3,10.95,.2,'#6a5543',scene,[1,1.3,1]);
    cafeBox(14.2,1.05,12.45,4.4,2.1,.45,'#9cad97');
    for(const x of [12.5,13.4,14.3,15.2,16.1]){cafeBox(x,2.18,12.45,.7,.08,.4,'#dbe1ce');cafeSphere(x,2.37,12.4,.12,'#b7c7a5');}
    for(let i=0;i<7;i++)cafeBox(16,1.65+i*.05,10.65,.2,.045,.2,'#fff7df');
    for(const [x,z] of CAFE.tables){
      box(x,.75,z,1.25,.12,1.15,'#dfc7a3');box(x,.39,z,.12,.65,.12,'#5d7760');
      for(const side of [-1,1])chair(x+side*.85,z,'#819b7e',side<0?Math.PI/2:-Math.PI/2);

    }
    cafeBox(17.2,.7,6.4,.5,1.3,.5,'#8c9e7e');cafeBox(17.2,1.38,6.4,.55,.08,.55,'#c6d0b7');
    departmentObjects.push({floor:3,objects:scene.children.filter(o=>!before.has(o))});
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
  const overviewFloors=[0,1,2,3].map(floor=>{const group=new THREE.Group();group.position.y=floorY(floor);group.visible=false;if(floor!==3)sharedObjects.forEach(o=>group.add(o.clone(true)));else box(0,-.4,0,36,.2,26,'#b9b7a8',group);group.traverse(o=>o.userData.overviewFloor=floor);scene.add(group);return group;});
  departmentObjects.forEach(d=>d.objects.forEach(o=>o.userData.floorBaseY=o.position.y));
  floorLabels.forEach(d=>d.sprite.userData.floorBaseY=d.sprite.position.y);
  const overviewTitles=FLOOR_NAMES.map((name,floor)=>{const sprite=label(name,-12,floorY(floor)+1.2,-14.5,'#805e76',0.9);sprite.visible=false;return sprite;});
  let overviewWasActive=false;
  function speech(e){const c=document.createElement('canvas');c.width=512;c.height=176;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:true,depthWrite:false}));sprite.scale.set(2.65,0.91,1);sprite.position.y=2.05+(e.seat%2)*0.28;sprite.renderOrder=10;
    let previous='';return {sprite,update(){const key=e.state+'-'+e.meetingKind+'-'+(e.elevatorRide?'riding':e.path[0]?.length===3?'waiting':'');if(key===previous)return;previous=key;ctx.clearRect(0,0,512,176);ctx.fillStyle='#fff9fc';ctx.strokeStyle=e.role==='팀장'?'#be8aab':'#dfc8d6';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(5,4,502,145,25);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(239,148);ctx.lineTo(256,171);ctx.lineTo(273,148);ctx.fill();ctx.fillStyle=DEPTS[e.dept]?.color||'#88667f';ctx.font='600 29px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillText(`${e.name}${e.role==='팀원'?'':` · ${e.role}`}`,256,54);ctx.fillStyle='#685362';ctx.font='800 31px "Malgun Gothic",sans-serif';ctx.fillText(e.elevatorRide?'\uC5D8\uB9AC\uBCA0\uC774\uD130 \uD0D1\uC2B9 \uC911':e.path[0]?.length===3?'\uC5D8\uB9AC\uBCA0\uC774\uD130 \uB300\uAE30 \uC911':e.meetingKind==='leadership'&&e.state==='회의 중'?'대표·팀장 회의 중':e.state,256,108,465);tex.needsUpdate=true;}};
  }
  function makeAvatar(e){
    const group=new THREE.Group(),body=new THREE.Group(),a=e.appearance;group.add(body);body.scale.set(a.build,a.height,1);
    const torso=box(0,0.88,0,0.48,0.61,0.32,a.top,body);
    // Collars, jacket lapels and individual accessories.
    box(0,1.11,0.17,0.2,0.15,0.035,'#f9efeb',body);
    if(e.suited){box(0,.96,.18,.24,.4,.035,'#f1f2ec',body);[-1,1].forEach(side=>{const lapel=box(side*.12,1,.205,.11,.3,.035,a.top,body);lapel.rotation.z=side*.3;});box(.46,.58,.02,.2,.34,.42,'#4c4541',body);}
    const uniformStart=body.children.length;
    if(e.cafeteria){
      const dietitian=e.role==='영양사';
      box(0,.72,.02,.55,.94,.39,'#fafbf5',body);
      if(dietitian){
        box(0,.84,.224,.025,.67,.02,'#b7c9c5',body);
        for(const side of [-1,1]){const lapel=box(side*.1,1.07,.23,.13,.25,.03,'#dce8e3',body);lapel.rotation.z=side*.3;box(side*.17,.66,.23,.15,.14,.025,'#e1e9e4',body);}
        box(-.16,1,.25,.14,.09,.025,'#79a891',body);
      }else{
        box(0,.7,.245,.43,.67,.04,'#b7cec1',body);box(0,.94,.27,.38,.035,.02,'#8ba99b',body);
        for(let i=0;i<4;i++)sphere(.12,1.08-i*.1,.232,.018,'#7d9088',body);
      }
    }
    else if(e.cafe){box(0,.72,.205,.45,.78,.05,'#567e62',body);box(0,.9,.24,.35,.035,.025,'#c8d3b7',body);box(-.13,1.03,.25,.14,.08,.02,'#ede6c6',body);}
    else if(e.role!=='팀원'){box(0,0.94,0.19,0.06,0.28,0.035,'#775773',body);box(-0.18,1.02,0.18,0.07,0.07,0.03,'#d8b985',body);}
    else if(a.accessory===0){box(0,0.99,0.19,0.04,0.31,0.03,'#dac2d3',body);box(0,0.79,0.19,0.14,0.16,0.025,'#faf0f4',body);}
    else if(a.accessory===2){box(0,1.13,0,0.52,0.12,0.4,'#e9d2c7',body);}
    const uniformParts=e.cafeteria?body.children.slice(uniformStart):[];
    sphere(0,1.42,0,0.25,a.skin,body,[1,1.08,0.95]);
    [-1,1].forEach(s=>{sphere(s*0.25,1.42,0,0.06,a.skin,body);sphere(s*0.085,1.43,0.222,0.021,'#44313e',body);});sphere(0,1.36,0.245,0.035,a.skin,body,[1,1,0.8]);
    const hair=new THREE.Mesh(new THREE.SphereGeometry(0.263,14,10,0,Math.PI*2,0,Math.PI*0.5),mat(a.hair));hair.position.y=1.47;body.add(hair);
    if(a.style===0){box(-0.1,1.59,0.2,0.29,0.16,0.12,a.hair,body);}
    if(a.style===1){box(0,1.35,-0.14,0.5,0.43,0.2,a.hair,body);[-1,1].forEach(s=>box(s*0.23,1.38,0.01,0.08,0.3,0.2,a.hair,body));}
    if(a.style===2){sphere(0,1.62,-0.24,0.16,a.hair,body);}
    if(a.style===3){for(let i=0;i<7;i++)sphere(Math.cos(i)*0.18,1.63+Math.sin(i*2)*0.04,Math.sin(i)*0.15,0.11,a.hair,body);}
    if(a.style===4){box(0.12,1.63,0.08,0.24,0.2,0.23,a.hair,body);sphere(0,1.32,-0.28,0.14,a.hair,body,[0.8,1.8,1]);}
    if(a.style===5){box(0,1.69,0,0.52,0.12,0.4,a.top,body);box(0,1.63,0.22,0.52,0.05,0.24,a.top,body);}
    if(e.cafeteria&&e.role!=='영양사'){
      uniformParts.push(sphere(0,1.73,0,.3,'#fffef6',body,[1.05,.65,1]),box(0,1.64,.1,.58,.1,.4,'#e6ede7',body),box(0,1.34,.25,.32,.14,.035,'#e4f0eb',body));
    }
    if(a.glasses){[-0.1,0.1].forEach(x=>{const rim=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.013,5,14),mat('#654d63'));rim.position.set(x,1.44,0.24);body.add(rim);});box(0,1.44,0.245,0.05,0.015,0.02,'#654d63',body);}
    if(a.accessory===3){sphere(-0.29,1.42,0,0.07,'#8e7699',body);sphere(0.29,1.42,0,0.07,'#8e7699',body);}
    const legs=[],arms=[];
    [-1,1].forEach(s=>{const leg=new THREE.Group();leg.position.set(s*0.13,0.57,0);body.add(leg);box(0,-0.26,0,0.18,0.5,0.22,a.trousers,leg);box(0,-0.49,0.055,0.2,0.1,0.32,e.id%2?'#f7edee':'#61535f',leg);legs.push(leg);
      const arm=new THREE.Group();arm.position.set(s*0.31,1.1,0);body.add(arm);box(0,-0.18,0,0.14,0.35,0.19,a.top,arm);sphere(0,-0.4,0,0.083,a.skin,arm);arms.push(arm);});
    const mealTray=new THREE.Group();body.add(mealTray);mealTray.visible=false;
    const coffeeCup=new THREE.Group();body.add(coffeeCup);coffeeCup.visible=false;
    sphere(.3,.83,.39,.12,'#faf3df',coffeeCup,[.85,1.6,.85]);box(.3,.9,.39,.22,.1,.22,'#769776',coffeeCup);box(.3,1.02,.39,.23,.035,.23,'#4d6d55',coffeeCup);
    box(0,.86,.52,.86,.045,.55,'#aebfba',mealTray);
    box(.29,.9,.55,.025,.025,.4,'#677f77',mealTray);box(.35,.9,.55,.025,.025,.4,'#677f77',mealTray);
    const mealFoods=[];
    for(let i=0;i<4;i++)mealFoods.push(sphere(-.27+i*.17,.94,.52,.09,['#fff7df','#d4a269','#84a26b','#d98765'][i],mealTray,[1,.4,1]));
    const kitchenTools={};
    for(const kind of ['ingredients','knife','ladle','food','wash','clipboard','mop']){
      const tool=new THREE.Group();tool.visible=false;body.add(tool);kitchenTools[kind]=tool;
      if(kind==='mop'){box(.35,.65,.5,.045,1.15,.045,'#91a9a0',tool);box(.35,.1,.5,.65,.12,.25,'#c3d4c6',tool);}
      else if(kind==='ladle'){box(.36,.83,.47,.04,.6,.04,'#8b9f95',tool);sphere(.36,.54,.47,.12,'#a8b8ad',tool,[1,.4,1]);}
      else if(kind==='knife'){box(.35,.82,.45,.05,.16,.07,'#5e7568',tool);box(.35,.66,.45,.025,.23,.15,'#dce5dd',tool);}
      else if(kind==='clipboard'){box(.2,.91,.43,.37,.5,.04,'#809c8a',tool);box(.2,.91,.46,.3,.4,.015,'#fffbed',tool);}
      else {box(0,.79,.48,.62,.16,.43,kind==='wash'?'#c1d0c4':'#c8d9bc',tool);sphere(0,.9,.48,.17,kind==='food'?'#d9b06d':'#87ac72',tool,[1.6,.45,1]);}
    }
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
    const bubble=speech(e);group.add(bubble.sprite);group.traverse(o=>o.userData.employee=e);scene.add(group);return {group,body,legs,arms,bubble,cargo,receipt,cart,mealTray,mealFoods,kitchenTools,uniformParts,torso,coffeeCup,employee:e};
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
    if(overview!==overviewWasActive){overviewWasActive=overview;if(overview)sim.followId=null;controls.maxDistance=overview?130:85;controls.target.set(6,overview?11:0,0);camera.position.set(...(overview?[48,52,65]:initial));}
    overviewTitles.forEach(sprite=>sprite.visible=overview);overviewFloors.forEach(group=>group.visible=overview);sharedObjects.forEach(o=>o.visible=!overview&&sim.activeFloor!==3);
    const followed=[...sim.employees,...sim.visitors].find(e=>e.id===sim.followId&&e.visible);
    if(followed){sim.activeFloor=followed.floor;const target=new THREE.Vector3(followed.pos[0],0,followed.pos[1]);if(tracked!==followed.id){tracked=followed.id;previousTarget.copy(controls.target);camera.position.copy(controls.target.clone().add(camera.position.clone().sub(controls.target).normalize().multiplyScalar(30)));}const next=previousTarget.clone().lerp(target,0.08);camera.position.add(next.clone().sub(controls.target));controls.target.copy(next);previousTarget.copy(next);}else{sim.followId=null;tracked=null;}
    const evening=Math.min(1,time/1100);sun.color.setRGB(1,0.96-evening*0.22,0.92-evening*0.3);sun.intensity=2.2-evening*.65;floorLabels.forEach(d=>{d.sprite.visible=overview||d.floor===sim.activeFloor;d.sprite.position.y=d.sprite.userData.floorBaseY+(overview?floorY(d.floor):0);});
    departmentObjects.forEach(d=>d.objects.forEach(o=>{o.visible=overview||d.floor===sim.activeFloor;o.position.y=o.userData.floorBaseY+(overview?floorY(d.floor):0);}));
    cafeteriaFood.forEach(o=>o.visible=(overview||sim.activeFloor===3)&&sim.time>=400&&sim.lunch?.status!=='done');
    kitchenFlames.forEach(o=>{o.visible=(overview||sim.activeFloor===3)&&sim.mode==='working'&&sim.time<400;o.scale.y=1.5+Math.sin(time*12+o.position.x)*.3;});
    for(const portal of elevatorPortals){
      const lift=sim.elevators?.[portal.index]??(portal.index===0?sim.elevator:null)??{floor:0,position:0,target:0,phase:'idle',passengers:[]};
      const opening=lift.floor===portal.floor&&['opening','open','closing'].includes(lift.phase);
      const amount=opening?(lift.phase==='opening'?1-lift.remaining/.7:lift.phase==='closing'?lift.remaining/.7:1):0;
      portal.leaves.forEach(({mesh,side})=>mesh.position.x=side*(.46+Math.max(0,amount)*.9));
      const progress=lift.phase==='moving'?Math.abs(lift.position-floorLevel(lift.floor)):0;
      portal.indicator.material.color.set(lift.phase==='moving'?'#d4a461':opening?'#77c9a5':'#63796b');
      const floorText=`${portal.index+1} / ${Math.round(lift.position)<0?'B1':Math.round(lift.position)+1+'F'}${lift.phase==='moving'?(floorLevel(lift.target)>lift.position?' \u2191':' \u2193'):''}`;
      if(portal.text!==floorText){
        portal.text=floorText;
        const canvas=portal.indicator.material.map.image,ctx=canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);ctx.font='600 38px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillStyle='#a7ddc9';ctx.fillText(floorText,256,62);
        portal.indicator.material.map.needsUpdate=true;
      }
      portal.indicator.scale.y=.3*(1+progress*.2);
    }
    liftCars.forEach((car,index)=>{
      const lift=sim.elevators?.[index]??(index===0?sim.elevator:null)??{floor:0,position:0,target:0};
      const progress=lift.target!==lift.floor?Math.abs(lift.position-floorLevel(lift.floor))/Math.abs(floorLevel(lift.target)-floorLevel(lift.floor)):0;
      car.visible=overview;car.position.y=THREE.MathUtils.lerp(floorY(lift.floor),floorY(lift.target),progress);
    });
    eventProps.forEach(prop=>prop.object.visible=(overview||sim.activeFloor===1)&&sim.events.some(event=>event.kind===prop.kind&&event.venue==='project'&&['이동 중','진행 중'].includes(event.status)));
    entranceDoors.forEach(d=>{const nearby=[...sim.employees,...sim.visitors].some(e=>e.visible&&e.floor===d.floor&&Math.hypot(e.pos[0]-d.x,e.pos[1]-d.z)<4);d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,.15);d.group.position.z=d.baseZ+d.side*d.open*d.travel;});
    storageDoors.forEach(door=>{
      const nearby=sim.employees.some(e=>e.visible&&e.floor===0&&Math.hypot(e.pos[0]-door.x,e.pos[1]-door.z)<2);
      door.open=THREE.MathUtils.lerp(door.open,nearby?1:0,.15);
      door.group.position.x=door.x+door.open*1.4;
    });
    doors.forEach(d=>{const nearby=[...sim.employees,...sim.visitors].some(e=>e.visible&&e.floor===(d.floor??sim.activeFloor)&&Math.abs(e.pos[0]-d.x)<1.6&&Math.abs(e.pos[1]-3.5)<2.1);d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,0.15);d.group.position.x=d.x+d.open*(d.travel??1.4);});
    cafeDoors.forEach(d=>{
      const nearby=[...sim.employees,...sim.visitors].some(e=>e.visible&&e.floor===3&&Math.hypot(e.pos[0]-d.x,e.pos[1]-d.z)<2.5);
      d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,.18);
      if(d.axis==='z')d.group.position.z=d.z+d.open*1.95;
      else d.group.position.x=d.x+d.open*1.95;
    });
    kitchenOfficeDoors.forEach(d=>{
      const {x,z}=d;
      const nearby=sim.employees.some(e=>e.visible&&e.floor===3&&!e.elevatorRide&&Math.hypot(e.pos[0]-x,e.pos[1]-z)<2.5);
      d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,.18);d.panel.position[d.axis]=(d.base??0)+d.open*d.travel;
    });
    avatars.forEach((a,i)=>{const e=a.employee,waitingForElevator=e.path[0]?.length===3,moving=e.path.length>0&&!waitingForElevator&&!e.elevatorRide;const home=Math.hypot(e.pos[0]-e.home[0],e.pos[1]-e.home[1])<0.1;const seated=!e.cafe&&(!e.cafeteria||e.casualClothes||e.assignment==='staff-rest'||(e.role==='영양사'&&home))&&!moving&&!waitingForElevator&&!e.carrying&&(home||e.assignment==='staff-rest'||['커피 마시며 동료와 수다 중','커피 마시며 쉬는 중','식사 시작 대기','점심 식사 중','회의 중','회의 대기','면접 중','외부 미팅 중','외부 미팅 대기','라운지에서 대기 중','방문 목적 설명 중','영업 담당자 기다리는 중'].includes(e.state));
      const stockroomWorking=e.floor===STOCKROOM.floor&&e.pos[0]>=STOCKROOM.bounds.left&&e.pos[0]<=STOCKROOM.bounds.right&&e.pos[1]>=STOCKROOM.bounds.front&&e.pos[1]<=STOCKROOM.bounds.back&&(['picking','stocking'].includes(e.supplyTask?.phase)||sim.deliveries.some(delivery=>delivery.id===e.assignment&&delivery.stockStages?.[e.id]==='storing'));
      a.coffeeCup.visible=!!e.coffeeCup;
      a.uniformParts.forEach(o=>o.visible=!e.casualClothes);
      if(e.cafeteria){const clothing=mat(e.casualClothes?'#8b9eb7':e.appearance.top);a.torso.material=clothing;a.arms.forEach(arm=>arm.children[0].material=clothing);}
      Object.entries(a.kitchenTools).forEach(([kind,o])=>{o.visible=e.cafeteria&&e.kitchenTool===kind;o.rotation.z=!moving&&e.kitchenAction?Math.sin(time*5)*.12:0;});a.mealTray.visible=!!e.meal;a.mealFoods.forEach((o,i)=>o.visible=i<(e.meal?.foods??0));a.receipt.visible=e.carrying==='영수증';a.cargo.visible=!!e.carrying&&!a.receipt.visible;const count=typeof e.carrying==='number'?e.carrying:1;a.cargo.children.forEach((o,index)=>o.visible=Math.floor(index/2)<count);
      a.cart.visible=e.role==='배송 기사';
      if(e.role==='배송 기사'){a.cargo.position.set(0,-.25,.87);a.cargo.scale.set(1.75,1.75,1.75);}else{a.cargo.scale.set(1.7,1.7,1.7);a.cargo.position.set(0,-.28,-.04);}
      a.group.visible=e.visible&&!e.elevatorRide&&e.restroom?.phase!=='using'&&(overview||e.floor===sim.activeFloor);if(!a.group.visible)return;a.group.position.set(e.pos[0],(overview?floorY(e.floor):0)+(moving?Math.sin(time*10+i)*0.035:0),e.pos[1]);a.bubble.sprite.visible=!overview;
      if(moving){const p=e.path[0];a.body.rotation.y=Math.atan2(p[0]-e.pos[0],p[1]-e.pos[1]);}
      else if(waitingForElevator){
        const [doorX,doorZ]=elevatorDoor(e.liftIndex??0);
        a.body.rotation.y=Math.atan2(doorX-e.pos[0],doorZ-e.pos[1]);
      }
      else if(stockroomWorking){
        const shelfX=STOCKROOM.shelfXs.reduce((nearest,x)=>Math.abs(x-e.pos[0])<Math.abs(nearest-e.pos[0])?x:nearest);
        a.body.rotation.y=Math.atan2(shelfX-e.pos[0],STOCKROOM.bounds.back-.8-e.pos[1]);
      }
      else if(['picking','stocking'].includes(e.supplyTask?.phase))a.body.rotation.y=e.supplyTask.phase==='picking'?Math.PI:e.supplyTask.kind==='paper'?-Math.PI/2:0;
      else if(e.documentTask?.phase==='working')a.body.rotation.y=-Math.PI/2;

      else if(e.cafe)a.body.rotation.y=e.barSlot===2?Math.PI/2:Math.PI;
      else if(e.coffeeVisit?.phase==='chat')a.body.rotation.y=e.coffeeVisit.seat%2===0?Math.PI/2:-Math.PI/2;
      else if(e.cafeteria&&e.kitchenAction)a.body.rotation.y=['serve','food'].includes(e.kitchenAction)?0:e.pos[1]>-8&&e.pos[0]<10?0:Math.PI;
      else if(e.lunchStep==='seated'){const tables=[...CAFETERIA.tableZs.flatMap(z=>CAFETERIA.tableXs.map(x=>[x,z])),...CAFETERIA.extraTables];const row=tables.reduce((a,b)=>Math.hypot(b[0]-e.pos[0],b[1]-e.pos[1])<Math.hypot(a[0]-e.pos[0],a[1]-e.pos[1])?b:a)[1];a.body.rotation.y=e.pos[1]<row?0:Math.PI;}
      else if(typeof e.lunchStep==='number')a.body.rotation.y=Math.PI;
      else if(home)a.body.rotation.y=e.facing;
      else if(e.floor===2&&e.meetingSeat!=null&&['회의 중','회의 대기'].includes(e.state))a.body.rotation.y=Math.atan2(BOARDROOM.table[0]-e.pos[0],BOARDROOM.table[1]-e.pos[1]);
      else if(e.state==='회의 참관 중')a.body.rotation.y=0;
      else if(['라운지에서 대기 중','방문 목적 설명 중','영업 담당자 기다리는 중'].includes(e.state))a.body.rotation.y=0;
      else if(e.state==='손 씻는 중')a.body.rotation.y=Math.PI;
      else if(e.state==='커피 마시는 중')a.body.rotation.y=e.pos[1]<7?0:Math.PI;
      else if(['커피 마시며 동료와 수다 중','커피 마시며 쉬는 중','식사 시작 대기','점심 식사 중','회의 중','회의 대기','면접 중','외부 미팅 중','외부 미팅 대기','라운지에서 대기 중','방문 목적 설명 중','영업 담당자 기다리는 중'].includes(e.state)){const cx=ROOMS.find(r=>Math.abs(r.x-e.pos[0])<3.8)?.x??0;const seat=e.meetingSeat??e.seat;a.body.rotation.y=seat===5?0:seat===4?Math.PI:(e.pos[0]<cx?Math.PI/2:-Math.PI/2);}
      a.body.position.y=seated?-0.12:0;a.legs.forEach((l,j)=>{l.rotation.x=seated?-1.35:moving?Math.sin(time*10+j*Math.PI)*0.5:0;});a.arms.forEach((arm,j)=>{arm.rotation.x=e.cafe&&!moving&&e.baristaAction?-1+Math.sin(time*5+j)*.18:e.coffeeCup&&j===1?-.8:e.cafeteria&&!moving&&e.kitchenAction?-1+Math.sin(time*(e.kitchenAction==='knife'?9:4)+j)*.22:e.meal?-1.05+(seated?Math.sin(time*4+j)*.12:0):(stockroomWorking||e.documentTask?.phase==='working'||['picking','stocking'].includes(e.supplyTask?.phase))?-1+Math.sin(time*5+j)*.15:moving?Math.sin(time*10+j*Math.PI+Math.PI)*0.4:e.state==='손 씻는 중'?-0.9+Math.sin(time*6+j)*0.1:seated?-0.65+Math.sin(time*5+j)*0.06:Math.sin(time*1.7+i)*0.04;});a.bubble.update();
    });controls.update();renderer.render(scene,camera);
  },reset(){sim.followId=null;camera.position.set(...(sim.buildingOverview?[48,52,65]:initial));controls.target.set(6,sim.buildingOverview?11:0,0);},dispose(){observer.disconnect();canvas.removeEventListener('mousedown',preventMiddleScroll);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);controls.dispose();const allMaterials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)allMaterials.add(o.material);});allMaterials.forEach(m=>{m.map?.dispose();m.dispose();});renderer.dispose();}};
}
