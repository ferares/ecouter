export default class Loader extends HTMLElement {
  constructor() {
    super()
  }

  show() {
    this.classList.add('active')
    document.body.style.overflow = 'hidden'
  }

  hide() {
    this.classList.remove('active')
    document.body.style.overflow = 'auto'
  }
}