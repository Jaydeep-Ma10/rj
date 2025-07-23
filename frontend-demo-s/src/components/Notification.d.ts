import React from "react";
interface NotificationProps {
    message: string;
    type?: "success" | "error";
    onClose: () => void;
}
declare const Notification: React.FC<NotificationProps>;
export default Notification;
