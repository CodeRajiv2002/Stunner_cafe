import { MenuContext, useMenuData } from "../hook/useMenu";

export const MenuProvider = ({ children }) => {
  const menuState = useMenuData();

  return (
    <MenuContext.Provider value={menuState}>{children}</MenuContext.Provider>
  );
};
