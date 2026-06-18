import { Toaster } from "react-hot-toast";

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "#363636",
          color: "#fff",
        },
        success: {
          style: {
            background: "#059669",
          },
        },
        error: {
          style: {
            background: "#dc2626",
          },
        },
      }}
    />
  );
};

export default Toast;
