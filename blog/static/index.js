const main = document.getElementsByTagName('main')[0];

const cache = {
  '/api/tags': ['<p>工事中</p>', 'Tags | nichijou'],
  '/api/tutor': ['<p>工事中</p>', 'Tutors | nichijou'],
  '/api/about': [`<h2 style="font-size:50px;color:#eee">ABOUT</h2><pre><code class='language-perl'>my %info = qw{
                 name angus_zhang
              twitter <a href="https://twitter.com/nichijou_lab" target="_blank">nichijou_lab</a>
                email angusbike@gmail.com
             };

my %site_info = (
                 front_end => [qw| HTML CSS Javascript        |],
                  back_end => [qw| Nodejs Express MongoDB     |],
                    credit => [qw| Org-js Prismjs GoogleFonts |],
                      desc => <a href='/post/TYZOX7'>link</a>,
                repository => <a href='https://github.com/whitemuu/nodeblog' target='_blank'>'whitemuu/nodeblog'</a>
                );</code></pre><div></div>`, 'About | nichijou']
}
// age ${new Date().getFullYear() - 1991}


function fetchAndSetMain(url, manipulate) {
  // console.log(url);
  fetch(url)
    .then(res => {
      if (res.status !== 200) {
        return Promise.reject('not found')
      }
      return res.json()
    })
    .then(json => manipulate(json))
    .then(content => {main.innerHTML = content; cache[url][0] = content})
    .catch(err => console.log(err))
}

function genTagsHtml(tags){
  return '<div class="tags">' + tags.split(' ').reduce((sum, tag) => `${sum}<span id='${tag}'>${tag}</span>`,'') + '</div>'
}

function route(path) {
  // console.log(this);
  if(path) window.history.pushState(null, null, path)
  else path = window.location.pathname

  // no other 6/7 chars path!!
  path = path.replace(/(\w{6,7})/, (match, p1) => parseInt(p1, 36).toString())

  let hit = cache['/api' + path];
  // console.log(hit);
  if (hit) {
    main.innerHTML = hit[0];
    document.title = hit[1];
  }else if (path === '/' || path === '/posts') {

    fetchAndSetMain('/api/posts', posts => {
      document.title = 'Posts | nichijou'
      cache['/api/posts'] = []
      cache['/api/posts'][1] = 'Posts | nichijou'
      return posts.reduce((sum, post) => {
        post.name = parseInt(post.name.substr(0, 10)).toString(36).toUpperCase()
        return `${sum}<h1 style="font:lighter 1.5em sans-serif;margin-top:2em;"><a href="/post/${post.name}" onclick="route('/post/${post.name}'); return false">${post.title}</a></h1>
${genTagsHtml(post.tags)}`},'')
    })

  } else if(/^\/post\/\d{10}$/.test(path)) {

    const url = '/api' + path
    fetchAndSetMain(url, post => {
      document.title = post.title
      cache[url] = []
      cache[url][1] = post.title
      return `<h1>${post.title}</h1>${genTagsHtml(post.tags)}
${post.content}<div id='eof'>✣</div>`})

  } else {

    main.innerHTML = "<div style='color:rgb(50, 50, 50, 20%);font:italic 5em sans-serif;'>404</div><p>Your link is invalid or I've deleted the resource. Sorry for either case.</p>"

  }
}

window.onpopstate = () => {
  route()
}

// init
route()
