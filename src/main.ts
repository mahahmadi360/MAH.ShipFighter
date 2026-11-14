import {Component,ChangeDetectorRef} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {version as appVersion} from '../package.json';
import {cells,fleet,valid,shoot,randomFleet,Ship,Player} from './engine';
@Component({selector:'app-root',standalone:true,template:`
<div class="app" [class.red]="active===1">
<header><a class="brand" href="./">SHIP<span>FIGHTER</span><small class="app-version" aria-label="Application version">{{version}}</small></a><button class="reset" (click)="restart=true">↻ New Game</button></header>
<main [attr.inert]="handoff||restart||winnerOpen?'':null">
<div class="playfield"><div class="board" role="group" [attr.aria-label]="'Player '+(active+1)+(phase==='setup'?' fleet placement':' targeting grid')" (pointermove)="move($event)" (pointerup)="endDrag($event)" (pointercancel)="cancelDrag()">
@for(cell of grid;track cell){<button class="cell" [class.ship-cell]="phase==='setup'&&occupant(cell)!==undefined" [class.hit]="phase!=='setup'&&players[active].shots[cell]===true" [class.miss]="phase!=='setup'&&players[active].shots[cell]===false" [class.target]="selected===cell" [class.ghost]="ghost.includes(cell)" [class.invalid]="ghost.includes(cell)&&!ghostValid" [disabled]="phase==='finished'||result!==''" [attr.aria-label]="coordinate(cell)+(phase==='setup'&&occupant(cell)!==undefined?' ship':phase!=='setup'&&players[active].shots[cell]===true?' hit':phase!=='setup'&&players[active].shots[cell]===false?' miss':'')" (pointerdown)="begin($event,cell)" (click)="choose(cell)">{{phase!=='setup'&&players[active].shots[cell]===true?'×':phase!=='setup'&&players[active].shots[cell]===false?'•':selected===cell?'⊕':''}}</button>}
@if(phase==='setup'){@for(ship of players[active].ships;track ship.id){<div class="vessel" [class.vertical]="ship.vertical" [style.left.%]="ship.col*10+.5" [style.top.%]="ship.row*10+.5" [style.width.%]="(ship.vertical?1:ship.size)*10-1" [style.height.%]="(ship.vertical?ship.size:1)*10-1"><span></span><b>{{ship.size}}</b></div>}}
</div></div>
<div class="legend"><span><i class="legend-ship"></i>{{phase==='setup'?'Ship':'Uncharted'}}</span><span><i class="legend-hit"></i>Hit</span><span><i class="legend-miss"></i>Miss</span></div>
<div class="controls">
@if(phase==='setup'){<button class="secondary" (click)="shuffle()" aria-label="Randomize fleet">⇄</button><button class="primary" (click)="ready()">Confirm fleet</button>}
@else{<button class="primary" [disabled]="selected===null||phase==='finished'||result!==''" (click)="fire()">{{result||(phase==='finished'?'Player '+(active+1)+' wins!':'Confirm shot')}}</button>}
</div>
<div class="mini-pair">@for(p of numbers.slice(0,2);track p){<div class="mini-card" [class.p2]="p===1" [class.current]="p===active" [attr.aria-label]="'Player '+(p+1)+' shot history'"><div class="mini-grid">@for(c of grid;track c){<i [class.hit]="players[p].shots[c]===true" [class.miss]="players[p].shots[c]===false"></i>}</div></div>}</div>
@if(notice&&phase==='setup'){<div class="notice" role="status" (click)="notice=''">{{notice}}</div>}
</main>
@if(handoff){<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="handoff-title"><h2 id="handoff-title">Player {{active+1}}</h2><button class="primary" (click)="reveal()">{{phase==='setup'?'Place ships':'Ready to fire'}}</button></section></div>}
@if(restart){<div class="overlay"><section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="restart-title"><h2 id="restart-title">New game?</h2><button class="primary" (click)="newGame()">Start new game</button><button class="secondary" (click)="restart=false">Cancel</button></section></div>}
@if(phase==='finished'&&winnerOpen&&!handoff){<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="winner-title"><h2 id="winner-title">Player {{active+1}} wins!</h2><button class="primary" (click)="newGame()">Play again</button><button class="secondary" (click)="winnerOpen=false">View results</button></section></div>}
</div>`})
export class App {
 version=appVersion;
 letters='ABCDEFGHIJ'.split('');numbers=Array.from({length:10},(_,i)=>i);grid=Array.from({length:100},(_,i)=>i);
 players:Player[]=[{ships:fleet(),shots:{}},{ships:fleet(),shots:{}}];active=0;phase:'setup'|'battle'|'finished'='setup';handoff=false;restart=false;winnerOpen=false;selected:number|null=null;selectedShip:number|null=null;result='';notice='';ghost:number[]=[];ghostValid=true;
 turnTimer:ReturnType<typeof setTimeout>|null=null;
 drag:{id:number;x:number;y:number;offset:number;moved:boolean;tray:boolean;target:number|null}|null=null;suppress=false;
 constructor(private cd:ChangeDetectorRef){try{const saved=localStorage.getItem('ship-fighter-v1');if(saved){const s=JSON.parse(saved);if(s.version===1&&this.validSave(s)){this.players=s.players;this.active=s.active;this.phase=s.phase;this.handoff=true;this.result=s.result||'';this.winnerOpen=this.phase==='finished';if(this.phase==='battle'&&this.result){this.active=1-this.active;this.result='';this.save();}}}}catch{localStorage.removeItem('ship-fighter-v1');}}
 validSave(s:any){return [0,1].includes(s.active)&&['setup','battle','finished'].includes(s.phase)&&Array.isArray(s.players)&&s.players.length===2&&s.players.every((p:any)=>Array.isArray(p.ships)&&p.ships.length===5&&p.ships.every((ship:Ship,i:number)=>ship.id===i&&ship.size===[5,4,3,3,2][i]&&Number.isInteger(ship.row)&&Number.isInteger(ship.col)&&typeof ship.vertical==='boolean'&&valid(ship,p.ships))&&p.shots&&typeof p.shots==='object'&&!Array.isArray(p.shots)&&Object.entries(p.shots).every(([k,v])=>Number.isInteger(+k)&&+k>=0&&+k<100&&typeof v==='boolean'));}
 save(){try{localStorage.setItem('ship-fighter-v1',JSON.stringify({version:1,players:this.players,active:this.active,phase:this.phase,result:this.result}));}catch{this.notice='Browser storage is unavailable. Keep this tab open to finish the game.';}}
 coordinate(c:number){return this.letters[c%10]+(Math.floor(c/10)+1);}
 occupant(c:number){return this.players[this.active].ships.find(s=>cells(s).includes(c))?.id;}
 choose(c:number){if(this.suppress){this.suppress=false;return;}if(this.handoff||this.result||this.phase==='finished')return;if(this.phase==='setup'){const id=this.occupant(c);if(id!==undefined){this.selectedShip=id;const s=this.players[this.active].ships[id];this.place({...s,vertical:!s.vertical});}else if(this.selectedShip!==null){this.place({...this.players[this.active].ships[this.selectedShip],row:Math.floor(c/10),col:c%10});}}else if(!Object.hasOwn(this.players[this.active].shots,c))this.selected=c;}
 place(ship:Ship){if(valid(ship,this.players[this.active].ships)){this.players[this.active].ships[ship.id]=ship;this.notice='';this.save();}else this.notice='That position overlaps another ship or leaves the grid.';}
 begin(e:PointerEvent,c:number){if(this.phase!=='setup'||this.handoff)return;const id=this.occupant(c);if(id===undefined)return;const s=this.players[this.active].ships[id];this.selectedShip=id;this.drag={id,x:e.clientX,y:e.clientY,offset:s.vertical?Math.floor(c/10)-s.row:c%10-s.col,moved:false,tray:false,target:null};(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);}
 move(e:PointerEvent){if(!this.drag)return;const d=this.drag;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>7)d.moved=true;if(!d.moved)return;const board=document.querySelector('.board')!.getBoundingClientRect();const col=Math.floor((e.clientX-board.left)/board.width*10),row=Math.floor((e.clientY-board.top)/board.height*10);const s=this.players[this.active].ships[d.id];const candidate={...s,row:row-(s.vertical?d.offset:0),col:col-(s.vertical?0:d.offset)};d.target=row>=0&&row<10&&col>=0&&col<10?row*10+col:null;this.ghost=cells(candidate).filter(c=>c>=0&&c<100);this.ghostValid=d.target!==null&&valid(candidate,this.players[this.active].ships);this.cd.markForCheck();}
 endDrag(e:PointerEvent){if(!this.drag)return;this.move(e);const d=this.drag;if(d.moved){this.suppress=true;if(d.target!==null){const s=this.players[this.active].ships[d.id];this.place({...s,row:Math.floor(d.target/10)-(s.vertical?d.offset:0),col:d.target%10-(s.vertical?0:d.offset)});}else this.notice='Drop the ship inside the ocean grid.';setTimeout(()=>{this.suppress=false;},0);}this.cancelDrag();}
 cancelDrag(){this.drag=null;this.ghost=[];}
 shuffle(){this.players[this.active].ships=randomFleet();this.selectedShip=null;this.notice='';this.save();}
 ready(){this.selectedShip=null;this.notice='';if(this.active===0)this.active=1;else{this.active=0;this.phase='battle';}this.handoff=true;this.save();}
 reveal(){this.handoff=false;if(this.phase==='finished')this.winnerOpen=true;}
 fire(){if(this.selected===null||this.phase!=='battle'||this.result)return;const r=shoot(this.players[this.active],this.players[1-this.active],this.selected);if(!r)return;const ship=this.players[1-this.active].ships.find(s=>cells(s).includes(this.selected!));const sunk=ship&&cells(ship).every(c=>this.players[this.active].shots[c]===true);this.result=r.hit?(sunk?'Sunk!':'Hit!'):'Miss';this.selected=null;if(r.won){this.phase='finished';this.winnerOpen=true;}else{this.turnTimer=setTimeout(()=>{this.turnTimer=null;this.nextTurn();this.cd.markForCheck();},2000);}this.save();}
 nextTurn(){this.clearTurnTimer();this.active=1-this.active;this.result='';this.selected=null;this.handoff=true;this.save();}
 clearTurnTimer(){if(this.turnTimer!==null){clearTimeout(this.turnTimer);this.turnTimer=null;}}
 ngOnDestroy(){this.clearTurnTimer();}
 newGame(){this.clearTurnTimer();this.players=[{ships:fleet(),shots:{}},{ships:fleet(),shots:{}}];this.active=0;this.phase='setup';this.handoff=true;this.restart=false;this.winnerOpen=false;this.selected=null;this.selectedShip=null;this.result='';this.notice='';this.cancelDrag();this.save();}
}
bootstrapApplication(App).catch(console.error);
