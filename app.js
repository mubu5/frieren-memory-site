const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const enter=$('[data-enter]');
enter.addEventListener('click',async()=>{document.body.classList.remove('is-loading');await setSound(true)});
const enterMuted=$('[data-enter-muted]');
enterMuted.addEventListener('click',()=>{document.body.classList.remove('is-loading');setSound(false)});
setTimeout(()=>enter.focus(),1800);

const briefingMore=$('.briefing__more');
if(matchMedia('(max-width:800px)').matches)briefingMore.removeAttribute('open');

const reveals=$$('.reveal');
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.16});
reveals.forEach(el=>io.observe(el));

const progress=$('.progress i');
const chapters=$$('section[id]');
const navLinks=$$('.index a');
const lightSections=new Set(['briefing','ten','funeral','smallthings','letter']);
addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${Math.min(100,scrollY/max*100)}%`;
  let active=chapters[0].id;
  chapters.forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.48)active=s.id});
  navLinks.forEach(a=>a.classList.toggle('active',a.hash===`#${active}`));
  document.body.classList.toggle('light-ui',lightSections.has(active));
},{passive:true});

$('.menu').addEventListener('click',e=>{
  const open=$('.index').classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded',open);
});
navLinks.forEach(a=>a.addEventListener('click',()=>$('.index').classList.remove('open')));

$('.meteor-trigger').addEventListener('click',()=>{
  for(let i=0;i<7;i++)setTimeout(()=>{
    const m=document.createElement('i');m.className='meteor';m.style.top=`${5+Math.random()*35}%`;m.style.animationDelay=`${Math.random()*.25}s`;$('#fifty').append(m);setTimeout(()=>m.remove(),1700);
  },i*120);
});

const strip=$('.memory-strip');let down=false,startX=0,startScroll=0;
strip.addEventListener('pointerdown',e=>{down=true;startX=e.clientX;startScroll=strip.scrollLeft;strip.setPointerCapture(e.pointerId)});
strip.addEventListener('pointermove',e=>{if(down)strip.scrollLeft=startScroll-(e.clientX-startX)});
strip.addEventListener('pointerup',()=>down=false);strip.addEventListener('pointercancel',()=>down=false);
const memoryCards=$$('article',strip),memoryCurrent=$('[data-memory-current]');
const memoryIndex=()=>Math.max(0,Math.min(memoryCards.length-1,Math.round(strip.scrollLeft/(memoryCards[0].offsetWidth+20))));
const goMemory=delta=>{const index=Math.max(0,Math.min(memoryCards.length-1,memoryIndex()+delta));memoryCards[index].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'})};
$('[data-memory-prev]').addEventListener('click',()=>goMemory(-1));
$('[data-memory-next]').addEventListener('click',()=>goMemory(1));
strip.addEventListener('scroll',()=>memoryCurrent.textContent=String(memoryIndex()+1).padStart(2,'0'),{passive:true});
strip.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();goMemory(-1)}if(e.key==='ArrowRight'){e.preventDefault();goMemory(1)}});

const textarea=$('#memory'),count=$('[data-count]');
textarea.addEventListener('input',()=>count.textContent=textarea.value.length);
$('.memory-form').addEventListener('submit',e=>{
  e.preventDefault();const text=textarea.value.trim();if(!text){textarea.focus();return}
  $('[data-memory-text]').textContent=text;
  $('[data-memory-id]').textContent=String(Math.floor(Math.random()*999)).padStart(3,'0');
  $('[data-submit-status]').textContent='这段记忆已经封存。';
  const portrait=$('.letter-portrait');portrait.classList.add('is-revealed');portrait.setAttribute('aria-hidden','false');
  $('.memory-card').animate([{transform:'rotate(1deg) scale(.96)',opacity:.35},{transform:'rotate(1deg) scale(1)',opacity:1}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});
});

const soundtrack=$('#soundtrack');let fadeFrame;
const fadeAudio=(target,duration=900)=>{cancelAnimationFrame(fadeFrame);const start=soundtrack.volume,at=performance.now();const tick=now=>{const t=Math.max(0,Math.min(1,(now-at)/duration));soundtrack.volume=Math.max(0,Math.min(1,start+(target-start)*t));if(t<1)fadeFrame=requestAnimationFrame(tick);else if(target===0)soundtrack.pause()};fadeFrame=requestAnimationFrame(tick)};
const soundButton=$('.sound');
const setSound=async on=>{
  if(on){soundtrack.volume=0;try{await soundtrack.play();fadeAudio(.42,1200)}catch(err){console.error('Soundtrack playback failed',err);return false}}
  else fadeAudio(0,700);
  soundButton.setAttribute('aria-pressed',on);$('b',soundButton).textContent=on?'ON':'OFF';$('.state-label',soundButton).textContent=on?'音乐正在播放':'音乐已暂停';soundButton.title=on?'暂停 Time Flows Ever Onward':'播放 Time Flows Ever Onward';
  return true;
};
soundButton.addEventListener('click',async e=>{
  const button=e.currentTarget;
  const on=button.getAttribute('aria-pressed')!=='true';
  await setSound(on);
});

if(matchMedia('(pointer:fine)').matches){
  const c=$('.cursor');let tx=innerWidth/2,ty=innerHeight/2,x=tx,y=ty,started=false;
  const trackCursor=e=>{tx=e.clientX;ty=e.clientY;if(!started){x=tx;y=ty;started=true}document.body.classList.add('custom-cursor');c.classList.add('visible')};
  addEventListener('pointermove',trackCursor,{passive:true});
  addEventListener('mousemove',trackCursor,{passive:true});
  document.documentElement.addEventListener('mouseleave',()=>{c.classList.remove('visible');document.body.classList.remove('custom-cursor')});
  const follow=()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;c.style.transform=`translate3d(${x}px,${y}px,0)`;requestAnimationFrame(follow)};follow();
  $$('a,button,textarea,.memory-strip,.memory-strip article').forEach(el=>{el.addEventListener('mouseenter',()=>c.classList.add('active'));el.addEventListener('mouseleave',()=>c.classList.remove('active'))});
}

const motionImages=$$('.film-pair img,.memory-stage__back img,.portrait-silhouette img,.north-visual,.letter-portrait img');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  let motionFrame=0;
  const updateMotion=()=>{
    motionImages.forEach(img=>{
      const rect=img.parentElement.getBoundingClientRect();
      if(rect.bottom>0&&rect.top<innerHeight){
        const center=rect.top+rect.height/2-innerHeight/2;
        img.style.setProperty('--shift',`${Math.max(-22,Math.min(22,-center*.035))}px`);
      }
    });
    motionFrame=0;
  };
  addEventListener('scroll',()=>{if(!motionFrame)motionFrame=requestAnimationFrame(updateMotion)},{passive:true});
  addEventListener('resize',updateMotion,{passive:true});
  updateMotion();
}
