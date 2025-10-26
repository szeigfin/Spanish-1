window.App = (() => {
  // ======== Image helpers (Wikimedia + FlagCDN + SVG fallback) =========
  const FLAGCDN = {
    es:"https://flagcdn.com/w320/es.png", mx:"https://flagcdn.com/w320/mx.png", ar:"https://flagcdn.com/w320/ar.png",
    co:"https://flagcdn.com/w320/co.png", cl:"https://flagcdn.com/w320/cl.png", pe:"https://flagcdn.com/w320/pe.png",
    uy:"https://flagcdn.com/w320/uy.png", py:"https://flagcdn.com/w320/py.png", bo:"https://flagcdn.com/w320/bo.png",
    ve:"https://flagcdn.com/w320/ve.png", ec:"https://flagcdn.com/w320/ec.png", cr:"https://flagcdn.com/w320/cr.png",
    pa:"https://flagcdn.com/w320/pa.png", do:"https://flagcdn.com/w320/do.png", pr:"https://flagcdn.com/w320/pr.png",
    cu:"https://flagcdn.com/w320/cu.png", gt:"https://flagcdn.com/w320/gt.png", hn:"https://flagcdn.com/w320/hn.png",
    ni:"https://flagcdn.com/w320/ni.png", sv:"https://flagcdn.com/w320/sv.png", gq:"https://flagcdn.com/w320/gq.png"
  };
  const svgFallback = (label) =>
    "data:image/svg+xml;utf8,"+encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#FFAB00'/>
          <stop offset='100%' stop-color='#1C6E65'/>
        </linearGradient></defs>
        <rect width='100%' height='100%' fill='url(#g)'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
          font-family='Montserrat Alternates, Arial' font-size='22' fill='#0f3f38'>${label}</text>
      </svg>`
    );
  const commonsThumb = (u,w=480) => {
    try {
      const m = "commons.wikimedia.org/wiki/Special:FilePath/";
      if (u.includes(m)) {
        const f = decodeURIComponent(u.split(m)[1]);
        return "https://commons.wikimedia.org/w/thumb.php?f="+encodeURIComponent(f)+"&width="+w;
      }
    } catch(e){}
    return u;
  };
  function safeImg(el, urlList=[], width=480, label='imagen', flagAlt=null){
    const wm = urlList.map(u=>commonsThumb(u, width));
    const urls = wm.concat(flagAlt? [flagAlt] : []);
    let i = 0;
    function trySet(){
      if(!urls.length){ el.src = svgFallback(label); return; }
      el.src = urls[i];
    }
    el.onerror = ()=>{
      i++;
      if(i<urls.length){ el.src = urls[i]; }
      else { el.onerror = null; el.src = svgFallback(label); }
    };
    trySet();
  }

  // ======== Voices =========
  const voiceCfg = { voice:null, rate:1, pitch:1 };
  function populateVoices(){
    const sel = document.getElementById('voicePick');
    if(!sel) return;
    const all = speechSynthesis.getVoices().filter(v=>/(^es|Spanish|Espa[ñn]ol)/i.test(v.lang+' '+v.name));
    sel.innerHTML = '';
    const def=document.createElement('option'); def.value=''; def.textContent='Default (Chrome OS español 5)'; sel.appendChild(def);
    all.forEach(v=>{ const o=document.createElement('option'); o.value=v.name; o.textContent = `${v.name} — ${v.lang}`; sel.appendChild(o); });
    voiceCfg.voice = all.find(v=>/Chrome OS\s*espa[ñn]ol\s*5/i.test(v.name)) || all[0] || null;
    sel.value = voiceCfg.voice ? voiceCfg.voice.name : '';
  }
  speechSynthesis.onvoiceschanged = populateVoices;
  document.addEventListener('DOMContentLoaded', populateVoices);
  document.addEventListener('input', (e)=>{
    if(e.target.id==='voicePick'){
      const name = e.target.value;
      const all = speechSynthesis.getVoices().filter(v=>/(^es|Spanish|Espa[ñn]ol)/i.test(v.lang+' '+v.name));
      voiceCfg.voice = all.find(v=>v.name===name) || voiceCfg.voice;
    }
    if(e.target.id==='ratePick') voiceCfg.rate = parseFloat(e.target.value);
    if(e.target.id==='pitchPick') voiceCfg.pitch = parseFloat(e.target.value);
  });
  function speakES(text){
    const u = new SpeechSynthesisUtterance(text);
    const all = speechSynthesis.getVoices().filter(v=>/(^es|Spanish|Espa[ñn]ol)/i.test(v.lang+' '+v.name));
    u.voice = voiceCfg.voice || all[0] || null; u.rate = voiceCfg.rate; u.pitch = voiceCfg.pitch;
    speechSynthesis.speak(u);
  }

  // ======== Progress + confetti =========
  function setBar(bar,pct,lbl,percent){
    bar.style.setProperty('--val',percent+'%'); pct.textContent=percent+'%';
    lbl.textContent=(percent<60?'Starting':percent<73?'Beginning':percent<83?'Approaching':percent<97?'Meeting Proficiency':'Exceeding Proficiency');
  }
  function confetti(){
    const wrap = document.getElementById('confetti') || (()=>{ const d=document.createElement('div'); d.id='confetti'; d.style.position='fixed'; d.style.inset='0'; d.style.pointerEvents='none'; document.body.appendChild(d); return d;})();
    const N=90, colors=['#DD2E18','#FFAB00','#1C6E65','#86f1dc','#0f5a52'];
    const els=[];
    for(let i=0;i<N;i++){
      const d=document.createElement('div'); d.style.cssText='position:absolute;width:8px;height:12px;opacity:.9';
      d.style.left=(Math.random()*100)+'%'; d.style.top='-10px'; d.style.background=colors[Math.floor(Math.random()*colors.length)];
      wrap.appendChild(d);
      const fall=window.innerHeight+40; const dx=(Math.random()*200-100); const duration=800+Math.random()*1100;
      d.animate([{transform:'translate(0,0)'},{transform:`translate(${dx}px,${fall}px)`}],{duration,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});
      els.push(d);
    }
    setTimeout(()=>els.forEach(e=>e.remove()),1700);
  }
  function tracker({bar,pct,lbl,stat,goal=12,exempt=false}){
    let correct=0, attempts=0;
    const acc=()=> attempts? Math.round(100*correct/attempts):0;
    function update(){
      const p=Math.min(100,Math.round(100*correct/goal));
      setBar(bar,pct,lbl,p);
      if(stat) stat.textContent=`Correct: ${correct} · Attempts: ${attempts} · Accuracy: ${acc()}%`;
      if(!exempt && correct>=goal && acc()>=80) confetti();
    }
    return {
      attempt(ok){ attempts++; if(ok) correct++; update(); },
      ensure(){ update(); },
      get(){ return {correct,attempts,accuracy:acc()} }
    };
  }

  // ======== Data collection & export =========
  const Store = {
    page: { firstName:'', lastName:'', date:'', awayMs:0 },
    activities: {}, // id -> {correct, attempts, accuracy, complete}
    startedAt: Date.now(), lastBlur: null
  };
  window.addEventListener('blur', ()=>{ Store.lastBlur = Date.now(); });
  window.addEventListener('focus', ()=>{ if(Store.lastBlur) { Store.page.awayMs += (Date.now()-Store.lastBlur); Store.lastBlur=null; }});
  function updateStudentFields(){
    Store.page.firstName = (document.getElementById('firstName')||{}).value||'';
    Store.page.lastName  = (document.getElementById('lastName')||{}).value||'';
    Store.page.date      = (document.getElementById('studentDate')||{}).value||'';
  }
  ['firstName','lastName','studentDate'].forEach(id=>{
    document.addEventListener('input', e=>{ if(e.target.id===id) updateStudentFields(); });
  });
  function markActivity(id, stats, complete){
    Store.activities[id] = {...stats, complete: !!complete};
  }
  function exportJSON(){
    const blob = new Blob([JSON.stringify(Store,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'spanish_progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function copySummary(){
    const lines = [];
    lines.push(`Student: ${Store.page.firstName} ${Store.page.lastName}  Date: ${Store.page.date}`);
    const ids = Object.keys(Store.activities);
    ids.forEach(id=>{
      const s=Store.activities[id];
      lines.push(`${id}: ${s.correct}/${s.attempts} correct (${s.accuracy}%)  Complete: ${s.complete?'Yes':'No'}`);
    });
    navigator.clipboard.writeText(lines.join('\n'));
    alert('Summary copied!');
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    const dl = document.getElementById('dlJson'); if(dl) dl.onclick = exportJSON;
    const cs = document.getElementById('copySummary'); if(cs) cs.onclick = copySummary;
  });

  // ======== Shared UI builders =========
  function mkActivityCard(rootId, {title, objective}){
    const root = document.getElementById(rootId);
    root.innerHTML = `
      <div class="progress-wrap">
        <div class="level" id="${rootId}-level">Starting</div>
        <div class="progress" id="${rootId}-bar" style="--val:0%"></div>
        <div class="pct" id="${rootId}-pct">0%</div>
      </div>
      <header>
        <div>
          <h2>${title}</h2>
          <div class="objective">${objective}</div>
        </div>
        <div class="stat" id="${rootId}-stats">Correct: 0 · Attempts: 0 · Accuracy: 0%</div>
      </header>
      <div class="body" id="${rootId}-body"></div>
    `;
    const bar = document.getElementById(`${rootId}-bar`);
    const pct = document.getElementById(`${rootId}-pct`);
    const lvl = document.getElementById(`${rootId}-level`);
    const stat= document.getElementById(`${rootId}-stats`);
    return {root, bar, pct, lvl, stat};
  }

  // expose core to modules
  return {
    init(){ /* modules will call themselves after DOM ready */ },
    helpers:{ safeImg, FLAGCDN, speakES, tracker, mkActivityCard, markActivity }
  };
})();
