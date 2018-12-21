const dao = require("./dao.js")
const org = require("org")
const fetch = require('node-fetch')

const parser = new org.Parser();

exports.addPost = function (post) {
  genNew(post).then(post => {
    dao.insertOne(post).then(re => console.log(re.n + ' ' + post.name +' instered')).catch(e => console.log(e))
  }).catch(err => console.error(err))
}

// exports.addPost({name: '1812111403.org', sha: 'jjj'})
exports.updatePost = function (post) {
  genNew(post).then(post => {
    dao.updateOne({name: post.name}, {$set: post})
  }).catch(err => console.error(err))
}


function genNew(post) {
  return fetch('https://raw.githubusercontent.com/whitemuu/blog/master/posts/' + post.name)
    .then(res => res.text())
    .then(article => {

      // const regex = /#\+TAGS:\ *(.+)\n/;
      // let tags = regex.exec(article)[1]
      const orgDocument = parser.parse(article)
      const orgHTMLDocument = orgDocument.convert(org.ConverterHTML, {
        headerOffset: 1,
        exportFromLineNumber: false,
        suppressSubScriptHandling: false,
        suppressAutoLink: false
      })

      post = (({name, sha, html_url}) => ({name, sha, html_url}))(post)
      post.tags = orgDocument.directiveValues['tags:']
      post.title = orgDocument.title
      post.content = orgHTMLDocument.contentHTML
      post.toc = orgHTMLDocument.tocHTML
      return post
    })
    .catch(err => console.error(err))
}
