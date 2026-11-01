export const CAFETERIA={floor:3,kitchenDepth:26/3,kitchenBoundary:-13+26/3,tableXs:[-11,-1,9],tableZs:[1,5.5,10],staffSpots:[[-12,-8],[-6,-8],[0,-8],[6,-8],[13,-7]],pickup:[-16,-2.5],serving:[[-12,-2.5],[-6,-2.5],[0,-2.5],[6,-2.5]]};
export const CAFETERIA_SEATS=CAFETERIA.tableZs.flatMap(z=>CAFETERIA.tableXs.filter(x=>x!==9||z===1).flatMap(x=>[-1,1].flatMap(side=>[-2.2,0,2.2].map(dx=>[x+dx,z+side]))));
export const CAFE={floor:3,bounds:{left:2.9,right:17.8,front:8.4,back:12.8},entry:[14.8,7.5],customerAisleZ:9.1,staffAisleZ:11.8,staffExitX:17.1,queueStart:[11.2,8.6],queueSpacing:.65,order:[12,9.8],pickup:[15,9.8],staff:[[12,11.8],[15,11.8],[16.8,11.8]],tables:[[4.7,10.7],[7,10.7],[9.25,10.7]],seats:[[3.85,10.7],[5.55,10.7],[6.15,10.7],[7.85,10.7],[8.4,10.7],[10.1,10.7]]};
export const DIETITIAN_OFFICE={floor:3,bounds:{left:10.5,right:17.8,back:-12.8,front:CAFETERIA.kitchenBoundary},desk:[13,-10.7],seat:[13,-9.45],door:[14.5,CAFETERIA.kitchenBoundary],kitchenDoor:[10.5,-8.55],kitchenDoorWidth:2,staffPassage:{left:7.55,right:10.5,center:9.025},changing:[16.5,-11]};
export const KITCHEN_WORKFLOWS=[
  [{spot:[-16,-9.7],task:'냉장고에서 식재료 꺼내는 중',tool:'ingredients'}, {spot:[-12,-7.1],task:'식재료 세척·손질 중',tool:'knife'}, {spot:[-12,-9.5],task:'솥에 재료 넣고 볶는 중',tool:'ladle'}, {spot:[-12,-5.15],task:'완성 음식 배식통에 담는 중',tool:'food'}],
  [{spot:[-14,-9.7],task:'쌀·국 재료 꺼내는 중',tool:'ingredients'}, {spot:[-6,-7.1],task:'쌀 씻기·국 재료 손질 중',tool:'knife'}, {spot:[-6,-9.5],task:'밥 짓기·국 끓이는 중',tool:'ladle'}, {spot:[-6,-5.15],task:'밥·국 배식 준비 중',tool:'food'}],
  [{spot:[-16,-9.7],task:'반찬 재료 꺼내는 중',tool:'ingredients'}, {spot:[0,-7.1],task:'채소 썰기·반찬 준비 중',tool:'knife'}, {spot:[0,-9.5],task:'반찬 볶기·조리 중',tool:'ladle'}, {spot:[0,-5.15],task:'완성 반찬 배식통에 담는 중',tool:'food'}],
  [{spot:[8.7,-9.9],task:'조리도구 세척 중',tool:'wash'}, {spot:[6,-7.1],task:'식재료 세척·손질 중',tool:'knife'}, {spot:[6,-9.5],task:'반찬 조리·불 조절 중',tool:'ladle'}, {spot:[6,-5.15],task:'반찬 배식 준비 중',tool:'food'}],
  [{spot:[-14,-9.7],task:'식재료 입고·보관 상태 검수 중',tool:'clipboard'}, {spot:[0,-7.1],task:'전처리 위생 점검 중',tool:'clipboard'}, {spot:[6,-9.5],task:'조리 온도·영양 검수 중',tool:'clipboard'}, {spot:[13,-7],task:'식단·알레르기 정보 확인 중',tool:'clipboard'}],
];
export const STOCKROOM={floor:0,door:[9.6,-9.45],spots:[[11.3,-10.5],[14,-10.5],[16.8,-10.5]]};
export const DOCUMENT_STATION={
 cabinets:[{position:[-16.5,-3.3],spot:[-15.45,-3.3]},{position:[-16.5,-1.9],spot:[-15.45,-1.9]}],
 copier:{position:[-16.5,-.1],spot:[-15.05,-.1]},
 facing:Math.PI/2,
};
export const TEAM_CENTERS = [-12, -6, 0, 6, 12];
export const ROOMS = [{x:-12,name:'회의실 A'},{x:-4,name:'회의실 B'},{x:4,name:'대표실'},{x:12,name:'탕비실'}];
export const ENTRY = [18,.2];
export const LOBBY = {floor:0,dividerX:9.6,reception:[13,-4.4],staff:[13,-5.55],waiting:[13,-2.7],delivery:[13,-1],door:[9.6,0],elevator:[16.6,3.1],elevatorWall:[18,3.1],loungeSpots:[[12.1,9],[13.2,9],[14.3,9]],welcome:[11.8,7.8]};
export const ACTIVITY_VENUES={
 project:{name:'프로젝트룸',floor:1,spots:[[2,6],[3.3,6],[4.7,6],[6,6],[2.3,9.3],[5.7,9.3]]},
 collaboration:{name:'COLLABORATION LAB',floor:1,spots:[[11.2,-7.2],[12,-6],[14.1,-6],[14.4,-5.8]]},
 strategy:{name:'STRATEGY LOUNGE',floor:2,spots:[[4.4,-7],[4.5,-6],[7.5,-6],[7.8,-8]]},
};
export const TOUR_STOPS=[
  {floor:0,name:'1층 로비·안내 데스크',position:[12.1,-2.4]},
  {floor:0,name:'1층 영업·인사 업무 공간',position:[2,.7]},
  {floor:1,name:'2층 개발·기획·디자인 공간',position:[0,.7]},
  {floor:1,name:'2층 협업 라운지',position:[12.1,-3.3]},
  {floor:2,name:'3층 대표실',position:[5,5.2]},
  {floor:2,name:'3층 정원',position:[12.1,-2.6]},
];
export const RESTROOMS=[{name:'남자 화장실',sign:'MEN',x:-15.6,z:-6,color:'#95aabb'},{name:'여자 화장실',sign:'WOMEN',x:-15.6,z:-10.2,color:'#be9bad'}];
export const TEAM_SEATS = [
  {offset:[-1.2,-8.1],facing:0},{offset:[1.2,-8.1],facing:0},
  {offset:[-1.2,-4.1],facing:Math.PI},{offset:[1.2,-4.1],facing:Math.PI},
  {offset:[0,-11],facing:0},
];
export const ROOM_SEATS = ROOMS.slice(0,2).map(r=>[[r.x-1.75,6],[r.x+1.75,6],[r.x-1.75,8],[r.x+1.75,8],[r.x,9.8],[r.x,4.9],[r.x-1.75,9.8],[r.x+1.75,9.8],[r.x+1.75,4.9]]);
export const CEO_HOME = [4,7.8];
export const CEO_RECEIPT_SPOT = [5.2,5.3];
export const PANTRY_SPOTS = [[10.5,6.1],[12,6.1],[13.5,6.1],[10.5,8.8],[12,8.8],[13.5,8.8]];
export function pantrySpotsForFloor(floor){return PANTRY_SPOTS.map(([x,z])=>[x-(floor===0?8:0),z]);}
function restroomAt([x,z]){return RESTROOMS.find(room=>x>=room.x-1.8&&x<=room.x+1.85&&Math.abs(z-room.z)<1.94);}
function accessPath([x,z],floor) {
  if(floor===3){
    if(x>=CAFE.bounds.left&&x<=CAFE.bounds.right&&z>=CAFE.bounds.front){
      if(x>=10&&z>11.3)return [[x,CAFE.staffAisleZ],[CAFE.staffExitX,CAFE.staffAisleZ],[CAFE.staffExitX,CAFE.customerAisleZ],[15.5,CAFE.customerAisleZ],[15.5,7.5],[15.5,-1]];
      return [[x,CAFE.customerAisleZ],[15.5,CAFE.customerAisleZ],[15.5,7.5],[15.5,-1]];
    }
    if(x>DIETITIAN_OFFICE.bounds.left&&z<CAFETERIA.kitchenBoundary)return [[14.5,z],[14.5,-5.2],[14.5,-1]];
    if(z<CAFETERIA.kitchenBoundary){
      const side=z>-7.5&&x<DIETITIAN_OFFICE.staffPassage.left?x+2.35:x;
      const aisle=DIETITIAN_OFFICE.staffPassage.center;
      return [[side,z],[side,-8.55],[aisle,-8.55],[aisle,-1]];
    }
    if(z<0)return [[x,-1]];
    if(x>14)return [[15.5,z],[15.5,-1]];
    const cx=CAFETERIA.tableXs.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);
    const cz=CAFETERIA.tableZs.reduce((a,b)=>Math.abs(b-z)<Math.abs(a-z)?b:a);
    const aisleZ=cz+(z<cz?-1.65:1.65);
    return [[x,aisleZ],[cx+4.25,aisleZ],[cx+4.25,-1]];
  }
  if(floor===0&&x>9.4&&z<-6.7)return [[x,-9.45],[9.6,-9.45],[8.9,-9.45],[8.9,0]];
  if(floor===0&&Math.hypot(x-ENTRY[0],z-ENTRY[1])<.5)return [[16.6,ENTRY[1]],[16.6,0]];
  if(Math.hypot(x-LOBBY.elevator[0],z-LOBBY.elevator[1])<.4)return [[LOBBY.elevator[0],0]];
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
    const inside=p=>p[0]>=CAFE.bounds.left&&p[0]<=CAFE.bounds.right&&p[1]>=CAFE.bounds.front&&p[1]<=CAFE.bounds.back;
    const staffSide=p=>p[0]>=10&&p[1]>11.3;
    if(inside(from)&&inside(to)){
      const fromStaff=staffSide(from),toStaff=staffSide(to);
      const fromAisle=fromStaff?CAFE.staffAisleZ:CAFE.customerAisleZ,toAisle=toStaff?CAFE.staffAisleZ:CAFE.customerAisleZ;
      const turn=fromStaff!==toStaff?[[CAFE.staffExitX,fromAisle],[CAFE.staffExitX,toAisle]]:[];
      return [[from[0],fromAisle],...turn,[to[0],toAisle],[...to]];
    }
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
    lobbyPassage=[[10.5,0],[9.6,0],[8.6,0]];
    if(fromCorridor[0]<LOBBY.dividerX)lobbyPassage.reverse();
  }
  const points=[...outgoing,...lobbyPassage,...incoming.reverse(),[...to]];let previous=from;
  return points.filter(p=>{if(Math.hypot(p[0]-previous[0],p[1]-previous[1])<0.01)return false;previous=p;return true;});
}
