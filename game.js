import * as THREE from 'https://esm.sh/three@0.180.0';
import { OrbitControls } from 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js?deps=three@0.180.0';

const $=id=>document.getElementById(id);
const menu=$('menu'),creator=$('creator'),game=$('game'),viewport=$('viewport'),hud=$('hud'),toast=$('toast');
const state={time:480,money:1850,speed:1,hunger:62,energy:82,hygiene:76,fun:68,social:55,mood:74,action:'Свободен',name:'Сим',gender:'male',skin:'#d59b72',hair:'#39271f',x:0,z:2};
try{Object.assign(state,JSON.parse(localStorage.getItem('minisims-save-v3')||'{}'));}catch(e){}
function show(el){[menu,creator,game].forEach(x=>x.classList.add('hidden'));el.classList.remove('hidden');}
function saveGame(){localStorage.setItem('minisims-save-v3',JSON.stringify(state));}
function notify(t){toast.textContent=t;toast.classList.add('show');clearTimeout(window.__miniToast);window.__miniToast=setTimeout(()=>toast.classList.remove('show'),1500)}
function startGame(){state.name=state.name||'Сим';saveGame();show(game);if(!started){started=true;init3D();}renderUI()}
$('playBtn').onclick=startGame;$('newBtn').onclick=()=>show(creator);$('continueBtn').onclick=startGame;$('backBtn').onclick=()=>show(menu);$('startBtn').onclick=()=>{state.name=$('nameInput').value.trim()||'Сим';saveGame();startGame()};
let gender=state.gender||'male';
document.querySelectorAll('[data-gender]').forEach(b=>b.onclick=()=>{gender=b.dataset.gender;state.gender=gender;document.querySelectorAll('[data-gender]').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('pShirt').style.background=gender==='male'?'#4f79b5':'#a85b79'});
document.querySelectorAll('.skin').forEach(b=>b.onclick=()=>{state.skin=b.dataset.skin;$('pHead').style.background=state.skin;document.querySelectorAll('.skin').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
document.querySelectorAll('.hair').forEach(b=>b.onclick=()=>{state.hair=b.dataset.hair;$('pHair').style.background=state.hair;document.querySelectorAll('.hair').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
let started=false,scene,camera,renderer,controls,sim,raycaster,mouse,clock=new THREE.Clock(),target=null,keys={},worldObjects=[];
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.72});
function add(g,c,x,y,z){const m=new THREE.Mesh(g,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m}
function box(w,h,d,c,x,y,z){return add(new THREE.BoxGeometry(w,h,d),c,x,y,z)}
function cyl(r,h,c,x,y,z){return add(new THREE.CylinderGeometry(r,r*.9,h,18),c,x,y,z)}
function addObject(name,icon,x,z,action){worldObjects.push({name,icon,x,z,action})}
function makeWorld(){
 add(new THREE.PlaneGeometry(48,40),'#7fa36b',0,0,7).rotation.x=-Math.PI/2;
 box(15,.16,11,'#d7cec0',0,.08,0);box(15,3.2,.16,'#eee8de',0,1.6,-5.5);box(.16,3.2,11,'#eee8de',-7.5,1.6,0);box(.16,3.2,11,'#eee8de',7.5,1.6,0);
 box(6.8,.12,4.7,'#c6b39b',-3.7,.17,-2.8);box(6.7,.12,4.7,'#c6b39b',3.4,.17,-2.8);
 // sofa
 box(2.8,.45,.9,'#6f83a5',-3.9,.4,1.65);box(2.55,.65,.5,'#8398b9',-3.9,.9,1.85);
 // TV
 box(2.1,1.15,.12,'#20252b',-3.9,1.65,-4.95);box(2.5,.12,.55,'#513d31',-3.9,1.02,-4.7);
 // kitchen counters + fridge
 box(3,.9,.65,'#f1eee7',3.8,.52,1.65);box(.72,1.8,.7,'#d9e0e3',2.55,.95,1.65);cyl(.58,.12,'#d8cfc2',3.8,1.05,-1.05);box(2.1,.14,1.05,'#9b704e',3.8,1.08,-1.05);
 // bed
 box(2.5,.42,3,'#e8e0d5',-3.8,.3,-3.45);box(2.4,.35,1.55,'#7892bc',-3.8,.65,-4.15);box(2.55,1,.25,'#d9d0c5',-3.8,.9,-4.8);
 // bathroom
 box(1.25,.8,1.25,'#eef5f6',5.2,.45,-3.55);cyl(.42,.1,'#cfe3e9',5.2,.9,-3.55);box(.8,1.1,.7,'#f7f6f2',5.2,.55,-1.95);
 // windows, door
 for(const x of [-4.8,4.7])box(2.1,1.45,.06,'#8fc8df',x,2,-5.38);box(1.4,2.45,.12,'#76523b',7.42,1.22,-.2);
 // trees
 for(let i=0;i<14;i++){const x=-19+(i%7)*6.1,z=7+Math.floor(i/7)*7;cyl(.16,2,'#6a4b33',x,1,z);add(new THREE.IcosahedronGeometry(1.15,1),'#4f8050',x,2.5,z)}
 addObject('Холодильник','🍳',2.55,1.65,'cook');addObject('Телевизор','📺',-3.9,-4.7,'fun');addObject('Кровать','🛏️',-3.8,-3.45,'sleep');addObject('Душ','🚿',5.2,-3.55,'shower');addObject('Стол','🍽️',3.8,-1.05,'eat');
}
function createSim(){sim=new THREE.Group();scene.add(sim);const body=cyl(.42,1.15,state.gender==='male'?'#4f79b5':'#a85b79',0,.9,2);const head=add(new THREE.SphereGeometry(.43,20,16),state.skin,0,1.78,2);head.scale.y=1.12;const hair=add(new THREE.SphereGeometry(.45,20,12),state.hair,0,2.05,2);hair.scale.set(1,.48,1);const l=box(.22,.85,.25,'#303847',-.2,.34,2),r=box(.22,.85,.25,'#303847',.2,.34,2);[body,head,hair,l,r].forEach(o=>{o.parent.remove(o);sim.add(o)});sim.position.set(state.x,state.y||0,state.z)}
function init3D(){scene=new THREE.Scene();scene.background=new THREE.Color('#a9c9dc');scene.fog=new THREE.Fog('#a9c9dc',30,68);camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);camera.position.set(14,12,17);renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;viewport.replaceChildren(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=6;controls.maxDistance=32;controls.maxPolarAngle=1.35;controls.target.set(0,0,2);scene.add(new THREE.HemisphereLight(0xffffff,0x557050,2.4));const sun=new THREE.DirectionalLight(0xfff5dc,3);sun.position.set(-10,20,10);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);makeWorld();createSim();raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();renderer.domElement.addEventListener('pointerdown',onWorldPointer);addTouchControls();clock.start()}
function onWorldPointer(e){if(e.pointerType==='touch'&&e.clientX<190&&e.clientY>innerHeight-200)return;const r=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(mouse,camera);const p=new THREE.Vector3();if(raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),p)){target={x:THREE.MathUtils.clamp(p.x,-6.5,6.5),z:THREE.MathUtils.clamp(p.z,-4.7,4.9)};state.action='Идёт'}}
function addTouchControls(){const el=document.createElement('div');el.id='touchControls';el.innerHTML='<div class="joystick"><span></span></div>';game.appendChild(el);const j=el.firstElementChild,k=j.firstElementChild;let on=false;const move=e=>{const r=j.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let x=e.clientX-cx,y=e.clientY-cy,d=Math.hypot(x,y),m=42;if(d>m){x=x/d*m;y=y/d*m}k.style.transform=`translate(${x}px,${y}px)`;keys.w=y<-10;keys.s=y>10;keys.a=x<-10;keys.d=x>10};j.onpointerdown=e=>{on=true;j.setPointerCapture(e.pointerId);move(e)};j.onpointermove=e=>on&&move(e);j.onpointerup=()=>{on=false;keys={};k.style.transform='translate(0,0)'}}
function moveSim(dt){let dx=0,dz=0;if(keys.w||keys.arrowup)dz--;if(keys.s||keys.arrowdown)dz++;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(target){const tx=target.x-sim.position.x,tz=target.z-sim.position.z,d=Math.hypot(tx,tz);if(d>.12){dx+=tx/d;dz+=tz/d}else target=null}if(dx||dz){const l=Math.hypot(dx,dz);sim.position.x+=dx/l*dt*2.8*state.speed;sim.position.z+=dz/l*dt*2.8*state.speed;state.x=sim.position.x;state.z=sim.position.z;state.action='Идёт'}else if(state.action==='Идёт')state.action='Свободен'}
window.onkeydown=e=>keys[e.key.toLowerCase()]=true;window.onkeyup=e=>keys[e.key.toLowerCase()]=false;
function nearby(){return worldObjects.map(o=>({...o,d:Math.hypot(o.x-sim.position.x,o.z-sim.position.z)})).filter(o=>o.d<2.7).sort((a,b)=>a.d-b.d).slice(0,2)}
function actionLabel(a){return ({cook:'Готовить',eat:'Поесть',sleep:'Спать',shower:'Принять душ',fun:'Смотреть ТВ'})[a]||'Использовать'}
function bar(n,v){return `<div class="need"><span>${n}</span><i><b style="width:${v}%"></b></i></div>`}
function clockText(){return `${String(Math.floor(state.time/60)%24).padStart(2,'0')}:${String(Math.floor(state.time%60)).padStart(2,'0')}`}
function renderUI(){if(!sim)return;const near=nearby();hud.innerHTML=`<div class="sim-top"><div class="sim-info"><div class="portrait">${state.gender==='male'?'♂':'♀'}</div><div><strong>${state.name}</strong><small>${state.action} · ${clockText()}</small></div></div><div class="needs-card">${bar('Голод',state.hunger)}${bar('Энергия',state.energy)}${bar('Гигиена',state.hygiene)}${bar('Досуг',state.fun)}${bar('Общение',state.social)}</div><div class="top-buttons"><button id="slow">◀</button><button id="normal">▶</button><button id="fast">▶▶</button><button id="saveBtn">💾</button><button id="menuBtn">☰</button></div></div><div class="sim-bottom"><div class="money-card"><strong>§ ${Math.round(state.money)}</strong><span>Настроение ${Math.round(state.mood)}</span></div>${near.length?`<div class="context-actions">${near.map(o=>`<button class="context" data-action="${o.action}"><b>${o.icon}</b><span>${o.name}</span><small>${actionLabel(o.action)}</small></button>`).join('')}</div>`:''}</div>`;hud.querySelector('#slow').onclick=()=>state.speed=.5;hud.querySelector('#normal').onclick=()=>state.speed=1;hud.querySelector('#fast').onclick=()=>state.speed=3;hud.querySelector('#saveBtn').onclick=()=>{saveGame();notify('Игра сохранена')};hud.querySelector('#menuBtn').onclick=()=>{saveGame();show(menu)};hud.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>doAction(b.dataset.action))}
function doAction(a){const m={cook:['Готовит','hunger',20],eat:['Ест','hunger',28],sleep:['Спит','energy',35],shower:['Принимает душ','hygiene',30],fun:['Смотрит телевизор','fun',28]};const x=m[a];if(!x)return;state.action=x[0];state[x[1]]=Math.min(100,state[x[1]]+x[2]);state.mood=Math.round((state.hunger+state.energy+state.hygiene+state.fun+state.social)/5);renderUI();notify(x[0])}
function loop(){requestAnimationFrame(loop);if(!renderer)return;const dt=Math.min(.05,clock.getDelta());state.time=(state.time+dt*state.speed*2)%1440;state.hunger=Math.max(0,state.hunger-dt*state.speed*.02);state.energy=Math.max(0,state.energy-dt*state.speed*.012);state.hygiene=Math.max(0,state.hygiene-dt*state.speed*.01);state.fun=Math.max(0,state.fun-dt*state.speed*.008);state.social=Math.max(0,state.social-dt*state.speed*.006);state.mood=Math.round((state.hunger+state.energy+state.hygiene+state.fun+state.social)/5);moveSim(dt);if(sim){sim.rotation.y+=(keys.a?-1:keys.d?1:0)*dt*1.5;controls.target.lerp(new THREE.Vector3(sim.position.x,0,sim.position.z),.05);controls.update();renderer.render(scene,camera)}if(Math.floor(performance.now()/500)%2===0)renderUI()}
window.addEventListener('resize',()=>{if(renderer){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}});show(menu);loop();