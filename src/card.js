import cardMixin from './cardMixin.js'
import Book from './Book.js'

export default function createBookCard(data) {
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

  const _updateStatus = (el) => {
    let status = document.querySelector(`select[data-id="${book.id}-status"]`)
    let options = [...status.children]
    
    options.forEach(opt => {
      if (opt.value === el.value) {
        opt.setAttribute('selected', 'selected')
        book.status = opt.value
      } else {
        opt.removeAttribute('selected')
      }    
    })    
  }

  const _updateDate = (type, value = '') => {
    let target = document.querySelector(`input[data-id="${book.id}-date${type}"]`)

    let date = new Date()
    let formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

    target.removeAttribute('value')
    target.setAttribute('value', value || formattedDate)
    book[`date${type}`] = value || formattedDate
  }
  
  const _createTag = (text, cls = 'tag', type = 'span') => {
    let tag = document.createElement(type)
    let txt = document.createTextNode(text)    
    let removeBtn = document.createElement('span')
    
    removeBtn.innerHTML = '&times;'
    removeBtn.style.cursor = 'pointer'
    removeBtn.addEventListener('click', () => {
      book.removeTag(text)
      tag.parentElement.removeChild(tag)
    })
    
    tag.append(txt, removeBtn)
    tag.classList.add(cls)

    return tag;
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
                    let pos = e.target.getAttribute('data-i')
                    let children = [...e.target.parentElement.children]
                    
                    children.forEach((child, i) => {
                      if (i <= pos) {
                        child.style.color = 'orange'
                      } else {
                        child.style.color = 'gray'
                      }
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
              let inp = e.target
              let value = inp.value

              if (value.includes('%')) {
                book.progress = value.replace('%', '')
              } else {
                book.progress = Math.round(+value / +book.pageCount * 100)
              }                

              inp.value = `${book.progress}%`
              inp.style.display = 'none'
              inp.nextSibling.style.display = 'inline-block'
              inp.nextSibling.firstChild.style.width = `${book.progress}%`

              if (+book.progress > 0) {
                if (book.status === 'to read' || book.status === 'dropped') {
                  if (confirm('Set this book\'s status to "reading"')) {
                    _updateStatus({ value: 'reading' })
                    _updateDate('Read')
                  }
                } else if (book.status === 'read') {
                  if (confirm('Set this book\'s status to "rereading"?')) {
                    _updateStatus({ value: 'rereading' })
                  }
                }
              } else if (+book.progress === 100) {
                _updateStatus({ value: 'read' })
                _updateDate('Finished')
              }
            }
          }
        },
        {
          type: 'div',
          class: 'bar',
          children: [
            {
              type: 'div',
              class: 'progress',
              style: {
                background: 'green',
                cursor: 'pointer',
                width: `${book.progress}%`
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
            'data-id': `${book.id}-status`
          },
          children: (() => {
            let arr = []
            let status = ['read', 'reading', 'to read', 'dropped', 'rereading']
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
              _updateStatus(e.target)
              if (e.target.value === 'reading') {
                _updateDate('Read')
              } else if (e.target.value === 'read') {
                _updateDate('Finished')
              }
            }
          }
        }
      ]
    },
    desc: {
      type: 'div',
      children: [
        {
          type: 'p',
          text: 'Synopsis'
        },
        {
          type: 'p',
          class: 'description',
          // If description is greater than 200 characters, add a "Read more" button
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
                  'data-name': `${book.id}-dots`
                }
              },
              {
                type: 'span',
                text: `${book.description.slice(200, book.description.length)}`,
                attr: {
                  'data-name': `${book.id}-moreTxt`,
                  style: 'display: none;'
                }
              },
              {
                type: 'span',
                text: ' Read more',
                attr: {
                  'data-name': `${book.id}-moreBtn`,
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
        {
          type: 'p',
          text: `First published ${book.publishedDate.slice(0, 4) || 'N/A'} by ${book.publisher || 'Unknown'}`
        }
      ]
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
        value: book.dateRead || '',
        'data-id': `${book.id}-dateRead`
      },
      callback: {
        change: (e) => {
          if (book.status === 'to read' || book.status === 'dropped') {
            if (confirm('Set this book\'s status to "reading"?')) {
              _updateStatus({ value: 'reading' })
              _updateDate('Read')
            }
          }          

          _updateDate('Read', e.target.value)         
        }
      }
    },
    dateFinished: {
      type: 'input',
      attr: {
        type: 'date',
        value: book.dateFinished || '',
        'data-id': `${book.id}-dateFinished`
      },
      callback: {
        change: (e) => {
          if (book.status !== 'read' && book.status !== 'rereading') {
            if (confirm('Set this book\'s status to "read"?')) {
              _updateStatus({ value: 'read' })
              _updateDate('Finished')
            }            
          }
          
          _updateDate('Finished', e.target.value)
        }
      }
    },
    tags: {
      type: 'div',
      children: [
        {
          type: 'input',
          attr: {
            placeholder: 'Add tag'
          },
          callback: {
            keypress: (e) => {
              if (e.code === 'Enter') {
                let text = e.target.value

                if (!book.tags.includes(text)) {
                  let tag = _createTag(text)
                  
                  book.addTag(text)
                  e.target.nextSibling.appendChild(tag)
                  e.target.value = ''
                } else {
                  alert('Tag already added')
                }
              }
            }
          }
        },
        {
          type: 'div',
          children: (() => {
            let arr = []
            let tags = [...book.categories, ...book.tags]

            tags.forEach(tag => {
              arr.push({
                type: 'span',
                class: 'tag',
                text: tag,
                children: [
                  {
                    type: 'span',
                    style: {
                      cursor: 'pointer'
                    },
                    prop: {
                      innerHTML: '&times;'
                    },
                    callback: {
                      click: (e) => {
                        e.target.parentElement.remove()
                        book.removeTag(tag)
                      }
                    }
                  }
                ]
              })
            })

            return arr;
          })()
        }
      ]
    }
  }
  
  // Render elements
  book.initialize.call(book, 'front', _front)
  book.initialize.call(book, 'back', _back)
  book.render('both', ['front', 'modal'])

  return book;
}