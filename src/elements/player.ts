function isAudioContextSupported() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext
  if (window.AudioContext) return true
  return false
}

export default class Player extends HTMLElement {
  private audioElement: HTMLAudioElement
  private playPauseBtn: HTMLButtonElement
  private canvas: HTMLCanvasElement
  private canvasContext: CanvasRenderingContext2D
  private audioAnalyser?: AnalyserNode
  private audioContext?: AudioContext
  private animationFrame?: number
  
  constructor() {
    super()
    this.frameLooper = this.frameLooper.bind(this)
    this.play = this.play.bind(this)
    this.pause = this.pause.bind(this)
    this.setSrc = this.setSrc.bind(this)
    this.formatTime = this.formatTime.bind(this)

    // Init equalizer
    this.audioElement = this.querySelector('[js-audio]') as HTMLAudioElement
    this.canvas = this.querySelector('[js-canvas]') as HTMLCanvasElement
    this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D
    if (isAudioContextSupported()) {
      this.audioContext = new AudioContext()
      this.audioAnalyser = this.audioContext.createAnalyser()
      const source = this.audioContext.createMediaElementSource(this.audioElement)
      source.connect(this.audioAnalyser)
      this.audioAnalyser.connect(this.audioContext.destination)
    }

    this.playPauseBtn = this.querySelector('[js-player-play]') as HTMLButtonElement
    const back = this.querySelector('[js-player-back]') as HTMLButtonElement
    const forward = this.querySelector('[js-player-forward]') as HTMLButtonElement
    const track = this.querySelector('[js-player-track]') as HTMLInputElement
    const time = this.querySelector('[js-player-time]') as HTMLSpanElement
    const duration = this.querySelector('[js-player-duration]') as HTMLSpanElement
    time.innerHTML = '00:00'
    duration.innerHTML = '00:00'
    track.value = '0'
    this.playPauseBtn.addEventListener('click', () => this.audioElement.paused ? this.play() : this.pause())
    back.addEventListener('click', () => this.audioElement.currentTime -= 5)
    forward.addEventListener('click', () => this.audioElement.currentTime += 5)
    track.addEventListener('change', () => this.audioElement.currentTime = (Number(track.value) * this.audioElement.duration) / 1000)
    track.addEventListener('pointerdown', () => track.classList.add('hold'))
    track.addEventListener('pointerup', () => track.classList.remove('hold'))
    document.addEventListener('touchend', () => track.classList.remove('hold'))
    this.audioElement.addEventListener('pause', this.pause)
    this.audioElement.addEventListener('play', this.play)
    this.audioElement.addEventListener('durationchange', () => {
      time.innerHTML = '00:00'
      track.value = '0'
      duration.innerHTML = this.formatTime(this.audioElement.duration)
    })
    this.audioElement.addEventListener('timeupdate', () => {
      const currentTime = this.audioElement.currentTime
      time.innerHTML = this.formatTime(currentTime)
      if (!track.classList.contains('hold')) track.value = ((currentTime * 1000) / this.audioElement.duration).toString()
    })
  }

  private formatTime(time: number) {
    let minutes: number | string = Math.floor(time / 60)
    let seconds: number | string = Math.floor(time % 60)
    if (minutes < 10) minutes = `0${minutes}`
    if (seconds < 10) seconds = `0${seconds}`
    return `${minutes}:${seconds}`
  }

  private frameLooper() {
    if (!this.audioAnalyser) return
    // https://orangeable.com/javascript/equalizer-web-audio-api
    this.animationFrame = window.requestAnimationFrame(this.frameLooper)
    const { width: canvasWidth, height: canvasHeight } = this.canvas.getBoundingClientRect()
    this.canvas.width = canvasWidth
    this.canvas.height = canvasHeight
    const fbcArray = new Uint8Array(this.audioAnalyser.frequencyBinCount)
    const barCount = this.canvas.width / 8

    this.audioAnalyser.getByteFrequencyData(fbcArray)
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvasContext.fillStyle = 'orange'

    for (var i = 0; i < barCount; i++) {
      const barPos = i * 16
      const barWidth = 8
      const barHeight = - fbcArray[i] / 2
      this.canvasContext.fillRect(barPos, this.canvas.height, barWidth, barHeight)
    }
  }

  setSrc(src: string) {
    this.audioElement.src = src
    this.audioContext?.resume()
  }

  async play() {
    this.frameLooper()
    try {
      await this.audioElement.play()
      this.playPauseBtn.classList.add('pause')
    } catch(error) {
      console.log(error)
    }
  }

  pause() {
    this.audioElement.pause()
    this.playPauseBtn.classList.remove('pause')
    if (this.animationFrame) window.cancelAnimationFrame(this.animationFrame)
  }
}