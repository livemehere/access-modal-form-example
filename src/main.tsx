import "modern-normalize";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ModalFormPage from "./ModalFormPage";
import { ModalProvider } from "./lib/modal";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModalProvider>
      <ModalFormPage />
    </ModalProvider>
  </StrictMode>
);
