import {Component,Input} from '@angular/core';
@Component({selector:'shot-icon',standalone:true,template:`
@if(kind==='hit'){
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 2 2.1 5.5L20 4l-2.2 6 4.2 2-4.8 2.4L20 20l-6-2.5-2 4.5-2.3-5-5.7 3 2.3-6L2 12l5-2.1L4 4l5.8 3.2Z" fill="currentColor"/><path d="m12 8 1.1 3 3.4 1-3 1.4-1.4 3-1-3.3L8 12l3-1Z" fill="#9f273b"/></svg>
}@else{
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 7c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0S20 9 21 7M3 12c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0M3 17c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0 3 2 4.5 0"/></svg>
}`,styles:[`:host{display:inline-flex;width:75%;height:75%;align-items:center;justify-content:center;pointer-events:none}svg{display:block;width:100%;height:100%}`]})
export class ShotIcon {@Input({required:true}) kind:'hit'|'miss'='hit';}
