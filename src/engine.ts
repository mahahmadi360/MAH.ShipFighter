export type Direction=0|1|2|3; // stern → bow: right, down, left, up
export type Ship={id:number;name:string;size:number;row:number;col:number;vertical:boolean;direction?:Direction};
export type Player={ships:Ship[];shots:Record<number,boolean>};
export const heading=(s:Ship):Direction=>s.direction??(s.vertical?1:0);
const vectors=[[0,1],[1,0],[0,-1],[-1,0]] as const;
export const positions=(s:Ship)=>{const [dy,dx]=vectors[heading(s)];return Array.from({length:s.size},(_,n)=>({row:s.row+dy*n,col:s.col+dx*n}));};
const inside=({row,col}:{row:number;col:number})=>row>=0&&row<10&&col>=0&&col<10;
/** Only real grid cells; out-of-range columns must never wrap into another row. */
export const cells=(s:Ship):number[]=>positions(s).filter(inside).map(p=>p.row*10+p.col);
export const inBounds=(s:Ship):boolean=>Number.isInteger(s.row)&&Number.isInteger(s.col)&&positions(s).every(inside);
export const canPlace=(s:Ship):boolean=>Number.isInteger(s.row)&&Number.isInteger(s.col)&&cells(s).length>0;
export const bounds=(s:Ship)=>{const p=positions(s);return {row:Math.min(...p.map(p=>p.row)),col:Math.min(...p.map(p=>p.col))};};
export const fleet=():Ship[]=>[5,4,3,3,2].map((size,id)=>({id,name:['Carrier','Battleship','Cruiser','Submarine','Destroyer'][id],size,row:id*2,col:1,vertical:false,direction:0}));
export function moveShip(s:Ship,row:number,col:number,segment=0):Ship{const [dy,dx]=vectors[heading(s)];return {...s,row:row-dy*segment,col:col-dx*segment};}
/** Rotate around the tapped segment so it stays visible even at the edge. */
export function rotateShip(s:Ship,pivot=cells(s)[0]):Ship{
 const segment=positions(s).findIndex(p=>inside(p)&&p.row*10+p.col===pivot);
 const direction=((heading(s)+1)%4) as Direction;
 return moveShip({...s,direction,vertical:direction%2===1},Math.floor(pivot/10),pivot%10,Math.max(0,segment));
}
export function valid(ship:Ship,ships:Ship[]):boolean{
 if(!inBounds(ship))return false;
 const occupied=new Set(ships.filter(s=>s.id!==ship.id).flatMap(cells));return cells(ship).every(c=>!occupied.has(c));
}
export const fleetValid=(ships:Ship[]):boolean=>ships.length===5&&ships.every(s=>valid(s,ships));
export function shoot(attacker:Player,defender:Player,cell:number):{hit:boolean;won:boolean}|null{
 if(!Number.isInteger(cell)||cell<0||cell>99||Object.hasOwn(attacker.shots,cell))return null;
 const hit=defender.ships.some(s=>cells(s).includes(cell));attacker.shots[cell]=hit;
 return {hit,won:defender.ships.flatMap(cells).every(c=>attacker.shots[c]===true)};
}
export function randomFleet():Ship[]{
 const result:Ship[]=[];
 for(const original of fleet()){
  let placed=false;
  for(let n=0;n<2000&&!placed;n++){
   const direction=Math.floor(Math.random()*4) as Direction;
   const s={...original,row:Math.floor(Math.random()*10),col:Math.floor(Math.random()*10),direction,vertical:direction%2===1};
   if(valid(s,result)){result.push(s);placed=true;}
  }
  if(!placed)return randomFleet();
 }
 return result;
}
