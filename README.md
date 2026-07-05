# CHAMELEON — doorgeef-editie

Party-game voor 1 telefoon. Iedereen krijgt hetzelfde geheime woord, behalve de
**chameleon** (weet niks) en eventuele **salamanders** (krijgen stiekem een ánder
woord — zonder dat ze het zelf weten). Geef om de beurt hints, stem wie de
chameleon is, en onthul daarna de rollen en het woord.

## Online zetten (GitHub Pages)

1. Maak een nieuwe repository (bijv. `chameleon`).
2. Upload **alle bestanden uit deze map** naar de root van de repo.
3. Ga naar **Settings → Pages → Deploy from a branch → main / (root)** en sla op.
4. Na ±1 minuut staat de app op `https://<gebruikersnaam>.github.io/chameleon/`.

## Installeren op je telefoon

- **Android (Chrome):** open de link → menu (⋮) → **App installeren** / *Toevoegen aan startscherm*.
- **iPhone (Safari):** open de link → deelknop → **Zet op beginscherm**.

## Updaten

De service worker gebruikt **network-first**: zolang je online bent laadt de app
altijd de nieuwste versie van GitHub Pages. Gewoon committen is dus genoeg.
Bij grote wijzigingen kun je optioneel `CACHE` in `sw.js` en `APP_VERSION` in
`app.js` ophogen (versienummer zie je rechtsboven op het homescherm).

## Woorden en categorieën aanpassen

Alles staat in `words.js`. Een woord toevoegen = string toevoegen aan de lijst.
Een nieuw blok toevoegen = nieuwe categorie; die verschijnt automatisch in de
instellingen én de categoriekiezer. Onderin `words.js` staat `CAT_EMOJI`: geef
je nieuwe categorie daar een emoji, anders krijgt hij automatisch 📦.
Let op: geen dubbele woorden binnen één categorie.

## Punten

Een potje bestaat uit een instelbaar aantal rondes (standaard 5), elke ronde
met nieuwe willekeurige rollen en een nieuwe beginspeler.

- Chameleon **ontmaskerd** → alle andere spelers **+1 punt**
- Chameleon **ontsnapt** → de chameleon **+2 punten**
- Optie *woord raden* aan → de chameleon mag aan het eind van elke ronde het
  woord raden; goed = **+1 bonuspunt**

## Woorden bewerken in de app

In **Instellingen** heeft elke categorie een ✏️-knop: woorden toevoegen,
aanpassen (tik op een woord) of verwijderen. Aangepaste lijsten worden op het
apparaat bewaard; met *Standaardlijst herstellen* zet je de originele lijst
terug. Met **➕ Nieuwe categorie** maak je in de app een eigen categorie met
naam, emoji en woorden (min. 2 woorden om mee te spelen); via de editor kun je
die later ook weer verwijderen. Grote lijsten toevoegen kan óók via `words.js`.

## Spelregels (kort)

1. Voeg spelers toe (volgorde = doorgeefvolgorde) en kies instellingen.
2. Start een spel en kies een categorie — of laat de app er willekeurig één kiezen.
3. Geef de telefoon rond; iedereen bekijkt zijn rol met **ingedrukt houden**.
4. De aangewezen speler begint, daarna met de klok mee: iedereen geeft
   één woord als hint over het geheime woord.
5. Overleg en stem wie de chameleon is.
6. Onthul de rollen. Gepakt? Dan mag de chameleon het woord raden om
   alsnog te winnen. Onthul daarna het woord (en wat de salamanders dachten).

Tip: staat "chameleon ziet categorie" **uit** (hard mode)? Kies dan bij het
starten **willekeurig**, anders ziet de chameleon de categorie alsnog op het
keuzescherm.
