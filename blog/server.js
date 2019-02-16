const dao = require("./dao.js")
const service = require("./service.js")

const express = require('express')
// const _ = require('lodash')
const fetch = require('node-fetch')
const app = express()

// app.use(require('prerender-node'))
app.use(express.json())
// css, js, images
app.use(express.static(__dirname + '/static'))

app.get('/api/posts', (req, res) => {
  dao.findAll('posts').then(docs => {
    res.send(docs)
  }).catch(err => res.status(500).send('err ' + err))
})

app.get('/api/notes', (req, res) => {
  dao.findAll('notes').then(docs => {
    res.send(docs)
  }).catch(err => res.status(500).send('err ' + err))
})

app.get('/api/tags', (req, res) => {
  dao.findAll('posts').then(docs => {
    // new tags first, thus reverse
    let tags = docs.map(e => e.tags).reverse().join(' ')
    res.send(tags)
  }).catch(err => res.status(500).send('err ' + err))
})

app.get('/api/post/:id',  (req, res) => {
  dao.findOne({name: req.params.id + '.org'}, 'posts')
    .then(post => {
      if (post === undefined) return res.status(404).send('no such post')
      res.send(post)
    })
})

function mirrorToMongo(entriesInGit, entriesInMon, collection) {
  // construct data like {'20182222.org':{xxx}, '20183333.org': {yyy}}
  const egs = {}
  entriesInGit.forEach(e => egs[e.name] = e)
  const ems = {}
  entriesInMon.forEach(e => ems[e.name] = e)

  // add
  const toAdd = Object.keys(egs).filter(key => ems[key] === undefined)
  if (toAdd.length !== 0) {
    console.log('toAdd ' + toAdd.join(' '));
    toAdd.forEach(name => service.addEntry(name, collection))
  } else{ console.log('non to add') }

  // remove; only in MongoDB
  let toRemove = Object.keys(ems).filter(key => egs[key] === undefined)
  if (toRemove.length !== 0) {
    console.log('toRemove: ' + toRemove.join(' '));
    toRemove.forEach(name => {
      dao.deleteOne(name, collection)
        // .then(rst => console.log(name + ' removed'))
        .catch(e => console.log('errors: \n' + e))
    })
  } else {
    console.log('non to remove');
  }

  // update
  const toUpdate = Object.keys(egs).filter(key => ems[key] !== undefined && (ems[key].sha !== egs[key].sha))
  if (toUpdate.length !== 0) {
    console.log('toUpdate: ' + toUpdate.join(','));
    toUpdate.forEach(name => service.updateEntry(name, collection))
  }else {console.log('non to update')}
}

app.get('/api/sync',  (req, res) => {
  // get github
  let promGit = fetch('https://api.github.com/repos/whitemuu/blog/contents/posts')
      .then(res => res.json())
      .catch(err => console.error(err))

  // get mondb
  let promMon = dao.findAll('posts')
      .catch(err => console.error(err))

  Promise.all([promGit, promMon]).then(args => {
    mirrorToMongo(...args, 'posts')
  }).then(()=> res.send('synced!'))
    .catch(err => res.status(500).send(err))
})

// webhook
app.post('/api/reelin', (req, res) => {
  // const commit = req.body.head_commit
  const commits = req.body.commits
  let message = ""
  for (let commit of commits) {
    if (commit.added.length !== 0) {
      commit.added.forEach(name => {
        if (name.startsWith('posts/') || name.startsWith('notes/')) {
          service.addEntry(name.substr(6), name.substr(0, 5))
          message += `${name} added\n`
        }
      })
    }
    if (commit.modified.length !== 0) {
      commit.modified.forEach(name => {
        if (name.startsWith('posts/') || name.startsWith('notes/')) {
          service.updateEntry(name.substr(6), name.substr(0, 5))
          message += `${name} updated\n`
        }
      })
    }

    if (commit.removed.length !== 0) {
      commit.removed.forEach(name => {
        if (name.startsWith('posts/') || name.startsWith('notes/')) {
          dao.deleteOne(name.substr(6), name.substr(0, 5))
          message += `${name} removed\n`
        }
      })
    }
  }

  if (message) {
    res.send(message)
  } else {
    res.send('nothing to be done')
  }
})

app.get('/robots.txt', (req, res) => {
  res.sendFile(__dirname + '/robots.txt')
})

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const port = process.env.PORT || 80
app.listen(port, () => console.log(`App listening on port ${port}!`))
