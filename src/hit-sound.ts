import {AUDIO_ASSETS} from './audio-assets';
type Clip=keyof typeof AUDIO_ASSETS;
/** One gesture-unlocked audio context with embedded, decoded sample buffers. */
export class HitSound {
 enabled=true;
 status:'idle'|'loading'|'running'|'off'|'blocked'|'error'='idle';
 error='';
 private context:AudioContext|null=null;
 private master:GainNode|null=null;
 private buffers:Partial<Record<Clip,AudioBuffer>>={};
 private loading:Promise<void>|null=null;
 private sea:AudioBufferSourceNode|null=null;
 private seaGain:GainNode|null=null;
 private effects=new Set<AudioBufferSourceNode>();
 private closed=false;
 private onVisibility=()=>{
  if(document.hidden){this.stopSea();this.stopEffects();if(this.context?.state==='running')void this.context.suspend().catch(()=>{});this.status=this.enabled?'idle':'off';this.notify();}
 };
 constructor(private notify:()=>void=()=>{}){
  try{this.enabled=localStorage.getItem('ship-fighter-audio')!=='off';}catch{}
  if(!this.enabled)this.status='off';
  document.addEventListener('visibilitychange',this.onVisibility);
 }
 /** Call synchronously from a real click/tap before any asynchronous work. */
 unlock():Promise<boolean>{
  if(!this.enabled||this.closed||document.hidden)return Promise.resolve(false);
  try{
   if(!this.context){
    const Ctor=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;
    if(!Ctor)throw new Error('Web Audio unavailable');
    this.context=new Ctor();this.master=this.context.createGain();this.master.gain.value=.8;this.master.connect(this.context.destination);
   }
   const ctx=this.context;
   const resumed=ctx.state==='running'?Promise.resolve():ctx.resume();
   if(!this.loading){
    this.status='loading';this.notify();
    this.loading=Promise.all((Object.keys(AUDIO_ASSETS) as Clip[]).map(async kind=>{
     const bytes=Uint8Array.from(atob(AUDIO_ASSETS[kind]),c=>c.charCodeAt(0));
     this.buffers[kind]=await ctx.decodeAudioData(bytes.buffer);
    })).then(()=>{}).catch(e=>{this.loading=null;throw e;});
   }
   return Promise.all([resumed,this.loading]).then(()=>{
    if(this.closed||!this.enabled||document.hidden)return false;
    if(ctx.state!=='running'){this.status='blocked';this.error='Tap the sound button to enable audio.';this.notify();return false;}
    this.error='';this.status='running';this.startSea();this.notify();return true;
   }).catch(()=>{this.status='error';this.error='Sound could not start. Tap the sound button to retry.';this.notify();return false;});
  }catch{this.status='error';this.error='Audio is unavailable in this browser.';this.notify();return Promise.resolve(false);}
 }
 play(hit=true){
  // resume() happens immediately inside unlock(), preserving mobile gesture permission.
  void this.unlock().then(ready=>{
   if(!ready||!this.context||!this.master)return;
   const source=this.context.createBufferSource();source.buffer=this.buffers[hit?'hit':'splash']!;
   source.connect(this.master);this.effects.add(source);
   source.onended=()=>{source.disconnect();this.effects.delete(source);};source.start();
  });
 }
 toggle(){
  if(this.enabled&&this.status!=='error'&&this.status!=='blocked'){
   this.enabled=false;this.status='off';this.error='';this.stopSea();this.stopEffects();
  }else{this.enabled=true;void this.unlock();}
  try{localStorage.setItem('ship-fighter-audio',this.enabled?'on':'off');}catch{}
  this.notify();
 }
 private startSea(){
  if(this.sea||!this.context||!this.master||!this.buffers.sea)return;
  const ctx=this.context,source=ctx.createBufferSource(),gain=ctx.createGain();
  source.buffer=this.buffers.sea;source.loop=true;
  gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(.12,ctx.currentTime+.8);
  source.connect(gain).connect(this.master);this.sea=source;this.seaGain=gain;source.start();
 }
 private stopSea(){if(this.sea){try{this.sea.stop();}catch{}this.sea.disconnect();this.sea=null;}this.seaGain?.disconnect();this.seaGain=null;}
 private stopEffects(){for(const source of this.effects){try{source.stop();}catch{}source.disconnect();}this.effects.clear();}
 close(){this.closed=true;document.removeEventListener('visibilitychange',this.onVisibility);this.stopSea();this.stopEffects();if(this.context)void this.context.close().catch(()=>{});this.context=null;}
}
