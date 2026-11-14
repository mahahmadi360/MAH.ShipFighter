export type Ship = { id:number; name:string; size:number; row:number; col:number; vertical:boolean };
export type Player = { ships:Ship[]; shots:Record<number,boolean> };
export const fleet = ():Ship[] => [5,4,3,3,2].map((size,id)=>({id,name:['Carrier','Battleship','Cruiser','Submarine','Destroyer'][id],size,row:id*2,col:1,vertical:false}));
export const cells = (s:Ship):number[] => Array.from({length:s.size},(_,n)=>(s.row+(s.vertical?n:0))*10+s.col+(s.vertical?0:n));
export function valid(ship:Ship, ships:Ship[]):boolean {
 if(ship.row<0||ship.col<0||ship.row+(ship.vertical?ship.size:1)>10||ship.col+(ship.vertical?1:ship.size)>10)return false;
 const occupied=new Set(ships.filter(s=>s.id!==ship.id).flatMap(cells));
 return cells(ship).every(c=>!occupied.has(c));
}
export function shoot(attacker:Player,defender:Player,cell:number):{hit:boolean;won:boolean}|null {
 if(!Number.isInteger(cell)||cell<0||cell>99||Object.hasOwn(attacker.shots,cell))return null;
 const hit=defender.ships.some(s=>cells(s).includes(cell)); attacker.shots[cell]=hit;
 return {hit,won:defender.ships.flatMap(cells).every(c=>attacker.shots[c]===true)};
}
export function randomFleet():Ship[] {
 const result:Ship[]=[];
 for(const original of fleet()) { let placed=false; for(let n=0;n<2000&&!placed;n++){ const s={...original,row:Math.floor(Math.random()*10),col:Math.floor(Math.random()*10),vertical:Math.random()<.5};if(valid(s,result)){result.push(s);placed=true;}}if(!placed)return randomFleet(); }
 return result;
}
