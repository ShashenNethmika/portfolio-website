import {expect,it} from 'vitest';
import {classicCircuit,signalChallenges} from '../../src/features/logic-circuit/SignalChallenges';
import {evaluateCircuit,type Signal} from '../../src/features/logic-circuit/engine';
it('preserves four solvable connected Signal Lab challenges with the original input constraints',()=>{
  signalChallenges.forEach((challenge,level)=>{
    let solutions=0;
    for(let mask=0;mask<16;mask++){
      const bits=Array.from({length:4},(_,i)=>((mask>>i)&1) as Signal);
      const result=evaluateCircuit(classicCircuit(level,bits));
      expect(result.errors).toEqual([]);
      if(bits.reduce<number>((sum,b)=>sum+b,0)===challenge.active&&result.signals.out===1)solutions++;
    }
    expect(solutions).toBeGreaterThan(0);
  });
});
