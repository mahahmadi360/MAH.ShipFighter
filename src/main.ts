import {SwUpdate,provideServiceWorker} from '@angular/service-worker';
import {Subscription} from 'rxjs';
import {Component,ChangeDetectorRef,isDevMode} from '@angular/core';
import {ShotIcon} from './shot-icon';
import {HitSound} from './hit-sound';
import {bootstrapApplication} from '@angular/platform-browser';
import {version as appVersion} from '../package.json';
import {cells,fleet,valid,shoot,randomFleet,Ship,Player,heading,bounds,positions,canPlace,inBounds,fleetValid,rotateShip,moveShip} from './engine';
@Component({selector:'app-root',standalone:true,imports:[ShotIcon],template:`
<div class="app" [class.red]="active===1">
<header><a class="brand" href="./">SHIP<span>FIGHTER</span><small class="app-version" aria-label="Application version">{{version}}</small></a><div class="header-actions">@if(updateAvailable){<button class="sound-toggle" aria-label="Load latest version" title="Update available" (click)="loadUpdate()">↻</button>}@if(installPrompt){<button class="sound-toggle" aria-label="Install Ship Fighter" title="Install app" (click)="installApp()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/></svg></button>}<button class="sound-toggle" (click)="sound.toggle()" [attr.aria-label]="sound.enabled?'Mute sound':'Enable sound'" [attr.aria-pressed]="sound.enabled" [attr.data-audio-status]="sound.status" [title]="sound.error||(sound.enabled?'Sound on':'Sound off')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Z"/>@if(sound.enabled){<path d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>}@else{<path d="m17 9 5 6m0-6-5 6"/>}</svg></button><button class="reset" aria-label="New Game" title="New Game" (click)="restart=true">↻ <span class="reset-label">New Game</span></button></div></header>
<main (pointerdown)="sound.unlock()" [class.battle]="phase!=='setup'" [attr.inert]="handoff||restart||winnerOpen?'':null">
@for(p of (phase==='setup'?[active]:[0,1]);track p){
<section class="playfield" [class.player-two]="p===1" [class.current]="p===active" [class.passive]="p!==active" [style.grid-row]="phase==='setup'?1:p===0?1:3" [attr.aria-label]="'Player '+(p+1)">
<div class="board" role="group" [attr.aria-label]="'Player '+(p+1)+(phase==='setup'?' fleet placement':' targeting grid')" (pointermove)="move($event)" (pointerup)="endDrag($event)" (pointercancel)="cancelDrag()">
@for(cell of grid;track cell){<button class="cell" [class.overlap]="phase==='setup'&&overlap(cell)" [class.ship-cell]="phase==='setup'&&occupant(cell)!==undefined" [class.hit]="phase!=='setup'&&players[p].shots[cell]===true" [class.miss]="phase!=='setup'&&players[p].shots[cell]===false" [class.target]="p===active&&selected===cell" [class.last-shot]="lastShot?.player===p&&lastShot?.cell===cell" [class.ghost]="phase==='setup'&&ghost.includes(cell)" [class.invalid]="ghost.includes(cell)&&!ghostValid" [disabled]="phase==='finished'||p!==active||(phase!=='setup'&&hasShot(p,cell))" [attr.aria-label]="coordinate(cell)+(phase==='setup'&&occupant(cell)!==undefined?' ship':phase!=='setup'&&players[p].shots[cell]===true?' hit':phase!=='setup'&&players[p].shots[cell]===false?' miss':'')" (pointerdown)="begin($event,cell)" (click)="choose(cell,p)">
@if(phase!=='setup'&&hasShot(p,cell)){<shot-icon [kind]="players[p].shots[cell]?'hit':'miss'"/>}@else if(p===active&&selected===cell){<svg class="target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="6"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6"/></svg>}
</button>}
@if(phase==='setup'){@for(ship of players[active].ships;track ship.id){<div class="vessel" [class.vertical]="ship.vertical" [class.facing-left]="direction(ship)===2" [class.facing-up]="direction(ship)===3" [class.invalid-ship]="!shipValid(ship)" [class.selected-ship]="selectedShip===ship.id" [style.left.%]="shipBounds(ship).col*10+.5" [style.top.%]="shipBounds(ship).row*10+.5" [style.width.%]="(ship.vertical?1:ship.size)*10-1" [style.height.%]="(ship.vertical?ship.size:1)*10-1"><span></span><b>{{ship.size}}</b></div>}}
</div></section>}
<div class="controls">
@if(phase==='setup'){<button class="secondary" (click)="shuffle()" aria-label="Randomize fleet">⇄</button><button class="primary" [disabled]="!canConfirmFleet" (click)="ready()">Confirm fleet</button>}
@else{<button class="primary" [disabled]="selected===null||phase==='finished'" (click)="fire()">{{phase==='finished'?'Player '+(active+1)+' wins!':'Confirm shot'}}</button>}
</div>
<div class="legend">@if(phase==='setup'&&!canConfirmFleet){<span class="placement-warning" role="status">Fix overlaps and keep ships inside the grid</span>}@else{<span><i class="legend-ship"></i>{{phase==='setup'?'Ship':'Uncharted'}}</span><span><shot-icon kind="hit"/>Hit</span><span><shot-icon kind="miss"/>Miss</span>}</div>
<span class="sr-only" aria-live="polite">{{result}}</span>@if(sound.error){<div class="audio-error" role="status">{{sound.error}}</div>}
@if(notice&&phase==='setup'){<div class="notice" role="status" (click)="notice=''">{{notice}}</div>}
</main>
@if(handoff){<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="handoff-title"><h2 id="handoff-title">Player {{active+1}}</h2><button class="primary" (click)="reveal()">{{phase==='setup'?'Place ships':'Ready to fire'}}</button></section></div>}
@if(restart){<div class="overlay"><section class="modal" role="alertdialog" aria-modal="true" aria-labelledby="restart-title"><h2 id="restart-title">New game?</h2><button class="primary" (click)="newGame()">Start new game</button><button class="secondary" (click)="restart=false">Cancel</button></section></div>}
@if(phase==='finished'&&winnerOpen&&!handoff){<div class="overlay"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="winner-title"><h2 id="winner-title">Player {{active+1}} wins!</h2><button class="primary" (click)="newGame()">Play again</button><button class="secondary" (click)="winnerOpen=false">View results</button></section></div>}
</div>`})
export class App {
 version=appVersion;
 installPrompt:(Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>})|null=null;
 updateAvailable=false;
 private updateSubscription?:Subscription;
 private syncViewport=()=>{
  const height=Math.max(1,Math.floor(Math.min(window.innerHeight,window.visualViewport?.height??window.innerHeight)));
  document.documentElement.style.setProperty('--app-height',height+'px');
 };
 private onInstall=(event:Event)=>{event.preventDefault();this.installPrompt=event as NonNullable<typeof this.installPrompt>;this.cd.markForCheck();};
 private onInstalled=()=>{this.installPrompt=null;this.cd.markForCheck();};
 installApp(){const prompt=this.installPrompt;if(!prompt)return;this.installPrompt=null;void prompt.prompt().then(()=>prompt.userChoice).catch(()=>{}).finally(()=>this.cd.markForCheck());}
 loadUpdate(){window.location.reload();}
 letters='ABCDEFGHIJ'.split('');numbers=Array.from({length:10},(_,i)=>i);grid=Array.from({length:100},(_,i)=>i);
 players:Player[]=[{ships:fleet(),shots:{}},{ships:fleet(),shots:{}}];active=0;phase:'setup'|'battle'|'finished'='setup';handoff=false;restart=false;winnerOpen=false;selected:number|null=null;selectedShip:number|null=null;result='';notice='';ghost:number[]=[];ghostValid=true;
 lastShot:{player:number;cell:number}|null=null;
 sound=new HitSound(()=>this.cd.markForCheck());
 drag:{id:number;x:number;y:number;offset:number;moved:boolean;candidate:Ship|null}|null=null;suppress=false;
 constructor(private cd:ChangeDetectorRef,updates:SwUpdate){
 this.syncViewport();window.addEventListener('resize',this.syncViewport);window.visualViewport?.addEventListener('resize',this.syncViewport);
 window.addEventListener('beforeinstallprompt',this.onInstall);window.addEventListener('appinstalled',this.onInstalled);
 if(updates.isEnabled){this.updateSubscription=updates.versionUpdates.subscribe(event=>{if(event.type==='VERSION_READY'){this.updateAvailable=true;this.cd.markForCheck();}});void updates.checkForUpdate().catch(()=>{});}
 try{const saved=localStorage.getItem('ship-fighter-v1');if(saved){const s=JSON.parse(saved);if([1,2,3].includes(s.version)&&this.validSave(s)){this.players=s.players.map((p:Player)=>({...p,ships:p.ships.map(ship=>({...ship,direction:heading(ship)}))}));this.active=s.active;this.phase=s.phase;this.handoff=this.phase==='setup';this.winnerOpen=this.phase==='finished';if(s.version===1&&this.phase==='battle'&&s.result){this.active=1-this.active;this.save();}}}}catch{localStorage.removeItem('ship-fighter-v1');}}
 validSave(s:any){
  return [0,1].includes(s.active)&&['setup','battle','finished'].includes(s.phase)&&Array.isArray(s.players)&&s.players.length===2&&s.players.every((p:any,player:number)=>
   Array.isArray(p.ships)&&p.ships.length===5&&p.ships.every((ship:Ship,i:number)=>ship.id===i&&ship.size===[5,4,3,3,2][i]&&Number.isInteger(ship.row)&&Number.isInteger(ship.col)&&typeof ship.vertical==='boolean'&&(ship.direction===undefined||(Number.isInteger(ship.direction)&&ship.direction>=0&&ship.direction<=3&&ship.vertical===(ship.direction%2===1)))&&canPlace(ship)&&(s.phase==='setup'&&player===s.active||valid(ship,p.ships)))&&
   p.shots&&typeof p.shots==='object'&&!Array.isArray(p.shots)&&Object.entries(p.shots).every(([k,v])=>Number.isInteger(+k)&&+k>=0&&+k<100&&typeof v==='boolean'));
 }
 save(){try{localStorage.setItem('ship-fighter-v1',JSON.stringify({version:3,players:this.players,active:this.active,phase:this.phase}));}catch{this.notice='Browser storage is unavailable. Keep this tab open to finish the game.';}}
 coordinate(c:number){return this.letters[c%10]+(Math.floor(c/10)+1);}
 occupant(c:number){const ships=this.players[this.active].ships;const selected=ships.find(s=>s.id===this.selectedShip&&cells(s).includes(c));return (selected??[...ships].reverse().find(s=>cells(s).includes(c)))?.id;}
 get canConfirmFleet(){return fleetValid(this.players[this.active].ships);}
 shipBounds=bounds;direction=heading;
 shipValid(ship:Ship){return valid(ship,this.players[this.active].ships);}
 overlap(c:number){return this.players[this.active].ships.filter(s=>cells(s).includes(c)).length>1;}
 hasShot(p:number,c:number){return Object.hasOwn(this.players[p].shots,c);}
 choose(c:number,p=this.active){if(this.suppress){this.suppress=false;return;}if(this.handoff||p!==this.active||this.phase==='finished')return;if(this.phase==='setup'){const id=this.occupant(c);if(id!==undefined){this.selectedShip=id;const s=this.players[this.active].ships[id];this.place(rotateShip(s,c));}else if(this.selectedShip!==null){this.place(moveShip(this.players[this.active].ships[this.selectedShip],Math.floor(c/10),c%10));}}else if(!Object.hasOwn(this.players[this.active].shots,c))this.selected=c;}
 place(ship:Ship){if(canPlace(ship)){this.players[this.active].ships[ship.id]=ship;this.notice='';this.save();}else this.notice='Keep at least one ship cell inside the grid.';}
 begin(e:PointerEvent,c:number){
  if(this.phase!=='setup'||this.handoff)return;const id=this.occupant(c);if(id===undefined)return;
  const s=this.players[this.active].ships[id];this.selectedShip=id;
  this.drag={id,x:e.clientX,y:e.clientY,offset:positions(s).findIndex(p=>p.row===Math.floor(c/10)&&p.col===c%10),moved:false,candidate:null};
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
 }
 move(e:PointerEvent){
  if(!this.drag)return;const d=this.drag;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>7)d.moved=true;if(!d.moved)return;
  const board=document.querySelector('.board')!.getBoundingClientRect();
  const col=Math.floor((e.clientX-board.left)/board.width*10),row=Math.floor((e.clientY-board.top)/board.height*10);
  const candidate=moveShip(this.players[this.active].ships[d.id],row,col,d.offset);
  d.candidate=candidate;this.ghost=cells(candidate);this.ghostValid=valid(candidate,this.players[this.active].ships);this.cd.markForCheck();
 }
 endDrag(e:PointerEvent){
  if(!this.drag)return;this.move(e);const d=this.drag;
  if(d.moved){this.suppress=true;if(d.candidate)this.place(d.candidate);setTimeout(()=>{this.suppress=false;},0);}
  this.cancelDrag();
 }
 cancelDrag(){this.drag=null;this.ghost=[];}
 shuffle(){this.players[this.active].ships=randomFleet();this.selectedShip=null;this.notice='';this.save();}
 ready(){if(!this.canConfirmFleet)return;void this.sound.unlock();this.selectedShip=null;this.notice='';if(this.active===0)this.active=1;else{this.active=0;this.phase='battle';}this.handoff=this.phase==='setup';this.save();}
 reveal(){void this.sound.unlock();this.handoff=false;if(this.phase==='finished')this.winnerOpen=true;}
 fire(){
  if(this.selected===null||this.phase!=='battle'||this.handoff||this.restart)return;
  const player=this.active,cell=this.selected;
  const r=shoot(this.players[player],this.players[1-player],cell);if(!r)return;
  this.lastShot={player,cell};this.selected=null;
  this.result='Player '+(player+1)+(r.hit?' hit!':' missed.');
  this.sound.play(r.hit);
  if(r.won){this.phase='finished';this.winnerOpen=true;}else this.active=1-player;
  this.save();
 }
 ngOnDestroy(){window.removeEventListener('resize',this.syncViewport);window.visualViewport?.removeEventListener('resize',this.syncViewport);this.sound.close();this.updateSubscription?.unsubscribe();window.removeEventListener('beforeinstallprompt',this.onInstall);window.removeEventListener('appinstalled',this.onInstalled);}
 newGame(){this.lastShot=null;this.players=[{ships:fleet(),shots:{}},{ships:fleet(),shots:{}}];this.active=0;this.phase='setup';this.handoff=true;this.restart=false;this.winnerOpen=false;this.selected=null;this.selectedShip=null;this.result='';this.notice='';this.cancelDrag();this.save();}
}
bootstrapApplication(App,{providers:[provideServiceWorker('ngsw-worker.js',{enabled:!isDevMode(),registrationStrategy:'registerImmediately'})]}).catch(console.error);
