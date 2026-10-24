import { useEffect, useRef, useState } from 'react'
import roverPortrait from './assets/characters/rover.png'
import hughPortrait from './assets/characters/Hugh.png'
import { isVoiceMuted, loadVoiceLine, setVoiceMuted } from '../systems/voice.js'

// Typewriter dialogue box. Optional `actions` ([{ label, onClick }]) are shown
// as buttons once the line has finished typing. Keyboard: 1-9 pick an action,
// E / Enter picks the only action, or skips the typing if it is still going.
// `portrait` (optional) = a full 32x32 sprite for speakers other than Hugh / R.O.V.E.R.
// (e.g. the traders). `portraitText` = emoji fallback when no art exists yet.
export default function RoverDialogue({ message: messageOverride, actions = [], speaker = "R.O.V.E.R.", portrait, portraitText }) {
  const text = messageOverride || 'Beep boop. R.O.V.E.R. online.'
  const [visibleText, setVisibleText] = useState('')
  const done = visibleText.length >= text.length
  const isHugh = speaker === 'HUGH MANN'
  const isRover = speaker === 'R.O.V.E.R.' || (!portrait && !portraitText)

  const finishTyping = useRef(() => {})

  const [muted, setMuted] = useState(isVoiceMuted)

  useEffect(() => {
    setVisibleText('')
    let cancelled = false
    let interval = null
    let raf = null
    let audio = null

    // Plain typewriter (no voice available).
    function typewriter() {
      let characterIndex = 0
      interval = window.setInterval(() => {
        characterIndex += 1
        setVisibleText(text.slice(0, characterIndex))
        if (characterIndex >= text.length) window.clearInterval(interval)
      }, 24)
    }

    // Voice-synced: reveal each character when ElevenLabs says it is spoken.
    function syncToAudio(startTimes) {
      const step = () => {
        const t = audio.currentTime
        let shown = 0
        while (shown < startTimes.length && startTimes[shown] <= t) shown += 1
        if (audio.ended) shown = text.length
        setVisibleText(text.slice(0, shown))
        if (shown < text.length) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    // Don't leave the box empty for long if the voice is slow to arrive.
    const slowVoice = window.setTimeout(() => {
      if (!audio && !interval) typewriter()
    }, 1500)

    loadVoiceLine(text, speaker).then((line) => {
      if (cancelled) return
      window.clearTimeout(slowVoice)
      if (!line || interval) {
        if (!interval) typewriter()
        return
      }
      audio = line.audio
      audio.play().then(
        () => !cancelled && syncToAudio(line.startTimes),
        () => !cancelled && typewriter(), // autoplay blocked etc.
      )
    })

    // Lets a key press skip ahead (the voice keeps talking until the next line).
    finishTyping.current = () => {
      window.clearInterval(interval)
      cancelAnimationFrame(raf)
      interval = interval ?? -1
      setVisibleText(text)
    }

    return () => {
      cancelled = true
      window.clearTimeout(slowVoice)
      window.clearInterval(interval)
      cancelAnimationFrame(raf)
      audio?.pause()
    }
  }, [text, speaker, muted])

  useEffect(() => {
    function onKeyDown(event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
      const key = event.key.toLowerCase()
      const isConfirm = key === 'e' || key === 'enter'
      const number = Number(key)
      const isChoice = Number.isInteger(number) && number >= 1 && number <= actions.length

      if (!isConfirm && !isChoice) return

      event.preventDefault()
      if (!done) {
        finishTyping.current()
        return
      }
      if (isChoice) actions[number - 1].onClick()
      else if (actions.length === 1) actions[0].onClick()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [actions, done, text])

  return (
    <div className={`rover-dialogue rover-dialogue--${isHugh ? "hugh" : isRover ? "rover" : "npc"}`}>
      <div className="rover-dialogue__portrait" aria-hidden="true">
        {isHugh || isRover ? (
          /* Cropped from the sprite sheets: Hugh's upper body / R.O.V.E.R.'s camera head. */
          <span
            className={`portrait-crop portrait-crop--${isHugh ? "hugh" : "rover"}`}
            style={{ backgroundImage: `url("${isHugh ? hughPortrait : roverPortrait}")` }}
          />
        ) : portrait ? (
          <img className="portrait-sprite" src={portrait} alt="" draggable="false" />
        ) : (
          <span className="portrait-emoji">{portraitText}</span>
        )}
      </div>
      <div className="rover-dialogue__content">
        <div className="rover-dialogue__speaker">
          {speaker}
          <button
            aria-label={muted ? 'Unmute voice' : 'Mute voice'}
            className="rover-dialogue__mute"
            onClick={() => { setVoiceMuted(!muted); setMuted(!muted) }}
            type="button"
          >
            {muted ? 'VOICE OFF' : 'VOICE ON'}
          </button>
        </div>
        <p aria-live="polite" className="rover-dialogue__text text-sm">{visibleText}<span aria-hidden="true" className="rover-dialogue__cursor">▌</span></p>
        {done && actions.length > 0 && (
          <div className="rover-dialogue__actions">
            {actions.map((action, index) => (
              <button
                className="rover-dialogue__choice"
                key={action.label}
                onClick={action.onClick}
                type="button"
              >
                {actions.length > 1 ? `${index + 1}. ` : ''}{action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
