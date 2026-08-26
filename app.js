const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const enter=$('[data-enter]');
enter.addEventListener('click',()=>document.body.classList.remove('is-loading'));
setTimeout(()=>enter.focus(),1800);

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

const textarea=$('#memory'),count=$('[data-count]');
textarea.addEventListener('input',()=>count.textContent=textarea.value.length);
$('.memory-form').addEventListener('submit',e=>{
  e.preventDefault();const text=textarea.value.trim();if(!text){textarea.focus();return}
  $('[data-memory-text]').textContent=text;
  $('[data-memory-id]').textContent=String(Math.floor(Math.random()*999)).padStart(3,'0');
  $('.memory-card').animate([{transform:'rotate(1deg) scale(.96)',opacity:.35},{transform:'rotate(1deg) scale(1)',opacity:1}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});
});

const soundtrack=$('#soundtrack');let fadeFrame;
const fadeAudio=(target,duration=900)=>{cancelAnimationFrame(fadeFrame);const start=soundtrack.volume,at=performance.now();const tick=now=>{const t=Math.min(1,(now-at)/duration);soundtrack.volume=start+(target-start)*t;if(t<1)fadeFrame=requestAnimationFrame(tick);else if(target===0)soundtrack.pause()};fadeFrame=requestAnimationFrame(tick)};
$('.sound').addEventListener('click',async e=>{
  const button=e.currentTarget;
  const on=button.getAttribute('aria-pressed')!=='true';
  if(on){soundtrack.volume=0;try{await soundtrack.play();fadeAudio(.42,1200)}catch(err){console.error('Soundtrack playback failed',err);return}}
  else fadeAudio(0,700);
  button.setAttribute('aria-pressed',on);$('b',button).textContent=on?'ON':'OFF';
});

if(matchMedia('(pointer:fine)').matches){
  const c=$('.cursor');c.style.cssText='position:fixed;width:7px;height:7px;border:1px solid #fff;border-radius:50%;z-index:999;pointer-events:none;mix-blend-mode:difference;transition:width .2s,height .2s;';
  addEventListener('pointermove',e=>{c.style.left=`${e.clientX-4}px`;c.style.top=`${e.clientY-4}px`});
  $$('a,button,textarea,.memory-strip').forEach(el=>{el.addEventListener('mouseenter',()=>{c.style.width='28px';c.style.height='28px'});el.addEventListener('mouseleave',()=>{c.style.width='7px';c.style.height='7px'})});
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
