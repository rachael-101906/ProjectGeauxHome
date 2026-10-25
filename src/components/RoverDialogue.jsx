import { useEffect, useRef, useState } from 'react'
import roverPortrait from './assets/characters/rover.png'
import hughPortrait from './assets/characters/Hugh.png'
import {
  isVoiceMuted,
  loadVoiceLine,
  setVoiceMuted,
} from '../systems/voice.js'

// Typewriter dialogue box.
//
// Optional props:
// - actions: [{ label, onClick }]
// - speaker: "R.O.V.E.R.", "HUGH MANN", or another speaker name
// - portrait: optional portrait image for other NPCs
// - portraitText: emoji fallback when no portrait exists
//
// Keyboard:
// - E / Enter: skip typing or select the only action
// - 1-9: select a dialogue action

export default function RoverDialogue({
  message: messageOverride,
  actions = [],
  speaker = 'R.O.V.E.R.',
  portrait,
  portraitText,
}) {
  const text = messageOverride || 'Beep boop. R.O.V.E.R. here.'

  const [visibleText, setVisibleText] = useState('')
  const [muted, setMuted] = useState(isVoiceMuted)

  const finishTyping = useRef(() => {})
  const done = visibleText.length >= text.length

  const isHugh = speaker === 'HUGH MANN'
  const isRover =
    speaker === 'R.O.V.E.R.' || (!portrait && !portraitText)

  // Type out dialogue, synchronized to audio when timing data is available.
  useEffect(() => {
    let cancelled = false
    let interval = null
    let raf = null
    let audio = null
    let typingStarted = false

    setVisibleText('')

    function stopAnimation() {
      if (interval !== null) {
        window.clearInterval(interval)
        interval = null
      }

      if (raf !== null) {
        window.cancelAnimationFrame(raf)
        raf = null
      }
    }

    // Fallback typewriter for when voice audio is unavailable.
    function typewriter() {
      if (cancelled || typingStarted) return

      typingStarted = true
      let characterIndex = 0

      interval = window.setInterval(() => {
        if (cancelled) {
          stopAnimation()
          return
        }

        characterIndex += 1
        setVisibleText(text.slice(0, characterIndex))

        if (characterIndex >= text.length) {
          window.clearInterval(interval)
          interval = null
        }
      }, 24)
    }

    // Synchronize each character with the generated voice.
    function syncToAudio(startTimes) {
      if (
        !Array.isArray(startTimes) ||
        startTimes.length < text.length
      ) {
        typewriter()
        return
      }

      typingStarted = true

      function step() {
        if (cancelled || !audio) return

        const currentTime = audio.currentTime
        let shown = 0

        while (
          shown < text.length &&
          startTimes[shown] <= currentTime
        ) {
          shown += 1
        }

        if (audio.ended) {
          setVisibleText(text)
          raf = null
          return
        }

        setVisibleText(text.slice(0, shown))
        raf = window.requestAnimationFrame(step)
      }

      raf = window.requestAnimationFrame(step)
    }

    // Allow text to start appearing if voice loading takes too long.
    const slowVoice = window.setTimeout(() => {
      if (!audio && !typingStarted) {
        typewriter()
      }
    }, 1500)

    // Allow keyboard input to skip the typing animation.
    finishTyping.current = () => {
      if (cancelled) return

      stopAnimation()
      typingStarted = true
      setVisibleText(text)
    }

    loadVoiceLine(text, speaker)
      .then((line) => {
        if (cancelled) {
          line?.audio?.pause()
          return
        }

        window.clearTimeout(slowVoice)

        // If typing already started, don't interrupt it.
        if (typingStarted) {
          line?.audio?.pause()
          return
        }

        if (!line?.audio) {
          typewriter()
          return
        }

        audio = line.audio

        audio.addEventListener(
          'ended',
          () => {
            if (!cancelled) {
              setVisibleText(text)
            }
          },
          { once: true },
        )

        audio.play().then(
          () => {
            if (!cancelled) {
              syncToAudio(line.startTimes)
            }
          },
          () => {
            if (!cancelled) {
              audio?.pause()
              audio = null
              typewriter()
            }
          },
        )
      })
      .catch(() => {
        if (!cancelled) {
          window.clearTimeout(slowVoice)
          typewriter()
        }
      })

    return () => {
      cancelled = true
      window.clearTimeout(slowVoice)
      stopAnimation()
      audio?.pause()
    }
  }, [text, speaker, muted])

  // Keep keyboard controls active for the current dialogue.
  useEffect(() => {
    function onKeyDown(event) {
      if (
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      ) {
        return
      }

      const key = event.key.toLowerCase()
      const isConfirm = key === 'e' || key === 'enter'
      const number = Number(key)

      const isChoice =
        Number.isInteger(number) &&
        number >= 1 &&
        number <= actions.length

      if (!isConfirm && !isChoice) return

      event.preventDefault()

      if (!done) {
        finishTyping.current()
        return
      }

      if (isChoice) {
        actions[number - 1].onClick()
      } else if (actions.length === 1) {
        actions[0].onClick()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [actions, done])

  return (
    <div
      className={`rover-dialogue rover-dialogue--${
        isHugh ? 'hugh' : isRover ? 'rover' : 'npc'
      }`}
    >
      <div
        className="rover-dialogue__portrait"
        aria-hidden="true"
      >
        {isHugh || isRover ? (
          <span
            className={`portrait-crop portrait-crop--${
              isHugh ? 'hugh' : 'rover'
            }`}
            style={{
              backgroundImage: `url("${
                isHugh ? hughPortrait : roverPortrait
              }")`,
            }}
          />
        ) : portrait ? (
          <img
            className="portrait-sprite"
            src={portrait}
            alt=""
            draggable="false"
          />
        ) : (
          <span className="portrait-emoji">
            {portraitText}
          </span>
        )}
      </div>

      <div className="rover-dialogue__content">
        <div className="rover-dialogue__speaker">
          {speaker}
        </div>

        <p
          aria-live="polite"
          className="rover-dialogue__text text-sm"
        >
          {visibleText}
          <span
            aria-hidden="true"
            className="rover-dialogue__cursor"
          >
            ▌
          </span>
        </p>

        {done && actions.length > 0 && (
          <div className="rover-dialogue__actions">
            {actions.map((action, index) => (
              <button
                className="rover-dialogue__choice"
                key={action.label}
                onClick={action.onClick}
                type="button"
              >
                {actions.length > 1 ? `${index + 1}. ` : ''}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}