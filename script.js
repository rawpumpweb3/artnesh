import * as THREE from 'three';

// ── Image Data (shared by grid + list) ──
const imgURLs=[];
const ids=[1005,1011,1012,1025,1027,1035,1036,1038,1039,1040,1041,1043,1044,1045,1047,1049,1050,1051,1052,1053,1055,1057,1058,1059,1060,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1073];
ids.forEach(id=>imgURLs.push(`https://picsum.photos/id/${id}/600/600`));
const captions=['Studio Session','Morning Light','Editorial Vol.3','Untitled','Portrait Series','Commercial','Night Shoot','Archive 2023','Fashion Week','Candid','Documentary','Urban Portraits','Golden Hour','Studio Vol.7','Collaboration','Street','Personal Work','Cover Shoot','Editorial','Backstage','Rooftop','Archive Vol.2','Film Test','Portrait 35mm','Brand Campaign','Music Video','Candid Vol.4','Sunset','Polaroid','Studio Outtakes','Urban','Editorial Vol.8','Concert','Abstract','Personal Archive','Film Noir'];

// ── Menu Overlay ──
const menuOverlay=document.getElementById('menu-overlay');
const menuBtn=document.getElementById('menu-btn');
window.toggleMenu=function(){
  const isOpen=menuOverlay.classList.contains('active');
  if(isOpen){
    menuOverlay.classList.remove('active');
    menuBtn.classList.remove('open');
    menuBtn.textContent='MENU';
  } else {
    menuOverlay.classList.add('active');
    menuBtn.classList.add('open');
    menuBtn.textContent='CLOSE';
  }
};

// ── Page Transitions ──
let currentPage='home';
let viewMode='grid';
const blurLayers=document.querySelectorAll('.blur-layer, .blur-layer-top');
const gridCanvas=document.getElementById('grid-canvas');

window.goTo=function(name){
  if(name===currentPage)return;
  const overlay=document.getElementById('page-transition-overlay');
  const from=document.getElementById('page-'+currentPage);
  const to=document.getElementById('page-'+name);
  overlay.classList.add('active');
  setTimeout(()=>{
    blurLayers.forEach(l=>l.style.display=name==='home'?'':'none');
    gridCanvas.style.display=name==='home'&&viewMode==='grid'?'':'none';
    from.classList.remove('active');
    from.classList.remove('exit');
    to.scrollTop=0;
    to.classList.add('active');
    currentPage=name;
    setTimeout(()=>{ overlay.classList.remove('active'); },100);
  },400);
};

// ── Lightbox ──
const lightbox=document.getElementById('lightbox');
const lbImg=document.getElementById('lightbox-img');
const lbCaption=document.getElementById('lightbox-caption');
function openLightbox(s,c){lbImg.src=s;lbCaption.textContent=c;lightbox.classList.add('active');}
function closeLightbox(){lightbox.classList.remove('active');}
lightbox.addEventListener('click',closeLightbox);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});

// ── List View ──
const listView=document.getElementById('list-view');
const listTrack=document.getElementById('list-track');
const listCaptionEl=document.getElementById('list-caption');
let listIndex=0;

let listBuilt=false;
imgURLs.forEach((src,i)=>{
  const img=document.createElement('img');
  img.dataset.src=src;
  img.alt=captions[i%captions.length];
  img.addEventListener('click',()=>{ listIndex=i; updateListView(); });
  listTrack.appendChild(img);
});

function buildListImages(){
  if(listBuilt)return;
  listTrack.querySelectorAll('img').forEach(img=>{
    if(img.dataset.src){ img.src=img.dataset.src; delete img.dataset.src; }
  });
  listBuilt=true;
}

function updateListView(){
  const imgs=listTrack.querySelectorAll('img');
  imgs.forEach((img,i)=>img.classList.toggle('active',i===listIndex));
  listCaptionEl.textContent=captions[listIndex%captions.length];
  const activeImg=imgs[listIndex];
  if(activeImg){
    const centerX=window.innerWidth/2;
    const imgCenter=activeImg.offsetLeft+activeImg.offsetWidth/2;
    listTrack.style.transform=`translateX(${centerX-imgCenter}px)`;
  }
}

function showGridView(){
  viewMode='grid';
  listView.classList.remove('active');
  gridCanvas.style.display='';
  blurLayers.forEach(l=>l.style.display='');
  document.getElementById('btn-grid').classList.add('active');
  document.getElementById('btn-list').classList.remove('active');
}
function showListView(){
  viewMode='list';
  buildListImages();
  gridCanvas.style.display='none';
  blurLayers.forEach(l=>l.style.display='none');
  listView.classList.add('active');
  document.getElementById('btn-list').classList.add('active');
  document.getElementById('btn-grid').classList.remove('active');
  setTimeout(updateListView,50);
}
document.getElementById('btn-grid').addEventListener('click',showGridView);
document.getElementById('btn-list').addEventListener('click',showListView);

document.addEventListener('keydown',e=>{
  if(viewMode!=='list'||currentPage!=='home')return;
  if(e.key==='ArrowRight'&&listIndex<imgURLs.length-1){listIndex++;updateListView();}
  if(e.key==='ArrowLeft'&&listIndex>0){listIndex--;updateListView();}
});

// ══════════════════════════════════════════════════════════════
// THREE.JS GRID WITH BARREL VERTEX DISTORTION
// ══════════════════════════════════════════════════════════════

const aspect_init=window.innerWidth/window.innerHeight;
const fovRad_init=55*Math.PI/180;
const visibleHeight=2*Math.tan(fovRad_init/2)*4.2;
const visibleWidth=visibleHeight*aspect_init;

const COLS=5;
const ROWS=9;
const EDGE_MARGIN=0.3;
const ROW_GAP=0.22;
const PLANE_W=(visibleWidth - 2.0 - 0.22*(COLS-1))/COLS;
const COL_GAP=(visibleWidth - EDGE_MARGIN - COLS*PLANE_W)/(COLS-1);
const usableWidth=COLS*PLANE_W+COL_GAP*(COLS-1);

const rowAspects=[
  [0.65, 1.10, 0.70, 1.05, 0.80],
  [1.10, 0.65, 1.00, 0.70, 1.05],
  [0.70, 1.05, 0.65, 1.10, 0.75],
  [1.05, 0.70, 1.10, 0.65, 1.00],
  [0.65, 1.10, 0.70, 1.00, 0.80],
  [1.00, 0.65, 1.05, 0.70, 1.10],
  [0.70, 1.00, 0.65, 1.10, 0.75],
  [1.10, 0.70, 1.00, 0.65, 1.05],
  [0.65, 1.05, 0.70, 1.10, 0.80],
];

const rowMaxH=rowAspects.map(row=>Math.max(...row.map(ar=>PLANE_W*ar)));
const rowYOffsets=[];
let cumY=0;
for(let r=0;r<ROWS;r++){ rowYOffsets.push(cumY); cumY+=rowMaxH[r]+ROW_GAP; }
const GRID_H=cumY;

const conf={ smoothing:1, distortionDecay:0.90, maxDistortion:1, distortionSmoothing:0.05, wheelSens:0.0008, touchSens:0.0008 };

const canvas=document.getElementById('grid-canvas');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setClearColor(0x0b0b0b);

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b0b0b);
const camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,100);
camera.position.z=4.2;

const texLoader=new THREE.TextureLoader();
texLoader.crossOrigin='anonymous';
const texCache=new Map();

function applyCoverUV(geo,planeW,planeH,texW,texH){
  const uv=geo.attributes.uv;
  const planeAR=planeW/planeH, texAR=texW/texH;
  let su=1,sv=1,ou=0,ov=0;
  if(planeAR>texAR){ sv=texAR/planeAR; ov=(1-sv)/2; }
  else { su=planeAR/texAR; ou=(1-su)/2; }
  for(let i=0;i<uv.count;i++){ uv.setXY(i, ou+uv.getX(i)*su, ov+uv.getY(i)*sv); }
  uv.needsUpdate=true;
}

const rows=[];
for(let r=0;r<ROWS;r++){
  const meshes=[];
  const aspects=rowAspects[r%rowAspects.length];
  const gridLeft=-usableWidth/2;
  for(let c=0;c<COLS;c++){
    const idx=r*COLS+c;
    const cellH=PLANE_W*aspects[c];
    const geo=new THREE.PlaneGeometry(PLANE_W,cellH,8,8);
    const mat=new THREE.MeshBasicMaterial({ color:new THREE.Color(['#2a2a2a','#252525','#2f2f2f','#222222'][idx%4]), side:THREE.DoubleSide });
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.x=gridLeft+c*(PLANE_W+COL_GAP)+PLANE_W/2;
    mesh.userData={ origVerts:Float32Array.from(geo.attributes.position.array), col:c, row:r, idx, planeH:cellH, imgSrc:imgURLs[idx%imgURLs.length], caption:captions[idx%captions.length], loaded:false };
    scene.add(mesh); meshes.push(mesh);
    const src=mesh.userData.imgSrc;
    if(texCache.has(src)){ const t=texCache.get(src); mesh.material.map=t;mesh.material.color.set(0xffffff);mesh.material.needsUpdate=true; applyCoverUV(geo,PLANE_W,cellH,t.image.width||600,t.image.height||600); mesh.userData.loaded=true; }
    else { texLoader.load(src,tex=>{ tex.colorSpace=THREE.SRGBColorSpace; texCache.set(src,tex); mesh.material.map=tex;mesh.material.color.set(0xffffff);mesh.material.needsUpdate=true; applyCoverUV(mesh.geometry,PLANE_W,cellH,tex.image.width,tex.image.height); mesh.userData.loaded=true; }); }
  }
  const initY=-(rowYOffsets[r]-GRID_H/2+rowMaxH[r]/2);
  rows.push({meshes,currentY:initY,targetY:initY,maxH:rowMaxH[r]});
}

// ── Scroll State ──
let scrollTarget=0,scrollCurrent=0;
let distortionAmount=0,smoothDistortion=0;
let isDragging=false,momentum=0;

window.addEventListener('wheel',e=>{
  if(currentPage!=='home')return;
  e.preventDefault();
  if(viewMode==='list'){
    if(e.deltaY>0&&listIndex<imgURLs.length-1){listIndex++;updateListView();}
    else if(e.deltaY<0&&listIndex>0){listIndex--;updateListView();}
    return;
  }
  momentum-=e.deltaY*conf.wheelSens;
  isDragging=true;
  clearTimeout(window._scrollEnd);
  window._scrollEnd=setTimeout(()=>{isDragging=false;momentum=0;},100);
},{passive:false});

let touchY=0;
window.addEventListener('touchstart',e=>{if(currentPage!=='home')return;touchY=e.touches[0].clientY;momentum=0;isDragging=false;},{passive:true});
window.addEventListener('touchmove',e=>{if(currentPage!=='home')return;const dy=(e.touches[0].clientY-touchY)*conf.touchSens;touchY=e.touches[0].clientY;momentum+=dy;isDragging=true;},{passive:true});
window.addEventListener('touchend',()=>{isDragging=false;},{passive:true});

const raycaster=new THREE.Raycaster();
const mouse=new THREE.Vector2();
canvas.addEventListener('click',e=>{
  if(currentPage!=='home'||viewMode!=='grid')return;
  mouse.x=(e.clientX/window.innerWidth)*2-1;
  mouse.y=-(e.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects(scene.children);
  if(hits.length>0){ const d=hits[0].object.userData; if(d.imgSrc)openLightbox(d.imgSrc,d.caption); }
});

function applyBarrelDistortion(mesh,worldY,amount){
  if(amount<0.005)return;
  const pos=mesh.geometry.attributes.position;
  const orig=mesh.userData.origVerts;
  const maxDist=conf.maxDistortion*amount;
  const radius=1.8;
  for(let i=0;i<pos.count;i++){
    const ox=orig[i*3],oy=orig[i*3+1],gy=worldY+oy;
    const dist=Math.sqrt(ox*ox+gy*gy);
    const norm=Math.max(0,1-dist/radius);
    pos.setZ(i,Math.pow(Math.sin(norm*Math.PI/2),1.0)*maxDist);
  }
  pos.needsUpdate=true;
}

function onResize(){ camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); }
window.addEventListener('resize',onResize);

const velHistory=new Array(6).fill(0);
let peakVel=0,lastTime=0;

function animate(time){
  requestAnimationFrame(animate);
  if(currentPage!=='home'||viewMode!=='grid'){renderer.render(scene,camera);return;}
  const dt=lastTime?(time-lastTime)/1000:0.016; lastTime=time;
  if(isDragging){ scrollTarget+=momentum; const decay=0.88-Math.abs(momentum)*0.8; momentum*=Math.max(0.7,decay); if(Math.abs(momentum)<0.0005){momentum=0;isDragging=false;} }
  const prevScroll=scrollCurrent;
  scrollCurrent+=(scrollTarget-scrollCurrent)*conf.smoothing;
  const vel=Math.abs(scrollCurrent-prevScroll)/dt;
  velHistory.push(vel);velHistory.shift();
  const avgVel=velHistory.reduce((a,b)=>a+b,0)/velHistory.length;
  if(avgVel>peakVel)peakVel=avgVel;
  if(vel>0.04)distortionAmount=Math.max(distortionAmount,Math.min(1,vel*0.08));
  const isDecelerating=(avgVel/(peakVel+0.001))<0.7&&peakVel>0.4;
  peakVel*=0.99;
  if(isDecelerating||avgVel<0.18){ distortionAmount*=isDecelerating?conf.distortionDecay:conf.distortionDecay*0.9; }
  smoothDistortion+=(distortionAmount-smoothDistortion)*conf.distortionSmoothing;
  const fovRad=camera.fov*Math.PI/180;
  const visH=Math.tan(fovRad/2)*camera.position.z;
  const margin=1.2;
  rows.forEach((row,ri)=>{
    let y=-(rowYOffsets[ri]+scrollCurrent-GRID_H/2+rowMaxH[ri]/2);
    y=((y%GRID_H)+GRID_H)%GRID_H;
    if(y>GRID_H/2)y-=GRID_H;
    if(Math.abs(y-row.targetY)>row.maxH*3)row.currentY=y;
    row.targetY=y; row.currentY+=(row.targetY-row.currentY)*0.1;
    row.meshes.forEach(mesh=>{ mesh.position.y=row.currentY; const visible=mesh.position.y>-visH-margin&&mesh.position.y<visH+margin; mesh.visible=visible; if(visible)applyBarrelDistortion(mesh,mesh.position.y,smoothDistortion); });
  });
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
