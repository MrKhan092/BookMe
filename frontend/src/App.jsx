import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import AppLayout from "./components/AppLayout";

// Public pages
import AuthPage from "./pages/AuthPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import BookingCancelledPage from "./pages/BookingCancelledPage";

// Authenticated pages
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ServicesPage from "./pages/ServicesPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import BookingsPage from "./pages/BookingsPage";
import PaymentsPage from "./pages/PaymentsPage";

// Admin pages
import AdminLoginPage from "./admin/AdminLoginPage";
import AdminDashboardPage from "./admin/AdminDashboardPage";

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/booking/success" element={<BookingSuccessPage />} />
      <Route path="/booking/cancelled" element={<BookingCancelledPage />} />

      {/* ── Authenticated routes (wrapped by AppLayout) ── */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/availability" element={<AvailabilityPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Route>

      {/* ── Admin routes ── */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

      {/* ── Fallback ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
