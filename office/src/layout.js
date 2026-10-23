export const TEAM_CENTERS = [-12, -6, 0, 6, 12];
export const ROOMS = [{x:-12,name:'회의실 A'},{x:-4,name:'회의실 B'},{x:4,name:'대표실'},{x:12,name:'탕비실'}];
export const ENTRY = [18,0];
export const TEAM_SEATS = [
  {offset:[-0.85,-8.1],facing:0},{offset:[0.85,-8.1],facing:0},
  {offset:[-0.85,-5.3],facing:Math.PI},{offset:[0.85,-5.3],facing:Math.PI},
  {offset:[0,-2.4],facing:Math.PI},
];
export const ROOM_SEATS = ROOMS.slice(0,2).map(r=>[[r.x-1.75,6],[r.x+1.75,6],[r.x-1.75,8],[r.x+1.75,8],[r.x,9.8],[r.x,4.9]]);
export const CEO_HOME = [4,7.8];
export const PANTRY_SPOTS = [[10.5,6.1],[12,6.1],[13.5,6.1],[10.5,8.8],[12,8.8],[13.5,8.8]];
function accessPath([x,z]) {
  if(z < -1){const cx=TEAM_CENTERS.reduce((a,b)=>Math.abs(b-x)<Math.abs(a-x)?b:a);const side=cx+(x<cx?-2.35:2.35);return [[side,z],[side,0]];}
  if(z > 3){const r=ROOMS.reduce((a,b)=>Math.abs(b.x-x)<Math.abs(a.x-x)?b:a);const side=r.x+(x<r.x?-2.8:2.8);return [[side,z],[side,4.5],[r.x+2.6,4.5],[r.x+2.6,0]];}
  return [[x,0]];
}
export function planRoute(from,to){
  // Every room route passes through its real door; desk routes use side aisles.
  const points=[...accessPath(from),...accessPath(to).reverse(),[...to]];let previous=from;
  return points.filter(p=>{if(Math.hypot(p[0]-previous[0],p[1]-previous[1])<0.01)return false;previous=p;return true;});
}
