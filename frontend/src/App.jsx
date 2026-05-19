import Log from "./pages/auth";
import ProtectedRoute from "./components/protectedRoute";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";

import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import SupervisorDashboard from "./pages/SupervisorDashboard";

import TrainingPeriodsPage from "./pages/TrainingPeriodsPage";
import HospitalsPage from "./pages/HospitalsPage";
import RegistrationMonitorPage from "./pages/RegistrationMonitorPage";
import StudentListPage from "./pages/StudentListPage";
import ConfirmedAllocationsPage from "./pages/ConfirmedAllocationsPage";
import StudentPreferencesPage from "./pages/StudentPreferencesPage";
import StudentDetails from "./pages/StudentDetails";
import { useEffect, useState } from "react";
import { SplashScreen } from "./components/SplashScreen";
import Navbar from "./components/navbar";
//import { Children } from "react";
import { AnimatePresence, motion } from "framer-motion";

import FooterComponent from "./components/footer";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";
  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="page-top">{children}</div>
      {!hideNavbar && <FooterComponent />}
    </>
  );
};
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
        <BrowserRouter className="">
          <Layout>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Log />} />

                <Route
                  path="/admin"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="Administrator">
                        <AdminDashboard />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/student"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="Student">
                        <StudentDashboard />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/coordinator"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="UniversityCoordinator">
                        <CoordinatorDashboard />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/supervisor"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="AcademicSupervisor">
                        <SupervisorDashboard />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/training-periods"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="UniversityCoordinator">
                        <TrainingPeriodsPage />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/hospitals"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="UniversityCoordinator">
                        <HospitalsPage />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/registration-monitor"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="UniversityCoordinator">
                        <RegistrationMonitorPage />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/student-list"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="UniversityCoordinator">
                        <StudentListPage />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/student-preferences"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="Student">
                        <StudentPreferencesPage />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/confirmed-allocations"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="UniversityCoordinator">
                        <ConfirmedAllocationsPage />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/supervisor/student/:studentID"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="AcademicSupervisor">
                        <StudentDetails />
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />

                <Route
                  path="/results"
                  element={
                    <PageWrapper>
                      <ProtectedRoute Role="Student">
                      <div>lama</div>
                      </ProtectedRoute>
                    </PageWrapper>
                  }
                />
              </Routes>
            </AnimatePresence>
          </Layout>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
