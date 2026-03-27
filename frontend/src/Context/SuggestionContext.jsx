import React, { createContext, useContext, useState } from "react";

const SuggestionContext = createContext();

export const SuggestionProvider = ({ children }) => {
  const [suggestion, setSuggestion] = useState({
    isOpen: false,
    items: [],
    triggeredBy: null,
  });

  const openSuggestion = (items, triggeredByItem) => {
    setSuggestion({
      isOpen: true,
      items,
      triggeredBy: triggeredByItem,
    });
  };

  const closeSuggestion = () => {
    setSuggestion({
      isOpen: false,
      items: [],
      triggeredBy: null,
    });
  };

  return (
    <SuggestionContext.Provider
      value={{ suggestion, openSuggestion, closeSuggestion }}
    >
      {children}
    </SuggestionContext.Provider>
  );
};

export const useSuggestion = () => {
  const context = useContext(SuggestionContext);
  if (!context) {
    throw new Error("useSuggestion must be used inside SuggestionProvider");
  }
  return context;
};
