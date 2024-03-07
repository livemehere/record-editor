import { createRoot } from "react-dom/client";
import App from "@renderer/App";
import "./styles/index.scss";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
