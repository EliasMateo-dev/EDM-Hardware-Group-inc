import { create } from "zustand";

export type NotificationType = "success" | "error" | "info";

interface NotificationState {
  message: string | null;
  type: NotificationType | null;
  visible: boolean;
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: null,
  visible: false,
  showNotification: (message, type, duration = 3000) => {
    set({ message, type, visible: true });
    if (duration > 0) {
      setTimeout(() => set({ visible: false }), duration);
    }
  },
  hideNotification: () => set({ visible: false }),
}));
