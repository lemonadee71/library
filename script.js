const GOOGLE_BOOKS = 'https://www.googleapis.com/books/v1/volumes?';

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
    let industryIdentifiers = item.volumeInfo.industryIdentifiers
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
      thumbnail: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '',
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
    let book = createBookCard(getBookData(data))
    library.addToDOM(book)
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
      let result = createBookResult(getBookData(item))
      result.addListener('front', 'button', 'click', () => {
        let book = createBookCard(getBookData(item))
        library.addToDOM(book)
      })
      searchResults.appendChild(result.card)
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