import React from "react";
import { useNotificationStore } from "../stores/useNotificationStore";

const typeStyles: Record<string, string> = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-blue-500 text-white",
};

const NotificationDisplay: React.FC = () => {
  const { message, type, visible, hideNotification } = useNotificationStore();

  if (!visible || !message || !type) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg flex items-center gap-2 ${typeStyles[type]}`}
      role="alert"
      onClick={hideNotification}
      style={{ cursor: "pointer", minWidth: 220 }}
    >
      <span>{message}</span>
      <button className="ml-2 text-white/80 hover:text-white text-lg" aria-label="Cerrar">×</button>
    </div>
  );
};

export default NotificationDisplay;
