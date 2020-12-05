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
      text: result.author || 'N\A'
    },
    datePublished: {
      type: 'span',
      text: result.publishedDate ? result.publishedDate.slice(0,4) : 'N\A'
    },
    rating: {
      type: 'span',
      text: result.rating || 'N/A'
    },
    pages: {
      type: 'span',
      text: result.pageCount || 'N/A'
    },
    publisher: {
      type: 'p',
      text: this.publisher || 'N/A'
    },
    button: {
      type: 'button',
      text: 'Add Book'
    },
    /*
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
    */
  }

  // result.addListener('front', 'button', 'click', Library.addToDOM)
  result.initialize.call(result, 'front', _front)
  result.back = ''
  result.render('front', 'tooltip')

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
      },
      callback: {
        click: () => {
          book.card.parentElement.removeChild(book.card)
        }
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
      text: `${book.author || 'N/A'}`
    },
    yearPublished: {
      type: 'span',
      text: `${book.publishedDate || 'N/A'}`
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
            value: 'read'
          }
        },
        {
          type: 'option',
          text: 'Reading',
          attr: {
            value: 'reading'
          }
        },
        {
          type: 'option',
          text: 'To Be Read',
          attr: {
            value: 'to-read',
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
      text: `${book.publisher || 'N/A'}`
    },
    dateRead: {
      type: 'input',
      attr: {
        type: 'date',
        id: 'date-read'
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
      },
      callback: {
        change: (e) => {
          e.target.setAttribute('value', e.target.value)
          book.dateFinished = e.target.value
        }
      }
    }
  }
  
  book.initialize.call(book, 'front', _front)
  book.initialize.call(book, 'back', _back)
  book.render('both', ['front', 'modal'])

  // Set attributes
  book.setAttribute('back', 'dateRead', 'value', book.dateRead)
  book.setAttribute('back', 'dateFinished', 'value', book.dateFinished)
  
  let options = Array.from(book.backElements.status.children)
  if (options) {
    options.forEach(opt => {
      if (opt.value === book.status) {
        opt.setAttribute('selected', 'selected')
      }
    })
  }

  return book;
}

/* The whole website application */
const App = (doc => {
  let searchBtn = doc.getElementById('searchBook'),
    searchModal = doc.getElementById('searchModal'),
    searchForm = doc.getElementById('searchForm'),
    searchResults = doc.getElementById('searchResults'),
    filter = doc.getElementById('filter')

  const library = new Library(doc.getElementById('library'))
  const storage = window.localStorage

  const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';

  const _getBookData = (item) => { 
    return {
      id: item.id,
      title: item.volumeInfo.title, 
      author: item.volumeInfo.authors.join(', '),
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
    let book = createBookCard(_getBookData(data))
    book.addListener('front', 'remove', {
      click: () => {
        let storedData = JSON.parse(storage.getItem('data')),
          index = 0

        storedData.forEach((item, i) => {
          if (item.id === book.id) {
            index = i
          }
        })
        storedData.splice(index, 1)
        storage.setItem('data', JSON.stringify(storedData))

        book.card.parentElement.removeChild(book.card)
        library.removeItem(item => {
          return item.id === book.id
        })
      }
    })

    return book
  }

  const _storeData = (data) => {
    let storedData = storage.getItem('data'),
      newData

    if (storedData) {
      newData = JSON.parse(storedData)
      newData.push(...data)
    } 

    storage.setItem('data', JSON.stringify(newData || data))
  }

  const _renderResults = (results) => {
    _clearSearchResults()

    results.forEach(item => {
      let result = createBookResult(_getBookData(item))
      result.addListener('front', 'button', {
        click: () => {
          let book = _renderBook(item)
          library.addToDOM(book)
          _storeData([book.getData()])
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
    console.log(JSON.parse(storage.getItem('data')))
    let data = storage.getItem('data')
    if (data) {
      data = JSON.parse(data)
      data.forEach(item => {
        let book = createBookCard(item)
        library.addToDOM(book)
      })
    }
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