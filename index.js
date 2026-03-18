const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const COLS = {
  "Floraison": {
    bg_prompt: "old French village square, weathered stone fountain, climbing roses on limestone wall, soft spring afternoon light, Provence, authentic worn cobblestones, natural imperfections, real photography",
    bg_negative: "people, text, logo, fake, CGI, oversaturated, too clean, studio backdrop",
    bg_harmony: "match the natural daylight exposure of the subject, warm soft light, consistent shadow direction, seamless realistic integration, same color temperature",
    vto_prompt: "elegant plus-size woman wearing the outfit, fashion editorial"
  },
  "Minéral": {
    bg_prompt: "French Luberon stone farmhouse exterior wall, rough limestone texture, golden hour late afternoon sun, dry lavender at edge, authentic aged stone surface, Provence countryside",
    bg_negative: "people, text, logo, fake, CGI, oversaturated, too clean, studio",
    bg_harmony: "match warm golden hour light of subject, sun from right side, natural warm skin tones, seamless shadow integration",
    vto_prompt: "elegant plus-size woman wearing the outfit, fashion editorial"
  },
  "Audace": {
    bg_prompt: "Haussmann building facade Paris 11e, worn grey zinc balcony railing, authentic peeling paint details, late afternoon diffused light, real Parisian street texture, slightly overcast sky",
    bg_negative: "people, text, logo, fake, CGI, too perfect, studio, tourist postcard",
    bg_harmony: "match cool Parisian diffused light of subject, consistent grey-warm neutral tones, soft shadows, realistic urban integration",
    vto_prompt: "confident plus-size woman wearing the outfit, fashion editorial"
  },
  "Crépuscule": {
    bg_prompt: "Loire valley chateau stone garden at dusk, real weathered balustrade, authentic warm purple orange sky last light, French heritage architecture, imperfect aged stone, moody atmospheric",
    bg_negative: "people, text, logo, fake, CGI, too bright, studio, neon, oversaturated",
    bg_harmony: "match warm dusk purple-orange ambient tones of subject, soft low backlight, consistent moody exposure",
    vto_prompt: "elegant plus-size woman wearing the outfit, fashion editorial"
  },
  "Riviera": {
    bg_prompt: "Marseille Vallon des Auffes authentic fishing port, real weathered painted boats, worn ochre peeling facades, genuine Mediterranean midday light, south of France",
    bg_negative: "people, text, logo, fake, CGI, too perfect, studio, tourist postcard",
    bg_harmony: "match bright Mediterranean high-key light of subject, warm white natural light, consistent sharp shadows, realistic integration",
    vto_prompt: "radiant plus-size woman wearing the outfit, fashion editorial"
  }
};

const POSES = [
  { id: "p1",  label: "Portrait buste",           prompt: "change the pose to upper body portrait, slight forward lean, natural arms, direct camera gaze, keep exact same outfit and background" },
  { id: "p2",  label: "Marche plein corps",        prompt: "change the pose to full body walking toward camera, natural movement, keep exact same outfit and background" },
  { id: "p3",  label: "3/4 face déhanchée",        prompt: "change the pose to 3/4 angle, weight on one hip, slight body rotation, relaxed arms, keep exact same outfit and background" },
  { id: "p4",  label: "Frontale catalog",          prompt: "change the pose to straight frontal catalog pose, feet together, arms alongside body, keep exact same outfit and background" },
  { id: "p5",  label: "Frontale col mis en avant", prompt: "change the pose to frontal pose, slight chest forward, neckline highlighted, feet slightly apart, keep exact same outfit and background" },
  { id: "p6",  label: "Un pied devant",            prompt: "change the pose to frontal with one foot slightly forward, natural walking start position, keep exact same outfit and background" },
  { id: "p7",  label: "Pop de hanche",             prompt: "change the pose to strong hip pop to the side, hand on hip, direct camera gaze, confident stance, keep exact same outfit and background" },
  { id: "p8",  label: "Jambes croisées",           prompt: "change the pose to standing with one leg crossed in front of the other, relaxed posture, keep exact same outfit and background" },
  { id: "p9",  label: "Mains sur les hanches",     prompt: "change the pose to both hands on hips, confident posture, direct camera gaze, keep exact same outfit and background" },
  { id: "p10", label: "3/4 micro-geste tissu",     prompt: "change the pose to 3/4 side view, one hand gently holding the fabric of the dress, elegant micro gesture, keep exact same outfit and background" }
];

app.post("/proxy", async (req, res) => {
  const { endpoint } = req.query;
  const { api_key, ...fields } = req.body;
  if (!endpoint) return res.status(400).json({ error: "endpoint manquant" });
  if (!api_key) return res.status(400).json({ error: "api_key manquant" });
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v != null && v !== "") fd.append(k, String(v));
  try {
    const r = await fetch(`https://thenewblack.ai/api/1.1/wf/${endpoint}?api_key=${api_key}`, { method: "POST", body: fd });
    const txt = await r.text();
    res.status(r.status).send(txt.replace(/\r?\n/g, "").trim());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/imgbb", async (req, res) => {
  const { key } = req.query;
  const { image } = req.body;
  if (!key || !image) return res.status(400).json({ error: "key ou image manquant" });
  const fd = new FormData();
  fd.append("image", image);
  try {
    const r = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, { method: "POST", body: fd });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PAGE 1 — Pipeline principal
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const colsJson = JSON.stringify(COLS);
  res.send(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pipeline — L'indisciplinée</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#f5f5f3;padding:2rem 1rem}
.app{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 20px rgba(0,0,0,.07)}
h1{font-size:20px;font-weight:600;color:#1a1a1a;display:inline}
.brand{color:#F02B8C;font-style:italic;font-size:14px;margin-left:10px}
.nav{display:flex;gap:8px;margin-top:8px;margin-bottom:20px}
.nav a{font-size:12px;padding:4px 14px;border-radius:20px;border:1px solid #ddd;color:#666;text-decoration:none}
.nav a.active{background:#F02B8C;border-color:#F02B8C;color:#fff}
.tabs{display:flex;gap:6px;margin-bottom:20px}
.tab{font-size:12px;padding:5px 16px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#666}
.tab.active{background:#F02B8C;border-color:#F02B8C;color:#fff}
.fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;display:block;margin-bottom:5px}
input[type=text],select{width:100%;font-size:13px;padding:9px 11px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a1a;outline:none}
input[type=text]:focus,select:focus{border-color:#F02B8C}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.field{margin-bottom:14px}
.hint{font-size:11px;color:#aaa;margin-top:5px}
.dz{border:1.5px dashed #ddd;border-radius:10px;cursor:pointer;overflow:hidden;min-height:100px;display:flex;align-items:center;justify-content:center}
.dz.has{min-height:0;border-color:#F02B8C}
.dz img{width:100%;max-height:240px;object-fit:contain;display:block}
.tog{font-size:11px;padding:3px 12px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#888;float:right}
.steps{display:flex;align-items:center;gap:4px;padding:10px 12px;background:#f8f8f6;border-radius:8px;margin-bottom:14px}
.si{display:flex;align-items:center;gap:5px;flex:1;min-width:0}
.sd{width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;background:#e0e0e0;color:#999}
.sd.done{background:#F02B8C;color:#fff}
.sd.active{background:#fde8f4;color:#F02B8C;border:1.5px solid #F02B8C}
.sl{font-size:10px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sl.active{color:#F02B8C}
.sline{flex:1;height:1px;background:#e0e0e0}
.btn{width:100%;padding:13px;border-radius:8px;border:none;background:#F02B8C;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:14px}
.btn:disabled{background:#e0e0e0;color:#aaa;cursor:not-allowed}
.log{background:#f8f8f6;border-radius:8px;padding:10px 12px;margin-bottom:14px;border:1px solid #eee}
.ll{font-size:12px;color:#666;line-height:1.7;font-family:monospace}
.err{padding:10px 14px;background:#fef2f2;border-radius:8px;font-size:13px;color:#c0392b;margin-bottom:12px;border:1px solid #fdd}
.rl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;display:block}
.ri{width:100%;border-radius:8px;display:block;border:1px solid #eee;cursor:pointer}
.bdl{display:inline-block;margin-top:10px;font-size:13px;color:#fff;background:#F02B8C;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600}
.lo{display:block;margin-top:6px;font-size:12px;color:#F02B8C;text-decoration:none}
.divt{border-top:2px solid #F02B8C;padding-top:14px;margin-top:4px}
.ib{padding:10px 14px;background:#e8f4fd;border-radius:8px;font-size:12px;color:#2980b9;line-height:1.6}
.sb{padding:12px 14px;background:#f8f8f6;border-radius:8px;border:1px solid #eee;margin-bottom:12px}
</style></head><body>
<div class="app">
  <div><h1>Pipeline visuel</h1><span class="brand">L'indisciplinée</span></div>
  <div class="nav">
    <a href="/" class="active">Pipeline</a>
    <a href="/poses">Variations de poses</a>
  </div>
  <div class="tabs">
    <button class="tab active" onclick="showTab('p')">Production</button>
    <button class="tab" onclick="showTab('s')">Paramètres</button>
  </div>

  <div id="ts" style="display:none">
    <div class="sb"><label class="fl">Clé API The New Black</label><input type="text" id="s-tnb" placeholder="Ta clé TNB"></div>
    <div class="sb"><label class="fl">Clé API imgbb</label><input type="text" id="s-imgbb" placeholder="Gratuite sur imgbb.com"><p class="hint">imgbb.com → API → copie ta clé</p></div>
    <div class="sb"><label class="fl">URL mannequin par défaut</label><input type="text" id="s-model" placeholder="https://i.ibb.co/... lien direct de ta photo"><p class="hint">Ta photo hébergée sur imgbb — pré-remplie à chaque session</p></div>
    <div class="ib">2 crédits TNB par article : 1 try-on + 1 décor.</div>
  </div>

  <div id="tp">
    <div class="row">
      <div><label class="fl">Collection</label>
        <select id="col" onchange="document.getElementById('btnr').textContent='Lancer \u2192 '+this.value">
          <option>Floraison</option><option>Minéral</option><option>Audace</option><option>Crépuscule</option><option>Riviera</option>
        </select>
      </div>
      <div><label class="fl">Ratio</label>
        <select id="rat"><option>9:16</option><option>3:4</option><option>1:1</option><option>4:3</option><option>auto</option></select>
      </div>
    </div>
    <div class="field">
      <label class="fl">Mannequin (ta photo)</label>
      <input type="text" id="mu" placeholder="URL publique de ta photo hébergée sur imgbb">
    </div>
    <div class="field">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <label class="fl" style="margin:0">Vêtement sur cintre</label>
        <button class="tog" id="tog" onclick="toggleMode()">Coller une URL</button>
      </div>
      <div id="dz" class="dz" onclick="document.getElementById('fi').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()">
        <div style="text-align:center;padding:2rem">
          <div style="font-size:28px;color:#ccc;margin-bottom:8px">+</div>
          <p style="font-size:13px;color:#888">Photo cintre</p>
          <p style="font-size:11px;color:#bbb;margin-top:3px">JPG ou PNG</p>
        </div>
      </div>
      <input type="text" id="gu" placeholder="URL publique du vêtement" style="display:none">
      <input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFile(this.files[0])">
    </div>
    <div class="steps">
      <div class="si"><div class="sd" id="d0">1</div><span class="sl" id="l0">Upload</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d1">2</div><span class="sl" id="l1">Try-on</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d2">3</div><span class="sl" id="l2">Décor</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d3">4</div><span class="sl" id="l3">Résultat</span></div>
    </div>
    <button class="btn" id="btnr" onclick="run()">Lancer \u2192 Floraison</button>
    <div id="eb" class="err" style="display:none"></div>
    <div id="lb" class="log" style="display:none"></div>
    <div id="tr" style="display:none;margin-bottom:16px">
      <span class="rl">Try-on</span>
      <img id="ti" class="ri" onclick="window.open(this.src,'_blank')" alt="">
      <a id="tl" class="lo" target="_blank">Ouvrir (expire 48h)</a>
    </div>
    <div id="fr" class="divt" style="display:none">
      <span class="rl" id="fl2" style="color:#F02B8C">Image finale</span>
      <img id="fi2" class="ri" onclick="window.open(this.src,'_blank')" alt="">
      <a id="fl3" class="bdl" target="_blank">Télécharger</a>
    </div>
  </div>
</div>
<script>
const COLS=${colsJson};
let useUrl=false,gFile=null;
function init(){
  const tnb=localStorage.getItem('tnbKey')||'W9ILG0UKP2J35XAO1U6OPAR9VTLDC4';
  const imgbb=localStorage.getItem('imgbbKey')||'';
  const model=localStorage.getItem('modelUrl')||'';
  document.getElementById('s-tnb').value=tnb;
  document.getElementById('s-imgbb').value=imgbb;
  document.getElementById('s-model').value=model;
  document.getElementById('mu').value=model;
  document.getElementById('s-tnb').addEventListener('input',e=>localStorage.setItem('tnbKey',e.target.value));
  document.getElementById('s-imgbb').addEventListener('input',e=>localStorage.setItem('imgbbKey',e.target.value));
  document.getElementById('s-model').addEventListener('input',e=>{localStorage.setItem('modelUrl',e.target.value);document.getElementById('mu').value=e.target.value;});
}
function showTab(t){
  document.getElementById('tp').style.display=t==='p'?'block':'none';
  document.getElementById('ts').style.display=t==='s'?'block':'none';
  document.querySelectorAll('.tab').forEach((el,i)=>el.classList.toggle('active',(i===0&&t==='p')||(i===1&&t==='s')));
}
function toggleMode(){useUrl=!useUrl;document.getElementById('dz').style.display=useUrl?'none':'flex';document.getElementById('gu').style.display=useUrl?'block':'none';document.getElementById('tog').textContent=useUrl?'Uploader un fichier':'Coller une URL';}
function handleFile(f){if(!f)return;gFile=f;const dz=document.getElementById('dz');const img=document.createElement('img');img.src=URL.createObjectURL(f);img.style='width:100%;max-height:220px;object-fit:contain;display:block';dz.innerHTML='';dz.appendChild(img);dz.classList.add('has');}
function handleDrop(e){e.preventDefault();handleFile(e.dataTransfer.files[0]);}
function addLog(m){const b=document.getElementById('lb');b.style.display='block';b.innerHTML+='<div class="ll">'+m+'</div>';b.scrollTop=b.scrollHeight;}
function showErr(m){const b=document.getElementById('eb');b.textContent=m;b.style.display='block';}
function setStep(i){for(let j=0;j<4;j++){const d=document.getElementById('d'+j),l=document.getElementById('l'+j);d.className='sd'+(j<i?' done':j===i?' active':'');d.textContent=j<i?'v':j+1;l.className='sl'+(j===i?' active':'');}}
function toB64(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(f);});}
async function callProxy(ep,fields){const r=await fetch('/proxy?endpoint='+ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});const txt=await r.text();if(!r.ok)throw new Error('Erreur '+ep+' ('+r.status+'): '+txt.slice(0,300));const t=txt.replace(/\r?\n/g,'').trim();if(t.startsWith('http'))return t;try{const d=JSON.parse(t);return d.image||d.url||d.output||d.result||Object.values(d).find(v=>typeof v==='string'&&v.startsWith('http'));}catch{throw new Error('Réponse: '+t.slice(0,300));}}
async function uploadImgbb(b64,key){const r=await fetch('/imgbb?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64})});const d=await r.json();if(!d.success)throw new Error('imgbb: '+(d.error?.message||JSON.stringify(d)));return d.data.url;}
async function run(){
  document.getElementById('eb').style.display='none';
  document.getElementById('lb').style.display='none';
  document.getElementById('lb').innerHTML='';
  document.getElementById('tr').style.display='none';
  document.getElementById('fr').style.display='none';
  setStep(-1);
  const col=document.getElementById('col').value;
  const ratio=document.getElementById('rat').value;
  const modelUrl=document.getElementById('mu').value.trim();
  const tnbKey=document.getElementById('s-tnb').value.trim();
  const imgbbKey=document.getElementById('s-imgbb').value.trim();
  const garmentUrl=document.getElementById('gu').value.trim();
  if(!modelUrl)return showErr('URL mannequin manquante.');
  if(!useUrl&&!gFile)return showErr('Uploade la photo du vêtement.');
  if(useUrl&&!garmentUrl)return showErr('Colle l URL du vêtement.');
  if(!useUrl&&!imgbbKey)return showErr('Clé imgbb manquante — va dans Paramètres.');
  const c=COLS[col];
  const btn=document.getElementById('btnr');
  btn.disabled=true;btn.textContent='En cours…';
  try{
    let gUrl=garmentUrl;
    if(!useUrl){setStep(0);addLog('Upload vêtement…');const b64=await toB64(gFile);gUrl=await uploadImgbb(b64,imgbbKey);addLog('OK');}
    setStep(1);addLog('Try-on… (15-30s)');
    const tryonUrl=await callProxy('vto_stream',{api_key:tnbKey,model_photo:modelUrl,clothing_photo:gUrl,prompt:c.vto_prompt,ratio});
    if(!tryonUrl)throw new Error('URL vide try-on.');
    addLog('Try-on OK');
    document.getElementById('ti').src=tryonUrl;
    document.getElementById('tl').href=tryonUrl;
    document.getElementById('tr').style.display='block';
    setStep(2);addLog('Décor '+col+'…');
    const finalUrl=await callProxy('change-background',{api_key:tnbKey,image:tryonUrl,replace:c.bg_prompt+'. '+c.bg_harmony,negative:c.bg_negative});
    if(!finalUrl)throw new Error('URL vide décor.');
    addLog('Image finale OK');
    setStep(3);
    document.getElementById('fl2').textContent='Image finale — '+col;
    document.getElementById('fi2').src=finalUrl;
    document.getElementById('fl3').href=finalUrl;
    document.getElementById('fr').style.display='block';
  }catch(e){showErr(e.message);addLog('Erreur: '+e.message);}
  finally{btn.disabled=false;btn.textContent='Lancer \u2192 '+col;}
}
init();
</script>
</body></html>`);
});

// PAGE 2 — Variations de poses
app.get("/poses", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const posesJson = JSON.stringify(POSES);
  res.send(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Variations — L'indisciplinée</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#f5f5f3;padding:2rem 1rem}
.app{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 20px rgba(0,0,0,.07)}
h1{font-size:20px;font-weight:600;color:#1a1a1a;display:inline}
.brand{color:#F02B8C;font-style:italic;font-size:14px;margin-left:10px}
.nav{display:flex;gap:8px;margin-top:8px;margin-bottom:20px}
.nav a{font-size:12px;padding:4px 14px;border-radius:20px;border:1px solid #ddd;color:#666;text-decoration:none}
.nav a.active{background:#F02B8C;border-color:#F02B8C;color:#fff}
.fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;display:block;margin-bottom:5px}
.field{margin-bottom:14px}
.hint{font-size:11px;color:#aaa;margin-top:5px}
.dz{border:1.5px dashed #ddd;border-radius:10px;cursor:pointer;overflow:hidden;min-height:100px;display:flex;align-items:center;justify-content:center}
.dz.has{min-height:0;border-color:#F02B8C}
.dz img{width:100%;max-height:280px;object-fit:contain;display:block}
input[type=text]{width:100%;font-size:13px;padding:9px 11px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a1a;outline:none}
input[type=text]:focus{border-color:#F02B8C}
.poses-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.pose-card{border:1px solid #eee;border-radius:8px;padding:10px 12px;cursor:pointer;user-select:none;transition:all .15s}
.pose-card:hover{border-color:#F02B8C}
.pose-card.selected{border-color:#F02B8C;background:#fef0f7}
.pose-top{display:flex;align-items:center;gap:8px}
.pose-check{width:16px;height:16px;border-radius:4px;border:1.5px solid #ddd;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff}
.pose-card.selected .pose-check{background:#F02B8C;border-color:#F02B8C}
.pose-name{font-size:12px;font-weight:600;color:#1a1a1a}
.sel-all{font-size:11px;color:#F02B8C;cursor:pointer;text-decoration:underline;margin-bottom:8px;display:inline-block}
.btn{width:100%;padding:13px;border-radius:8px;border:none;background:#F02B8C;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:14px}
.btn:disabled{background:#e0e0e0;color:#aaa;cursor:not-allowed}
.log{background:#f8f8f6;border-radius:8px;padding:10px 12px;margin-bottom:14px;border:1px solid #eee;max-height:160px;overflow-y:auto}
.ll{font-size:12px;color:#666;line-height:1.7;font-family:monospace}
.err{padding:10px 14px;background:#fef2f2;border-radius:8px;font-size:13px;color:#c0392b;margin-bottom:12px;border:1px solid #fdd}
.rg{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.rc{border:1px solid #eee;border-radius:8px;overflow:hidden}
.rc img{width:100%;display:block;cursor:pointer}
.rf{padding:8px 10px;display:flex;justify-content:space-between;align-items:center}
.rn{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em}
.rdl{font-size:11px;color:#F02B8C;text-decoration:none;font-weight:600}
.divt{border-top:2px solid #F02B8C;padding-top:14px;margin-top:4px}
</style></head><body>
<div class="app">
  <div><h1>Variations de poses</h1><span class="brand">L'indisciplinée</span></div>
  <div class="nav">
    <a href="/">Pipeline</a>
    <a href="/poses" class="active">Variations de poses</a>
  </div>

  <div class="field">
    <label class="fl">Image source (résultat du pipeline)</label>
    <div id="dz" class="dz" onclick="document.getElementById('fi').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()">
      <div style="text-align:center;padding:2rem">
        <div style="font-size:28px;color:#ccc;margin-bottom:8px">+</div>
        <p style="font-size:13px;color:#888">Image finale du pipeline</p>
        <p style="font-size:11px;color:#bbb;margin-top:3px">JPG ou PNG</p>
      </div>
    </div>
    <input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFile(this.files[0])">
  </div>
  <div class="field"><label class="fl">Clé API The New Black</label><input type="text" id="tnb" placeholder="Ta clé TNB"></div>
  <div class="field"><label class="fl">Clé API imgbb</label><input type="text" id="imgbb" placeholder="Pour héberger l'image source"><p class="hint">imgbb.com → API</p></div>

  <div class="field">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <label class="fl" style="margin:0">Poses à générer</label>
      <span class="sel-all" onclick="selectAll()">Tout sélectionner</span>
    </div>
    <div class="poses-grid" id="pg"></div>
  </div>

  <button class="btn" id="btnr" onclick="run()">Générer les variations</button>
  <div id="eb" class="err" style="display:none"></div>
  <div id="lb" class="log" style="display:none"></div>
  <div id="results" class="divt" style="display:none">
    <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#F02B8C;display:block;margin-bottom:12px" id="rl">Résultats</span>
    <div class="rg" id="rg"></div>
  </div>
</div>
<script>
const POSES=${posesJson};
let gFile=null,imgUrl=null,selected=new Set();
function init(){
  const tnb=localStorage.getItem('tnbKey')||'W9ILG0UKP2J35XAO1U6OPAR9VTLDC4';
  const imgbb=localStorage.getItem('imgbbKey')||'';
  document.getElementById('tnb').value=tnb;
  document.getElementById('imgbb').value=imgbb;
  document.getElementById('tnb').addEventListener('input',e=>localStorage.setItem('tnbKey',e.target.value));
  document.getElementById('imgbb').addEventListener('input',e=>localStorage.setItem('imgbbKey',e.target.value));
  const grid=document.getElementById('pg');
  POSES.forEach(p=>{
    const card=document.createElement('div');
    card.className='pose-card';
    card.id='card-'+p.id;
    card.onclick=()=>toggle(p.id);
    const top=document.createElement('div');
    top.className='pose-top';
    const chk=document.createElement('div');
    chk.className='pose-check';
    chk.id='chk-'+p.id;
    const name=document.createElement('span');
    name.className='pose-name';
    name.textContent=p.label;
    top.appendChild(chk);top.appendChild(name);
    card.appendChild(top);
    grid.appendChild(card);
  });
}
function toggle(id){
  if(selected.has(id)){selected.delete(id);document.getElementById('card-'+id).classList.remove('selected');document.getElementById('chk-'+id).textContent='';}
  else{selected.add(id);document.getElementById('card-'+id).classList.add('selected');document.getElementById('chk-'+id).textContent='v';}
  updateBtn();
}
function selectAll(){
  const all=POSES.every(p=>selected.has(p.id));
  POSES.forEach(p=>{
    if(all){selected.delete(p.id);document.getElementById('card-'+p.id).classList.remove('selected');document.getElementById('chk-'+p.id).textContent='';}
    else{selected.add(p.id);document.getElementById('card-'+p.id).classList.add('selected');document.getElementById('chk-'+p.id).textContent='v';}
  });
  updateBtn();
}
function updateBtn(){const n=selected.size;document.getElementById('btnr').textContent=n>0?'Générer '+n+' variation'+(n>1?'s':''):'Sélectionne au moins une pose';}
function handleFile(f){if(!f)return;gFile=f;imgUrl=null;const dz=document.getElementById('dz');const img=document.createElement('img');img.src=URL.createObjectURL(f);img.style='width:100%;max-height:260px;object-fit:contain;display:block';dz.innerHTML='';dz.appendChild(img);dz.classList.add('has');}
function handleDrop(e){e.preventDefault();handleFile(e.dataTransfer.files[0]);}
function addLog(m){const b=document.getElementById('lb');b.style.display='block';b.innerHTML+='<div class="ll">'+m+'</div>';b.scrollTop=b.scrollHeight;}
function showErr(m){document.getElementById('eb').textContent=m;document.getElementById('eb').style.display='block';}
function toB64(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(',')[1]);r.onerror=rej;r.readAsDataURL(f);});}
async function uploadImgbb(b64,key){const r=await fetch('/imgbb?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64})});const d=await r.json();if(!d.success)throw new Error('imgbb: '+(d.error?.message||JSON.stringify(d)));return d.data.url;}
async function callEdit(imageUrl,prompt,key){const r=await fetch('/proxy?endpoint=edit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:key,image:imageUrl,prompt})});const txt=await r.text();if(!r.ok)throw new Error('edit ('+r.status+'): '+txt.slice(0,200));const t=txt.replace(/\r?\n/g,'').trim();if(t.startsWith('http'))return t;try{const d=JSON.parse(t);return d.image||d.url||d.output||d.result||Object.values(d).find(v=>typeof v==='string'&&v.startsWith('http'));}catch{throw new Error('Réponse: '+t.slice(0,200));}}
async function run(){
  document.getElementById('eb').style.display='none';
  document.getElementById('lb').style.display='none';
  document.getElementById('lb').innerHTML='';
  document.getElementById('results').style.display='none';
  document.getElementById('rg').innerHTML='';
  const tnbKey=document.getElementById('tnb').value.trim();
  const imgbbKey=document.getElementById('imgbb').value.trim();
  if(!gFile&&!imgUrl)return showErr('Uploade une image source.');
  if(selected.size===0)return showErr('Sélectionne au moins une pose.');
  if(!tnbKey)return showErr('Clé TNB manquante.');
  if(gFile&&!imgUrl&&!imgbbKey)return showErr('Clé imgbb manquante.');
  const btn=document.getElementById('btnr');
  btn.disabled=true;btn.textContent='Génération en cours…';
  try{
    if(gFile&&!imgUrl){addLog('Upload image source…');const b64=await toB64(gFile);imgUrl=await uploadImgbb(b64,imgbbKey);addLog('OK');}
    const list=Array.from(selected);
    for(let i=0;i<list.length;i++){
      const pose=POSES.find(p=>p.id===list[i]);
      addLog('['+(i+1)+'/'+list.length+'] '+pose.label+'…');
      const url=await callEdit(imgUrl,pose.prompt,tnbKey);
      if(!url)throw new Error('URL vide — '+pose.label);
      addLog(pose.label+' OK');
      const card=document.createElement('div');card.className='rc';
      const img=document.createElement('img');img.src=url;img.onclick=()=>window.open(url,'_blank');
      const footer=document.createElement('div');footer.className='rf';
      const name=document.createElement('span');name.className='rn';name.textContent=pose.label;
      const dl=document.createElement('a');dl.href=url;dl.target='_blank';dl.className='rdl';dl.textContent='Télécharger';
      footer.appendChild(name);footer.appendChild(dl);
      card.appendChild(img);card.appendChild(footer);
      document.getElementById('rg').appendChild(card);
      document.getElementById('results').style.display='block';
    }
    document.getElementById('rl').textContent=list.length+' variation'+(list.length>1?'s':'')+' générée'+(list.length>1?'s':'');
    addLog('Terminé');
  }catch(e){showErr(e.message);addLog('Erreur: '+e.message);}
  finally{btn.disabled=false;updateBtn();}
}
init();
</script>
</body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy démarré sur port", PORT));
