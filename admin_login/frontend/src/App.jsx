import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/Toast";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toast />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
