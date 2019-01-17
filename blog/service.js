const dao = require("./dao.js")
const org = require("org")
const fetch = require('node-fetch')
const Prism = require('prismjs')
var loadLanguages = require('prismjs/components/');
loadLanguages(['lisp', 'haskell', 'java', 'lua']);

const parser = new org.Parser();

exports.addEntry = function (name, collection) {
  genNew(name, collection).then(entry => {
    dao.insertOne(entry, collection).then(re => console.log(re.n + ' ' + entry.name +' instered')).catch(e => console.log(e))
  }).catch(err => console.error(err))
}

// exports.addPost({name: '1812111403.org', sha: 'jjj'})
exports.updateEntry = function (name, collection) {
  genNew(name, collection).then(entry => {
    dao.updateOne({name: entry.name}, {$set: entry}, collection)
  }).catch(err => console.error(err))
}


function genNew(name, collection) {
  // return fetch(`https://raw.githubusercontent.com/whitemuu/blog/master/${collection}/${entry.name}`)
  return fetch(`https://api.github.com/repos/whitemuu/blog/contents/${collection}/${name}?ref=master`)
    .then(res => res.json())
    .then(entry => {

      const orgDocument = parser.parse(Buffer.from(entry.content, 'base64').toString('utf-8'))
      const orgHTMLDocument = orgDocument.convert(org.ConverterHTML, {
        headerOffset: 1,
        exportFromLineNumber: false,
        suppressSubScriptHandling: false,
        suppressAutoLink: true
      })

      entry = (({name, sha, html_url}) => ({name, sha, html_url}))(entry)
      entry.tags = orgDocument.directiveValues['tags:']
      entry.update = orgDocument.directiveValues['date:']
      entry.title = orgDocument.title
      entry.content = orgHTMLDocument.contentHTML
      entry.content = entry.content.replace(/<table>/g, '<div class="table-container"><table>').replace(/<\/table>/g, '<\/table><\/div>')
        .replace(/<p><img/g, '<p class="img-container"><img')
        .replace(/<img src="\.\./g, '<img src="https://raw.githubusercontent.com/whitemuu/blog/master')
     // why '\s', -> width="800" height="400"
     // .replace(/(\s)(=|~)(['"].*?|.*?['"])\2(\s)/g, `$1<code>$3</code>$4`)
        .replace(/(=|~)((&#34;|&#39;).*?|.*?(&#34;|&#39;))\1(\s)/g, `<code>$2</code>$5`)
        .replace(/<code class="language-(.+)">([\s\S]*?)<\/code>/g, (match, p1, p2) => {
          try {
            p2 = p2
              .replace(/&#34;/g, '"')
              .replace(/&#38;/g, "&")
              .replace(/&#39;/g, "'")
              .replace(/&#60;/g, "<")
              .replace(/&#62;/g, ">")

            return `<code class="language-${p1}">${Prism.highlight(p2, Prism.languages[p1], p1)}<\/code>`
          } catch(e) {
            console.log('未添加对 ' + p1 + " 支持")
          }
          return match
        })
      entry.toc = orgHTMLDocument.tocHTML
      return entry
    })
    .catch(err => console.error(err))
}
