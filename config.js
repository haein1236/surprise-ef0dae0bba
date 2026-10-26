/* ==========================================================================
   config.js — TOUT ce qui est personnel se règle ICI (aucun autre fichier à toucher)
   ========================================================================== */

const CONFIG = {                                           // objet global lu par index.html et script.js
  destinataire: "mon cœur",                                // nom utilisé si la personne ne donne pas son prénom
  expediteur: "Ton amoureux·se",                           // ta signature en bas de la lettre (étape 7)
  toutesLesDates: true,                                    // true = N'IMPORTE QUELLE date valide (ex. sa date d'anniversaire) débloque la surprise
  dateSecrete: "17-10",                                    // utilisée seulement si toutesLesDates = false : "JJ-MM" (année libre) ou "JJ-MM-AAAA"
  titreChanson: "Kiss Me",                                 // titre affiché sur le lecteur (étape 4)
  artiste: "Ariana Grande",                                  // artiste affiché sous le titre
  fichierAudio: "audio/chanson.mp3",                       // ta chanson (mp3, m4a ou mp4) ; vide = petite mélodie « boîte à musique » générée

  photos: {                                                // chemins des photos (noms simples, sans espaces ni emoji)
    couple: "img/couple.jpg",                              // photo du couple : polaroid (carrée de préférence)
    pochette: "img/pochette.jpg",                          // pochette du lecteur de musique (vide = même photo que couple)
    booth: [                                               // 4 photos de la bande photomaton (format 4:3 paysage)
      "img/booth-1.jpg",                                   // photo 1 du photomaton
      "img/booth-2.jpg",                                   // photo 2 du photomaton
      "img/booth-3.jpg",                                   // photo 3 du photomaton
      "img/booth-4.jpg"                                    // photo 4 du photomaton
    ],                                                     // fin de la liste photomaton
    gratter: "img/secret.jpg"                              // photo révélée sous le cœur à gratter (carrée)
  },                                                       // fin des photos

  demanderPrenom: true,                                    // true = au scan, un écran d'accueil demande le prénom (→ « <prénom>, mon cœur, »)
  proposerPerso: true,                                     // true = l'accueil propose de mettre SES propres photos et SA chanson
  //   Les fichiers choisis restent sur le téléphone de la personne (rien n'est envoyé sur Internet).

  lettre: [                                                // paragraphes de la lettre finale (autant que tu veux)
    "Si tu lis ceci, c'est que tu es enfin arrivé·e jusqu'ici… à la toute dernière page de cette petite surprise que j'ai faite rien que pour toi.", // paragraphe 1
    "Chaque chanson, chaque photo et chaque petit cœur de ce site est un morceau de nous. Tu rends les jours ordinaires plus doux et les beaux jours encore plus lumineux.", // paragraphe 2
    "Alors voici mon dernier secret : je te choisirais à chaque date du calendrier. Aujourd'hui, demain, et tous les jours d'après. ♡" // paragraphe 3
  ],                                                       // fin de la lettre

  calageAuto: true,                                        // true = si les temps « t » sont absents ou identiques, le site répartit les lignes tout seul sur la chanson
  debutParoles: 10,                                        // calage auto : seconde où le chant commence
  finParolesAvant: 8,                                      // calage auto : secondes de musique sans paroles à la fin
  boutonParoles: true,                                     // true = bouton « 🎤 Ajouter / caler les paroles » sur l'écran musique (false = caché)

  paroles: [                                               // paroles synchronisées de la chanson (écran musique après la lettre)
    // { t: 12.5, texte: "ligne originale de la chanson", traduction: "sa traduction en français" },
    // t = seconde où la ligne commence. Astuce : ouvre le site avec ?synchro=1 à la fin de l'adresse
    // pour taper le rythme toi-même : le site te donne le bloc tout prêt à coller ici.
  ],                                                       // vide = les « motsDoux » ci-dessous défilent à la place

  motsDoux: [                                              // petits mots qui défilent pendant la musique (si pas de paroles)
    "Tu es mon endroit préféré ♡",                         // mot 1
    "Avec toi, même les jours gris sont roses",            // mot 2
    "Je te choisirais encore, et encore",                  // mot 3
    "Ton sourire est ma chanson préférée",                 // mot 4
    "Merci d'exister ♡",                                   // mot 5
    "Toi + moi = mon histoire préférée"                    // mot 6
  ],                                                       // fin des mots doux
  dureeMotDoux: 6,                                         // secondes entre deux mots doux

  coupons: [                                               // bons d'amour de l'écran de fin (autant que tu veux)
    "Bon pour 1 câlin infini 🤗",                          // coupon 1
    "Bon pour un resto en amoureux 🍝",                    // coupon 2
    "Bon pour 100 bisous 💋"                               // coupon 3
  ],                                                       // fin des coupons

  notifications: {                                         // te prévient sur ton téléphone quand quelqu'un ouvre la surprise (appli gratuite « ntfy »)
    actif: true,                                           // false = aucune notification
    sujet: "surprise-notif-0a6e720b60000ebf",              // ton canal secret : abonne-toi à CE nom dans l'appli ntfy (ne le partage pas)
    prevenirLaPersonne: true                               // true = petite phrase sur l'accueil : « je reçois une notif quand tu ouvres ma surprise »
  },                                                       // fin des notifications

  effetHtmlBrut: true,                                  // true = la page s'affiche d'abord en HTML brut puis le CSS « s'allume »
  dureeHtmlBrut: 1500,                                     // durée de l'effet HTML brut en millisecondes

  textes: {                                                // tous les petits textes du parcours (facultatif à modifier)
    bienvenue: "Coucou ♡",                                 // titre de l'écran d'accueil
    questionNom: "Comment tu t'appelles ?",                // question du prénom
    placeholderNom: "ton prénom ♡",                        // texte gris dans le champ prénom
    erreurNom: "Dis-moi d'abord ton prénom ♡",             // message si le prénom est vide
    questionPerso: "Tu veux mettre tes propres photos et ta chanson ?", // question de personnalisation
    ouiPerso: "Oui, les miennes ♡",                        // bouton oui (personnaliser)
    nonPerso: "Non, surprends-moi",                        // bouton non (garder ceux du site)
    notePerso: "Touche une image pour la remplacer. Tes fichiers restent sur ton téléphone, rien n'est envoyé.", // explication
    chansonPerso: "Ta chanson",                            // libellé du choix de chanson
    resetPerso: "Revenir aux originaux",                   // bouton pour revenir aux fichiers d'origine
    boutonDecouvrir: "Découvrir ma surprise ♡",            // bouton pour entrer dans le site
    pourToi: "pour {nom} ♡",                               // petite ligne sous le titre de l'étape 1 ({nom} = prénom saisi)
    debutLettre: "{nom}, mon cœur,",                       // première ligne de la lettre ({nom} = prénom saisi)
    noteNotif: "Petit secret : je reçois une notif quand tu ouvres ma surprise ♡", // phrase de transparence sur l'accueil
    titreMail: "Tu as du courrier",                        // titre de l'étape 1
    indiceBoite: "touche la boîte ♡",                      // petite consigne sous la boîte
    question: "Tu veux savoir ce que c'est ?",             // question de l'étape 2
    oui: "Oui, stp !",                                     // bouton oui
    non: "Non merci !",                                    // bouton non (fuyard)
    erreurSysteme: "Erreur : « Non » n'est pas une réponse valide ♡", // texte des fenêtres d'erreur
    titreErreur: "Erreur système",                         // titre des fenêtres d'erreur
    titreDate: "Quand est-ce que je te choisis ?",         // titre de l'étape 3
    sousTitreDate: "Chaque jour. À commencer par aujourd'hui.", // sous-titre de l'étape 3
    bulleDate: "psst… tape ta date d'anniversaire ♡",      // bulle d'indice de l'étape 3
    boutonDate: "Débloquer ma surprise ♡",                 // bouton de validation de la date
    erreurDate: "Presque… réessaie ♡",                     // message si la date est fausse
    dateInvalide: "Cette date n'existe pas… réessaie ♡",   // message si la date est impossible (ex. 31/02)
    bonneDate: "Oui ! C'est la bonne ♡",                   // message si la date est acceptée
    titreChansonPage: "Une chanson pour toi",              // titre script de l'étape 4
    notes: [                                               // 3 notes manuscrites du scrapbook
      "tu rends la vie plus douce",                        // note 1
      "mon genre d'amour préféré",                         // note 2
      "bonne musique, jours plus doux"                     // note 3
    ],                                                     // fin des notes
    cassette: "toi & moi",                                 // étiquette de la cassette
    legendePolaroid: "nous ♡",                             // légende écrite sous le polaroid
    legendeBooth: "♡ toi & moi ♡",                         // texte en bas de la bande photomaton
    secret1: "J'ai un dernier secret pour toi…",           // titre de l'étape 6
    secret2: "Gratte le cœur pour le découvrir ♡",         // consigne de l'étape 6
    gratteMoi: "gratte-moi ♡",                             // texte écrit sur le cœur à gratter
    signature: "Pour toujours à toi,",                     // formule avant ta signature (étape 7)
    questionMusique: "Tu veux écouter notre chanson ? 🎧",  // question après la lettre
    ouiMusique: "Oui ♡",                                   // bouton oui (écran musique)
    nonMusique: "Pas maintenant",                          // bouton non
    reponseNonMusique: "D'accord… je la garde au chaud pour toi 🥺♡", // message mignon si « non »
    changerPhotos: "📷 Changer les photos",                // bouton pour remettre ses propres photos
    titreMusique: "Notre chanson",                         // titre de l'écran musique
    consigneBisous: "touche l'écran pour m'envoyer des bisous 💋", // petite consigne
    compteurBisous: "{n} bisou(s) envoyé(s) 💋",            // compteur ({n} = nombre)
    terminer: "Terminer ♡",                                // bouton vers l'écran de fin
    titreFin: "Avant de partir…",                          // titre de l'écran de fin
    sousTitreCoupons: "Voici tes bons d'amour. Touche-en un pour l'utiliser ♡", // consigne des coupons
    tamponUtilise: "UTILISÉ ♡",                            // tampon posé sur un coupon utilisé
    valableCoupon: "valable pour toujours",                // petite mention sur chaque coupon
    questionPromesse: "Promets-moi de garder ce petit site pour toujours ?", // texte de la promesse
    boutonPromesse: "Maintiens pour promettre 🤙",         // bouton à maintenir appuyé
    promesseFaite: "Promesse faite ! 🤙♡",                 // message une fois la promesse faite
    fin: "FIN ♡",                                          // grand mot de la fin
    credits: "Fait avec amour par {de} pour {nom}",        // générique ({de} = expediteur, {nom} = prénom saisi)
    aSuivre: "…à suivre, pour toujours",                   // petite phrase sous le générique
    boutonSouvenir: "📸 Télécharger notre souvenir",       // bouton carte-souvenir
    titreSouvenir: "Toi & moi ♡",                          // titre écrit sur la carte-souvenir
    continuer: "Continuer ♡",                              // texte des boutons « continuer »
    rejouer: "Recommencer ♡"                               // texte du bouton final
  }                                                        // fin des textes
};                                                         // fin de CONFIG
