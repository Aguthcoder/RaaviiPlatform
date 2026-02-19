"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

/* ================= TYPES ================= */

export interface User {
  id: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  avatar?: string;
  role?: string;
  isProfileComplete?: boolean;
  isTestTaken?: boolean;
}

export interface AppState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  city: string | null;
  paymentSuccess: boolean;
}

type Action =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_CITY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PAYMENT_SUCCESS"; payload: boolean };

/* ================= REDUCER ================= */

const initialState: AppState = {
  isLoggedIn: false,
  isLoading: true,
  user: null,
  city: null,
  paymentSuccess: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isLoggedIn: true, user: action.payload };

    case "LOGOUT":
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return { ...initialState, isLoading: false };

    case "SET_USER":
      return { ...state, isLoggedIn: true, user: action.payload };

    case "SET_CITY":
      return { ...state, city: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_PAYMENT_SUCCESS":
      return { ...state, paymentSuccess: action.payload };

    default:
      return state;
  }
}

/* ================= CONTEXT ================= */

interface AppContextType {
  state: AppState;

  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;

  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setCity: (city: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

/* ================= PROVIDER ================= */

export default function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        dispatch({ type: "SET_USER", payload: JSON.parse(savedUser) });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      state,
      user: state.user,
      isLoggedIn: state.isLoggedIn,
      isLoading: state.isLoading,

      login: (user, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "LOGIN", payload: user });
      },

      logout: () => dispatch({ type: "LOGOUT" }),

      setUser: (user) => dispatch({ type: "SET_USER", payload: user }),

      setCity: (city) => dispatch({ type: "SET_CITY", payload: city }),
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ================= HOOK ================= */

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
