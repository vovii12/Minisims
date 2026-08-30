(function(){
const view=document.getElementById('viewport');
function fail(e){console.error(e);view.innerHTML='<div style="position:absolute;inset:0;display:grid;place-items:center;background:#182028;color:#fff;padding:24px;text-align:center;font:600 18px system-ui">Не удалось открыть мир<br><small style="font-weight:400">'+String(e&&e.message||e)+'</small></div>';}
function start(){try{
if(!window.THREE) throw new Error('3D-библиотека не загрузилась');
const T=window.THREE,scene=new T.Scene();scene.background=new T.Color(0xb9d5e5);scene.fog=new T.Fog(0xb9d5e5,45,100);
const camera=new T.PerspectiveCamera(45,innerWidth/innerHeight,.1,160);camera.position.set(28,24,30);camera.lookAt(0,0,0);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;view.replaceChildren(renderer.domElement);
scene.add(new T.HemisphereLight(0xeaf7ff,0x506850,2.2));const sun=new T.DirectionalLight(0xffefd8,3);sun.position.set(-20,30,15);sun.castShadow=true;scene.add(sun);
const root=new T.Group();scene.add(root);const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.82});
function box(c,x,y,z,w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m}
function tree(x,z,s){box(0x6b4b35,x,.7*s,z,.22*s,1.4*s,.22*s);const m=new T.Mesh(new T.SphereGeometry(.9*s,12,8),mat(0x568458));m.position.set(x,1.65*s,z);m.castShadow=true;root.add(m)}
function house(x,z,c){box(c,x,1.4,z,5,2.8,4);const r=new T.Mesh(new T.ConeGeometry(3.8,.9,4),mat(0x555b62));r.position.set(x,3.25,z);r.rotation.y=Math.PI/4;root.add(r);box(0x5a463b,x,.8,z+2.03,.75,1.6,.12);box(0xf0eadf,x-1.45,1.55,z-2.03,.8,.85,.1);box(0xf0eadf,x+1.45,1.55,z-2.03,.8,.85,.1)}
box(0x739d66,0,-.15,0,86,.3,86);box(0x4d5257,0,.02,5,78,.08,6);box(0x4d5257,-20,.02,0,6,.08,48);box(0x4d5257,20,.02,0,6,.08,48);box(0xc8c0b4,0,.08,1.45,78,.12,.8);box(0xc8c0b4,0,.08,8.55,78,.12,.8);box(0x7ea96c,-2,.03,15,18,.08,13);box(0x91a9b4,-2,.08,15,3,.12,3);
house(-31,-8,0xe2c59f);house(-23,-8,0xd9e0db);house(-15,-8,0xd7b08c);house(29,-8,0xe0d0ad);house(29,2,0xbdd3c8);house(-31,7,0xd9b89d);house(-23,15,0xc8d8df);house(28,14,0xe1caa6);
for(let i=0;i<45;i++){let x=-39+Math.random()*78,z=-25+Math.random()*48;if(Math.abs(x)<12&&z>0&&z<24)continue;tree(x,z,.65+Math.random()*.4)}
box(0x6da9bd,0,.02,-32,86,.08,13);box(0xd7bf92,0,.08,-25,86,.12,2.5);
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);
let drag=false,lx=0,ly=0;view.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY});view.addEventListener('pointerup',()=>drag=false);view.addEventListener('pointermove',e=>{if(!drag)return;camera.position.x-=(e.clientX-lx)*.035;camera.position.z+=(e.clientY-ly)*.035;camera.lookAt(0,0,0);lx=e.clientX;ly=e.clientY});
function loop(){requestAnimationFrame(loop);renderer.render(scene,camera)}loop();
}catch(e){fail(e)}}
function loadThree(){if(window.THREE){start();return}const s=document.createElement('script');s.src='https://unpkg.com/three@0.180.0/build/three.min.js';s.onload=start;s.onerror=()=>fail(new Error('Не удалось загрузить Three.js. Проверь интернет-соединение.'));document.head.appendChild(s)}
loadThree();
})();