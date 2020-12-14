export default class Book {
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
    this.status = data.status || 'to read'
    this.progress = data.progress || 0
    this.dateRead = data.dateRead || ''
    this.dateFinished = data.dateFinished || ''
    this.comment = data.comment || ''
    this.categories = data.categories || []
    this.tags = data.tags || [] 
  }

  getData() {
    return {
      ...this
    }
  }

  addTag(tag) {
    this.tags.push(tag)
  }

  removeTag(tag) {
    let pattern = new RegExp(`${tag}`, 'g')
    this.tags = this.tags.join('-').replace(pattern, '').split('-').filter(el => el)
  }

  removeAllTags() {
    this.tags = []
  }
}