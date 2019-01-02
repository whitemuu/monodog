const dao = require("./dao.js")
const org = require("org")
const fetch = require('node-fetch')
const Prism = require('prismjs')
var loadLanguages = require('prismjs/components/');
loadLanguages(['lisp', 'haskell', 'java', 'lua']);

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
        suppressAutoLink: true
      })

      post = (({name, sha, html_url}) => ({name, sha, html_url}))(post)
      post.tags = orgDocument.directiveValues['tags:']
      post.title = orgDocument.title
      post.content = orgHTMLDocument.contentHTML
      post.content = post.content.replace(/<table>/g, '<div class="table-container"><table>').replace(/<\/table>/g, '<\/table><\/div>')
        .replace(/<p><img/g, '<p class="img-container"><img')
        .replace(/<img src="\.\./g, '<img src="https://raw.githubusercontent.com/whitemuu/blog/master')
        .replace(/&#39;/g, "'") // org-js's odd behavior, I've to replace 'em
        .replace(/&#34;/g, '"')
        .replace(/(\s)(=|~)(['"].*?|.*?['"])\2(\s)/g, `$1<code>$3</code>$4`)
        .replace(/<code class="language-(.+)">([\s\S]*?)<\/code>/g, (match, p1, p2) => {
          try {
            return `<code class="language-${p1}">${Prism.highlight(p2, Prism.languages[p1], p1)}<\/code>`
          } catch(e) {
            console.log('未添加对 ' + p1 + " 支持")
          }
          return match
        })
      post.toc = orgHTMLDocument.tocHTML
      return post
    })
    .catch(err => console.error(err))
}
