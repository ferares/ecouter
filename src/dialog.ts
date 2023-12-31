import Loader from './elements/loader'
import Player from './elements/player'

function initDialog() {
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  // Dialog polyfill
  window.dialogPolyfill.registerDialog(dialog)
  dialog.querySelector('[js-dialog-close]')?.addEventListener('click', closeAudioDialog)
  dialog.addEventListener('close', closeAudioDialog)
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
  const loader = document.querySelector('[js-loader]') as Loader
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  const player = dialog.querySelector('[js-player]') as Player
  const title = dialog.querySelector('[js-dialog-title]') as HTMLSpanElement
  title.innerHTML = label
  loader.show()
  player.setSrc(await getBlob(src))
  loader.hide()
  player.play()
  dialog.showModal()
  document.body.style.overflowY = 'hidden'
  window.history.pushState({ dialog: true }, 'dialog-open')
  window.addEventListener('popstate', handleDialogCloseOnNavigation)
}

function closeAudioDialog() {
  const dialog = document.querySelector('[js-dialog]') as HTMLDialogElement
  const player = dialog.querySelector('[js-player]') as Player
  player.pause()
  dialog.close()
  document.body.style.overflowY = 'auto'
}

export { initDialog, openAudioDialog }