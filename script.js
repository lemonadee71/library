/* Classes */
class Book {
  constructor(data) {
    this.id = data.id
    this.title = data.title
    this.author = data.author
    this.description = data.description
    this.pageCount = data.pageCount
    this.publishedDate = data.publishedDate
    this.publisher = data.publisher
    this.thumbnail = data.thumbnail
    this.rating = data.rating
    this.isbn = data.isbn
    this.status = data.status || 'to-read'
    this.dateRead = data.dateRead || ''
    this.dateFinished = data.dateFinished || ''
    this.comment = data.comment || ''
    this.categories = data.categories || []
    this.tags = data.tags || [] 
  }

  getData() {
    return {
      id: this.id,
      title:this.title,
      author: this.author,
      description: this.description,
      pageCount: this.pageCount,
      publishedDate: this.publishedDate,
      publisher: this.publisher,
      thumbnail: this.thumbnail,
      rating: this.rating,
      isbn: this.isbn,
      status: this.status,
      dateRead: this.dateRead,
      dateFinished: this.dateFinished,
      comment: this.comment,
      categories: this.categories,
      tags: this.tags, 
    }
  }

  addTag(tag) {
    this.tags.push(tag)
  }

  removeTag(tag) {
    let index = this.tags.findIndex(tag)
    if (index !== -1)
      this.tags.splice(index, 1)
  }

  removeAllTags() {
    this.tags = []
  }
}

class List {
  constructor(type) {
    this.type = type
    this.items = []
    this.length = 0
  }

  addItem(item) {
    this.items.push(item)
    this.length = this.items.length
  }

  removeItem(condition) {
    let index = []
    this.items.forEach((item, i) => {
      if (condition(item))
        index.push(i - index.length)
    })
    
    if (index.length) {
      index.forEach(i => this.items.splice(i, 1))
    }      

    this.length = this.items.length
  }

  removeAllItems() {
    this.items = []
    this.length = 0
  }

  sortItems(condition) {
    this.items.sort((a, b) => {
      if (condition(a, b))
        return -1
      return 1
    })
  }
}

class Library extends List {
  constructor(element) {
    super('library')
    this.element = element
  }

  addToDOM(book) {
    super.addItem(book)   
    this.element.appendChild(book.card)
  }

  removeFromDOM(book, condition) {
    super.removeItem(condition)
    this.element.removeChild(book.card)
  }

  filter(flag, str) {
    this.items.forEach(book => {
      switch (flag) {
        case ':':
          if (book.author.indexOf(str) !== -1)
            book.front.style.display = 'none'
          else
            book.front.style.display = 'block'
          break;
        default:
          if (book.title.indexOf(str) !== -1)
            book.front.style.display = 'none'
          else
            book.front.style.display = 'block'
          break;
      }
    })
  }
}

/* Search results */
const createBookResult = data => {
  let bookResult = cardMixin(Book),
    result = new bookResult(data)

  let _front = {
    img: {
      type: 'img',
      attr: {
        src: result.thumbnail
      }
    },
    title: {
      type: 'p',
      text: result.title
    },
    author: {
      type: 'p',
      text: result.author || 'Unknown'
    },
    datePublished: {
      type: 'span',
      text: result.publishedDate ? result.publishedDate.slice(0,4) : 'Unknown'
    },
    rating: {
      type: 'span',
      text: result.rating || 'No rating'
    },
    pages: {
      type: 'span',
      text: result.pageCount || 'N/A'
    },
    publisher: {
      type: 'p',
      text: result.publisher || 'Unknown'
    },
    button: {
      type: 'button',
      text: 'Add Book'
    },
    tooltip: {
      type: 'div',
      class: 'tooltip-content',
      children: [
        {
          type: 'p',
          text: result.description
        }
      ]
    }
  }

  // result.addListener('front', 'button', 'click', Library.addToDOM)
  result.initialize.call(result, 'front', _front)
  result.back = ''
  result.render('front', ['tooltip'])

  return result;
}

/* Book card */
const createBookCard = (data) => {
  let bookCard = cardMixin(Book),
    book = new bookCard(data)

  const _convertToStars = rating => {
    if (rating || rating === "") {
      return null;
    }
  
    let decimal = +rating - Math.floor(+rating);
    let stars = "\u2605".repeat(Math.floor(+rating));
  
    if (decimal <= 0.25 && decimal > 0) stars = stars + "\u00BC";
    else if (decimal <= 0.5 && decimal > 0) stars = stars + "\u00BD";
    else if (decimal <= 0.75 && decimal > 0) stars = stars + "\u00BE";
    else if (decimal < 1 && decimal > 0) stars = stars + "\u2605";
  
    return stars;
  };

  
  let _front = {
    remove: {
      type: 'span',
      text: '\u00d7',
      class: 'close',
      attr: {
        id: 'remove'
      }
    },
    cover: {
      type: 'img',
      class: 'cover',
      attr: {
        src: `${book.thumbnail || ''}`
      }
    },
    title: {
      type: 'p',
      class: 'title',
      text: `${book.title}`
    },
    author: {
      type: 'p',
      class: 'subtitle',
      text: `${book.author}`
    }
  }
  
  let _back = {
    title: {
      type: 'p',
      text: `${book.title}`
    },
    author: {
      type: 'p',
      text: `${book.author || 'Unknown'}`
    },
    yearPublished: {
      type: 'span',
      text: `${book.publishedDate || 'Unknown'}`
    },
    rating: {
      type: 'span',
      text: `${_convertToStars(book.rating) || 'No rating'}`
    },
    pageCount: {
      type: 'span',
      text: `${book.pageCount || 'N/A'}`
    },
    status: {
      type: 'select',
      attr: {
        name: 'status',
        ['data-id']: `${book.id}`
      },
      children: [
        {
          type: 'option',
          text: 'Read',
          attr: {
            value: 'read',
            selected: book.status === 'read' ? 'selected' : ''
          }
        },
        {
          type: 'option',
          text: 'Reading',
          attr: {
            value: 'reading',
            selected: book.status === 'reading' ? 'selected' : ''
          }
        },
        {
          type: 'option',
          text: 'To Be Read',
          attr: {
            value: 'to-read',
            selected: book.status === 'to-read' ? 'selected' : ''
          }
        }
      ],
      callback: {
        change: (e) => {
          let options = Array.from(e.target.children)
          options.forEach(opt => {
            if (opt.value === e.target.value) {
              opt.setAttribute('selected', 'selected')
              book.status = opt.value
            } else {
              opt.removeAttribute('selected')
            }    
          })
        }
      }
    },
    desc: {
      type: 'p',
      text: `${book.description || 'N/A'}`
    },
    publisher: {
      type: 'p',
      text: `${book.publisher || 'Unknown'}`
    },
    dateRead: {
      type: 'input',
      attr: {
        type: 'date',
        id: 'date-read',
        value: book.dateRead || ''
      },
      callback: {
        change: (e) => {
          e.target.setAttribute('value', e.target.value)
          book.dateRead = e.target.value          
        }
      }
    },
    dateFinished: {
      type: 'input',
      attr: {
        type: 'date',
        id: 'date-finished',
        value: book.dateFinished || ''
      },
      callback: {
        change: (e) => {
          e.target.setAttribute('value', e.target.value)
          book.dateFinished = e.target.value
        }
      }
    }
  }
  
  // Render elements
  book.initialize.call(book, 'front', _front)
  book.initialize.call(book, 'back', _back)
  book.render('both', ['front', 'modal'])

  return book;
}

/* Storage object */
const storage = ((str) => {
  let data = window.localStorage
  let key = str

  const getItems = () => JSON.parse(data.getItem(key))

  const reset = () => {
    data.clear()
  }

  const update = (newInfo, condition) => {
    let storedData = getItems()
    let index

    storedData.forEach((item, i) => {
      if (condition(item))
        index = i
    })

    storedData[index] = newInfo
    data.setItem(key, JSON.stringify(storedData))
  }

  const remove = (condition) => {
    let storedData = getItems()
    let index

    storedData.forEach((item, i) => {
      if (condition(item))
        index = i
    })

    storedData.splice(index, 1)
    data.setItem(key, JSON.stringify(storedData))
  }

  const store = (info) => {
    let storedData = getItems()

    if (storedData) 
      storedData.push(info)

    data.setItem(key, JSON.stringify(storedData || [info]))
  }

  return {
    data,
    getItems,
    reset,
    store,
    update,
    remove,
  }
})('data')


/* The whole website application */
const App = (doc => {
  let searchBtn = doc.getElementById('searchBook'),
    searchModal = doc.getElementById('searchModal'),
    searchForm = doc.getElementById('searchForm'),
    searchResults = doc.getElementById('searchResults'),
    filter = doc.getElementById('filter')

  const library = new Library(doc.getElementById('library'))
  const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';

  const _getBookData = (item) => { 
    return {
      id: item.id,
      title: item.volumeInfo.title, 
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
      description: item.volumeInfo.description,
      rating: item.volumeInfo.averageRating,
      pageCount: item.volumeInfo.pageCount,
      publishedDate: item.volumeInfo.publishedDate,
      publisher: item.volumeInfo.publisher,
      thumbnail: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '',
      rating: item.volumeInfo.averageRating,
      categories: item.volumeInfo.categories
    }
  }

  async function _getSearchResults(params) {  
    return fetch(`${GOOGLE_BOOKS}q=${params.title}+inauthor:${params.author}`)
      .then(response => response.json())
      .then(results => results.items)
  }

  const _clearSearchResults = () => {
    while (searchResults.firstChild)
      searchResults.removeChild(searchResults.lastChild)
  }

  const _renderBook = (data) => {
    let book = createBookCard(data)

    book.addListener('front', 'remove', {
      click: (e) => {
        e.stopPropagation()

        if (confirm('Are you sure you want to remove this book from your library?')) {
          book.card.parentElement.removeChild(book.card)
          storage.remove(item => item.id === book.id)
          library.removeItem(item => item.id === book.id)
        }              
      }
    })
    book.addListener('back', 'status', {
      change: () => storage.update(book.getData(), item => item.id === book.id)
    })
    book.addListener('back', 'dateRead', {
      change: () => storage.update(book.getData(), item => item.id === book.id)
    })
    book.addListener('back', 'dateFinished', {
      change: () => storage.update(book.getData(), item => item.id === book.id)
    })

    return book
  }

  const _renderResults = (results) => {
    _clearSearchResults()

    results.forEach(item => {
      let result = createBookResult(_getBookData(item))

      result.addListener('front', 'button', {
        click: () => {
          let book = _renderBook(_getBookData(item))
          let alreadyAdded = false

          library.items.forEach(item => {
            if (item.id === book.id)
              alreadyAdded = true
          })

          if (alreadyAdded) {
            alert('This book is already in your library')
          } else {
            library.addToDOM(book)
            storage.store(book.getData())
            searchResults.removeChild(result.card)
          }
          
        }
      })

      searchResults.appendChild(result.card)
    })   
  }

  async function _searchBook(e) {
    e.preventDefault()
    
    let title = doc.getElementById('search-title').value,
      author = doc.getElementById('search-author').value

    let results = await _getSearchResults({title, author})
    _renderResults(results)
  }

  const _showSearchModal = () => {
    searchModal.style.display = 'block' 
  }

  const _hideSearchModal = (e) => {
    if (e.target.id === 'searchModal')
      searchModal.style.display = 'none'
  }

  const _checkStorage = () => {
    let data = storage.getItems()
    if (data)
      data.forEach(info => library.addToDOM(_renderBook(info)))
  }

  const initialize = () => {
    searchBtn.addEventListener('click', _showSearchModal)
    searchModal.addEventListener('click', _hideSearchModal)
    searchForm.addEventListener('submit', _searchBook)
    _checkStorage()
  }

  return {
    initialize,
  }
})(document)

App.initialize()