const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const org = require("org")
const fetch = require('node-fetch')

const client = new MongoClient("mongodb://localhost:28001", { useNewUrlParser: true })

exports.create = (docs) => client.connect().then(cli => {
  try{
    return cli.db('blog').collection('posts').insertMany(docs)
  }finally{
    // TODO
    // cli.close()
  }
})

exports.readAll = () => client.connect().then(cli => {
  try{
    return cli.db('blog').collection('posts').find({}, {name: 0, _id: 0}).toArray()
  }finally{
    // cli.close()
  }
})

exports.del = (docs) => client.connect().then(cli => {
  try{
    return cli.db('blog').collection('posts').deleteMany(docs)
  }finally{
    // cli.close()
  }
})
