interface Window {
  dialogPolyfill: any,
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

function setLoader(status: boolean) {
  const loader = document.querySelector('[js-loader]')
  if (!loader) return
  if (status) {
    loader.classList.add('active')
    document.body.style.overflow = 'hidden'
  } else {
    loader.classList.remove('active')
    document.body.style.overflow = 'auto'
  }
}

async function fetchData() {
  setLoader(true)
  try {
    const res = await fetch('/data.json?v=1')
    return await res.json()
  } catch (error) {
    console.error(error)
    return null
  } finally {
    setLoader(false)
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

function formatTime(time: number) {
  let minutes: number | string = Math.floor(time / 60)
  let seconds: number | string = Math.floor(time % 60)
  if (minutes < 10) minutes = `0${minutes}`
  if (seconds < 10) seconds = `0${seconds}`
  return `${minutes}:${seconds}`
}

function initPlayer() {
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  const player = dialog.querySelector('[js-audio]') as HTMLAudioElement
  const playPause = dialog.querySelector('[js-player-play]') as HTMLButtonElement
  const back = dialog.querySelector('[js-player-back]') as HTMLButtonElement
  const forward = dialog.querySelector('[js-player-forward]') as HTMLButtonElement
  const track = dialog.querySelector('[js-player-track]') as HTMLInputElement
  const time = dialog.querySelector('[js-player-time]') as HTMLSpanElement
  const duration = dialog.querySelector('[js-player-duration]') as HTMLSpanElement
  time.innerHTML = '00:00'
  duration.innerHTML = '00:00'
  track.value = '0'
  playPause.addEventListener('click', () => player.paused ? player.play() : player.pause())
  back.addEventListener('click', () => player.currentTime -= 5)
  forward.addEventListener('click', () => player.currentTime += 5)
  track.addEventListener('change', () => player.currentTime = (Number(track.value) * player.duration) / 1000)
  track.addEventListener('pointerdown', () => track.classList.add('hold'))
  track.addEventListener('pointerup', () => track.classList.remove('hold'))
  document.addEventListener('touchend', () => track.classList.remove('hold'))
  player.addEventListener('pause', () => playPause.classList.remove('pause'))
  player.addEventListener('play', () => playPause.classList.add('pause'))
  player.addEventListener('durationchange', () => {
    time.innerHTML = '00:00'
    track.value = '0'
    duration.innerHTML = formatTime(player.duration)
  })
  player.addEventListener('timeupdate', () => {
    const currentTime = player.currentTime
    time.innerHTML = formatTime(currentTime)
    if (!track.classList.contains('hold')) track.value = ((currentTime * 1000) / player.duration).toString()
  })
  dialog.addEventListener('close', () => player.pause())
  return player
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

async function getBlob(src: string): Promise<string> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest()
    request.open('GET', src, true)
    request.responseType = 'blob'
    request.onload = () => resolve(URL.createObjectURL(request.response))
    request.send()
  })
}

function handleDialogCloseOnNavigation() {
  closeAudioDialog()
}

async function openAudioDialog(label: string, src: string) {
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  const audio = dialog.querySelector('[js-audio]') as HTMLAudioElement
  const title = dialog.querySelector('[js-dialog-title]') as HTMLSpanElement
  title.innerHTML = label
  setLoader(true)
  audio.src = await getBlob(src)
  setLoader(false)
  audio.play()
  dialog.showModal()
  document.body.style.overflowY = 'hidden'
  window.history.pushState({ dialog: true }, 'dialog-open')
  window.addEventListener('popstate', handleDialogCloseOnNavigation)
}

function closeAudioDialog() {
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  dialog.close()
  document.body.style.overflowY = 'auto'
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
  // Init navigation toggler
  document.querySelector('[js-nav-toggle]')?.addEventListener('click', () => toggleNav())
  document.querySelector('[js-nav]')?.addEventListener('click', () => closeNav())
  document.querySelector('[js-nav-content]')?.addEventListener('click', (event) => event.stopPropagation())
  document.addEventListener('keydown', (event) => { if (event.code === 'Escape') closeNav() })
  // Init dialog
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  // Dialog polyfill
  window.dialogPolyfill.registerDialog(dialog)
  document.querySelector('[js-dialog-close]')?.addEventListener('click', closeAudioDialog)
  // Init player
  initPlayer()
  // Load data
  fetchData().then(loadData)
})