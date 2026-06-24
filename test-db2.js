const mongoose = require('mongoose');

const uri = "mongodb://securescripters_db_user:x7kRClSSrytjGoFo@ac-fxmpfyw-shard-00-00.o3z5u1k.mongodb.net:27017,ac-fxmpfyw-shard-00-01.o3z5u1k.mongodb.net:27017,ac-fxmpfyw-shard-00-02.o3z5u1k.mongodb.net:27017/vigil?ssl=true&replicaSet=atlas-something-shard-0&authSource=admin&retryWrites=true&w=majority";
// Wait, I don't know the exact replicaSet name. Let me test without replicaSet or just ssl=true.

async function testConnection() {
  try {
    const testUri = "mongodb://securescripters_db_user:x7kRClSSrytjGoFo@ac-fxmpfyw-shard-00-00.o3z5u1k.mongodb.net:27017,ac-fxmpfyw-shard-00-01.o3z5u1k.mongodb.net:27017,ac-fxmpfyw-shard-00-02.o3z5u1k.mongodb.net:27017/vigil?ssl=true&authSource=admin&retryWrites=true&w=majority";
    console.log('Connecting to non-SRV uri');
    await mongoose.connect(testUri);
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
}

testConnection();
