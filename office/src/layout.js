export const TEAM_CENTERS = [-12, -6, 0, 6, 12];
export const ROOMS = [{x:-12,name:'회의실 A'},{x:-4,name:'회의실 B'},{x:4,name:'대표실'},{x:12,name:'탕비실'}];
export const ENTRY = [18,0];
export const LOBBY = {floor:0,dividerX:9.6,reception:[13,-4.4],staff:[13,-5.55],waiting:[13,-2.7],door:[9.6,0],elevator:[15.8,-1.4]};
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
  {offset:[-0.85,-8.1],facing:0},{offset:[0.85,-8.1],facing:0},
  {offset:[-0.85,-5.3],facing:Math.PI},{offset:[0.85,-5.3],facing:Math.PI},
  {offset:[0,-2.4],facing:Math.PI},
];
export const ROOM_SEATS = ROOMS.slice(0,2).map(r=>[[r.x-1.75,6],[r.x+1.75,6],[r.x-1.75,8],[r.x+1.75,8],[r.x,9.8],[r.x,4.9],[r.x-1.75,9.8],[r.x+1.75,9.8]]);
export const CEO_HOME = [4,7.8];
export const PANTRY_SPOTS = [[10.5,6.1],[12,6.1],[13.5,6.1],[10.5,8.8],[12,8.8],[13.5,8.8]];
export function pantrySpotsForFloor(floor){return PANTRY_SPOTS.map(([x,z])=>[x-(floor===0?8:0),z]);}
function restroomAt([x,z]){return RESTROOMS.find(room=>x>=room.x-1.8&&x<=room.x+1.85&&Math.abs(z-room.z)<1.94);}
function accessPath([x,z],floor) {
  const restroom=restroomAt([x,z]);
  if(restroom)return [[restroom.x+.25,z],[restroom.x+.25,restroom.z],[restroom.x+1.75,restroom.z],[-13.1,restroom.z],[-13.1,-2.4],[-11.8,-2.4],[-11.8,0]];
  if(floor===LOBBY.floor&&Math.hypot(x-LOBBY.staff[0],z-LOBBY.staff[1])<0.4)return [[10.7,z],[10.7,0]];
  if(floor===LOBBY.floor&&x>=LOBBY.dividerX&&z<3)return [[x,0]];
  if(z < -1){const cx=TEAM_CENTERS.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);const side=cx+(x<cx?-2.35:2.35);return [[side,z],[side,0]];}
  if(z > 3){const r=ROOMS.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);const side=r.x+(x<r.x?-2.8:2.8);return [[side,z],[side,4.5],[r.x+2.6,4.5],[r.x+2.6,0]];}
  return [[x,0]];
}
export function planRoute(from,to,floor){
  const fromRestroom=restroomAt(from),toRestroom=restroomAt(to);
  if(fromRestroom&&fromRestroom===toRestroom)return [[fromRestroom.x+.25,from[1]],[fromRestroom.x+.25,to[1]],[...to]];
  // Room doors, the lobby entrance and its privacy screen are real route waypoints.
  const outgoing=accessPath(from,floor),incoming=accessPath(to,floor);
  const fromCorridor=outgoing.at(-1),toCorridor=incoming.at(-1);
  let lobbyPassage=[];
  if(floor===LOBBY.floor&&(fromCorridor[0]>=LOBBY.dividerX)!==(toCorridor[0]>=LOBBY.dividerX)){
    lobbyPassage=[[10.5,0],[9.6,0],[8.6,0],[8.6,1.9],[6.8,1.9],[6.8,0]];
    if(fromCorridor[0]<LOBBY.dividerX)lobbyPassage.reverse();
  }
  const points=[...outgoing,...lobbyPassage,...incoming.reverse(),[...to]];let previous=from;
  return points.filter(p=>{if(Math.hypot(p[0]-previous[0],p[1]-previous[1])<0.01)return false;previous=p;return true;});
}
