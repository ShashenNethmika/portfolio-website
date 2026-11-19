import {expect,test} from '@playwright/test';

test('all exported routes, old entry points and SEO resources resolve under the repository base path',async({request})=>{
  for(const route of ['./','index.html','about/','projects/','contact/','lab/','pages/contact.html','pages/lab.html','lab/logic-circuit/','lab/binary-explorer/','lab/particle-sandbox/','lab/glass-studio/','lab/network-studio/','lab/motion-studio/']){
    const response=await request.get(route);
    expect(response.status(),route).toBe(200);
    const html=await response.text();
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('/portfolio-website/_next/');
  }
  const sitemap=await request.get('sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('https://shashennethmika.github.io/portfolio-website/lab/network-studio/');
  const robots=await request.get('robots.txt');
  expect(await robots.text()).toContain('/portfolio-website/sitemap.xml');
  expect((await request.get('images/profile.webp')).status()).toBe(200);
  expect((await request.get('does-not-exist/')).status()).toBe(404);
});

test('invalid saved data cannot execute markup or break a workspace',async({page})=>{
  await page.goto('lab/network-studio/');
  await page.evaluate(()=>localStorage.setItem('portfolio.network.v1',JSON.stringify({devices:[{id:'<script>alert(1)</script>'}],connections:[],routes:[]})));
  await page.getByRole('button',{name:'Load saved',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Network & Data Flow');
  await expect(page.getByText(/invalid|could not|Could not|invalid data|Unable/i).last()).toBeVisible();
});
