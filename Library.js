class Library extends List {
  constructor(element) {
    super('library')
    this.element = element
  }

  addToDOM(book) {
    super.addItem(book)   
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