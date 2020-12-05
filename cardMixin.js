const cardMixin = Base => class extends Base {
  constructor(data) {
    super(data)
    this.card = document.createElement('div')
    this.card.classList.add('card')
    this.front = document.createElement('div')
    this.back = document.createElement('div')
    this.backContent = document.createElement('div')
    this.frontElements = {}
    this.backElements = {
      close: document.createElement('span')
    }
  }

  setAttribute(face, element, attr, val) {
    if (element)
      this[`${face}Elements`][element].setAttribute(attr, val)
    else
      this[face].setAttribute(attr, val)
  }

  addListener(face, element, callbacks) {
    try {
      for (let type in callbacks) {
        if (element)
          this[`${face}Elements`][element].addEventListener(type, callbacks[type])
        else
          this[face].addEventListener(type, callbacks[type])
      }
    } catch(error) {
      throw error
    }
  }

  addElement(face, name, info) {
    this[`${face}Elements`][name] = this.createElement(info)
  }

  createElement(info) {
    try {
      let element

      // Create element
      if (info.type)
        element = document.createElement(info.type)

      // Add class
      if (info.class) {
        let classes = info.class.split(' ')
        element.classList.add(...classes)
      }

      // Add text
      if (info.text) {            
        let text = document.createTextNode(info.text)
        element.appendChild(text)   
      }

      // Add attributes
      if (info.attr) {
        let attributes = info.attr
        for (let attr in attributes) {
          element.setAttribute(attr, attributes[attr])
        }
      }

      // Add listeners
      if (info.callback) {
        let callbacks = info.callback
        for (let type in callbacks) {
          element.addEventListener(type, callbacks[type])
        }
      }

      // Add children
      if (info.children) {
        info.children.forEach(child => {
          element.appendChild(this.createElement(child))
        })
      }

      return element;
    } catch(error) {
      throw error
    }
  }

  show() {
    this.card.style.display = 'block'
  }
  
  hide() {
    this.card.style.display = 'none'
  }

  initialize(face, list) {
    for (let el in list) {
      this[`${face}Elements`][el] = this.createElement(list[el])
    }    
  }

  renderFrontCard(cl) {
    for (let el in this.frontElements) {
      this.front.appendChild(this.frontElements[el])
    }

    this.front.classList.add(cl)
  }

  renderBackCard(cl) {
    // Add close button
    this.backElements.close.classList.add('close')
    this.backElements.close.innerHTML = '&times;'
    this.backElements.close.addEventListener('click', (e) => {
      this.back.style.display = 'none'
      e.stopPropagation()
    })

    for (let el in this.backElements) {
      this.backContent.appendChild(this.backElements[el])
    }
    
    this.back.classList.add(cl)
    this.backContent.classList.add('modal-content')
    this.back.appendChild(this.backContent)

    this.back.addEventListener('click', (e) => {
      let targetClass = Array.from(e.target.classList)
      if (targetClass.includes('modal'))
        this.back.style.display = 'none'
    })
  }

  render(face, classes) {
    let mainClass = face !== 'both' ? classes[0] : ''

    if (face === 'front' || face === 'both') {
      this.renderFrontCard(mainClass || classes[0] || '')
      this.card.appendChild(this.front)
      
      if (face === 'both') {
        this.front.addEventListener('click', () => {
          this.back.style.display = 'block'
        })
      }
    }
    if (face === 'back' || face === 'both') {
      this.renderBackCard(mainClass || classes[1] || '')
      this.card.appendChild(this.back)
    }    
    
    return this.card
  }
}