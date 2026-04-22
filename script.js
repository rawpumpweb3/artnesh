import * as THREE from 'three';

// ── Image Data (shared by grid + list) ──
const imgURLs=[];
const captions=[];
const storedImages=(()=>{ try{ return JSON.parse(localStorage.getItem('artnesh_images'))||[]; }catch(e){ return []; } })();
const hasStored=storedImages.some(item=>item!==null);
if(hasStored){
  storedImages.forEach(item=>{ if(item){ imgURLs.push(item.src); captions.push(item.caption||'Untitled'); } });
} else {
  const ids=[1005,1011,1012,1025,1027,1035,1036,1038,1039,1040,1041,1043,1044,1045,1047,1049,1050,1051,1052,1053,1055,1057,1058,1059,1060,1062,1063,1064,1065,1066,1067,1068,1069,1070,1071,1073];
  ids.forEach(id=>imgURLs.push(`https://picsum.photos/id/${id}/900/600`));
  captions.push('Studio Session','Morning Light','Editorial Vol.3','Untitled','Portrait Series','Commercial','Night Shoot','Archive 2023','Fashion Week','Candid','Documentary','Urban Portraits','Golden Hour','Studio Vol.7','Collaboration','Street','Personal Work','Cover Shoot','Editorial','Backstage','Rooftop','Archive Vol.2','Film Test','Portrait 35mm','Brand Campaign','Music Video','Candid Vol.4','Sunset','Polaroid','Studio Outtakes','Urban','Editorial Vol.8','Concert','Abstract','Personal Archive','Film Noir');
}

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
    // Blur fade in inner page content
    const fadeEls=to.querySelectorAll('.inner-hero,.inner-body,.work-grid,.about-stats,.contact-email,.contact-socials');
    fadeEls.forEach((el,i)=>{el.classList.remove('blur-fade-in');void el.offsetWidth;el.classList.add('blur-fade-in');el.style.animationDelay=(i*0.1)+'s';});
    currentPage=name;
    setTimeout(()=>{ overlay.classList.remove('active'); },100);
  },400);
};

// ── Lightbox ──
const lightbox=document.getElementById('lightbox');
const lbImg=document.getElementById('lightbox-img');
const lbCaption=document.getElementById('lightbox-caption');
function openLightbox(s,c){
  lbImg.style.visibility='hidden';
  lbImg.src=s;
  lbImg.onload=()=>{ lbImg.style.visibility='visible'; };
  lbCaption.textContent=c;
  lightbox.classList.add('active');
}
function closeLightbox(){lightbox.classList.remove('active');}
lightbox.addEventListener('click',closeLightbox);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();});

// ── List View ──
const listView=document.getElementById('list-view');
const listTrack=document.getElementById('list-track');
const listCaptionEl=document.getElementById('list-caption');
let listIndex=0;

let listBuilt=false;
const ITEM_W_VW=50;
imgURLs.forEach((src,i)=>{
  const item=document.createElement('div');
  item.style.cssText='width:50vw;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .5s';
  const img=document.createElement('img');
  img.dataset.src=src;
  img.alt=captions[i%captions.length];
  item.addEventListener('click',()=>{ listIndex=i; updateListView(); });
  item.appendChild(img);
  listTrack.appendChild(item);
});

function buildListImages(){
  if(listBuilt)return;
  listTrack.querySelectorAll('img').forEach(img=>{
    if(img.dataset.src){ img.src=img.dataset.src; delete img.dataset.src; }
  });
  listBuilt=true;
}

function updateListView(){
  const items=listTrack.children;
  for(let i=0;i<items.length;i++){
    if(i===listIndex){
      items[i].style.cssText='width:50vw;flex-shrink:0;display:flex;align-items:center;justify-content:center;opacity:1;transform:scale(1.15);transition:transform .5s,opacity .5s;filter:brightness(1)';
    } else {
      items[i].style.cssText='width:50vw;flex-shrink:0;display:flex;align-items:center;justify-content:center;opacity:0.15;transform:scale(0.35);transition:transform .5s,opacity .5s;filter:brightness(0.3)';
    }
  }
  listCaptionEl.textContent=captions[listIndex%captions.length];
  const itemW=window.innerWidth*(ITEM_W_VW/100);
  const totalOffset=listIndex*itemW;
  const centerOffset=(window.innerWidth-itemW)/2;
  listTrack.style.transition='transform .5s cubic-bezier(.4,0,.2,1)';
  listTrack.style.transform=`translateX(${centerOffset-totalOffset}px)`;
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
  listIndex=0;
  listView.classList.add('active');
  // Force layout before updating styles
  listView.offsetHeight;
  updateListView();
  document.getElementById('btn-list').classList.add('active');
  document.getElementById('btn-grid').classList.remove('active');
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

const isMobile=window.innerWidth<768;
const COLS=isMobile?2:5;
const ROWS=isMobile?15:9;
const EDGE_MARGIN=isMobile?0.15:0.3;
const ROW_GAP=0.45;
const PLANE_W=(visibleWidth - (isMobile?0.8:2.0) - 0.22*(COLS-1))/COLS;
const COL_GAP=(visibleWidth - EDGE_MARGIN - COLS*PLANE_W)/(COLS-1);
const usableWidth=COLS*PLANE_W+COL_GAP*(COLS-1);

const rowAspects5=[
  [0.85, 1.10, 0.90, 1.05, 0.88],
  [1.10, 0.85, 1.00, 0.90, 1.05],
  [0.90, 1.05, 0.85, 1.10, 0.88],
  [1.05, 0.90, 1.10, 0.85, 1.00],
  [0.85, 1.10, 0.90, 1.00, 0.88],
  [1.00, 0.85, 1.05, 0.90, 1.10],
  [0.90, 1.00, 0.85, 1.10, 0.88],
  [1.10, 0.90, 1.00, 0.85, 1.05],
  [0.85, 1.05, 0.90, 1.10, 0.88],
];
const rowAspects2=[
  [0.90, 1.05],[1.05, 0.90],[0.85, 1.10],[1.10, 0.85],[0.90, 1.00],
  [1.00, 0.90],[0.85, 1.05],[1.05, 0.85],[0.90, 1.10],[1.10, 0.90],
  [0.85, 1.00],[1.00, 0.85],[0.90, 1.05],[1.05, 0.90],[0.85, 1.10],
];
const rowAspects=isMobile?rowAspects2:rowAspects5;

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
const videoTextures=[];

function isGifUrl(url){
  return /\.gif(\?|$)/i.test(url) || (url.includes('cloudinary.com') && url.includes('/upload/') && /\.gif$/i.test(url));
}

function gifToVideoUrl(url){
  // Cloudinary: convert GIF to mp4 video via URL transformation
  if(url.includes('cloudinary.com')&&url.includes('/upload/')){
    return url.replace('/upload/','/upload/f_mp4,fl_lossy,q_auto/').replace(/\.gif$/i,'.mp4');
  }
  return url;
}

function loadVideoTexture(src,mesh,geo,planeW,cellH){
  const videoUrl=gifToVideoUrl(src);
  const video=document.createElement('video');
  video.crossOrigin='anonymous';
  video.src=videoUrl;
  video.loop=true;
  video.muted=true;
  video.playsInline=true;
  video.autoplay=true;
  video.play().catch(()=>{});
  const vTex=new THREE.VideoTexture(video);
  vTex.colorSpace=THREE.SRGBColorSpace;
  vTex.minFilter=THREE.LinearFilter;
  vTex.magFilter=THREE.LinearFilter;
  mesh.material.map=vTex;
  mesh.material.color.set(0xffffff);
  mesh.material.opacity=0;
  mesh.material.transparent=true;
  mesh.material.needsUpdate=true;
  mesh.userData.fadeIn=true;
  videoTextures.push(vTex);
  video.addEventListener('loadedmetadata',()=>{
    const vidAR=video.videoWidth/video.videoHeight;
    let newH=planeW/vidAR;
    const maxH=planeW*1.6;
    if(newH>maxH)newH=maxH;
    const newGeo=new THREE.PlaneGeometry(planeW,newH,8,8);
    mesh.geometry.dispose();mesh.geometry=newGeo;
    mesh.userData.origVerts=Float32Array.from(newGeo.attributes.position.array);
    mesh.userData.planeH=newH;
  });
  mesh.userData.loaded=true;
  texCache.set(src,vTex);
}

function applyCoverUV(geo,planeW,planeH,texW,texH){
  // contain: show full image without cropping
  const uv=geo.attributes.uv;
  const planeAR=planeW/planeH, texAR=texW/texH;
  let su=1,sv=1,ou=0,ov=0;
  if(planeAR>texAR){ su=planeAR/texAR; ou=(1-su)/2; }
  else { sv=texAR/planeAR; ov=(1-sv)/2; }
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
    const mat=new THREE.MeshBasicMaterial({ transparent:true, opacity:0, side:THREE.DoubleSide });
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.x=gridLeft+c*(PLANE_W+COL_GAP)+PLANE_W/2;
    mesh.userData={ origVerts:Float32Array.from(geo.attributes.position.array), col:c, row:r, idx, planeH:cellH, imgSrc:imgURLs[idx%imgURLs.length], caption:captions[idx%captions.length], loaded:false };
    scene.add(mesh); meshes.push(mesh);
    const src=mesh.userData.imgSrc;
    if(texCache.has(src)){ const t=texCache.get(src); mesh.material.map=t;mesh.material.color.set(0xffffff);mesh.material.opacity=1;mesh.material.needsUpdate=true; if(t.image)applyCoverUV(geo,PLANE_W,cellH,t.image.width||t.image.videoWidth||600,t.image.height||t.image.videoHeight||600); mesh.userData.loaded=true; }
    else if(isGifUrl(src)){ loadVideoTexture(src,mesh,geo,PLANE_W,cellH); }
    else { texLoader.load(src,tex=>{ tex.colorSpace=THREE.SRGBColorSpace; texCache.set(src,tex); mesh.material.map=tex;mesh.material.color.set(0xffffff);mesh.material.opacity=0;mesh.material.transparent=true;mesh.material.needsUpdate=true;
      mesh.userData.fadeIn=true;
      // Resize plane to match image aspect ratio, cap max height
      const imgAR=tex.image.width/tex.image.height;
      let newH=PLANE_W/imgAR;
      const maxH=PLANE_W*1.6;
      if(newH>maxH)newH=maxH;
      const newGeo=new THREE.PlaneGeometry(PLANE_W,newH,8,8);
      mesh.geometry.dispose();mesh.geometry=newGeo;
      mesh.userData.origVerts=Float32Array.from(newGeo.attributes.position.array);
      mesh.userData.planeH=newH;
      mesh.userData.loaded=true;
    }); }
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
  // Auto scroll pelan
  if(!isDragging){ scrollTarget-=0.03*dt; }
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
    row.meshes.forEach(mesh=>{ mesh.position.y=row.currentY; const visible=mesh.position.y>-visH-margin&&mesh.position.y<visH+margin; mesh.visible=visible;
      // Fade in loaded images
      if(mesh.userData.fadeIn&&mesh.material.opacity<1){mesh.material.opacity=Math.min(1,mesh.material.opacity+0.03);mesh.material.needsUpdate=true;if(mesh.material.opacity>=1)mesh.userData.fadeIn=false;}
      if(visible)applyBarrelDistortion(mesh,mesh.position.y,smoothDistortion); });
  });
  videoTextures.forEach(vt=>{ if(vt.image&&vt.image.readyState>=2) vt.needsUpdate=true; });
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
