import  { Toaster } from "react-hot-toast";
import { createPortal } from "react-dom";

const Toast = () => {
  const ToastPortal = document.getElementById("toast");
  if (!ToastPortal) return null;
  return createPortal(<Toaster />, ToastPortal);
};

export default Toast;
