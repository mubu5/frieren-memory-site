const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const scenes=$$('[data-scene]');
const soundtrack=$('#soundtrack');
const soundButton=$('.sound');
const currentLabel=$('[data-current]');
const progress=$('.progress i');
const dots=$('[data-dots]');
let current=0,locked=false,fadeFrame=0,touchX=0;

$('[data-total]').textContent=String(scenes.length).padStart(2,'0');
scenes.forEach((scene,index)=>{
  const dot=document.createElement('button');
  dot.type='button';dot.setAttribute('aria-label',`前往第 ${index+1} 幕：${scene.dataset.label}`);
  dot.addEventListener('click',()=>go(index));dots.append(dot);
});

const playScene=scene=>{
  const video=$('video',scene);if(!video)return;
  video.play().catch(()=>{});
};
const pauseScene=scene=>{const video=$('video',scene);if(video)video.pause()};
const updateUI=()=>{
  currentLabel.textContent=String(current+1).padStart(2,'0');
  progress.style.width=`${(current+1)/scenes.length*100}%`;
  $$('button',dots).forEach((dot,i)=>dot.classList.toggle('is-active',i===current));
  $('[data-prev]').disabled=current===0;
  document.body.classList.toggle('on-final',current===scenes.length-1);
};
const go=(target)=>{
  if(locked||target===current||target<0||target>=scenes.length)return;
  locked=true;
  const old=scenes[current],next=scenes[target];
  old.classList.add('is-leaving');next.classList.add('is-active');
  playScene(next);pauseScene(old);current=target;updateUI();
  setTimeout(()=>{old.classList.remove('is-active','is-leaving');locked=false},880);
};
const next=()=>go(current+1),prev=()=>go(current-1);

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
$('[data-enter]').addEventListener('click',async()=>{document.body.classList.remove('is-loading');playScene(scenes[0]);await setSound(true)});
$('[data-enter-muted]').addEventListener('click',()=>{document.body.classList.remove('is-loading');playScene(scenes[0]);setSound(false)});
soundButton.addEventListener('click',()=>setSound(soundButton.getAttribute('aria-pressed')!=='true'));

$('.memory-form').addEventListener('submit',e=>{
  e.preventDefault();const input=$('#memory'),text=input.value.trim();
  if(!text){input.focus();return}
  $('[data-memory-result]').textContent=`“${text}” 已被留在这一刻。`;
});

updateUI();
setTimeout(()=>$('[data-enter]').focus(),700);
