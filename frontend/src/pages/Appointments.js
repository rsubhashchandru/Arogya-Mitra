import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getUserAppointments, cancelAppointment } from '../services/authService';

const STATUS_CONFIG = {
  scheduled: {
    class: 'status-scheduled',
    icon: '🕐',
    label: 'appointments.scheduled',
  },
  completed: {
    class: 'status-completed',
    icon: '✅',
    label: 'appointments.completed',
  },
  cancelled: {
    class: 'status-cancelled',
    icon: '❌',
    label: 'appointments.cancelled',
  },
  'no-show': {
    class: 'badge bg-gray-100 text-gray-600 border border-gray-200',
    icon: '⚠️',
    label: 'appointments.noShow',
  },
};

function AppointmentSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex gap-4">
        <div className="skeleton w-14 h-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-3 w-1/3" />
          <div className="flex gap-2 mt-3">
            <div className="skeleton h-8 w-24 rounded-lg" />
            <div className="skeleton h-8 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ appointment, onConfirm, onCancel, loading }) {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-content max-w-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('appointments.cancelAppointment')}</h3>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">{t('appointments.confirmCancel')}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-ghost border border-gray-200">
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Appointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getUserAppointments();
      setAppointments(response.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || t('appointments.failedToFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    setCancelLoading(true);
    try {
      await cancelAppointment(confirmCancel);
      setAppointments((prev) =>
        prev.map((apt) =>
          apt._id === confirmCancel ? { ...apt, status: 'cancelled' } : apt
        )
      );
      setConfirmCancel(null);
    } catch (err) {
      setError(err.response?.data?.message || t('appointments.failedToCancel'));
      setConfirmCancel(null);
    } finally {
      setCancelLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: appointments.length },
    { id: 'scheduled', label: t('appointments.scheduled'), count: appointments.filter(a => a.status === 'scheduled').length },
    { id: 'completed', label: t('appointments.completed'), count: appointments.filter(a => a.status === 'completed').length },
    { id: 'cancelled', label: t('appointments.cancelled'), count: appointments.filter(a => a.status === 'cancelled').length },
  ];

  const filtered = activeTab === 'all'
    ? appointments
    : appointments.filter((a) => a.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-2">{t('appointments.myAppointments')}</h1>
          <p className="text-primary-100">Manage all your bookings in one place</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="alert-error mb-6">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <AppointmentSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {activeTab === 'all' ? t('appointments.noAppointmentsBooked') : `No ${activeTab} appointments`}
            </h3>
            <p className="text-gray-400 mb-6">Book your first appointment with a top doctor</p>
            <Link to="/doctors" className="btn-primary">
              🔍 Find a Doctor
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appointment, idx) => {
              const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
              const appointmentDate = new Date(appointment.appointmentDate);
              const isPast = appointmentDate < new Date();

              return (
                <div
                  key={appointment._id}
                  className={`card animate-fade-in-up ${appointment.status === 'cancelled' ? 'opacity-70' : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Doctor avatar */}
                    <div className="doctor-avatar flex-shrink-0 text-2xl w-14 h-14">👨‍⚕️</div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                          </h3>
                          <p className="text-primary-600 font-medium text-sm">
                            {appointment.doctorId?.specialization}
                          </p>
                        </div>
                        <span className={status.class}>
                          {status.icon} {t(status.label)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-sm">📅</span>
                          <div>
                            <p className="text-xs text-gray-400">Date</p>
                            <p className="text-sm font-semibold text-gray-800">
                              {appointmentDate.toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center text-sm">🕐</span>
                          <div>
                            <p className="text-xs text-gray-400">Time</p>
                            <p className="text-sm font-semibold text-gray-800">{appointment.appointmentTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <span className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center text-sm">📝</span>
                          <div>
                            <p className="text-xs text-gray-400">Reason</p>
                            <p className="text-sm font-semibold text-gray-800">{appointment.reason}</p>
                          </div>
                        </div>
                      </div>

                      {appointment.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                          📌 {appointment.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {appointment.status === 'scheduled' && !isPast && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => setConfirmCancel(appointment._id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors text-sm border border-red-200"
                        >
                          ✕ {t('appointments.cancel')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirm Modal */}
      {confirmCancel && (
        <ConfirmModal
          appointment={confirmCancel}
          onConfirm={handleCancel}
          onCancel={() => setConfirmCancel(null)}
          loading={cancelLoading}
        />
      )}
    </div>
  );
}

export default Appointments;
