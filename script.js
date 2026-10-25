/* ==========================================================================
   script.js — logique du site-surprise (aucune donnée perso ici : tout est dans config.js)
   ========================================================================== */
(() => {                                                                  // fonction isolée : nos variables ne fuient pas
  'use strict';                                                           // mode strict : erreurs plus claires

  /* ───── 0. OUTILS ───── */
  const C = (typeof CONFIG !== 'undefined' && CONFIG) || {};              // réglages personnels (config.js ; « const » n'est pas sur window)
  const T = C.textes || {};                                               // petits textes personnalisables
  const $ = (s, r = document) => r.querySelector(s);                      // raccourci : un élément
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));      // raccourci : liste d'éléments
  const wait = ms => new Promise(r => setTimeout(r, ms));                 // pause asynchrone
  const rand = (a, b) => a + Math.random() * (b - a);                     // nombre aléatoire entre a et b
  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)'); // préférence « réduire les animations »
  const reduced = () => mqReduced.matches;                                // vrai si l'utilisateur veut moins d'animations
  const hasGsap = () => typeof window.gsap !== 'undefined';               // GSAP chargé ? (sinon solution de repli)
  const live = $('#live');                                                // zone d'annonce pour lecteurs d'écran
  const say = msg => { live.textContent = ''; setTimeout(() => { live.textContent = msg; }, 40); }; // annonce un message
  const HEART_D = 'M50 88C20 68 4 50 4 31C4 17 15 7 28 7C38 7 46 13 50 22C54 13 62 7 72 7C85 7 96 17 96 31C96 50 80 68 50 88Z'; // tracé du cœur (repère 100×100)
  const vibrate = p => { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* vibration indisponible */ } }; // vibration sûre

  const EASES = {                                                         // courbes CSS équivalentes aux eases GSAP
    'power2.out': 'cubic-bezier(.22,.61,.36,1)',                          // décélération douce
    'power2.in': 'cubic-bezier(.55,0,1,.45)',                             // accélération
    'back.out(1.7)': 'cubic-bezier(.34,1.56,.64,1)',                      // petit rebond
    'back.out(1.4)': 'cubic-bezier(.34,1.4,.64,1)'                        // rebond léger
  };                                                                      // fin des courbes
  const toCss = p => {                                                    // convertit {x,y,rotation,scale,opacity} en CSS
    const t = [];                                                         // morceaux de transform
    if (p.x != null) t.push(`translateX(${p.x}px)`);                      // déplacement horizontal
    if (p.y != null) t.push(`translateY(${p.y}px)`);                      // déplacement vertical
    if (p.rotation != null) t.push(`rotate(${p.rotation}deg)`);           // rotation
    if (p.scale != null) t.push(`scale(${p.scale})`);                     // échelle
    const o = {};                                                         // image-clé CSS
    if (t.length) o.transform = t.join(' ');                              // transform assemblé
    if (p.opacity != null) o.opacity = p.opacity;                         // opacité
    return o;                                                             // renvoie l'image-clé
  };                                                                      // fin toCss
  function fx(el, from, to, o = {}) {                                     // anime un élément (GSAP ou repli natif)
    const dur = reduced() ? 0.001 : (o.duration ?? 0.5);                  // durée (quasi nulle si mouvement réduit)
    const delay = reduced() ? 0 : (o.delay || 0);                         // délai
    const ease = o.ease || 'power2.out';                                  // courbe
    if (hasGsap()) {                                                      // avec GSAP…
      return new Promise(res => window.gsap.fromTo(el, from, { ...to, duration: dur, delay, ease, overwrite: 'auto', onComplete: res })); // …tween GSAP
    }                                                                     // fin GSAP
    const a = el.animate([toCss(from), toCss(to)], { duration: dur * 1000, delay: delay * 1000, easing: EASES[ease] || 'ease-out', fill: 'both' }); // repli : Web Animations API
    return a.finished.then(() => { try { a.commitStyles(); } catch (e) { /* élément caché */ } a.cancel(); }).catch(() => {}); // garde l'état final en style inline
  }                                                                       // fin fx

  /* ───── 1. PARTICULES CŒURS ───── */
  const HEART_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#m-heart"/></svg>'; // cœur réutilisable
  const COLORS = ['#f9a8c4', '#ef7fa8', '#b3262e', '#ffd1e1', '#a9c08f']; // palette des cœurs
  function makeHeart(x, y, size, color) {                                 // crée un cœur positionné
    const h = document.createElement('span');                             // conteneur
    h.className = 'fx-heart';                                             // style « particule »
    h.innerHTML = HEART_SVG;                                              // dessin du cœur
    h.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px;color:${color}`; // taille, position, couleur
    document.body.appendChild(h);                                         // ajout à la page
    return h;                                                             // renvoie le cœur
  }                                                                       // fin makeHeart
  function burst(x, y, n = 18, o = {}) {                                  // explosion de cœurs depuis (x, y)
    const count = reduced() ? Math.min(5, n) : n;                         // moins de cœurs si mouvement réduit
    for (let i = 0; i < count; i++) {                                     // pour chaque cœur
      const h = makeHeart(x, y, rand(14, 30), COLORS[i % COLORS.length]); // nouveau cœur
      const ang = o.up ? rand(-Math.PI * .9, -Math.PI * .1) : rand(0, Math.PI * 2); // direction (vers le haut ou partout)
      const dist = rand(70, o.spread || 220);                             // distance parcourue
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;         // déplacement final
      const rot = rand(-60, 60);                                          // rotation finale
      const a = h.animate([                                               // trajectoire
        { transform: 'translate(0,0) scale(.3)', opacity: 1 },            // départ petit
        { transform: `translate(${dx * .75}px,${dy * .75}px) scale(1) rotate(${rot / 2}deg)`, opacity: 1, offset: .6 }, // vol
        { transform: `translate(${dx}px,${dy + 90}px) scale(.8) rotate(${rot}deg)`, opacity: 0 } // retombe et disparaît
      ], { duration: reduced() ? 300 : rand(900, 1600), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }); // réglages
      a.onfinish = () => h.remove();                                      // nettoyage
    }                                                                     // fin boucle
  }                                                                       // fin burst
  function rise(n = 20) {                                                 // cœurs qui montent depuis le bas de l'écran
    const count = reduced() ? 4 : n;                                      // quantité
    const W = window.innerWidth, H = window.innerHeight;                  // taille de l'écran
    for (let i = 0; i < count; i++) {                                     // pour chaque cœur
      const h = makeHeart(rand(10, W - 10), H + 30, rand(14, 34), COLORS[i % COLORS.length]); // cœur sous l'écran
      const sway = rand(-60, 60);                                         // balancement latéral
      const a = h.animate([                                               // montée
        { transform: 'translate(0,0)', opacity: 0 },                      // invisible au départ
        { transform: `translate(${sway}px,${-H * .5}px)`, opacity: 1, offset: .4 }, // à mi-hauteur
        { transform: `translate(${-sway}px,${-H - 80}px)`, opacity: 0 }   // sort par le haut
      ], { duration: reduced() ? 400 : rand(2600, 4600), delay: reduced() ? 0 : rand(0, 1400), easing: 'ease-out', fill: 'both' }); // réglages
      a.onfinish = () => h.remove();                                      // nettoyage
    }                                                                     // fin boucle
  }                                                                       // fin rise

  /* ───── 2. TEXTES ET PHOTOS DEPUIS config.js ───── */
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); // lit « a.b.0 » dans un objet
  $$('[data-t]').forEach(el => {                                          // pour chaque texte personnalisable
    const v = getPath(T, el.dataset.t);                                   // valeur dans CONFIG.textes
    if (typeof v === 'string' && v) el.textContent = v;                   // remplace (textContent = sans risque d'injection)
  });                                                                     // fin textes
  $$('[data-c]').forEach(el => {                                          // pour chaque valeur de premier niveau
    const v = C[el.dataset.c];                                            // valeur dans CONFIG
    if (typeof v === 'string' && v) el.textContent = v;                   // remplace
  });                                                                     // fin valeurs
  const P = C.photos || {};                                               // photos de config.js
  const DEFAULT_MEDIA = {                                                 // fichiers d'origine (ceux du site)
    couple: P.couple || '',                                               // polaroid
    pochette: P.pochette || P.couple || '',                               // pochette du lecteur (sinon photo du couple)
    booth: [0, 1, 2, 3].map(i => (P.booth || [])[i] || ''),               // 4 photos photobooth
    gratter: P.gratter || '',                                             // photo secrète
    audio: C.fichierAudio || ''                                           // chanson
  };                                                                      // fin des fichiers d'origine
  const media = JSON.parse(JSON.stringify(DEFAULT_MEDIA));                // fichiers utilisés en ce moment (modifiables à l'accueil)
  let visitorName = '';                                                   // prénom saisi à l'accueil
  function applyMedia() {                                                 // affiche les photos actuelles partout
    $$('img[data-photo]').forEach(img => {                                // pour chaque image du site
      const src = getPath(media, img.dataset.photo);                      // chemin ou adresse blob
      if (typeof src === 'string' && src) { if (img.getAttribute('src') !== src) img.src = src; } // charge la photo si elle a changé
      else img.removeAttribute('src');                                    // pas de photo → fond rose de secours
    });                                                                   // fin boucle
  }                                                                       // fin applyMedia
  $$('img[data-photo]').forEach(img => img.addEventListener('error', () => img.removeAttribute('src'))); // fichier introuvable → fond rose de secours
  applyMedia();                                                           // premier affichage

  /* ───── 3. NAVIGATION ENTRE LES ÉTAPES ───── */
  const BG = { 9: 'check', 8: 'sky', 0: 'sky', 1: 'sky', 2: 'sky', 3: 'sky', 4: 'sky', 5: 'check', 6: 'sage', 7: 'sage' }; // fond de chaque étape
  const onEnter = {};                                                     // actions à lancer en arrivant sur une étape
  let current = -1;                                                       // étape affichée (-1 = aucune)
  let busy = false;                                                       // transition en cours ?
  async function goTo(n) {                                                // passe à l'étape n
    if (busy || n === current) return;                                    // évite les doubles clics
    busy = true;                                                          // verrou
    const from = current >= 0 ? $(`.step[data-step="${current}"]`) : null; // écran qui part
    const to = $(`.step[data-step="${n}"]`);                              // écran qui arrive
    document.body.dataset.bg = BG[n];                                     // change le fond (fondu CSS)
    if (from) {                                                           // s'il y a un écran à quitter
      await fx(from, { opacity: 1, y: 0 }, { opacity: 0, y: -26 }, { duration: .4, ease: 'power2.in' }); // glisse vers le haut et s'efface
      from.hidden = true;                                                 // le cache
    }                                                                     // fin sortie
    to.hidden = false;                                                    // affiche le nouvel écran
    current = n;                                                          // mémorise
    window.scrollTo(0, 0);                                                // remonte en haut
    const h = $('[data-focus]', to);                                      // titre de l'écran
    if (h) h.focus({ preventScroll: true });                              // focus pour clavier / lecteur d'écran
    if (onEnter[n]) onEnter[n]();                                         // lance l'action de l'étape
    await fx(to, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, { duration: .6 }); // glisse depuis le bas
    busy = false;                                                         // déverrouille
  }                                                                       // fin goTo
  $$('[data-next]').forEach(b => b.addEventListener('click', () => goTo(Number(b.dataset.next)))); // boutons « Continue ♡ »

  /* ───── 4. EFFET SIGNATURE : HTML BRUT → CSS QUI S'ALLUME ───── */
  const html = document.documentElement;                                  // balise <html>
  const app = $('#app');                                                  // application
  const raw = $('#raw');                                                  // bloc HTML brut
  const css = $('#mainCss');                                              // feuille de style principale
  let lit = false;                                                        // CSS déjà allumé ?
  let rawTimer = 0;                                                       // minuterie de l'effet
  const cssReady = () => new Promise(res => {                             // attend que style.css soit chargé
    if (window.__cssOk) return res();                                     // déjà chargé
    css.addEventListener('load', res, { once: true });                    // sinon on attend l'événement
    setTimeout(res, 2500);                                                // sécurité : on n'attend jamais plus de 2,5 s
  });                                                                     // fin cssReady
  async function lightUp() {                                              // allume le CSS
    if (lit) return;                                                      // une seule fois
    lit = true;                                                           // verrou
    clearTimeout(rawTimer);                                               // annule la minuterie
    css.media = 'all';                                                    // active la feuille de style
    await cssReady();                                                     // attend qu'elle soit prête
    html.classList.remove('is-raw');                                      // fin de la phase brute
    html.classList.add('is-styled');                                      // phase stylée
    raw.hidden = true;                                                    // cache le bloc brut
    app.hidden = false;                                                   // affiche l'application
    await startJourney();                                                 // accueil (prénom / perso) ou directement l'étape 1
    fx(app, { opacity: 0, scale: .96, y: 12 }, { opacity: 1, scale: 1, y: 0 }, { duration: .8, ease: 'back.out(1.7)' }); // fondu + petit rebond
  }                                                                       // fin lightUp
  if (html.classList.contains('is-raw')) {                                // effet actif
    rawTimer = setTimeout(lightUp, Number(C.dureeHtmlBrut) || 1500);      // allume après 1,5 s
    $$('[data-raw]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); lightUp(); })); // ou tout de suite si on clique
  } else {                                                                // effet désactivé (ou Replay)
    lightUp();                                                            // allume immédiatement
  }                                                                       // fin effet

  /* ───── 5. ÉTAPE 1 : LA BOÎTE ───── */
  const gift = $('#gift');                                                // la boîte
  let giftOpen = false;                                                   // déjà ouverte ?
  gift.addEventListener('click', async () => {                            // au clic
    if (giftOpen) return;                                                 // une seule fois
    giftOpen = true;                                                      // verrou
    gift.classList.add('is-shaking');                                     // la boîte tremble
    await wait(reduced() ? 50 : 620);                                     // pendant le tremblement
    gift.classList.remove('is-shaking');                                  // fin du tremblement
    gift.classList.add('is-open');                                        // le couvercle s'ouvre
    vibrate(30);                                                          // petite vibration
    const r = gift.getBoundingClientRect();                               // position de la boîte
    burst(r.left + r.width / 2, r.top + r.height * .35, 26, { up: true, spread: 260 }); // les cœurs s'envolent
    say('La boîte est ouverte !');                                              // annonce
    await wait(reduced() ? 300 : 1350);                                   // on profite du spectacle
    goTo(2);                                                              // étape 2
  });                                                                     // fin clic boîte

  /* ───── 6. ÉTAPE 2 : BOUTON « NO » FUYARD ───── */
  const yesBtn = $('#yesBtn');                                            // bouton oui
  const noBtn = $('#noBtn');                                              // bouton non
  const errStack = $('#errStack');                                        // pile d'erreurs
  const DX = [-58, 52, -34, 70];                                          // décalages horizontaux des fenêtres d'erreur
  let tries = 0, converted = false, lastDodge = 0, offX = 0, offY = 0;    // état du bouton fuyard
  yesBtn.addEventListener('click', () => goTo(3));                        // « Yes » → étape 3
  function addError(i) {                                                  // ajoute une fenêtre « System error »
    const w = document.createElement('div');                              // fenêtre
    w.className = 'win win-err';                                          // style fenêtre d'erreur
    w.style.setProperty('--i', i);                                        // rang dans la pile
    w.style.setProperty('--dx', DX[(i - 1) % DX.length] + 'px');          // décalage latéral
    w.innerHTML = '<div class="titlebar"><span class="tb-title"></span><span class="tb-btns"><i>✕</i></span></div>' + // barre de titre
      '<div class="err-body"><span class="err-icon"><svg viewBox="0 0 5 9"><use href="#m-excl"/></svg></span><p></p>' + // icône + texte
      '<button type="button" class="btn btn-ok" tabindex="-1">OK</button></div>'; // bouton OK
    $('.tb-title', w).textContent = T.titreErreur || 'Erreur système';  // titre (depuis config.js)
    $('p', w).textContent = T.erreurSysteme || 'Erreur ♡';                 // message (depuis config.js)
    $('.btn-ok', w).addEventListener('click', () => w.remove());          // OK ferme la fenêtre
    errStack.appendChild(w);                                              // empile derrière la fenêtre principale
    fx(w, { opacity: 0, scale: .7 }, { opacity: 1, scale: 1 }, { duration: .35, ease: 'back.out(1.7)' }); // apparition
    say(T.titreErreur || 'Erreur système');                                                  // annonce
  }                                                                       // fin addError
  function convert() {                                                    // 5e essai : « No » devient « Yes »
    converted = true;                                                     // plus de fuite
    noBtn.textContent = T.oui || 'Oui, stp !';                             // nouveau texte
    noBtn.classList.replace('btn-no', 'btn-yes');                         // devient vert
    const r = noBtn.getBoundingClientRect();                              // position
    burst(r.left + r.width / 2, r.top + r.height / 2, 12);                // petits cœurs
    say('Non est devenu Oui !');                                                // annonce
  }                                                                       // fin convert
  function dodge(px, py) {                                                // le bouton s'échappe du point (px, py)
    if (converted) return;                                                // plus de fuite après conversion
    const now = Date.now();                                               // heure actuelle
    if (now - lastDodge < 280) return;                                    // anti-rafale
    lastDodge = now;                                                      // mémorise
    tries++;                                                              // un essai de plus
    if (tries >= 5) { convert(); return; }                                // 5e essai → conversion
    addError(tries);                                                      // fenêtre d'erreur (1 à 4)
    const b = noBtn.getBoundingClientRect();                              // position actuelle
    const natL = b.left - offX, natT = b.top - offY;                      // position d'origine (sans décalage)
    const vw = document.documentElement.clientWidth, vh = window.innerHeight; // taille visible
    const minX = 10, maxX = vw - b.width - 10;                            // bornes horizontales
    const minY = Math.max(10, vh * .12), maxY = vh - b.height - 10;       // bornes verticales
    const yr = yesBtn.getBoundingClientRect();                            // position du bouton oui (à ne pas cacher)
    let tx = natL, ty = natT;                                             // cible
    for (let k = 0; k < 30; k++) {                                        // cherche une bonne place
      tx = rand(minX, maxX); ty = rand(minY, maxY);                       // place au hasard
      const far = Math.hypot(tx + b.width / 2 - px, ty + b.height / 2 - py) > 150; // loin du doigt / curseur
      const overYes = tx < yr.right + 8 && tx + b.width > yr.left - 8 && ty < yr.bottom + 8 && ty + b.height > yr.top - 8; // chevauche « Yes » ?
      if (far && !overYes) break;                                         // place trouvée
    }                                                                     // fin recherche
    const fromX = offX, fromY = offY;                                     // ancien décalage
    offX = tx - natL; offY = ty - natT;                                   // nouveau décalage
    fx(noBtn, { x: fromX, y: fromY }, { x: offX, y: offY }, { duration: .35, ease: 'back.out(1.4)' }); // saut
  }                                                                       // fin dodge
  noBtn.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') dodge(e.clientX, e.clientY); }); // souris : fuit dès le survol
  noBtn.addEventListener('pointerdown', e => { if (converted) return; e.preventDefault(); dodge(e.clientX, e.clientY); }); // doigt : fuit au toucher
  noBtn.addEventListener('click', e => {                                  // clic (ou Entrée au clavier)
    if (converted) { goTo(3); return; }                                   // converti → étape 3
    if (e.detail === 0) { const r = noBtn.getBoundingClientRect(); dodge(r.left + r.width / 2, r.top + r.height / 2); } // clavier : fuit aussi
  });                                                                     // fin clic non

  /* ───── 7. ÉTAPE 3 : DATE SECRÈTE + PAVÉ NUMÉRIQUE ───── */
  const ORDER = ['dd', 'mm', 'yyyy'];                                     // ordre de saisie (format français JJ / MM / AAAA)
  const MAX = { mm: 2, dd: 2, yyyy: 4 };                                  // longueur de chaque champ
  const dateState = { mm: '', dd: '', yyyy: '' };                         // valeurs saisies
  const fieldEls = { mm: $('#fMM'), dd: $('#fDD'), yyyy: $('#fYYYY') };   // éléments des champs
  const dateWin = $('#dateWin');                                          // fenêtre
  const dateMsg = $('#dateMsg');                                          // message
  let activeF = ORDER[0];                                                     // champ actif
  let unlocked = false;                                                   // date trouvée ?
  function renderDate() {                                                 // met à jour l'affichage
    ORDER.forEach(k => {                                                  // pour chaque champ
      const el = fieldEls[k], v = dateState[k];                           // élément + valeur
      $('.df-val', el).textContent = v || el.dataset.ph;                  // valeur ou placeholder
      el.classList.toggle('is-empty', !v);                                // style vide
      el.classList.toggle('is-active', k === activeF);                    // style actif
      el.setAttribute('aria-current', k === activeF ? 'true' : 'false');  // champ actif pour l'accessibilité
    });                                                                   // fin boucle
  }                                                                       // fin renderDate
  const nextField = () => { const i = ORDER.indexOf(activeF); return i < ORDER.length - 1 ? ORDER[i + 1] : null; }; // champ suivant
  function press(k) {                                                     // appui sur une touche
    if (unlocked) return;                                                 // plus rien après réussite
    if (k === 'C') {                                                      // C = tout effacer
      ORDER.forEach(f => { dateState[f] = ''; });                         // vide
      activeF = ORDER[0];                                                   // retour au jour
    } else if (k === 'back') {                                            // ⌫ = effacer un chiffre
      if (!dateState[activeF]) { const i = ORDER.indexOf(activeF); if (i > 0) activeF = ORDER[i - 1]; } // champ vide → champ précédent
      dateState[activeF] = dateState[activeF].slice(0, -1);               // retire le dernier chiffre
    } else {                                                              // un chiffre
      if (dateState[activeF].length >= MAX[activeF]) {                    // champ plein
        const nf = nextField(); if (!nf) return; activeF = nf;            // passe au suivant (ou ignore)
      }                                                                   // fin champ plein
      dateState[activeF] += k;                                            // ajoute le chiffre
      if (dateState[activeF].length === MAX[activeF]) { const nf = nextField(); if (nf) activeF = nf; } // avance automatiquement
    }                                                                     // fin types de touches
    dateMsg.textContent = '';                                             // efface le message
    dateMsg.classList.remove('ok');                                       // style neutre
    renderDate();                                                         // rafraîchit
  }                                                                       // fin press
  async function checkDate() {                                            // vérifie la date
    if (unlocked) return;                                                 // déjà trouvée
    const dd = Number(dateState.dd), mm = Number(dateState.mm), yy = dateState.yyyy; // valeurs saisies
    const year = yy.length === 4 ? Number(yy) : 2000;                     // année (2000 = bissextile, pour accepter le 29/02 sans année)
    const real = dateState.dd !== '' && dateState.mm !== ''               // jour et mois remplis
      && mm >= 1 && mm <= 12                                              // mois de 1 à 12
      && dd >= 1 && dd <= new Date(year, mm, 0).getDate()                 // jour qui existe dans ce mois (pas de 31/02)
      && (yy === '' || (yy.length === 4 && year >= 1900 && year <= new Date().getFullYear())); // année facultative mais plausible
    let ok = real;                                                        // par défaut : toute date valide passe (ex. date d'anniversaire)
    if (C.toutesLesDates === false) {                                     // mode « une seule date secrète »
      const [d, m, y] = String(C.dateSecrete || '').split(/[^0-9]+/).filter(Boolean).map(Number); // "17-10" → jour 17, mois 10
      ok = real && dd === d && mm === m && (!y || year === y);            // bonne date (et bonne année si exigée)
    }                                                                     // fin mode date secrète
    if (!ok) {                                                            // date refusée
      dateWin.classList.remove('shake');                                  // relance l'animation…
      void dateWin.offsetWidth;                                           // …(force le recalcul)
      dateWin.classList.add('shake');                                     // la fenêtre tremble
      dateMsg.textContent = real ? (T.erreurDate || 'Presque… réessaie ♡') : (T.dateInvalide || 'Cette date n’existe pas… réessaie ♡'); // message mignon
      vibrate([40, 40, 40]);                                              // petite vibration
      return;                                                             // on s'arrête là
    }                                                                     // fin mauvaise date
    unlocked = true;                                                      // réussite
    dateMsg.textContent = T.bonneDate || 'Oui ! ♡';                        // message
    dateMsg.classList.add('ok');                                          // style vert
    const r = dateWin.getBoundingClientRect();                            // position fenêtre
    burst(r.left + r.width / 2, r.top + r.height / 2, 40, { spread: 320 }); // confettis de cœurs
    rise(16);                                                             // + pluie montante
    vibrate([30, 50, 80]);                                                // vibration joyeuse
    await wait(reduced() ? 400 : 1600);                                   // on savoure
    goTo(4);                                                              // étape 4
  }                                                                       // fin checkDate
  $$('.key').forEach(b => b.addEventListener('click', () => press(b.dataset.k))); // touches du pavé
  Object.entries(fieldEls).forEach(([k, el]) => el.addEventListener('click', () => { activeF = k; renderDate(); })); // clic sur un champ = le sélectionner
  $('#unlockBtn').addEventListener('click', checkDate);                   // bouton « Unlock »
  document.addEventListener('keydown', e => {                             // clavier physique (desktop)
    if (current !== 3) return;                                            // seulement sur l'étape 3
    if (/^[0-9]$/.test(e.key)) { press(e.key); e.preventDefault(); }      // chiffres
    else if (e.key === 'Backspace') { press('back'); e.preventDefault(); } // retour arrière
    else if (e.key === 'Delete' || e.key === 'Escape') press('C');        // tout effacer
    else if (e.key === 'Enter' && !e.target.closest('button, a')) checkDate(); // Entrée = valider (sauf sur un bouton)
  });                                                                     // fin clavier
  renderDate();                                                           // affichage initial

  /* ───── 8. ÉTAPE 4 : SCRAPBOOK + MUSIQUE ───── */
  function torn(el, depth = 2.2, step = 4) {                              // bords de papier déchiré (clip-path)
    const pts = [];                                                       // points du polygone
    for (let x = 0; x <= 100; x += step) pts.push(`${x}% ${rand(0, depth)}%`); // bord haut
    for (let y = step; y <= 100; y += step) pts.push(`${100 - rand(0, depth)}% ${y}%`); // bord droit
    for (let x = 100 - step; x >= 0; x -= step) pts.push(`${x}% ${100 - rand(0, depth)}%`); // bord bas
    for (let y = 100 - step; y > 0; y -= step) pts.push(`${rand(0, depth)}% ${y}%`); // bord gauche
    el.style.clipPath = `polygon(${pts.join(',')})`;                      // applique
  }                                                                       // fin torn
  $$('.torn').forEach(el => torn(el, el.classList.contains('bit') ? 8 : 1.6, el.classList.contains('bit') ? 10 : 3)); // déchire papier + morceaux

  const Synth = (() => {                                                  // petite boîte à musique (si pas de fichier audio)
    let ctx = null, master = null, timer = 0, on = false, t0 = 0;         // état audio
    const beat = .3;                                                      // durée d'une note (s)
    const mel = [76, 79, 84, 79, 81, 79, 76, 72, 74, 77, 81, 77, 79, 76, 74, 71, 72, 76, 79, 76, 81, 84, 83, 79, 77, 76, 74, 72, 74, 71, 72, 0]; // mélodie originale (MIDI)
    const bass = [48, 53, 55, 52, 48, 53, 55, 48];                        // basse (une note toutes les 4 notes)
    const LEN = mel.length * beat;                                        // durée d'une boucle
    const freq = m => 440 * Math.pow(2, (m - 69) / 12);                   // MIDI → fréquence
    function tone(f, at, dur, vol, type) {                                // joue une note
      const o = ctx.createOscillator(), g = ctx.createGain();             // oscillateur + volume
      o.type = type; o.frequency.value = f;                               // timbre + hauteur
      g.gain.setValueAtTime(.0001, at);                                   // silence
      g.gain.exponentialRampToValueAtTime(vol, at + .015);                // attaque rapide
      g.gain.exponentialRampToValueAtTime(.0001, at + dur);               // extinction douce
      o.connect(g); g.connect(master);                                    // branchements
      o.start(at); o.stop(at + dur + .05);                                // début / fin
    }                                                                     // fin tone
    function loop() {                                                     // programme une boucle
      if (!on) return;                                                    // arrêté ?
      const s = ctx.currentTime + .06;                                    // début de boucle
      t0 = s;                                                             // mémorise pour la progression
      mel.forEach((m, i) => { if (m) { tone(freq(m), s + i * beat, 1.1, .16, 'triangle'); tone(freq(m + 12), s + i * beat, .5, .035, 'sine'); } }); // mélodie + scintillement
      bass.forEach((m, i) => tone(freq(m), s + i * 4 * beat, 4 * beat * 1.1, .07, 'sine')); // basse
      timer = setTimeout(loop, LEN * 1000 - 60);                          // boucle suivante
    }                                                                     // fin loop
    return {                                                              // interface publique
      start() {                                                           // démarre
        const AC = window.AudioContext || window.webkitAudioContext;      // Web Audio
        if (!AC) return false;                                            // non supporté
        if (!ctx) ctx = new AC();                                         // crée le contexte (après un geste)
        ctx.resume();                                                     // réveille
        master = ctx.createGain(); master.gain.value = .8;                // volume général
        master.connect(ctx.destination);                                  // vers les haut-parleurs
        on = true; loop();                                                // c'est parti
        return true;                                                      // ok
      },                                                                  // fin start
      stop() {                                                            // arrête
        on = false; clearTimeout(timer);                                  // plus de boucles
        if (master) { const m = master; m.gain.setTargetAtTime(0, ctx.currentTime, .05); setTimeout(() => m.disconnect(), 400); } // fondu de sortie
      },                                                                  // fin stop
      progress() { return on && ctx ? Math.max(0, Math.min(1, (ctx.currentTime - t0) / LEN)) : 0; }, // avancement 0..1
      length: LEN                                                         // durée de boucle
    };                                                                    // fin interface
  })();                                                                   // fin Synth

  const scrap = $('#scrap');                                              // collage
  const playBtn = $('#playBtn');                                          // bouton lecture
  const songBar = $('#songBar');                                          // barre de progression
  const songTime = $('#songTime');                                        // temps affiché
  const audioHint = $('#audioHint');                                      // info audio
  const musicStage = $('#musicStage');                                    // scène de l'écran musique (étape 8)
  const musicPlay = $('#musicPlay');                                      // bouton lecture de l'écran musique
  const musicBar = $('#musicBar');                                        // barre de l'écran musique
  const musicBarWrap = $('#musicBarWrap');                                // rail de la barre (curseur accessible)
  const musicTime = $('#musicTime');                                      // temps écoulé
  const musicDur = $('#musicDur');                                        // durée totale
  let onTime = null;                                                      // fonction appelée à chaque image (paroles)
  let audio = null;                                                      // lecteur audio
  let useSynth = true;                                                    // boîte à musique tant qu'il n'y a pas de fichier
  let playing = false;                                                    // en lecture ?
  function setSong(url) {                                                 // choisit la chanson (config.js ou fichier perso)
    if (audio) { audio.pause(); audio = null; }                           // oublie l'ancien lecteur
    if (playing) { Synth.stop(); setPlaying(false); }                     // arrête une lecture en cours
    useSynth = !url;                                                      // pas de fichier → boîte à musique
    if (!url) return;                                                     // rien d'autre à faire
    audio = new Audio();                                                  // lecteur
    audio.preload = 'none';                                               // ne télécharge rien avant le clic
    audio.src = url;                                                      // chemin ou adresse blob
    audio.addEventListener('ended', () => setPlaying(false));             // fin du morceau
    audio.addEventListener('loadedmetadata', () => paint());              // durée connue → affichage
  }                                                                       // fin setSong
  setSong(DEFAULT_MEDIA.audio);                                           // chanson de config.js au départ
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; // secondes → m:ss
  function setPlaying(p) {                                                // met à jour l'état lecture
    playing = p;                                                          // mémorise
    playBtn.setAttribute('aria-pressed', String(p));                      // accessibilité
    playBtn.setAttribute('aria-label', p ? 'Mettre la chanson en pause' : 'Lancer la chanson'); // libellé
    $('.ico', playBtn).textContent = p ? '❚❚' : '▶';                      // icône
    scrap.classList.toggle('is-playing', p);                              // vinyle + bobines tournent
    musicPlay.setAttribute('aria-pressed', String(p));                    // écran musique : accessibilité
    musicPlay.setAttribute('aria-label', p ? 'Mettre la chanson en pause' : 'Lancer la chanson'); // libellé
    $('.ico', musicPlay).textContent = p ? '❚❚' : '▶';                    // icône
    musicStage.classList.toggle('is-playing', p);                         // disque qui tourne + notes
    if (p) requestAnimationFrame(tick);                                   // lance la barre de progression
  }                                                                       // fin setPlaying
  function songPos() {                                                    // position actuelle { secs, dur }
    if (useSynth) return { secs: Synth.progress() * Synth.length, dur: Synth.length }; // boîte à musique
    if (audio && audio.duration) return { secs: audio.currentTime, dur: audio.duration }; // fichier audio
    return { secs: 0, dur: 0 };                                           // pas encore chargé
  }                                                                       // fin songPos
  function paint() {                                                      // dessine barres + temps + paroles
    const { secs, dur } = songPos();                                      // position
    const pct = dur ? (secs / dur * 100) : 0;                             // pourcentage
    songBar.style.width = musicBar.style.width = pct.toFixed(1) + '%';    // barres (scrapbook + écran musique)
    songTime.textContent = musicTime.textContent = fmt(secs);             // temps écoulé
    musicDur.textContent = dur ? fmt(dur) : '--:--';                      // durée
    musicBarWrap.setAttribute('aria-valuenow', String(Math.round(pct)));  // accessibilité
    if (onTime) onTime(secs);                                             // paroles / mots doux
  }                                                                       // fin paint
  function tick() {                                                       // progression à chaque image
    if (!playing) return;                                                 // arrêté
    paint();                                                              // dessine
    requestAnimationFrame(tick);                                          // image suivante
  }                                                                       // fin tick
  function startSynth(info) {                                             // bascule sur la boîte à musique
    useSynth = true;                                                      // mode synthé
    if (Synth.start()) setPlaying(true);                                  // joue
    if (info) { audioHint.textContent = info; audioHint.hidden = false; } // explique pourquoi
  }                                                                       // fin startSynth
  async function togglePlay(forcePlay) {                                  // lecture / pause (l'audio ne démarre qu'après un geste)
    if (playing) {                                                        // déjà en lecture
      if (forcePlay === true) return;                                     // on voulait juste « jouer » : rien à faire
      if (useSynth) Synth.stop(); else audio.pause();                     // arrête la source
      setPlaying(false);                                                  // état
      return;                                                             // fin
    }                                                                     // fin pause
    if (useSynth) { startSynth(); return; }                               // boîte à musique
    try { await audio.play(); setPlaying(true); }                         // joue le fichier
    catch (err) {                                                         // lecture refusée
      if (err && err.name === 'NotAllowedError') return;                 // navigateur qui attend un toucher : on laisse le bouton ▶
      startSynth('Fichier audio introuvable : petite boîte à musique à la place ♡'); // fichier absent → repli
    }                                                                     // fin erreur
  }                                                                       // fin togglePlay
  playBtn.addEventListener('click', () => togglePlay());                  // ▶ du scrapbook

  /* ───── 9. ÉTAPE 5 : PHOTOBOOTH ───── */
  const booth = $('#booth');                                              // scène
  const photos = $$('.bphoto', booth);                                    // 4 photos
  const slots = $$('.slot', booth);                                       // 4 emplacements
  let arranged = false, boothTimer = 0;                                   // état
  function arrange() {                                                    // range les photos en bande
    if (arranged) return;                                                 // une seule fois
    arranged = true;                                                      // verrou
    clearTimeout(boothTimer);                                             // annule la minuterie
    booth.classList.add('is-arranged');                                   // affiche la bande
    photos.forEach((p, i) => {                                            // pour chaque photo (technique FLIP)
      const f = p.getBoundingClientRect();                                // position de départ
      const fw = p.offsetWidth;                                           // largeur de départ (sans rotation)
      const r0 = parseFloat(getComputedStyle(p).getPropertyValue('--r')) || 0; // inclinaison de départ
      slots[i].appendChild(p);                                            // déplace dans l'emplacement
      p.classList.add('in-slot');                                         // style « rangée »
      if (hasGsap()) window.gsap.set(p, { clearProps: 'transform' }); else p.style.transform = ''; // retire l'inclinaison inline avant de mesurer
      const l = p.getBoundingClientRect();                                // position d'arrivée
      const dx = (f.left + f.width / 2) - (l.left + l.width / 2);         // écart horizontal (centres)
      const dy = (f.top + f.height / 2) - (l.top + l.height / 2);         // écart vertical
      fx(p, { x: dx, y: dy, scale: fw / l.width, rotation: r0 }, { x: 0, y: 0, scale: 1, rotation: 0 }, { duration: .85, delay: .15 + i * .18, ease: 'back.out(1.4)' }); // vol vers la bande
    });                                                                   // fin boucle
    setTimeout(() => {                                                    // après l'animation
      const nb = $('#boothNext');                                         // bouton continuer
      nb.hidden = false;                                                  // l'affiche
      fx(nb, { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, { duration: .4 }); // apparition
      say('La bande photomaton est prête');                                      // annonce
    }, reduced() ? 50 : 1700);                                            // délai
  }                                                                       // fin arrange
  booth.addEventListener('click', arrange);                               // clic n'importe où → rangement
  onEnter[5] = () => {                                                    // en arrivant sur l'étape 5
    if (!arranged) {                                                      // pas encore rangées
      photos.forEach((p, i) => {                                          // chaque photo tombe sur la table
        const r0 = parseFloat(p.style.getPropertyValue('--r')) || 0;      // inclinaison
        fx(p, { opacity: 0, y: -50, rotation: r0 - 12 }, { opacity: 1, y: 0, rotation: r0 }, { duration: .5, delay: .2 + i * .12, ease: 'back.out(1.4)' }); // chute
      });                                                                 // fin boucle
      boothTimer = setTimeout(arrange, 2600);                             // rangement automatique après ~2 s
    }                                                                     // fin si
  };                                                                      // fin onEnter 5

  /* ───── 10. ÉTAPE 6 : CARTE À GRATTER ───── */
  const zone = $('#scratchZone');                                         // zone
  const cv = $('#scratchCanvas');                                         // canvas
  const cx = cv.getContext('2d', { willReadFrequently: true });           // contexte 2D (lecture fréquente des pixels)
  const scratchPhoto = $('#scratchPhoto');                                // photo cachée
  const heartMask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${HEART_D}'/></svg>`)}")`; // masque cœur
  scratchPhoto.style.webkitMaskImage = heartMask;                         // photo découpée en cœur (Safari)
  scratchPhoto.style.maskImage = heartMask;                               // photo découpée en cœur
  let total = 0, revealed = false, down = false, lastP = null, moves = 0, sized = 0; // état du grattage
  function drawCover(w) {                                                 // dessine le grand cœur rose
    const s = w / 100;                                                    // échelle repère 100 → pixels CSS
    const p = new Path2D(HEART_D);                                        // tracé du cœur
    cx.save();                                                            // sauvegarde
    cx.scale(s, s);                                                       // passe dans le repère 100×100
    const g = cx.createLinearGradient(0, 0, 100, 100);                    // dégradé rose
    g.addColorStop(0, '#ffc6da'); g.addColorStop(.55, '#f9a8c4'); g.addColorStop(1, '#ef7fa8'); // couleurs
    cx.fillStyle = g; cx.fill(p);                                         // remplit le cœur
    cx.clip(p);                                                           // limite la suite au cœur
    for (let i = 0; i < 60; i++) {                                        // paillettes
      cx.fillStyle = `rgba(255,255,255,${rand(.35, .8).toFixed(2)})`;     // blanc translucide
      cx.beginPath(); cx.arc(rand(5, 95), rand(8, 88), rand(.4, 1.2), 0, Math.PI * 2); cx.fill(); // petit point
    }                                                                     // fin paillettes
    cx.fillStyle = '#fff';                                                // texte blanc
    cx.font = '9px "Patrick Hand", cursive';                              // police manuscrite
    cx.textAlign = 'center'; cx.textBaseline = 'middle';                  // centré
    cx.fillText(T.gratteMoi || 'gratte-moi ♡', 50, 46);                                  // invitation
    cx.restore();                                                         // restaure
    cx.save(); cx.scale(s, s);                                            // contour
    cx.lineWidth = 1.6; cx.strokeStyle = 'rgba(107,74,58,.55)'; cx.stroke(p); // liseré marron
    cx.restore();                                                         // restaure
  }                                                                       // fin drawCover
  function opaqueCount() {                                                // compte les pixels encore couverts
    const d = cx.getImageData(0, 0, cv.width, cv.height).data;            // pixels
    let n = 0;                                                            // compteur
    for (let i = 3; i < d.length; i += 16) if (d[i] > 20) n++;            // 1 pixel sur 4, canal alpha
    return n;                                                             // résultat
  }                                                                       // fin opaqueCount
  function setupScratch() {                                               // prépare le canvas
    if (revealed) return;                                                 // déjà révélé
    const r = zone.getBoundingClientRect();                               // taille de la zone
    if (!r.width) return;                                                 // pas encore visible
    const dpr = Math.min(window.devicePixelRatio || 1, 2);                // netteté écran Retina (max ×2)
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); // résolution réelle
    sized = r.width;                                                      // mémorise la taille
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);                                // on dessine en pixels CSS
    cx.globalCompositeOperation = 'source-over';                          // mode normal
    drawCover(r.width);                                                   // dessine le cœur
    total = opaqueCount() || 1;                                           // surface initiale
  }                                                                       // fin setupScratch
  function scratchAt(x, y) {                                              // gratte au point (x, y)
    cx.globalCompositeOperation = 'destination-out';                      // dessiner = effacer
    cx.lineCap = 'round'; cx.lineJoin = 'round';                          // traits ronds
    cx.lineWidth = Math.max(26, sized * .1);                              // largeur du « doigt »
    cx.strokeStyle = '#000'; cx.fillStyle = '#000';                       // couleur opaque (seul l'alpha compte)
    cx.beginPath();                                                       // nouveau tracé
    if (lastP) { cx.moveTo(lastP.x, lastP.y); cx.lineTo(x, y); cx.stroke(); } // trait depuis le point précédent
    else { cx.arc(x, y, cx.lineWidth / 2, 0, Math.PI * 2); cx.fill(); }   // premier point : un rond
    cx.globalCompositeOperation = 'source-over';                          // retour au mode normal
    lastP = { x, y };                                                     // mémorise
    if (++moves % 6 === 0) checkProgress();                               // vérifie de temps en temps
  }                                                                       // fin scratchAt
  function checkProgress() {                                              // calcule le pourcentage gratté
    if (revealed) return;                                                 // déjà fini
    const pct = 1 - opaqueCount() / total;                                // part effacée
    if (pct >= .55) reveal();                                             // ≥ 55 % → révélation
  }                                                                       // fin checkProgress
  function reveal() {                                                     // révèle la photo
    if (revealed) return;                                                 // une seule fois
    revealed = true;                                                      // verrou
    cv.classList.add('is-gone');                                          // le reste se dissout
    vibrate([40, 60, 40]);                                                // vibration
    const r = zone.getBoundingClientRect();                               // position
    burst(r.left + r.width / 2, r.top + r.height / 2, 30, { spread: 260 }); // cœurs
    $('#revealBtn').hidden = true;                                        // cache l'alternative
    const nb = $('#scratchNext');                                         // bouton continuer
    nb.hidden = false;                                                    // l'affiche
    fx(nb, { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, { duration: .4, delay: .4 }); // apparition
    say('Secret révélé !');                                              // annonce
  }                                                                       // fin reveal
  const posIn = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }; // coordonnées locales
  cv.addEventListener('pointerdown', e => {                               // début du grattage
    if (revealed) return;                                                 // fini
    down = true; lastP = null;                                            // état
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ } // suit le doigt même hors du canvas
    const p = posIn(e); scratchAt(p.x, p.y);                              // premier coup
    e.preventDefault();                                                   // pas de sélection / défilement
  });                                                                     // fin pointerdown
  cv.addEventListener('pointermove', e => { if (down && !revealed) { const p = posIn(e); scratchAt(p.x, p.y); } }); // gratte en bougeant
  ['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, () => { down = false; lastP = null; checkProgress(); })); // fin du geste
  $('#revealBtn').addEventListener('click', reveal);                      // alternative sans grattage
  onEnter[6] = () => requestAnimationFrame(setupScratch);                 // prépare le canvas à l'arrivée
  let resizeT = 0;                                                        // anti-rafale du redimensionnement
  window.addEventListener('resize', () => {                               // rotation / redimensionnement
    clearTimeout(resizeT);                                                // annule le précédent
    resizeT = setTimeout(() => {                                          // attend la fin
      if (current === 6 && !revealed && Math.abs(zone.getBoundingClientRect().width - sized) > 2) setupScratch(); // redessine si la taille change
    }, 200);                                                              // délai
  });                                                                     // fin resize

  /* ───── 11. ÉTAPE 7 : LETTRE MACHINE À ÉCRIRE ───── */
  const letterText = $('#letterText');                                    // zone du texte
  let typing = false, skipTyping = false, typed = false;                  // état
  async function typeLetter() {                                           // écrit la lettre lettre par lettre
    if (typed) return;                                                    // une seule fois
    typed = true; typing = true; skipTyping = reduced();                  // état (mouvement réduit = tout de suite)
    const blocks = [{ t: (T.debutLettre || '{nom}, mon cœur,').replace('{nom}', visitorName || C.destinataire || 'mon cœur'), cls: 'l-greet' }] // « <prénom>, mon cœur, »
      .concat((C.lettre || []).map(t => ({ t: String(t), cls: '' })))     // paragraphes
      .concat([{ t: T.signature || 'Pour toujours à toi,', cls: 'l-sig' }, { t: C.expediteur || '', cls: 'l-name' }]); // signature
    $('#letterSr').textContent = blocks.map(b => b.t).join(' ');          // texte complet pour lecteurs d'écran
    const caret = document.createElement('span');                         // curseur clignotant
    caret.className = 'caret';                                            // style
    for (const b of blocks) {                                             // pour chaque paragraphe
      const p = document.createElement('p');                              // paragraphe
      if (b.cls) p.className = b.cls;                                     // style particulier
      const txt = document.createTextNode('');                            // texte vide
      p.append(txt, caret);                                               // texte + curseur
      letterText.appendChild(p);                                          // ajout
      for (const ch of b.t) {                                             // caractère par caractère
        if (skipTyping) { txt.data = b.t; break; }                        // saut demandé → tout d'un coup
        txt.data += ch;                                                   // ajoute le caractère
        await wait(/[.,!?…]/.test(ch) ? 230 : 34);                        // pause plus longue sur la ponctuation
      }                                                                   // fin caractères
      if (!skipTyping) await wait(280);                                   // pause entre paragraphes
    }                                                                     // fin paragraphes
    caret.remove();                                                       // retire le curseur
    typing = false;                                                       // fini
    rise(28);                                                             // cœurs qui montent
    const al = $('#afterLetter');                                         // question « Tu veux écouter notre chanson ? »
    al.hidden = false;                                                    // l'affiche
    fx(al, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, { duration: .6, ease: 'back.out(1.7)' }); // apparition
    al.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' }); // fait défiler jusqu'à la question
  }                                                                       // fin typeLetter
  $('#letter').addEventListener('click', () => { if (typing) skipTyping = true; }); // toucher la lettre = tout afficher
  onEnter[7] = () => { setTimeout(typeLetter, reduced() ? 0 : 500); };    // démarre en arrivant
  $$('.js-replay').forEach(b => b.addEventListener('click', () => {       // boutons « Recommencer »
    location.href = location.pathname + '?replay=1';                      // recharge depuis le début (sans l'effet HTML brut)
  }));                                                                    // fin rejouer
  $$('.js-change-photos').forEach(b => b.addEventListener('click', () => { // boutons « Changer les photos »
    location.href = location.pathname + '?photos=1';                      // retour à l'accueil, panneau photos ouvert
  }));                                                                    // fin changer les photos

  /* ───── 11 bis. APRÈS LA LETTRE → ÉTAPE 8 : NOTRE CHANSON ───── */
  const PAROLES = (Array.isArray(C.paroles) ? C.paroles : [])             // paroles synchronisées (config.js)
    .filter(l => l && typeof l.t === 'number' && l.texte)                 // lignes valides seulement
    .sort((a, b) => a.t - b.t);                                           // dans l'ordre du temps
  const MOTS = (Array.isArray(C.motsDoux) ? C.motsDoux : []).filter(Boolean); // mots doux de secours
  const lyPrev = $('.ly-prev'), lyNext = $('.ly-next'), lyNow = $('.ly-now'); // lignes affichées
  const lyText = $('.ly-text'), lyTrad = $('.ly-trad');                   // texte + traduction
  let lyIndex = -2;                                                       // ligne affichée (-2 = rien encore)
  function showLine(i) {                                                  // affiche la ligne i
    if (i === lyIndex) return;                                            // déjà affichée
    lyIndex = i;                                                          // mémorise
    if (PAROLES.length) {                                                 // mode paroles + traduction
      const cur = PAROLES[i];                                             // ligne actuelle
      lyPrev.textContent = i > 0 ? PAROLES[i - 1].texte : '';             // ligne d'avant
      lyText.textContent = cur ? cur.texte : '♪ ♪ ♪';                     // ligne chantée (ou intro)
      lyTrad.textContent = cur ? (cur.traduction || '') : '';             // sa traduction
      lyNext.textContent = PAROLES[i + 1] ? PAROLES[i + 1].texte : '';    // ligne d'après
    } else {                                                              // mode mots doux
      lyPrev.textContent = ''; lyNext.textContent = '';                   // pas de voisines
      lyText.textContent = MOTS.length ? MOTS[((i % MOTS.length) + MOTS.length) % MOTS.length] : '♪'; // mot doux du moment
      lyTrad.textContent = '';                                            // pas de traduction
    }                                                                     // fin modes
    fx(lyNow, { opacity: 0, y: 12, scale: .96 }, { opacity: 1, y: 0, scale: 1 }, { duration: .45, ease: 'back.out(1.4)' }); // petite apparition
  }                                                                       // fin showLine
  onTime = secs => {                                                      // appelé à chaque image pendant la musique
    if (current !== 8) return;                                            // seulement sur l’écran musique
    if (PAROLES.length) {                                                 // paroles synchronisées
      let i = -1;                                                         // aucune ligne avant la première
      while (i + 1 < PAROLES.length && PAROLES[i + 1].t <= secs + .15) i++; // dernière ligne commencée
      showLine(i);                                                        // affiche
    } else showLine(Math.floor(secs / (Number(C.dureeMotDoux) || 6)));    // un mot doux toutes les N secondes
  };                                                                      // fin onTime
  $('#mTitle').textContent = C.titreChanson || 'Notre chanson';           // titre de la chanson
  $('#mArtist').textContent = C.artiste || '';                            // artiste
  $('#musicYes').addEventListener('click', () => { togglePlay(true); goTo(8); }); // « Oui » → musique lancée TOUT DE SUITE (exigé par iPhone) + écran musique
  $('#musicNo').addEventListener('click', () => {                         // « Pas maintenant »
    const m = $('#musicNoMsg');                                           // zone de message
    m.textContent = T.reponseNonMusique || 'D’accord… je la garde au chaud pour toi 🥺♡'; // réponse mignonne
    const y = $('#musicYes');                                             // bouton oui
    y.classList.remove('wiggle'); void y.offsetWidth; y.classList.add('wiggle'); // il gigote pour donner envie
  });                                                                     // fin « non »
  onEnter[8] = () => {                                                    // en arrivant sur l'écran musique
    $('#mTitle').textContent = $('.player-title').textContent;            // même titre que le lecteur (chanson perso comprise)
    lyIndex = -2; paint(); showLine(PAROLES.length ? -1 : 0);              // première ligne
  };                                                                      // fin onEnter 8
  musicPlay.addEventListener('click', () => togglePlay());                // ▶ / ❚❚
  $('#musicRestart').addEventListener('click', () => {                    // ⏮ reprendre au début
    if (useSynth) { Synth.stop(); setPlaying(false); startSynth(); }      // boîte à musique : relance
    else if (audio) { audio.currentTime = 0; togglePlay(true); }          // fichier : retour à 0
    lyIndex = -2; paint();                                                // rafraîchit
  });                                                                     // fin début
  function seekTo(ratio) {                                                // avance à un endroit de la chanson
    if (useSynth || !audio || !audio.duration) return;                    // impossible avec la boîte à musique
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * audio.duration; // nouvelle position
    paint();                                                              // rafraîchit
  }                                                                       // fin seekTo
  musicBarWrap.addEventListener('click', e => {                           // toucher la barre
    const r = musicBarWrap.getBoundingClientRect();                       // position du rail
    seekTo((e.clientX - r.left) / r.width);                               // va à cet endroit
  });                                                                     // fin barre
  musicBarWrap.addEventListener('keydown', e => {                         // clavier sur la barre
    if (!audio || !audio.duration) return;                                // rien à faire
    if (e.key === 'ArrowRight') { seekTo((audio.currentTime + 5) / audio.duration); e.preventDefault(); } // +5 s
    if (e.key === 'ArrowLeft') { seekTo((audio.currentTime - 5) / audio.duration); e.preventDefault(); }  // −5 s
  });                                                                     // fin clavier
  let kisses = 0;                                                         // nombre de bisous envoyés
  function sendKiss(x, y) {                                               // envoie un bisou
    kisses++;                                                             // +1
    burst(x, y, 10, { up: true, spread: 160 });                           // pluie de cœurs à l'endroit touché
    vibrate(15);                                                          // petite vibration
    $('#kissCount').textContent = (T.compteurBisous || '{n} bisou(s) envoyé(s) 💋').replace('{n}', kisses); // compteur
  }                                                                       // fin sendKiss
  musicStage.addEventListener('pointerdown', e => {                       // toucher la scène = bisou
    if (e.target.closest('button, [role=slider], a')) return;             // sauf sur les boutons et la barre
    sendKiss(e.clientX, e.clientY);                                       // bisou là où on touche
  });                                                                     // fin toucher
  $('#musicKiss').addEventListener('click', () => {                       // bouton 💋
    const r = $('#musicKiss').getBoundingClientRect();                    // position du bouton
    sendKiss(r.left + r.width / 2, r.top);                                // bisou depuis le bouton
  });                                                                     // fin bouton bisou

  /* ───── 11 ter. OUTIL DE SYNCHRO DES PAROLES (adresse + ?synchro=1) ───── */
  const isSync = /[?&]synchro=/.test(location.search);                    // mode synchro ?
  const syncRec = [];                                                     // lignes déjà calées
  if (isSync) {                                                           // seulement en mode synchro
    $('#syncPanel').hidden = false;                                       // affiche l'outil
    $('#syncNext').addEventListener('click', () => {                      // « Ligne suivante »
      const lines = $('#syncInput').value.split('\n').map(s => s.trim()).filter(Boolean); // lignes collées
      if (!lines.length) { $('#syncState').textContent = 'Colle d’abord les paroles ♡'; return; } // rien à caler
      if (syncRec.length >= lines.length) { $('#syncState').textContent = 'Terminé ! Copie le bloc ci-dessous ♡'; return; } // fini
      const [texte, traduction = ''] = lines[syncRec.length].split('|').map(s => s.trim()); // texte | traduction
      syncRec.push({ t: Math.round(songPos().secs * 10) / 10, texte, traduction }); // temps actuel arrondi à 0,1 s
      $('#syncState').textContent = `Ligne ${syncRec.length} / ${lines.length} calée à ${fmt(songPos().secs)}`; // avancement
      $('#syncOut').value = 'paroles: [\n' + syncRec.map(l => '  ' + JSON.stringify(l).replace(/"(t|texte|traduction)":/g, '$1: ') + ',').join('\n') + '\n],'; // bloc prêt à coller
    });                                                                   // fin bouton
  }                                                                       // fin mode synchro

  /* ───── 12. ÉTAPE 0 : ACCUEIL (prénom + photos / chanson perso) ───── */
  const askName = C.demanderPrenom !== false;                             // demander le prénom ?
  const askOwn = C.proposerPerso !== false;                               // proposer ses propres fichiers ?
  const isReplay = /[?&]replay=/.test(location.search);                   // retour via « Replay » ?
  const store = {                                                         // petite mémoire locale (reste sur le téléphone)
    get(k) { try { return localStorage.getItem('surprise.' + k); } catch (e) { return null; } }, // lit une valeur
    set(k, v) { try { localStorage.setItem('surprise.' + k, v); } catch (e) { /* stockage indisponible */ } } // écrit une valeur
  };                                                                      // fin store
  const DB = {                                                            // fichiers perso dans IndexedDB (garde les photos pour « Replay »)
    open() {                                                              // ouvre la base
      return new Promise((res, rej) => {                                  // promesse
        if (!window.indexedDB) return rej(new Error('no idb'));           // navigateur sans IndexedDB
        const r = indexedDB.open('surprise', 1);                          // base « surprise »
        r.onupgradeneeded = () => r.result.createObjectStore('files');    // table des fichiers
        r.onsuccess = () => res(r.result);                                // ok
        r.onerror = () => rej(r.error);                                   // erreur (navigation privée…)
      });                                                                 // fin promesse
    },                                                                    // fin open
    async run(mode, fn) {                                                 // exécute une opération
      try {                                                               // protégé
        const db = await this.open();                                     // base
        return await new Promise(res => {                                 // attend la fin
          const tx = db.transaction('files', mode);                       // transaction
          const out = fn(tx.objectStore('files'));                        // opération
          tx.oncomplete = () => res(out && out.result);                   // résultat
          tx.onerror = tx.onabort = () => res(undefined);                 // échec silencieux
        });                                                               // fin attente
      } catch (e) { return undefined; }                                   // pas de base → rien
    },                                                                    // fin run
    getAll() { return this.run('readonly', s => s.getAll()).then(v => v || []); }, // tous les fichiers
    put(rec) { return this.run('readwrite', s => s.put(rec, rec.key)); }, // enregistre un fichier
    clear() { return this.run('readwrite', s => s.clear()); }             // efface tout
  };                                                                      // fin DB

  const setupForm = $('#setupForm');                                      // formulaire d'accueil
  const nameInput = $('#nameInput');                                      // champ prénom
  const ownYes = $('#ownYes'), ownNo = $('#ownNo');                       // boutons oui / non
  const ownPanel = $('#ownPanel');                                        // panneau des fichiers
  const setupMsg = $('#setupMsg');                                        // message
  const songFileName = $('#songFileName');                                // nom du fichier chanson
  const custom = {};                                                      // fichiers choisis : clé → { key, blob, name, url }
  let useOwn = false;                                                     // la personne a choisi « oui » ?
  nameInput.placeholder = T.placeholderNom || 'ton prénom ♡';              // texte gris du champ
  $('#nameBlock').hidden = !askName;                                      // masque la question si désactivée
  $('#ownBlock').hidden = !askOwn;                                        // idem pour la personnalisation

  function setMediaKey(key, url) {                                        // range une adresse dans « media »
    if (key.startsWith('booth')) media.booth[Number(key.slice(5))] = url; // photobooth 0..3
    else media[key] = url;                                                // autres
  }                                                                       // fin setMediaKey
  function defaultFor(key) {                                              // fichier d'origine d'une clé
    return key.startsWith('booth') ? DEFAULT_MEDIA.booth[Number(key.slice(5))] : DEFAULT_MEDIA[key]; // valeur de config.js
  }                                                                       // fin defaultFor
  function refreshPicks() {                                               // met à jour vignettes + lecteur
    Object.assign(media, JSON.parse(JSON.stringify(DEFAULT_MEDIA)));      // repart des originaux
    if (useOwn) Object.values(custom).forEach(c => setMediaKey(c.key, c.url)); // applique les fichiers perso
    $$('.pick').forEach(p => p.classList.toggle('is-custom', !!custom[p.dataset.key])); // badge ♡ sur les vignettes changées
    const song = custom.audio;                                            // chanson perso ?
    songFileName.textContent = song ? song.name : (DEFAULT_MEDIA.audio ? 'chanson d’origine' : 'boîte à musique'); // nom affiché
    applyMedia();                                                         // photos partout
    $$('#ownPanel img[data-photo]').forEach(img => {                      // les vignettes montrent toujours le choix en cours
      const k = img.closest('.pick').dataset.key;                         // clé de la vignette
      const src = custom[k] ? custom[k].url : defaultFor(k);              // perso ou original
      if (src) img.src = src; else img.removeAttribute('src');            // affiche
    });                                                                   // fin vignettes
    setSong(media.audio);                                                 // chanson active
    $('.player-title').textContent = useOwn && song ? song.name.replace(/\.[^.]+$/, '') : (C.titreChanson || 'Notre chanson'); // titre affiché
  }                                                                       // fin refreshPicks
  function chooseOwn(yes) {                                               // clic sur oui / non
    useOwn = yes;                                                         // mémorise
    ownYes.setAttribute('aria-pressed', String(yes));                     // état du bouton oui
    ownNo.setAttribute('aria-pressed', String(!yes));                     // état du bouton non
    ownPanel.hidden = !yes;                                               // affiche / cache les vignettes
    if (yes) fx(ownPanel, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, { duration: .35 }); // apparition
    refreshPicks();                                                       // applique
  }                                                                       // fin chooseOwn
  ownYes.addEventListener('click', () => chooseOwn(true));                // oui
  ownNo.addEventListener('click', () => chooseOwn(false));                // non
  $$('.pick input[type=file]').forEach(input => input.addEventListener('change', () => { // un fichier est choisi
    const file = input.files && input.files[0];                           // le fichier
    if (!file) return;                                                    // annulé
    const key = input.closest('.pick').dataset.key;                       // emplacement
    if (custom[key]) URL.revokeObjectURL(custom[key].url);                // libère l'ancien
    custom[key] = { key, blob: file, name: file.name, url: URL.createObjectURL(file) }; // nouveau fichier (local)
    input.value = '';                                                     // permet de rechoisir le même fichier
    refreshPicks();                                                       // applique
    say(`${file.name} choisi`);                                         // annonce
  }));                                                                    // fin choix de fichier
  $('#ownReset').addEventListener('click', () => {                        // revenir aux originaux
    Object.keys(custom).forEach(k => { URL.revokeObjectURL(custom[k].url); delete custom[k]; }); // oublie les fichiers perso
    DB.clear();                                                           // efface la mémoire du téléphone
    refreshPicks();                                                       // applique
    say('Retour aux photos et à la chanson d’origine');                          // annonce
  });                                                                     // fin reset
  setupForm.addEventListener('submit', async e => {                       // « Discover my surprise ♡ »
    e.preventDefault();                                                   // pas de rechargement de page
    const name = nameInput.value.trim().replace(/\s+/g, ' ');             // prénom nettoyé
    if (askName && !name) {                                               // prénom obligatoire
      setupMsg.textContent = T.erreurNom || 'Dis-moi d’abord ton prénom ♡';  // message
      nameInput.classList.remove('is-error'); void nameInput.offsetWidth; nameInput.classList.add('is-error'); // tremblement
      nameInput.focus();                                                  // focus sur le champ
      return;                                                             // stop
    }                                                                     // fin vérification
    setupMsg.textContent = '';                                            // efface le message
    applyName(name);                                                      // utilise le prénom partout
    store.set('name', name);                                              // retient le prénom
    store.set('own', useOwn ? '1' : '0');                                 // retient le choix
    if (useOwn) await Promise.all(Object.values(custom).map(c => DB.put({ key: c.key, blob: c.blob, name: c.name }))); // garde les fichiers pour « Replay »
    nameInput.blur();                                                     // ferme le clavier du téléphone
    goTo(1);                                                              // c'est parti !
  });                                                                     // fin submit
  function applyName(name) {                                              // affiche le prénom dans le site
    visitorName = name;                                                   // pour « Dear <prénom>, »
    const fn = $('#forName');                                             // ligne sous le titre
    fn.textContent = (T.pourToi || 'pour {nom} ♡').replace('{nom}', name); // « for <prénom> ♡ »
    fn.hidden = !name;                                                    // cachée si pas de prénom
  }                                                                       // fin applyName
  /* ───── 13. ÉTAPE 9 : FIN (bons d'amour + promesse + générique + souvenir) ───── */
  $$('.js-finish').forEach(b => b.addEventListener('click', () => goTo(9))); // boutons « Terminer ♡ »
  const couponsBox = $('#coupons');                                       // conteneur des coupons
  let usedCoupons = [];                                                   // coupons déjà utilisés (indices)
  try { usedCoupons = JSON.parse(store.get('coupons') || '[]'); } catch (e) { usedCoupons = []; } // relit la mémoire du téléphone
  (Array.isArray(C.coupons) ? C.coupons : []).forEach((txt, i) => {       // crée chaque coupon
    const b = document.createElement('button');                           // un coupon = un bouton
    b.type = 'button'; b.className = 'coupon';                            // style ticket
    b.innerHTML = '<span class="coupon-ico" aria-hidden="true">🎟️</span><span class="coupon-txt"><b></b><small></small></span><span class="coupon-stamp" aria-hidden="true"></span>'; // structure
    $('b', b).textContent = String(txt);                                  // intitulé (depuis config.js)
    $('small', b).textContent = T.valableCoupon || 'valable pour toujours'; // mention
    $('.coupon-stamp', b).textContent = T.tamponUtilise || 'UTILISÉ ♡';   // tampon
    const mark = () => { b.classList.add('is-used'); b.setAttribute('aria-pressed', 'true'); }; // pose le tampon
    b.setAttribute('aria-pressed', 'false');                              // pas encore utilisé
    if (usedCoupons.includes(i)) mark();                                  // déjà utilisé lors d'une visite précédente
    b.addEventListener('click', () => {                                   // toucher = utiliser
      if (b.classList.contains('is-used')) return;                        // une seule fois
      mark();                                                             // tampon
      usedCoupons.push(i); store.set('coupons', JSON.stringify(usedCoupons)); // retient
      const r = b.getBoundingClientRect();                                // position
      burst(r.right - 50, r.top + r.height / 2, 14, { spread: 150 });     // cœurs
      vibrate(25);                                                        // petite vibration
      say(`${txt} : utilisé !`);                                          // annonce
    });                                                                   // fin clic
    couponsBox.appendChild(b);                                            // ajoute à la page
  });                                                                     // fin coupons

  const promiseBtn = $('#promiseBtn');                                    // bouton à maintenir
  const HOLD = 1400;                                                      // durée d'appui pour promettre (ms)
  let holdStart = 0, holdRaf = 0, promised = false;                       // état de l'appui
  function holdFrame(now) {                                               // remplit le cercle
    const p = Math.min(1, (now - holdStart) / HOLD);                      // progression 0 → 1
    promiseBtn.style.setProperty('--p', p.toFixed(3));                    // cercle
    if (p >= 1) { keepPromise(); return; }                                // appui assez long → promesse !
    holdRaf = requestAnimationFrame(holdFrame);                           // image suivante
  }                                                                       // fin holdFrame
  function holdBegin(e) {                                                 // début de l'appui
    if (promised) return;                                                 // déjà promis
    if (e) e.preventDefault();                                            // pas de menu / sélection
    holdStart = performance.now();                                        // départ
    promiseBtn.classList.add('is-holding');                               // enfoncé
    vibrate(10);                                                          // petit retour
    cancelAnimationFrame(holdRaf); holdRaf = requestAnimationFrame(holdFrame); // lance le remplissage
  }                                                                       // fin holdBegin
  function holdEnd() {                                                    // doigt relâché trop tôt
    if (promised) return;                                                 // déjà promis
    cancelAnimationFrame(holdRaf);                                        // stop
    promiseBtn.classList.remove('is-holding');                            // relâché
    promiseBtn.style.setProperty('--p', '0');                             // le cercle se vide
  }                                                                       // fin holdEnd
  promiseBtn.addEventListener('pointerdown', e => { try { promiseBtn.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ } holdBegin(e); }); // appui
  ['pointerup', 'pointercancel'].forEach(t => promiseBtn.addEventListener(t, holdEnd)); // relâché
  promiseBtn.addEventListener('contextmenu', e => e.preventDefault());    // pas de menu contextuel sur appui long
  promiseBtn.addEventListener('click', e => { if (e.detail === 0) keepPromise(); }); // clavier (Entrée / Espace) = promesse directe
  function fireworks() {                                                  // feu d'artifice de cœurs
    const W = window.innerWidth, H = window.innerHeight;                  // taille de l'écran
    const shots = reduced() ? 1 : 7;                                      // nombre d'explosions
    for (let k = 0; k < shots; k++) setTimeout(() => burst(rand(W * .15, W * .85), rand(H * .15, H * .55), 22, { spread: 200 }), k * 260); // explosions successives
    rise(30);                                                             // + cœurs qui montent
  }                                                                       // fin fireworks
  function keepPromise() {                                                // la promesse est faite
    if (promised) return;                                                 // une seule fois
    promised = true;                                                      // verrou
    cancelAnimationFrame(holdRaf);                                        // stop
    promiseBtn.style.setProperty('--p', '1');                             // cercle plein
    promiseBtn.classList.remove('is-holding'); promiseBtn.classList.add('is-done'); // vert
    promiseBtn.setAttribute('aria-pressed', 'true');                      // accessibilité
    $('#promiseLabel').textContent = T.promesseFaite || 'Promesse faite ! 🤙♡'; // message
    vibrate([40, 60, 40, 60, 120]);                                       // vibration de fête
    fireworks();                                                          // feu d'artifice
    say(T.promesseFaite || 'Promesse faite !');                           // annonce
    const end = $('#theEnd');                                             // générique
    $('#endCredits').textContent = (T.credits || 'Fait avec amour par {de} pour {nom}').replace('{de}', C.expediteur || '♡').replace('{nom}', visitorName || C.destinataire || 'toi'); // « Fait avec amour par … pour … »
    $('#endDate').textContent = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); // date du jour en français
    setTimeout(() => {                                                    // après le feu d'artifice
      end.hidden = false;                                                 // affiche le générique
      fx(end, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, { duration: .8, ease: 'back.out(1.4)' }); // apparition
      end.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); // fait défiler jusqu'à « FIN »
    }, reduced() ? 50 : 1200);                                            // délai
  }                                                                       // fin keepPromise

  function loadImg(src) {                                                 // charge une image (ou null si impossible)
    return new Promise(res => { if (!src) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); // promesse
  }                                                                       // fin loadImg
  async function makeSouvenir() {                                         // dessine la carte-souvenir (1080 × 1350)
    const W = 1080, H = 1350;                                             // format portrait Instagram
    const c = document.createElement('canvas'); c.width = W; c.height = H; // canvas
    const g = c.getContext('2d');                                         // contexte
    try {                                                                 // polices prêtes… mais jamais plus de 2 s d'attente
      await Promise.race([                                                // la première des deux promesses gagne
        Promise.all(['120px "Great Vibes"', '60px "Patrick Hand"', '24px "Press Start 2P"'].map(f => document.fonts.load(f))), // chargement des polices
        wait(2000)                                                        // connexion lente : on dessine quand même
      ]);                                                                 // fin course
    } catch (e) { /* polices système */ }                                 // erreur → polices de secours
    const bg = g.createLinearGradient(0, 0, 0, H);                        // fond rose
    bg.addColorStop(0, '#ffc7dc'); bg.addColorStop(1, '#f9b9d0');         // dégradé
    g.fillStyle = bg; g.fillRect(0, 0, W, H);                             // remplit
    const heart = new Path2D(HEART_D);                                    // cœur
    for (let i = 0; i < 26; i++) {                                        // petits cœurs éparpillés
      g.save(); g.translate(rand(0, W), rand(0, H)); g.rotate(rand(-.5, .5)); const s = rand(.25, .7); g.scale(s, s); // position + taille
      g.fillStyle = ['#fff', '#ef7fa8', '#fbe3ec'][i % 3]; g.globalAlpha = .55; g.fill(heart); g.restore(); // dessine
    }                                                                     // fin cœurs
    g.globalAlpha = 1;                                                    // opacité normale
    g.fillStyle = '#b3262e'; g.textAlign = 'center';                      // titre rouge centré
    g.font = '130px "Great Vibes", cursive';                              // script
    g.fillText(T.titreSouvenir || 'Toi & moi ♡', W / 2, 190);            // « Toi & moi ♡ »
    g.save(); g.translate(W / 2, 690); g.rotate(-.04);                    // polaroid penché au centre
    g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 40; g.shadowOffsetY = 18; // ombre
    g.fillStyle = '#fff'; g.fillRect(-350, -380, 700, 800);               // cadre blanc
    g.shadowColor = 'transparent';                                        // fin ombre
    const photo = await loadImg(media.couple);                            // photo du couple (ou la sienne)
    g.fillStyle = '#ffd6e6'; g.fillRect(-310, -340, 620, 620);            // fond si pas de photo
    if (photo) {                                                          // photo disponible
      const r = Math.max(620 / photo.naturalWidth, 620 / photo.naturalHeight); // remplissage « cover »
      const iw = photo.naturalWidth * r, ih = photo.naturalHeight * r;    // taille dessinée
      g.save(); g.beginPath(); g.rect(-310, -340, 620, 620); g.clip();    // limite au cadre photo
      g.drawImage(photo, -310 + (620 - iw) / 2, -340 + (620 - ih) * .3, iw, ih); // photo (visages vers le haut)
      g.restore();                                                        // fin découpe
    }                                                                     // fin photo
    g.fillStyle = '#6b4a3a'; g.font = '62px "Patrick Hand", cursive';     // légende manuscrite
    g.fillText(`${visitorName || C.destinataire || 'toi'} ♡ ${C.expediteur || 'moi'}`, 0, 365); // « Claire ♡ … »
    g.restore();                                                          // fin polaroid
    g.fillStyle = '#6b4a3a'; g.font = '26px "Press Start 2P", monospace'; // date pixel
    g.fillText(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 1200); // date du jour
    g.fillStyle = '#b3262e'; g.font = '80px "Great Vibes", cursive';      // « pour toujours »
    g.fillText('pour toujours ♡', W / 2, 1300);                           // signature finale
    return new Promise(res => c.toBlob(res, 'image/png'));                // image PNG
  }                                                                       // fin makeSouvenir
  $('#souvenirBtn').addEventListener('click', async () => {               // « Télécharger notre souvenir »
    const msg = $('#souvenirMsg');                                        // message
    msg.textContent = '…';                                                // patience
    try {                                                                 // protégé
      const blob = await makeSouvenir();                                  // fabrique l'image
      const file = new File([blob], 'notre-souvenir.png', { type: 'image/png' }); // fichier
      if (navigator.canShare && navigator.canShare({ files: [file] })) {  // téléphone : menu « Partager / Enregistrer l'image »
        try { await navigator.share({ files: [file], title: T.titreSouvenir || 'Toi & moi ♡' }); msg.textContent = 'Souvenir gardé ♡'; } // partage
        catch (e) { msg.textContent = e && e.name === 'AbortError' ? '' : 'Oups, réessaie ♡'; } // annulé ou erreur
        return;                                                           // fin
      }                                                                   // fin partage
      const a = document.createElement('a');                              // ordinateur : téléchargement
      a.href = URL.createObjectURL(blob); a.download = 'notre-souvenir.png'; // lien
      document.body.appendChild(a); a.click(); a.remove();                // télécharge
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);                // nettoyage
      msg.textContent = 'Souvenir téléchargé ♡';                          // confirmation
    } catch (e) { msg.textContent = 'Oups, la photo n’a pas pu être créée ♡'; } // erreur
  });                                                                     // fin souvenir

  async function startJourney() {                                         // appelé quand le CSS s'allume
    const savedName = store.get('name') || '';                            // prénom déjà saisi ?
    useOwn = store.get('own') === '1';                                    // choix précédent
    (await DB.getAll()).forEach(r => {                                    // fichiers perso gardés sur le téléphone
      if (r && r.blob && r.key) custom[r.key] = { key: r.key, blob: r.blob, name: r.name || 'file', url: URL.createObjectURL(r.blob) }; // recrée une adresse locale
    });                                                                   // fin chargement
    nameInput.value = savedName;                                          // pré-remplit le prénom
    chooseOwn(useOwn);                                                    // rétablit le choix
    if (!askOwn) chooseOwn(false);                                        // personnalisation désactivée
    if (isSync) { applyName(savedName); return goTo(8); }                 // outil de synchro → directement l'écran musique
    if (/[?&]photos=/.test(location.search)) {                            // « Changer les photos » depuis la fin
      $('#ownBlock').hidden = false;                                      // montre la question
      chooseOwn(true);                                                    // ouvre directement les vignettes
      return goTo(0);                                                     // écran d'accueil
    }                                                                     // fin changer les photos
    if ((!askName && !askOwn) || (isReplay && (savedName || !askName))) { // rien à demander, ou « Replay »
      applyName(askName ? savedName : '');                                // prénom mémorisé
      return goTo(1);                                                     // directement l'étape 1
    }                                                                     // fin raccourci
    return goTo(0);                                                       // écran d'accueil
  }                                                                       // fin startJourney
})();                                                                     // fin du script
