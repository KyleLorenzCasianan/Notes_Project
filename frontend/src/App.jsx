import { Route, Routes } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import SharedPage from "./Pages/SharedPage";
import ConnectionsPage from "./Pages/ConnectionsPage";
import TrashPage from "./Pages/TrashPage";
import SettingsPage from "./Pages/SettingsPage";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shared" element={<SharedPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default App;