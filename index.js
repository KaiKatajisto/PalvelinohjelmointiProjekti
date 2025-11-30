
// VAROITUS: Koodi on sekavaa ja se on täynnä henkilökohtaisia ymmärryksiä sen toiminnasta.
// Se sisältää sekä englantia, että suomea. Ruotsia en lähtenyt harjoittelemaan.
// En ole vieläkään varma miten kaikki toimii, mutta jonkinlainen idea on.
// Terveisin. K.K

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const seedDatabase = require('./seed');
const { format } = require('sql-formatter'); // Nättiä SQL-kyselyä. HUOM. Tämä joskus jumittaa, mutta sen voi ratkaista konsolissa peruuttamalla toiminnon CTRL-C konsolissa!

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Tutkin SQL-kyselyitä käyttämällä sqlformatteria: "npm install sql-formatter" Muuta "logging: true", jos haluat normaalin näkymän.
// 1. Käytetään SQLiteä MySQLän sijasta.

// APUFUNKTIO: Tämä luo kustomoidun loggerin, joka kertoo KUKA kyselyn teki.
const createLogger = (lahettaja) => (msg) => {
  // Poistetaan oletusteksti
  const cleanSql = msg.replace('Executing (default): ', '');

  // Turvamekanismi isoille kyselyille
  if (cleanSql.length > 1000) {
    console.log(`\n[${lahettaja}] suoritti massiivisen kyselyn (ei tulosteta).`);
    return;
  }

  // Tässä on se haluamasi teksti:
  console.log(`\nSQL-KYSELY, minkä ${lahettaja} lähetti:`);
  console.log('----------------------------------------------------------------');
  console.log(format(cleanSql, {
    language: 'sqlite',
    tabWidth: 2,
    keywordCase: 'upper',
  }));
  console.log('----------------------------------------------------------------\n');
};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  freezeTableName: true,
  // Käytetään oletuksena tätä nimeä, jos ei muuta määritellä
  logging: createLogger('Järjestelmä (Startup/Seed)') 
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

// Vaikka rakenne on eri, molemmat rivit käsittelevät vain Person taulua.
// Address.hasMany(Person,..):    - Address: "Siirry (Person) tauluun ja etsi sieltä kaikki rivit, joissa on minun numeroni sarakkeessa addressId."
// Person.belongsTo(Address,..):  - Person: "Tässä (Person) omassa taulussani on sarake nimeltä addressId. Käytä sitä etsiäksesi minulle pari."

// ------------------------------------------------------------------
// 5. DEMO ENDPOINTIT (API)
// ------------------------------------------------------------------

app.get('/', async (req, res) => {
  res.render('index');
});

// 5.1: LAZY LOADING / BAD PRACTICE (API)
app.get('/api/lazy', async (req, res) => {
  const persons = await Person.findAll({
    // Kerrotaan kuka kysyy
    logging: createLogger('API: Lazy Loading (Huono tapa)') 
  }); 
  res.json(persons);
});

// 5.2: EAGER LOADING (API) - "The Good Way"
app.get('/api/eager', async (req, res) => {
  const persons = await Person.findAll({ 
    include: {
      model: Address,
      as: 'address' 
    },
    logging: createLogger('API: Eager Loading (Include)')
  });
  res.json(persons);
});

// 5.3: OPTIMIZED LOADING (API) - "Karsittu tieto"
app.get('/api/optimized', async (req, res) => {
  const persons = await Person.findAll({
    attributes: ['firstName', 'lastName'],
    include: {
      model: Address,
      as: 'address',
      attributes: ['street']
    },
    logging: createLogger('API: Optimized (Karsittu data)')
  });
  res.json(persons);
});

// 5.4: REVERSE LOOKUP (API) - "Käänteinen haku"
app.get('/api/reverse', async (req, res) => {
  const addresses = await Address.findAll({
    include: {
      model: Person,
      as: 'persons'
    },
    logging: createLogger('API: Reverse Lookup (Osoite -> Asukkaat)')
  });
  res.json(addresses);
});

// 5.5: RAW / FLAT DATA (Mitä tietokanta oikeasti palauttaa)
// Tässä kytkemme Sequelizen "älykkyyden" pois päältä.
app.get('/api/raw', async (req, res) => {
  const persons = await Person.findAll({
    include: {
      model: Address,
      as: 'address'
    },
    raw: true,  // Anna raakana, älä muotoile"
    nest: false, // Estää sisäkkäisten olioiden luonnin

    logging: createLogger('API: Raw / Flat Data (Ilman ORM-muunnosta)')
  });
  res.json(persons);
});

// Kaikissa tapauksissa Sequelize on fiksu ja hakee tiedot yhdellä ainoalla kyselyllä.
// Ero on siinä, että optimoidussa versiossa säästämme kaistaa ja muistia jättämällä turhat sarakkeet, kuten ID:t ja aikaleimat, kokonaan hakematta.
// Ainut tapa suorittaa enemmän kyselyitä on joko pyörittää looppia (ei suositeltavaa) tai hakea eri tietoa eri pöydistä (tai eri tavalla)

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