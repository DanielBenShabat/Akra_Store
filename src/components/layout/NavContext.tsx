'use client';

import { createContext, useContext, useState } from 'react';

interface NavContextValue {
  navOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
}

const NavContext = createContext<NavContextValue>({
  navOpen: false,
  openNav: () => {},
  closeNav: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <NavContext.Provider
      value={{
        navOpen,
        openNav: () => setNavOpen(true),
        closeNav: () => setNavOpen(false),
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
