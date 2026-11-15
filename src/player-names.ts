/** Keep names short and safe to display, with labels for older saved games. */
export function playerLabel(value:unknown,index:number):string{
 const name=typeof value==='string'?Array.from(value.replace(/[\u0000-\u001f\u007f]/g,'').trim().replace(/\s+/gu,' ')).slice(0,24).join(''):'';
 return name||`Player ${index+1}`;
}
