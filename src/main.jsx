import "./styles.css";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import MainMenu from "./screens/MainMenu.jsx";
import SaveSelect from "./screens/SaveSelect.jsx";

function App() {
  const [screen, setScreen] = useState("main-menu");

  return screen === "save-select" ? (
    <SaveSelect onBack={() => setScreen("main-menu")} />
  ) : (
    <MainMenu onStartGame={() => setScreen("save-select")} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);