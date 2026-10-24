// src/screens/MainMenu.jsx

import React from "react";

import background from "../components/assets/backgrounds/Project Geaux Home.png";
import logo from "../components/assets/logos/project geaux home main logo.png";

export default function MainMenu() {
  return (
    <div
      className="main-menu"
      style={{
        backgroundImage: `url(${background})`,
      }}
    >
      <img
        src={logo}
        alt="Project Geaux Home"
        className="logo"
      />

      <div className="menu-buttons">
        <button className="menu-button">
          START GAME
        </button>

        <button className="menu-button">
          HELP
        </button>

        <button className="menu-button">
          CREDITS
        </button>
      </div>
    </div>
  );
}