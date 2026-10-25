/* ==========================================================================
   config.js — TOUT ce qui est personnel se règle ICI (aucun autre fichier à toucher)
   ========================================================================== */

const CONFIG = {                                           // objet global lu par index.html et script.js
  destinataire: "Suitor",                                  // prénom / surnom de la personne qui reçoit → « Dear Suitor, »
  expediteur: "Your Valentine",                            // ta signature en bas de la lettre (étape 7)
  dateSecrete: "10-17",                                    // date à deviner : "MM-DD" (année libre) ou "MM-DD-YYYY" (année exigée)
  titreChanson: "Our Song",                                // titre affiché sur le lecteur (étape 4)
  artiste: "You & Me",                                     // artiste affiché sous le titre
  fichierAudio: "audio/chanson.mp3",                       // ta chanson (mp3, m4a ou mp4) ; vide = petite mélodie « boîte à musique » générée

  photos: {                                                // chemins des photos (noms simples, sans espaces ni emoji)
    couple: "img/couple.jpg",                              // photo du couple : polaroid (carrée de préférence)
    pochette: "img/pochette.jpg",                          // pochette du lecteur de musique (vide = même photo que couple)
    booth: [                                               // 4 photos de la bande photobooth (format 4:3 paysage)
      "img/booth-1.jpg",                                   // photo 1 du photobooth
      "img/booth-2.jpg",                                   // photo 2 du photobooth
      "img/booth-3.jpg",                                   // photo 3 du photobooth
      "img/booth-4.jpg"                                    // photo 4 du photobooth
    ],                                                     // fin de la liste photobooth
    gratter: "img/secret.jpg"                              // photo révélée sous le cœur à gratter (carrée)
  },                                                       // fin des photos

  demanderPrenom: true,                                    // true = au scan, un écran d'accueil demande le prénom (→ « Dear <prénom>, »)
  proposerPerso: true,                                     // true = l'accueil propose de mettre SES propres photos et SA chanson
  //   Les fichiers choisis restent sur le téléphone de la personne (rien n'est envoyé sur Internet).

  lettre: [                                                // paragraphes de la lettre finale (autant que tu veux)
    "If you're reading this, you've finally made it here… to the very last page of this little surprise I made just for you.", // paragraphe 1
    "Every song, every photo and every tiny heart on this site is a piece of us. You make the ordinary days softer and the good days brighter.", // paragraphe 2
    "So here is my last secret: I would choose you on every single date of the calendar. Today, tomorrow, and all the days after. ♡" // paragraphe 3
  ],                                                       // fin de la lettre

  effetHtmlBrut: true,                                     // true = la page s'affiche d'abord en HTML brut puis le CSS « s'allume »
  dureeHtmlBrut: 1500,                                     // durée de l'effet HTML brut en millisecondes

  textes: {                                                // tous les petits textes du parcours (facultatif à modifier)
    bienvenue: "Hi there ♡",                               // titre de l'écran d'accueil
    questionNom: "What's your name?",                      // question du prénom
    placeholderNom: "your name ♡",                         // texte gris dans le champ prénom
    erreurNom: "Tell me your name first ♡",                // message si le prénom est vide
    questionPerso: "Do you want to use your own photos & song?", // question de personnalisation
    ouiPerso: "Yes, my own ♡",                             // bouton oui (personnaliser)
    nonPerso: "No, surprise me",                           // bouton non (garder ceux du site)
    notePerso: "Tap a picture to replace it. Your files stay on your phone, nothing is uploaded.", // explication
    chansonPerso: "Your song",                             // libellé du choix de chanson
    resetPerso: "Reset to the original ones",              // bouton pour revenir aux fichiers d'origine
    boutonDecouvrir: "Discover my surprise ♡",             // bouton pour entrer dans le site
    pourToi: "for {nom} ♡",                                // petite ligne sous « You've Got Mail » ({nom} = prénom saisi)
    titreMail: "You've Got Mail",                          // titre de l'étape 1
    indiceBoite: "tap the box ♡",                          // petite consigne sous la boîte
    question: "Are you interested to know?",               // question de l'étape 2
    oui: "Yes, plz!",                                      // bouton oui
    non: "No, tnx!",                                       // bouton non (fuyard)
    erreurSysteme: "Error: \"No\" is not a valid answer ♡", // texte des fenêtres d'erreur
    titreDate: "When do I choose you?",                    // titre de l'étape 3
    sousTitreDate: "Every day. Start with today.",         // sous-titre de l'étape 3
    bulleDate: "psst… it's our special day ♡",             // bulle d'indice de l'étape 3
    boutonDate: "Unlock my surprise ♡",                    // bouton de validation de la date
    erreurDate: "Not quite… try again ♡",                  // message si la date est fausse
    bonneDate: "Yes! That's the one ♡",                    // message si la date est bonne
    titreChansonPage: "Song For You",                      // titre script de l'étape 4
    notes: [                                               // 3 notes manuscrites du scrapbook
      "you make life softer",                              // note 1
      "my favorite kind of love",                          // note 2
      "good music, brighter days"                          // note 3
    ],                                                     // fin des notes
    cassette: "you & me",                                  // étiquette de la cassette
    legendePolaroid: "us ♡",                               // légende écrite sous le polaroid
    legendeBooth: "♡ you & me ♡",                          // texte en bas de la bande photobooth
    secret1: "I have one last secret for you…",            // titre de l'étape 6
    secret2: "Scratch the heart to find out ♡",            // consigne de l'étape 6
    signature: "Forever yours,",                           // formule avant ta signature (étape 7)
    continuer: "Continue ♡",                               // texte des boutons « continuer »
    rejouer: "Replay ♡"                                    // texte du bouton final
  }                                                        // fin des textes
};                                                         // fin de CONFIG
