const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const fetch = require('node-fetch')

function getCollection() {
  return new MongoClient("mongodb://localhost:28001", { useNewUrlParser: true })
    .connect().then(cli => [cli, cli.db('blog').collection('posts')]);
}

// TODO
// function conduct(operation, docs) {
//   return getCollection().then(([cli, collection]) => {
//     try {
//       return operation.apply(collection, docs)
//     } finally{
//       cli.close()
//     }
//   })
// }

// exports.findAlll = () => conduct(MongoClient.f)

exports.insertOne = (doc) => getCollection().then(([cli, collection]) => {
  return collection.insertOne(doc).finally(cli.close())
})

exports.insertMany = (docs) => getCollection().then(([cli, collection]) => {
  return collection.insertMany(docs)
    .finally(() => cli.close())
})

exports.findAll = () => getCollection().then(([cli, collection]) => {
  try {
    return collection.find({}).project({name: 1,sha: 1,tags: 1, title: 1, _id: 0}).toArray()
  } finally{
    cli.close()
  }
})

exports.findOne = (query) => getCollection().then(([cli, collection]) => {
  try {
    return collection.find(query).toArray().then(array => array[0])
  } finally{
    cli.close()
  }
})

exports.updateOne = (query, post) => getCollection().then(([cli, posts]) => {
  try {
    return posts.updateOne(query, post)
  }finally{
    cli.close()
  }
})

exports.deleteOne = (doc) => getCollection().then(([cli, posts]) => {
  try {
    return posts.deleteOne(doc)
  }finally{
    cli.close()
  }
})

