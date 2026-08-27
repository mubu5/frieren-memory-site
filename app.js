const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const scenes=$$('[data-scene]');
const soundtrack=$('#soundtrack');
const soundButton=$('.sound');
const currentLabel=$('[data-current]');
const progress=$('.progress i');
const dots=$('[data-dots]');
let current=0,locked=false,fadeFrame=0,touchX=0,stageReadyAt=Infinity,readyTimer=0;

$$('.scene__copy h2').forEach(title=>{
  const lines=title.innerHTML.split(/<br\s*\/?>/i);
  title.innerHTML=lines.map(line=>`<span class="line"><i>${line}</i></span>`).join('');
});

$('[data-total]').textContent=String(scenes.length).padStart(2,'0');
scenes.forEach((scene,index)=>{
  const dot=document.createElement('button');
  dot.type='button';dot.setAttribute('aria-label',`前往第 ${index+1} 幕：${scene.dataset.label}`);
  dot.addEventListener('click',()=>go(index));dots.append(dot);
});

const playScene=scene=>{
  const video=$('video',scene);if(!video)return;
  if(video.dataset.played){try{video.currentTime=0}catch{}}video.dataset.played='true';
  video.play().catch(()=>{});
};
const pauseScene=scene=>{const video=$('video',scene);if(video)video.pause()};
const updateUI=()=>{
  currentLabel.textContent=String(current+1).padStart(2,'0');
  $('[data-scene-name]').textContent=scenes[current].dataset.label;
  progress.style.width=`${(current+1)/scenes.length*100}%`;
  $$('button',dots).forEach((dot,i)=>dot.classList.toggle('is-active',i===current));
  $('[data-prev]').disabled=current===0;
  document.body.classList.toggle('on-final',current===scenes.length-1);
};
const armAdvance=()=>{
  clearTimeout(readyTimer);document.body.classList.remove('can-advance');
  const delay=Number(scenes[current].dataset.dwell||2700);stageReadyAt=performance.now()+delay;
  readyTimer=setTimeout(()=>document.body.classList.add('can-advance'),delay);
};
const go=(target)=>{
  if(locked||target===current||target<0||target>=scenes.length)return;
  locked=true;
  const old=scenes[current],next=scenes[target];
  old.classList.add('is-leaving');next.classList.add('is-active');
  playScene(next);pauseScene(old);current=target;updateUI();armAdvance();
  setTimeout(()=>{old.classList.remove('is-active','is-leaving');locked=false},880);
};
const next=()=>{if(performance.now()>=stageReadyAt)go(current+1)},prev=()=>go(current-1);

$('[data-next]').addEventListener('click',next);
$('[data-stage-next]').addEventListener('click',next);
$('[data-prev]').addEventListener('click',prev);
$$('[data-restart]').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();go(0)}));
addEventListener('keydown',e=>{
  if(e.target.matches('input'))return;
  if(['ArrowRight',' ','Enter'].includes(e.key)){e.preventDefault();next()}
  if(e.key==='ArrowLeft'){e.preventDefault();prev()}
  if(e.key==='Home'){e.preventDefault();go(0)}
});
addEventListener('touchstart',e=>touchX=e.changedTouches[0].clientX,{passive:true});
addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>55)(dx<0?next:prev)()},{passive:true});

const fadeAudio=(target,duration=900)=>{
  cancelAnimationFrame(fadeFrame);const start=soundtrack.volume,at=performance.now();
  const tick=now=>{const t=Math.min(1,(now-at)/duration);soundtrack.volume=Math.max(0,Math.min(1,start+(target-start)*t));if(t<1)fadeFrame=requestAnimationFrame(tick);else if(target===0)soundtrack.pause()};
  fadeFrame=requestAnimationFrame(tick);
};
const setSound=async on=>{
  if(on){soundtrack.volume=0;try{await soundtrack.play();fadeAudio(.42,1200)}catch{return false}}
  else fadeAudio(0,650);
  soundButton.setAttribute('aria-pressed',String(on));$('b',soundButton).textContent=on?'ON':'OFF';return true;
};
$('[data-enter]').addEventListener('click',async()=>{document.body.classList.remove('is-loading');playScene(scenes[0]);armAdvance();await setSound(true)});
$('[data-enter-muted]').addEventListener('click',()=>{document.body.classList.remove('is-loading');playScene(scenes[0]);armAdvance();setSound(false)});
soundButton.addEventListener('click',()=>setSound(soundButton.getAttribute('aria-pressed')!=='true'));

$('.memory-form').addEventListener('submit',e=>{
  e.preventDefault();const input=$('#memory'),text=input.value.trim();
  if(!text){input.focus();return}
  $('[data-memory-result]').textContent=`“${text}” 已被留在这一刻。`;
});

if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
  const cursor=$('.magic-cursor'),trailWrap=$('.cursor-trails');
  const points=Array.from({length:7},()=>({x:innerWidth/2,y:innerHeight/2,el:trailWrap.appendChild(document.createElement('i'))}));
  let tx=innerWidth/2,ty=innerHeight/2,cx=tx,cy=ty,started=false;
  addEventListener('pointermove',e=>{
    tx=e.clientX;ty=e.clientY;
    if(!started){cx=tx;cy=ty;points.forEach(p=>{p.x=tx;p.y=ty});started=true}
    cursor.classList.add('visible');
  },{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>{cursor.classList.remove('visible');points.forEach(p=>p.el.style.opacity=0)});
  $$('a,button,input').forEach(el=>{el.addEventListener('mouseenter',()=>cursor.classList.add('active'));el.addEventListener('mouseleave',()=>cursor.classList.remove('active'))});
  const follow=()=>{
    cx+=(tx-cx)*.3;cy+=(ty-cy)*.3;cursor.style.transform=`translate3d(${cx+18}px,${cy+18}px,0)`;
    let lead={x:cx,y:cy};points.forEach((p,i)=>{p.x+=(lead.x-p.x)*(.28-i*.018);p.y+=(lead.y-p.y)*(.28-i*.018);p.el.style.transform=`translate3d(${p.x}px,${p.y}px,0)`;p.el.style.opacity=started?String(.55-i*.065):0;lead=p});
    requestAnimationFrame(follow);
  };follow();
}

updateUI();
setTimeout(()=>$('[data-enter]').focus(),700);
