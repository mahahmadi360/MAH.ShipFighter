import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fleet,cells,valid,randomFleet,shoot} from '../src/engine.ts';
test('fleet has exactly 17 cells and legal initial placement',()=>{const f=fleet();assert.deepEqual(f.map(s=>s.size),[5,4,3,3,2]);assert.equal(new Set(f.flatMap(cells)).size,17);assert.ok(f.every(s=>valid(s,f)));});
test('reject overlap and every boundary',()=>{const f=fleet();for(const s of [{...f[0],col:6},{...f[0],row:8,vertical:true},{...f[0],row:-1},{...f[0],col:-1},{...f[0],row:2}])assert.equal(valid(s,f),false);assert.equal(valid({...f[0],row:0,col:9,vertical:true},f),true);});
test('randomized fleets are always in bounds with no overlap',()=>{for(let i=0;i<500;i++){const f=randomFleet();assert.equal(f.length,5);assert.equal(new Set(f.flatMap(cells)).size,17);assert.ok(f.every(s=>valid(s,f)));}});
test('shots hit/miss, duplicate rejection and win only on final cell',()=>{const a={ships:fleet(),shots:{}},b={ships:fleet(),shots:{}};assert.deepEqual(shoot(a,b,99),{hit:false,won:false});assert.equal(shoot(a,b,99),null);assert.equal(shoot(a,b,-1),null);assert.equal(shoot(a,b,100),null);assert.equal(shoot(a,b,1.5),null);const targets=b.ships.flatMap(cells);targets.forEach((c,i)=>assert.deepEqual(shoot(a,b,c),{hit:true,won:i===16}));assert.equal(Object.keys(a.shots).length,18);});
