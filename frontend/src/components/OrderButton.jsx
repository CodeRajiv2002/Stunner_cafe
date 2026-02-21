import React from "react";

export default function OrderButton({ onClick, children = "Order Now" }) {
  return (
    <button type="button" className="order-button" onClick={onClick}>
      {children}
    </button>
  );
}
