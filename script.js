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
    this.progress = data.progress || 0
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
      progress: this.progress,
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

  result.initialize.call(result, 'front', _front)
  result.back = ''
  result.render('front', ['tooltip'])

  return result;
}

/* Book card */
const createBookCard = (data) => {
  let bookCard = cardMixin(Book),
    book = new bookCard(data)

  // Check if there are multiple authors
  // If more than 2, only get the first then add et al.
  let authors = book.author.split(', ')
  if (authors.length > 2) {
    authors = `${authors.slice(0,1).join(', ')} et al.`
  } else {
    authors = book.author
  }
  
  let _front = {
    remove: {
      type: 'span',
      text: '\u00d7',
      class: 'close',
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
      text: `${book.title}`,
      attr: {
        // Font size changes when title's characters exceeds 32
        // This is so that it doesn't go beyond the card
        style: `font-size: ${book.title.length > 32 ? `${(32 / book.title.length) * 18}px`: '18px'};`
      }
    },
    author: {
      type: 'p',
      class: 'subtitle',
      text: authors,
      attr: {
        // Font size changes when authors' characters exceeds 32
        // This is so that it doesn't go beyond the card
        style: `font-size: ${authors.length > 20 ? `${(20 / authors.length) * 14}px`: '14px'};`
      }
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
      text: `${book.publishedDate.slice(0,4) || 'Unknown'}`
    },
    rating: {
      type: 'div',
      children: [
        {
          type: 'p',
          text: 'Rating'
        },
        {
          type: 'div',
          children: (() => {
            let arr = []
            for (let i = 0; i < 5; i++) {
              arr.push({
                type: 'span',
                text: '\u2605',
                attr: {
                  'data-i': `${i}`
                },
                style: {
                  color: i < book.rating ? 'orange' : 'gray',
                  cursor: 'pointer',
                },
                callback: {
                  click: (e) => {
                    let pos = e.target.getAttribute('data-i'),
                      children = Array.from(e.target.parentElement.children)
                    
                    children.forEach((child, i) => {
                      if (i <= pos)
                        child.style.color = 'orange'
                      else
                        child.style.color = 'gray'
                    })

                    book.rating = +pos + 1
                  }
                }
              })
            }
            return arr;
          })()
        }
      ]
    },
    progress: {
      type: 'div',
      style: {
        position: 'relative'
      },
      children: [ 
        {
          type: 'p',
          text: 'Progress'
        },
        {
          type: 'input',
          class: 'progress',
          attr: {
            type: 'text',
            placeholder: book.pageCount ? `Out of ${book.pageCount} pages` : '',
          },
          prop: {
            value: book.progress ? `${book.progress}%` : ''
          },
          style: {
            width: '115px',
            display: 'none'
          },
          callback: {
            focusout: (e) => {
              let inp = e.target,
                value = inp.value

              if (value.includes('%'))
                book.progress = value.replace('%', '')
              else
                book.progress = Math.round(+value / +book.pageCount * 100)

              inp.value = `${book.progress}%`
              inp.style.display = 'none'
              inp.nextSibling.style.display = 'inline-block'
              inp.nextSibling.firstChild.style.width = `${book.progress}%`
            }
          }
        },
        {
          type: 'div',
          style: {
            border: '0.8px solid black',
            backgroundColor: 'grey',
            display: 'inline-block',
            width: '115px'
          },
          children: [
            {
              type: 'div',
              class: 'progress',
              style: {
                background: 'green',
                width: book.progress ? `${book.progress}%` : '0'
              },
            }
          ],
          callback: {
            dblclick: (e) => {
              let t = e.target
              if (t.className.includes('progress')) {
                t.parentElement.style.display = 'none'
                t.parentElement.previousSibling.style.display = 'inline'
              } else {
                t.style.display = 'none'
                t.previousSibling.style.display = 'inline'
              }
            }
          }
        }
      ]
    },
    status: {
      type: 'div',
      children: [
        {
          type: 'p',
          text: 'Status'
        },
        {
          type: 'select',
          attr: {
            name: 'status',
          },
          children: (() => {
            let arr = []
            let status = ['read', 'reading', 'to read', 'dropped']
            status.forEach(stat => {
              arr.push({
                type: 'option',
                text: stat.split(' ').map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' '),
                attr: {
                  value: stat,
                  selected: book.status === stat ? 'selected' : ''
                }
              })
            })
            return arr;
          })(),
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
        }
      ]
    },
    desc: {
      type: 'p',
      class: 'description',
      // If description is greater than 200 characters, add a "Read more" btn
      text: book.description && book.description.length < 200 ? `${book.description}` : '',
      children: book.description && book.description.length > 200
        ? [
          {
            type: 'span',
            text: `${book.description.slice(0, 200)}`
          },
          {
            type: 'span',
            text: '...',
            attr: {
              ['data-name']: `${book.id}-dots`
            }
          },
          {
            type: 'span',
            text: `${book.description.slice(200, book.description.length)}`,
            attr: {
              ['data-name']: `${book.id}-moreTxt`,
              style: 'display: none;'
            }
          },
          {
            type: 'span',
            text: ' Read more',
            attr: {
              ['data-name']: `${book.id}-moreBtn`,
              style: 'font-weight: bold; cursor: pointer;'
            },
            callback: {
              click: () => {
                let dots = document.querySelector(`span[data-name="${book.id}-dots"]`),
                  moreTxt = document.querySelector(`span[data-name="${book.id}-moreTxt"]`),
                  btn = document.querySelector(`span[data-name="${book.id}-moreBtn"]`)

                  if (dots.style.display === 'none') {
                    dots.style.display = 'inline';
                    btn.innerHTML = ' Read more'; 
                    moreTxt.style.display = 'none';
                  } else {
                    dots.style.display = 'none';
                    btn.innerHTML = ' Read less'; 
                    moreTxt.style.display = 'inline';
                  }
              }
            }
          }
        ]
        : []
    },
    publisher: {
      type: 'p',
      text: `Published by ${book.publisher || 'Unknown'}`
    },
    comment: {
      type: 'div',
      children: [
        {
          type: 'p',
          text: 'Review'
        },
        {
          type: 'textarea',
          prop: {
            textContent: book.comment || ''
          },
          callback: {
            keydown: (e) => {
              book.comment = e.target.value
            },
            focusout: (e) => {
              book.comment = e.target.value
            }
          }
        }
      ]
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

  const reset = () => data.clear()

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
  let searchBtn = doc.getElementById('search'),
    searchModal = doc.getElementById('searchModal'),
    searchForm = doc.getElementById('searchForm'),
    searchResults = doc.getElementById('searchResults'),
    filter = doc.getElementById('filter')

  const library = new Library(doc.getElementById('library'))

  const initialize = () => {
    searchBtn.addEventListener('click', _showSearchModal)
    searchModal.addEventListener('click', _hideSearchModal)
    searchForm.addEventListener('submit', _searchBook)
    _checkStorage()
  }

  const _checkStorage = () => {
    let data = storage.getItems()
    if (data)
      data.forEach(info => library.addToDOM(_renderBook(info)))
  }

  const _showSearchModal = () => {
    searchModal.style.display = 'block' 
  }

  const _hideSearchModal = (e) => {
    if (e.target.id === 'searchModal') {
      searchModal.style.display = 'none'
      _clearSearchResults()
    }
  }

  async function _searchBook(e) {
    e.preventDefault()
    
    let title = doc.getElementById('search-title').value,
      author = doc.getElementById('search-author').value

    let results = await _getSearchResults({title, author})
    _showSearchResults(results)
  }

  async function _getSearchResults(params) {
    const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';
    
    return fetch(`${GOOGLE_BOOKS}q=${params.title}+inauthor:${params.author}`)
      .then(response => response.json())
      .then(results => results.items)
  }

  const _clearSearchResults = () => {
    while (searchResults.firstChild)
      searchResults.removeChild(searchResults.lastChild)
  }

  const _showSearchResults = (results) => {
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
    book.addListener('back', 'rating', {
      click: () => storage.update(book.getData(), item => item.id === book.id)
    })
    book.addListener('back', 'progress', {
      focusout: () => storage.update(book.getData(), item => item.id === book.id)
    })
    book.addListener('back', 'comment', {
      keydown: () => storage.update(book.getData(), item => item.id === book.id),
      focusout: () => storage.update(book.getData(), item => item.id === book.id)
    })

    return book
  }
  
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

  return {
    initialize,
  }
})(document)

App.initialize()