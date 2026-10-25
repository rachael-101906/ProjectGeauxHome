import "./styles.css";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom/client";

import MainMenu from "./screens/MainMenu.jsx";
import SaveSelect from "./screens/SaveSelect.jsx";
import Base from "./screens/Base.jsx";
import IntroStory from "./components/blocks/IntroStory.jsx";
import EndCutscene from "./components/blocks/EndCutscene.jsx";
import PixelTransition from "./components/PixelTransition.jsx";
import {
  clearSaveSlot,
  createSaveSlot,
  readSaveSlots,
  resetSaveSlots,
  updateSaveSlot,
} from "./state/save.js";

const transitionDuration = 500;

function App() {
  const [screen, setScreen] = useState("main-menu");
  const [transition, setTransition] = useState(null);
  const [activeSlot, setActiveSlot] = useState(null);
  const [saveState, setSaveState] = useState(() => {
    try {
      resetSaveSlots();
      return { slots: readSaveSlots(), error: "" };
    } catch (error) {
      return {
        slots: Array(3).fill(null),
        error: error instanceof Error ? error.message : "Could not read saved missions.",
      };
    }
  });

  function navigateTo(nextScreen) {
    if (transition || nextScreen === screen) {
      return;
    }

    setTransition({ phase: "cover", target: nextScreen });
  }

  function startNewMission(slot) {
    try {
      const slots = createSaveSlot(slot);
      setSaveState({ slots, error: "" });
      setActiveSlot(slot);
      navigateTo("intro-story");
    } catch (error) {
      setSaveState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : "Could not create the saved mission.",
      }));
    }
  }

  function continueMission(save) {
    setSaveState((current) => ({ ...current, error: "" }));
    setActiveSlot(save.slot);
    navigateTo(save.status === "briefing" ? "intro-story" : "base");
  }

  // The ending cutscene is over: delete this mission and go back to the beginning.
  const finishGame = useCallback(() => {
    try {
      if (activeSlot !== null) setSaveState({ slots: clearSaveSlot(activeSlot), error: "" });
    } catch {
      /* nothing to clear */
    }
    setActiveSlot(null);
    navigateTo("main-menu");
  }, [activeSlot]);

  const saveMission = useCallback(
    (updates) => {
      if (activeSlot === null) {
        return;
      }

      try {
        const slots = updateSaveSlot(activeSlot, updates);
        setSaveState({ slots, error: "" });
      } catch (error) {
        setSaveState((current) => ({
          ...current,
          error:
            error instanceof Error ? error.message : "Could not save the mission.",
        }));
      }
    },
    [activeSlot],
  );

  React.useEffect(() => {
    if (!transition) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      if (transition.phase === "cover") {
        setScreen(transition.target);
        setTransition({ ...transition, phase: "reveal" });
      } else {
        setTransition(null);
      }
    }, transitionDuration);

    return () => window.clearTimeout(timeout);
  }, [transition]);

  let activeScreen;

  if (screen === "save-select") {
    activeScreen = (
      <SaveSelect
        onBack={() => navigateTo("main-menu")}
        onContinue={continueMission}
        onNewMission={startNewMission}
        saveError={saveState.error}
        saveSlots={saveState.slots}
      />
    );
  } else if (screen === "intro-story") {
    activeScreen = (
      <IntroStory
        onBeginMission={() => {
          saveMission({ status: "in-progress" });
          navigateTo("base");
        }}
      />
    );
  } else if (screen === "ending") {
    activeScreen = <EndCutscene onFinish={finishGame} />;
  } else if (screen === "base") {
    const save = saveState.slots[activeSlot];
    activeScreen = save ? (
      <Base
        onGameComplete={() => navigateTo("ending")}
        onMainMenu={() => navigateTo("main-menu")}
        onSave={saveMission}
        saveError={saveState.error}
        savedGame={save}
      />
    ) : (
      <SaveSelect
        onBack={() => navigateTo("main-menu")}
        onContinue={continueMission}
        onNewMission={startNewMission}
        saveError={saveState.error || "The selected mission save is unavailable."}
        saveSlots={saveState.slots}
      />
    );
  } else {
    activeScreen = (
      <MainMenu onStartGame={() => navigateTo("save-select")} />
    );
  }

  return (
    <>
      {activeScreen}
      <PixelTransition phase={transition?.phase ?? null} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);