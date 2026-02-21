import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./Context/CartContext.jsx";
import { MenuProvider } from "./Context/MenuContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* 1. Menu is the "Source of Truth" from the Backend */}
    <MenuProvider>
      {/* 2. Cart handles User Actions based on that Menu */}
      <CartProvider>
        <App />
      </CartProvider>
    </MenuProvider>
  </StrictMode>,
);
