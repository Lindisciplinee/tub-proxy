const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const COLS = {
  "Floraison": { bg_prompt: "romantic garden in full bloom, wisteria archway, soft diffused daylight, blurred flowers, pastel tones", bg_negative: "people, text, logo, urban, dark", vto_prompt: "elegant plus-size woman wearing the outfit, soft feminine pose, fashion editorial" },
  "Mineral": { bg_prompt: "outdoor stone terrace, warm Mediterranean light, limestone walls, golden hour", bg_negative: "people, text, logo, cold, dark", vto_prompt: "elegant plus-size woman wearing the outfit, natural confident pose, fashion editorial" },
  "Audace": { bg_prompt: "Parisian rooftop at golden hour, city skyline blur, graphic shadows", bg_negative: "people, text, logo, nature, cold", vto_prompt: "confident plus-size woman wearing the outfit, strong editorial pose, fashion photography" },
  "Crepuscule": { bg_prompt: "dusk sky, warm purple orange horizon, rooftop terrace, moody atmospheric light", bg_negative: "people, text, logo, bright daylight", vto_prompt: "elegant plus-size woman wearing the outfit, moody editorial pose, fashion photography" },
  "Riviera": { bg_prompt: "Mediterranean coast, turquoise sea, white architecture, bright midday light", bg_negative: "people, text, logo, urban, dark", vto_prompt: "radiant plus-size woman wearing the outfit, relaxed summery pose, fashion editorial" }
};

app.post("/proxy", async (req, res) => {
  const { endpoint } = req.query;
  const { api_key, ...fields } = req.body;
  if (!endpoint) return res.status(400).json({ error: "endpoint manquant" });
  if (!api_key) return res.status(400).json({ error: "api_key manquant" });
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) if (v != null && v !== "") fd.append(k, String(v));
  try {
    const r = await fetch("https://thenewblack.ai/api/1.1/wf/" + endpoint + "?api_key=" + api_key, { method: "POST", body: fd });
    res.status(r.status).send(await r.text());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/imgbb", async (req, res) => {
  const { key } = req.query;
  const { image } = req.body;
  if (!key || !image) return res.status(400).json({ error: "key ou image manquant" });
  const fd = new FormData();
  fd.append("image", image);
  try {
    const r = await fetch("https://api.imgbb.com/1/upload?key=" + key, { method: "POST", body: fd });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(getHTML());
});

function getHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pipeline — L indisciplinee</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;background:#f5f5f3;padding:2rem 1rem}
.app{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 20px rgba(0,0,0,.07)}
h1{font-size:20px;font-weight:600;color:#1a1a1a;display:inline}
.brand{color:#F02B8C;font-style:italic;font-size:14px;margin-left:10px}
.tabs{display:flex;gap:6px;margin:16px 0 20px}
.tab{font-size:12px;padding:5px 16px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#666}
.tab.active{background:#F02B8C;border-color:#F02B8C;color:#fff}
.fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;display:block;margin-bottom:5px}
input[type=text],select{width:100%;font-size:13px;padding:9px 11px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a1a;outline:none}
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
.ri{width:100%;border-radius:8px;display:block;border:1px solid #eee}
.bdl{display:inline-block;margin-top:10px;font-size:13px;color:#fff;background:#F02B8C;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600}
.lo{display:block;margin-top:6px;font-size:12px;color:#F02B8C;text-decoration:none}
.divt{border-top:2px solid #F02B8C;padding-top:14px;margin-top:4px}
.ib{padding:10px 14px;background:#e8f4fd;border-radius:8px;font-size:12px;color:#2980b9;line-height:1.6}
.sb{padding:12px 14px;background:#f8f8f6;border-radius:8px;border:1px solid #eee;margin-bottom:12px}
</style>
</head>
<body>
<div class="app">
  <div><h1>Pipeline visuel</h1><span class="brand">L indisciplinee</span></div>
  <div class="tabs">
    <button class="tab active" onclick="showTab('p')">Pipeline</button>
    <button class="tab" onclick="showTab('s')">Parametres</button>
  </div>
  <div id="ts" style="display:none">
    <div class="sb"><label class="fl">Cle API The New Black</label><input type="text" id="s-tnb" value="W9ILG0UKP2J35XAO1U6OPAR9VTLDC4"></div>
    <div class="sb"><label class="fl">Cle API imgbb</label><input type="text" id="s-imgbb" placeholder="Gratuite sur imgbb.com"><p class="hint">imgbb.com -> API -> copie ta cle</p></div>
    <div class="sb"><label class="fl">URL photo modele</label><input type="text" id="s-model" placeholder="https://... lien direct imgbb de ta pose"></div>
    <div class="ib">2 credits TNB par article : 1 try-on + 1 decor.</div>
  </div>
  <div id="tp">
    <div class="row">
      <div><label class="fl">Collection</label>
        <select id="col" onchange="document.getElementById('btnr').textContent='Lancer -> '+this.value">
          <option>Floraison</option><option>Mineral</option><option>Audace</option><option>Crepuscule</option><option>Riviera</option>
        </select>
      </div>
      <div><label class="fl">Ratio</label>
        <select id="rat"><option>9:16</option><option>3:4</option><option>1:1</option><option>4:3</option><option>auto</option></select>
      </div>
    </div>
    <div class="field"><label class="fl">Photo modele (ta pose)</label><input type="text" id="mu" placeholder="URL publique de ta photo hebergee"></div>
    <div class="field">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <label class="fl" style="margin:0">Vetement sur cintre</label>
        <button class="tog" id="tog" onclick="toggleMode()">Coller une URL</button>
      </div>
      <div id="dz" class="dz" onclick="document.getElementById('fi').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()">
        <div style="text-align:center;padding:2rem"><div style="font-size:28px;color:#ccc;margin-bottom:8px">+</div><p style="font-size:13px;color:#888">Photo cintre</p><p style="font-size:11px;color:#bbb;margin-top:3px">JPG PNG - depose ou clique</p></div>
      </div>
      <input type="text" id="gu" placeholder="URL du vetement" style="display:none">
      <input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFile(this.files[0])">
    </div>
    <div class="steps">
      <div class="si"><div class="sd" id="d0">1</div><span class="sl" id="l0">Upload</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d1">2</div><span class="sl" id="l1">Try-on</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d2">3</div><span class="sl" id="l2">Decor</span><div class="sline"></div></div>
      <div class="si"><div class="sd" id="d3">4</div><span class="sl" id="l3">Resultat</span></div>
    </div>
    <button class="btn" id="btnr" onclick="run()">Lancer -> Floraison</button>
    <div id="eb" class="err" style="display:none"></div>
    <div id="lb" class="log" style="display:none"></div>
    <div id="tr" style="display:none;margin-bottom:16px"><span class="rl">Try-on</span><img id="ti" class="ri"><a id="tl" class="lo" target="_blank">Ouvrir (expire 48h)</a></div>
    <div id="fr" class="divt" style="display:none"><span class="rl" id="fl2" style="color:#F02B8C">Image finale</span><img id="fi2" class="ri"><a id="fl3" class="bdl" target="_blank">Telecharger</a></div>
  </div>
</div>
<script>
var useUrl=false,gFile=null;
var COLS={"Floraison":{"bg_prompt":"romantic garden in full bloom, wisteria archway, soft diffused daylight, blurred flowers, pastel tones","bg_negative":"people, text, logo, urban, dark","vto_prompt":"elegant plus-size woman wearing the outfit, soft feminine pose, fashion editorial"},"Mineral":{"bg_prompt":"outdoor stone terrace, warm Mediterranean light, limestone walls, golden hour","bg_negative":"people, text, logo, cold, dark","vto_prompt":"elegant plus-size woman wearing the outfit, natural confident pose, fashion editorial"},"Audace":{"bg_prompt":"Parisian rooftop at golden hour, city skyline blur, graphic shadows","bg_negative":"people, text, logo, nature, cold","vto_prompt":"confident plus-size woman wearing the outfit, strong editorial pose, fashion photography"},"Crepuscule":{"bg_prompt":"dusk sky, warm purple orange horizon, rooftop terrace, moody atmospheric light","bg_negative":"people, text, logo, bright daylight","vto_prompt":"elegant plus-size woman wearing the outfit, moody editorial pose, fashion photography"},"Riviera":{"bg_prompt":"Mediterranean coast, turquoise sea, white architecture, bright midday light","bg_negative":"people, text, logo, urban, dark","vto_prompt":"radiant plus-size woman wearing the outfit, relaxed summery pose, fashion editorial"}};

function showTab(t){
  document.getElementById('tp').style.display=t==='p'?'block':'none';
  document.getElementById('ts').style.display=t==='s'?'block':'none';
  document.querySelectorAll('.tab').forEach(function(el,i){el.classList.toggle('active',(i===0&&t==='p')||(i===1&&t==='s'));});
}
function toggleMode(){
  useUrl=!useUrl;
  document.getElementById('dz').style.display=useUrl?'none':'flex';
  document.getElementById('gu').style.display=useUrl?'block':'none';
  document.getElementById('tog').textContent=useUrl?'Uploader un fichier':'Coller une URL';
}
function handleFile(f){
  if(!f)return;
  gFile=f;
  var dz=document.getElementById('dz');
  dz.innerHTML='<img src="'+URL.createObjectURL(f)+'" style="width:100%;max-height:240px;object-fit:contain;display:block">';
  dz.classList.add('has');
}
function handleDrop(e){e.preventDefault();handleFile(e.dataTransfer.files[0]);}
function addLog(m){var b=document.getElementById('lb');b.style.display='block';b.innerHTML+='<div class="ll">'+m+'</div>';}
function showErr(m){var b=document.getElementById('eb');b.textContent=m;b.style.display='block';}
function setStep(i){
  for(var j=0;j<4;j++){
    var d=document.getElementById('d'+j),l=document.getElementById('l'+j);
    d.className='sd'+(j<i?' done':j===i?' active':'');
    d.textContent=j<i?'v':j+1;
    l.className='sl'+(j===i?' active':'');
  }
}
function toB64(f){
  return new Promise(function(res,rej){
    var r=new FileReader();
    r.onload=function(){res(r.result.split(',')[1]);};
    r.onerror=rej;
    r.readAsDataURL(f);
  });
}
async function callProxy(ep,fields){
  var r=await fetch('/proxy?endpoint='+ep,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
  var txt=await r.text();
  if(!r.ok)throw new Error('Erreur '+ep+' ('+r.status+'): '+txt.slice(0,200));
  var t=txt.trim();
  if(t.startsWith('http'))return t;
  try{
    var d=JSON.parse(t);
    return d.image||d.url||d.output||d.result||Object.values(d).find(function(v){return typeof v==='string'&&v.startsWith('http');});
  }catch(e){throw new Error('Reponse inattendue: '+t.slice(0,200));}
}
async function uploadImgbb(b64,key){
  var r=await fetch('/imgbb?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:b64})});
  var d=await r.json();
  if(!d.success)throw new Error('imgbb: '+(d.error&&d.error.message?d.error.message:JSON.stringify(d)));
  return d.data.url;
}
async function run(){
  document.getElementById('eb').style.display='none';
  document.getElementById('lb').style.display='none';
  document.getElementById('lb').innerHTML='';
  document.getElementById('tr').style.display='none';
  document.getElementById('fr').style.display='none';
  setStep(-1);
  var col=document.getElementById('col').value;
  var ratio=document.getElementById('rat').value;
  var modelUrl=(document.getElementById('mu').value||document.getElementById('s-model').value||'').trim();
  var tnbKey=document.getElementById('s-tnb').value.trim();
  var imgbbKey=document.getElementById('s-imgbb').value.trim();
  var garmentUrl=document.getElementById('gu').value.trim();
  if(!modelUrl)return showErr('URL photo modele manquante.');
  if(!useUrl&&!gFile)return showErr('Uploade la photo du vetement.');
  if(useUrl&&!garmentUrl)return showErr('Colle l URL du vetement.');
  if(!useUrl&&!imgbbKey)return showErr('Cle imgbb manquante.');
  var c=COLS[col];
  var btn=document.getElementById('btnr');
  btn.disabled=true;btn.textContent='Pipeline en cours...';
  try{
    var gUrl=garmentUrl;
    if(!useUrl){
      setStep(0);addLog('Upload sur imgbb...');
      var b64=await toB64(gFile);
      gUrl=await uploadImgbb(b64,imgbbKey);
      addLog('Image hebergee');
    }
    setStep(1);addLog('Virtual try-on... (15-30s)');
    var tryonUrl=await callProxy('vto_stream',{api_key:tnbKey,model_photo:modelUrl,clothing_photo:gUrl,prompt:c.vto_prompt,ratio:ratio});
    if(!tryonUrl)throw new Error('URL vide du try-on.');
    addLog('Try-on termine');
    document.getElementById('ti').src=tryonUrl;
    document.getElementById('tl').href=tryonUrl;
    document.getElementById('tr').style.display='block';
    setStep(2);addLog('Decor "'+col+'"...');
    var finalUrl=await callProxy('change-background',{api_key:tnbKey,image:tryonUrl,replace:c.bg_prompt,negative:c.bg_negative});
    if(!finalUrl)throw new Error('URL vide du decor.');
    addLog('Image finale prete');
    setStep(3);
    document.getElementById('fl2').textContent='Image finale - '+col;
    document.getElementById('fi2').src=finalUrl;
    document.getElementById('fl3').href=finalUrl;
    document.getElementById('fr').style.display='block';
  }catch(e){
    showErr(e.message);addLog('ERREUR: '+e.message);
  }finally{
    btn.disabled=false;btn.textContent='Lancer -> '+col;
  }
}
</script>
</body>
</html>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy demarre sur port", PORT));
