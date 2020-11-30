const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';

class BookCardVariant extends Book {
  constructor(data) {
    super(data)
    this.card = document.createElement('div')
    this.tooltip = document.createElement('div')
    this.elements = {
      img: document.createElement('img'),
      title: document.createElement('p'),
      author: document.createElement('p'),
      datePublished: document.createElement('span'),
      rating: document.createElement('span'),
      pageCount: document.createElement('span'),
      desc: document.createElement('p'),
      publisher: document.createElement('p'),
      button: document.createElement('button'),
    }
  }

  render(callback) {
    // Add text
    this.elements.img.src = this.thumbnail
    this.elements.title.textContent = this.title
    this.elements.author.textContent = this.author
    this.elements.datePublished.textContent = this.publishedDate
    this.elements.rating.textContent = this.rating
    this.elements.pageCount.textContent = this.pageCount
    this.elements.desc.textContent = this.description
    this.elements.publisher.textContent = this.publisher
    this.elements.button.textContent = 'Add Book'
    this.elements.button.addEventListener('click', callback)

    // Add classes
    this.card.classList.add('tooltip')
    this.tooltip.classList.add('tooltip-content')
    this.tooltip.appendChild(this.elements.desc)

    // Append elements
    for (let name in this.elements) {
      if (name !== 'desc')
        this.card.appendChild(this.elements[name])
    }    
    this.card.appendChild(this.tooltip)

    return this.card;
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
    // Band-aid solution
    /*
    let card = document.createElement('div')
    card.classList.add('card')
    card.id = book.id
    card.appendChild(book.front)
    card.appendChild(book.back)
    */
    this.element.appendChild(book.card)
  }

  removeFromDOM(id) {
    this.removeItem((item) => {
      return item.id === id
    })
    this.element.removeChild(document.getElementById(id))
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

const App = (doc => {
  let searchBtn = doc.getElementById('searchBook'),
    searchModal = doc.getElementById('searchModal'),
    searchForm = doc.getElementById('searchForm'),
    searchResults = doc.getElementById('searchResults'),
    filter = doc.getElementById('filter')

  const library = new Library(doc.getElementById('library'))

  let params = (title, author) => {
    return {
      title,
      author
    }
  }

  const getBookData = (item) => {
    let industryIdentifiers = item.volumeInfo.industryIdentifiers.length
    let isbn
    if (industryIdentifiers) {
      isbn = item.volumeInfo.industryIdentifiers[0].identifier ||
            item.volumeInfo.industryIdentifiers[1].identifier 
    }

    let book = {
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors[0],
      description: item.volumeInfo.description,
      rating: item.volumeInfo.averageRating,
      pageCount: item.volumeInfo.pageCount,
      publishedDate: item.volumeInfo.publishedDate,
      publisher: item.volumeInfo.publisher,
      thumbnail: item.volumeInfo.imageLinks.thumbnail || '',
      rating: item.volumeInfo.averageRating,
      isbn,
    }

    return book;
  }

  async function getSearchResults(params) {
    let publisher = params.publisher ? `+inpublisher:${params.publisher}` : ''
  
    return fetch(`${GOOGLE_BOOKS}q=${params.title}+inauthor:${params.author}${publisher}`)
      .then(response => response.json())
      .then(results => results.items)
  }

  const _removeBook = (e) => {
    let bookId = e.target.getAttribute('data-id')
    library.removeFromDOM(bookId)
  }

  const _addBook = (data) => {
    let book = new BookCard(getBookData(data))
    let testBook = createBookCard(getBookData(data))
    book.render(_removeBook)
    library.addToDOM(testBook)
  }

  const _showSearchModal = () => {
    searchModal.style.display = 'block' 
  }

  const _hideSearchModal = (e) => {
    if (e.target.id === 'searchModal')
      searchModal.style.display = 'none'
  }

  const _renderResults = (results) => {
    results.forEach(item => {
      let result = new BookCardVariant(getBookData(item))
      result = result.render(() => {
        _addBook(item)
      })
      searchResults.appendChild(result)
    })   
  }

  async function _searchBook(e) {
    e.preventDefault()
    
    let title = doc.getElementById('search-title').value,
      author = doc.getElementById('search-author').value

    let results = await getSearchResults(params(title, author))
    _renderResults(results)
  }

  const _filterBooks = () => {
    let str = filter.value
    library.filter('', str)
  }

  const initialize = () => {
    searchBtn.addEventListener('click', _showSearchModal)
    searchModal.addEventListener('click', _hideSearchModal)
    searchForm.addEventListener('submit', _searchBook)
    filter.addEventListener('keyup', _filterBooks)
  }

  return {
    initialize,
  }
})(document)

App.initialize()