import * as THREE from 'https://esm.sh/three@0.180.0';
import { OrbitControls } from 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js?deps=three@0.180.0';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js?deps=three@0.180.0';
import {TimeSystem,clockText} from './systems/time.js';
import {CharacterSystem} from './systems/character.js';
import {World} from './systems/world.js';
import {cloneState} from './systems/state.js';
import {save,load} from './systems/save.js';

const S=load()||cloneState();
const viewport=document.querySelector('#viewport'),hud=document.querySelector('#hud'),panels=document.querySelector('#panels'),toast=document.querySelector('#toast');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#a9c6dc');
scene.fog=new THREE.Fog('#a9c6dc',35,75);
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,150);
camera.position.set(17,15,19);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.1;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.47;controls.minDistance=7;controls.maxDistance=45;controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight('#eaf5ff','#4c5b47',2.1));
const sun=new THREE.DirectionalLight('#fff7df',3.2);sun.position.set(-12,22,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const world=new World(scene),char=new CharacterSystem(S),time=new TimeSystem(S);
let mixer=null,model=null,actions={};
const CHARACTER_URL='https://threejs.org/examples/models/gltf/Soldier.glb';
function msg(t){toast.textContent=t;toast.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>toast.classList.remove('show'),1800)}
async function loadCharacter(){
  const loader=new GLTFLoader();
  const g=await new Promise((ok,no)=>loader.load(CHARACTER_URL,ok,undefined,no));
  model=g.scene;model.scale.setScalar(.95);model.position.set(0,0,0);
  model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  scene.add(model);char.setVisual(model);
  if(g.animations?.length){
    mixer=new THREE.AnimationMixer(model);
    g.animations.forEach(c=>actions[c.name]=mixer.clipAction(c));
    const idle=Object.keys(actions).find(x=>/idle/i.test(x));
    if(idle)actions[idle].play();
  }
}
const nc=v=>v<20?'#ff6b78':v<45?'#ffc857':'#55d98a';
function hudRender(){
 const a=S.sim,n=char.needs();
 hud.innerHTML=`<div class="topbar"><div class="panel sim-card"><div class="avatar">${a.gender==='male'?'♂':'♀'}</div><div><div class="name">${a.name}</div><div class="sub">${char.action} · ${clockText(S.time)}</div></div></div><div class="panel needs">${n.slice(0,5).map(x=>`<div class="need"><div class="label"><span>${x.ico} ${x.label}</span><span>${Math.round(x.v)}</span></div><div class="bar"><div class="fill" style="width:${x.v}%;background:${nc(x.v)}"></div></div></div>`).join('')}</div><div class="panel controls"><button class="icon-btn" data-sp=".5">▶</button><button class="icon-btn" data-sp="1">▶▶</button><button class="icon-btn" data-sp="3">▶▶▶</button><button class="mode-btn ${S.mode==='build'?'active':''}" id="build">🏠 Строительство</button><button class="icon-btn" id="save">💾</button></div></div><div class="bottom"><div class="panel actionbar"><button class="action" data-a="cook"><div class="ico">🍳</div><span>Готовить</span></button><button class="action" data-a="sleep"><div class="ico">🛏️</div><span>Спать</span></button><button class="action" data-a="shower"><div class="ico">🚿</div><span>Душ</span></button><button class="action" data-a="tv"><div class="ico">📺</div><span>ТВ</span></button><button class="action" data-a="social"><div class="ico">💬</div><span>Общаться</span></button><button class="action" data-a="work"><div class="ico">💼</div><span>Работать</span></button></div><div class="panel side"><div class="money">§ ${Math.round(S.money)}</div><div class="stat"><span>Настроение</span><b>${Math.round(a.mood)}</b></div><div class="stat"><span>Кулинария</span><b>${a.skills.cooking.toFixed(1)}</b></div><div class="stat"><span>Логика</span><b>${a.skills.logic.toFixed(1)}</b></div><div class="stat"><span>Отношения</span><b>${Math.round(a.relationship)}</b></div></div></div>`;
 hud.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>S.speed=+b.dataset.sp);
 hud.querySelector('#save').onclick=()=>{save(S);msg('Игра сохранена')};
 hud.querySelector('#build').onclick=()=>{S.mode=S.mode==='build'?'live':'build';buildPanel();hudRender()};
 hud.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>action(b.dataset.a));
}
function action(t){const map={cook:['Готовит еду','cook',8],sleep:['Спит','sleep',12],shower:['Принимает душ','shower',8],tv:['Смотрит телевизор','tv',10],social:['Общается','social',8],work:['Работает','work',18]};char.start(...map[t]);if(t==='work')msg('Рабочий день начался')}
function buildPanel(){
 document.querySelector('.build-panel')?.remove();if(S.mode!=='build')return;
 const p=document.createElement('div');p.className='panel build-panel';p.innerHTML='<h3>🏠 Режим строительства</h3><div class="small">Покупай мебель — она появится на участке.</div><br><div class="build-list"></div>';panels.appendChild(p);
 const items=[['🛋️','Кресло',120,'#536e86'],['🪴','Растение',60,'#4e8b55'],['📚','Книжный шкаф',180,'#805e43'],['💡','Торшер',90,'#d6b56d'],['🧶','Ковёр',140,'#9d6f74'],['🖥️','Рабочий стол',220,'#7d6249']];
 items.forEach(([i,n,price,c])=>{const b=document.createElement('button');b.className='build-item';b.innerHTML=`${i} <b>${n}</b><br><span class="small">§ ${price}</span>`;b.onclick=()=>{if(S.money<price)return msg('Не хватает денег');S.money-=price;world.obj(n,'furniture',[Math.random()*6-3,0,Math.random()*5-1],[1.2,.9,1],c,'fun');msg(`${n} куплен`);hudRender()};p.querySelector('.build-list').appendChild(b)})
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
window.addEventListener('sim-action',e=>msg(e.detail.label));
let last=performance.now(),ui=0;
async function boot(){
 hudRender();buildPanel();
 try{await loadCharacter();msg('MiniSims готов — выбери действие')}
 catch(e){console.error(e);msg('Не удалось загрузить 3D-модель. Проверь интернет.')}
 const loop=now=>{requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;time.tick(dt);char.autonomy();char.tick(dt);if(mixer)mixer.update(dt*S.speed);controls.update();ui+=dt;if(ui>.25){hudRender();ui=0}renderer.render(scene,camera)};loop(performance.now())
}
boot();
