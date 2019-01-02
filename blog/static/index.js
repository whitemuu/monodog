const main = document.getElementsByTagName('main')[0];

const cache = {
  '/api/tutor': ['<img src="/img/工事中アイコン.svg" width="150px" style="margin-top:80px"/>', 'Tutors | nichijou'],
  '/api/about': [`<h2 style="font-size:50px;color:#eee">ABOUT</h2><pre><code class='language-perl'>my %info = qw{
                 name angus_zhang
              twitter <a href="https://twitter.com/nichijou_lab" target="_blank">nichijou_lab</a>
                email angusbike@gmail.com
                 desc flag必中型命格，眼高手低
                motto 自律，不装，兼爱
             };

my %site_info = (
                 front_end => [qw| HTML CSS Javascript        |],
                  back_end => [qw| Nodejs Express MongoDB     |],
                    credit => [qw| Org-js Prismjs GoogleFonts |],
                      desc => '<a href='/post/TYZOX7'>link</a>',
                repository => '<a href='https://github.com/whitemuu/nodeblog' target='_blank'>whitemuu/nodeblog</a>'
                );</code></pre><div></div>`, 'About | nichijou']
}
// age ${new Date().getFullYear() - 1991}

function genTagsHtml(tags){
  return '<div class="tags">' + tags.split(' ').reduce((sum, tag) => `${sum}<span id='${tag}'>${tag}</span>`,'') + '</div>'
}

function genCreated(name) {
  return `20${name.substr(0,2)}-${name.substr(2,2)}-${name.substr(4,2)}`
}

const bindSectionJump = () =>
      Array.from(document.getElementsByClassName("section-number")).forEach(sectionNumber => {
        sectionNumber.onclick = () =>
          document.getElementById('header-' + sectionNumber.innerText.replace(/\./g,"-")).scrollIntoView({behavior: 'smooth', block: 'start'});
      })

function f404(){
  main.innerHTML = "<div style='color:rgb(50, 50, 50, 20%);font:italic 5em sans-serif;'>404</div><p>Your link is invalid or I've deleted the resource. Sorry for either case.</p>"
}

function route(path) {

  if(path) window.history.pushState(null, null, path)
  else path = window.location.pathname

  let hit = cache['/api' + path];

  if (hit) {
    main.innerHTML = hit[0];
    document.title = hit[1];
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return
  }

  if (path === '/' || path === '/posts') {

    ;(async () => {
      try {
        const res = await fetch('/api/posts')
        if (res.status !== 200) return f404()
        const posts = await res.json()

        document.title = 'Posts | nichijou'
        cache['/api/posts'] = []
        cache['/api/posts'][1] = 'Posts | nichijou'
        const contents = posts.reduce((sum, post) => {
          let path = `/post/${post.title.replace(/ /g, '-')}-${parseInt(post.name.substr(0, 10)).toString(36)}`
          return `${sum}<div class="entry"><h1 style="font:lighter 1.5em sans-serif;margin-top:2em;">
<a href="${path}" onclick="route('${path}'); return false">${post.title}</a></h1>
<div class="date">${genCreated(post.name)}</div>
${genTagsHtml(post.tags)}</div>`},'')
        main.innerHTML = contents
        cache['/api/posts'][0] = contents
        // window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (e) {
        console.log(e)
      }
    })()

  } else if(path === '/tags') {

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
        // console.log(tags);
        tags = `<div id="tags-container" class='tags' style="margin-top:80px">${tags}</div>`
        main.innerHTML = tags

        cache['/api/tags'] = []
        cache['/api/tags'][0] = tags
        cache['/api/tags'][1] = 'Tags | nichijou'

      } catch (e) {
        console.log(e)
      }
    })()

  } else if(path.startsWith('/post/')) {

    const url = '/api/post/' + parseInt(path.substr(path.lastIndexOf('-') + 1), 36)
    // const url = '/api/post/' + parseInt(path.match(/[\/-][a-z0-9]{6}/).substr(1), 36)

    ;(async () => {
      hit = cache[url]
      if (hit) {
        main.innerHTML = hit[0];
        document.title = hit[1];
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        try {
          const res = await fetch(url)
          if (res.status !== 200) return f404()
          const post = await res.json()

          document.title = post.title
          cache[url] = []
          cache[url][1] = post.title
          let content = `<h1>${post.title}</h1>${genTagsHtml(post.tags)}
<div id="meta">Created: <a href="${post.html_url}" target="_blank">${genCreated(post.name)}</a> by Angus Zhang</div>
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
      bindSectionJump()
    })()

  } else {
    f404()
  }
}

window.onpopstate = () => {
  route()
}

// init
route()
