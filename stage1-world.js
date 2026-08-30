import * as THREE from 'https://esm.sh/three@0.180.0';

const game=document.getElementById('game');
const view=document.getElementById('viewport');
let renderer,scene,camera,root;

function showError(error){
  console.error('MiniSims stage1:',error);
  const text=error instanceof Error ? error.message : String(error);
  view.innerHTML='<div style="position:absolute;inset:0;display:grid;place-items:center;background:#182028;color:white;padding:24px;text-align:center;font:600 18px system-ui">Ошибка 3D-модуля<br><small style="font-weight:400">'+text.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</small></div>';
}

function material(color){return new THREE.MeshStandardMaterial({color,roughness:.8});}
function cube(color,x,y,z,w,h,d){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;}
function tree(x,z,s){cube(0x6b4b35,x,.65*s,z,.22*s,1.3*s,.22*s);const crown=new THREE.Mesh(new THREE.SphereGeometry(.9*s,12,8),material(0x568458));crown.position.set(x,1.65*s,z);crown.castShadow=true;root.add(crown);}
function house(x,z,color){cube(color,x,1.4,z,5,2.8,4);const roof=new THREE.Mesh(new THREE.ConeGeometry(3.8,.9,4),material(0x4b535c));roof.position.set(x,3.25,z);roof.rotation.y=Math.PI/4;roof.castShadow=true;root.add(roof);cube(0x5a463b,x,.8,z+2.03,.75,1.6,.12);cube(0xece8df,x-1.45,1.55,z-2.03,.8,.85,.1);cube(0xece8df,x+1.45,1.55,z-2.03,.8,.85,.1);}
function build(){
 cube(0x739d66,0,-.15,0,86,.3,86);
 cube(0x4d5257,0,.02,5,78,.08,6);cube(0x4d5257,-20,.02,0,6, .08,48);cube(0x4d5257,20,.02,0,6,.08,48);cube(0xc8c0b4,0,.08,1.45,78,.12,.8);cube(0xc8c0b4,0,.08,8.55,78,.12,.8);
 cube(0x7ea96c,-2,.03,15,18,.08,13);cube(0x91a9b4,-2,.08,15,3,.12,3);
 house(-31,-8,0xe2c59f);house(-23,-8,0xd9e0db);house(-15,-8,0xd7b08c);house(29,-8,0xe0d0ad);house(29,2,0xbdd3c8);house(-31,7,0xd9b89d);house(-23,15,0xc8d8df);house(28,14,0xe1caa6);
 for(let i=0;i<45;i++){const x=-39+Math.random()*78;const z=-25+Math.random()*48;if(Math.abs(x)<12&&z>0&&z<24)continue;tree(x,z,.65+Math.random()*.4);}
 cube(0x6da9bd,0,.02,-32,86,.08,13);cube(0xd7bf92,0,.08,-25,86,.12,2.5);
}
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color(0xb9d5e5);scene.fog=new THREE.Fog(0xb9d5e5,48,105);
 camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,160);camera.position.set(28,25,30);camera.lookAt(0,0,0);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;view.replaceChildren(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xeaf7ff,0x4e674e,2.2));const sun=new THREE.DirectionalLight(0xffefd8,3);sun.position.set(-20,30,15);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
 root=new THREE.Group();scene.add(root);build();resize();window.addEventListener('resize',resize);requestAnimationFrame(loop);
}
function loop(){requestAnimationFrame(loop);if(renderer)renderer.render(scene,camera);}
try{init();}catch(error){showError(error);}
