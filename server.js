const dao = require("./dao.js")
const service = require("./service.js")

const express = require('express')
// const _ = require('lodash')
const fetch = require('node-fetch')
const app = express()

app.use(express.static('static'))

app.get('/api/posts', (req, res) => {
  dao.findAll().then(docs => {
    res.send(docs)
  }).catch(err => res.status(500).send('err ' + err))
})

app.get('/api/post/:id',  (req, res) => {
  console.log('got me!!');
  // search post with id in mongodb
  dao.findOne({name: req.params.id + '.org'})
    .then(post => {
      if (post === undefined) return res.status(404).send('no such post')
      res.send(post)
    })
  // save and send to res
})

app.get('/api/sync',  (req, res) => {
  // get github
  let promGit = fetch('https://api.github.com/repos/whitemuu/blog/contents/posts')
      .then(res => res.json())
      .catch(err => console.error(err))

  // get mondb
  let promMon = dao.findAll()
      .catch(err => console.error(err))

  Promise.all([promGit, promMon]).then(args => {

    let [postsInGit, postsInMon] = args
    // console.log(postsInMon);
    // construct data as {'20182222.org':{xxx}, '20183333.org': {yyy}}
    const pgs = {}
    postsInGit.forEach(e => pgs[e.name] = e)
    const pms = {}
    postsInMon.forEach(e => pms[e.name] = e)

    // add
    const toAdd = Object.keys(pgs).filter(key => pms[key] === undefined)
    if (toAdd.length !== 0) {
      // TODO is addPost return immediately?
      console.log('toAdd ' + toAdd);
      toAdd.forEach(key => service.addPost(pgs[key]))
    } else{ console.log('non to add') }

    // remove; only in MongoDB
    let toRemove = Object.keys(pms).filter(key => pgs[key] === undefined)
    if (toRemove.length !== 0) {
      toRemove = toRemove.map(key => ({name: key}))
      console.log('toRemove: ' + toRemove);
      toRemove.forEach(entry => {
        dao.deleteOne(entry)
          .then(rst => console.log(toRemove.name + ' removed'))
          .catch(e => console.log('errors: \n' + e))
      })
    } else {
      console.log('non to remove');
    }

    // update
    const toUpdate = Object.keys(pgs).filter(key => pms[key] !== undefined && (pms[key].sha !== pgs[key].sha))
    if (toUpdate.length !== 0) {
      console.log('toUpdate ' + toUpdate);
      toUpdate.forEach(key => service.updatePost(pgs[key]))
    }else {console.log('non to update')}

  }).then(()=> res.send('synced!'))
    .catch(err => res.status(500).send(err))
})

// webhook
app.get('/api/reelin', (req, res) => {
  res.send('to be done')
})

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
