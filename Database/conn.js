import mongoose from "mongoose";
// import { MongoMemoryServer } from "mongodb-memory-server";
import ENV from '../config.js'
 async function connect(){
    // const Mongod=await MongoMemoryServer.create();
    // const getUri=Mongod.getUri();
    mongoose.set('strictQuery',true)
    const db=await mongoose.connect(ENV.ATLAS_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    console.log('Database Connected');
    return db;
}
export default connect
//testing