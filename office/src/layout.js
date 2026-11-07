export const CAFETERIA={floor:3,kitchenDepth:26/3,kitchenBoundary:-13+26/3,tableXs:[-10.2,-1.8],tableZs:[.5,3.7,6.9,10.1],extraTables:[],staffSpots:[[-12,-8],[-6,-8],[0,-8],[6,-8],[13,-7]],pickup:[-16,-2.5],serving:[[-12,-2.5],[-6,-2.5],[0,-2.5],[6,-2.5]]};
export const STAFF_ROOM={floor:3,bounds:{left:-17.8,right:-14,front:5.4,back:12.8},door:[-14,8.5],changing:[[-16.7,6.8],[-15.5,6.8],[-16.7,7.6],[-15.5,7.6]],rest:[[-16.8,10.7],[-15.6,10.7],[-16.8,11.7],[-15.6,11.7]]};
export const CAFETERIA_SEATS=CAFETERIA.tableZs.flatMap(z=>CAFETERIA.tableXs.flatMap(x=>[-1,1].flatMap(side=>[-2.2,0,2.2].map(dx=>[x+dx,z+side])))).concat(CAFETERIA.extraTables.flatMap(([x,z])=>[-1,1].flatMap(side=>[-2.2,0,2.2].map(dx=>[x+dx,z+side]))));
export const CAFE={floor:3,bounds:{left:18,right:30,front:5.4,back:12.8},entry:[23.3,4.6],sideEntry:[18,9.1],customerAisleZ:9.1,staffAisleZ:11.8,staffExitX:29.3,queueStart:[23.4,8.6],queueSpacing:.65,order:[24.2,9.8],pickup:[27.2,9.8],staff:[[24.2,11.8],[27.2,11.8],[29,11.8]],tables:[[19.7,6.3],[19.7,7.9],[19.7,10.7]],seats:[[18.85,6.3],[20.55,6.3],[18.85,7.9],[20.55,7.9],[18.85,10.7],[20.55,10.7]]};
export const DIETITIAN_OFFICE={floor:3,bounds:{left:10.5,right:17.8,back:-12.8,front:CAFETERIA.kitchenBoundary},desk:[13,-10.7],seat:[13,-11.95],door:[14.5,CAFETERIA.kitchenBoundary],kitchenDoor:[10.5,-8.55],kitchenDoorWidth:2,staffPassage:{left:7.55,right:10.5,center:9.025},changing:[16.5,-11]};
export const KITCHEN_WORKFLOWS=[
  [{spot:[-16,-9.7],task:'냉장고에서 식재료 꺼내는 중',tool:'ingredients'}, {spot:[-12,-7.1],task:'식재료 세척·손질 중',tool:'knife'}, {spot:[-12,-9.5],task:'솥에 재료 넣고 볶는 중',tool:'ladle'}, {spot:[-12,-5.15],task:'완성 음식 배식통에 담는 중',tool:'food'}],
  [{spot:[-14,-9.7],task:'쌀·국 재료 꺼내는 중',tool:'ingredients'}, {spot:[-6,-7.1],task:'쌀 씻기·국 재료 손질 중',tool:'knife'}, {spot:[-6,-9.5],task:'밥 짓기·국 끓이는 중',tool:'ladle'}, {spot:[-6,-5.15],task:'밥·국 배식 준비 중',tool:'food'}],
  [{spot:[-16,-9.7],task:'반찬 재료 꺼내는 중',tool:'ingredients'}, {spot:[0,-7.1],task:'채소 썰기·반찬 준비 중',tool:'knife'}, {spot:[0,-9.5],task:'반찬 볶기·조리 중',tool:'ladle'}, {spot:[0,-5.15],task:'완성 반찬 배식통에 담는 중',tool:'food'}],
  [{spot:[8.7,-9.9],task:'조리도구 세척 중',tool:'wash'}, {spot:[6,-7.1],task:'식재료 세척·손질 중',tool:'knife'}, {spot:[6,-9.5],task:'반찬 조리·불 조절 중',tool:'ladle'}, {spot:[6,-5.15],task:'반찬 배식 준비 중',tool:'food'}],
  [{spot:[-14,-9.7],task:'식재료 입고·보관 상태 검수 중',tool:'clipboard'}, {spot:[0,-7.1],task:'전처리 위생 점검 중',tool:'clipboard'}, {spot:[6,-9.5],task:'조리 온도·영양 검수 중',tool:'clipboard'}, {spot:[13,-7],task:'식단·알레르기 정보 확인 중',tool:'clipboard'}],
];
export const STOCKROOM={floor:0,bounds:{left:8.3,right:17.8,front:3.5,back:12.6},door:[12,3.5],doorWidth:1.5,shelfXs:[10.6,13.2,15.8],spots:[[10.6,10.3],[13.2,10.3],[15.8,10.3]]};
export const DOCUMENT_STATION={
 cabinets:[{position:[-16.5,-3.3],spot:[-15.45,-3.3]},{position:[-16.5,-1.9],spot:[-15.45,-1.9]}],
 copier:{position:[-16.5,-.1],spot:[-15.05,-.1]},
 facing:Math.PI/2,
};
export const TEAM_CENTERS = [-6,0,6];
export const TEAM_BAYS=TEAM_CENTERS;
export const TEAM_PREFERRED_FLOORS=[0,0,2,1,1,1,2,0];
export function teamBaysForFloor(floor){return [...TEAM_BAYS.map(x=>({x,zOffset:0})),...(floor===1?[{x:12,zOffset:14}]:[])];}
export function allocateDepartments(departments){
  const used=[0,0,0];
  return departments.map((department,index)=>{
    if(!department.names?.length||department.names.length>TEAM_SEATS.length)throw new Error(`${department.name}: 팀 공간 한 칸은 팀장 포함 1~5명을 수용합니다.`);
    const preferred=department.floor??TEAM_PREFERRED_FLOORS[index];
    const floor=Number.isInteger(preferred)&&preferred>=0&&preferred<3&&used[preferred]<teamBaysForFloor(preferred).length?preferred:used.findIndex((count,floor)=>count<teamBaysForFloor(floor).length);
    if(floor<0)throw new Error('업무 공간 10개가 모두 사용 중입니다. 업무 층 또는 팀 공간을 확장해 주세요.');
    return {dept:index,floor,...teamBaysForFloor(floor)[used[floor]++],capacity:TEAM_SEATS.length};
  });
}
export const ROOMS = [{x:-12,name:'회의실 A'},{x:-4,name:'회의실 B'},{x:4,name:'대표실'},{x:12,name:'탕비실'}];
export const ENTRANCE_HALL={bounds:{left:18,right:30,front:-6,back:12.8},companyDoor:[18,.2],streetDoor:[30,7],liftX:23.3,liftXs:[21.3,25.3],accessX:28.3};
// The pantry partition begins at the outside edge of the main entrance jamb.
const pantryFront=ENTRANCE_HALL.companyDoor[1]+4.8/2+.14;
export const PANTRY_ROOM={left:18,right:30,front:pantryFront,back:ENTRANCE_HALL.bounds.back,depth:7,floorWidth:8,centerX:23,furnitureCenterZ:8.8,scale:1,doorX:ENTRANCE_HALL.accessX,doorWidth:2.8};
export const ENTRY = [...ENTRANCE_HALL.streetDoor];
export function elevatorDoor(index=0){return [ENTRANCE_HALL.liftXs[index],ENTRANCE_HALL.bounds.front];}
export function elevatorLanding(floor,index=0){return [ENTRANCE_HALL.liftXs[index],-4.4];}
export function elevatorQueuePoint(index,slot=0){return [ENTRANCE_HALL.liftXs[index]+(slot%4-1.5)*.6,-4.8+Math.floor(slot/4)*.65];}
function hallAccessPath([x,z]){return z>1.5?[[ENTRANCE_HALL.accessX,z],[ENTRANCE_HALL.accessX,.2]]:[[x,.2]];}
export const floorLevel=floor=>floor===3?-1:floor;
export const LOBBY = {floor:0,dividerX:18,reception:[23,10],staff:[23,11.2],waiting:[23,8.4],delivery:[26,8.4],door:[18,.2],elevator:elevatorLanding(0),elevatorWall:elevatorDoor(0),loungeCenter:[23,4.6],loungeSpots:[[21.8,4.6],[23,4.6],[24.2,4.6]],welcome:[25.6,6.2]};
export const ACTIVITY_VENUES={
 project:{name:'프로젝트룸',floor:1,spots:[[2,6],[3.3,6],[4.7,6],[6,6],[2.3,9.3],[5.7,9.3]]},
 strategy:{name:'STRATEGY LOUNGE',floor:2,spots:[[4.4,-7],[4.5,-6],[7.5,-6],[7.8,-8]]},
};
export const TOUR_STOPS=[
  {floor:0,name:'1층 로비·안내 데스크',position:[26,6.2]},
  {floor:0,name:'1층 영업·인사 업무 공간',position:[2,.7]},
  {floor:1,name:'2층 개발·기획·디자인 공간',position:[0,.7]},
  {floor:2,name:'3층 회장실',position:[3.2,4.4]},
  {floor:2,name:'3층 정원',position:[12.1,-2.6]},
];
export const RESTROOMS=[{name:'남자 화장실',sign:'MEN',x:-15.6,z:-6,color:'#95aabb'},{name:'여자 화장실',sign:'WOMEN',x:-15.6,z:-10.2,color:'#be9bad'}];
export const TEAM_SEATS = [
  {offset:[-1.2,-8.1],facing:0},{offset:[1.2,-8.1],facing:0},
  {offset:[-1.2,-4.1],facing:Math.PI},{offset:[1.2,-4.1],facing:Math.PI},
  {offset:[0,-11],facing:0},
];
export const ROOM_SEATS = ROOMS.slice(0,2).map(r=>[[r.x-1.75,6],[r.x+1.75,6],[r.x-1.75,8],[r.x+1.75,8],[r.x,9.8],[r.x,4.9]]);
export const BOARDROOM={name:'대회의실',x:-8.25,bounds:{left:-16,right:-.5,front:3.5,back:12.5},door:[-2.3,3.5],visitor:[-2.3,4.4],table:[-8.2,8]};
export const BOARDROOM_SEATS=[[-14.7,8],...[-12.6,-10.4,-8.2,-6,-3.8].flatMap(x=>[[x,5.9],[x,10.1]]),[-1.7,8]];
export const CHAIRMAN_OFFICE={name:'회장실',bounds:{left:.5,right:17.6,front:3.5,back:12.5},door:[3.2,3.5],reception:[4.9,7.5],desk:[12.4,9.1]};
export function meetingSeatsForFloor(floor,room=0){return floor===2?BOARDROOM_SEATS:ROOM_SEATS[room];}
export function meetingRoomForFloor(floor,room=0){return floor===2?BOARDROOM:{...ROOMS[room],bounds:{left:ROOMS[room].x-3.8,right:ROOMS[room].x+3.8,front:3.5,back:11.3},door:[ROOMS[room].x+2.6,3.5],visitor:[ROOMS[room].x,4.9]};}
export function meetingRoomName(floor,room=0){return meetingRoomForFloor(floor,room).name;}
export const CEO_HOME = [12.4,10.5];
export const CEO_RECEIPT_SPOT = [14.9,7.3];
export const PANTRY_SPOTS = [[10.5,6.1],[12,6.1],[13.5,6.1],[10.5,8.8],[12,8.8],[13.5,8.8]];
export function pantryPositionForFloor([x,z],floor){
  if(floor===0)return [x-8,z];
  // Fit the kitchen run against the original rear wall, allowing for shelf depth.
  const targetZ=z>=9.8?z+PANTRY_ROOM.back-.05-11.175:PANTRY_ROOM.furnitureCenterZ+(z-7.4)*PANTRY_ROOM.scale;
  return [PANTRY_ROOM.centerX+(x-12)*PANTRY_ROOM.scale,targetZ];
}
export function pantrySpotsForFloor(floor){return PANTRY_SPOTS.map(point=>pantryPositionForFloor(point,floor));}
function restroomAt([x,z]){return RESTROOMS.find(room=>x>=room.x-1.8&&x<=room.x+1.85&&Math.abs(z-room.z)<1.94);}
function inCafe([x,z]){return x>=CAFE.bounds.left&&x<=CAFE.bounds.right&&z>=CAFE.bounds.front&&z<=CAFE.bounds.back;}
function cafeAislePath([x,z]){
  if(x<CAFE.bounds.left+4.4){const side=x<CAFE.tables[0][0]?CAFE.bounds.left+.4:CAFE.bounds.left+3.4;return [[side,z],[side,CAFE.customerAisleZ]];}
  if(z>11.3)return [[x,CAFE.staffAisleZ],[CAFE.staffExitX,CAFE.staffAisleZ],[CAFE.staffExitX,CAFE.customerAisleZ]];
  return [[x,CAFE.customerAisleZ]];
}
function cafeExitPath(point){return [...cafeAislePath(point),[CAFE.entry[0],CAFE.customerAisleZ],[CAFE.entry[0],CAFE.bounds.front],[...CAFE.entry]];}
function accessPath([x,z],floor) {
  if(floor===2&&z>=3.5&&x>=-16&&x<=17.6){
    if(x<0){
      const [doorX,doorZ]=BOARDROOM.door;
      if(z<5)return [[x,4.6],[doorX,4.6],[doorX,doorZ],[doorX,0]];
      const aisle=x<-14?-15.4:x>-2.5?-.95:null;
      if(aisle!=null)return [[aisle,z],[aisle,4.6],[doorX,4.6],[doorX,doorZ],[doorX,0]];
      if(z<8)return [[x,4.8],[doorX,4.8],[doorX,doorZ],[doorX,0]];
      return [[x,11.2],[-.95,11.2],[-.95,4.6],[doorX,4.6],[doorX,doorZ],[doorX,0]];
    }
    const [doorX,doorZ]=CHAIRMAN_OFFICE.door;
    if(z<5)return [[x,4.4],[doorX,4.4],[doorX,doorZ],[doorX,0]];
    const aisle=x<8?1.4:16.5;
    return [[aisle,z],[aisle,4.4],[doorX,4.4],[doorX,doorZ],[doorX,0]];
  }
  if(floor===CAFE.floor&&inCafe([x,z]))return [...cafeExitPath([x,z]),[CAFE.entry[0],.2],[18,.2],[16.6,.2],[16.6,-1]];
  if(x>=ENTRANCE_HALL.bounds.left)return [...(floor!==0&&floor!==3&&z>1.5?[[x<23.5?20:27,z],[x<23.5?20:27,2.2],[ENTRANCE_HALL.accessX,2.2],[ENTRANCE_HALL.accessX,.2]]:hallAccessPath([x,z])),[18,.2],[16.6,.2],[16.6,floor===3?-1:0]];
  if(floor===3){
    if(x>=STAFF_ROOM.bounds.left&&x<=STAFF_ROOM.bounds.right&&z>=STAFF_ROOM.bounds.front&&z<=STAFF_ROOM.bounds.back)return [[-15,z],[-15,STAFF_ROOM.door[1]],[...STAFF_ROOM.door],[-6,STAFF_ROOM.door[1]],[-6,-1]];
    if(x>DIETITIAN_OFFICE.bounds.left&&z<CAFETERIA.kitchenBoundary)return [[14.5,z],[14.5,-5.2],[14.5,-1]];
    if(z<CAFETERIA.kitchenBoundary){
      const side=z>-7.5&&x<DIETITIAN_OFFICE.staffPassage.left?x+2.35:x;
      const aisle=DIETITIAN_OFFICE.staffPassage.center;
      return [[side,z],[side,-8.55],[aisle,-8.55],[aisle,-1]];
    }
    const extra=CAFETERIA.extraTables.find(([tx,tz])=>Math.abs(x-tx)<3.6&&Math.abs(z-tz)<=1.2);
    if(extra){const [tx,tz]=extra,aisle=tz+(z<tz?-1.65:1.65);return [[x,aisle],[tx+4.25,aisle],[tx+4.25,-1]];}
    if(z<0)return [[x,-1]];
    if(x>14)return [[15.5,z],[15.5,-1]];
    const cx=CAFETERIA.tableXs.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
    const cz=CAFETERIA.tableZs.reduce((a,b)=>Math.abs(b-z)<Math.abs(a-z)?b:a);
    const aisleZ=cz+(z<cz?-1.65:1.65);
    return [[x,aisleZ],[cx+4.25,aisleZ],[cx+4.25,-1]];
  }
  if(floor===STOCKROOM.floor&&x>=STOCKROOM.bounds.left&&x<=STOCKROOM.bounds.right&&z>=STOCKROOM.bounds.front&&z<=STOCKROOM.bounds.back)return [[x,9.5],[STOCKROOM.door[0],9.5],[...STOCKROOM.door],[STOCKROOM.door[0],1.5],[STOCKROOM.door[0],0]];
  if(x<-14&&z>-4.05&&z<1.6)return [[-15.05,z],[-15.05,1.5],[-11.8,1.5],[-11.8,0]];
  const restroom=restroomAt([x,z]);
  if(restroom)return [[restroom.x+.25,z],[restroom.x+.25,restroom.z],[restroom.x+1.75,restroom.z],[-13.1,restroom.z],[-13.1,-2.4],[-11.8,-2.4],[-11.8,0]];
  if(floor===LOBBY.floor&&Math.hypot(x-LOBBY.staff[0],z-LOBBY.staff[1])<0.4)return [[10.7,z],[10.7,0]];
  if(floor===LOBBY.floor&&x>=LOBBY.dividerX&&z<3)return [[x,0]];
  if(z < -1){
    const cx=TEAM_CENTERS.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
    // Side aisles fit between the enlarged desktops and the thin dividing walls.
    const side=cx+(x<cx?-2.65:2.65);
    const seat=TEAM_SEATS.find(s=>Math.abs(z-s.offset[1])<.2&&Math.abs(x-cx-s.offset[0])<.85);
    const exitZ=seat?z-Math.cos(seat.facing)*.4:z;
    return [[x,exitZ],[side,exitZ],[side,0]];
  }
  if(z > 3){const r=ROOMS.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);const side=r.x+(x<r.x?-2.8:2.8);return [[side,z],[side,4.5],[r.x+2.6,4.5],[r.x+2.6,0]];}
  return [[x,0]];
}
export function planRoute(from,to,floor){
  if(floor===CAFE.floor){
    const fromInside=inCafe(from),toInside=inCafe(to);
    const onApron=p=>p[0]>=CAFE.bounds.left&&p[0]<=CAFE.bounds.right&&p[1]>=ENTRANCE_HALL.bounds.front&&p[1]<CAFE.bounds.front;
    if(fromInside&&toInside){
      if(from[0]>=22.4&&to[0]>=22.4&&from[1]>11.3&&to[1]>11.3)return [[from[0],CAFE.staffAisleZ],[to[0],CAFE.staffAisleZ],[...to]];
      return [...cafeAislePath(from),...cafeAislePath(to).reverse(),[...to]];
    }
    if(fromInside||toInside){
      const outside=fromInside?to:from,inside=fromInside?from:to;
      const approach=onApron(outside)?[[...CAFE.entry]]:planRoute(outside,CAFE.entry,floor);
      const points=[...approach,...cafeExitPath(inside).reverse(),[...inside]];
      return fromInside?[...points.reverse(),[...outside]]:points;
    }
    if(onApron(from)&&onApron(to))return [[...to]];
  }
  if(from[0]>=18&&to[0]>=18){
    const points=[...hallAccessPath(from),...hallAccessPath(to).reverse(),[...to]];let previous=from;
    return points.filter(p=>{if(Math.hypot(p[0]-previous[0],p[1]-previous[1])<.01)return false;previous=p;return true;});
  }
  if(floor===3&&from[1]<CAFETERIA.kitchenBoundary&&to[1]<CAFETERIA.kitchenBoundary){
    const inOffice=p=>p[0]>DIETITIAN_OFFICE.bounds.left;
    if(inOffice(from)&&inOffice(to))return [[14.5,from[1]],[14.5,to[1]],[...to]];
    if(inOffice(from)!==inOffice(to)){
      const officePoint=inOffice(from)?from:to,kitchenPoint=inOffice(from)?to:from;
      const [doorX,doorZ]=DIETITIAN_OFFICE.kitchenDoor;
      const kitchenPath=accessPath(kitchenPoint,floor).slice(0,-2);
      const officeToKitchen=[[14.5,officePoint[1]],[14.5,doorZ],[doorX+.8,doorZ],[doorX,doorZ],[doorX-.8,doorZ],...kitchenPath.reverse(),[...kitchenPoint]];
      return inOffice(from)?officeToKitchen:[...officeToKitchen.slice(0,-1).reverse(),[...officePoint]];
    }
  }
  if(floor===3&&from[0]<=10.5&&to[0]<=10.5&&from[1]<CAFETERIA.kitchenBoundary&&to[1]<CAFETERIA.kitchenBoundary){
    return [...accessPath(from,floor).slice(0,-2),...accessPath(to,floor).slice(0,-2).reverse(),[...to]];
  }
  const fromRestroom=restroomAt(from),toRestroom=restroomAt(to);
  if(fromRestroom&&fromRestroom===toRestroom)return [[fromRestroom.x+.25,from[1]],[fromRestroom.x+.25,to[1]],[...to]];
  // Room doors, the lobby entrance and its privacy screen are real route waypoints.
  const outgoing=accessPath(from,floor),incoming=accessPath(to,floor);
  const fromCorridor=outgoing.at(-1),toCorridor=incoming.at(-1);
  let lobbyPassage=[];
  if(floor===LOBBY.floor&&(fromCorridor[0]>=LOBBY.dividerX)!==(toCorridor[0]>=LOBBY.dividerX)){
    lobbyPassage=[[18.6,.2],[18,.2],[16.6,.2]];
    if(fromCorridor[0]<LOBBY.dividerX)lobbyPassage.reverse();
  }
  const points=[...outgoing,...lobbyPassage,...incoming.reverse(),[...to]];let previous=from;
  return points.filter(p=>{if(Math.hypot(p[0]-previous[0],p[1]-previous[1])<0.01)return false;previous=p;return true;});
}
