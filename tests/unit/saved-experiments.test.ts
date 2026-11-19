import {expect,it} from 'vitest';
import {hasSavedExperiment} from '../../src/lib/saved-experiments';
import {initialCircuit} from '../../src/features/logic-circuit/engine';
it('does not advertise corrupt or emptied experiment collections as saved work',()=>{
  expect(hasSavedExperiment('logic-circuit','[]')).toBe(false);
  expect(hasSavedExperiment('glass-studio','{"version":1,"presets":[]}')).toBe(false);
  expect(hasSavedExperiment('network-studio','{"devices":[{"id":"bad"}]}')).toBe(false);
  expect(hasSavedExperiment('binary-explorer','not json')).toBe(false);
  expect(hasSavedExperiment('logic-circuit',JSON.stringify([{id:'one',name:'My circuit',circuit:initialCircuit()}]))).toBe(true);
});
