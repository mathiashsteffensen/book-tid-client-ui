import mongoose from 'mongoose'

const connection = {}

async function dbConnect() {
  if (connection.isConnected) {
    return connection.db
  }

  const db = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })

  connection.isConnected = db.connections[0].readyState
  connection.db = db

  return db
}

export default dbConnect