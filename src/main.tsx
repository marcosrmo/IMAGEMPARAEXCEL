import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import logoUrl from "./assets/logo.png";

const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']") || document.createElement("link");
link.rel = "icon";
link.type = "image/png";
link.href = logoUrl;
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(<App />);
