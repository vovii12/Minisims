import * as THREE from 'https://esm.sh/three@0.180.0';
import { OrbitControls } from 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js?deps=three@0.180.0';

const viewport=document.getElementById('viewport');
const hud=document.getElementById('hud');
const panels=document.getElementById('panels');
const toast=document.getElementById('toast');

const state={time:480,money:1850,mode:'live',speed:1,hunger:62,energy:82,hygiene:76,fun:68,social:55,mood:74,action:'Свободен'};
try{Object.assign(state,JSON.parse(localStorage.getItem('minisims-save-v2')||'{}'));}catch{}

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9fc5dd);
scene.fog=new THREE.Fog(0x9fc5dd,28,70);
const camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100);
camera.position.set(14,12,17);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
viewport.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.minDistance=7;controls.maxDistance=38;controls.maxPolarAngle=1.35;controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x58704f,2.4));
const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(-10,18,10);sun.castShadow=true;scene.add(sun);

function mat(c){return new THREE.MeshStandardMaterial({color:c,roughness:.72});}
function cube(w,h,d,c,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}

cube(16,.2,13,0x96958f,0,0,0);
// walls
cube(16,3.4,.2,0xd8d0c3,0,1.7,-6.5);cube(.2,3.4,13,0xd8d0c3,-8,1.7,0);cube(.2,3.4,13,0xd8d0c3,8,1.7,0);cube(16,3.4,.2,0xd8d0c3,0,1.7,6.5);
// furniture
cube(3.3,.7,2.2,0x557ba8,-4,.35,-3.5);cube(1.2,2.5,1.1,0xe8edf2,-4,1.25,1.8);cube(2.4,.9,1.1,0x796450,-2.1,.45,1.8);cube(2.5,1.4,.45,0x171b20,2.8,1.8,-4.9);cube(3.8,.9,1.2,0x996673,3,-.05,-3.1);cube(1.5,2.3,1.5,0x86b9c7,5.2,1.15,1.8);cube(1.1,1.1,1.1,0xf0f0ec,3.2,.55,2);cube(1.5,1,.9,0x343a44,-1, .5,-4);cube(2.3,.8,1.1,0x8a6a4c,-1,.4,-2);
// yard
cube(40,.1,30,0x6f9a69,0,-.25,17);
for(let i=0;i<12;i++){const x=-17+(i%6)*6.5,z=8+Math.floor(i/6)*8;cube(.3,2.2,.3,0x71553b,x,1,z);const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,1),mat(0x4e7e50));c.position.set(x,2.8,z);c.castShadow=true;scene.add(c);}

// simple character made from meshes; no external model required
const sim=new THREE.Group();scene.add(sim);sim.position.set(0,0,0);
const body=cube(.8,1.35,.5,0x4d6fa8,0,.95,0);const head=cube(.62,.62,.62,0xe5b28e,0,1.95,0);const leg1=cube(.28,.9,.28,0x30343b,-.2,.25,0),leg2=cube(.28,.9,.28,0x30343b,.2,.25,0);const arm1=cube(.22,1,.22,0xe5b28e,-.58,1,0),arm2=cube(.22,1,.22,0xe5b28e,.58,1,0);[body,head,leg1,leg2,arm1,arm2].forEach(o=>o.parent=sim);scene.remove(body,head,leg1,leg2,arm1,arm2);

function clock(){return `${String(Math.floor(state.time/60)).padStart(2,'0')}:${String(Math.floor(state.time%60)).padStart(2,'0')}`}
function bar(label,v){return `<div class="need"><div class="label"><span>${label}</span><span>${Math.round(v)}</span></div><div class="bar"><div class="fill" style="width:${v}%;background:${v<20?'#ff6b78':v<45?'#ffc857':'#55d98a'}"></div></div></div>`}
function renderUI(){hud.innerHTML=`<div class="topbar"><div class="panel sim-card"><div class="avatar">♂</div><div><div class="name">Владимир</div><div class="sub">${state.action} · ${clock()}</div></div></div><div class="panel needs">${bar('🍽️ Голод',state.hunger)}${bar('⚡ Энергия',state.energy)}${bar('🚿 Гигиена',state.hygiene)}${bar('🎮 Досуг',state.fun)}${bar('💬 Общение',state.social)}</div><div class="panel controls"><button class="icon-btn" onclick="window.setSpeed(.5)">▶</button><button class="icon-btn" onclick="window.setSpeed(1)">▶▶</button><button class="icon-btn" onclick="window.setSpeed(3)">▶▶▶</button><button class="mode-btn" onclick="window.saveGame()">💾</button></div></div><div class="bottom"><div class="panel actionbar"><button class="action" onclick="window.doAction('🍳 Готовит','cook')"><div class="ico">🍳</div><span>Готовить</span></button><button class="action" onclick="window.doAction('🛏️ Спит','sleep')"><div class="ico">🛏️</div><span>Спать</span></button><button class="action" onclick="window.doAction('🚿 Душ','shower')"><div class="ico">🚿</div><span>Душ</span></button><button class="action" onclick="window.doAction('📺 Смотрит ТВ','tv')"><div class="ico">📺</div><span>ТВ</span></button><button class="action" onclick="window.doAction('💬 Общается','social')"><div class="ico">💬</div><span>Общаться</span></button><button class="action" onclick="window.doAction('💼 Работает','work')"><div class="ico">💼</div><span>Работать</span></button></div><div class="panel side"><div class="money">§ ${Math.round(state.money)}</div><div class="stat"><span>Настроение</span><b>${Math.round(state.mood)}</b></div></div></div>`}
window.setSpeed=v=>state.speed=v;
window.saveGame=()=>{localStorage.setItem('minisims-save-v2',JSON.stringify(state));toast.textContent='Игра сохранена';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1500)};
window.doAction=(label,type)=>{state.action=label;const gain={cook:['hunger',18],sleep:['energy',25],shower:['hygiene',22],tv:['fun',18],social:['social',18],work:['money',55]}[type];if(gain[0]==='money')state.money+=gain[1];else state[gain[0]]=Math.min(100,state[gain[0]]+gain[1]);state.mood=Math.round((state.hunger+state.energy+state.hygiene+state.fun+state.social)/5);renderUI();setTimeout(()=>{state.action='Свободен';renderUI()},900)};

let last=performance.now(),ui=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(state.mode==='live'){state.time=(state.time+dt*state.speed*2)%1440;state.hunger=Math.max(0,state.hunger-dt*state.speed*.025);state.energy=Math.max(0,state.energy-dt*state.speed*.018);state.hygiene=Math.max(0,state.hygiene-dt*state.speed*.012);state.fun=Math.max(0,state.fun-dt*state.speed*.01);state.social=Math.max(0,state.social-dt*state.speed*.008);state.mood=Math.round((state.hunger+state.energy+state.hygiene+state.fun+state.social)/5)}ui+=dt;if(ui>.4){renderUI();ui=0}sim.rotation.y+=dt*.15;controls.update();renderer.render(scene,camera)}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
renderUI();requestAnimationFrame(loop);
