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
      text: result.author || 'N\A'
    },
    datePublished: {
      type: 'span',
      text: result.publishedDate ? result.publishedDate.slice(0,4) : 'N\A'
    },
    rating: {
      type: 'span',
      text: result.rating || 'N/A'
    },
    pages: {
      type: 'span',
      text: result.pageCount || 'N/A'
    },
    desc: {
      type: 'p',
      text: result.description || 'N/A'
    },
    publisher: {
      type: 'p',
      text: this.publisher || 'N/A'
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

  // result.addListener('front', 'button', 'click', Library.addToDOM)
  result.initialize.call(result, 'front', _front)
  result.back = ''
  result.render('front', 'tooltip')

  return result;
}