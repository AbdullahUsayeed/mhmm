import React, { useRef, useEffect, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface GlobePhoto {
  id: string; data_url: string; lat: number; lng: number;
  year_key: string; continent: string;
}

interface GlobeViewProps {
  photos: GlobePhoto[];
  theme: { primary: string; light: string; dark: string; bg: string; glow: string };
  partnerName: string;
  onPhotoTap?: (id: string) => void;
}

const GLOBE_HTML = `
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>*{margin:0;padding:0}body{background:__BG__;overflow:hidden}canvas{display:block}</style></head>
<body><script type="importmap">
{"imports":{"three":"https://unpkg.com/three@0.157.0/build/three.module.js"}}
</script><script type="module">
import * as THREE from "three";
const P="__PRIMARY__",L="__LIGHT__",D="__DARK__",BG="__BG__";
const c1=new THREE.Color(D),c2=new THREE.Color(L);
let scene,camera,renderer,globeGroup,spriteGroup,oceanParticles,oceanTime=0;
let starMat,starField,shootingStars=[],heartOrbits=[],constellationLines;
let photoSprites=[],isDragging=false,prevMouse={x:0,y:0},rotVel={x:0,y:0},autoRotate=true;
let dragStart={x:0,y:0},totalDrag=0,pinchStartDist=0,pinchStartZ=4.5;
const BR=1.52,AR=0.003;
const CP=[{name:"NA",pts:[[70,-158],[66,-162],[60,-148],[55,-132],[48,-124],[42,-124],[35,-120],[32,-117],[25,-109],[20,-105],[15,-92],[8,-80],[12,-72],[20,-78],[25,-80],[30,-81],[37,-75],[42,-70],[46,-63],[50,-56],[55,-59],[61,-67],[67,-80],[70,-110]]},{name:"SA",pts:[[12,-72],[10,-75],[5,-77],[0,-80],[-4,-81],[-10,-77],[-16,-72],[-20,-70],[-24,-66],[-28,-62],[-32,-57],[-35,-55],[-38,-58],[-42,-65],[-46,-68],[-50,-73],[-52,-71],[-48,-65],[-40,-58],[-34,-54],[-27,-48],[-20,-40],[-12,-38],[-4,-36],[0,-50],[5,-62],[10,-68]]},{name:"EU",pts:[[70,25],[68,16],[65,12],[61,5],[58,-5],[52,-8],[48,-5],[44,-2],[43,3],[43,6],[45,8],[45,13],[43,16],[40,18],[37,15],[36,22],[38,25],[42,26],[44,29],[46,31],[48,35],[52,35],[55,38],[58,40],[60,35],[62,28],[66,25],[70,28]]},{name:"AF",pts:[[36,-6],[34,-5],[32,-10],[28,-14],[22,-17],[14,-17],[10,-15],[5,-10],[2,8],[5,10],[0,10],[-5,12],[-10,14],[-20,15],[-26,16],[-30,18],[-33,26],[-30,32],[-25,34],[-20,35],[-12,42],[0,43],[5,46],[10,52],[12,43],[18,38],[24,36],[30,32],[32,25],[35,20],[36,10]]},{name:"AS",pts:[[70,30],[72,60],[72,100],[70,130],[66,160],[60,165],[54,145],[46,138],[40,130],[35,128],[30,122],[22,116],[16,108],[10,106],[8,104],[2,104],[0,100],[-5,106],[-8,115],[-5,120],[0,125],[5,118],[10,100],[18,95],[22,88],[20,78],[16,74],[10,76],[8,78],[15,73],[22,68],[28,64],[32,60],[36,54],[38,48],[36,42],[38,36],[42,36],[47,38],[52,42],[55,40],[60,38],[66,30]]},{name:"AU",pts:[[-12,128],[-15,125],[-18,122],[-22,114],[-26,114],[-30,115],[-33,116],[-35,118],[-35,138],[-33,140],[-28,145],[-24,148],[-20,148],[-16,146],[-12,142],[-10,136],[-10,132]]}];
function llv(lat,lng,r){const phi=(90-lat)*Math.PI/180,theta=(lng+180)*Math.PI/180;return new THREE.Vector3(-r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta));}
function init(){
scene=new THREE.Scene();
const w=window.innerWidth,h=window.innerHeight;
camera=new THREE.PerspectiveCamera(45,w/h,0.1,1000);camera.position.z=4.5;
renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setSize(w,h);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setClearColor(new THREE.Color(BG),1);document.body.appendChild(renderer.domElement);
globeGroup=new THREE.Group();scene.add(globeGroup);
const geom=new THREE.SphereGeometry(1.5,128,128);const pos=geom.attributes.position;const colors=new Float32Array(pos.count*3);
for(let i=0;i<pos.count;i++){const y=pos.getY(i),t=(y+1.5)/3;const c=new THREE.Color().lerpColors(c1,c2,t);colors[i*3]=c.r;colors[i*3+1]=c.g;colors[i*3+2]=c.b;}
geom.setAttribute("color",new THREE.BufferAttribute(colors,3));
globeGroup.add(new THREE.Mesh(geom,new THREE.MeshPhongMaterial({vertexColors:true,shininess:30,specular:new THREE.Color(P),transparent:true,opacity:0.9})));
const atmoG=new THREE.SphereGeometry(1.58,64,64);
globeGroup.add(new THREE.Mesh(atmoG,new THREE.ShaderMaterial({vertexShader:"varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"varying vec3 vN;void main(){float i=pow(0.7-dot(vN,vec3(0,0,1)),3.0);gl_FragColor=vec4(${new THREE.Color(P).r},${new THREE.Color(P).g},${new THREE.Color(P).b},i*0.6);}",blending:THREE.AdditiveBlending,side:THREE.FrontSide,transparent:true,depthWrite:false})));
const gridG=new THREE.SphereGeometry(1.503,48,24);globeGroup.add(new THREE.Mesh(gridG,new THREE.MeshBasicMaterial({color:new THREE.Color(P),wireframe:true,transparent:true,opacity:0.05})));
const ringG=new THREE.TorusGeometry(1.53,0.005,16,100);const ringM=new THREE.MeshBasicMaterial({color:new THREE.Color(L),transparent:true,opacity:0.3});const r1=new THREE.Mesh(ringG,ringM),r2=new THREE.Mesh(ringG,ringM);r2.rotation.x=Math.PI/2;globeGroup.add(r1);globeGroup.add(r2);
const oCount=3000,oGeom=new THREE.BufferGeometry();const oPos=new Float32Array(oCount*3),oRand=new Float32Array(oCount);
for(let i=0;i<oCount;i++){const th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=1.505+Math.random()*0.08;oPos[i*3]=r*Math.sin(ph)*Math.cos(th);oPos[i*3+1]=r*Math.sin(ph)*Math.sin(th);oPos[i*3+2]=r*Math.cos(ph);oRand[i]=Math.random()*Math.PI*2;}
oGeom.setAttribute("position",new THREE.BufferAttribute(oPos,3));oGeom.setAttribute("phase",new THREE.BufferAttribute(oRand,1));
oceanParticles=new THREE.Points(oGeom,new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uColor1:{value:new THREE.Color(P)},uColor2:{value:new THREE.Color(L)}},vertexShader:"attribute float phase;varying float vP;void main(){vec4 mp=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mp;vP=phase;gl_PointSize=2.5;}",fragmentShader:"varying float vP;uniform float uTime;uniform vec3 uColor1,uColor2;void main(){float d=length(gl_PointCoord-vec2(0.5))*2.0;if(d>1.0)discard;float s=smoothstep(0.8,0.0,d)*0.9;float t=sin(vP+uTime*2.0)*0.5+0.5;gl_FragColor=vec4(mix(uColor1,uColor2,t),s*(0.3+t*0.7));}",blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));globeGroup.add(oceanParticles);
const sCount=1200,sGeom=new THREE.BufferGeometry();const sPos=new Float32Array(sCount*3),sPhase=new Float32Array(sCount);
for(let i=0;i<sCount;i++){const th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=7+Math.random()*14;sPos[i*3]=r*Math.sin(ph)*Math.cos(th);sPos[i*3+1]=r*Math.sin(ph)*Math.sin(th);sPos[i*3+2]=r*Math.cos(ph);sPhase[i]=Math.random()*Math.PI*2;}
sGeom.setAttribute("position",new THREE.BufferAttribute(sPos,3));sGeom.setAttribute("phase",new THREE.BufferAttribute(sPhase,1));
starMat=new THREE.ShaderMaterial({uniforms:{uTime:{value:0}},vertexShader:"attribute float phase;varying float vP;void main(){vec4 mp=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mp;vP=phase;gl_PointSize=1.5+sin(phase)*0.8;}",fragmentShader:"varying float vP;uniform float uTime;void main(){float d=length(gl_PointCoord-vec2(0.5))*2.0;if(d>1.0)discard;float t=sin(vP+uTime*1.3)*0.5+0.5;gl_FragColor=vec4(mix(vec3(${c2.r*0.8},${c2.g*0.8},${c2.b*0.8}),vec3(${c2.r},${c2.g},${c2.b}),t),(1.0-d)*0.6*(0.3+t*0.7));}",blending:THREE.AdditiveBlending,transparent:true,depthWrite:false});starField=new THREE.Points(sGeom,starMat);scene.add(starField);
for(let i=0;i<5;i++){const g=new THREE.BufferGeometry();const p=new Float32Array(6);p[0]=(Math.random()-0.5)*10;p[1]=(Math.random()-0.5)*10;p[2]=(Math.random()-0.5)*8;p[3]=p[0]+(Math.random()-0.5)*4;p[4]=p[1]+(Math.random()-0.5)*4;p[5]=p[2]+(Math.random()-0.5)*4;g.setAttribute("position",new THREE.BufferAttribute(p,3));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:new THREE.Color(L),transparent:true,opacity:0}));l.visible=false;shootingStars.push({line:l,life:0,maxLife:0,vel:new THREE.Vector3()});scene.add(l);}
for(let i=0;i<12;i++){const hc=document.createElement("canvas");hc.width=hc.height=32;const hctx=hc.getContext("2d");hctx.font="20px serif";hctx.textAlign="center";hctx.textBaseline="middle";hctx.fillText("💖",16,16);const hSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(hc),transparent:true,blending:THREE.AdditiveBlending,depthTest:true}));hSpr.scale.set(0.15,0.15,1);heartOrbits.push({sprite:hSpr,radius:1.7+i*0.08,speed:0.2+Math.random()*0.4,phase:Math.random()*Math.PI*2,tilt:(Math.random()-0.5)*1.2,yOffset:(Math.random()-0.5)*0.8});globeGroup.add(hSpr);}
constellationLines=new THREE.Group();globeGroup.add(constellationLines);
CP.forEach(cont=>{const pts=cont.pts.map(p=>llv(p[0],p[1],1.51));pts.push(pts[0].clone());globeGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:new THREE.Color(P),transparent:true,opacity:0.25})));});
spriteGroup=new THREE.Group();globeGroup.add(spriteGroup);
scene.add(new THREE.AmbientLight(0x444466,1.2));const sun=new THREE.DirectionalLight(new THREE.Color(L),2.5);sun.position.set(5,3,5);scene.add(sun);scene.add(new THREE.DirectionalLight(0x8866aa,0.8).position.set(-3,-1,-2));const bl=new THREE.PointLight(new THREE.Color(P),2.5,8);bl.position.set(0,0,-4);scene.add(bl);
renderer.domElement.addEventListener("pointerdown",onPD);renderer.domElement.addEventListener("pointermove",onPM);window.addEventListener("pointerup",onPU);renderer.domElement.addEventListener("click",onTap);renderer.domElement.style.touchAction="none";window.addEventListener("resize",onResize);
animate();
}
function onPD(e){e.preventDefault();isDragging=true;autoRotate=false;totalDrag=0;const p=e.touches?e.touches[0]:e;dragStart.x=prevMouse.x=p.clientX;dragStart.y=prevMouse.y=p.clientY;if(e.touches&&e.touches.length===2){pinchStartDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);pinchStartZ=camera.position.z;}}
function onPM(e){e.preventDefault();if(!isDragging)return;if(e.touches&&e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);camera.position.z=Math.max(2.5,Math.min(8,pinchStartZ*pinchStartDist/Math.max(d,0.1)));return;}const p=e.touches?e.touches[0]:e;const dx=p.clientX-prevMouse.x,dy=p.clientY-prevMouse.y;totalDrag+=Math.abs(dx)+Math.abs(dy);rotVel.x=dy*0.005;rotVel.y=dx*0.005;globeGroup.rotation.x+=rotVel.x;globeGroup.rotation.y+=rotVel.y;prevMouse.x=p.clientX;prevMouse.y=p.clientY;}
function onPU(e){e.preventDefault();if(totalDrag<5)isDragging=false;else setTimeout(()=>{autoRotate=true;},2000);}
function onResize(){camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);}
function onTap(e){if(isDragging||totalDrag>=5)return;const mx=(e.clientX/window.innerWidth)*2-1,my=-(e.clientY/window.innerHeight)*2+1;const rc=new THREE.Raycaster();rc.setFromCamera(new THREE.Vector2(mx,my),camera);const hits=rc.intersectObjects(spriteGroup.children,true);if(hits.length>0){let obj=hits[0].object;while(obj){if(obj.userData&&obj.userData.photoId){window.ReactNativeWebView.postMessage(JSON.stringify({type:"photoTap",id:obj.userData.photoId}));return;}obj=obj.parent;}}}
function createPhotoSprite(photo){const c=document.createElement("canvas");c.width=c.height=64;const ctx=c.getContext("2d");const img=new Image();img.onload=()=>{ctx.beginPath();ctx.arc(32,32,28,0,Math.PI*2);ctx.clip();ctx.drawImage(img,0,0,64,64);ctx.beginPath();ctx.arc(32,32,28,0,Math.PI*2);ctx.lineWidth=2.5;ctx.strokeStyle=P;ctx.stroke();const tex=new THREE.CanvasTexture(c);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:true}));sprite.scale.set(0.18,0.18,1);sprite.position.copy(llv(photo.lat,photo.lng,BR));sprite.userData={photoId:photo.id};const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.08,8),new THREE.MeshBasicMaterial({color:new THREE.Color(P)}));const inner=llv(photo.lat,photo.lng,BR-0.07),outer=llv(photo.lat,photo.lng,BR);pole.position.copy(inner.add(outer).multiplyScalar(0.5));pole.lookAt(outer);pole.rotateX(Math.PI/2);pole.userData={photoId:photo.id};const aura=new THREE.Mesh(new THREE.RingGeometry(0.095,0.105,32),new THREE.MeshBasicMaterial({color:new THREE.Color(P),side:THREE.DoubleSide,transparent:true,opacity:0.6}));aura.position.copy(llv(photo.lat,photo.lng,BR+0.01));aura.lookAt(new THREE.Vector3(0,0,0));aura.userData={photoId:photo.id,isAura:true};spriteGroup.add(pole);spriteGroup.add(sprite);spriteGroup.add(aura);photoSprites.push({sprite,pole,aura,id:photo.id});};img.src=photo.data_url;}
function clearSprites(){while(spriteGroup.children.length>0){const c=spriteGroup.children[0];if(c.material&&c.material.map)c.material.map.dispose();if(c.material)c.material.dispose();spriteGroup.remove(c);}photoSprites=[];}
function drawLines(photos){while(constellationLines.children.length>0){const c=constellationLines.children[0];if(c.geometry)c.geometry.dispose();if(c.material)c.material.dispose();constellationLines.remove(c);}if(!photos||photos.length<2)return;const byCont={};photos.forEach(p=>{const cont=p.continent||"unknown";if(!byCont[cont])byCont[cont]=[];byCont[cont].push(p);});Object.values(byCont).forEach(group=>{for(let i=0;i<group.length;i++){for(let j=i+1;j<group.length;j++){const da=group[i].lat-group[j].lat,db=group[i].lng-group[j].lng;if(Math.sqrt(da*da+db*db)<18){const a=llv(group[i].lat,group[i].lng,BR+0.02),b=llv(group[j].lat,group[j].lng,BR+0.02);const mid=a.clone().add(b).multiplyScalar(0.5);const cp=mid.clone().normalize().multiplyScalar(BR+0.12);const curve=new THREE.QuadraticBezierCurve3(a,cp,b);constellationLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(16)),new THREE.LineBasicMaterial({color:new THREE.Color(P),transparent:true,opacity:0.2})));}}}});}
function setPhotos(photos){clearSprites();photos.forEach(p=>createPhotoSprite(p));drawLines(photos);}
function animate(){requestAnimationFrame(animate);oceanTime+=0.016;if(oceanParticles)oceanParticles.material.uniforms.uTime.value=oceanTime;if(starMat)starMat.uniforms.uTime.value=oceanTime;shootingStars.forEach(ss=>{if(ss.life>0){ss.life-=0.016;const prog=ss.life/ss.maxLife;ss.line.material.opacity=prog*0.7;const pos=ss.line.geometry.attributes.position;for(let i=0;i<2;i++)pos.setXYZ(i,pos.getX(i)+ss.vel.x*0.016,pos.getY(i)+ss.vel.y*0.016,pos.getZ(i)+ss.vel.z*0.016);pos.needsUpdate=true;if(ss.life<=0){ss.line.visible=false;ss.line.material.opacity=0;}}else if(Math.random()<0.005){const start=new THREE.Vector3((Math.random()-0.5)*12,(Math.random()-0.5)*8,(Math.random()-0.5)*10);const dir=new THREE.Vector3((Math.random()-0.5)*4,(Math.random()-0.5)*4,(Math.random()-0.5)*4);ss.vel.copy(dir.clone().normalize().multiplyScalar(8+Math.random()*12));ss.maxLife=1+Math.random()*2;ss.life=ss.maxLife;const pos=ss.line.geometry.attributes.position;pos.setXYZ(0,start.x,start.y,start.z);pos.setXYZ(1,start.x+dir.x,start.y+dir.y,start.z+dir.z);pos.needsUpdate=true;ss.line.visible=true;ss.line.material.opacity=0.7;}});heartOrbits.forEach(h=>{h.phase+=h.speed*0.016;h.sprite.position.set(Math.cos(h.phase)*h.radius,Math.sin(h.phase*2+h.tilt)*h.yOffset,Math.sin(h.phase)*h.radius);h.sprite.material.opacity=0.3+Math.sin(h.phase*2)*0.2;});if(autoRotate&&!isDragging){globeGroup.rotation.y+=AR;rotVel.x*=0.95;rotVel.y*=0.95;}else if(!isDragging){if(Math.abs(rotVel.x)>0.0001||Math.abs(rotVel.y)>0.0001){globeGroup.rotation.x+=rotVel.x;globeGroup.rotation.y+=rotVel.y;rotVel.x*=0.95;rotVel.y*=0.95;}}renderer.render(scene,camera);}
window.addEventListener("message",(e)=>{try{const d=JSON.parse(e.data);if(d.type==="setPhotos")setPhotos(d.photos);}catch(err){}});
init();
</script></body></html>`;

export default function GlobeView({ photos, theme, partnerName, onPhotoTap }: GlobeViewProps) {
  const webViewRef = useRef<WebView>(null);

  const html = GLOBE_HTML
    .replace(/__PRIMARY__/g, theme.primary)
    .replace(/__LIGHT__/g, theme.light)
    .replace(/__DARK__/g, theme.dark)
    .replace(/__BG__/g, theme.bg);

  useEffect(() => {
    if (photos.length > 0) {
      setTimeout(() => {
        webViewRef.current?.postMessage(JSON.stringify({ type: 'setPhotos', photos }));
      }, 800);
    }
  }, [photos]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'photoTap' && onPhotoTap) {
        onPhotoTap(data.id);
      }
    } catch (e) {}
  }, [onPhotoTap]);

  return (
    <WebView
      ref={webViewRef}
      source={{ html }}
      style={styles.webview}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      scrollEnabled={false}
      bounces={false}
      originWhitelist={['*']}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1, backgroundColor: '#0a0a0f' },
});
