import Log from "./pages/auth";
import ProtectedRoute from "./components/protectedRoute";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import { Navigate } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Log />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute Role="Administrator">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        
         <Route
          path="/student"
          element={
            <ProtectedRoute Role="Student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
    
      </Routes>
    </BrowserRouter>
  );
}

export default App;
