'use strict';
// ============================================================
// CHAMELEON — doorgeef-editie
// ============================================================

const APP_VERSION = '1.0.0';

// ---------- helpers ----------
const $ = sel => document.querySelector(sel);
const scr = document.getElementById('screen');

function load(key, fallback){
  try{ const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
  catch(e){ return fallback; }
}
function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }
function shuffle(a){
  const arr = a.slice();
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function pick(a){ return a[Math.floor(Math.random() * a.length)]; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function topbar(l, r){ $('#tb-left').textContent = l; $('#tb-right').textContent = r || ''; }
function flash(msg){
  const t = $('#toast');
  t.textContent = '> ' + msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2400);
}
// destructieve acties: twee keer tikken
function armConfirm(btn, action){
  if(btn.dataset.armed === '1'){ btn.dataset.armed = ''; action(); return; }
  btn.dataset.armed = '1';
  const old = btn.innerHTML;
  btn.innerHTML = '[ ZEKER? TIK NOGMAALS ]';
  setTimeout(() => {
    if(btn.isConnected && btn.dataset.armed === '1'){ btn.dataset.armed = ''; btn.innerHTML = old; }
  }, 2500);
}

// scramble/decrypt-effect voor woorden
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function scrambleInto(el, text){
  if(!el) return;
  if(REDUCED){ el.textContent = text; return; }
  const chars = '█▓▒░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&';
  let frame = 0;
  const total = 14;
  clearInterval(el._t);
  el._t = setInterval(() => {
    frame++;
    const settled = Math.floor((frame / total) * text.length);
    let out = '';
    for(let i = 0; i < text.length; i++){
      out += (i < settled || text[i] === ' ') ? text[i] : chars[Math.floor(Math.random() * chars.length)];
    }
    el.textContent = out;
    if(frame >= total){ clearInterval(el._t); el.textContent = text; }
  }, 28);
}

// ---------- state ----------
const state = {
  players: load('cham_players', []), // array van namen (volgorde = doorgeefvolgorde)
  settings: Object.assign(
    { chameleons: 1, salamanders: 0, chamSeesCategory: true, disabledCats: [] },
    load('cham_settings', {})
  ),
  game: null,
  usedWords: {} // per sessie: voorkomt herhaling van woorden
};

function persistSettings(){ save('cham_settings', state.settings); }
function persistPlayers(){ save('cham_players', state.players); }
function enabledCategories(){
  return Object.keys(WORDS).filter(c =>
    !state.settings.disabledCats.includes(c) && Array.isArray(WORDS[c]) && WORDS[c].length > 1
  );
}

// ---------- spel starten ----------
function startGame(){
  const n = state.players.length;
  const { chameleons, salamanders } = state.settings;

  if(n < 3){ flash('MINIMAAL 3 SPELERS NODIG'); renderPlayers(); return; }
  if(chameleons + salamanders > n - 2){
    flash('MAX ' + (n - 2) + ' SPECIALE ROLLEN BIJ ' + n + ' SPELERS');
    renderSettings(); return;
  }
  const cats = enabledCategories();
  if(cats.length === 0){ flash('ZET MINSTENS 1 CATEGORIE AAN'); renderSettings(); return; }

  // categorie + geheim woord (zonder sessie-herhaling)
  const cat = pick(cats);
  let used = state.usedWords[cat] || [];
  let pool = WORDS[cat].filter(w => !used.includes(w));
  if(pool.length === 0){ used = []; pool = WORDS[cat].slice(); }
  const word = pick(pool);
  state.usedWords[cat] = used.concat([word]);

  // rollen verdelen
  const roles = new Array(n).fill('speler');
  const order = shuffle([...Array(n).keys()]);
  let k = 0;
  for(let i = 0; i < chameleons; i++) roles[order[k++]] = 'chameleon';

  // salamanders: elk een eigen ánder woord uit dezelfde categorie
  const altPool = shuffle(WORDS[cat].filter(w => w !== word));
  const salWordByIndex = {};
  for(let i = 0; i < salamanders; i++){
    const idx = order[k++];
    roles[idx] = 'salamander';
    salWordByIndex[idx] = altPool[i % altPool.length];
  }

  state.game = {
    cat, word,
    players: state.players.map((name, i) => ({
      name,
      role: roles[i],
      word: roles[i] === 'chameleon' ? null
          : roles[i] === 'salamander' ? salWordByIndex[i]
          : word
    })),
    idx: 0,
    starter: pick(state.players),
    round: state.game ? state.game.round + 1 : 1
  };
  renderPass();
}

// ---------- schermen ----------
function renderHome(){
  state.game = null;
  topbar('CHAMELEON', 'v' + APP_VERSION);
  const n = state.players.length;
  const cats = Object.keys(WORDS).length;
  const total = Object.values(WORDS).reduce((a, w) => a + w.length, 0);
  const pad = (s, len) => (s + ' ').padEnd(len, '.');
  scr.innerHTML = `
    <div class="stack">
      <div class="hero">
        <div class="herotitle">&gt; CHAMELEON<span class="cursor">█</span></div>
        <p class="dim">// doorgeef-editie</p>
      </div>
      <div class="panel boot">
        <p>&gt; ${pad('systeem geladen', 22)} <b>OK</b></p>
        <p>&gt; ${pad('categorieën', 22)} <b>${cats}</b></p>
        <p>&gt; ${pad('woorden', 22)} <b>${total}</b></p>
        <p>&gt; ${pad('spelers klaar', 22)} <b>${n}</b></p>
      </div>
      <button class="btn big" id="start">[ ▶ NIEUW SPEL ]</button>
      <button class="btn" id="players">[ SPELERS (${n}) ]</button>
      <button class="btn" id="settings">[ INSTELLINGEN ]</button>
    </div>`;
  $('#start').onclick = startGame;
  $('#players').onclick = renderPlayers;
  $('#settings').onclick = renderSettings;
}

function renderPlayers(){
  topbar('SPELERS', state.players.length + '');
  scr.innerHTML = `
    <div class="stack">
      <div class="panel" id="plist">
        ${state.players.length
          ? state.players.map((name, i) => `
            <div class="prow">
              <span class="dim">${String(i + 1).padStart(2, '0')}</span>
              <span class="pname">${esc(name)}</span>
              <button class="del" data-i="${i}" aria-label="verwijder ${esc(name)}">[x]</button>
            </div>`).join('')
          : '<p class="dim">&gt; nog geen spelers…</p>'}
      </div>
      <div class="addrow">
        <span class="dim">&gt;</span>
        <input id="pname" maxlength="14" placeholder="naam" autocomplete="off" enterkeyhint="done">
        <button class="btn slim" id="add" style="width:auto">[+]</button>
      </div>
      <p class="dim">// volgorde in de lijst = doorgeefvolgorde</p>
      <button class="btn ghost" id="back">[ ← TERUG ]</button>
    </div>`;

  const input = $('#pname');
  const add = () => {
    const name = input.value.trim();
    if(!name){ input.focus(); return; }
    if(state.players.some(p => p.toLowerCase() === name.toLowerCase())){
      flash('DIE NAAM BESTAAT AL'); input.select(); return;
    }
    state.players.push(name);
    persistPlayers();
    renderPlayers();
    $('#pname').focus();
  };
  $('#add').onclick = add;
  input.addEventListener('keydown', e => { if(e.key === 'Enter') add(); });
  $('#plist').addEventListener('click', e => {
    const btn = e.target.closest('.del');
    if(!btn) return;
    state.players.splice(Number(btn.dataset.i), 1);
    persistPlayers();
    renderPlayers();
  });
  $('#back').onclick = renderHome;
}

function renderSettings(){
  const s = state.settings;
  const n = state.players.length;
  topbar('INSTELLINGEN', '');
  const cats = Object.keys(WORDS);
  const enabledCount = cats.filter(c => !s.disabledCats.includes(c)).length;
  scr.innerHTML = `
    <div class="stack">
      <div class="panel">
        <p class="cardtag">Rollen</p>
        <div class="srow"><span>CHAMELEONS</span>
          <span class="stepper">
            <button data-k="chameleons" data-d="-1">[−]</button><b>${s.chameleons}</b><button data-k="chameleons" data-d="1">[+]</button>
          </span>
        </div>
        <div class="srow"><span>SALAMANDERS</span>
          <span class="stepper">
            <button data-k="salamanders" data-d="-1">[−]</button><b>${s.salamanders}</b><button data-k="salamanders" data-d="1">[+]</button>
          </span>
        </div>
        <p class="dim">// salamander krijgt een ánder woord — zonder het te weten</p>
        <p class="dim">// max samen: spelers − 2${n >= 3 ? ' (nu: ' + (n - 2) + ')' : ''}</p>
      </div>
      <div class="panel">
        <div class="srow" id="catvis" style="cursor:pointer">
          <span>CHAMELEON ZIET CATEGORIE</span><b>${s.chamSeesCategory ? '[AAN]' : '[UIT]'}</b>
        </div>
        <p class="dim">// uit = hard mode: chameleon kent ook de categorie niet</p>
      </div>
      <div class="panel" id="catlist">
        <p class="cardtag">Categorieën (${enabledCount}/${cats.length})</p>
        ${cats.map(c => {
          const on = !s.disabledCats.includes(c);
          return `<div class="srow cat" data-c="${esc(c)}">
            <span>${on ? '[x]' : '[&nbsp;]'} ${esc(c.toUpperCase())}</span>
            <span class="dim">${WORDS[c].length}</span>
          </div>`;
        }).join('')}
        <div class="two">
          <button class="btn slim" id="allon">[ ALLES AAN ]</button>
          <button class="btn slim" id="alloff">[ ALLES UIT ]</button>
        </div>
      </div>
      <button class="btn ghost" id="back">[ ← TERUG ]</button>
    </div>`;

  scr.querySelectorAll('.stepper button').forEach(btn => {
    btn.onclick = () => {
      const k = btn.dataset.k, d = Number(btn.dataset.d);
      const min = k === 'chameleons' ? 1 : 0;
      s[k] = Math.min(6, Math.max(min, s[k] + d));
      persistSettings();
      renderSettings();
    };
  });
  $('#catvis').onclick = () => { s.chamSeesCategory = !s.chamSeesCategory; persistSettings(); renderSettings(); };
  $('#catlist').addEventListener('click', e => {
    const row = e.target.closest('.cat');
    if(!row) return;
    const c = row.dataset.c;
    const i = s.disabledCats.indexOf(c);
    if(i >= 0) s.disabledCats.splice(i, 1); else s.disabledCats.push(c);
    persistSettings();
    renderSettings();
  });
  $('#allon').onclick = () => { s.disabledCats = []; persistSettings(); renderSettings(); };
  $('#alloff').onclick = () => { s.disabledCats = Object.keys(WORDS).slice(); persistSettings(); renderSettings(); };
  $('#back').onclick = renderHome;
}

function renderPass(){
  const g = state.game;
  const p = g.players[g.idx];
  topbar('RONDE ' + g.round, 'SPELER ' + (g.idx + 1) + '/' + g.players.length);
  scr.innerHTML = `
    <div class="stack center">
      <p class="dim" style="margin-top:20px">&gt; geef de telefoon aan</p>
      <h1 class="passname">${esc(p.name)}</h1>
      <button class="btn big" id="me">[ IK BEN ${esc(p.name.toUpperCase())} ]</button>
      <button class="btn ghost" id="abort">[ ✕ RONDE AFBREKEN ]</button>
    </div>`;
  $('#me').onclick = renderRole;
  $('#abort').onclick = e => armConfirm(e.currentTarget, renderHome);
}

function fillRoleCard(card, p, g){
  const catText = esc(g.cat.toUpperCase());
  if(p.role === 'chameleon'){
    const catLine = state.settings.chamSeesCategory
      ? 'CATEGORIE: ' + catText
      : 'CATEGORIE: ▓▓▓▓▓▓▓▓';
    card.innerHTML = `
      <p class="cardtag red">!! geheime rol !!</p>
      <div class="bigword red" id="w"></div>
      <p class="cardline">${catLine}</p>
      <p class="dim">&gt; doe alsof je het woord kent</p>`;
    scrambleInto(card.querySelector('#w'), 'CHAMELEON');
  } else {
    // gewone speler én salamander: exact hetzelfde scherm
    card.innerHTML = `
      <p class="cardtag">categorie: ${catText}</p>
      <p class="cardline">HET GEHEIME WOORD:</p>
      <div class="bigword" id="w"></div>
      <p class="dim">&gt; verklap het niet letterlijk</p>`;
    scrambleInto(card.querySelector('#w'), p.word.toUpperCase());
  }
}

function renderRole(){
  const g = state.game;
  const p = g.players[g.idx];
  topbar('RONDE ' + g.round, 'SPELER ' + (g.idx + 1) + '/' + g.players.length);
  scr.innerHTML = `
    <div class="stack">
      <p class="dim">&gt; ingelogd als</p>
      <h2 class="passname" style="font-size:clamp(24px,8vw,34px)">${esc(p.name)}</h2>
      <div id="hold" class="holdzone">
        <div class="holdhint">
          <div class="lock">▓▓ VERGRENDELD ▓▓</div>
          <p>houd ingedrukt om je<br>geheime rol te zien</p>
        </div>
        <div class="holdcontent hidden" id="rolecard"></div>
      </div>
      <p class="dim center" id="seenmark">&nbsp;</p>
      <button class="btn big" id="nextbtn" disabled>[ VERBERG &amp; GEEF DOOR → ]</button>
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
    fillRoleCard(card, p, g);
    if(!seen){
      seen = true;
      $('#nextbtn').disabled = false;
      $('#seenmark').textContent = '> rol bekeken ✓';
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

  $('#nextbtn').onclick = () => {
    g.idx++;
    if(g.idx < g.players.length) renderPass(); else renderDiscussion();
  };
}

function renderDiscussion(){
  const g = state.game;
  topbar('RONDE ' + g.round, 'HINTRONDE');
  const catLine = state.settings.chamSeesCategory
    ? 'CATEGORIE: <b>' + esc(g.cat.toUpperCase()) + '</b>'
    : 'CATEGORIE: <b>GEHEIM</b> <span class="dim">(hard mode)</span>';
  scr.innerHTML = `
    <div class="stack">
      <div class="panel">
        <p class="cardtag">alle rollen uitgedeeld</p>
        <p class="cardline">${catLine}</p>
      </div>
      <div class="panel">
        <p>&gt; <b>${esc(g.starter)}</b> begint met een hint</p>
        <p>&gt; daarna met de klok mee</p>
        <p>&gt; iedereen geeft één woord als hint</p>
        <p>&gt; overleg en stem: wie is de chameleon?</p>
      </div>
      <button class="btn big" id="reveal">[ ONTHULLING ]</button>
      <button class="btn ghost" id="abort">[ ✕ STOP, NAAR HOME ]</button>
    </div>`;
  $('#reveal').onclick = () => renderReveal(0);
  $('#abort').onclick = e => armConfirm(e.currentTarget, renderHome);
}

function renderReveal(stage){
  const g = state.game;
  topbar('RONDE ' + g.round, 'ONTHULLING');
  const chams = g.players.filter(p => p.role === 'chameleon');
  const sals = g.players.filter(p => p.role === 'salamander');

  if(stage === 0){
    scr.innerHTML = `
      <div class="stack center">
        <div class="panel">
          <p class="cardtag">⚠ iedereen mag nu meekijken</p>
          <p class="dim">eerst gestemd? dan pas onthullen!</p>
        </div>
        <button class="btn big" id="b">[ ONTHUL DE ROLLEN ]</button>
        <button class="btn ghost" id="back">[ ← TERUG ]</button>
      </div>`;
    $('#b').onclick = () => renderReveal(1);
    $('#back').onclick = renderDiscussion;

  } else if(stage === 1){
    scr.innerHTML = `
      <div class="stack">
        <div class="panel">
          <p class="cardtag red">chameleon${chams.length > 1 ? 's' : ''}:</p>
          ${chams.map(p => `<div class="revealname red">${esc(p.name)}</div>`).join('')}
        </div>
        ${sals.length ? `
        <div class="panel">
          <p class="cardtag amber">salamander${sals.length > 1 ? 's' : ''}:</p>
          ${sals.map(p => `<div class="revealname amber">${esc(p.name)}</div>`).join('')}
        </div>` : ''}
        <p class="dim">&gt; gepakt? de chameleon mag het woord nu raden!</p>
        <button class="btn big" id="b">[ ONTHUL HET WOORD ]</button>
      </div>`;
    $('#b').onclick = () => renderReveal(2);

  } else {
    scr.innerHTML = `
      <div class="stack">
        <div class="panel center">
          <p class="cardtag">categorie: ${esc(g.cat.toUpperCase())}</p>
          <p class="cardline">HET WOORD WAS:</p>
          <div class="bigword" id="w"></div>
        </div>
        ${sals.length ? `
        <div class="panel">
          ${sals.map(p => `<p class="cardline amber">&gt; ${esc(p.name)} dacht dat het "<b>${esc(p.word)}</b>" was</p>`).join('')}
        </div>` : ''}
        <button class="btn big" id="again">[ ▶ NIEUWE RONDE ]</button>
        <button class="btn ghost" id="home">[ HOME ]</button>
      </div>`;
    scrambleInto($('#w'), g.word.toUpperCase());
    $('#again').onclick = startGame;
    $('#home').onclick = renderHome;
  }
}

// ---------- init ----------
renderHome();

if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
