/* global chrome */

import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const handleClick = () => {
    // Query the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any) => {
      const currentTab = tabs[0];
      if (currentTab) {
        // Send a message to the content script within the active tab
        chrome.tabs.sendMessage(
          currentTab.id,
          { action: "toggleCaptions" },
          (response: any) => {
            // Handle any response if necessary
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }
            if (response && response.success) {
              console.log("Message sent successfully");
            } else {
              console.error("Failed to send message to content script");
            }
          }
        );
      }
    });
  };
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <button onClick={handleClick}>Toggle Cpations</button>
      </header>
    </div>
  );
}

export default App;
