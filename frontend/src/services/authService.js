import apiClient from './api';

// Simple Auth
export const registerUser = (userData) => apiClient.post('/users/register', userData);
export const loginUser = (credentials) => apiClient.post('/users/login', credentials);
export const getUserProfile = () => apiClient.get('/users/profile');
export const updateUserProfile = (userData) => apiClient.put('/users/profile', userData);

// Doctors
export const getAllDoctors = (params) => apiClient.get('/doctors', { params });
export const getDoctorById = (id) => apiClient.get(`/doctors/${id}`);
export const createDoctorProfile = (doctorData) => apiClient.post('/doctors', doctorData);
export const updateDoctorProfile = (id, doctorData) => apiClient.put(`/doctors/${id}`, doctorData);

// Appointments
export const createAppointment = (data) => apiClient.post('/appointments', data);
export const getUserAppointments = () => apiClient.get('/appointments');
export const getAppointmentById = (id) => apiClient.get(`/appointments/${id}`);
export const updateAppointment = (id, data) => apiClient.put(`/appointments/${id}`, data);
export const cancelAppointment = (id) => apiClient.delete(`/appointments/${id}`);

// AI Chat
export const sendChatMessage = (message) => apiClient.post('/chat', { message });

// Doctor Dashboard
export const getDoctorAppointments = () => apiClient.get('/doctor/appointments');
export const updateAppointmentStatus = (id, status) => apiClient.patch(`/doctor/appointments/${id}/status`, { status });
export const getDoctorPatients = () => apiClient.get('/doctor/patients');
export const getPatientDetail = (patientId) => apiClient.get(`/doctor/patients/${patientId}`);

// Prescriptions
export const createPrescription = (data) => apiClient.post('/prescriptions', data);
export const getMyPrescriptions = () => apiClient.get('/prescriptions');
export const getPrescriptionById = (id) => apiClient.get(`/prescriptions/${id}`);
export const getDoctorPrescriptions = () => apiClient.get('/prescriptions/doctor/all');

// Medicine
export const addMedicine = (data) => apiClient.post('/medicine', data);
export const getMedicines = () => apiClient.get('/medicine');
export const deleteMedicine = (id) => apiClient.delete(`/medicine/${id}`);
export const toggleMedicine = (id) => apiClient.patch(`/medicine/${id}/toggle`);

// OCR
export const uploadPrescription = (formData) => apiClient.post('/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Pregnancy
export const getAllPregnancyWeeks = () => apiClient.get('/pregnancy');
export const getPregnancyWeek = (week) => apiClient.get(`/pregnancy/${week}`);

// Family
export const createFamily = (name) => apiClient.post('/family', { name });
export const addFamilyMember = (data) => apiClient.post('/family/add-member', data);
export const getFamilies = () => apiClient.get('/family');
export const deleteFamily = (id) => apiClient.delete(`/family/${id}`);
export const getFamilyMemberHealth = (userId) => apiClient.get(`/family/member/${userId}/health`);

// Messages
export const sendDirectMessage = (receiverId, message) => apiClient.post('/messages/send', { receiverId, message });
export const getConversations = () => apiClient.get('/messages');
export const getChatThread = (partnerId) => apiClient.get(`/messages/${partnerId}`);
export const getAvailableDoctors = () => apiClient.get('/messages/doctors/list');

// Health check
export const healthCheck = () => apiClient.get('/health');
