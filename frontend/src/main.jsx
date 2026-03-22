import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";
import "./i18n/index.js"; // Initialize i18next before rendering

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
