const dao = require('./dao.js')
const assert = require('assert');


// dao.readAll().then(docs => console.log(docs)).catch(err => console.log(err))
// dao.findOne({name: '1812111406.org'}).then(doc => console.log(doc)).catch(err => console.log(err))

dao.deleteMany([{name: "221313"}])
  .then(rst => console.log(rst.deletedCount + 'removed'))
  .catch(e => console.log('errors: \n' + e))
console.log('hi');
// const posts = [{name: "12394", title: "hello a"},
//                {name: "42354235", title: "hello b"}]
// dao.create(posts).then(rst => console.log(rst.insertedCount)).catch(err => console.log(err))

