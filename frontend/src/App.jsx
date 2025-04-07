import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Map from "./components/Map";
import Dashboard from "./pages/Dashboard";
import ELDLogs from "./pages/ELDLogs";
import NewTrip from "./pages/NewTrip";
import TripHistory from "./pages/TripHistory";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/map" element={<Map />} />
      <Route path="/logs" element={<ELDLogs />} />
      <Route path="/new-trip" element={<NewTrip />} />
      <Route path="/trip-history" element={<TripHistory />} />
    </Routes>
  );
}

export default App;