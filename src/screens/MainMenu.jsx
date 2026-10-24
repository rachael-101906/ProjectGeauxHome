// src/screens/MainMenu.jsx

import React from "react";

import background from "..\components\assets\backgrounds\project_geaux_home_background.png";
import logo from "..\components\assets\logos\project_geaux_home_logo.png";

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