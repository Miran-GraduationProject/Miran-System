import Log from "./pages/auth";
import ProtectedRoute from "./components/protectedRoute";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import { Navigate } from "react-router-dom";
import StudentDashboard from "./pages/StudentDashboard";
import Navbar from "./components/navbar";
import { Children } from "react";

const Layout=({children})=>{
  const location =useLocation();
  const hideNavbar =location.pathname==="/login"
  return (
    <>
      {!hideNavbar && <Navbar />}
        <div className="page-top">
          {children}
        </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
  
      <Routes>
        <Route path="/nav" element={<Navbar />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Log />} />

        <Route
          path="/admin"
          element={
            <Layout>
            <ProtectedRoute Role="Administrator">
              <AdminDashboard />
            </ProtectedRoute>
            </Layout>
          }
        />

        
         <Route
          path="/student"
          element={
            <Layout>
            <ProtectedRoute Role="Student">
              <StudentDashboard />
            </ProtectedRoute>
            </Layout>
          }
        />
    
      </Routes>
    </BrowserRouter>
  );
}

export default App;
