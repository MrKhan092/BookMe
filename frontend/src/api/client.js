import axios from "axios"

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const persistTokenResponse = (response) => {
    const token = response.data?.token;
    if (token) {
        localStorage.setItem("token", token);
    }
    return response;
};

client.interceptors.response.use(persistTokenResponse, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.assign('/login');
    }
    return Promise.reject(error);
});

// ── Auth ─────────────────────────────────────────────
export const registerUser = (data) => client.post("/auth/register", data);
export const loginUser = (data) => client.post("/auth/login", data);
export const getMe = () => client.get("/auth/me");
export const updateProfile = (data) => client.put("/auth/profile", data);
export const requestRegistrationOtp = (data) => client.post("/auth/register/request-otp", data);
export const verifyRegistrationOtp = (data) => client.post("/auth/register/verify-otp", data);

// ── Services ─────────────────────────────────────────
export const listServices = () => client.get("/services");
export const createService = (data) => client.post("/services", data);
export const updateService = (id, data) => client.put(`/services/${id}`, data);
export const deleteService = (id) => client.delete(`/services/${id}`);

// ── Availability ─────────────────────────────────────
export const listAvailability = () => client.get("/availability");
export const saveAvailability = (data) => client.post("/availability", data);

// ── Bookings ─────────────────────────────────────────
export const listBookings = (params) => client.get("/bookings", { params });
export const updateBookingStatus = (id, data) => client.patch(`/bookings/${id}`, data);
export const rescheduleBooking = (id, data) => client.patch(`/bookings/${id}/reschedule`, data);

// ── Integrations ─────────────────────────────────────
export const getGoogleConnectUrl = () => client.get("/integration/google/connect");

// ── Payments ─────────────────────────────────────────
export const getPaymentOverview = () => client.get("/payments");
export const updatePayoutDetails = (data) => client.put("/payments/payout-details", data);
export const requestWithdrawal = (data) => client.post("/payments/withdrawls", data);

// ── Public (no auth needed) ──────────────────────────
export const getPublicBusiness = (slug) => client.get(`/public/${slug}`);
export const getPublicSlots = (slug, params) => client.get(`/public/${slug}/slots`, { params });
export const requestPublicBookingOtp = (slug, data) => client.post(`/public/${slug}/request-otp`, data);
export const verifyPublicBookingOtp = (slug, data) => client.post(`/public/${slug}/verify-otp`, data);
export const createPublicBooking = (slug, data) => client.post(`/public/${slug}/book`, data);
export const getBookingStatus = (params) => client.get("/public/booking/status", { params });
export const cancelPublicBookingPayment = (data) => client.post("/public/booking/cancel-payment", data);

export default client;