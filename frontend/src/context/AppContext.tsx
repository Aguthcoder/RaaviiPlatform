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
  city?: string;
}

export interface AppState {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  city: string | null;
  paymentSuccess: boolean;
  isProfileComplete: boolean;
  isTestTaken: boolean;
}

type Action =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_CITY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PAYMENT_SUCCESS"; payload: boolean };

/* ================= HELPERS ================= */

function computeProfileComplete(user: User | null, city: string | null): boolean {
  if (!user) return false;
  const hasName = !!(user.name?.trim());
  const hasCity = !!(city || user.city);
  if (user.isProfileComplete === true) return true;
  return hasName && hasCity;
}

/* ================= REDUCER ================= */

const initialState: AppState = {
  isLoggedIn: false,
  isLoading: true,
  user: null,
  city: null,
  paymentSuccess: false,
  isProfileComplete: false,
  isTestTaken: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN": {
      const city = state.city || (action.payload as any).city || null;
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        city,
        isProfileComplete: computeProfileComplete(action.payload, city),
        isTestTaken: !!(action.payload.isTestTaken),
      };
    }
    case "LOGOUT":
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("city");
        sessionStorage.clear();
        document.cookie = "token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      return { ...initialState, isLoading: false };
    case "SET_USER": {
      const city = state.city || (action.payload as any).city || null;
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        city,
        isProfileComplete: computeProfileComplete(action.payload, city),
        isTestTaken: !!(action.payload.isTestTaken),
      };
    }
    case "SET_CITY":
      return {
        ...state,
        city: action.payload,
        isProfileComplete: computeProfileComplete(state.user, action.payload),
      };
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
  dispatch?: React.Dispatch<Action>;
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
      const savedCity = localStorage.getItem("city");
      if (token && savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: "SET_USER", payload: user });
        if (savedCity) dispatch({ type: "SET_CITY", payload: savedCity });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      state,
      dispatch,
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
      setCity: (city) => {
        localStorage.setItem("city", city);
        dispatch({ type: "SET_CITY", payload: city });
      },
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* ================= HOOK ================= */

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
