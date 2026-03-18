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
    bg_prompt: "French Luberon stone farmhouse exterior wall, rough limestone texture, golden hour late afternoon sun, dry lavender at edge, authentic aged stone surface, real imperfections, Provence countryside",
    bg_negative: "people, text, logo, fake, CGI, oversaturated, too clean, studio",
    bg_harmony: "match warm golden hour light of subject, sun from right side, natural warm skin tones, seamless shadow integration, same exposure level",
    vto_prompt: "elegant plus-size woman wearing the outfit, fashion editorial"
  },
  "Audace": {
    bg_prompt: "Haussmann building facade Paris 11e, worn grey zinc balcony railing close, authentic peeling paint details, late afternoon diffused light, real Parisian street texture, slightly overcast sky, genuine urban",
    bg_negative: "people, text, logo, fake, CGI, too perfect, studio, tourist postcard",
    bg_harmony: "match cool Parisian diffused light of subject, consistent grey-warm neutral tones, soft shadows no harsh contrast, realistic urban integration",
    vto_prompt: "confident plus-size woman wearing the outfit, fashion editorial"
  },
  "Crépuscule": {
    bg_prompt: "Loire valley chateau stone garden at dusk, real weathered balustrade, authentic warm purple orange sky last light, French heritage architecture, imperfect aged stone, moody atmospheric, real photography",
    bg_negative: "people, text, logo, fake, CGI, too bright, studio, neon, oversaturated",
    bg_harmony: "match warm dusk purple-orange ambient tones of subject, soft low backlight, consistent moody exposure, seamless atmospheric integration",
    vto_prompt: "elegant plus-size woman wearing the outfit, fashion editorial"
  },
  "Riviera": {
    bg_prompt: "Marseille Vallon des Auffes authentic fishing port, real weathered painted boats, worn ochre peeling facades, genuine Mediterranean midday light, south of France, imperfect real photography, no tourists",
    bg_negative: "people, text, logo, fake, CGI, too perfect, studio, generic beach, tourist postcard",
    bg_harmony: "match bright Mediterranean high-key light of subject, warm white natural light, consistent sharp shadows, same overexposed feel, realistic integration",
    vto_prompt: "radiant plus-size woman wearing the outfit, fashion editorial"
  }
};

const POSES = [
  { id: "p1",  label: "Portrait buste",         desc: "Légère inclinaison avant, bras naturels, cadrage mi-corps" },
  { id: "p2",  label: "Marche plein corps",      desc: "Avancée vers la caméra, mouvement naturel, plein corps" },
  { id: "p3",  label: "3/4 face déhanchée",      desc: "Poids sur une hanche, légère rotation, bras relâchés" },
  { id: "p4",  label: "Frontale catalog",        desc: "Droite, pieds joints, bras le long du corps, classique" },
  { id: "p5",  label: "Frontale col mis en avant", desc: "Jambes légèrement écartées, col et haut valorisés" },
  { id: "p6",  label: "Frontale un pied devant", desc: "Légère marche, un pied en avant, naturelle et vivante" },
  { id: "p7",  label: "Pop de hanche",           desc: "Hanche marquée sur le côté, regard direct caméra" },
  { id: "p8",  label: "Jambes croisées",         desc: "Une jambe croisée devant l'autre, décontractée" },
  { id: "p9",  label: "Portrait rapproché",      desc: "Épaules basses, cadrage buste, regard proche" },
  { id: "p10", label: "3/4 côté micro-geste",    desc: "Vue 3/4 de côté, tient légèrement le tissu de la robe d'une main" }
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

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const colsJson = JSON.stringify(COLS);
  const posesJson = JSON.stringify(POSES);
  res.send(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pipeline — L'indisciplinée</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#f5f5f3;padding:2rem 1rem}
.app{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 20px rgba(0,0,0,.07)}
h1{font-size:20px;font-weight:600;color:#1a1a1a;display:inline}
.brand{color:#F02B8C;font-style:italic;font-size:14px;margin-left:10px}
.tabs{display:flex;gap:6px;margin:16px 0 20px}
.tab{font-size:12px;padding:5px 16px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#666}
.tab.active{background:#F02B8C;border-color:#F02B8C;color:#fff}
.fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;display:block;margin-bottom:5px}
input[type=text],select{width:100%;font-size:13px;padding:9px 11px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a1a;outline:none}
input[type=text]:focus,select:focus{border-color:#F02B8C}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.field{margin-bottom:14px}
.hint{font-size:11px;color:#aaa;margin-top:5px}
.dz{border:1.5px dashed #ddd;border-radius:10px;cursor:pointer;overflow:hidden;min-height:90px;display:flex;align-items:center;justify-content:center}
.dz.has{min-height:0;border-color:#F02B8C}
.dz img{width:100%;max-height:220px;object-fit:contain;display:block}
.tog{font-size:11px;padding:3px 12px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#888;float:right}
.poses-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
.pose-card{border:1px solid #eee;border-radius:8px;padding:10px 12px;cursor:pointer;transition:all .15s;user-select:none}
.pose-card:hover{border-color:#F02B8C}
.pose-card.selected{border-color:#F02B8C;background:#fef0f7}
.pose-card-top{display:flex;align-items:center;gap:8px}
.pose-check{width:16px;height:16px;border-radius:4px;border:1.5px solid #ddd;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;transition:all .15s}
.pose-card.selected .pose-check{background:#F02B8C;border-color:#F02B8C;color:#fff}
.pose-name{font-size:12px;font-weight:600;color:#1a1a1a}
.pose-desc{font-size:11px;color:#aaa;margin-top:4px;line-height:1.4}
.pose-card.no-url{opacity:.5}
.pose-card.no-url .pose-name::after{content:" — URL manquante";color:#F02B8C;font-weight:400}
.select-all{font-size:11px;color:#F02B8C;cursor:pointer;text-decoration:underline;margin-bottom:8px;display:inline-block}
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
.log{background:#f8f8f6;border-radius:8px;padding:10px 12px;margin-bottom:14px;border:1px solid #eee;max-height:200px;overflow-y:auto}
.ll{font-size:12px;color:#666;line-height:1.7;font-family:monospace}
.err{padding:10px 14px;background:#fef2f2;border-radius:8px;font-size:13px;color:#c0392b;margin-bottom:12px;border:1px solid #fdd}
.results-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px}
.result-card{border:1px solid #eee;border-radius:8px;overflow:hidden}
.result-card img{width:100%;display:block}
.result-card-footer{padding:8px 10px;display:flex;justify-content:space-between;align-items:center}
.result-pose-name{font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em}
.result-dl{font-size:11px;color:#F02B8C;text-decoration:none;font-weight:600}
.divt{border-top:2px solid #F02B8C;padding-top:14px;margin-top:4px}
.ib{padding:10px 14px;background:#e8f4fd;border-radius:8px;font-size:12px;color:#2980b9;line-height:1.6}
.sb{padding:12px 14px;background:#f8f8f6;border-radius:8px;border:1px solid #eee;margin-bottom:12px}
.pose-url-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.pose-url-label{font-size:12px;font-weight:600;color:#555;min-width:160px;flex-shrink:0}
.pose-url-input{flex:1;font-size:12px;padding:6px 9px;border-radius:6px;border:1px solid #ddd}
</style></head><body>
<div class="app">
  <div><h1>Pipeline visuel</h1><span class="brand">L'indisciplinée</span></div>
  <div class="tabs">
    <button class="tab active" onclick="showTab('p')">Pipeline</button>
    <button class="tab" onclick="showTab('s')">Paramètres</button>
  </div>

  <div id="ts" style="display:none">
    <div class="sb">
      <label class="fl">Clé API The New Black</label>
      <input type="text" id="s-tnb" value="W9ILG0UKP2J35XAO1U6OPAR9VTLDC4">
    </div>
    <div class="sb">
      <label class="fl">Clé API imgbb</label>
      <input type="text" id="s-imgbb" placeholder="Gratuite sur imgbb.com">
      <p class="hint">imgbb.com → API → copie ta clé</p>
    </div>
    <div class="sb">
      <label class="fl" style="margin-bottom:10px">URLs des 10 poses de référence</label>
      <p class="hint" style="margin-bottom:12px">Uploade chaque photo de pose sur imgbb.com et colle le lien direct ici. À faire une seule fois.</p>
      <div id="pose-url-fields"></div>
    </div>
    <div class="ib">2 crédits TNB par pose générée : 1 try-on + 1 décor.</div>
  </div>

  <div id="tp">
    <div class="row">
      <div>
        <label class="fl">Collection</label>
        <select id="col" onchange="updateBtn()">
          <option>Floraison</option><option>Minéral</option><option>Audace</option><option>Crépuscule</option><option>Riviera</option>
        </select>
      </div>
      <div>
        <label class="fl">Ratio</label>
        <select id="rat"><option>9:16</option><option>3:4</option><option>1:1</option><option>4:3</option><option>auto</option></select>
      </div>
    </div>

    <div class="field">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <label class="fl" style="margin:0">Vêtement sur cintre</label>
        <button class="tog" id="tog" onclick="toggleMode()">Coller une URL →</button>
      </div>
      <div id="dz" class="dz" onclick="document.getElementById('fi').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()">
        <div style="text-align:center;padding:1.5rem">
          <div style="font-size:26px;color:#ccc;margin-bottom:6px">⊕</div>
          <p style="font-size:13px;color:#888">Photo cintre</p>
          <p style="font-size:11px;color:#bbb;margin-top:3px">JPG · PNG · dépose ou clique</p>
        </div>
      </div>
      <input type="text" id="gu" placeholder="URL publique du vêtement sur cintre" style="display:none">
      <input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFile(this.files[0])">
    </div>

    <div class="field">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <label class="fl" style="margin:0">Poses à générer</label>
        <span class="select-all" onclick="selectAllPoses()">Tout sélectionner</span>
      </div>
      <div class="poses-grid" id="poses-grid"></div>
    </div>

    <div class="steps">
      <div class="si"><div class="sd" id="d0">1</div><span class="sl" id="l0">Upload</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d1">2</div><span class="sl" id="l1">Try-on</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d2">3</div><span class="sl" id="l2">Décor</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d3">4</div><span class="sl" id="l3">Résultats</span></div>
    </div>

    <button class="btn" id="btnr" onclick="run()">Lancer → Floraison</button>
    <div id="eb" class="err" style="display:none"></div>
    <div id="lb" class="log" style="display:none"></div>
    <div id="results" class="divt" style="display:none">
      <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#F02B8C;display:block;margin-bottom:12px" id="results-label">Résultats</span>
      <div class="results-grid" id="results-grid"></div>
    </div>
  </div>
</div>

<script>
const COLS = ${colsJson};
const POSES = ${posesJson};
let useUrl = false;
let gFile = null;
let poseUrls = {};
let selectedPoses = new Set();

function init() {
  // Pose URL fields in settings
  const container = document.getElementById('pose-url-fields');
  POSES.forEach(p => {
    const row = document.createElement('div');
    row.className = 'pose-url-row';
    row.innerHTML = '<span class="pose-url-label">' + p.label + '</span><input class="pose-url-input" type="text" id="url-' + p.id + '" placeholder="https://i.ibb.co/..." oninput="savePoseUrl(\'' + p.id + '\', this.value)">';
    container.appendChild(row);
  });

  // Pose cards in pipeline
  const grid = document.getElementById('poses-grid');
  POSES.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pose-card no-url';
    card.id = 'card-' + p.id;
    card.onclick = () => togglePose(p.id);
    card.innerHTML = '<div class="pose-card-top"><div class="pose-check" id="check-' + p.id + '"></div><span class="pose-name">' + p.label + '</span></div><div class="pose-desc">' + p.desc + '</div>';
    grid.appendChild(card);
  });

  // Load saved urls from localStorage
  POSES.forEach(p => {
    const saved = localStorage.getItem('poseUrl_' + p.id);
    if (saved) {
      poseUrls[p.id] = saved;
      const input = document.getElementById('url-' + p.id);
      if (input) input.value = saved;
      document.getElementById('card-' + p.id).classList.remove('no-url');
    }
  });

  // Save TNB key and imgbb key
  const tnb = localStorage.getItem('tnbKey');
  const imgbb = localStorage.getItem('imgbbKey');
  if (tnb) document.getElementById('s-tnb').value = tnb;
  if (imgbb) document.getElementById('s-imgbb').value = imgbb;

  document.getElementById('s-tnb').addEventListener('input', e => localStorage.setItem('tnbKey', e.target.value));
  document.getElementById('s-imgbb').addEventListener('input', e => localStorage.setItem('imgbbKey', e.target.value));
}

function savePoseUrl(id, val) {
  if (val.trim()) {
    poseUrls[id] = val.trim();
    localStorage.setItem('poseUrl_' + id, val.trim());
    document.getElementById('card-' + id).classList.remove('no-url');
  } else {
    delete poseUrls[id];
    localStorage.removeItem('poseUrl_' + id);
    document.getElementById('card-' + id).classList.add('no-url');
  }
}

function togglePose(id) {
  if (!poseUrls[id]) return;
  if (selectedPoses.has(id)) {
    selectedPoses.delete(id);
    document.getElementById('card-' + id).classList.remove('selected');
    document.getElementById('check-' + id).textContent = '';
  } else {
    selectedPoses.add(id);
    document.getElementById('card-' + id).classList.add('selected');
    document.getElementById('check-' + id).textContent = '✓';
  }
  updateBtn();
}

function selectAllPoses() {
  const hasAll = POSES.filter(p => poseUrls[p.id]).every(p => selectedPoses.has(p.id));
  POSES.forEach(p => {
    if (!poseUrls[p.id]) return;
    if (hasAll) {
      selectedPoses.delete(p.id);
      document.getElementById('card-' + p.id).classList.remove('selected');
      document.getElementById('check-' + p.id).textContent = '';
    } else {
      selectedPoses.add(p.id);
      document.getElementById('card-' + p.id).classList.add('selected');
      document.getElementById('check-' + p.id).textContent = '✓';
    }
  });
  updateBtn();
}

function updateBtn() {
  const col = document.getElementById('col').value;
  const n = selectedPoses.size;
  document.getElementById('btnr').textContent = n > 0 ? 'Lancer ' + n + ' pose' + (n > 1 ? 's' : '') + ' → ' + col : 'Sélectionne au moins une pose';
}

function showTab(t) {
  document.getElementById('tp').style.display = t === 'p' ? 'block' : 'none';
  document.getElementById('ts').style.display = t === 's' ? 'block' : 'none';
  document.querySelectorAll('.tab').forEach((el, i) => el.classList.toggle('active', (i === 0 && t === 'p') || (i === 1 && t === 's')));
}

function toggleMode() {
  useUrl = !useUrl;
  document.getElementById('dz').style.display = useUrl ? 'none' : 'flex';
  document.getElementById('gu').style.display = useUrl ? 'block' : 'none';
  document.getElementById('tog').textContent = useUrl ? '← Uploader' : 'Coller une URL →';
}

function handleFile(f) {
  if (!f) return;
  gFile = f;
  const dz = document.getElementById('dz');
  dz.innerHTML = '<img src="' + URL.createObjectURL(f) + '" style="width:100%;max-height:200px;object-fit:contain;display:block">';
  dz.classList.add('has');
}

function handleDrop(e) { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }

function addLog(m) {
  const b = document.getElementById('lb');
  b.style.display = 'block';
  b.innerHTML += '<div class="ll">' + m + '</div>';
  b.scrollTop = b.scrollHeight;
}

function showErr(m) { const b = document.getElementById('eb'); b.textContent = m; b.style.display = 'block'; }

function setStep(i) {
  for (let j = 0; j < 4; j++) {
    const d = document.getElementById('d' + j), l = document.getElementById('l' + j);
    d.className = 'sd' + (j < i ? ' done' : j === i ? ' active' : '');
    d.textContent = j < i ? '✓' : j + 1;
    l.className = 'sl' + (j === i ? ' active' : '');
  }
}

function toB64(f) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

async function callProxy(ep, fields) {
  const r = await fetch('/proxy?endpoint=' + ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
  const txt = await r.text();
  if (!r.ok) throw new Error('Erreur ' + ep + ' (' + r.status + '): ' + txt.slice(0, 200));
  const t = txt.trim();
  if (t.startsWith('http')) return t;
  try {
    const d = JSON.parse(t);
    return d.image || d.url || d.output || d.result || Object.values(d).find(v => typeof v === 'string' && v.startsWith('http'));
  } catch { throw new Error('Réponse inattendue: ' + t.slice(0, 200)); }
}

async function uploadImgbb(b64, key) {
  const r = await fetch('/imgbb?key=' + key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: b64 }) });
  const d = await r.json();
  if (!d.success) throw new Error('imgbb: ' + (d.error?.message || JSON.stringify(d)));
  return d.data.url;
}

async function run() {
  document.getElementById('eb').style.display = 'none';
  document.getElementById('lb').style.display = 'none';
  document.getElementById('lb').innerHTML = '';
  document.getElementById('results').style.display = 'none';
  document.getElementById('results-grid').innerHTML = '';
  setStep(-1);

  const col = document.getElementById('col').value;
  const ratio = document.getElementById('rat').value;
  const tnbKey = document.getElementById('s-tnb').value.trim();
  const imgbbKey = document.getElementById('s-imgbb').value.trim();
  const garmentUrl = document.getElementById('gu').value.trim();

  if (selectedPoses.size === 0) return showErr('Sélectionne au moins une pose.');
  if (!useUrl && !gFile) return showErr('Uploade la photo du vêtement.');
  if (useUrl && !garmentUrl) return showErr('Colle l URL du vêtement.');
  if (!useUrl && !imgbbKey) return showErr('Clé imgbb manquante — va dans Paramètres.');

  const c = COLS[col];
  const btn = document.getElementById('btnr');
  btn.disabled = true;
  btn.textContent = 'Pipeline en cours…';

  try {
    let gUrl = garmentUrl;
    if (!useUrl) {
      setStep(0);
      addLog('📤 Upload du vêtement sur imgbb…');
      const b64 = await toB64(gFile);
      gUrl = await uploadImgbb(b64, imgbbKey);
      addLog('✅ Vêtement hébergé');
    }

    const posesToRun = Array.from(selectedPoses);
    const totalPoses = posesToRun.length;
    const resultsGrid = document.getElementById('results-grid');

    for (let i = 0; i < posesToRun.length; i++) {
      const poseId = posesToRun[i];
      const pose = POSES.find(p => p.id === poseId);
      const poseUrl = poseUrls[poseId];

      setStep(1);
      addLog('👗 [' + (i+1) + '/' + totalPoses + '] Try-on — ' + pose.label + '…');
      const tryonUrl = await callProxy('vto_stream', { api_key: tnbKey, model_photo: poseUrl, clothing_photo: gUrl, prompt: c.vto_prompt, ratio });
      if (!tryonUrl) throw new Error('URL vide du try-on pour ' + pose.label);
      addLog('✅ Try-on ' + pose.label + ' terminé');

      setStep(2);
      addLog('🌿 [' + (i+1) + '/' + totalPoses + '] Décor ' + col + ' — ' + pose.label + '…');
      const finalUrl = await callProxy('change-background', { api_key: tnbKey, image: tryonUrl, replace: c.bg_prompt + '. ' + c.bg_harmony, negative: c.bg_negative });
      if (!finalUrl) throw new Error('URL vide du décor pour ' + pose.label);
      addLog('✅ ' + pose.label + ' prête');

      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = '<img src="' + finalUrl + '" alt="' + pose.label + '"><div class="result-card-footer"><span class="result-pose-name">' + pose.label + '</span><a href="' + finalUrl + '" target="_blank" class="result-dl">Télécharger →</a></div>';
      resultsGrid.appendChild(card);
      document.getElementById('results').style.display = 'block';
    }

    setStep(3);
    document.getElementById('results-label').textContent = totalPoses + ' image' + (totalPoses > 1 ? 's' : '') + ' générée' + (totalPoses > 1 ? 's' : '') + ' — ' + col;
    addLog('🎉 Pipeline terminé — ' + totalPoses + ' pose' + (totalPoses > 1 ? 's' : ''));

  } catch (e) {
    showErr(e.message);
    addLog('❌ ' + e.message);
  } finally {
    btn.disabled = false;
    updateBtn();
  }
}

init();
</script>
</body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy démarré sur port", PORT));
