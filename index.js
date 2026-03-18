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
  var html = [];

  html.push('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">');
  html.push('<title>Pipeline - L indisciplinee</title><style>');
  html.push('*{box-sizing:border-box;margin:0;padding:0}');
  html.push('body{font-family:-apple-system,sans-serif;background:#f5f5f3;padding:2rem 1rem}');
  html.push('.app{max-width:680px;margin:0 auto;background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 20px rgba(0,0,0,.07)}');
  html.push('h1{font-size:20px;font-weight:600;color:#1a1a1a;display:inline}');
  html.push('.brand{color:#F02B8C;font-style:italic;font-size:14px;margin-left:10px}');
  html.push('.tabs{display:flex;gap:6px;margin:16px 0 20px}');
  html.push('.tab{font-size:12px;padding:5px 16px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#666}');
  html.push('.tab.active{background:#F02B8C;border-color:#F02B8C;color:#fff}');
  html.push('.fl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:#888;display:block;margin-bottom:5px}');
  html.push('input[type=text],select{width:100%;font-size:13px;padding:9px 11px;border-radius:7px;border:1px solid #ddd;background:#fff;color:#1a1a1a;outline:none}');
  html.push('.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}');
  html.push('.field{margin-bottom:14px}');
  html.push('.hint{font-size:11px;color:#aaa;margin-top:5px}');
  html.push('.dz{border:1.5px dashed #ddd;border-radius:10px;cursor:pointer;overflow:hidden;min-height:100px;display:flex;align-items:center;justify-content:center}');
  html.push('.dz.has{min-height:0;border-color:#F02B8C}');
  html.push('.dz img{width:100%;max-height:240px;object-fit:contain;display:block}');
  html.push('.tog{font-size:11px;padding:3px 12px;border-radius:20px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#888;float:right}');
  html.push('.steps{display:flex;align-items:center;gap:4px;padding:10px 12px;background:#f8f8f6;border-radius:8px;margin-bottom:14px}');
  html.push('.si{display:flex;align-items:center;gap:5px;flex:1;min-width:0}');
  html.push('.sd{width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;background:#e0e0e0;color:#999}');
  html.push('.sd.done{background:#F02B8C;color:#fff}');
  html.push('.sd.active{background:#fde8f4;color:#F02B8C;border:1.5px solid #F02B8C}');
  html.push('.sl{font-size:10px;color:#bbb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}');
  html.push('.sl.active{color:#F02B8C}');
  html.push('.sline{flex:1;height:1px;background:#e0e0e0}');
  html.push('.btn{width:100%;padding:13px;border-radius:8px;border:none;background:#F02B8C;color:#fff;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:14px}');
  html.push('.btn:disabled{background:#e0e0e0;color:#aaa;cursor:not-allowed}');
  html.push('.log{background:#f8f8f6;border-radius:8px;padding:10px 12px;margin-bottom:14px;border:1px solid #eee}');
  html.push('.ll{font-size:12px;color:#666;line-height:1.7;font-family:monospace}');
  html.push('.err{padding:10px 14px;background:#fef2f2;border-radius:8px;font-size:13px;color:#c0392b;margin-bottom:12px;border:1px solid #fdd}');
  html.push('.rl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;display:block}');
  html.push('.ri{width:100%;border-radius:8px;display:block;border:1px solid #eee}');
  html.push('.bdl{display:inline-block;margin-top:10px;font-size:13px;color:#fff;background:#F02B8C;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:600}');
  html.push('.lo{display:block;margin-top:6px;font-size:12px;color:#F02B8C;text-decoration:none}');
  html.push('.divt{border-top:2px solid #F02B8C;padding-top:14px;margin-top:4px}');
  html.push('.ib{padding:10px 14px;background:#e8f4fd;border-radius:8px;font-size:12px;color:#2980b9;line-height:1.6}');
  html.push('.sb{padding:12px 14px;background:#f8f8f6;border-radius:8px;border:1px solid #eee;margin-bottom:12px}');
  html.push('.poses-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}');
  html.push('.pose-card{border:1.5px solid #ddd;border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s;background:#f8f8f6}');
  html.push('.pose-card.selected{border-color:#F02B8C;background:#fdf0f7}');
  html.push('.pose-card img{width:100%;height:120px;object-fit:cover;display:block;background:#eee}');
  html.push('.pose-card .no-img{width:100%;height:120px;display:flex;align-items:center;justify-content:center;font-size:28px;color:#ddd;background:#f5f5f3}');
  html.push('.pose-card .pname{font-size:11px;font-weight:600;color:#666;padding:6px 8px 2px;text-transform:uppercase;letter-spacing:.06em}');
  html.push('.pose-card.selected .pname{color:#F02B8C}');
  html.push('.pose-card .purl{font-size:10px;color:#aaa;padding:0 8px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}');
  html.push('.pose-edit{display:none;margin-top:12px;padding:12px;background:#f8f8f6;border-radius:8px;border:1px solid #eee}');
  html.push('.pose-edit.show{display:block}');
  html.push('.sel-indicator{font-size:12px;color:#F02B8C;margin-bottom:12px;padding:8px 12px;background:#fdf0f7;border-radius:6px;border:1px solid #fcd}');
  html.push('</style></head><body>');
  html.push('<div class="app">');
  html.push('<div><h1>Pipeline visuel</h1><span class="brand">L indisciplinee</span></div>');
  html.push('<div class="tabs">');
  html.push('<button class="tab active" onclick="showTab(\'p\')">Pipeline</button>');
  html.push('<button class="tab" onclick="showTab(\'o\')">Poses</button>');
  html.push('<button class="tab" onclick="showTab(\'s\')">Parametres</button>');
  html.push('</div>');

  // PARAMETRES
  html.push('<div id="ts" style="display:none">');
  html.push('<div class="sb"><label class="fl">Cle API The New Black</label><input type="text" id="s-tnb" value="W9ILG0UKP2J35XAO1U6OPAR9VTLDC4"></div>');
  html.push('<div class="sb"><label class="fl">Cle API imgbb</label><input type="text" id="s-imgbb" placeholder="Gratuite sur imgbb.com"><p class="hint">imgbb.com - API - copie ta cle</p></div>');
  html.push('<div class="ib">2 credits TNB par article : 1 try-on + 1 decor.</div>');
  html.push('</div>');

  // POSES
  html.push('<div id="to" style="display:none">');
  html.push('<p class="hint" style="margin-bottom:14px">Clique sur une pose pour la selectionner. Clique sur Modifier pour changer son URL ou son nom.</p>');
  html.push('<div class="poses-grid" id="poses-grid"></div>');
  html.push('<div class="pose-edit" id="pose-edit">');
  html.push('<label class="fl">Nom de la pose</label><input type="text" id="pe-name" style="margin-bottom:10px">');
  html.push('<label class="fl">URL imgbb (lien direct)</label><input type="text" id="pe-url" placeholder="https://i.ibb.co/...">');
  html.push('<div style="display:flex;gap:8px;margin-top:10px">');
  html.push('<button onclick="savePose()" style="flex:1;padding:8px;background:#F02B8C;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer">Sauvegarder</button>');
  html.push('<button onclick="cancelEdit()" style="padding:8px 14px;background:transparent;border:1px solid #ddd;border-radius:6px;font-size:13px;cursor:pointer;color:#666">Annuler</button>');
  html.push('</div></div>');
  html.push('</div>');

  // PIPELINE
  html.push('<div id="tp">');
  html.push('<div id="sel-indicator" class="sel-indicator" style="display:none"></div>');
  html.push('<div class="row">');
  html.push('<div><label class="fl">Collection</label><select id="col" onchange="document.getElementById(\'btnr\').textContent=\'Lancer \'+this.value"><option>Floraison</option><option>Mineral</option><option>Audace</option><option>Crepuscule</option><option>Riviera</option></select></div>');
  html.push('<div><label class="fl">Ratio</label><select id="rat"><option>9:16</option><option>3:4</option><option>1:1</option><option>4:3</option><option>auto</option></select></div>');
  html.push('</div>');
  html.push('<div class="field"><label class="fl">Photo modele (ta pose)</label><input type="text" id="mu" placeholder="Selectionne une pose dans l onglet Poses, ou colle une URL"></div>');
  html.push('<div class="field">');
  html.push('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px"><label class="fl" style="margin:0">Vetement sur cintre</label><button class="tog" id="tog" onclick="toggleMode()">Coller une URL</button></div>');
  html.push('<div id="dz" class="dz" onclick="document.getElementById(\'fi\').click()" ondrop="handleDrop(event)" ondragover="event.preventDefault()"><div style="text-align:center;padding:2rem"><div style="font-size:28px;color:#ccc;margin-bottom:8px">+</div><p style="font-size:13px;color:#888">Photo cintre</p><p style="font-size:11px;color:#bbb;margin-top:3px">JPG PNG - depose ou clique</p></div></div>');
  html.push('<input type="text" id="gu" placeholder="URL du vetement" style="display:none">');
  html.push('<input type="file" id="fi" accept="image/*" style="display:none" onchange="handleFile(this.files[0])">');
  html.push('</div>');
  html.push('<div class="steps"><div class="si"><div class="sd" id="d0">1</div><span class="sl" id="l0">Upload</span><div class="sline"></div></div><div class="si"><div class="sd" id="d1">2</div><span class="sl" id="l1">Try-on</span><div class="sline"></div></div><div class="si"><div class="sd" id="d2">3</div><span class="sl" id="l2">Decor</span><div class="sline"></div></div><div class="si"><div class="sd" id="d3">4</div><span class="sl" id="l3">Resultat</span></div></div>');
  html.push('<button class="btn" id="btnr" onclick="run()">Lancer Floraison</button>');
  html.push('<div id="eb" class="err" style="display:none"></div>');
  html.push('<div id="lb" class="log" style="display:none"></div>');
  html.push('<div id="tr" style="display:none;margin-bottom:16px"><span class="rl">Try-on</span><img id="ti" class="ri"><a id="tl" class="lo" target="_blank">Ouvrir (expire 48h)</a></div>');
  html.push('<div id="fr" class="divt" style="display:none"><span class="rl" id="fl2" style="color:#F02B8C">Image finale</span><img id="fi2" class="ri"><a id="fl3" class="bdl" target="_blank">Telecharger</a></div>');
  html.push('</div>');
  html.push('</div>');

  html.push('<script>');
  html.push('var useUrl=false,gFile=null,editingIdx=-1;');
  html.push('var COLS=' + colsJson + ';');
  html.push('var poses=[');
  html.push('{name:"Face",url:""},' );
  html.push('{name:"3/4",url:""},' );
  html.push('{name:"Dos",url:""},' );
  html.push('{name:"Assise",url:""},' );
  html.push('{name:"Mouvement",url:""},' );
  html.push('{name:"Appuyee",url:""}' );
  html.push('];');
  html.push('var selectedPose=-1;');

  html.push('function showTab(t){');
  html.push('document.getElementById("tp").style.display=t==="p"?"block":"none";');
  html.push('document.getElementById("to").style.display=t==="o"?"block":"none";');
  html.push('document.getElementById("ts").style.display=t==="s"?"block":"none";');
  html.push('document.querySelectorAll(".tab").forEach(function(el,i){el.classList.toggle("active",(i===0&&t==="p")||(i===1&&t==="o")||(i===2&&t==="s"));});');
  html.push('if(t==="o")renderPoses();');
  html.push('}');

  html.push('function renderPoses(){');
  html.push('var g=document.getElementById("poses-grid");g.innerHTML="";');
  html.push('poses.forEach(function(p,i){');
  html.push('var d=document.createElement("div");d.className="pose-card"+(i===selectedPose?" selected":"");');
  html.push('var img=p.url?"<img src=\\""+p.url+"\\" onerror=\\"this.style.display=\'none\';this.nextSibling.style.display=\'flex\'\\">"+"<div class=\\"no-img\\" style=\\"display:none\\">?</div>":"<div class=\\"no-img\\">+</div>";');
  html.push('d.innerHTML=img+"<div class=\\"pname\\">"+p.name+"</div><div class=\\"purl\\">"+(p.url||"Pas d URL")+"</div>";');
  html.push('d.onclick=function(){selectPose(i);};');
  html.push('var eb=document.createElement("button");');
  html.push('eb.textContent="Modifier";eb.style.cssText="font-size:10px;padding:3px 8px;margin:0 8px 8px;border-radius:4px;border:1px solid #ddd;background:transparent;cursor:pointer;color:#888;";');
  html.push('eb.onclick=function(e){e.stopPropagation();editPose(i);};');
  html.push('d.appendChild(eb);g.appendChild(d);');
  html.push('});');
  html.push('}');

  html.push('function selectPose(i){');
  html.push('selectedPose=i;');
  html.push('if(poses[i].url){');
  html.push('document.getElementById("mu").value=poses[i].url;');
  html.push('var ind=document.getElementById("sel-indicator");');
  html.push('ind.textContent="Pose selectionnee : "+poses[i].name;ind.style.display="block";');
  html.push('}');
  html.push('renderPoses();');
  html.push('showTab("p");');
  html.push('}');

  html.push('function editPose(i){');
  html.push('editingIdx=i;');
  html.push('document.getElementById("pe-name").value=poses[i].name;');
  html.push('document.getElementById("pe-url").value=poses[i].url;');
  html.push('var ed=document.getElementById("pose-edit");ed.classList.add("show");');
  html.push('ed.scrollIntoView({behavior:"smooth"});');
  html.push('}');

  html.push('function savePose(){');
  html.push('if(editingIdx<0)return;');
  html.push('poses[editingIdx].name=document.getElementById("pe-name").value;');
  html.push('poses[editingIdx].url=document.getElementById("pe-url").value;');
  html.push('document.getElementById("pose-edit").classList.remove("show");');
  html.push('editingIdx=-1;renderPoses();');
  html.push('}');

  html.push('function cancelEdit(){document.getElementById("pose-edit").classList.remove("show");editingIdx=-1;}');

  html.push('function toggleMode(){useUrl=!useUrl;document.getElementById("dz").style.display=useUrl?"none":"flex";document.getElementById("gu").style.display=useUrl?"block":"none";document.getElementById("tog").textContent=useUrl?"Uploader un fichier":"Coller une URL";}');
  html.push('function handleFile(f){if(!f)return;gFile=f;var dz=document.getElementById("dz");dz.innerHTML="<img src=\'"+URL.createObjectURL(f)+"\' style=\'width:100%;max-height:240px;object-fit:contain;display:block\'>";dz.classList.add("has");}');
  html.push('function handleDrop(e){e.preventDefault();handleFile(e.dataTransfer.files[0]);}');
  html.push('function addLog(m){var b=document.getElementById("lb");b.style.display="block";b.innerHTML+="<div class=\'ll\'>"+m+"</div>";}');
  html.push('function showErr(m){var b=document.getElementById("eb");b.textContent=m;b.style.display="block";}');
  html.push('function setStep(i){for(var j=0;j<4;j++){var d=document.getElementById("d"+j),l=document.getElementById("l"+j);d.className="sd"+(j<i?" done":j===i?" active":"");d.textContent=j<i?"v":j+1;l.className="sl"+(j===i?" active":"");}}');
  html.push('function toB64(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result.split(",")[1]);};r.onerror=rej;r.readAsDataURL(f);});}');
  html.push('async function callProxy(ep,fields){var r=await fetch("/proxy?endpoint="+ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fields)});var txt=await r.text();if(!r.ok)throw new Error("Erreur "+ep+" ("+r.status+"): "+txt.slice(0,200));var t=txt.trim();if(t.startsWith("http"))return t;try{var d=JSON.parse(t);return d.image||d.url||d.output||d.result||Object.values(d).find(function(v){return typeof v==="string"&&v.startsWith("http");});}catch(e){throw new Error("Reponse inattendue: "+t.slice(0,200));}}');
  html.push('async function uploadImgbb(b64,key){var r=await fetch("/imgbb?key="+key,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:b64})});var d=await r.json();if(!d.success)throw new Error("imgbb: "+(d.error&&d.error.message?d.error.message:JSON.stringify(d)));return d.data.url;}');
  html.push('async function run(){');
  html.push('document.getElementById("eb").style.display="none";document.getElementById("lb").style.display="none";document.getElementById("lb").innerHTML="";document.getElementById("tr").style.display="none";document.getElementById("fr").style.display="none";setStep(-1);');
  html.push('var col=document.getElementById("col").value;var ratio=document.getElementById("rat").value;');
  html.push('var modelUrl=(document.getElementById("mu").value||"").trim();');
  html.push('var tnbKey=document.getElementById("s-tnb").value.trim();');
  html.push('var imgbbKey=document.getElementById("s-imgbb").value.trim();');
  html.push('var garmentUrl=document.getElementById("gu").value.trim();');
  html.push('if(!modelUrl)return showErr("URL photo modele manquante. Va dans Poses et selectionne une pose.");');
  html.push('if(!useUrl&&!gFile)return showErr("Uploade la photo du vetement.");');
  html.push('if(useUrl&&!garmentUrl)return showErr("Colle l URL du vetement.");');
  html.push('if(!useUrl&&!imgbbKey)return showErr("Cle imgbb manquante - va dans Parametres.");');
  html.push('var c=COLS[col];var btn=document.getElementById("btnr");btn.disabled=true;btn.textContent="Pipeline en cours...";');
  html.push('try{');
  html.push('var gUrl=garmentUrl;');
  html.push('if(!useUrl){setStep(0);addLog("Upload sur imgbb...");var b64=await toB64(gFile);gUrl=await uploadImgbb(b64,imgbbKey);addLog("Image hebergee");}');
  html.push('setStep(1);addLog("Virtual try-on... (15-30s)");');
  html.push('var tryonUrl=await callProxy("vto_stream",{api_key:tnbKey,model_photo:modelUrl,clothing_photo:gUrl,prompt:c.vto_prompt,ratio:ratio});');
  html.push('if(!tryonUrl)throw new Error("URL vide du try-on.");');
  html.push('addLog("Try-on termine");document.getElementById("ti").src=tryonUrl;document.getElementById("tl").href=tryonUrl;document.getElementById("tr").style.display="block";');
  html.push('setStep(2);addLog("Decor "+col+"...");');
  html.push('var finalUrl=await callProxy("change-background",{api_key:tnbKey,image:tryonUrl,replace:c.bg_prompt,negative:c.bg_negative});');
  html.push('if(!finalUrl)throw new Error("URL vide du decor.");');
  html.push('addLog("Image finale prete");setStep(3);');
  html.push('document.getElementById("fl2").textContent="Image finale - "+col;');
  html.push('document.getElementById("fi2").src=finalUrl;document.getElementById("fl3").href=finalUrl;document.getElementById("fr").style.display="block";');
  html.push('}catch(e){showErr(e.message);addLog("ERREUR: "+e.message);}');
  html.push('finally{btn.disabled=false;btn.textContent="Lancer "+col;}');
  html.push('}');
  html.push('<\/script></body></html>');

  return html.join('');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy demarre sur port", PORT));
