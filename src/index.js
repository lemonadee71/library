import Library from './Library.js'
import createBookResult from './result.js'
import createBookCard from './card.js'
import { storage } from './storage.js'

const App = (doc => {
  let searchBtn = doc.getElementById('search'),
    searchModal = doc.getElementById('searchModal'),
    searchForm = doc.getElementById('searchForm'),
    searchResults = doc.getElementById('searchResults'),
    filter = doc.getElementById('filter'),
    sorter = doc.getElementById('sorter'), 
    sortBtn = doc.getElementById('sort-type')

  const library = new Library(doc.getElementById('library'))

  const initialize = () => {
    searchBtn.addEventListener('click', _showSearchModal)
    searchModal.addEventListener('click', _hideSearchModal)
    searchForm.addEventListener('submit', _searchBook)
    filter.addEventListener('keyup', _filterLibrary)  
    sorter.addEventListener('change', _sortLibrary)
    sortBtn.addEventListener('change', _sortLibrary)
    _checkStorage()
    library.sortBooks('title', true)
  }

  const _checkStorage = () => {
    let data = storage.getItems()
    if (data) {
      data.forEach(info => library.addToDOM(_renderBook(info)))
    }
  }

  const _filterLibrary = (e) => {
    library.filterBooks(e.target.value)
  }

  const _sortLibrary = (e) => {
    let prop, asc
    if (e.target.value === 'asc' || e.target.value === 'dsc') {
      prop = doc.getElementById('sorter').value
      asc = e.target.value === 'asc'
    } else {
      prop = e.target.value
      asc = doc.getElementById('sort-type').value === 'asc'
    }
    
    library.sortBooks(prop, asc)
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
    //[...searchResults.children].map(child => child.remove())
    while (searchResults.firstChild) {
      searchResults.removeChild(searchResults.lastChild)
    }      
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
          book.card.remove()
          storage.remove(item => item.id === book.id)
          library.removeItem(item => item.id === book.id)
        }              
      }
    })
    book.addListener('back', '', {
      change: () => storage.update(book.getData(), item => item.id === book.id),
      keydown: () => storage.update(book.getData(), item => item.id === book.id),
      keypress: () => storage.update(book.getData(), item => item.id === book.id),
      focusout: () => storage.update(book.getData(), item => item.id === book.id)
    })
    book.addListener('back', 'rating', {
      click: () => storage.update(book.getData(), item => item.id === book.id)
    })
    book.addListener('back', 'tags', {
      click: () => storage.update(book.getData(), item => item.id === book.id)
    })


    return book;
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
