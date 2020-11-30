const GOODREADS = 'https://www.goodreads.com/api/reviews_widget_iframe?did=75732&format=html'

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
    this.status = 'to-read'
    this.dateRead = ''
    this.dateFinished = ''
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
      text: `${_convertToStars(book.rating) || 'N/A'}`
    },
    pageCount: {
      type: 'span',
      text: `${book.pageCount || 'N/A'}`
    },
    status: {
      type: 'select',
      attr: {
        name: 'status'
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
            value: 'reading',
            selected: 'selected'
          }
        },
        {
          type: 'option',
          text: 'To Be Read',
          attr: {
            value: 'to-read'
          }
        }
      ],
      callback: {
        change: (e) => {
          e.target.setAttribute('selected', 'selected')
          book.status = e.target.value
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
    reviews: {
      type: 'div',
      attr: {
        id: 'goodreads-widget'
      },
      children: [
        {
          type: 'iframe',
          attr: {
            id: 'reviews',
            src: `${GOODREADS}&isbn=${book.isbn}`,
          }
        }
      ]
    },
    dateRead: {
      type: 'input',
      attr: {
        type: 'date',
        id: 'date-read'
      },
      callback: {
        change: (e) => {
          book.dateRead = e.target.value
        }
      }
    },
    dateFinished: {
      type: 'input',
      attr: {
        type: 'date',
        id: 'date-finished'
      },
      callback: {
        change: (e) => {
          book.dateFinished = e.target.value
        }
      }
    }
  }
  
  book.initialize.call(book, 'front', _front)
  book.initialize.call(book, 'back', _back)
  book.render('front', 'modal')

  return book;
}