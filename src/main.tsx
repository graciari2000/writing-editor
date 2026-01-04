import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initAuthListener } from './store/useAppStore';

// Initialize auth listener BEFORE rendering the app
initAuthListener();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);