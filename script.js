const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';
const GOODREADS = 'https://www.goodreads.com/api/reviews_widget_iframe?did=75732&format=html'

class Book {
  static convertRatingToStars () {
    if (this.rating || this.rating === "") {
      return null;
    }
  
    let decimal = +this.rating - Math.floor(+this.rating);
    let stars = "\u2605".repeat(Math.floor(+this.rating));
  
    if (decimal <= 0.25 && decimal > 0) stars = stars + "\u00BC";
    else if (decimal <= 0.5 && decimal > 0) stars = stars + "\u00BD";
    else if (decimal <= 0.75 && decimal > 0) stars = stars + "\u00BE";
    else if (decimal < 1 && decimal > 0) stars = stars + "\u2605";
  
    return stars;
  };

  constructor(data) {
    this.id = data.id
    this.title = data.title
    this.author = data.author
    this.description = data.description
    this.pageCount = data.pageCount
    this.publishedDate = data.publishedDate
    this.publisher = data.publisher
    this.thumbnail = data.thumbnail
    this.rating = Book.convertRatingToStars()
    this.isbn = data.isbn
    this.tags = [] 
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

class BookCard extends Book {
  constructor(data) {
    super(data)
    this.card = document.createElement('div')
    this.front = document.createElement('div')
    this.back = document.createElement('div')
    this.frontElements = {
      img: document.createElement('img'),
      title: document.createElement('p'),
      author: document.createElement('p'),      
    }
    this.backElements = {
      closeButton: document.createElement('span'),
      title: document.createElement('p'),
      author: document.createElement('span'),
      datePublished: document.createElement('span'),
      rating: document.createElement('span'),
      pageCount: document.createElement('span'),
      desc: document.createElement('p'),
      publisher: document.createElement('p'),
      reviews: document.createElement('div'),
      reviewsIframe: document.createElement('iframe'),
      dateRead: document.createElement('input'),
      dateFinished: document.createElement('input'),
      modalContent: document.createElement('div'),  
    }    
  }

  addElement(face, element) {
    if (face === 'front')
      this.front.appendChild(element)
    else if (face === 'back')
      this.back.appendChild(element)
  }

  renderFrontOfCard() {
    this.front.classList.add('front')

    this.frontElements.title.textContent = this.title
    this.frontElements.author.textContent = this.author

    this.frontElements.title.classList.add('header')
    this.frontElements.author.classList.add('subtitle')

    this.frontElements.img.src = this.thumbnail
    
    for (let elem in this.frontElements) {
      this.addElement('front', this.frontElements[elem])
    }

    this.front.addEventListener('click', () => {
      this.back.style.display = 'block'
    })

    return this.front;
  }
  
  renderBackOfCard() {
    this.back.classList.add(`modal`)   
    
    // Add text
    this.backElements.title.textContent = this.title
    this.backElements.author.textContent = this.author
    this.backElements.datePublished.textContent = this.publishedDate.slice(0, 4)
    this.backElements.pageCount.textContent = `${this.pageCount} pages`
    this.backElements.rating.textContent = `${convertRatingToStars(this.rating)}`
    this.backElements.desc.textContent = this.description
    this.backElements.publisher.textContent = `Published by ${this.publisher}`

    // Add classes
    this.backElements.title.classList.add('header-back')    
    this.backElements.author.classList.add('subtitle-back')    
    this.backElements.datePublished.classList.add('subtitle-back')    
    this.backElements.pageCount.classList.add('subtitle-back')    
    this.backElements.rating.classList.add('rating')    
    this.backElements.desc.classList.add('content')    
    this.backElements.publisher.classList.add('footer')
    this.backElements.dateRead.classList.add('date-input')    
    this.backElements.dateFinished.classList.add('date-input')
    this.backElements.modalContent.classList.add('modal-content')
    this.backElements.closeButton.classList.add('close')

    this.backElements.dateRead.type = 'date'
    this.backElements.dateFinished.type = 'date'
    this.backElements.closeButton.innerHTML = '&times;'

    // Render Goodreads reviews iframe
    this.backElements.reviewsIframe.id = 'reviews'
    this.backElements.reviewsIframe.src = `${GOODREADS}&isbn=${this.isbn}`
    this.backElements.reviews.id = 'goodreads-widget'
    this.backElements.reviews.appendChild(this.backElements.reviewsIframe)   

    this.backElements.closeButton.addEventListener('click', (e) => {
      this.back.style.display = 'none'
      e.stopPropagation()
    })

    for (let elem in this.backElements) { 
      if (elem !== 'modalContent')
        this.backElements.modalContent.appendChild(this.backElements[elem])
    }

    this.back.appendChild(this.backElements.modalContent)
    this.back.addEventListener('click', (e) => {
      let targetClass = Array.from(e.target.classList)
      if (targetClass.includes('modal'))
        this.back.style.display = 'none'
    })
  
    return this.back;
  }

  render() {  
    this.renderFrontOfCard()
    this.renderBackOfCard()
    this.card.appendChild(this.front)
    this.card.appendChild(this.back)
   
    return this.card
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
    let card = document.createElement('div')
    card.classList.add('card')
    card.appendChild(book.front)
    card.appendChild(book.back)
    this.element.appendChild(card)
  }
}

const App = (doc => {
  let searchBtn = doc.getElementById('searchBook'),
    searchModal = doc.getElementById('searchModal'),
    searchForm = doc.getElementById('searchForm'),
    searchResults = doc.getElementById('searchResults')

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
      thumbnail: item.volumeInfo.imageLinks.thumbnail,
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
      searchResults.appendChild(result.render())
    })   
  }

  async function _searchBook(e) {
    e.preventDefault()
    
    let title = doc.getElementById('search-title').value,
      author = doc.getElementById('search-author').value

    let results = await getSearchResults(params(title, author))
    _renderResults(results)
  }

  const initialize = () => {
    searchBtn.addEventListener('click', _showSearchModal)
    searchModal.addEventListener('click', _hideSearchModal)
    searchForm.addEventListener('submit', _searchBook)
  }

  return {
    initialize,
  }
})(document)

App.initialize()