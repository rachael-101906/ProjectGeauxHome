import { useEffect, useRef, useState } from 'react'
import roverPortrait from './assets/backgrounds/rover.png'

// Typewriter dialogue box. Optional `actions` ([{ label, onClick }]) are shown
// as buttons once the line has finished typing. Keyboard: 1-9 pick an action,
// E / Enter picks the only action, or skips the typing if it is still going.
export default function RoverDialogue({ message: messageOverride, actions = [], speaker = "R.O.V.E.R." }) {
  const text = messageOverride || 'Beep boop. R.O.V.E.R. online.'
  const [visibleText, setVisibleText] = useState('')
  const done = visibleText.length >= text.length

  const finishTyping = useRef(() => {})

  useEffect(() => {
    setVisibleText('')
    let characterIndex = 0
    const interval = window.setInterval(() => {
      characterIndex += 1
      setVisibleText(text.slice(0, characterIndex))
      if (characterIndex >= text.length) {
        window.clearInterval(interval)
      }
    }, 24)

    // Lets a key press skip ahead without the timer typing over it.
    finishTyping.current = () => {
      window.clearInterval(interval)
      setVisibleText(text)
    }

    return () => window.clearInterval(interval)
  }, [text])

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
    <div className={`rover-dialogue rover-dialogue--${speaker === "HUGH MANN" ? "hugh" : "rover"}`}>
      <div className="rover-dialogue__portrait" aria-hidden="true">
        {speaker === "HUGH MANN" ? (
          <div className="hugh-portrait">
            <span className="hugh-portrait__head" />
            <span className="hugh-portrait__neck" />
            <span className="hugh-portrait__shoulders" />
          </div>
        ) : (
          <img className="rover-dialogue__rover-image" src={roverPortrait} alt="" draggable="false" />
        )}
      </div>
      <div className="rover-dialogue__content">
        <div className="rover-dialogue__speaker">{speaker}</div>
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
