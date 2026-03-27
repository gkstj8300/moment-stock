import { create } from "zustand";

type ConnectionStatus = "connected" | "disconnected" | "reconnecting";

interface ConnectionState {
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
  isOnline: () => boolean;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: "connected",

  setStatus: (status) => set({ status }),

  isOnline: () => get().status === "connected",
}));
