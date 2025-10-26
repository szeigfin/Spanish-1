(function(){
  const { tracker, mkActivityCard, markActivity, speakES } = window.App.helpers;

  function build(){
    const ui = mkActivityCard('act2', {
      title: '2) ¿Qué significa hablar?',
      objective: 'Recognize the meaning of “hablar”.'
    });
    const t = tracker({bar:ui.bar,pct:ui.pct,lbl:ui.lvl,stat:ui.stat,goal:1,exempt:false});
    t.ensure();

    const body = document.getElementById('act2-body') || ui.root.querySelector('.body');
    body.innerHTML = `
      <div class="grid" id="a2Choices"></div>
      <button class="chip" id="a2Speak"><span class="label">🔊 Pronunciar “hablar”</span></button>
    `;
    const wrap = document.getElementById('a2Choices');
    function round(){
      wrap.innerHTML='';
      const options=[{label:'to speak',ok:1},{label:'to learn'},{label:'to live'},{label:'to eat'}];
      options.sort(()=>Math.random()-0.5).forEach(o=>{
        const b=document.createElement('button'); b.className='chip'; b.innerHTML=`<span class="label">${o.label}</span>`;
        b.onclick=()=>{ t.attempt(!!o.ok); round(); markActivity('Activity 2 — ¿Qué significa hablar?', t.get(), (t.get().correct>=1)); };
        wrap.appendChild(b);
      });
    }
    document.addEventListener('click', (e)=>{ if(e.target.closest('#a2Speak')) speakES('hablar'); });
    round();
  }

  document.addEventListener('DOMContentLoaded', build);
})();
