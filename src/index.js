import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    // navigator.serviceWorker.register('./serviceworker/ServiceWorker.js')
  })
}
ReactDOM.render(<App />, document.getElementById("root"));
