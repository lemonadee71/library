const Card = Base => class extends Base {
  constructor(data) {
    super(data)
    this.card = document.createElement('div')
    this.front = document.createElement('div')
    this.back = document.createElement('div')
    this.backContent = document.createElement('div')
    this.frontElements = {}
    this.backElements = {}
  }

  createElements(face, list) {
    try {
      for (let e in list) {
        // Create element
        if (list[e].type)
          this[`${face}Elements`][e] = document.createElement(list[e].type)
  
        // Add class
        if (typeof list[e].class === 'object' && list[e].class.length)
          this[`${face}Elements`][e].classList.add(...list[e].class)
  
        // Add text
        if (list[e].text) {
          let matches = list[e].text.match(/{.*?}/g)
          matches.forEach(match => {
            let placeholder = match.match(/(?<={)(.*)(?=})/)[0]
            list[e].text.replace(match, `${this[placeholder] || ''}`)
          })
             
          let text = document.createTextNode(list[e].text)
          this[`${face}Elements`][e].appendChild(text)   
        }
      }
    } catch(error) {
      throw error
    }
  }

  addListener(face, element, type, callback) {
    try {
      this[`${face}Elements`][element].addEventListener(type, callback)
    } catch(error) {
      throw error
    }
  }
  
  renderFrontCard(exceptions) {
    for (let e in this.frontElements) {
      if (!exceptions.includes(e))
        this.front.appendChild(this.frontElements[e])
    }
  }

  renderBackCard(exceptions) {
    for (let e in this.frontElements) {
      if (!exceptions.includes(e))
        this.back.appendChild(this.backElements[e])
    }
  }

  render(exceptions) {
    this.renderFrontCard(exceptions)
    this.renderBackCard(exceptions)

    this.card.appendChild(this.front)
    this.card.appendChild(this.back)

    return this.card
  }

};

// Format
let list = {
  close: {
    type: 'span',
    class: ['close'],
    text: '&times;',
  },
  author: {
    type: 'h4',
    class: 'author',
    text: 'By {author}'
  }
}