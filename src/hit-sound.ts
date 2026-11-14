/** Quiet procedural audio; no asset downloads or background playback. */
export class HitSound {
 private context:AudioContext|null=null;
 play(){
  try{
   const ctx=this.context??=new AudioContext();
   if(ctx.state==='closed')return;
   if(ctx.state==='suspended')void ctx.resume().catch(()=>{});
   const now=ctx.currentTime,duration=.32;
   const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*duration),ctx.sampleRate);
   const data=buffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
   const noise=ctx.createBufferSource();noise.buffer=buffer;
   const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.setValueAtTime(700,now);filter.frequency.exponentialRampToValueAtTime(90,now+duration);
   const gain=ctx.createGain();gain.gain.setValueAtTime(.001,now);gain.gain.linearRampToValueAtTime(.12,now+.008);gain.gain.exponentialRampToValueAtTime(.001,now+duration);
   noise.connect(filter).connect(gain).connect(ctx.destination);noise.start(now);noise.stop(now+duration);
   const bass=ctx.createOscillator(),bassGain=ctx.createGain();bass.type='sine';bass.frequency.setValueAtTime(105,now);bass.frequency.exponentialRampToValueAtTime(40,now+.26);bassGain.gain.setValueAtTime(.065,now);bassGain.gain.exponentialRampToValueAtTime(.001,now+.28);bass.connect(bassGain).connect(ctx.destination);bass.start(now);bass.stop(now+.3);
   noise.onended=()=>{noise.disconnect();filter.disconnect();gain.disconnect();};bass.onended=()=>{bass.disconnect();bassGain.disconnect();};
  }catch{/* Audio must never interrupt the game. */}
 }
 close(){if(this.context)void this.context.close().catch(()=>{});this.context=null;}
}
