/** Bundled explosion sample, preloaded and played directly from a user gesture. */
export class HitSound {
 private voices:HTMLAudioElement[]=[];
 private nextVoice=0;
 constructor(){
  try{
   const url=new URL('audio/explosion-1.2.2.mp3',document.baseURI).href;
   this.voices=Array.from({length:4},()=>{
    const audio=new Audio(url);
    audio.preload='auto';
    audio.volume=.72;
    audio.load();
    return audio;
   });
  }catch{/* Audio is optional; gameplay stays available. */}
 }
 play(){
  try{
   const voice=this.voices[this.nextVoice++%this.voices.length];
   if(!voice)return;
   voice.pause();voice.currentTime=0;
   void voice.play().catch(()=>{});
  }catch{/* A blocked or unavailable audio device must not interrupt a turn. */}
 }
 close(){
  for(const voice of this.voices){voice.pause();voice.removeAttribute('src');voice.load();}
  this.voices=[];
 }
}
