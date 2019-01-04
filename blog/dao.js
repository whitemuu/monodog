const MongoClient = require('mongodb').MongoClient
const assert = require('assert');
const fetch = require('node-fetch')

const url = `mongodb://${process.env.MONGODOMAIN || 'localhost'}:27017`

function getCollection(collection) {
  return new MongoClient(url, { useNewUrlParser: true })
    .connect().then(cli => [cli, cli.db('blog').collection(collection)]);
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

exports.insertOne = (doc, collection) => getCollection(collection).then(([cli, collection]) => {
  return collection.insertOne(doc).finally(cli.close())
})

exports.insertMany = (docs, collection) => getCollection(collection).then(([cli, collection]) => {
  return collection.insertMany(docs)
    .finally(() => cli.close())
})

exports.findAll = (collection) => getCollection(collection).then(([cli, collection]) => {
  try {
    return collection.find({}).project({name: 1,sha: 1,tags: 1, title: 1, _id: 0}).sort({name: -1}).toArray()
  } finally{
    cli.close()
  }
})

exports.findOne = (query, collection) => getCollection(collection).then(([cli, collection]) => {
  try {
    return collection.find(query).toArray().then(array => array[0])
  } finally{
    cli.close()
  }
})

exports.updateOne = (query, entry, collection) => getCollection(collection).then(([cli, collection]) => {
  try {
    return collection.updateOne(query, entry)
  }finally{
    cli.close()
  }
})

exports.deleteOne = (name, collection) => getCollection(collection).then(([cli, collection]) => {
  try {
    name = (value => ({name: value}))(name)
    return collection.deleteOne(name)
  }finally{
    cli.close()
  }
})

