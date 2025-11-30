PROJEKTI: Palvelinohjelmointi Projekti (Node.js REST API & ORM Demo)
TEKIJÄ: Kai Katajisto, TITE23
KUVAUS: Harjoitustyö, jossa toteutetaan REST API ja Web-käyttöliittymä.
        Teknologioina Node.js, Express, Sequelize ja SQLite.

----------------------------------------------------------------------

TIIVISTELMÄ
Tämä sovellus on rakennettu opetusvälineeksi havainnollistamaan "N+1 -kyselyn ongelmaa"
ja ORM-kirjastojen (Sequelize) toimintaa. Sovellus tarjoaa "kojelaudan", josta voi
ajaa erilaisia tietokantakyselyitä ja nähdä erot suorituskyvyssä ja datan rakenteessa.

Tietokantana toimii kevyt, tiedostopohjainen SQLite (vastaa Java-kurssin H2-kantaa).
Sovellus luo käynnistyessään automaattisesti tietokantatiedoston ja alustaa testidatan.

======================================================================
TEKNOLOGIAT
======================================================================
- Runtime:   	Node.js
- Framework: 	Express.js
- Tietokanta: 	SQLite (Serverless, tiedostopohjainen)
- ORM:       	Sequelize (Hoitaa tietokantakyselyt ja relaatiot)
- View:      	EJS (HTML-renderöinti)
- Työkalut:     sql-formatter (SQL-lauseiden kaunisteluun konsolissa)

======================================================================
ASENNUS JA KÄYNNISTYS (VAIHTOEHTO A: NODE.JS)
======================================================================
Vaatimus: Node.js asennettuna koneelle.

1. Avaa terminaali projektikansiossa.

2. Asenna riippuvuudet:
   npm install

3. Käynnistä sovellus:
   npm start
   (Tai manuaalisesti: node index.js)

   Huom: Oletusportti on 3000. Voit vaihtaa sen asettamalla
   ympäristömuuttujan PORT (esim. PORT=8080 node index.js).

4. Avaa selain: http://localhost:3000

======================================================================
ASENNUS JA KÄYNNISTYS (VAIHTOEHTO B: DOCKER)
======================================================================
Vaatimus: Docker Desktop asennettuna. Ei vaadi Node.js-asennusta.

1. Rakenna Docker-image:
   docker build -t node-app .

2. Käynnistä kontti:
   docker run -p 3000:3000 node-app

   (Sovellus vastaa nyt osoitteessa http://localhost:3000)

======================================================================
RAJAPINNAT (ENDPOINTS)
======================================================================

1. PÄÄSIVU (UI)
   - URL: http://localhost:3000/
   - Metodi: GET
   - Palauttaa: HTML-hallintapaneelin linkkeineen.
   - Kuvaus: Toimii demon "kaukosäätimenä".

2. API-DEMOT (JSON REST)
   Nämä endpointit palauttavat JSON-dataa ja tulostavat palvelimen konsoliin
   tarkan SQL-kyselyn, jonka ORM suoritti.

   A) LAZY LOADING (Huono tapa)
      - URL: /api/lazy
      - Kuvaus: Hakee vain henkilöt, osoitetieto jää puuttumaan.

   B) EAGER LOADING (Hyvä tapa)
      - URL: /api/eager
      - Kuvaus: Käyttää "include"-toimintoa. Hakee kaiken yhdellä JOIN-kyselyllä.

   C) OPTIMIZED (Karsittu data)
      - URL: /api/optimized
      - Kuvaus: Hakee vain tarvittavat tekstikentät, jättää ID:t ja aikaleimat pois.

   D) REVERSE LOOKUP (Käänteinen haku)
      - URL: /api/reverse
      - Kuvaus: Hakee osoitteet ja listaa niiden asukkaat (Address -> Persons).

   E) RAW DATA (Tietokannan totuus)
      - URL: /api/raw
      - Kuvaus: Palauttaa datan litteänä listana ilman ORM:n tekemää sisäkkäistä
        objektimuunnosta. Havainnollistaa miksi ORM on hyödyllinen.

======================================================================
TIETOKANTA
======================================================================
Sovellus käyttää SQLite-tietokantaa.
Käynnistyksen yhteydessä sovellus:
1. Luo tiedoston "database.sqlite" juurikansioon (jos ei olemassa).
2. Synkronoi tietokantamallit (luo taulut People ja Addresses).
3. Ajaa seed-scriptin, joka täyttää taulut massiivisella testidatalla.

Huom: Demotarkoituksessa tietokanta nollataan (DROP TABLE) jokaisella käynnistyskerralla.