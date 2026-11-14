import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fleet,cells,valid,randomFleet,shoot,rotateShip,heading,inBounds,canPlace,moveShip,fleetValid} from '../src/engine.ts';
test('fleet has exactly 17 cells and legal initial placement',()=>{const f=fleet();assert.deepEqual(f.map(s=>s.size),[5,4,3,3,2]);assert.equal(new Set(f.flatMap(cells)).size,17);assert.ok(f.every(s=>valid(s,f)));});
test('reject overlap and every boundary',()=>{const f=fleet();for(const s of [{...f[0],col:6},{...f[0],row:8,vertical:true,direction:1},{...f[0],row:-1},{...f[0],col:-1},{...f[0],row:2}])assert.equal(valid(s,f),false);assert.equal(valid({...f[0],row:0,col:9,vertical:true,direction:1},f),true);});
test('randomized fleets are always in bounds with no overlap',()=>{for(let i=0;i<500;i++){const f=randomFleet();assert.equal(f.length,5);assert.equal(new Set(f.flatMap(cells)).size,17);assert.ok(f.every(s=>valid(s,f)));}});
test('shots hit/miss, duplicate rejection and win only on final cell',()=>{const a={ships:fleet(),shots:{}},b={ships:fleet(),shots:{}};assert.deepEqual(shoot(a,b,99),{hit:false,won:false});assert.equal(shoot(a,b,99),null);assert.equal(shoot(a,b,-1),null);assert.equal(shoot(a,b,100),null);assert.equal(shoot(a,b,1.5),null);const targets=b.ships.flatMap(cells);targets.forEach((c,i)=>assert.deepEqual(shoot(a,b,c),{hit:true,won:i===16}));assert.equal(Object.keys(a.shots).length,18);});

test('four 90 degree rotations keep the tapped cell and return to the original ship',()=>{
 const original={...fleet()[0],row:4,col:2};let ship=original;
 for(const direction of [1,2,3,0]){ship=rotateShip(ship,44);assert.equal(heading(ship),direction);assert.ok(cells(ship).includes(44));assert.ok(canPlace(ship));}
 assert.deepEqual(ship,original);
});
test('rotation at an edge can leave the grid without losing the grabbed cell',()=>{
 const ship=rotateShip(fleet()[0],5);
 assert.equal(heading(ship),1);assert.equal(inBounds(ship),false);assert.equal(canPlace(ship),true);assert.ok(cells(ship).includes(5));
});
test('overlaps are allowed while editing but the fleet cannot be confirmed',()=>{
 const ships=fleet();ships[0]=moveShip(ships[0],2,1);
 assert.ok(canPlace(ships[0]));assert.equal(fleetValid(ships),false);
 ships[0]=moveShip(ships[0],0,1);assert.equal(fleetValid(ships),true);
});
test('partially outside ships keep real visible cells and never wrap columns',()=>{
 const ship={...fleet()[0],row:0,col:-4};
 assert.deepEqual(cells(ship),[0]);assert.equal(canPlace(ship),true);assert.equal(valid(ship,[ship]),false);
 assert.deepEqual(cells({...ship,col:9}),[9]);
 assert.equal(canPlace({...ship,col:10}),false);assert.equal(canPlace({...ship,col:-5}),false);
 assert.equal(inBounds(moveShip(ship,0,0,4)),false);
 const restored=moveShip(ship,0,4,4);assert.equal(inBounds(restored),true);assert.deepEqual(cells(restored),[0,1,2,3,4]);
});
test('each heading supports partial placement and moving the grabbed segment back',()=>{
 const cases=[{row:0,col:9,direction:0},{row:9,col:0,direction:1},{row:0,col:0,direction:2},{row:0,col:0,direction:3}] as const;
 for(const position of cases){const ship={...fleet()[0],...position,vertical:position.direction%2===1};assert.equal(cells(ship).length,1);assert.ok(canPlace(ship));assert.equal(inBounds(ship),false);assert.ok(inBounds(moveShip(ship,5,5)));}
});
