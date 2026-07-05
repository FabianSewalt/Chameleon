// ============================================================
// CHAMELEON — WOORDENLIJST
// Voeg gerust woorden of hele categorieën toe.
// Nieuwe categorieën verschijnen automatisch in de instellingen.
// ============================================================

const WORDS = {

  "Dieren": [
    "Olifant","Giraffe","Pinguïn","Krokodil","Dolfijn","Haai","Orka","Walvis","Zeehond","Octopus",
    "Kwal","Zeepaardje","Schildpad","Kikker","Salamander","Kameleon","Slang","Hagedis","Adelaar","Uil",
    "Papegaai","Flamingo","Pauw","Struisvogel","Toekan","Vleermuis","Kangoeroe","Koala","Panda","Tijger",
    "Leeuw","Luipaard","Zebra","Nijlpaard","Neushoorn","Gorilla","Chimpansee","Wolf","Vos","Beer",
    "Egel","Eekhoorn","Konijn","Hert","Bever","Otter","Mier","Bij","Vlinder","Spin"
  ],

  "Eten & Drinken": [
    "Pizza","Pasta","Lasagne","Sushi","Ramen","Hamburger","Patat","Kroket","Frikandel","Bitterbal",
    "Kapsalon","Shoarma","Döner","Saté","Nasi","Bami","Loempia","Stamppot","Erwtensoep","Pannenkoek",
    "Poffertjes","Stroopwafel","Hagelslag","Kaas","Croissant","Tosti","Salade","Taco","Burrito","Curry",
    "Paella","Couscous","Falafel","Hotdog","Appeltaart","Brownie","Pepernoten","Oliebol","IJsje","Chocolade",
    "Drop","Popcorn","Chips","Koffie","Thee","Cola","Bier","Wijn","Milkshake","Smoothie"
  ],

  "Sport & Spel": [
    "Voetbal","Zaalvoetbal","Hockey","Tennis","Padel","Squash","Badminton","Tafeltennis","Basketbal","Volleybal",
    "Handbal","Honkbal","Rugby","American football","Golf","Darts","Snooker","Bowlen","Schaatsen","Skiën",
    "Snowboarden","Zwemmen","Waterpolo","Surfen","Zeilen","Roeien","Wielrennen","Mountainbiken","Hardlopen","Marathon",
    "Turnen","Judo","Karate","Boksen","Kickboksen","Schermen","Boogschieten","Paardrijden","Klimmen","Skateboarden",
    "Schaken","Dammen","Poker","Toepen","Klaverjassen","Monopoly","Twister","Jenga","Formule 1","Motorcross"
  ],

  "Landen": [
    "Nederland","België","Duitsland","Frankrijk","Spanje","Portugal","Italië","Griekenland","Turkije","Engeland",
    "Schotland","Ierland","Noorwegen","Zweden","Finland","Denemarken","IJsland","Polen","Tsjechië","Oostenrijk",
    "Zwitserland","Hongarije","Kroatië","Malta","Oekraïne","Rusland","China","Japan","Zuid-Korea","India",
    "Thailand","Vietnam","Indonesië","Filipijnen","Australië","Nieuw-Zeeland","Egypte","Marokko","Zuid-Afrika","Kenia",
    "Verenigde Staten","Canada","Mexico","Brazilië","Argentinië","Chili","Peru","Colombia","Cuba","Saudi-Arabië"
  ],

  "Steden": [
    "Amsterdam","Rotterdam","Den Haag","Utrecht","Eindhoven","Groningen","Maastricht","Breda","Parijs","Londen",
    "Berlijn","München","Madrid","Barcelona","Lissabon","Rome","Milaan","Venetië","Athene","Istanbul",
    "Wenen","Praag","Boedapest","Warschau","Stockholm","Oslo","Kopenhagen","Helsinki","Dublin","Brussel",
    "Antwerpen","Split","Dubrovnik","New York","Los Angeles","Las Vegas","Miami","Chicago","Toronto","Rio de Janeiro",
    "Buenos Aires","Kaapstad","Caïro","Dubai","Mumbai","Bangkok","Singapore","Hongkong","Tokio","Sydney"
  ],

  "Beroepen": [
    "Dokter","Chirurg","Tandarts","Verpleegkundige","Apotheker","Fysiotherapeut","Psycholoog","Dierenarts","Leraar","Professor",
    "Advocaat","Rechter","Notaris","Politieagent","Brandweerman","Militair","Piloot","Stewardess","Buschauffeur","Vrachtwagenchauffeur",
    "Taxichauffeur","Kok","Bakker","Slager","Kapper","Loodgieter","Elektricien","Timmerman","Schilder","Dakdekker",
    "Architect","Ingenieur","Programmeur","Wetenschapper","Astronaut","Boer","Visser","Hovenier","Postbezorger","Journalist",
    "Fotograaf","Acteur","Zanger","DJ","Kunstenaar","Schrijver","Makelaar","Accountant","Ober","Barman"
  ],

  "Films & Series": [
    "Titanic","Avatar","Jaws","Jurassic Park","Star Wars","Harry Potter","Lord of the Rings","The Matrix","Inception","Interstellar",
    "Oppenheimer","Shrek","Frozen","The Lion King","Finding Nemo","Toy Story","Up","Ratatouille","Wall-E","Spider-Man",
    "Batman","Superman","The Avengers","Iron Man","Pirates of the Caribbean","Indiana Jones","James Bond","Rocky","Terminator","Alien",
    "The Godfather","Pulp Fiction","Forrest Gump","Gladiator","Home Alone","Mr. Bean","Back to the Future","Friends","The Office","Breaking Bad",
    "Game of Thrones","Stranger Things","Squid Game","La Casa de Papel","Peaky Blinders","The Simpsons","SpongeBob","Wednesday","Sherlock","Black Mirror"
  ],

  "In Huis": [
    "Bank","Stoel","Eettafel","Bed","Kledingkast","Boekenkast","Lamp","Spiegel","Gordijn","Vloerkleed",
    "Kussen","Deken","Televisie","Afstandsbediening","Koelkast","Vriezer","Oven","Magnetron","Waterkoker","Koffiezetapparaat",
    "Broodrooster","Airfryer","Vaatwasser","Wasmachine","Droger","Strijkijzer","Stofzuiger","Bezem","Emmer","Douche",
    "Bad","Toilet","Wastafel","Tandenborstel","Handdoek","Föhn","Wekker","Bureau","Prullenbak","Sleutel",
    "Deurbel","Trap","Radiator","Ventilator","Kamerplant","Vaas","Fotolijst","Kaars","Koekenpan","Bestek"
  ],

  "Natuur & Buiten": [
    "Bos","Strand","Zee","Oceaan","Rivier","Meer","Waterval","Berg","Vulkaan","Grot",
    "Woestijn","Jungle","Savanne","Gletsjer","Eiland","Duin","Klif","Weiland","Moeras","Boom",
    "Eik","Palmboom","Cactus","Roos","Tulp","Zonnebloem","Paardenbloem","Gras","Mos","Paddenstoel",
    "Regen","Sneeuw","Hagel","Onweer","Bliksem","Regenboog","Wolk","Zonsondergang","Mist","Storm",
    "Tornado","Aardbeving","Maan","Zon","Ster","Komeet","Noorderlicht","Fossiel","Schelp","Kiezelsteen"
  ],

  "Vervoer": [
    "Auto","Fiets","Elektrische fiets","Bakfiets","Scooter","Motor","Bus","Tram","Metro","Trein",
    "Hogesnelheidstrein","Taxi","Vrachtwagen","Bestelbus","Camper","Caravan","Tractor","Vliegtuig","Helikopter","Luchtballon",
    "Zeppelin","Raket","Boot","Zeilboot","Speedboot","Jacht","Cruiseschip","Veerboot","Kano","Vlot",
    "Onderzeeër","Step","Skateboard","Rolschaatsen","Segway","Ambulance","Brandweerwagen","Politieauto","Limousine","Kabelbaan",
    "Skilift","Roltrap","Lift","Golfkarretje","Quad","Jetski","Sneeuwscooter","Tank","Riksja","Hovercraft"
  ],

  "Vakantie": [
    "Strandstoel","Zwembad","Hotel","Camping","Tent","Stacaravan","All-inclusive","Zonnebrand","Zonnebril","Bikini",
    "Zwembroek","Slippers","Koffer","Rugzak","Paspoort","Instapkaart","Vliegveld","Douane","Jetlag","Souvenir",
    "Ansichtkaart","Excursie","Stadswandeling","Museum","Parasol","Cocktail","Barbecue","Snorkelen","Duikbril","Suppen",
    "Wandelroute","Bergwandeling","Skivakantie","Roadtrip","Backpacken","Cruise","Safari","Pretpark","Waterpark","Boulevard",
    "Zonnesteek","Muggenspray","Huurauto","Reisgids","Minibar","Roomservice","Strandbal","Luchtbed","Kampvuur","Tolweg"
  ],

  "Muziek": [
    "Gitaar","Elektrische gitaar","Basgitaar","Drumstel","Piano","Keyboard","Viool","Cello","Contrabas","Harp",
    "Blokfluit","Dwarsfluit","Saxofoon","Trompet","Trombone","Tuba","Klarinet","Accordeon","Mondharmonica","Doedelzak",
    "Ukelele","Banjo","Djembé","Triangel","Tamboerijn","Xylofoon","Draaitafel","Microfoon","Koptelefoon","Versterker",
    "Festival","Concert","Karaoke","Orkest","Dirigent","Koor","Opera","Rock","Popmuziek","Jazz",
    "Blues","Hiphop","Techno","Hardstyle","Klassiek","Reggae","Country","Metal","Schlager","Volksmuziek"
  ],

  "Lichaam & Gezondheid": [
    "Hart","Longen","Hersenen","Maag","Lever","Nieren","Darmen","Skelet","Schedel","Ruggengraat",
    "Ribben","Spieren","Bloed","Ader","Huid","Haar","Oog","Oor","Neus","Mond",
    "Tand","Kies","Tong","Lip","Wenkbrauw","Wimper","Nek","Schouder","Elleboog","Pols",
    "Hand","Vinger","Duim","Nagel","Heup","Knie","Enkel","Voet","Teen","Hiel",
    "Koorts","Verkoudheid","Griep","Hoofdpijn","Pleister","Gips","Prik","Röntgenfoto","Bril","Gehoorapparaat"
  ],

  "Feest & Uitgaan": [
    "Verjaardag","Bruiloft","Oud en nieuw","Carnaval","Koningsdag","Sinterklaas","Kerstmis","Pasen","Halloween","Kermis",
    "Kroegentocht","Vrijgezellenfeest","Housewarming","Borrel","Slingers","Ballonnen","Confetti","Vuurwerk","Cadeau","Verjaardagstaart",
    "Kaarsjes","Piñata","Discobal","Dansvloer","Polonaise","Shotje","Proosten","Kater","Uitsmijter","Garderobe",
    "Entree","Polsbandje","VIP","Afterparty","Pokeravond","Spelletjesavond","Bingo","Pubquiz","Escaperoom","Bowlingbaan",
    "Lasergamen","Paintball","Casino","Nachtclub","Terras","Feesttent","Optocht","Serpentine","Fotohokje","Openluchtbioscoop"
  ],

  "Fantasie & Sprookjes": [
    "Draak","Eenhoorn","Fee","Elf","Kabouter","Trol","Reus","Dwerg","Heks","Tovenaar",
    "Toverstaf","Toverdrank","Toverspreuk","Kristallen bol","Vliegend tapijt","Wonderlamp","Geest","Spook","Vampier","Weerwolf",
    "Zombie","Mummie","Monster","Zeemeermin","Piraat","Schatkist","Schatkaart","Ridder","Zwaard","Schild",
    "Harnas","Kasteel","Kerker","Prinses","Prins","Koning","Koningin","Kroon","Troon","Assepoester",
    "Sneeuwwitje","Roodkapje","Rapunzel","Pinokkio","Peter Pan","Robin Hood","Doornroosje","Boze wolf","Kikkerkoning","Klein Duimpje"
  ],

  "Technologie": [
    "Smartphone","Laptop","Computer","Tablet","Smartwatch","Oordopjes","Oplader","Powerbank","Wifi","Bluetooth",
    "USB-stick","Harde schijf","Cloud","Toetsenbord","Muis","Beeldscherm","Printer","Webcam","Drone","Robot",
    "Robotstofzuiger","3D-printer","VR-bril","Spelcomputer","Controller","App","Emoji","Selfie","Wachtwoord","QR-code",
    "Streamingdienst","Podcast","Kunstmatige intelligentie","Chatbot","Algoritme","Server","Raspberry Pi","Zonnepaneel","Elektrische auto","Navigatiesysteem",
    "Slimme speaker","Beveiligingscamera","Screenshot","Software-update","Virusscanner","Browser","E-mail","Videobellen","Gameheadset","Satelliet"
  ],

  "Minecraft Blokken": [
    "Grass Block","Dirt","Stone","Cobblestone","Bedrock","Sand","Gravel","Oak Log","Oak Planks","Glass",
    "Obsidian","TNT","Crafting Table","Furnace","Chest","Ender Chest","Bookshelf","Anvil","Enchanting Table","Brewing Stand",
    "Hopper","Piston","Observer","Redstone Block","Note Block","Jukebox","Beacon","Coal Ore","Iron Ore","Gold Ore",
    "Diamond Ore","Emerald Ore","Redstone Ore","Ancient Debris","Netherite Block","Diamond Block","Netherrack","Soul Sand","Glowstone","Magma Block",
    "End Stone","Dragon Egg","Shulker Box","Slime Block","Wool","Sponge","Ice","Pumpkin","Hay Bale","Spawner"
  ],

  "Marvel Characters": [
    "Iron Man","Captain America","Thor","Hulk","Black Widow","Hawkeye","Spider-Man","Doctor Strange","Black Panther","Captain Marvel",
    "Ant-Man","Wasp","Scarlet Witch","Vision","Falcon","Winter Soldier","War Machine","Star-Lord","Gamora","Drax",
    "Rocket Raccoon","Groot","Mantis","Nebula","Thanos","Loki","Nick Fury","Deadpool","Wolverine","Professor X",
    "Magneto","Storm","Cyclops","Jean Grey","Beast","Mystique","Daredevil","Punisher","Ghost Rider","Blade",
    "Venom","Green Goblin","Doctor Octopus","Ultron","Hela","Killmonger","Shang-Chi","Moon Knight","She-Hulk","Silver Surfer"
  ],

  "Frituursnacks": [
    "Frikandel","Frikandel speciaal","Kroket","Rundvleeskroket","Satékroket","Goulashkroket","Kaaskroket","Garnalenkroket","Groentekroket","Bitterbal",
    "Bamischijf","Nasibal","Kaassoufflé","Kipcorn","Kipnuggets","Kipfingers","Mexicano","Viandel","Pikanto","Sito-stick",
    "Smulrol","Shaslick","Berehap","Loempia","Mini-loempia","Vlammetje","Gehaktbal","Braadworst","Curryworst","Knakworst",
    "Hamburger","Cheeseburger","Patatje oorlog","Patatje joppie","Patatje speciaal","Patatje pinda","Kapsalon","Kibbeling","Lekkerbekje","Visstick",
    "Churros","Uienringen","Twisterfriet","Vlaamse friet","Zoete-aardappelfriet"
  ],

  "Merken": [
    "Nike","Adidas","Puma","Coca-Cola","Pepsi","Fanta","Red Bull","Monster Energy","McDonald's","Burger King",
    "KFC","Subway","Domino's","Starbucks","Apple","Samsung","Sony","Nintendo","PlayStation","Xbox",
    "Google","Microsoft","Netflix","Spotify","YouTube","TikTok","Instagram","WhatsApp","Lego","IKEA",
    "H&M","Heineken","Tony's Chocolonely","Gucci","Rolex","Ferrari","Lamborghini","Porsche","BMW","Mercedes",
    "Tesla","Volkswagen","Shell","Albert Heijn","Jumbo","Lidl","HEMA","Bol.com","Coolblue","Philips"
  ],

  "Monsters & Wezens": [
    "Draak","Zombie","Vampier","Weerwolf","Mummie","Spook","Boeman","Skelet","Demon","Duivel",
    "Trol","Ork","Goblin","Oger","Reus","Golem","Gargoyle","Cycloop","Minotaurus","Centaur",
    "Griffioen","Feniks","Basilisk","Hydra","Cerberus","Medusa","Sfinx","Pegasus","Sirene","Banshee",
    "Kraken","Leviathan","Zeeslang","Bigfoot","Yeti","Monster van Loch Ness","Chupacabra","Wendigo","Mothman","Slenderman",
    "Poltergeist","Godzilla","King Kong","Frankenstein","Alien","Djinn","Kitsune","Harpij","Naga","Gremlin"
  ],

  "Leeftijden": Array.from({ length: 100 }, (_, i) => String(i + 1))

};

// Emoji per categorie (voor de knoppen in de app).
// Nieuwe categorie zonder emoji hier? Dan krijgt hij automatisch 📦.
const CAT_EMOJI = {
  "Dieren": "🦁",
  "Eten & Drinken": "🍕",
  "Sport & Spel": "⚽",
  "Landen": "🌍",
  "Steden": "🏙️",
  "Beroepen": "👷",
  "Films & Series": "🎬",
  "In Huis": "🛋️",
  "Natuur & Buiten": "🌳",
  "Vervoer": "🚗",
  "Vakantie": "🏖️",
  "Muziek": "🎵",
  "Lichaam & Gezondheid": "💪",
  "Feest & Uitgaan": "🎉",
  "Fantasie & Sprookjes": "🐉",
  "Technologie": "📱",
  "Minecraft Blokken": "⛏️",
  "Marvel Characters": "🦸",
  "Frituursnacks": "🍟",
  "Merken": "🏷️",
  "Monsters & Wezens": "👹",
  "Leeftijden": "🎂"
};
