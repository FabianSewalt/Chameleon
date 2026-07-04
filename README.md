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
instellingen. Let op: geen dubbele woorden binnen één categorie.

## Spelregels (kort)

1. Voeg spelers toe (volgorde = doorgeefvolgorde) en kies instellingen.
2. Geef de telefoon rond; iedereen bekijkt zijn rol met **ingedrukt houden**.
3. De aangewezen speler begint, daarna met de klok mee: iedereen geeft
   één woord als hint over het geheime woord.
4. Overleg en stem wie de chameleon is.
5. Onthul de rollen. Gepakt? Dan mag de chameleon het woord raden om
   alsnog te winnen. Onthul daarna het woord (en wat de salamanders dachten).
