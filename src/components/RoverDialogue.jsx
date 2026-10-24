import { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";

export default function RoverDialogue({
  message: messageOverride,
  actions = [],
  speaker = "R.O.V.E.R.",
}) {
  const text = messageOverride || "Beep boop. R.O.V.E.R. online.";
  const [visibleText, setVisibleText] = useState("");
  const finishTyping = useRef(() => {});
  const done = visibleText.length >= text.length;

  const [muted, setMuted] = useState(isVoiceMuted)

  useEffect(() => {
    setVisibleText("");
    let characterIndex = 0;
    const interval = window.setInterval(() => {
      characterIndex += 1;
      setVisibleText(text.slice(0, characterIndex));
      if (characterIndex >= text.length) {
        window.clearInterval(interval);
      }
    }, 24);

    finishTyping.current = () => {
      window.clearInterval(interval);
      setVisibleText(text);
    };

    return () => window.clearInterval(interval);
  }, [text]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const isConfirm = key === "e" || key === "enter";
      const choiceNumber = Number(key);
      const isChoice =
        Number.isInteger(choiceNumber) &&
        choiceNumber >= 1 &&
        choiceNumber <= actions.length;

      if (!isConfirm && !isChoice) return;

      event.preventDefault();
      if (!done) {
        finishTyping.current();
        return;
      }

      if (isChoice) {
        actions[choiceNumber - 1].onClick();
      } else if (actions.length === 1) {
        actions[0].onClick();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [actions, done]);

  return (
    <div className="rover-dialogue">
      <Bot className="rover-dialogue__icon" aria-hidden="true" size={22} />
      <div className="rover-dialogue__content">
        <div className="rover-dialogue__speaker">{speaker}</div>
        <p aria-live="polite" className="rover-dialogue__text">
          {visibleText}
          <span aria-hidden="true" className="rover-dialogue__cursor">▌</span>
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
                {actions.length > 1 ? `${index + 1}. ` : ""}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
