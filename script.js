const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';
const GOODREADS = 'https://www.goodreads.com/api/reviews_widget_iframe?did=75732&format=html'

// We need a class for search result card

class List {
  constructor(type, name) {
    this.type = type
    this.name = name
    this.items = []
    this.length = 0
  }

  addItem(item) {
    this.items.push(...item)
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

class Book {
  constructor(data, type) {
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
    this.tags = []    
    this.frontElement = document.createElement('div')
    this.backElement = document.createElement('div')
    this.elementType = type || 'card'
  }

  renderFrontOfCard() {
    this.frontElement.classList.add(this.elementType)
    let title = document.createElement('p'),
      author = document.createElement('p'),
      img = document.createElement('img')

    title.textContent = this.title
    title.classList.add('header')
    author.textContent = this.author
    author.classList.add('subtitle')
    img.src = this.thumbnail
    
    this.frontElement.appendChild(img)
    this.frontElement.appendChild(title)
    this.frontElement.appendChild(author)

    return this.frontElement
  }
  
  renderBackOfCard() {
    this.backElement.classList.add(`${this.elementType}-back`)
    let title = document.createElement('p'),
      author = document.createElement('span'),
      datePublished = document.createElement('span'),
      rating = document.createElement('span'),
      pageCount = document.createElement('span'),
      desc = document.createElement('p'),
      publisher = document.createElement('p'),
      reviews = document.createElement('div'),
      reviewsIframe = document.createElement('iframe'),
      dateRead = document.createElement('input'),
      dateFinished = document.createElement('input')
 
    const convertToStars = noOfStars => {
      if (!noOfStars || noOfStars === "") {
        return null;
      }
    
      noOfStars = parseFloat(noOfStars);
      let decimal = noOfStars - Math.floor(noOfStars);
      let stars = "\u2605".repeat(Math.floor(noOfStars));
    
      if (decimal <= 0.25 && decimal > 0) stars = stars + "\u00BC";
      else if (decimal <= 0.5 && decimal > 0) stars = stars + "\u00BD";
      else if (decimal <= 0.75 && decimal > 0) stars = stars + "\u00BE";
      else if (decimal < 1 && decimal > 0) stars = stars + "\u2605";
    
      return stars;
    };
    
    title.textContent = this.title
    author.textContent = this.author
    datePublished.textContent = this.publishedDate.slice(0, 4)
    pageCount.textContent = `${this.pageCount} pages`
    rating.textContent = `${convertToStars(this.rating)}`
    desc.textContent = this.description
    publisher.textContent = `Published by ${this.publisher}`
    dateRead.type = 'date'
    dateFinished.type = 'date'

    title.classList.add('header-back')    
    author.classList.add('subtitle-back')    
    datePublished.classList.add('subtitle-back')    
    pageCount.classList.add('subtitle-back')    
    rating.classList.add('rating')    
    desc.classList.add('content')    
    publisher.classList.add('footer')
    dateRead.classList.add('date-input')    
    dateFinished.classList.add('date-input')

    reviewsIframe.id = 'reviews'
    reviewsIframe.src = `${GOODREADS}&isbn=${this.isbn}`
    reviews.id = 'goodreads-widget'
    reviews.appendChild(reviewsIframe)   

    let elements = [title, author, datePublished, pageCount, rating, desc, publisher, reviews, dateRead, dateFinished]
    elements.forEach(child => this.backElement.appendChild(child))

    return this.backElement
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

let params = {
  title: 'The Girl With The Dragon Tattoo',
  author: 'Stieg Larsson',
  publisher: '',
}

const getBookData = (params) => {
  let endString = params.publisher ? `+inpublisher:${params.publisher}` : ''

  fetch(`${GOOGLE_BOOKS}q=${params.title}+inauthor:${params.author}${endString}`)
    .then(response => response.json())
    .then(data => {
      let industryIdentifiers = data.items[0].volumeInfo.industryIdentifiers.length
      let isbn
      if (industryIdentifiers) {
        isbn = data.items[0].volumeInfo.industryIdentifiers[0].identifier ||
                  data.items[0].volumeInfo.industryIdentifiers[1].identifier 
      }

      let bookDetails = {
        id: data.items[0].id,
        title: data.items[0].volumeInfo.title,
        author: data.items[0].volumeInfo.authors[0],
        description: data.items[0].volumeInfo.description,
        rating: data.items[0].volumeInfo.averageRating,
        pageCount: data.items[0].volumeInfo.pageCount,
        publishedDate: data.items[0].volumeInfo.publishedDate,
        publisher: data.items[0].volumeInfo.publisher,
        thumbnail: data.items[0].volumeInfo.imageLinks.thumbnail,
        rating: data.items[0].volumeInfo.averageRating,
        isbn,
      }

      let shelf = new List('shelf', 'read')
      let book = new Book(bookDetails)
      
      shelf.addItem([book, book, book, book, book])
      
      let body = document.getElementById('library')
      body.appendChild(book.renderFrontOfCard())
      body.appendChild(book.renderBackOfCard())
      book.addTag('Fiction')
      //shelf.removeItem((book) => {return book.title === '1984'})
      console.log(shelf.items)
      console.log(data)
    })
}

getBookData(params)