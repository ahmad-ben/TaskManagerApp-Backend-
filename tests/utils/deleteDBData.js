const { default: mongoose } = require("mongoose");

const deleteDBData = async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) await collection.deleteMany({});
};

module.exports = deleteDBData;