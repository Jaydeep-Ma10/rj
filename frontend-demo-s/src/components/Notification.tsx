import React from "react";

interface NotificationProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type = "success", onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white ${type === "error" ? "bg-red-600" : "bg-green-600"}`}>
      <div className="flex items-center gap-4">
        <span>{message}</span>
        <button className="ml-4 font-bold" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
};

export default Notification;
