import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {DEPTS} from './simulation.js';
import {TEAM_CENTERS,TEAM_SEATS,ROOM_SEATS,ROOMS} from './layout.js';

export function createOffice(canvas,sim,onSelect){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor('#f1e9eb');renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.fog=new THREE.Fog('#f1e9eb',80,130);
  const camera=new THREE.PerspectiveCamera(36,1,0.1,180);const initial=[36,39,43];camera.position.set(...initial);
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,0,0);controls.enableDamping=true;controls.maxPolarAngle=Math.PI/2.35;controls.minDistance=20;controls.maxDistance=85;controls.maxAzimuthAngle=Math.PI/2;controls.minAzimuthAngle=-Math.PI/2;
  scene.add(new THREE.HemisphereLight(0xfffafb,0xbdaeb9,2.7));
  const sun=new THREE.DirectionalLight(0xfff4ec,3);sun.position.set(-15,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-29,right:29,top:29,bottom:-29});sun.shadow.normalBias=0.04;scene.add(sun);
  const materials=new Map();
  const mat=color=>{if(!materials.has(color))materials.set(color,new THREE.MeshStandardMaterial({color,roughness:0.75}));return materials.get(color);};
  function box(x,y,z,w,h,d,color,parent=scene){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof color==='string'?mat(color):color);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(x,y,z,r,color,parent=scene,scale=[1,1,1]){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),mat(color));mesh.position.set(x,y,z);mesh.scale.set(...scale);mesh.castShadow=true;parent.add(mesh);return mesh;}
  function label(text,x,y,z,color='#79616d',size=0.65){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.font='600 38px "Malgun Gothic",sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.fillText(text,256,62);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.set(size*5.33,size,1);scene.add(sprite);return sprite;}
  function plant(x,z,size=1){box(x,0.27,z,0.6,0.54,0.6,'#c5a6a2');sphere(x,0.95,z,0.53,'#8f9d89',scene,[size,1.3*size,size]);sphere(x+0.24,0.86,z+0.1,0.33,'#a7af94');}
  function chair(x,z,color,facing=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=facing;scene.add(g);box(0,0.48,0,0.67,0.14,0.63,color,g);box(0,0.86,-0.27,0.67,0.7,0.13,color,g);box(0,0.24,0,0.1,0.4,0.1,'#877a83',g);box(0,0.08,0,0.6,0.08,0.1,'#877a83',g);box(0,0.08,0,0.1,0.08,0.6,'#877a83',g);}
  function desk(x,z,color,facing=0,leader=false){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=facing;scene.add(g);const w=leader?1.9:1.5;box(0,0.91,0.75,w,0.12,1.2,'#e0cbbb',g);[-1,1].forEach(s=>box(s*(w/2-0.1),0.45,0.75,0.08,0.85,0.94,'#f5efef',g));box(0,1.39,0.98,0.83,0.55,0.07,'#6c606f',g);box(0,1.39,0.935,0.72,0.43,0.015,'#ddc9d9',g);box(0,1.05,0.98,0.12,0.22,0.08,'#8d7a87',g);box(0,1,0.5,0.63,0.035,0.24,'#f8f2f4',g);box(0.53,1.04,0.67,0.13,0.22,0.13,color,g);chair(x,z,color,facing);}
  // Warm stone and oak shell, with a wide central circulation corridor.
  box(0,-0.34,0,36,0.68,26,'#ceb9b3');box(0,0.02,0,35.8,0.08,25.8,'#f1e8e3');
  for(let x=-17;x<18;x+=1.2)box(x,0.065,0,0.015,0.01,25.8,'#e5d9d2');
  box(0,1.5,-13,36,3,0.2,'#faf3f1');box(-18,0.7,0,0.2,1.4,26,'#f8eeed');
  TEAM_CENTERS.forEach(x=>{box(x,1.75,-12.85,4.5,1.7,0.07,'#d4cbdc');box(x,1.75,-12.78,0.05,1.7,0.04,'#f9f4f2');});
  DEPTS.forEach((dept,i)=>{const x=TEAM_CENTERS[i];box(x,0.1,-6.5,5.7,0.06,10.4,dept.color);box(x,0.145,-6.5,5.5,0.03,10.2,'#eee3e6');
    label(dept.name,x,0.55,-11.65,dept.color,0.7);
    // Four staff share a face-to-face island; the team lead sits at a separate desk.
    sim.employees.filter(e=>e.dept===i).forEach(e=>desk(...e.home,dept.color,e.facing,e.role==='팀장'));
    box(x,1.1,-6.7,3.3,0.25,0.07,'#bca2ac');label('TEAM LEAD',x,0.29,-1.3,'#a37a8c',0.29);plant(x+1.75,-10.65,0.85);
    if(i<4){const edge=x+3;box(edge,0.72,-6.5,0.12,1.4,10.4,'#d6c2ca');box(edge,1.46,-6.5,0.16,0.08,10.4,'#bda0af');box(edge,0.13,-6.5,0.35,0.17,10.4,'#c3adb7');}
  });
  label('LITTLE OFFICE  /  EVERYDAY, TOGETHER',0,0.35,1.1,'#b0909e',0.7);label('출입구 →',16.3,0.5,-0.6,'#b38599',0.46);
  const glass=new THREE.MeshPhysicalMaterial({color:'#e7d5e1',transparent:true,opacity:0.17,roughness:0.12,metalness:0.05,depthWrite:false,side:THREE.DoubleSide});
  const doors=[];
  function glassWall(x,z,width,depth){const isSide=depth>width;box(x,1.45,z,width,2.9,depth,glass).castShadow=false;box(x,0.12,z,isSide?0.12:width,0.15,isSide?depth:0.12,'#a28d9e');box(x,2.92,z,isSide?0.1:width,0.09,isSide?depth:0.1,'#a28d9e');if(isSide){[-1,1].forEach(s=>box(x,1.45,z+s*depth/2,0.09,2.9,0.09,'#ae98a7'));}else{[-1,1].forEach(s=>box(x+s*width/2,1.45,z,0.09,2.9,0.09,'#ae98a7'));}}
  function roomShell(r,index){const x=r.x;box(x,0.12,7.4,7.6,0.1,7.8,index===3?'#ead8cf':'#e6dbe3');box(x,0.18,7.4,7.3,0.03,7.5,index===3?'#f1e5dd':'#f1e8ed');glassWall(x-3.8,7.4,0.055,7.8);glassWall(x+3.8,7.4,0.055,7.8);glassWall(x,11.3,7.6,0.055);
    glassWall(x-0.95,3.5,5.7,0.055);glassWall(x+3.55,3.5,0.5,0.055);
    const door=new THREE.Group();door.position.set(x+2.6,0,3.5);scene.add(door);box(0,1.45,0,1.35,2.9,0.07,glass,door).castShadow=false;[-0.67,0.67].forEach(dx=>box(dx,1.45,0,0.06,2.9,0.08,'#a28d9e',door));box(0,2.9,0,1.4,0.07,0.1,'#a28d9e',door);box(-0.43,1.2,-0.09,0.05,0.36,0.07,'#8d7084',door);doors.push({group:door,x:x+2.6,open:0});
    label(r.name,x-0.5,2.32,3.4,'#96788b',0.63);label(index<2?'MEETING ROOM':index===2?'DIRECTOR’S OFFICE':'PANTRY & LOUNGE',x,0.48,11.7,'#b398a8',0.35);
  }
  ROOMS.forEach(roomShell);
  ROOMS.slice(0,2).forEach((r,i)=>{box(r.x,0.94,7.2,2.25,0.15,3.7,'#d4b7b7');box(r.x,0.47,7.2,0.6,0.88,2.6,'#c6a6b2');ROOM_SEATS[i].forEach(([x,z],n)=>chair(x,z,'#c7a8b8',n===5?0:n===4?Math.PI:(x<r.x?Math.PI/2:-Math.PI/2)));box(r.x,1.7,11.18,2.8,1.4,0.08,'#fdf7fa');box(r.x,1.65,11.1,1.8,0.025,0.025,'#c799b0');box(r.x-0.4,1.88,11.1,1,0.025,0.025,'#c799b0');plant(r.x-2.8,10.25,0.7);});
  desk(4,7.8,'#a3849e',Math.PI,true);box(4,0.6,10.7,4.6,1.2,0.6,'#c8afb6');box(4,1.23,10.7,4.7,0.08,0.7,'#ead8d0');plant(1.2,10,1.1);label('CEO',4,1.8,10.8,'#8e6e83',0.43);
  // A separate pantry: cabinetry, coffee machine, fridge, sink, shelves and a lounge.
  box(11.3,0.62,10.55,4.8,1.24,0.9,'#d1b9b8');box(11.3,1.29,10.55,4.95,0.1,1,'#f8f0ea');
  [9.8,11.2,12.6].forEach(x=>box(x,0.67,10.03,0.75,0.06,0.04,'#a38c97'));
  box(13.3,1.37,10.5,0.8,0.05,0.56,'#a69caa');box(13.3,1.65,10.8,0.05,0.55,0.05,'#a69caa');box(13.15,1.9,10.8,0.35,0.05,0.05,'#a69caa');
  box(10,1.66,10.4,0.85,0.7,0.65,'#6e5d6c');box(10,1.65,10.05,0.55,0.37,0.025,'#cfacbd');box(10,1.35,9.98,0.65,0.05,0.3,'#a78c9c');
  box(14.8,1.16,10.5,0.9,2.3,0.9,'#e7dce4');box(14.5,1.15,10.01,0.05,0.55,0.05,'#9a8796');
  box(12,2.25,10.9,4.2,0.09,0.55,'#bca1aa');[11,11.5,12,12.5].forEach(x=>box(x,2.4,10.8,0.19,0.24,0.19,'#f8ebef'));
  box(12,0.52,7.35,3.6,0.12,1.15,'#d5b6ac');[-1.4,0,1.4].forEach(dx=>{chair(12+dx,6.1,'#cba9b8',0);chair(12+dx,8.8,'#cba9b8',Math.PI);});plant(9.1,10,0.8);

  function speech(e){const c=document.createElement('canvas');c.width=512;c.height=176;const ctx=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,depthWrite:false}));sprite.scale.set(2.65,0.91,1);sprite.position.y=2.05+(e.seat%2)*0.28;sprite.renderOrder=10;
    let previous='';return {sprite,update(){const key=e.state+'-'+e.meetingKind;if(key===previous)return;previous=key;ctx.clearRect(0,0,512,176);ctx.fillStyle='#fff9fc';ctx.strokeStyle=e.role==='팀장'?'#be8aab':'#dfc8d6';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(5,4,502,145,25);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(239,148);ctx.lineTo(256,171);ctx.lineTo(273,148);ctx.fill();ctx.fillStyle=e.dept===5?'#88667f':DEPTS[e.dept].color;ctx.font='600 29px "Malgun Gothic",sans-serif';ctx.textAlign='center';ctx.fillText(`${e.name}${e.role==='팀원'?'':` · ${e.role}`}`,256,54);ctx.fillStyle='#685362';ctx.font='500 31px "Malgun Gothic",sans-serif';ctx.fillText(e.meetingKind==='leadership'&&e.state==='회의 중'?'대표·팀장 회의 중':e.state,256,108,465);tex.needsUpdate=true;}};
  }
  const avatars=sim.employees.map(e=>{
    const group=new THREE.Group(),body=new THREE.Group(),a=e.appearance;group.add(body);body.scale.set(a.build,a.height,1);
    box(0,0.88,0,0.48,0.61,0.32,a.top,body);
    // Collars, jacket lapels and individual accessories.
    box(0,1.11,0.17,0.2,0.15,0.035,'#f9efeb',body);
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
    const bubble=speech(e);group.add(bubble.sprite);group.traverse(o=>o.userData.employee=e);scene.add(group);return {group,body,legs,arms,bubble};
  });
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down;
  const pointerDown=e=>{down=[e.clientX,e.clientY];};
  const pointerUp=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(avatars.map(a=>a.group),true).filter(h=>h.object.userData.employee?.visible);if(hits[0])onSelect(hits[0].object.userData.employee.id);};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);
  function resize(){const r=canvas.parentElement.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
  const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
  return {render(time){
    doors.forEach(d=>{const nearby=sim.employees.some(e=>e.visible&&Math.abs(e.pos[0]-d.x)<1.6&&Math.abs(e.pos[1]-3.5)<2.1);d.open=THREE.MathUtils.lerp(d.open,nearby?1:0,0.15);d.group.position.x=d.x+d.open*1.4;});
    avatars.forEach((a,i)=>{const e=sim.employees[i],moving=e.path.length>0;const home=Math.hypot(e.pos[0]-e.home[0],e.pos[1]-e.home[1])<0.1;const seated=!moving&&(home||['회의 중','회의 대기'].includes(e.state));
      a.group.visible=e.visible;if(!e.visible)return;a.group.position.set(e.pos[0],moving?Math.sin(time*10+i)*0.035:0,e.pos[1]);
      if(moving){const p=e.path[0];a.body.rotation.y=Math.atan2(p[0]-e.pos[0],p[1]-e.pos[1]);}
      else if(home)a.body.rotation.y=e.facing;
      else if(e.state==='회의 참관 중')a.body.rotation.y=0;
      else if(e.state==='커피 마시는 중')a.body.rotation.y=e.pos[1]<7?0:Math.PI;
      else if(['회의 중','회의 대기'].includes(e.state)){const cx=ROOMS.find(r=>Math.abs(r.x-e.pos[0])<3.8)?.x??0;const seat=e.meetingSeat??e.seat;a.body.rotation.y=seat===5?0:seat===4?Math.PI:(e.pos[0]<cx?Math.PI/2:-Math.PI/2);}
      a.body.position.y=seated?-0.12:0;a.legs.forEach((l,j)=>{l.rotation.x=seated?-1.35:moving?Math.sin(time*10+j*Math.PI)*0.5:0;});a.arms.forEach((arm,j)=>{arm.rotation.x=moving?Math.sin(time*10+j*Math.PI+Math.PI)*0.4:seated?-0.65+Math.sin(time*5+j)*0.06:Math.sin(time*1.7+i)*0.04;});a.bubble.update();
    });controls.update();renderer.render(scene,camera);
  },reset(){camera.position.set(...initial);controls.target.set(0,0,0);},dispose(){observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);controls.dispose();const allMaterials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)allMaterials.add(o.material);});allMaterials.forEach(m=>{m.map?.dispose();m.dispose();});renderer.dispose();}};
}
