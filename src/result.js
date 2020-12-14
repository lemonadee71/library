import cardMixin from './cardMixin.js'
import Book from './Book.js'

export default function createBookResult(data) {
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
