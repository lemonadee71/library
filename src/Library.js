import List from './List.js'

export default class Library extends List {
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

  renderBooks() {
    this.items.map((item) => this.element.appendChild(item.card))
  }

  clearBooks() {
    [...this.element.children].map((child) => child.remove())
  }

  filterBooks(str) {
    let flag = str.charAt(0)
    let txt = str.toLowerCase()

    if (flag === '#' || flag === '@' || flag === '+') {
      txt = txt.slice(1)
    } else {
      flag = ''
    }

    let _toggleDisplay = (book, condition) => {
      if (condition) {
        book.show()
      } else {
        book.hide()
      }
    }
    
    this.items.forEach((book) => {  
      switch(flag) {
        case '@': {
          _toggleDisplay(book, book.author.toLowerCase().includes(txt))
          break;
        }
        case '#': {
          _toggleDisplay(book, (book.status === txt))
          break;
        }
        case '+': {
          let tags = [...book.tags, ...book.categories].map(el => el.toLowerCase())
          _toggleDisplay(book, tags.includes(txt))
          break;
        }
        default: {
          _toggleDisplay(book, book.title.toLowerCase().includes(txt))
          break;
        }
      }
    })
  }

  sortBooks(prop, asc = true) {
    const condition = (a, b) => {
      if (asc) return a[prop] > b[prop]
      return a[prop] < b[prop]
    }

    this.clearBooks()
    this.sortItems(condition)
    console.log(this.items, prop, asc)
    this.renderBooks()
  }
}