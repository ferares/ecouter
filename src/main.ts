import { initDialog, openAudioDialog } from './dialog'
import Loader from './elements/loader'
import Player from './elements/player'

declare global {
  interface Window {
    dialogPolyfill: any,
  }
}

declare type Track = {
  label: string,
  src: string,
}

declare type Unit = {
  title: string,
  tracks: Track[],
}

declare type Book = {
  title: string,
  subtitle: string,
  units: Unit[],
}

let books: Book[]

async function fetchData() {
  const loader = document.querySelector('[js-loader]') as Loader
  loader.show()
  try {
    const res = await fetch('/data.json?v=6')
    return await res.json()
  } catch (error) {
    console.error(error)
    return null
  } finally {
    loader.hide()
  }
}

function getSelectedBook() {
  let book = Number(localStorage.getItem('book'))
  if (!book) {
    book = 0
    setSelectedBook(book)
  }
  return book
}

function setSelectedBook(book: number) {
  localStorage.setItem('book', book.toString())
}

function openNav() {
  const navToggler = document.querySelector('[js-nav-toggle]') as HTMLButtonElement
  const nav = document.querySelector(`[js-nav]`) as HTMLElement
  navToggler.setAttribute('aria-expanded', 'true')
  navToggler.classList.add('open')
  nav.classList.add('open')
  nav.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
}

function closeNav() {
  const navToggler = document.querySelector('[js-nav-toggle]') as HTMLButtonElement
  const nav = document.querySelector(`[js-nav]`) as HTMLElement
  navToggler.setAttribute('aria-expanded', 'false')
  navToggler.classList.remove('open')
  nav.classList.remove('open')
  nav.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = 'auto'
}

function toggleNav() {
  const navToggler = document.querySelector('[js-nav-toggle]')
  if (!navToggler) return
  if (navToggler.classList.contains('open')) closeNav()
  else openNav()
}

function createSection(title: string, index: number) {
  const section = document.createElement('section')
  const button = document.createElement('button')
  const chevron = document.createElement('span')
  const heading = document.createElement('h2')
  const accordion = document.createElement('div')
  const wrapper = document.createElement('div')
  const list = document.createElement('ol')
  button.appendChild(heading)
  button.appendChild(chevron)
  wrapper.appendChild(list)
  accordion.appendChild(wrapper)
  section.appendChild(button)
  section.appendChild(accordion)
  section.id = `u${index}`
  section.classList.add('section')
  heading.id = `section-title-${index}`
  heading.classList.add('section__title')
  heading.innerHTML = title
  chevron.classList.add('icon-arrow')
  accordion.classList.add('accordion')
  accordion.id = `section-list-${index}`
  accordion.setAttribute('js-accordion', index.toString())
  accordion.setAttribute('aria-hidden', 'true')
  accordion.setAttribute('aria-labelledby', heading.id)
  accordion.role = 'region'
  wrapper.classList.add('accordion__content')
  list.classList.add('section__list')
  button.setAttribute('js-accordion-toggle', index.toString())
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('aria-controls', list.id)
  button.classList.add('accordion__btn')
  button.addEventListener('click', () => toggleAccordion(accordion))
  return { section, list }
}

function createAudioItem(unitIndex: number, audioIndex: number, audio: Track) {
  const item = document.createElement('li')
  const btn = document.createElement('button')
  const icon = document.createElement('img')
  icon.src = '/imgs/headphones.svg'
  icon.classList.add('section__btn__img')
  icon.alt = ''
  btn.classList.add('section__btn')
  btn.addEventListener('click', () => openAudioDialog(audio.label, audio.src))
  btn.appendChild(icon)
  btn.append(audio.label)
  item.appendChild(btn)
  item.classList.add('section__list__item')
  item.id = `u${unitIndex}a${audioIndex}`
  return item
}

function createNavButton(index: number, title: string, subtitle: string) {
  const navItem = document.createElement('li')
  const button = document.createElement('button')
  const bookHeading = document.createElement('span')
  bookHeading.classList.add('book-heading')
  const bookTitle = document.createElement('span')
  bookTitle.classList.add('book-heading__title')
  const bookSubtitle = document.createElement('span')
  bookSubtitle.classList.add('book-heading__subtitle')
  bookHeading.appendChild(bookTitle)
  bookHeading.appendChild(bookSubtitle)
  bookTitle.innerText = title
  bookSubtitle.innerText = subtitle
  button.classList.add('nav-link')
  button.setAttribute('js-book-btn', `${index}`)
  button.appendChild(bookHeading)
  button.addEventListener('click', () => {
    selectBook(index)
    toggleNav()
  })
  navItem.appendChild(button)
  return navItem
}

function closeAccordion(accordion: HTMLElement) {
  const accordionId = accordion.getAttribute('js-accordion')
  const accordionToggleBtn = document.querySelector(`[js-accordion-toggle="${accordionId}"]`) as HTMLButtonElement
  accordion.setAttribute('aria-hidden', 'true')
  accordion.classList.remove('open')
  accordionToggleBtn.setAttribute('aria-expanded', 'false')
  accordionToggleBtn.classList.remove('open')
}

function openAccordion(accordion: HTMLElement) {
  const accordionId = accordion.getAttribute('js-accordion')
  const accordionToggleBtn = document.querySelector(`[js-accordion-toggle="${accordionId}"]`) as HTMLButtonElement
  accordion.setAttribute('aria-hidden', 'false')
  accordion.classList.add('open')
  accordionToggleBtn.setAttribute('aria-expanded', 'true')
  accordionToggleBtn.classList.add('open')
}

function toggleAccordion(accordion: HTMLElement) {
  if (accordion.classList.contains('open')) closeAccordion(accordion)
  else openAccordion(accordion)
}

function selectBook(index: number) {
  setSelectedBook(index)
  const main = document.querySelector('[js-main]')
  if (!main) return
  main.innerHTML = ''
  const book = books[index]
  document.querySelectorAll('[js-title]').forEach((title) => title.innerHTML = book.title)
  document.querySelectorAll('[js-subtitle]').forEach((subtitle) => subtitle.innerHTML = book.subtitle)
  let unitIndex = 1
  for (const unit of book.units) {
    const { section, list } = createSection(unit.title, unitIndex)
    let audioIndex = 1
    for (const track of unit.tracks) {
      const item = createAudioItem(unitIndex, audioIndex, track)
      list.appendChild(item)
      audioIndex++
    }
    main.appendChild(section)
    unitIndex++
  }
}

function loadData(data: Book[]) {
  if (!data) return
  books = data
  const navList = document.querySelector('[js-nav-list]') as HTMLOListElement
  let bookIndex = 0
  for (const book of books) {
    const navItem = createNavButton(bookIndex, book.title, book.subtitle)
    navList.appendChild(navItem)
    bookIndex++
  }
  selectBook(getSelectedBook())
}


document.addEventListener('DOMContentLoaded', () => {
  // Register custom HTML elements
  customElements.define('ecouter-player', Player)
  customElements.define('ecouter-loader', Loader)
  // Init navigation toggler
  document.querySelector('[js-nav-toggle]')?.addEventListener('click', () => toggleNav())
  document.querySelector('[js-nav]')?.addEventListener('click', () => closeNav())
  document.querySelector('[js-nav-content]')?.addEventListener('click', (event) => event.stopPropagation())
  document.addEventListener('keydown', (event) => { if (event.code === 'Escape') closeNav() })
  // Init dialog
  initDialog()
  // Load data
  fetchData().then(loadData)
  // Register the service worker
  if (typeof navigator.serviceWorker !== 'undefined') {
    navigator.serviceWorker.register('/service-worker.js')
  }
})