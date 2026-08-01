import { Toaster } from "react-hot-toast";
import { createPortal } from "react-dom";

const Toast = () => {
  const ToastPortal = document.getElementById("toast");
  if (!ToastPortal) return null;
  return createPortal(
    <Toaster
      toastOptions={{
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          fontSize: "0.875rem",
          fontFamily: "Dubai-regular, sans-serif",
        },
      }}
    />,
    ToastPortal
  );
};

export default Toast;
