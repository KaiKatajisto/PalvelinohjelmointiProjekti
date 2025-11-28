// seed.js
const seedDatabase = async (Person, Address) => {
  // 1. Luodaan dataa:
  const addresses = 
  await Address.bulkCreate([
    { id: 1, street: '33531 Portage Point' },
    { id: 2, street: '06 Dennis Pass' },
    { id: 3, street: '6364 Independence Parkway' },
    { id: 4, street: '24 Ridgeview Junction' },
    { id: 5, street: '29171 Barby Street' },
    { id: 6, street: '6718 Mosinee Court' },
    { id: 7, street: '7 Red Cloud Point' },
    { id: 8, street: '204 Bluestem Parkway' },
    { id: 9, street: '1865 Rusk Junction' },
    { id: 10, street: '986 Pearson Park' }
  ], { ignoreDuplicates: true });

  // 2. Luodaan Persons:
  // Yhdistän ne osoitteisiin käyttäen addressId:tä.
  await Person.bulkCreate([
    { firstName: 'Drona', lastName: 'La Grange', addressId: 1 },
    { firstName: 'Teodoor', lastName: 'Lawrey', addressId: 2 },
    { firstName: 'Noelle', lastName: 'Stute', addressId: 3 },
    { firstName: 'Lilith', lastName: 'MacNelly', addressId: 4 },
    { firstName: 'Christy', lastName: 'Chalfain', addressId: 5 },
    { firstName: 'Aubrey', lastName: 'Collard', addressId: 6 },
    { firstName: 'Dylan', lastName: 'Extil', addressId: 7 },
    { firstName: 'Brendan', lastName: 'Edmand', addressId: 8 },
    { firstName: 'Ramonda', lastName: 'Fronzek', addressId: 9 },
    { firstName: 'Alwyn', lastName: 'Eplate', addressId: 10 }
  ], { ignoreDuplicates: true });

  console.log('Database populated with imported data.');
};

module.exports = seedDatabase;