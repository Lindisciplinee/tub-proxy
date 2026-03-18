const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const FormData = require("form-data");
const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const COLS = {
  "Floraison": {
    bg_prompt: "real garden terrace, late afternoon dappled light through leaves casting uneven shadows on stone ground, slightly overexposed background, wild wisteria with some dried flowers, worn wooden bench partially visible, natural imperfections, shot on 85mm f1.8 with soft bokeh, muted pastel tones, slight film grain, no perfect symmetry. Match soft diffused natural light on subject, gentle shadow under chin and arms, no harsh edge, warm skin tones",
    bg_negative: "people, text, logo, studio, fake, overly saturated, perfect lighting, stock photo, CGI, too clean",
    vto_prompt: "elegant plus-size woman wearing the outfit, soft feminine pose, fashion editorial"
  },
  "Mineral": {
    bg_prompt: "authentic Mediterranean stone terrace at dusk, warm raking light casting long directional shadows across worn limestone floor, aged stone balustrade with moss and weathering, olive tree with natural asymmetric branches, real dust and texture on stone, slightly underexposed sky with natural gradient, shot on 50mm, subtle lens flare, muted earthy palette. Match warm golden directional light on subject, strong shadow on one side, warm orange-golden skin tone cast",
    bg_negative: "people, text, logo, perfect stone, CGI, overly bright, stock photo, fake sky, too saturated",
    vto_prompt: "elegant plus-size woman wearing the outfit, natural confident pose, fashion editorial"
  },
  "Audace": {
    bg_prompt: "real Parisian rooftop at magic hour, slightly hazy orange sky, zinc rooftop with dirt and scratches, chimney stacks out of focus, uneven warm light with hard shadows on rooftop surface, handheld feeling, slight chromatic aberration, gritty editorial atmosphere, shot on 35mm. Match harsh directional golden light on subject, strong shadow on one side of face and body, warm orange skin tone",
    bg_negative: "people, text, logo, perfect sky, CGI, too clean, overly saturated, stock photo, fake",
    vto_prompt: "confident plus-size woman wearing the outfit, strong editorial pose, fashion photography"
  },
  "Crepuscule": {
    bg_prompt: "real outdoor terrace at twilight, deep purple-blue sky with last traces of orange on horizon, imperfect string lights partially visible and slightly blurred, worn terrace floor with real texture, potted plants casting long dark shadows, moody underexposed atmosphere, natural vignetting, shot on 50mm f2, low light grain visible. Match low moody ambient light on subject, cool purple tones with warm orange backlight rim, deep soft shadows",
    bg_negative: "people, text, logo, perfect lighting, CGI, overly bright, stock photo, fake, neon",
    vto_prompt: "elegant plus-size woman wearing the outfit, moody editorial pose, fashion photography"
  },
  "Riviera": {
    bg_prompt: "authentic Mediterranean coastal village, midday sun creating harsh real shadows on whitewashed wall with peeling paint, irregular stone path, real sea visible with slight haze in distance, sun bleached colors, heat shimmer in background, natural imperfect composition, shot on 35mm with slight overexposure on bright surfaces, a real village not a resort. Match harsh midday overhead sun on subject, hard shadow under nose and arms, slight overexposed highlights, warm skin",
    bg_negative: "people, text, logo, perfect resort, CGI, overly turquoise, stock photo, fake, too saturated, luxury hotel",
    vto_prompt: "radiant plus-size woman wearing the outfit, relaxed summery pose, fashion editorial"
  }
};

const POSES = [
  { name: "Face", prompt: "change pose to standing facing camera, arms relaxed at sides, confident natural stance, full body visible, keep same person and outfit" },
  { name: "3/4", prompt: "change pose to three quarter view, body slightly turned, weight on one leg, one hand on hip, keep same person and outfit" },
  { name: "Dos", prompt: "change pose to back facing camera, slight head turn over shoulder with a smile, keep same person and outfit" },
  { name: "Assise", prompt: "change pose to sitting naturally on a surface, legs crossed or slightly to side, relaxed posture, keep same person and outfit" },
  { name: "Mouvement", prompt: "change pose to walking movement, one foot forward, slight skirt or dress movement, natural stride, keep same person and outfit" },
  { name: "Appuyee", prompt: "change pose to leaning against a wall or surface, relaxed lean, arms loosely crossed or one hand touching wall, keep same person and outfit" }
];

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
  var colsJson = JSON.stringify(COLS);
  var posesJson = JSON.stringify(POSES);
  var h = [];

  h.push('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pipeline - L indisciplinee</title><style>');
  h.push('*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif;background:#f5f5f3;padding:2rem 1rem}');
  h.push('.app{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 20px rgba(0,0,0,.07)}');
  h.push('h1{font-size:20px;font-weight:600;color:#1a1a1a;display:inline}.brand{color:#F02B8C;font-style:italic;font-size:14px;margin-left:10px}');
  h.push('.tabs{display:flex;gap:6px;margin:16px 0 20px}.tab{font-size:12px;padding:5px 16px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#666}.tab.active{background:#F02B8C;border-color:#F02B8C;color:#fff}');
  h.push('.fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;display:block;margin-bottom:5px}');
  h.push('input[type=text],select{width:100%;font-size:13px;padding:9px 11px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a1a;outline:none}');
  h.push('.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}.field{margin-bottom:14px}.hint{font-size:11px;color:#aaa;margin-top:5px}');
  h.push('.dz{border:1.5px dashed #ddd;border-radius:10px;cursor:pointer;overflow:hidden;min-height:100px;display:flex;align-items:center;justify-content:center}');
  h.push('.dz.has{min-height:0;border-color:#F02B8C}.dz img{width:100%;max-height:260px;object-fit:contain;display:block}');
  h.push('.tog{font-size:11px;padding:3px 12px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#888;float:right}');
  h.push('.steps{display:flex;align-items:center;gap:4px;padding:10px 12px;background:#f8f8f6;border-radius:8px;margin-bottom:14px}');
  h.push('.si{display:flex;align-items:center;gap:5px;flex:1;min-width:0}');
  h.push('.sd{width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;background:#e0e0e0;color:#999}');
  h.push('.sd.done{background:#F02B8C;color:#fff}.sd.active{background:#fde8f4;color:#F02B8C;border:1.5px solid #F02B8C}');
  h.push('.sl{font-size:10px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sl.active{color:#F02B8C}.sline{flex:1;height:1px;background:#e0e0e0}');
  h.push('.btn{width:100%;padding:13px;border-radius:8px;border:none;background:#F02B8C;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:14px}.btn:disabled{background:#e0e0e0;color:#aaa;cursor:not-allowed}');
  h.push('.log{background:#f8f8f6;border-radius:8px;padding:10px 12px;margin-bottom:14px;border:1px solid #eee}.ll{font-size:12px;color:#666;line-height:1.7;font-family:monospace}');
  h.push('.err{padding:10px 14px;background:#fef2f2;border-radius:8px;font-size:13px;color:#c0392b;margin-bottom:12px;border:1px solid #fdd}');
  h.push('.rl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;display:block}');
  h.push('.ri{width:100%;border-radius:8px;display:block;border:1px solid #eee}');
  h.push('.bdl{display:inline-block;margin-top:10px;font-size:13px;color:#fff;background:#F02B8C;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600}');
  h.push('.lo{display:block;margin-top:6px;font-size:12px;color:#F02B8C;text-decoration:none}');
  h.push('.divt{border-top:2px solid #F02B8C;padding-top:14px;margin-top:4px}');
  h.push('.ib{padding:10px 14px;background:#e8f4fd;border-radius:8px;font-size:12px;color:#2980b9;line-height:1.6}');
  h.push('.sb{padding:12px 14px;background:#f8f8f6;border-radius:8px;border:1px solid #eee;margin-bottom:12px}');
  h.push('.pose-btns{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}');
  h.push('.pbtn{padding:10px 6px;border-radius:8px;border:1.5px solid #ddd;background:#f8f8f6;cursor:pointer;font-size:12px;font-weight:600;color:#666;text-align:center;transition:all .15s}');
  h.push('.pbtn:hover{border-color:#F02B8C;color:#F02B8C}.pbtn.active{border-color:#F02B8C;background:#fdf0f7;color:#F02B8C}');
  h.push('.pose-result{margin-top:14px}.pose-result img{width:100%;border-radius:8px;display:block;border:1px solid #eee}');
  h.push('.use-btn{display:block;width:100%;margin-top:10px;padding:11px;background:#F02B8C;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer}');
  h.push('.sel-bar{font-size:12px;color:#F02B8C;margin-bottom:12px;padding:8px 12px;background:#fdf0f7;border-radius:6px;border:1px solid #fcd;display:none}');
  h.push('</style></head><body><div class="app">');

  h.push('<div><h1>Pipeline visuel</h1><span class="brand">L indisciplinee</span></div>');
  h.push('<div class="tabs">');
  h.push('<button class="tab active" onclick="showTab(\'p\')">Pipeline</button>');
  h.push('<button class="tab" onclick="showTab(\'o\')">Poses</button>');
  h.push('<button class="tab" onclick="showTab(\'s\')">Parametres</button>');
  h.push('</div>');

  // PARAMETRES
  h.push('<div id="ts" style="display:none">');
  h.push('<div class="sb"><label class="fl">Cle API The New Black</label><input type="text" id="s-tnb" value="W9ILG0UKP2J35XAO1U6OPAR9VTLDC4"></div>');
  h.push('<div class="sb"><label class="fl">Cle API imgbb</label><input type="text" id="s-imgbb" placeholder="Gratuite sur imgbb.com"><p class="hint">imgbb.com - API - copie ta cle</p></div>');
  h.push('<div class="ib">2 credits TNB par article (try-on + decor). 1 credit par generation de pose.</div>');
  h.push('</div>');

  // POSES
  h.push('<div id="to" style="display:none">');
  h.push('<div class="field">');
  h.push('<label class="fl">Ta photo de base</label>');
  h.push('<div id="pose-dz" class="dz" onclick="document.getElementById(\'pfi\').click()" ondrop="handlePoseDrop(event)" ondragover="event.preventDefault()">');
  h.push('<div style="text-align:center;padding:2rem"><div style="font-size:28px;color:#ccc;margin-bottom:8px">+</div><p style="font-size:13px;color:#888">Upload ta photo</p><p style="font-size:11px;color:#bbb;margin-top:3px">JPG PNG - depose ou clique</p></div>');
  h.push('</div>');
  h.push('<input type="file" id="pfi" accept="image/*" style="display:none" onchange="handlePoseFile(this.files[0])">');
  h.push('</div>');
  h.push('<label class="fl" style="margin-bottom:10px">Choix de la pose</label>');
  h.push('<div class="pose-btns" id="pose-btns"></div>');
  h.push('<div id="pose-err" class="err" style="display:none"></div>');
  h.push('<button class="btn" id="pose-gen-btn" onclick="generatePose()" disabled>Generer la pose (1 credit)</button>');
  h.push('<div id="pose-log" class="log" style="display:none"></div>');
  h.push('<div id="pose-result" class="pose-result" style="display:none">');
  h.push('<span class="rl">Resultat</span><img id="pose-img" alt="pose">');
  h.push('<a id="pose-dl" class="lo" target="_blank">Ouvrir (expire 48h)</a>');
  h.push('<button class="use-btn" onclick="usePose()">Utiliser comme photo modele dans le Pipeline</button>');
  h.push('</div>');
  h.push('</div>');

  // PIPELINE
  h.push('<div id="tp">');
  h.push('<div id="sel-bar" class="sel-bar"></div>');
  h.push('<div class="row">');
  h.push('<div><label class="fl">Collection</label><select id="col" onchange="document.getElementById(\'btnr\').textContent=\'Lancer \'+this.value"><option>Floraison</option><option>Mineral</option><option>Audace</option><option>Crepuscule</option><option>Riviera</option></select></div>');
  h.push('<div><label class="fl">Ratio</label><select id="rat"><option>9:16</option><option>3:4</option><option>1:1</option><option>4:3</option><option>auto</option></select></div>');
  h.push('</div>');
  h.push('<div class="field"><label class="fl">Photo modele (ta pose)</label><input type="text" id="mu" placeholder="Genere une pose dans l onglet Poses, ou colle une URL"></div>');
  h.push('<div class="field">');
  h.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><label class="fl" style="margin:0">Vetement sur cintre</label><button class="tog" id="tog" onclick="toggleMode()">Coller une URL</button></div>');
  h.push('<div id="dz" class="dz" onclick="document.getElementById(\'fi\').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()"><div style="text-align:center;padding:2rem"><div style="font-size:28px;color:#ccc;margin-bottom:8px">+</div><p style="font-size:13px;color:#888">Photo cintre</p><p style="font-size:11px;color:#bbb;margin-top:3px">JPG PNG - depose ou clique</p></div></div>');
  h.push('<input type="text" id="gu" placeholder="URL du vetement" style="display:none">');
  h.push('<input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFile(this.files[0])">');
  h.push('</div>');
  h.push('<div class="steps"><div class="si"><div class="sd" id="d0">1</div><span class="sl" id="l0">Upload</span><div class="sline"></div></div><div class="si"><div class="sd" id="d1">2</div><span class="sl" id="l1">Try-on</span><div class="sline"></div></div><div class="si"><div class="sd" id="d2">3</div><span class="sl" id="l2">Decor</span><div class="sline"></div></div><div class="si"><div class="sd" id="d3">4</div><span class="sl" id="l3">Resultat</span></div></div>');
  h.push('<button class="btn" id="btnr" onclick="run()">Lancer Floraison</button>');
  h.push('<div id="eb" class="err" style="display:none"></div>');
  h.push('<div id="lb" class="log" style="display:none"></div>');
  h.push('<div id="tr" style="display:none;margin-bottom:16px"><span class="rl">Try-on</span><img id="ti" class="ri"><a id="tl" class="lo" target="_blank">Ouvrir (expire 48h)</a></div>');
  h.push('<div id="fr" class="divt" style="display:none"><span class="rl" id="fl2" style="color:#F02B8C">Image finale</span><img id="fi2" class="ri"><a id="fl3" class="bdl" target="_blank">Telecharger</a></div>');
  h.push('</div>');
  h.push('</div>');

  h.push('<script>');
  h.push('var COLS=' + colsJson + ';');
  h.push('var POSES=' + posesJson + ';');
  h.push('var useUrl=false,gFile=null,poseFile=null,poseBaseUrl=null,selectedPoseIdx=-1,generatedPoseUrl=null;');

  h.push('function showTab(t){');
  h.push('["tp","to","ts"].forEach(function(id,i){document.getElementById(id).style.display=((i===0&&t==="p")||(i===1&&t==="o")||(i===2&&t==="s"))?"block":"none";});');
  h.push('document.querySelectorAll(".tab").forEach(function(el,i){el.classList.toggle("active",(i===0&&t==="p")||(i===1&&t==="o")||(i===2&&t==="s"));});');
  h.push('if(t==="o")renderPoseBtns();');
  h.push('}');

  h.push('function renderPoseBtns(){');
  h.push('var g=document.getElementById("pose-btns");g.innerHTML="";');
  h.push('POSES.forEach(function(p,i){');
  h.push('var b=document.createElement("button");');
  h.push('b.className="pbtn"+(i===selectedPoseIdx?" active":"");');
  h.push('b.textContent=p.name;');
  h.push('b.onclick=function(){selectedPoseIdx=i;renderPoseBtns();checkPoseReady();};');
  h.push('g.appendChild(b);');
  h.push('});');
  h.push('}');

  h.push('function checkPoseReady(){');
  h.push('document.getElementById("pose-gen-btn").disabled=!(poseBaseUrl&&selectedPoseIdx>=0);');
  h.push('}');

  h.push('function handlePoseFile(f){');
  h.push('if(!f)return;poseFile=f;');
  h.push('var dz=document.getElementById("pose-dz");');
  h.push('dz.innerHTML="<img src=\'"+URL.createObjectURL(f)+"\' style=\'width:100%;max-height:260px;object-fit:contain;display:block\'>";');
  h.push('dz.classList.add("has");');
  h.push('poseBaseUrl=null;');
  h.push('checkPoseReady();');
  h.push('}');

  h.push('function handlePoseDrop(e){e.preventDefault();handlePoseFile(e.dataTransfer.files[0]);}');

  h.push('async function generatePose(){');
  h.push('var tnbKey=document.getElementById("s-tnb").value.trim();');
  h.push('var imgbbKey=document.getElementById("s-imgbb").value.trim();');
  h.push('if(!imgbbKey)return showPoseErr("Cle imgbb manquante - va dans Parametres.");');
  h.push('if(!poseFile)return showPoseErr("Upload ta photo de base.");');
  h.push('if(selectedPoseIdx<0)return showPoseErr("Choisis une pose.");');
  h.push('var btn=document.getElementById("pose-gen-btn");btn.disabled=true;btn.textContent="Generation en cours...";');
  h.push('document.getElementById("pose-err").style.display="none";');
  h.push('document.getElementById("pose-result").style.display="none";');
  h.push('var logEl=document.getElementById("pose-log");logEl.style.display="block";logEl.innerHTML="";');
  h.push('function lg(m){logEl.innerHTML+="<div class=\'ll\'>"+m+"</div>";}');
  h.push('try{');
  h.push('lg("Upload photo de base sur imgbb...");');
  h.push('var b64=await toB64(poseFile);');
  h.push('poseBaseUrl=await uploadImgbb(b64,imgbbKey);');
  h.push('lg("Photo hebergee. Generation de la pose...");');
  h.push('var pose=POSES[selectedPoseIdx];');
  h.push('var r=await fetch("/proxy?endpoint=edit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({api_key:tnbKey,image:poseBaseUrl,prompt:pose.prompt,negative:"blurry, deformed, extra limbs, bad anatomy, wrong proportions"})});');
  h.push('var txt=await r.text();');
  h.push('if(!r.ok)throw new Error("Erreur edit ("+r.status+"): "+txt.slice(0,200));');
  h.push('var t=txt.trim();');
  h.push('generatedPoseUrl=t.startsWith("http")?t:(function(){try{var d=JSON.parse(t);return d.image||d.url||d.output||d.result||Object.values(d).find(function(v){return typeof v==="string"&&v.startsWith("http");});}catch(e){throw new Error("Reponse inattendue: "+t.slice(0,200));}})();');
  h.push('if(!generatedPoseUrl)throw new Error("URL vide recue.");');
  h.push('lg("Pose generee !");');
  h.push('document.getElementById("pose-img").src=generatedPoseUrl;');
  h.push('document.getElementById("pose-dl").href=generatedPoseUrl;');
  h.push('document.getElementById("pose-result").style.display="block";');
  h.push('}catch(e){showPoseErr(e.message);lg("ERREUR: "+e.message);}');
  h.push('finally{btn.disabled=false;btn.textContent="Generer la pose (1 credit)";}');
  h.push('}');

  h.push('function showPoseErr(m){var b=document.getElementById("pose-err");b.textContent=m;b.style.display="block";}');

  h.push('function usePose(){');
  h.push('if(!generatedPoseUrl)return;');
  h.push('document.getElementById("mu").value=generatedPoseUrl;');
  h.push('var bar=document.getElementById("sel-bar");');
  h.push('bar.textContent="Pose active : "+POSES[selectedPoseIdx].name+" (generee)";');
  h.push('bar.style.display="block";');
  h.push('showTab("p");');
  h.push('}');

  h.push('function toggleMode(){useUrl=!useUrl;document.getElementById("dz").style.display=useUrl?"none":"flex";document.getElementById("gu").style.display=useUrl?"block":"none";document.getElementById("tog").textContent=useUrl?"Uploader un fichier":"Coller une URL";}');
  h.push('function handleFile(f){if(!f)return;gFile=f;var dz=document.getElementById("dz");dz.innerHTML="<img src=\'"+URL.createObjectURL(f)+"\' style=\'width:100%;max-height:240px;object-fit:contain;display:block\'>";dz.classList.add("has");}');
  h.push('function handleDrop(e){e.preventDefault();handleFile(e.dataTransfer.files[0]);}');
  h.push('function addLog(m){var b=document.getElementById("lb");b.style.display="block";b.innerHTML+="<div class=\'ll\'>"+m+"</div>";}');
  h.push('function showErr(m){var b=document.getElementById("eb");b.textContent=m;b.style.display="block";}');
  h.push('function setStep(i){for(var j=0;j<4;j++){var d=document.getElementById("d"+j),l=document.getElementById("l"+j);d.className="sd"+(j<i?" done":j===i?" active":"");d.textContent=j<i?"v":j+1;l.className="sl"+(j===i?" active":"");}}');
  h.push('function toB64(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result.split(",")[1]);};r.onerror=rej;r.readAsDataURL(f);});}');
  h.push('async function callProxy(ep,fields){var r=await fetch("/proxy?endpoint="+ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fields)});var txt=await r.text();if(!r.ok)throw new Error("Erreur "+ep+" ("+r.status+"): "+txt.slice(0,200));var t=txt.trim();if(t.startsWith("http"))return t;try{var d=JSON.parse(t);return d.image||d.url||d.output||d.result||Object.values(d).find(function(v){return typeof v==="string"&&v.startsWith("http");});}catch(e){throw new Error("Reponse inattendue: "+t.slice(0,200));}}');
  h.push('async function uploadImgbb(b64,key){var r=await fetch("/imgbb?key="+key,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:b64})});var d=await r.json();if(!d.success)throw new Error("imgbb: "+(d.error&&d.error.message?d.error.message:JSON.stringify(d)));return d.data.url;}');
  h.push('async function run(){');
  h.push('document.getElementById("eb").style.display="none";document.getElementById("lb").style.display="none";document.getElementById("lb").innerHTML="";document.getElementById("tr").style.display="none";document.getElementById("fr").style.display="none";setStep(-1);');
  h.push('var col=document.getElementById("col").value,ratio=document.getElementById("rat").value;');
  h.push('var modelUrl=(document.getElementById("mu").value||"").trim();');
  h.push('var tnbKey=document.getElementById("s-tnb").value.trim();');
  h.push('var imgbbKey=document.getElementById("s-imgbb").value.trim();');
  h.push('var garmentUrl=document.getElementById("gu").value.trim();');
  h.push('if(!modelUrl)return showErr("URL photo modele manquante. Genere une pose dans l onglet Poses.");');
  h.push('if(!useUrl&&!gFile)return showErr("Uploade la photo du vetement.");');
  h.push('if(useUrl&&!garmentUrl)return showErr("Colle l URL du vetement.");');
  h.push('if(!useUrl&&!imgbbKey)return showErr("Cle imgbb manquante.");');
  h.push('var c=COLS[col],btn=document.getElementById("btnr");btn.disabled=true;btn.textContent="Pipeline en cours...";');
  h.push('try{');
  h.push('var gUrl=garmentUrl;');
  h.push('if(!useUrl){setStep(0);addLog("Upload sur imgbb...");var b64=await toB64(gFile);gUrl=await uploadImgbb(b64,imgbbKey);addLog("Image hebergee");}');
  h.push('setStep(1);addLog("Virtual try-on... (15-30s)");');
  h.push('var tryonUrl=await callProxy("vto_stream",{api_key:tnbKey,model_photo:modelUrl,clothing_photo:gUrl,prompt:c.vto_prompt,ratio:ratio});');
  h.push('if(!tryonUrl)throw new Error("URL vide du try-on.");');
  h.push('addLog("Try-on termine");document.getElementById("ti").src=tryonUrl;document.getElementById("tl").href=tryonUrl;document.getElementById("tr").style.display="block";');
  h.push('setStep(2);addLog("Decor "+col+"...");');
  h.push('var finalUrl=await callProxy("change-background",{api_key:tnbKey,image:tryonUrl,replace:c.bg_prompt,negative:c.bg_negative});');
  h.push('if(!finalUrl)throw new Error("URL vide du decor.");');
  h.push('addLog("Image finale prete");setStep(3);');
  h.push('document.getElementById("fl2").textContent="Image finale - "+col;');
  h.push('document.getElementById("fi2").src=finalUrl;document.getElementById("fl3").href=finalUrl;document.getElementById("fr").style.display="block";');
  h.push('}catch(e){showErr(e.message);addLog("ERREUR: "+e.message);}');
  h.push('finally{btn.disabled=false;btn.textContent="Lancer "+col;}');
  h.push('}');
  h.push('<\/script></body></html>');

  return h.join('');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy demarre sur port", PORT));
