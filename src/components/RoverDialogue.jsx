import { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'

// Typewriter dialogue box. Optional `actions` ([{ label, onClick }]) are shown
// as buttons once the line has finished typing. Keyboard: 1-9 pick an action,
// E / Enter picks the only action, or skips the typing if it is still going.
export default function RoverDialogue({ message: messageOverride, actions = [], onComplete }) {
  const text = messageOverride || 'Beep boop. R.O.V.E.R. online.'
  const [visibleText, setVisibleText] = useState('')
  const done = visibleText.length >= text.length

  const finishTyping = useRef(() => {})
  // Optional callback fired when the line finishes typing on its own.
  const completionRef = useRef(onComplete)
  completionRef.current = onComplete

  useEffect(() => {
    setVisibleText('')
    let characterIndex = 0
    const interval = window.setInterval(() => {
      characterIndex += 1
      setVisibleText(text.slice(0, characterIndex))
      if (characterIndex >= text.length) {
        window.clearInterval(interval)
        completionRef.current?.()
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
    <div
      className="rover-dialogue flex items-start gap-3 rounded-lg border border-orange-900/60 bg-black/30 p-3"
    >
      <Bot className="mt-0.5 shrink-0 text-orange-300" size={22} />
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-widest text-orange-300/70">R.O.V.E.R.</div>
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
