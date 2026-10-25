# SITE_ROMANTIQUE ♡

Site-surprise kawaii en 7 étapes, plus un générateur de QR code en forme de cœur.

## Arborescence

```
SITE_ROMANTIQUE/
├── index.html      ← structure des 7 étapes + mascottes SVG originales
├── style.css       ← tout le style (fenêtres Y2K, scrapbook, photobooth…)
├── script.js       ← logique (transitions GSAP, bouton fuyard, pavé, grattage, lettre)
├── config.js       ← ⭐ TOUT ce qui est personnel : c'est le SEUL fichier à modifier
├── qr.html         ← générateur de QR code en cœur (s'ouvre en local)
├── .nojekyll       ← pour GitHub Pages (sert les fichiers tels quels)
├── img/            ← tes photos (des images provisoires .svg y sont déjà)
└── audio/          ← ta chanson
```

## Assets à fournir

| Fichier | Où il apparaît | Taille conseillée | Format |
|---|---|---|---|
| `img/couple.jpg` | polaroid + pochette du lecteur | 1200 × 1200 (carré) | JPG, < 300 Ko |
| `img/booth-1.jpg` … `img/booth-4.jpg` | bande photobooth | 1200 × 900 (paysage 4:3) | JPG, < 250 Ko chacun |
| `img/secret.jpg` | photo sous le cœur à gratter | 1200 × 1200 (carré) | JPG, < 300 Ko |
| `audio/chanson.mp3` | lecteur de l'étape 4 | 128–192 kbit/s | MP3, < 5 Mo |

Une fois les fichiers posés, indique leurs noms dans `config.js` (`photos.couple: "img/couple.jpg"`, `fichierAudio: "audio/chanson.mp3"`…).
Sans fichier audio, le lecteur joue une petite mélodie « boîte à musique » générée par le navigateur.

Les mascottes (ourson, chaton blanc, capybaras, chat noir, tulipe…) sont des dessins SVG **originaux** intégrés dans `index.html` (`<symbol id="m-…">`). Aucun personnage protégé n'est utilisé.

## Personnaliser

Ouvre `config.js` et modifie :
- `destinataire` / `expediteur` → « Dear … , » et la signature
- `dateSecrete` → `"10-17"` (mois-jour, n'importe quelle année) ou `"10-17-2023"` (année exigée)
- `titreChanson`, `artiste`, `fichierAudio`
- `photos`, `lettre` (autant de paragraphes que tu veux)
- `effetHtmlBrut: false` pour désactiver l'effet « HTML brut » du début
- `textes` → tous les petits textes du parcours

Pour tester sur ton PC : double-clique sur `index.html`. Astuce : dans VS Code, l'extension *Live Server* permet aussi de le voir sur ton téléphone via le Wi-Fi.

---

## Mise en ligne (obligatoire pour que le QR code marche)

Un QR code ne contient **qu'une adresse web**. Le site doit donc être **en ligne** avant que tu crées le QR.

> 🔒 **Vie privée.** Le site contient des photos personnelles. Toute personne qui a le lien peut les voir.
> - Choisis une adresse **non devinable** (ex : `surprise-k7m2q9xw`, pas `anniversaire-julie`).
> - Ne publie que des photos que tu acceptes de rendre visibles à quiconque a le lien.
> - Le site demande aux moteurs de recherche de ne pas l'indexer (`noindex`), mais ce n'est pas un mot de passe.
> - ⚠️ Sur GitHub gratuit, le **dépôt doit être public** pour utiliser Pages : tout le monde peut parcourir tes fichiers (photos comprises) sur github.com. Si ça te gêne, préfère **Netlify Drop** (option b).

### (a) GitHub Pages (Windows, VS Code, PowerShell)

1. Sur github.com : **New repository** → nom non devinable, ex : `surprise-k7m2q9xw` → **Public** → ne coche rien d'autre → **Create repository**.
2. Dans VS Code : **Terminal → New Terminal** (PowerShell), puis :

```powershell
cd "C:\Users\hp\Documents\MES PROJET VSCODE\MES SITES\QR CODE\SITE_ROMANTIQUE"
git init
git add .
git commit -m "Site surprise"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/surprise-k7m2q9xw.git
git push -u origin main
```

   (Si Git demande ton identité : `git config --global user.name "Ton nom"` et `git config --global user.email "ton@email"`. La première fois, une fenêtre de connexion GitHub s'ouvre.)
3. Sur la page du dépôt : **Settings → Pages** → *Source* : **Deploy from a branch** → Branch : **main** / **(root)** → **Save**.
4. Attends 1 à 2 minutes. L'adresse s'affiche en haut de la page Pages :
   `https://TON-PSEUDO.github.io/surprise-k7m2q9xw/`
5. Pour publier une modification plus tard :

```powershell
git add .
git commit -m "Mise à jour"
git push
```

### (b) Netlify Drop (glisser-déposer)

1. Va sur **https://app.netlify.com/drop** et crée un compte gratuit, ou connecte-toi. Sans compte, le site est supprimé au bout d'environ une heure.
2. Glisse le **dossier `SITE_ROMANTIQUE` entier** dans la zone.
3. Netlify te donne une adresse aléatoire du type `https://xyz-123abc.netlify.app` (déjà difficile à deviner).
4. Facultatif : **Site configuration → Change site name** pour la renommer (garde un nom non devinable).
5. Pour mettre à jour : **Deploys** → glisse de nouveau le dossier.

### (c) Relier l'adresse au QR code

1. Ouvre **`qr.html`** sur ton PC (double-clic).
2. Colle l'adresse obtenue (avec `https://` et le `/` final) dans **URL du site**.
3. Clique sur **Générer**. La page vérifie elle-même le QR avec jsQR et affiche **✅ Scannable** ou **❌ Trop dégradé**. Elle ajuste automatiquement la marge, la version et les points décoratifs si besoin.
4. **Télécharger PNG** (pour imprimer ou envoyer) ou **SVG** (pour l'agrandir sans perte).
5. 📱 **Teste TOUJOURS le QR avec ton téléphone avant de l'envoyer.** Si tu changes l'adresse du site, refais le QR.

Conseils : garde un rose assez foncé pour les points (le défaut `#d6457e` est bien), un fond blanc pour l'impression, et au moins 3 cm de côté une fois imprimé.
