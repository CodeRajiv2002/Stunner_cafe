import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";

import axios from "axios";

// 1. Create the Context object here (internal use)
export const MenuContext = createContext();

// 2. The logic for fetching data
export const useMenuData = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/menu/allitems`,
      );
      if (response.data.success) {
        setMenu(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
        setMenu([]);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load menu";
      console.error("Menu fetch error:", errorMsg);
      setError(errorMsg);
      setMenu([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { menu, loading, error, refreshMenu: fetchMenu };
};

// 3. The Hook to access the context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used within MenuProvider");
  return context;
};
