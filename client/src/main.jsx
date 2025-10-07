import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import React from "react";
import App from "./App.jsx";
import "@fontsource/lexend";
import { BrowserRouter } from "react-router-dom";
import { reportWebVitals } from "./reportWebVitals";

reportWebVitals((metric) => {
  console.log(
    `${metric.name}: ${Math.round(metric.value * 100) / 100}`,
    metric
  );
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
