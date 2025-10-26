(function(){
  const { safeImg, FLAGCDN, tracker, mkActivityCard, markActivity } = window.App.helpers;

  // Load dataset
  async function loadCountries(){
    const res = await fetch('data/countries.json');
    return await res.json();
  }

  function build(){
    const ui = mkActivityCard('act1', {
      title: '1) Geografía — País misterioso',
      objective: 'Identify Spanish-speaking countries and cultural facts.'
    });

    const t = tracker({bar:ui.bar,pct:ui.pct,lbl:ui.lvl,stat:ui.stat,goal:12,exempt:false});
    t.ensure();

    const STEPS=[
      {k:'country',ask:'¿Cuál país es este?',kind:'map'},
      {k:'flag',ask:'Elige la bandera correcta',kind:'flag'},
      {k:'capital',ask:'¿Cuál es la capital?',kind:'capital'},
      {k:'music',ask:'Elige un estilo de música famoso',kind:'music'},
      {k:'attraction',ask:'Elige una atracción turística famosa',kind:'attraction'},
      {k:'currency',ask:'¿Cuál es la moneda?',kind:'currency'},
      {k:'food',ask:'Elige una comida popular',kind:'food'},
      {k:'neighbor',ask:'¿Qué país tiene frontera con este país?',kind:'neighbor'},
      {k:'region',ask:'¿En qué región/continente se encuentra?',kind:'region'},
      {k:'sport',ask:'Elige un deporte nacional o popular',kind:'sport'},
      {k:'famous',ask:'Elige una persona famosa de este país',kind:'famous'},
      {k:'variant',ask:'Variante del idioma más común',kind:'variant'}
    ];

    const body = document.getElementById('act1-body');
    body.innerHTML = `
      <div class="prompt"><span id="a1Paso">Paso 1</span>: <span id="a1Q">¿Cuál país es este?</span></div>
      <div class="center"><img id="a1Viz" class="thumb" alt="mapa" style="display:none;max-width:520px;height:auto" referrerpolicy="no-referrer" crossorigin="anonymous"/></div>
      <div class="grid" id="a1Choices"></div>
      <div class="center"><a id="a1Investigate" class="note" style="text-decoration:none;background:linear-gradient(90deg,#FFAB00,#C8FCEA);padding:4px 10px;border-radius:999px;font-weight:900;color:#0f3f38" href="#" target="_blank" rel="noopener">🔎 investigar</a></div>
      <div class="note" id="a1Hint"></div>
    `;
    const paso=document.getElementById('a1Paso'), q=document.getElementById('a1Q'), viz=document.getElementById('a1Viz'), choices=document.getElementById('a1Choices'), hint=document.getElementById('a1Hint');
    const link=document.getElementById('a1Investigate');

    function chip(parent,{label,img,ok,onCorrect,onWrong,flagAlt,sub}){
      const b=document.createElement('button'); b.className='chip';
      if(img && img.length){
        const i=document.createElement('img'); i.className='thumb';
        i.setAttribute('referrerpolicy','no-referrer'); i.setAttribute('crossorigin','anonymous');
        safeImg(i,img,520,label,flagAlt); b.appendChild(i);
      }
      const s=document.createElement('span'); s.className='label'; s.textContent=label; b.appendChild(s);
      if(sub){ const n=document.createElement('span'); n.className='note'; n.textContent=sub; b.appendChild(n); }
      b.onclick=()=>{ ok ? (onCorrect&&onCorrect()) : (onWrong&&onWrong()) };
      parent.appendChild(b);
    }

    loadCountries().then(COUNTRIES=>{
      function distractors(except,n){return COUNTRIES.filter(x=>x.name!==except).sort(()=>Math.random()-0.5).slice(0,n)}
      function round(){
        const c=COUNTRIES[Math.floor(Math.random()*COUNTRIES.length)]; let i=0;
        if(link){ link.href='https://es.wikipedia.org/wiki/'+encodeURIComponent(c.name.replaceAll(' ','_')); link.title='Wikipedia: '+c.name; }
        step();
        function step(){
          const s=STEPS[i]; paso.textContent='Paso '+(i+1); q.textContent=s.ask; choices.innerHTML=''; hint.textContent='';
          if(s.kind==='map'){ viz.style.display='block'; safeImg(viz, c.map, 640, c.name); } else { viz.style.display='none' }
          let opts=[];
          if(s.k==='country'){opts=[{label:c.name,ok:1}].concat(distractors(c.name,3).map(x=>({label:x.name}))); }
          else if(s.k==='flag'){opts=[{label:c.name,img:c.flag,flagAlt:FLAGCDN[c.code],ok:1}].concat(distractors(c.name,3).map(x=>({label:x.name,img:x.flag,flagAlt:FLAGCDN[x.code]}))); }
          else if(s.k==='capital'){opts=[{label:c.capital,img:c.capitalImg,ok:1}].concat(distractors(c.name,3).map(x=>({label:x.capital,img:x.capitalImg}))); }
          else if(s.k==='music'){const pool=[...new Set(COUNTRIES.flatMap(x=>x.music).filter(Boolean))]; const wrong=pool.filter(m=>m!==c.music[0]).sort(()=>Math.random()-0.5).slice(0,3).map(m=>({label:m})); opts=[{label:c.music[0],ok:1}].concat(wrong); }
          else if(s.k==='attraction'){opts=[{label:c.attraction,img:c.attractionImg,ok:1}].concat(distractors(c.name,3).map(x=>({label:x.attraction,img:x.attractionImg}))); }
          else if(s.k==='currency'){opts=[{label:c.currency,img:c.currencyImg,ok:1}].concat(distractors(c.name,3).map(x=>({label:x.currency,img:x.currencyImg}))); }
          else if(s.k==='food'){const pool=[...new Set(COUNTRIES.flatMap(x=>x.food).filter(Boolean))]; const wrong=pool.filter(f=>f!==c.food[0]).sort(()=>Math.random()-0.5).slice(0,3).map(f=>({label:f})); opts=[{label:c.food[0],img:c.foodImg,ok:1}].concat(wrong); }
          else if(s.k==='neighbor'){const neigh=c.neighbors||[]; const cor=neigh.length?neigh[Math.floor(Math.random()*neigh.length)]:COUNTRIES.find(x=>x.name!==c.name).name; const other=COUNTRIES.map(x=>x.name).filter(nm=>nm!==c.name && nm!==cor); const wrong=other.sort(()=>Math.random()-0.5).slice(0,3).map(nm=>({label:nm})); opts=[{label:cor,ok:1}].concat(wrong); hint.textContent=neigh.length?'Hint: bordering country':'Hint: island/territory without land borders'; }
          else if(s.k==='region'){const regs=[...new Set(COUNTRIES.map(x=>x.region).filter(Boolean))]; const wrong=regs.filter(r=>r!==c.region).sort(()=>Math.random()-0.5).slice(0,3).map(r=>({label:r})); opts=[{label:c.region,img:c.regionImg,ok:1}].concat(wrong); }
          else if(s.k==='sport'){const sports=[...new Set(COUNTRIES.map(x=>x.sport).filter(Boolean))]; const wrong=sports.filter(r=>r!==c.sport).sort(()=>Math.random()-0.5).slice(0,3).map(r=>({label:r})); opts=[{label:c.sport,img:c.sportImg,ok:1}].concat(wrong); }
          else if(s.k==='famous'){opts=[{label:c.famous,img:c.famousImg,ok:1,sub:(c.famousProf?'profesión: '+c.famousProf:undefined)}].concat(distractors(c.name,3).map(x=>({label:x.famous,img:x.famousImg,sub:(x.famousProf?'profesión: '+x.famousProf:undefined)}))); }
          else if(s.k==='variant'){const vars=[...new Set(COUNTRIES.map(x=>x.variant).filter(Boolean))]; const wrong=vars.filter(v=>v!==c.variant).sort(()=>Math.random()-0.5).slice(0,3).map(v=>({label:v})); opts=[{label:c.variant,ok:1}].concat(wrong); }
          if(!opts.some(o=>o.ok)) opts[0].ok=1;
          opts.sort(()=>Math.random()-0.5).forEach(o=>chip(choices,{...o,onCorrect:()=>{t.attempt(true); i++; if(i>=STEPS.length) setTimeout(round,400); else step()},onWrong:()=>t.attempt(false)}));
          markActivity('Activity 1 — Geografía', t.get(), (t.get().correct>=12 && t.get().accuracy>=80));
        }
      }
      round();
    });
  }

  document.addEventListener('DOMContentLoaded', build);
})();
