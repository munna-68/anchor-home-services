import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initMotionSystem } from "./motion-system";

createRoot(document.getElementById("root")!).render(<App />);

// Initialize motion system after first render
requestAnimationFrame(() => {
  initMotionSystem();
});
