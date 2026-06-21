import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ResourcesProvider } from "./context/ResourcesContext";
import AppRouter from "./routes/AppRouter";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResourcesProvider>
          <AppRouter />
        </ResourcesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
