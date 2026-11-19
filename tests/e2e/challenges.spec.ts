import {test,expect} from '@playwright/test';
test('dashboard launches the half-adder challenge and original Signal Lab challenges remain playable',async({page})=>{
  await page.goto('lab/logic-circuit/?challenge=1');
  await expect(page.getByRole('button',{name:'Check challenge',exact:true})).toBeVisible();
  await expect(page.getByText(/^Build a half adder\. Sum is high/)).toBeVisible();
  await page.getByRole('button',{name:'Power the relay',exact:true}).click();
  for(const signal of ['A','B','C'])await page.getByRole('button',{name:`Signal ${signal}: 0`,exact:true}).click();
  await expect(page.getByText('Circuit solved.',{exact:true})).toBeVisible();
  await expect(page.getByText('1 of 4 solved',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Open this circuit in builder',exact:true}).click();
  await expect(page.getByRole('button',{name:'Move Final gate',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('shashen.lab.dashboard.v1')||'{}').completed)).toContain('logic-circuit:signal-0');
});
