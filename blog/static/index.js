const main = document.getElementsByTagName('main')[0]

const cache = {
  '/api/about': [`<pre class="infopre">my %info = qw{<span style="font-size:1.2em;color:#555;">
              name angus_zhang
           twitter <a href="https://twitter.com/nichijou_lab" target="_blank">nichijou_lab</a>
             email angusbike@gmail.com
              desc flag必中型命格，眼高手低
             motto 自律，不装，兼爱</span>
             };

my %site_info = (<span style="font-size:1.2em;color:#555;">
              front_end => [qw| HTML CSS Javascript        |],
               back_end => [qw| Nodejs Express MongoDB     |],
                 credit => [qw| Org-js Prismjs GoogleFonts |],
                   desc => '<a href='/post/TYZOX7'>link</a>',
             repository => '<a href='https://github.com/whitemuu/nodeblog' target='_blank'>whitemuu/nodeblog</a>'</span>
                );</pre>`, 'About | nichijou']
}
// age ${new Date().getFullYear() - 1991}

// karasu begin ---------------------------------------------
const karasu = document.getElementById('top')
// why cannot name it foothold in ios/safari
const karasuFoothold = document.getElementById('foothold')

// DOMMouseScroll for firefox
// why not scroll in the first time??
;['mousewheel', 'DOMMouseScroll'].forEach( e => {
  window.addEventListener(e, () => {
    if (document.body.scrollTop > 800 || document.documentElement.scrollTop > 800) {
      karasu.style.display = "block"
      karasuFoothold.style.display = "block"
    } else {
      karasu.style.display = "none"
      karasuFoothold.style.display = "none"
    }
  })
})

function fly() {
  karasu.style.transform = "rotate(64deg)"
  window.scrollTo({ top: 0, behavior: 'smooth' })
  window.history.pushState(null, null, ' ')
  document.title = document.title.substr(0, document.title.indexOf('::'))
  karasuFoothold.style.animationName='drop'
  setTimeout(() => {
    karasuFoothold.style.display = "none"
    karasuFoothold.style.animationName=''
  }, 400)
}

window.onscroll = () => {
  if (document.documentElement.scrollTop < 500 && karasu.style.display === "block") {
    karasu.style.animationName='fly'
    setTimeout(() => {
      karasu.style.animationName=''
      karasu.style.display = "none"
      karasu.style.transform = ""
    }, 800)
  }
}
// karasu end-------------------------------------------------
function genTagsHtml(tags){
  // TODO
  if (tags === undefined) return ''
  return '<div class="tags">' + tags.split(' ').reduce((sum, tag) => `${sum}<span id='${tag}'>${tag}</span>`,'') + '</div>'
}

function genCreated(name) {
  return `20${name.substr(0,2)}-${name.substr(2,2)}-${name.substr(4,2)}`
}

function gaCollect(pagePath) {
  // https://stackoverflow.com/questions/54058464/what-does-gtagjs-new-date-do-in-snippet-proviced-by-gtag-js
  // gtag('js', new Date());
  gtag('config', 'UA-60584744-2', {'page_path': pagePath});
}

const bindSectionJump = () =>
      Array.from(document.getElementsByClassName("section-number")).forEach(sectionNumberElement => {
        sectionNumberElement.onclick = () => {
          // document.getElementById('header-' + sectionNumberElement.innerText.replace(/\./g,"-")).scrollIntoView({behavior: 'smooth', block: 'start'})
          let anchor = 'header-' + sectionNumberElement.innerText.replace(/\./g,"-")
          jump(anchor)
          window.history.pushState(null, null, '#' + anchor) // direct set location.hash have effect
        }
        sectionNumberElement.style.cursor = 'pointer'
      })

function jump(anchorID) {
  if (anchorID === ''){
    document.title = document.getElementsByTagName('h1')[0].innerText
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const head = document.getElementById(anchorID)
  head.scrollIntoView({behavior: 'smooth', block: 'start'})
  // console.log(document.title)
  const i = document.title.indexOf('::')
  document.title = (i === -1? document.title : document.title.substr(0, i)) + '::' + head.innerText.replace(/\d+(\.\d+)*/,'')
}

function f404(){
  main.innerHTML = "<div style='color:rgb(50, 50, 50, 20%);font:italic 5em sans-serif;'>404</div><p>Your link is invalid or I've deleted the resource. Sorry for either case.</p>"
}

function loadingEffect() {
  main.innerHTML += '<div id="animation-container"><div class="lds-hourglass"></div></div>'
}

let lastPath

function route(path) {

  if(path) {
    if (path === window.location.pathname) return
    window.history.pushState(null, null, path)
  } else path = window.location.pathname

  // just push/pop(forward/backword) within page no need to reset main content
  if (location.pathname === lastPath) return jump(location.hash.substr(1))
  lastPath = path

  let hit = cache['/api' + path]

  if (hit) {
    main.innerHTML = hit[0]
    document.title = hit[1]
    window.scrollTo({ top: 0, behavior: 'smooth' })
    gaCollect(path)
    return
  }

  /* jshint ignore:start */
  if (path === '/' || path === '/posts') {

    loadingEffect()
    // setTimeout(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/posts')
        if (res.status !== 200) return f404()
        const posts = await res.json()

        document.title = 'Posts | nichijou'
        cache['/api/posts'] = []
        cache['/api/posts'][1] = 'Posts | nichijou'

        let contents = posts.reduce((sum, post) => {
          let path = `/post/${post.title.replace(/ /g, '-')}-${parseInt(post.name.substr(0, 10)).toString(36)}`
          return `${sum}<span>\n  (${genCreated(post.name)} '(<a href="${path}" style="font-size:1.5em" onclick="route('${path}'); return false">${post.title}</a>)
              :tags ${genTagsHtml(post.tags)})</span>`},'')

        contents = `<pre class="infopre">(contents${contents || '\n  nil'})</pre>`

        main.innerHTML = contents
        cache['/api/posts'][0] = contents
        // window.scrollTo({ top: 0, behavior: 'smooth' })
        gaCollect(path)
      } catch (e) {
        console.log(e)
      }
    })()
    // }, 100000)

  } else if(path === '/notes') {

    loadingEffect()
    ;(async () => {
      try {
        const res = await fetch('/api/notes')
        if (res.status !== 200) return f404()
        const notes = await res.json()

        document.title = 'Tutor | nichijou'
        cache['/api/notes'] = []
        cache['/api/notes'][1] = 'Tutor | nichijou'

        let contents = notes.reduce((sum, post) => {
          let path = `/post/${post.title.replace(/ /g, '-')}-${parseInt(post.name.substr(0, 10)).toString(36)}`
          return `${sum}<span>\n  (${genCreated(post.name)} '(<a href="${path}" style="font-size:1.5em" onclick="route('${path}'); return false">${post.title}</a>)
              :tags ${genTagsHtml(post.tags)})</span>`},'')

        contents = `<pre class="infopre">(notes${contents || '\n  nil'})</pre>`

        main.innerHTML = contents
        cache['/api/notes'][0] = contents

        gaCollect(path)

      } catch (e) {
        console.log(e)
      }
    })()

  } else if(path === '/tags') {

    loadingEffect()
    ;(async () => {
      try {
        const res = await fetch('/api/tags')
        if (res.status !== 200) return f404()
        let tags = await res.text()
        tags = tags.split(' ').reduce((sum, tag) => {
          sum[tag] = sum[tag] ? sum[tag] + 1 : 1
          return sum
        } , {})

        tags = Object.keys(tags).reduce((sum, tag) => `${sum}<span id="${tag}" style="font-size:${15 + tags[tag] * 2}px">${tag}</span>`, '')
        // console.log(tags)
        tags = `<div id="tags-container" class='tags' style="margin-top:80px">${tags}</div>`
        main.innerHTML = tags

        cache['/api/tags'] = []
        cache['/api/tags'][0] = tags
        cache['/api/tags'][1] = 'Tags | nichijou'

        gaCollect(path)
      } catch (e) {
        console.log(e)
      }
    })()

  } else if(path.startsWith('/post/')) {

    const url = '/api/post/' + parseInt(path.substr(path.lastIndexOf('-') + 1), 36)
    // const url = '/api/post/' + parseInt(path.match(/[\/-][a-z0-9]{6}/).substr(1), 36)

    loadingEffect()
    ;(async () => {
      hit = cache[url]
      if (hit) {
        main.innerHTML = hit[0]
        document.title = hit[1]
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        try {
          const res = await fetch(url)
          if (res.status !== 200) return f404()
          const post = await res.json()

          document.title = post.title
          cache[url] = []
          cache[url][1] = post.title
          let content = `<h1>${post.title}</h1>${genTagsHtml(post.tags)}
<div id="meta"><a rel="license" target="_blank" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">
 <img alt="Creative Commons License" style="border-width:0;opacity:0.5" src="https://i.creativecommons.org/l/by-nc-nd/4.0/80x15.png" /></a>
Created: <a href="${post.html_url}" target="_blank">${genCreated(post.name)}</a> by Angus Zhang</div>
${post.content}<div id='eof'>✣</div>`
          let newPath = `/post/${post.title.replace(/ /g, '-')}-${parseInt(post.name.substr(0, 10)).toString(36)}`
          if (window.location.pathname !== newPath) {
            window.history.pushState(null, null, newPath)
          }
          main.innerHTML = content
          cache[url][0] = content
        } catch (e) {
          console.log(e)
        }
      }
      // why set timeout 0 -> schedule after DOM manipulation
      setTimeout(() => {
        jump(window.location.hash.substr(1))
      }, 0)
      bindSectionJump()

      gaCollect(path)
    })()

  } else {
    f404()
  }
  /* jshint ignore:end */
}

window.onpopstate = () => {
  route()
}

// init
route()
