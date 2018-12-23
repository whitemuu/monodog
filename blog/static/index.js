const main = document.getElementsByTagName('main')[0];

const cache = {
  '/api/tags': ['<p>工事中</p>', 'Tags | nichijou'],
  '/api/tutor': ['<p>工事中</p>', 'Tutors | nichijou'],
  '/api/about': ['<p>28</p>', 'About | nichijou']
  // '/api/posts': [null, 'Posts | nichijou']
}

function fetchAndSetMain(url, manipulate) {
  // console.log(url);
  fetch(url)
    .then(res => res.json())
    .then(json => manipulate(json))
    .then(content => {main.innerHTML = content; cache[url][0] = content})
    .catch(err => console.log(err))
}

function genTagsHtml(tags){
  return '<div id="tags">' + tags.split(' ').reduce((sum, tag) => `${sum}<span id='${tag}'>${tag}</span>`,'') + '</div>'
}

function route(path) {
  // console.log(this);
  if(path) window.history.pushState(null, null, path)
  else path = window.location.pathname

  // no other 6/7 chars path!!
  path = path.replace(/(\w{6,7})/, (match, p1) => parseInt(p1, 36).toString())

  let hit = cache['/api' + path];
  console.log(hit);
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
        return `${sum}<h1><a href="/post/${post.name}" onclick="route('/post/${post.name}'); return false">${post.title}</a></h1>
<p>${genTagsHtml(post.tags)}</p>`},'')
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

    main.innerHTML = 'no such path'

  }
}

window.onpopstate = () => {
  route()
}

// init
route()
