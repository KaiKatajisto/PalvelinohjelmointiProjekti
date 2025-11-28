PROJEKTI: Palvelinohjelmointi Projekti (Node.js REST API & ORM)
TEKIJÄ: Kai Katajisto, TITE23
KUVAUS: Harjoitustyö, jossa toteutetaan REST API ja Web-käyttöliittymä.
        Teknologioina Node.js, Express, Sequelize ja SQLite.

----------------------------------------------------------------------

TIIVISTELMÄ
Tämä sovellus ratkaisee klassisen "N+1 -kyselyn ongelman" käyttämällä
Sequelize ORM:n Eager Loading -ominaisuutta. Sovellus tarjoaa kaksi
rajapintaa samaan dataan:

1. Graafinen käyttöliittymä (HTML) selaimelle.
2. REST API (JSON) muille sovelluksille.

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
   - Palauttaa: HTML-sivun, jossa listataan henkilöt ja osoitteet.
   - Kuvaus: Havainnollistaa "Eager Loading" -haun tulokset visuaalisesti.

2. OSOITTEET (UI)
   - URL: http://localhost:3000/addresses
   - Metodi: GET
   - Palauttaa: HTML-sivun, käänteinen haku (Osoite -> Asukkaat).

3. REST API (JSON)
   - URL: http://localhost:3000/api/persons
   - Metodi: GET
   - Palauttaa: JSON-dataa (lista henkilöistä ja heidän osoitteistaan).
   - Kuvaus: Koneluettava rajapinta, täyttää REST API -vaatimukset.

======================================================================
TIETOKANTA
======================================================================
Sovellus käyttää SQLite-tietokantaa. Käynnistyksen yhteydessä sovellus:
1. Luo tiedoston "database.sqlite" juurikansioon (jos ei olemassa).
2. Synkronoi tietokantamallit (luo taulut People ja Addresses).
3. Ajaa seed-scriptin, joka täyttää taulut testidatalla.

Huom: Demotarkoituksessa tietokanta nollataan jokaisella käynnistyskerralla.