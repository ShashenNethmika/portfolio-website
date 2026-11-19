export const profile = {
  name: 'Shashen Nethmika', role: 'ICT Undergraduate / Creative Developer',
  introduction: 'I build responsive web experiences and explore where design, AI filmmaking, and electronics meet.',
  about: 'I’m studying Information and Communication Technology at the University of Ruhuna. My projects move between building interfaces, making short AI films, and experimenting with digital circuits.',
  email: 'iamshashennethmika@gmail.com', whatsapp: 'https://wa.me/94740066592',
  github: 'https://github.com/ShashenNethmika', linkedin: 'https://www.linkedin.com/in/shashennethmika/',
};
export const socials = [
  ['GitHub',profile.github],['LinkedIn',profile.linkedin],['Instagram','https://www.instagram.com/shashen_nethmika'],
  ['YouTube','https://www.youtube.com/@ShashenNethmikaOfficial'],['X','https://x.com/ShashenNethmika'],
  ['Threads','https://www.threads.net/@shashen_nethmika'],['Facebook','https://web.facebook.com/shashennethmika'],
  ['Snapchat','https://www.snapchat.com/add/shashen_nethmik'],['Spotify','https://open.spotify.com/user/hyrb0kg8hnjxwxakkvtc8cy43'],
  ['Blog','https://shashennethmikainfo.blogspot.com/'],['Patreon','https://www.patreon.com/ShashenNethmika'],
  ['Buy Me a Coffee','https://buymeacoffee.com/shashennethmika'],['Linktree','https://linktr.ee/Shashen_nethmika'],
] as const;
export const projects = [
  {slug:'vesak-card-generator',name:'Vesak Card Generator',category:'web',type:'Web template',tech:['HTML5','CSS3','Flexbox'],repo:'Vesak-Card-Generator',description:'A responsive showcase of templates for personalized Vesak greeting cards.',goal:'Give a personalized Vesak greeting room to breathe on both a narrow phone and a wide screen.',approach:'HTML and CSS define the card layout. Flexbox lets the greeting and artwork adapt to the space available.',color:'#c4a7f5',art:'lantern'},
  {slug:'new-year-wish',name:'Sinhala & Tamil New Year Wish',category:'creative',type:'Web layout',tech:['HTML5','CSS3','Responsive UI'],repo:'Sinhala-and-Tamil-New-Year-Wish',description:'A web interface for displaying and sharing personalized Sinhala and Tamil New Year greeting cards.',goal:'Create a shareable greeting that keeps the Sinhala and Tamil New Year message front and center.',approach:'The responsive HTML and CSS layout pairs a personalized wish with festival artwork.',color:'#f5bd78',art:'sun'},
  {slug:'study-buddy-timer',name:'Study Buddy Timer',category:'web',type:'Timer UI',tech:['HTML5','CSS3','CSS Animation'],repo:'Study-Buddy-Timer',description:'A Pomodoro-style interface with customizable color themes and animated progress tracking for study sessions.',goal:'Make it easy to see how much focus time remains without interrupting a study session.',approach:'A countdown pairs with animated CSS progress and customizable color themes.',color:'#77ddc5',art:'timer'},
  {slug:'weather-forecast',name:'Weather Forecast App',category:'web',type:'Dashboard UI',tech:['HTML5','CSS3','CSS Grid'],repo:'Weather-Forecast',description:'A weather dashboard interface with forecast cards, location details, and flexible layouts built in HTML and CSS.',goal:'Make location and forecast details quick to scan, including on smaller screens.',approach:'The dashboard uses CSS Grid to organize weather cards into a flexible layout.',color:'#7cb6f1',art:'weather'},
  {slug:'filmpotha',name:'FilmPotha Movie Hub',category:'creative',type:'Web showcase',tech:['HTML5','CSS3','Responsive Design'],repo:'FilmPotha',description:'An interactive cinema platform for discovering movie collections, exploring film details, and organizing what to watch.',goal:'Make movie collections easy to browse and keep the details of each title within reach.',approach:'The responsive web showcase pairs a discovery view with film details to help visitors decide what to watch.',color:'#e7a7af',art:'film'},
  {slug:'ai-cinema',name:'Shashen’s AI Cinema',category:'creative',type:'AI & media',tech:['Generative AI','DaVinci Resolve','CapCut'],repo:'',description:'Cinematic short films exploring character continuity through generative AI, custom prompts, and video editing.',goal:'Tell a short story while keeping characters recognizable from shot to shot.',approach:'Custom prompts guide the generative footage. Editing in DaVinci Resolve and CapCut brings the shots together.',color:'#a5a0f5',art:'cinema'},
] as const;
export type Project = (typeof projects)[number];
export const projectRepo = (p: Project) => p.repo ? `${profile.github}/${p.repo}` : `${profile.github}?tab=repositories`;
// Verified against each repository's published homepage on 19 November 2026.
export const projectDemo = (p: Project) => p.repo ? `https://shashennethmika.github.io/${p.repo}/` : null;
export const skillGroups = [
  {name:'Programming',items:['JavaScript','TypeScript'],note:'Used in this portfolio and its interactive experiments.'},
  {name:'Frontend',items:['HTML5','CSS3','Flexbox & Grid','Responsive UI','CSS Animation','React','Next.js'],note:'Interfaces, layouts, and responsive web experiences.'},
  {name:'Backend',items:[],note:'No backend proficiency claim in the original portfolio.'},
  {name:'Databases',items:[],note:'No database proficiency claim in the original portfolio.'},
  {name:'Networking',items:['IP addressing','Subnetting'],note:'Explore these concepts in The Lab’s educational Network Studio.'},
  {name:'Development Tools',items:['Git & GitHub','Tinkercad','IC Simulation'],note:'Version control and electronic systems exploration.'},
  {name:'Creative Technologies',items:['Generative AI Video','Prompt Engineering','DaVinci Resolve','CapCut','Circuit & Logic Design'],note:'Visual storytelling meets digital electronics.'},
];
