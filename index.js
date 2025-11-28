
// VAROITUS: Koodi on sekavaa ja se on täynnä henkilökohtaisia ymmärryksiä sen toiminnasta.
// Se sisältää sekä englantia, että suomea. Ruotsia en lähtenyt harjoittelemaan.
// En ole vieläkään varma miten kaikki toimii, mutta jonkinlainen idea on.
// Terveisin. K.K

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const seedDatabase = require('./seed');
const { format } = require('sql-formatter'); // Nättiä SQL-kyselyä.

const app = express();
const port = process.env.PORT;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Tutkin SQL-kyselyitä käyttämällä sqlformatteria: "npm install sql-formatter" Muuta "logging: true", jos haluat normaalin näkymän.
// 1. Käytetään SQLiteä MySQLän sijasta.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  freezeTableName: true, // Tämä estää pluralization ominaisuudet toimimasta (uudelleen nimeäys sequelizessä).
  logging: (msg) => {
    // Poistetaan oletusteksti alusta
    const cleanSql = msg.replace('Executing (default): ', '');

    // TURVAMEKANISMI:
    // Jos SQL-lause on yli 1000 merkkiä pitkä (esim. seed data), 
    // älä yritä muotoilla sitä, koska se jumittaa konsolin.
    if (cleanSql.length > 1000) {
      console.log(`\n[SUURI SQL-KYSELY SUORITETTU] (${cleanSql.length} merkkiä) - Ei tulosteta kokonaan.\n`);
      return; 
    }

    // Normaalit (lyhyet) kyselyt muotoillaan nätisti
    console.log('\n----------------------------------------------------------------');
    console.log(format(cleanSql, {
      language: 'sqlite',
      tabWidth: 2,
      keywordCase: 'upper',
    }));
    console.log('----------------------------------------------------------------\n');
  }
});

// 2. Määritellään Address-malli (Model):
const Address = sequelize.define('Address', { 
  street: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false }); // Oletuksena Sequelize lisää tauluihin automaattisesti sarakkeet createdAt (luotu) ja updatedAt (muokattu).

// 3. Määritellään Person-malli (Model):
const Person = sequelize.define('Person', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: false,
     freezeTableName: true }); // Sequalize tekee jänniä asioita pöytien nimien kanssa joskus. "a built-in feature called Automatic Pluralization." Sekaannuksen vuoksi, jäädytin sen.

// 4. Tässä luodaan silta kahden taulun välille. Ilman näitä rivejä Sequelize ei tietäisi, että henkilöt liittyvät osoitteisiin.
Address.hasMany(Person, { foreignKey: 'addressId', as: 'persons' }); // @OneToMany // Tämä ei ole pakollinen, mutta kuuluu hyviin käytäntöihin ja mahdollistaa käänteisen haun "Address.findAll()"
Person.belongsTo(Address, { foreignKey: 'addressId', as: 'address' }); // @ManyToOne

//// Vaikka rakenne on eri, molemmat rivit käsittelevät vain Person taulua.
// Address.hasMany(Person,..):    - Address: "Siirry (Person) tauluun ja etsi sieltä kaikki rivit, joissa on minun numeroni sarakkeessa addressId."
// Person.belongsTo(Address,..):  - Person: "Tässä (Person) omassa taulussani on sarake nimeltä addressId. Käytä sitä etsiäksesi minulle pari."

// 5. Polku
app.get('/', async (req, res) => {
  const persons = await Person.findAll({ // Koska findAll-funktiolle ei ole annettu where-ehtoa (esim. where: { id: 1 }), se hakee jokaisen ihmisen tietokannasta.
    // Koska koodista puuttuu attributes-lista, Sequelize tekee ns. SELECT * -kyselyn. Se hakee kaikki sarakkeet: id, firstName, lastName, createdAt, updatedAt ja addressId.
    include: { // hakee myös jokaisen löydetyn ihmisen osoitteen kaikki tiedot (id, street).
      model: Address,
      as: 'address'
    }
  });
  res.render('index', { persons: persons });
});

// 6. Polku addresses (tehdään käänteinen haku Address kautta)
app.get('/addresses', async (req, res) => {
  const addresses = await Address.findAll({
    include: {
      model: Person,
      as: 'persons' // TÄRKEÄ: Tämä pitää vastata hasMany-määrittelyä!
    }
  });

  // Renderöidään eri näkymä (tai sama, jos logiikka sallii)
  res.render('addresses', { addresses: addresses });
});

app.get('/api/persons', async (req, res) => {
  const persons = await Person.findAll({ include: { model: Address, as: 'address' } });
  res.json(persons); // Palauttaa JSON, nyt se on api eikä palvelin applikaatio. :-)
});

/*
app.get('/', async (req, res) => {
  const persons = await Person.findAll({
    attributes: ['firstName', 'lastName'], // <-- KARSITAAN: Ei haeta muuta kuin etu- ja sukunimi.
    include: {
      model: Address,
      as: 'address',
      attributes: ['street'] // <-- KARSITAAN: Ei haeta muuta kuin katu.
    }
  });
  res.render('index', { persons: persons });
});
*/

// Molemmissa tapauksissa Sequelize on fiksu ja hakee tiedot yhdellä ainoalla kyselyllä (JOIN).
// Ero on siinä, että optimoidussa versiossa säästämme kaistaa ja muistia jättämällä turhat sarakkeet, kuten ID:t ja aikaleimat, kokonaan hakematta.
// Ainut tapa suorittaa enemmän kyselyitä on joko pyörittää looppia tai hakea eri tietoa eri pöydistä (tai eri tavalla)

// 6. Palvelimen käynnistys
const startServer = async () => {
  try {
    // 1. Yritetään yhdistää (SQLite yhdistää automaattisesti)
    await sequelize.authenticate();
    console.log('Database connection OK.');

    // 2. Synkronoidaan mallit
    // "force: true" pyyhkii databasen aina tyhjäksi, hyvä testausta varten.
    await sequelize.sync({ force: true });
    console.log('Database synced.');

    // 3. Käytetään Seed Dataa:
    console.log('Seeding data from file...');
    await seedDatabase(Person, Address);
    console.log('Test data created.');

    // 4. Käynnistetään palvelin
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Open http://localhost:${port} in your browser`);
    });

  } catch (error) {
    console.error('Application setup failed:', error);
  }
};

startServer();