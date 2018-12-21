const main = document.getElementsByTagName('main')[0];

const cache = {}

function fetchAndSetMain(url, manipulate) {
  console.log(url);
  fetch(url)
    .then(res => res.json())
    .then(json => manipulate(json))
    .then(content => main.innerHTML = content)
    .catch(err => console.log(err))
}

function route(path) {
  if(path) window.history.pushState(null, null, path)
  else path = window.location.pathname

  console.log(path);
  if (path === '/' || path === '/posts') {

    if (cache.posts !== undefined) main.innerHTML = cache.posts
    fetchAndSetMain('/api/posts', posts => posts.reduce((sum, post) => {
      post.name = parseInt(post.name.substr(0, 10)).toString(36).toUpperCase()
      return `${sum}<h1><a href="/post/${post.name}" onclick="route('/post/${post.name}'); return false">${post.title}</a></h1><p>${post.tags}</p>`
    },''))

  } else if(/^\/post\/.+$/.test(path)) {

    fetchAndSetMain('/api/post/' + parseInt(path.substring(6), 36).toString(), post => post.content)

  } else {

    main.innerHTML = 'no such path'

  }
}

window.onpopstate = () => {
  route()
}

// init
route()

