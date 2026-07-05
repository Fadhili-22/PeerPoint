import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import StudentPortalLayout from "../layouts/StudentPortalLayout";
import ProtectedRoute from "./ProtectedRoute";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import VerifyEmailPending from "../pages/VerifyEmailPending";
import PendingApproval from "../pages/PendingApproval";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import ContactSupport from "../pages/ContactSupport";
import EmergencyInfo from "../pages/EmergencyInfo";
import ChoosePortal from "../pages/ChoosePortal";
import StudentDashboard from "../pages/StudentDashboard";
import CounsellorDirectory from "../pages/CounsellorDirectory";
import CounsellorProfile from "../pages/CounsellorProfile";
import SessionBookingPage from "../pages/SessionBookingPage";
import ResourceHub from "../pages/ResourceHub";
import ResourceDetails from "../pages/ResourceDetails";
import MySessions from "../pages/MySessions";
import CounsellorDashboard from "../pages/CounsellorDashboard";
import CounsellorRequests from "../pages/CounsellorRequests";
import CounsellorAvailability from "../pages/CounsellorAvailability";
import CounsellorProfileEdit from "../pages/CounsellorProfileEdit";
import CounsellorResources from "../pages/CounsellorResources";
import CounsellorResourceForm from "../pages/CounsellorResourceForm";
import CounsellorResourcePreview from "../pages/CounsellorResourcePreview";
import AdminDashboard from "../pages/AdminDashboard";
import AdminCounsellors from "../pages/AdminCounsellors";
import AdminStudents from "../pages/AdminStudents";
import AdminSessions from "../pages/AdminSessions";
import AdminResources from "../pages/AdminResources";
import AdminResourceForm from "../pages/AdminResourceForm";
import AdminResourcePreview from "../pages/AdminResourcePreview";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/contact-support" element={<ContactSupport />} />
        <Route path="/emergency-info" element={<EmergencyInfo />} />
      </Route>

      <Route
        path="/choose-portal"
        element={
          <ProtectedRoute>
            <ChoosePortal />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentPortalLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/directory" element={<CounsellorDirectory />} />
        <Route
          path="/student/counsellors/:counsellorId"
          element={<CounsellorProfile />}
        />
        <Route path="/student/book/:counsellorId" element={<SessionBookingPage />} />
        <Route path="/student/resources" element={<ResourceHub />} />
        <Route path="/student/resources/:resourceId" element={<ResourceDetails />} />
        <Route path="/student/sessions" element={<MySessions />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["counsellor"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/counsellor" element={<CounsellorDashboard />} />
        <Route path="/counsellor/requests" element={<CounsellorRequests />} />
        <Route path="/counsellor/resources" element={<CounsellorResources />} />
        <Route path="/counsellor/resources/new" element={<CounsellorResourceForm />} />
        <Route
          path="/counsellor/resources/:id/edit"
          element={<CounsellorResourceForm />}
        />
        <Route
          path="/counsellor/resources/:id/preview"
          element={<CounsellorResourcePreview />}
        />
        <Route
          path="/counsellor/availability"
          element={<CounsellorAvailability />}
        />
        <Route path="/counsellor/profile" element={<CounsellorProfileEdit />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/counsellors" element={<AdminCounsellors />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/sessions" element={<AdminSessions />} />
        <Route
          path="/admin/ratings"
          element={<Navigate to="/admin/sessions?tab=ratings" replace />}
        />
        <Route path="/admin/resources" element={<AdminResources />} />
        <Route path="/admin/reports" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/resources/new" element={<AdminResourceForm />} />
        <Route path="/admin/resources/:id/edit" element={<AdminResourceForm />} />
        <Route
          path="/admin/resources/:id/preview"
          element={<AdminResourcePreview />}
        />
      </Route>
    </Routes>
  );
}
