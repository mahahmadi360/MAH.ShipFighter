import {test} from 'node:test';
import assert from 'node:assert/strict';
import {playerLabel} from '../src/player-names.ts';
test('blank and legacy saved names use the correct player label',()=>{assert.equal(playerLabel('',0),'Player 1');assert.equal(playerLabel('  ',1),'Player 2');assert.equal(playerLabel(undefined,0),'Player 1');});
test('names support Unicode, remove controls, trim whitespace and limit length',()=>{assert.equal(playerLabel('  Ali   Ahmadi  ',0),'Ali Ahmadi');assert.equal(playerLabel('علی',0),'علی');assert.equal(playerLabel('Ali\u0000',0),'Ali');assert.equal(Array.from(playerLabel('🚢'.repeat(30),0)).length,24);});
