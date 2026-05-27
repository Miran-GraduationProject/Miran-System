import Log from "./pages/auth";
import ProtectedRoute from "./components/protectedRoute";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState,useEffect } from "react";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";

import TrainingPeriodsPage from './pages/TrainingPeriodsPage';
import HospitalsPage from './pages/HospitalsPage';
import RegistrationMonitorPage from './pages/RegistrationMonitorPage';
import StudentListPage from './pages/StudentListPage';
import ConfirmedAllocationsPage from './pages/ConfirmedAllocationsPage';
import StudentPreferencesPage from './pages/StudentPreferencesPage';
import StudentDetails from './pages/StudentDetails';

import Reports from "./pages/Reports";
import ReportCreate from "./pages/ReportCreate";
import Templates from "./pages/Templates";
import SplashScreen from "./components/SplashScreen"
// import StudentReports from "./pages/StudentReports";
// import StudentReportFill from "./pages/StudentReportFill";

import Navbar from "./components/navbar";
//import { Children } from "react";

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
    const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>

      {showSplash ? (
        <SplashScreen />
      ) : (
    <BrowserRouter>

      <Routes>

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

        <Route
          path="/coordinator"
          element={
            <Layout>
              <ProtectedRoute Role="UniversityCoordinator">
                <CoordinatorDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/supervisor"
          element={
            <Layout>
              <ProtectedRoute Role="AcademicSupervisor">
                <SupervisorDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/training-periods"
          element={
            <Layout>
              <ProtectedRoute Role="UniversityCoordinator">
                <TrainingPeriodsPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/hospitals"
          element={
            <Layout>
              <ProtectedRoute Role="UniversityCoordinator">
                <HospitalsPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/registration-monitor"
          element={
            <Layout>
              <ProtectedRoute Role="UniversityCoordinator">
                <RegistrationMonitorPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/student-list"
          element={
            <Layout>
              <ProtectedRoute Role="UniversityCoordinator">
                <StudentListPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/student-preferences"
          element={
            <Layout>
              <ProtectedRoute Role="Student">
                <StudentPreferencesPage />
              </ProtectedRoute>
            </Layout>
          }
        />  
<Route
          path="/confirmed-allocations"
          element={
            <Layout>
<ProtectedRoute Role="UniversityCoordinator">
                <ConfirmedAllocationsPage />
              </ProtectedRoute>
            </Layout>
          }
        />

        <Route
          path="/supervisor/student/:studentID"
          element={
            <Layout>
              <ProtectedRoute Role="AcademicSupervisor">
                <StudentDetails/>
              </ProtectedRoute>
            </Layout>
          }
        />

<Route
  path="/reports"
  element={
    <Layout>
      <ProtectedRoute Role="AcademicSupervisor">
        <Reports />
      </ProtectedRoute>
    </Layout>
  }
/>

<Route
  path="/reports/create"
  element={
    <Layout>
      <ProtectedRoute Role="AcademicSupervisor">
        <ReportCreate />
      </ProtectedRoute>
    </Layout>
  }
/>

<Route
  path="/templates"
  element={
    <Layout>
      <ProtectedRoute Role="AcademicSupervisor">
        <Templates />
      </ProtectedRoute>
    </Layout>
  }
/>

<Route
  path="/student/reports"
  element={
    <Layout>
      <ProtectedRoute Role="Student">
        {/* <StudentReports /> */}
      </ProtectedRoute>
    </Layout>
  }
/>

<Route
  path="/student/reports/fill/:reportID"
  element={
    <Layout>
      <ProtectedRoute Role="Student">
        {/* <StudentReportFill /> */}
      </ProtectedRoute>
    </Layout>
  }
/>
      </Routes>

    </BrowserRouter>

     )}
    </>
  );

  
}



export default App;