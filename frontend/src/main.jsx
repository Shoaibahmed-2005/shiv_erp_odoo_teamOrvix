import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode><BrowserRouter><AuthProvider><App /></AuthProvider><ToastContainer position="bottom-right" /></BrowserRouter></React.StrictMode>);
