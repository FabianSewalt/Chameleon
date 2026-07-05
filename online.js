'use strict';
// ============================================================
// CHAMELEON — ONLINE MODUS
// Kamercode via een publieke MQTT-broker (geen account nodig).
// Iedereen opent dezelfde app; de host maakt een kamer en is de
// spelleider, de rest doet mee met de code. Rollen worden live
// naar ieders eigen telefoon gestuurd.
// ============================================================

const OL_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];
const OL_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

let OL = null; // actieve online-sessie

function olTopics(code){
  const b = 'chameleon1/' + code;
  return { state: b + '/state', join: b + '/join', ack: b + '/ack', all: b + '/all', p: pid => b + '/p/' + pid };
}
function olCode(){ let s = ''; for(let i = 0; i < 5; i++) s += OL_CHARS[Math.floor(Math.random() * OL_CHARS.length)]; return s; }
function olId(){ return Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 6); }
function olPub(topic, obj, retain){
  if(OL && OL.client){
    try{ OL.client.publish(topic, obj === null ? '' : JSON.stringify(obj), { qos: 1, retain: !!retain }); }catch(e){}
  }
}
function olParse(buf){
  const s = buf.toString();
  if(!s) return null;
  try{ return JSON.parse(s); }catch(e){ return null; }
}
function olAva(i){ return AVA_COLORS[i % AVA_COLORS.length]; }

function olConnect(onReady, onFail){
  if(typeof mqtt === 'undefined'){ onFail('De online-bibliotheek kon niet laden. Herlaad de app en probeer opnieuw.'); return; }
  let i = 0, settled = false;
  const tryNext = () => {
    if(i >= OL_BROKERS.length){
      if(!settled){ settled = true; onFail('Geen verbinding met de spelservers. Check je internet en probeer het nog eens.'); }
      return;
    }
    const url = OL_BROKERS[i++];
    let c;
    try{
      c = mqtt.connect(url, { clientId: 'cham_' + olId(), clean: true, connectTimeout: 6000, reconnectPeriod: 2500, keepalive: 30 });
    }catch(e){ tryNext(); return; }
    const timer = setTimeout(() => {
      if(!settled){ try{ c.end(true); }catch(e){} tryNext(); }
    }, 7000);
    c.once('connect', () => {
      clearTimeout(timer);
      if(settled){ try{ c.end(true); }catch(e){} return; }
      settled = true;
      onReady(c, url);
    });
    c.on('error', () => {});
  };
  tryNext();
}

function olSetup(client, subs, onMessage){
  OL.client = client;
  OL.subs = subs;
  const subscribeAll = () => OL.subs.forEach(t => { try{ client.subscribe(t, { qos: 1 }); }catch(e){} });
  subscribeAll();
  client.on('connect', () => { // ook bij automatisch opnieuw verbinden
    if(!OL) return;
    OL.offline = false;
    subscribeAll();
    if(OL.rerender) OL.rerender();
  });
  client.on('offline', () => {
    if(!OL) return;
    OL.offline = true;
    if(OL.rerender) OL.rerender();
  });
  client.on('message', (topic, buf) => {
    if(!OL) return;
    onMessage(topic, olParse(buf), buf);
  });
}

function olClose(){
  if(OL){
    if(OL.role === 'host' && OL.client){
      const t = olTopics(OL.code);
      olPub(t.all, { v: 1, t: 'closed' }, false);
      olPub(t.state, null, true); // retained leegmaken
      olPub(t.all, null, true);
      OL.players.forEach(p => { if(p.pid !== 'HOST') olPub(t.p(p.pid), null, true); });
    }
    if(OL.client){ try{ OL.client.end(true); }catch(e){} }
  }
  OL = null;
  state.online = null;
  state.match = null;
  state.game = null;
  renderHome();
}

function olStatusChip(){
  return OL && OL.offline
    ? '<div class="note pulse" style="text-align:center">📶 Verbinding kwijt — opnieuw verbinden…</div>'
    : '';
}

function olStandingsHTML(scores, deltas){
  const standings = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return standings.map(([name, pts], i) => {
    const d = deltas ? (deltas[name] || 0) : 0;
    return `<div class="prow">
      <span class="rank">${i + 1}</span>
      <span class="ava" style="background:${olAva(i)}">${esc(String(name).charAt(0).toUpperCase())}</span>
      <span class="pname">${esc(name)}</span>
      ${d ? `<span class="delta">+${d}</span>` : ''}
      <span class="score">${pts}</span>
    </div>`;
  }).join('');
}

// ---------- gedeelde schermen ----------
function olRenderConnecting(txt){
  topbar('Online spel', '🌐');
  scr.innerHTML = `
    <div class="stack center">
      <div class="card">
        <div class="rolemoji pulse">📡</div>
        <h2 class="h2">${esc(txt)}</h2>
        <p class="soft" style="margin-top:8px">Verbinden met de spelserver…</p>
      </div>
    </div>`;
}

function olRenderError(msg){
  if(OL && OL.client){ try{ OL.client.end(true); }catch(e){} }
  OL = null;
  state.online = null;
  topbar('Online spel', '🌐');
  scr.innerHTML = `
    <div class="stack center">
      <div class="card">
        <div class="rolemoji">😵</div>
        <h2 class="h2">Dat lukte niet</h2>
        <p class="soft" style="margin-top:8px">${esc(msg)}</p>
      </div>
      <button class="btn big" id="retry">Opnieuw proberen 🔁</button>
      <button class="btn subtle" id="home">Home</button>
    </div>`;
  $('#retry').onclick = renderOnlineMenu;
  $('#home').onclick = renderHome;
}

function olRenderClosed(){
  if(OL && OL.client){ try{ OL.client.end(true); }catch(e){} }
  OL = null;
  state.online = null;
  topbar('Online spel', '🌐');
  scr.innerHTML = `
    <div class="stack center">
      <div class="card">
        <div class="rolemoji">🚪</div>
        <h2 class="h2">De kamer is gesloten</h2>
        <p class="soft" style="margin-top:8px">De host heeft het spel beëindigd.</p>
      </div>
      <button class="btn big" id="home">Terug naar home</button>
    </div>`;
  $('#home').onclick = renderHome;
}

// ---------- menu ----------
function renderOnlineMenu(){
  topbar('Online spel', '🌐');
  scr.innerHTML = `
    <div class="stack">
      <div class="card">
        <p>🌐 Iedereen speelt op z'n <b>eigen telefoon</b>. Open allemaal deze app (zelfde link!). Eén iemand maakt een kamer, de rest doet mee met de code.</p>
        <p class="soft small">Hints geven en stemmen doen jullie gewoon met elkaar — in het echt of in een call. Dit loopt via een gratis publieke server, dus deel de code alleen met je groep.</p>
      </div>
      <button class="btn big" id="host">Kamer maken 👑</button>
      <button class="btn" id="join">Meedoen met code 🙋</button>
      <button class="btn subtle" id="back">← Terug</button>
    </div>`;
  $('#host').onclick = renderOnlineHostSetup;
  $('#join').onclick = renderOnlineJoinSetup;
  $('#back').onclick = renderHome;
}

// ============================================================
// HOST
// ============================================================
function renderOnlineHostSetup(){
  topbar('Kamer maken', '👑');
  const s = state.settings;
  const last = load('cham_online_name', state.players[0] || '');
  scr.innerHTML = `
    <div class="stack">
      <div class="card">
        <p class="label">Jouw naam (je speelt zelf mee)</p>
        <input id="hname" maxlength="14" value="${esc(last)}" placeholder="Naam…" autocomplete="off" enterkeyhint="done" style="width:100%">
      </div>
      <div class="card">
        <p class="label">Instellingen van dit potje</p>
        <p>🔁 ${s.rounds} ronde${s.rounds === 1 ? '' : 's'} · 🦎 ${s.chameleons} · 🐸 ${s.salamanders} · 🔍 raden ${s.wordGuess ? 'aan' : 'uit'}</p>
        <p class="soft small">Aanpassen kan via Instellingen op het homescherm, vóórdat je de kamer maakt.</p>
      </div>
      <button class="btn big" id="go">Kamer aanmaken ✨</button>
      <button class="btn subtle" id="back">← Terug</button>
    </div>`;
  const go = () => {
    const name = $('#hname').value.trim();
    if(!name){ flash('Vul je naam in'); $('#hname').focus(); return; }
    save('cham_online_name', name);
    olHostCreate(name);
  };
  $('#go').onclick = go;
  $('#hname').addEventListener('keydown', e => { if(e.key === 'Enter') go(); });
  $('#back').onclick = renderOnlineMenu;
}

function olHostCreate(name){
  const code = olCode();
  OL = { role: 'host', code, name, players: [{ name, pid: 'HOST', seen: false }],
         phase: 'lobby', offline: false, rerender: null, client: null, subs: [] };
  state.online = OL;
  olRenderConnecting('Kamer aanmaken…');
  olConnect(client => {
    const t = olTopics(code);
    olSetup(client, [t.join, t.ack], olHostMessage);
    olPushState();
    olHostLobby();
  }, olRenderError);
}

function olPushState(){
  const t = olTopics(OL.code);
  olPub(t.state, {
    v: 1, t: 'state', phase: OL.phase,
    players: OL.players.map(p => p.name),
    round: state.match ? state.match.roundNo : 0,
    totalRounds: state.settings.rounds
  }, true);
}

function olHostMessage(topic, msg){
  if(!OL || !msg) return;
  const t = olTopics(OL.code);

  if(topic === t.join && msg.t === 'join' && msg.name && msg.pid){
    const name = String(msg.name).slice(0, 14).trim();
    if(!name) return;
    const ex = OL.players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if(ex){
      if(ex.pid === 'HOST'){
        olPub(t.p(msg.pid), { v: 1, t: 'error', msg: 'Die naam is al bezet 😅' }, false);
        return;
      }
      // zelfde naam = opnieuw verbinden: nieuwe pid koppelen en rol opnieuw sturen
      const oldPid = ex.pid;
      ex.pid = msg.pid;
      if(oldPid !== msg.pid) olPub(t.p(oldPid), null, true);
      if(OL.phase === 'playing' && state.game) olSendRoleTo(ex);
    } else {
      if(OL.phase !== 'lobby'){
        olPub(t.p(msg.pid), { v: 1, t: 'error', msg: 'Het potje is al begonnen — wacht op het volgende!' }, false);
        return;
      }
      OL.players.push({ name, pid: msg.pid, seen: false });
    }
    olPushState();
    if(OL.rerender) OL.rerender();
    return;
  }

  if(topic === t.ack && msg.t === 'seen' && msg.pid){
    const p = OL.players.find(x => x.pid === msg.pid);
    if(p && (!msg.round || !state.match || msg.round === state.match.roundNo)){
      p.seen = true;
      if(OL.rerender) OL.rerender();
    }
  }
}

function olSendRoleTo(p){
  if(!state.game || p.pid === 'HOST') return;
  const t = olTopics(OL.code);
  const gp = state.game.players.find(x => x.name === p.name);
  if(!gp) return;
  olPub(t.p(p.pid), {
    v: 1, t: 'role',
    round: state.match.roundNo,
    totalRounds: state.match.totalRounds,
    role: gp.role === 'chameleon' ? 'chameleon' : 'speler', // de salamander weet zelf van niks!
    word: gp.word,
    cat: (gp.role === 'chameleon' && !state.settings.chamSeesCategory) ? null : state.game.cat,
    catVisible: state.settings.chamSeesCategory,
    starter: state.game.starter
  }, true);
}

function olHostLobby(){
  OL.rerender = olHostLobby;
  topbar('Online kamer', 'lobby');
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      <div class="card center">
        <p class="label">Kamercode</p>
        <div class="roomcode">${OL.code}</div>
        <p class="soft small">Iedereen: zelfde app-link openen → <b>Online spel</b> → <b>Meedoen met code</b></p>
      </div>
      <div class="card">
        <p class="label">Spelers (${OL.players.length})</p>
        ${OL.players.map((p, i) => `
          <div class="prow">
            <span class="ava" style="background:${olAva(i)}">${esc(p.name.charAt(0).toUpperCase())}</span>
            <span class="pname">${esc(p.name)}${p.pid === 'HOST' ? ' 👑' : ''}</span>
          </div>`).join('')}
        ${OL.players.length < 3 ? '<p class="soft small">Minimaal 3 spelers nodig…</p>' : ''}
      </div>
      <button class="btn big" id="start">Start het potje 🎬</button>
      <button class="btn subtle" id="close">✕ Kamer sluiten</button>
    </div>`;
  $('#start').onclick = () => {
    const n = OL.players.length;
    const { chameleons, salamanders } = state.settings;
    if(n < 3){ flash('Minimaal 3 spelers nodig 👥'); return; }
    if(chameleons + salamanders < 1){ flash('Kies minstens 1 chameleon of salamander (instellingen)'); return; }
    if(chameleons + salamanders > n - 2){ flash('Max ' + (n - 2) + ' speciale rollen bij ' + n + ' spelers — pas je instellingen aan'); return; }
    if(enabledCategories().length === 0){ flash('Zet minstens 1 categorie aan'); return; }
    state.match = {
      totalRounds: state.settings.rounds,
      roundNo: 1,
      scores: Object.fromEntries(OL.players.map(p => [p.name, 0]))
    };
    OL.phase = 'playing';
    OL.rerender = null;
    olPushState();
    renderCategoryPick();
  };
  $('#close').onclick = e => armConfirm(e.currentTarget, olClose);
}

function onlineBeginRound(catChoice){
  const names = OL.players.map(p => p.name);
  state.game = Object.assign(buildRound(catChoice, names), {
    caught: null, goodGuess: [], scored: false, deltas: {}
  });
  OL.players.forEach(p => { p.seen = false; });
  OL.players.forEach(olSendRoleTo);
  const t = olTopics(OL.code);
  olPub(t.all, {
    v: 1, t: 'round',
    round: state.match.roundNo,
    totalRounds: state.match.totalRounds,
    starter: state.game.starter,
    cat: state.settings.chamSeesCategory ? state.game.cat : null,
    catVisible: state.settings.chamSeesCategory
  }, true);
  olPushState();
  olHostOwnRole();
}

function olHostOwnRole(){
  OL.rerender = null;
  const g = state.game;
  const me = g.players.find(p => p.name === OL.name);
  topbar(roundLabel(), 'jouw rol');
  scr.innerHTML = `
    <div class="stack">
      <h2 class="h2 center" style="margin-top:6px">Hoi ${esc(OL.name)}! 👋</h2>
      <div id="hold" class="holdzone">
        <div class="holdhint">
          <div class="rolemoji">🤫</div>
          <p class="soft"><b>Houd ingedrukt</b><br>om je geheime rol te zien</p>
        </div>
        <div class="holdcontent hidden" id="rolecard"></div>
      </div>
      <p class="soft center small" id="seenmark">&nbsp;</p>
      <button class="btn big" id="nextbtn" disabled>Naar het overzicht ➜</button>
    </div>`;
  const hold = $('#hold');
  const card = $('#rolecard');
  const hint = hold.querySelector('.holdhint');
  let seen = false;
  const show = e => {
    e.preventDefault();
    hint.classList.add('hidden');
    card.classList.remove('hidden');
    hold.classList.add('active');
    fillRoleCard(card, me, g);
    if(!seen){
      seen = true;
      const hp = OL.players.find(p => p.pid === 'HOST');
      if(hp) hp.seen = true;
      $('#nextbtn').disabled = false;
      $('#seenmark').textContent = 'Rol bekeken ✓';
    }
  };
  const hide = () => {
    card.classList.add('hidden');
    hint.classList.remove('hidden');
    hold.classList.remove('active');
  };
  hold.addEventListener('pointerdown', show);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hold.addEventListener(ev, hide));
  hold.addEventListener('contextmenu', e => e.preventDefault());
  $('#nextbtn').onclick = olHostDashboard;
}

function olHostDashboard(){
  OL.rerender = olHostDashboard;
  const g = state.game;
  topbar(roundLabel(), 'hintronde');
  const catLine = state.settings.chamSeesCategory ? catChip(g.cat) : '<span class="chip">❓ categorie geheim</span>';
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      <div class="card center">
        <p style="margin-bottom:8px">${catLine}</p>
        <p>👉 <b>${esc(g.starter)}</b> begint met een hint, daarna om de beurt</p>
        <p class="soft small">💬 Eén woord per hint · 🗳️ stem daarna wie de chameleon is</p>
      </div>
      <div class="card">
        <p class="label">Rol bekeken</p>
        ${OL.players.map((p, i) => `
          <div class="prow">
            <span class="ava" style="background:${olAva(i)}">${esc(p.name.charAt(0).toUpperCase())}</span>
            <span class="pname">${esc(p.name)}</span>
            <span>${p.seen ? '✅' : '⏳'}</span>
          </div>`).join('')}
      </div>
      <button class="btn big" id="reveal">Onthulling 🎭</button>
      <button class="btn subtle" id="close">✕ Kamer sluiten</button>
    </div>`;
  $('#reveal').onclick = olHostRevealRoles;
  $('#close').onclick = e => armConfirm(e.currentTarget, olClose);
}

function olHostRevealRoles(){
  OL.rerender = null;
  const g = state.game;
  const chams = g.players.filter(p => p.role === 'chameleon');
  const sals = g.players.filter(p => p.role === 'salamander');
  const t = olTopics(OL.code);
  olPub(t.all, {
    v: 1, t: 'roles',
    round: state.match.roundNo,
    chams: chams.map(p => p.name),
    sals: sals.map(p => p.name)
  }, true);
  topbar(roundLabel(), 'onthulling');
  scr.innerHTML = `
    <div class="stack">
      ${chams.length ? `
      <div class="card center">
        <p class="label red">🦎 De chameleon${chams.length > 1 ? 's' : ''}</p>
        ${chams.map(p => `<div class="revealname red">${esc(p.name)}</div>`).join('')}
      </div>` : `
      <div class="card center">
        <div class="rolemoji">🙅</div>
        <p class="label red">Er was GEEN chameleon!</p>
        <p class="soft small">Iedereen had een woord — maar niet iedereen hetzelfde…</p>
      </div>`}
      ${sals.length ? `
      <div class="card center">
        <p class="label orange">🐸 De salamander${sals.length > 1 ? 's' : ''}</p>
        ${sals.map(p => `<div class="revealname orange">${esc(p.name)}</div>`).join('')}
      </div>` : ''}
      <div class="card center">
        <h2 class="h2">🗳️ ${chams.length ? (chams.length > 1 ? 'Zijn de chameleons ontmaskerd?' : 'Is de chameleon ontmaskerd?') : 'Hebben jullie een salamander weggestemd?'}</h2>
        <p class="soft small" style="margin-top:6px">Iedereen ziet dit nu ook op z'n eigen scherm</p>
      </div>
      <button class="btn big" id="yes">Ja, gepakt! 🎯</button>
      <button class="btn secondary" id="no">Nee, ontsnapt! 🏃</button>
    </div>`;
  const next = () => (state.settings.wordGuess && chams.length) ? olHostGuessIntro() : olHostWordReveal(false);
  $('#yes').onclick = () => { g.caught = true; next(); };
  $('#no').onclick = () => { g.caught = false; next(); };
}

function olHostGuessIntro(){
  const g = state.game;
  topbar(roundLabel(), 'woord raden');
  const chams = g.players.filter(p => p.role === 'chameleon');
  const names = chams.map(p => esc(p.name)).join(' & ');
  scr.innerHTML = `
    <div class="stack center">
      <div class="card">
        <div class="rolemoji">🤔</div>
        <h2 class="h2">${names} mag nu het woord raden</h2>
        <p class="soft" style="margin-top:8px">Hardop zeggen — goed geraden = <b>+1 punt</b>!</p>
      </div>
      <button class="btn big" id="b">Toon het woord 🔍</button>
    </div>`;
  $('#b').onclick = () => olHostWordReveal(true);
}

function olHostWordReveal(judge){
  const g = state.game;
  topbar(roundLabel(), 'het woord');
  const chams = g.players.filter(p => p.role === 'chameleon');
  const sals = g.players.filter(p => p.role === 'salamander');
  let judgeBlock = '';
  if(judge && chams.length === 1){
    judgeBlock = `
      <div class="card center"><h2 class="h2">Had ${esc(chams[0].name)} het goed?</h2></div>
      <button class="btn big" id="gyes">Ja, goed geraden! 🎯</button>
      <button class="btn secondary" id="gno">Nee, fout 🙅</button>`;
  } else if(judge){
    judgeBlock = `
      <div class="card">
        <p class="label">Wie raadde het woord goed?</p>
        ${chams.map(p => `
          <div class="srow guessrow" data-n="${esc(p.name)}" style="cursor:pointer">
            <span>${esc(p.name)}</span><span class="switch"></span>
          </div>`).join('')}
      </div>
      <button class="btn big" id="go">Naar de punten ➜</button>`;
  } else {
    judgeBlock = '<button class="btn big" id="go">Naar de punten ➜</button>';
  }
  scr.innerHTML = `
    <div class="stack">
      <div class="card center">
        <p style="margin-bottom:10px">${catChip(g.cat)}</p>
        <p class="soft">Het woord was</p>
        <div class="bigword pop">${esc(g.word)}</div>
        <p class="soft small">Nog even alleen op jouw scherm — bij de punten ziet iedereen het</p>
      </div>
      ${sals.length ? `
      <div class="card">
        <p class="label orange">De salamander${sals.length > 1 ? 's dachten' : ' dacht'}…</p>
        ${sals.map(p => `<p>🐸 <b>${esc(p.name)}</b> dacht dat het "<b>${esc(p.word)}</b>" was</p>`).join('')}
      </div>` : ''}
      ${judgeBlock}
    </div>`;

  if(judge && chams.length === 1){
    $('#gyes').onclick = () => { g.goodGuess = [chams[0].name]; olHostResult(); };
    $('#gno').onclick = () => { g.goodGuess = []; olHostResult(); };
  } else if(judge){
    scr.querySelectorAll('.guessrow').forEach(row => {
      row.onclick = () => row.querySelector('.switch').classList.toggle('on');
    });
    $('#go').onclick = () => {
      g.goodGuess = [...scr.querySelectorAll('.guessrow')]
        .filter(r => r.querySelector('.switch').classList.contains('on'))
        .map(r => r.dataset.n);
      olHostResult();
    };
  } else {
    g.goodGuess = [];
    $('#go').onclick = olHostResult;
  }
}

function olHostResult(){
  applyRoundScores();
  const g = state.game, m = state.match;
  const last = m.roundNo >= m.totalRounds;
  const chams = g.players.filter(p => p.role === 'chameleon').map(p => p.name);
  const sals = g.players.filter(p => p.role === 'salamander').map(p => ({ name: p.name, word: p.word }));
  const t = olTopics(OL.code);
  olPub(t.all, {
    v: 1, t: 'result',
    round: m.roundNo, totalRounds: m.totalRounds, last,
    word: g.word, cat: g.cat,
    caught: g.caught, goodGuess: g.goodGuess,
    chams, sals,
    scores: m.scores, deltas: g.deltas
  }, true);

  OL.rerender = null;
  topbar(roundLabel(), 'punten');
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      <div class="card center" style="padding:12px">
        <span class="chip">${resultChipText(g.players.some(p => p.role === 'chameleon'), g.caught)}</span>
        ${g.goodGuess.length ? '<p class="soft small" style="margin-top:6px">🔍 Woord goed geraden: +1 bonus</p>' : ''}
      </div>
      <div class="card">
        <p class="label">Tussenstand</p>
        ${olStandingsHTML(m.scores, g.deltas)}
      </div>
      <button class="btn big" id="next">${last ? 'Bekijk de eindstand 🏆' : 'Volgende ronde ➜'}</button>
      <button class="btn subtle" id="close">✕ Kamer sluiten</button>
    </div>`;
  $('#next').onclick = () => {
    if(last){ olHostFinal(); }
    else {
      m.roundNo++;
      OL.rerender = null;
      olPushState();
      renderCategoryPick();
    }
  };
  $('#close').onclick = e => armConfirm(e.currentTarget, olClose);
}

function olHostFinal(){
  const m = state.match;
  const t = olTopics(OL.code);
  olPub(t.all, { v: 1, t: 'final', scores: m.scores }, true);
  OL.rerender = null;
  topbar('Eindstand', '🏆');
  const standings = Object.entries(m.scores).sort((a, b) => b[1] - a[1]);
  const top = standings.length ? standings[0][1] : 0;
  const winners = standings.filter(([, p]) => p === top).map(([n]) => n);
  scr.innerHTML = `
    <div class="stack">
      <div class="card center">
        <div class="rolemoji">🏆</div>
        <h2 class="h2">${winners.map(esc).join(' & ')} ${winners.length > 1 ? 'winnen' : 'wint'}!</h2>
        <p class="soft" style="margin-top:6px">met ${top} punt${top === 1 ? '' : 'en'}</p>
      </div>
      <div class="card">${olStandingsHTML(m.scores, null)}</div>
      <button class="btn big" id="again">Nieuw potje 🔁</button>
      <button class="btn subtle" id="close">Kamer sluiten</button>
    </div>`;
  $('#again').onclick = () => {
    m.roundNo = 1;
    Object.keys(m.scores).forEach(k => { m.scores[k] = 0; });
    OL.rerender = null;
    olPushState();
    renderCategoryPick();
  };
  $('#close').onclick = e => armConfirm(e.currentTarget, olClose);
}

// ============================================================
// SPELER
// ============================================================
function renderOnlineJoinSetup(){
  topbar('Meedoen', '🙋');
  const lastN = load('cham_online_name', '');
  const lastC = load('cham_online_code', '');
  scr.innerHTML = `
    <div class="stack">
      <div class="card">
        <p class="label">Kamercode</p>
        <input id="jcode" maxlength="5" value="${esc(lastC)}" placeholder="ABC12" autocomplete="off" autocapitalize="characters" class="codeinput" style="width:100%">
      </div>
      <div class="card">
        <p class="label">Jouw naam</p>
        <input id="jname" maxlength="14" value="${esc(lastN)}" placeholder="Naam…" autocomplete="off" enterkeyhint="done" style="width:100%">
      </div>
      <button class="btn big" id="go">Meedoen 🙋</button>
      <button class="btn subtle" id="back">← Terug</button>
    </div>`;
  $('#jcode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
  const go = () => {
    const code = $('#jcode').value.trim();
    const name = $('#jname').value.trim();
    if(code.length < 4){ flash('Vul de kamercode in'); $('#jcode').focus(); return; }
    if(!name){ flash('Vul je naam in'); $('#jname').focus(); return; }
    save('cham_online_name', name);
    save('cham_online_code', code);
    olJoin(code, name);
  };
  $('#go').onclick = go;
  $('#jname').addEventListener('keydown', e => { if(e.key === 'Enter') go(); });
  $('#back').onclick = renderOnlineMenu;
}

function olJoin(code, name){
  OL = { role: 'player', code, name, pid: olId(), screen: 'wait',
         roomPlayers: [], roomPhase: 'lobby', meta: null, myRole: null,
         rolesInfo: null, result: null, final: null, gotState: false,
         offline: false, rerender: null, client: null, subs: [] };
  state.online = OL;
  olRenderConnecting('Kamer ' + code + ' zoeken…');
  olConnect(client => {
    const t = olTopics(code);
    olSetup(client, [t.state, t.all, t.p(OL.pid)], olPlayerMessage);
    olPub(t.join, { v: 1, t: 'join', name, pid: OL.pid }, false);
    OL.findTimer = setTimeout(() => {
      if(OL && OL.role === 'player' && !OL.gotState){
        olRenderError('Geen kamer gevonden met code ' + code + '. Klopt de code, en staat de kamer nog open?');
      }
    }, 8000);
    olPlayerWait();
  }, olRenderError);
}

function olPlayerMessage(topic, msg, buf){
  if(!OL || OL.role !== 'player') return;
  const t = olTopics(OL.code);

  if(topic === t.state){
    if(msg === null && buf && buf.length === 0){
      if(OL.gotState) olRenderClosed(); // lege retained = kamer opgeruimd
      return;
    }
    if(!msg || msg.t !== 'state') return;
    OL.gotState = true;
    clearTimeout(OL.findTimer);
    OL.roomPlayers = msg.players || [];
    OL.roomPhase = msg.phase;
    if(OL.screen === 'wait') olPlayerWait();
    return;
  }

  if(topic === t.p(OL.pid)){
    if(!msg) return;
    if(msg.t === 'error'){
      flash(msg.msg || 'Er ging iets mis');
      if(OL.client){ try{ OL.client.end(true); }catch(e){} }
      OL = null; state.online = null;
      renderOnlineJoinSetup();
      return;
    }
    if(msg.t === 'role'){
      OL.myRole = msg;
      if(OL.final) return;
      if(OL.result && OL.result.round === msg.round) return; // uitslag al binnen
      if(OL.rolesInfo && OL.rolesInfo.round === msg.round){ olPlayerRoles(); return; }
      olPlayerRole();
    }
    return;
  }

  if(topic === t.all){
    if(!msg) return;
    if(msg.t === 'closed'){ olRenderClosed(); return; }
    if(msg.t === 'round'){
      OL.meta = msg;
      OL.final = null; // nieuw potje in dezelfde kamer
      if(OL.result && OL.result.round !== msg.round) OL.result = null;
      if(OL.rolesInfo && OL.rolesInfo.round !== msg.round) OL.rolesInfo = null;
      if(OL.myRole && OL.myRole.round !== msg.round) OL.myRole = null;
      if(OL.result){ olPlayerResult(); return; }
      if(OL.rolesInfo){ olPlayerRoles(); return; }
      if(OL.myRole){ olPlayerRole(); return; }
      olPlayerWaitRole(msg);
      return;
    }
    if(msg.t === 'roles'){
      OL.rolesInfo = msg;
      if(OL.final) return;
      if(OL.result && OL.result.round === msg.round) return;
      olPlayerRoles();
      return;
    }
    if(msg.t === 'result'){
      OL.result = msg;
      if(OL.final) return;
      olPlayerResult();
      return;
    }
    if(msg.t === 'final'){
      OL.final = msg;
      olPlayerFinal();
      return;
    }
  }
}

function olPlayerWait(){
  OL.screen = 'wait';
  OL.rerender = olPlayerWait;
  topbar('Online kamer', OL.code);
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      <div class="card center">
        <div class="rolemoji">🛋️</div>
        <h2 class="h2">Je zit in kamer ${OL.code}</h2>
        <p class="soft" style="margin-top:6px">${OL.gotState ? 'Wachten tot de host start…' : 'Kamer zoeken…'}</p>
      </div>
      <div class="card">
        <p class="label">Spelers (${OL.roomPlayers.length})</p>
        ${OL.roomPlayers.length ? OL.roomPlayers.map((n, i) => `
          <div class="prow">
            <span class="ava" style="background:${olAva(i)}">${esc(String(n).charAt(0).toUpperCase())}</span>
            <span class="pname">${esc(n)}${n === OL.name ? ' <span class="soft small">(jij)</span>' : ''}</span>
          </div>`).join('') : '<p class="soft small">Nog even geduld…</p>'}
      </div>
      <button class="btn subtle" id="leave">✕ Kamer verlaten</button>
    </div>`;
  $('#leave').onclick = e => armConfirm(e.currentTarget, olClose);
}

function olPlayerWaitRole(meta){
  OL.screen = 'waitrole';
  OL.rerender = null;
  topbar('Ronde ' + meta.round + '/' + meta.totalRounds, OL.code);
  scr.innerHTML = `
    <div class="stack center">
      <div class="card">
        <div class="rolemoji pulse">🎲</div>
        <h2 class="h2">Ronde ${meta.round} is gestart!</h2>
        <p class="soft" style="margin-top:8px">Je geheime rol is onderweg…</p>
      </div>
    </div>`;
}

function olPlayerRole(){
  OL.screen = 'role';
  OL.rerender = olPlayerRole;
  const r = OL.myRole;
  topbar('Ronde ' + r.round + '/' + r.totalRounds, OL.code);
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      <div id="hold" class="holdzone">
        <div class="holdhint">
          <div class="rolemoji">🤫</div>
          <p class="soft"><b>Houd ingedrukt</b><br>om je geheime rol te zien</p>
        </div>
        <div class="holdcontent hidden" id="rolecard"></div>
      </div>
      <p class="soft center small" id="seenmark">&nbsp;</p>
      <div class="card">
        <p>👉 <b>${esc(r.starter)}</b> begint met een hint</p>
        <p>💬 Eén woord per hint, daarna stemmen</p>
        <p class="soft small">⏳ De host start straks de onthulling…</p>
      </div>
      <button class="btn subtle" id="leave">✕ Kamer verlaten</button>
    </div>`;

  const hold = $('#hold');
  const card = $('#rolecard');
  const hint = hold.querySelector('.holdhint');
  let seen = false;
  const fill = () => {
    if(r.role === 'chameleon'){
      const catLine = r.cat ? catChip(r.cat) : '<span class="chip">❓ categorie geheim</span>';
      card.innerHTML = `
        <div class="pop">
          <div class="rolemoji">🦎</div>
          <p class="soft">Ssst… jij bent</p>
          <div class="bigword red">de CHAMELEON!</div>
          <p style="margin:10px 0">${catLine}</p>
          <p class="soft">Doe alsof je het woord kent 😏</p>
        </div>`;
    } else {
      card.innerHTML = `
        <div class="pop">
          <p style="margin-bottom:10px">${catChip(r.cat)}</p>
          <p class="soft">Het geheime woord is</p>
          <div class="bigword">${esc(r.word)}</div>
          <p class="soft">Verklap het niet letterlijk 😉</p>
        </div>`;
    }
  };
  const show = e => {
    e.preventDefault();
    hint.classList.add('hidden');
    card.classList.remove('hidden');
    hold.classList.add('active');
    fill();
    if(!seen){
      seen = true;
      olPub(olTopics(OL.code).ack, { v: 1, t: 'seen', pid: OL.pid, round: r.round }, false);
      $('#seenmark').textContent = 'Rol bekeken ✓';
    }
  };
  const hide = () => {
    card.classList.add('hidden');
    hint.classList.remove('hidden');
    hold.classList.remove('active');
  };
  hold.addEventListener('pointerdown', show);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => hold.addEventListener(ev, hide));
  hold.addEventListener('contextmenu', e => e.preventDefault());
  $('#leave').onclick = e => armConfirm(e.currentTarget, olClose);
}

function olPlayerRoles(){
  OL.screen = 'roles';
  OL.rerender = olPlayerRoles;
  const info = OL.rolesInfo;
  topbar('Ronde ' + info.round + (OL.meta ? '/' + OL.meta.totalRounds : ''), 'onthulling');
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      ${info.chams.length ? `
      <div class="card center">
        <p class="label red">🦎 De chameleon${info.chams.length > 1 ? 's' : ''}</p>
        ${info.chams.map(n => `<div class="revealname red">${esc(n)}</div>`).join('')}
      </div>` : `
      <div class="card center">
        <div class="rolemoji">🙅</div>
        <p class="label red">Er was GEEN chameleon!</p>
        <p class="soft small">Iedereen had een woord — maar niet iedereen hetzelfde…</p>
      </div>`}
      ${info.sals && info.sals.length ? `
      <div class="card center">
        <p class="label orange">🐸 De salamander${info.sals.length > 1 ? 's' : ''}</p>
        ${info.sals.map(n => `<div class="revealname orange">${esc(n)}</div>`).join('')}
      </div>` : ''}
      <div class="card center">
        <p class="soft pulse">👀 De host vult de uitslag in…</p>
      </div>
    </div>`;
}

function olPlayerResult(){
  OL.screen = 'result';
  OL.rerender = olPlayerResult;
  const r = OL.result;
  topbar('Ronde ' + r.round + '/' + r.totalRounds, 'punten');
  scr.innerHTML = `
    <div class="stack">
      ${olStatusChip()}
      <div class="card center">
        <p style="margin-bottom:10px">${catChip(r.cat)}</p>
        <p class="soft">Het woord was</p>
        <div class="bigword pop">${esc(r.word)}</div>
      </div>
      <div class="card center" style="padding:12px">
        <span class="chip">${resultChipText(!!(r.chams && r.chams.length), r.caught)}</span>
        ${r.goodGuess && r.goodGuess.length ? '<p class="soft small" style="margin-top:6px">🔍 Woord goed geraden: +1 bonus</p>' : ''}
      </div>
      ${r.sals && r.sals.length ? `
      <div class="card">
        <p class="label orange">De salamander${r.sals.length > 1 ? 's dachten' : ' dacht'}…</p>
        ${r.sals.map(s => `<p>🐸 <b>${esc(s.name)}</b> dacht dat het "<b>${esc(s.word)}</b>" was</p>`).join('')}
      </div>` : ''}
      <div class="card">
        <p class="label">Tussenstand</p>
        ${olStandingsHTML(r.scores, r.deltas)}
      </div>
      <div class="card center">
        <p class="soft pulse">${r.last ? '🏁 Laatste ronde — de eindstand komt eraan…' : '⏳ Wachten op de volgende ronde…'}</p>
      </div>
      <button class="btn subtle" id="leave">✕ Kamer verlaten</button>
    </div>`;
  $('#leave').onclick = e => armConfirm(e.currentTarget, olClose);
}

function olPlayerFinal(){
  OL.screen = 'final';
  OL.rerender = olPlayerFinal;
  const scores = OL.final.scores || {};
  const standings = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = standings.length ? standings[0][1] : 0;
  const winners = standings.filter(([, p]) => p === top).map(([n]) => n);
  topbar('Eindstand', '🏆');
  scr.innerHTML = `
    <div class="stack">
      <div class="card center">
        <div class="rolemoji">🏆</div>
        <h2 class="h2">${winners.map(esc).join(' & ')} ${winners.length > 1 ? 'winnen' : 'wint'}!</h2>
        <p class="soft" style="margin-top:6px">met ${top} punt${top === 1 ? '' : 'en'}</p>
      </div>
      <div class="card">${olStandingsHTML(scores, null)}</div>
      <div class="card center">
        <p class="soft small">De host kan een nieuw potje starten in dezelfde kamer — blijf dan gewoon hier.</p>
      </div>
      <button class="btn subtle" id="leave">✕ Kamer verlaten</button>
    </div>`;
  $('#leave').onclick = e => armConfirm(e.currentTarget, olClose);
}
