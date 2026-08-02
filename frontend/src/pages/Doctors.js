import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllDoctors, createAppointment } from '../services/authService';

const SPECIALIZATIONS = [
  'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Psychiatry', 'Gynecology', 'General Medicine',
  'Ophthalmology', 'ENT', 'Urology', 'Oncology',
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM',
];

// ── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function DoctorSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex gap-4">
        <div className="skeleton w-16 h-16 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-1/2" />
          <div className="skeleton h-3 w-1/3" />
        </div>
      </div>
      <div className="skeleton h-10 w-full mt-4 rounded-xl" />
    </div>
  );
}

// ── Map Modal ─────────────────────────────────────────────────────────────────
function MapModal({ doctor, onClose }) {
  const clinicName    = doctor.clinic?.name || doctor.clinicName || 'Clinic';
  const clinicAddress = doctor.clinic?.clinicAddress || doctor.clinicAddress || '';
  const city          = doctor.clinic?.city || doctor.city || '';
  const query         = encodeURIComponent(`${clinicName}, ${clinicAddress}, ${city}`);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
  const mapsUrl       = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const embedUrl      = `https://maps.google.com/maps?q=${query}&output=embed&zoom=15`;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📍 Clinic Location</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} · {doctor.specialization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Clinic Info */}
        <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">🏥</span>
            <div>
              <p className="font-bold text-gray-900">{clinicName}</p>
              <p className="text-sm text-gray-600">{clinicAddress}</p>
              <p className="text-sm text-primary-600 font-medium">{city}</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="relative w-full h-72 bg-gray-100">
          <iframe
            title="Clinic Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={embedUrl}
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-3">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-5 rounded-xl transition-colors text-sm"
          >
            🧭 Get Directions
          </a>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-5 rounded-xl transition-colors text-sm"
          >
            🗺️ Open in Google Maps
          </a>
          <button
            onClick={onClose}
            className="sm:w-auto w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium py-3 px-5 rounded-xl transition-colors text-sm"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ doctor, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentDate || !form.appointmentTime || !form.reason) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createAppointment({
        doctorId: doctor._id,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.reason,
        notes: form.notes,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('doctors.bookAppointment')}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Dr. {doctor.userId?.firstName} {doctor.userId?.lastName} · {doctor.specialization}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Doctor info pill */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl border border-primary-100">
            <div className="doctor-avatar w-12 h-12 text-2xl">👨‍⚕️</div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}
              </p>
              <p className="text-primary-600 text-xs">{doctor.specialization}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="font-bold text-primary-600 text-base">₹{doctor.consultationFee}</p>
              <p className="text-gray-400 text-xs">consultation fee</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="alert-error">
              <span>⚠️</span>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="form-label">{t('appointments.date')} <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.appointmentDate}
              min={today}
              onChange={e => setForm({ ...form, appointmentDate: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="form-label">{t('appointments.time')} <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setForm({ ...form, appointmentTime: slot })}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.appointmentTime === slot
                      ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="form-label">{t('appointments.reason')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="e.g. Fever, Checkup, Follow-up..."
              className="form-input"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Additional Notes <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Any additional information for the doctor..."
              rows={2}
              className="form-input resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-ghost border border-gray-200">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Booking...
                </>
              ) : <>✅ Confirm Booking</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ onClose, onViewAppointments }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content p-8 text-center max-w-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5 animate-bounce">
          🎉
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Your appointment has been successfully booked. You'll receive a confirmation shortly.
        </p>
        <div className="flex flex-col gap-2">
          <button onClick={onViewAppointments} className="btn-primary w-full">
            📅 View My Appointments
          </button>
          <button onClick={onClose} className="btn-ghost w-full border border-gray-200">
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Doctors Page ─────────────────────────────────────────────────────────
function Doctors() {
  const { t }    = useTranslation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filters, setFilters]           = useState({ specialization: '', city: '', page: 1 });
  const [pagination, setPagination]     = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [mapDoctor, setMapDoctor]       = useState(null);  // doctor for map modal

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors(filters);
      setDoctors(response.data.doctors || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handleBookClick = (doctor) => {
    if (!isLoggedIn) { navigate('/login'); return; }
    setSelectedDoctor(doctor);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-2">{t('doctors.findDoctor')}</h1>
          <p className="text-primary-100">Discover top-rated specialists near you and book instantly</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">🩺 {t('doctors.specialization')}</label>
              <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className="form-input">
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">📍 {t('common.city')}</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder={t('doctors.searchByCity')}
                className="form-input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ specialization: '', city: '', page: 1 })}
                className="btn-ghost border border-gray-200 w-full"
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <DoctorSkeleton key={i} />)}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('doctors.noDoctorsFound')}</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search filters</p>
            <button onClick={() => setFilters({ specialization: '', city: '', page: 1 })} className="btn-outline">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4 font-medium">
              Showing {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
              {filters.specialization && ` · ${filters.specialization}`}
              {filters.city && ` · ${filters.city}`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {doctors.map((doctor, idx) => (
                <div
                  key={doctor._id}
                  className="card-hover animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Doctor Card */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="doctor-avatar">👨‍⚕️</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base leading-tight">
                            Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}
                          </h3>
                          <p className="text-primary-600 font-semibold text-sm mt-0.5">
                            {doctor.specialization}
                          </p>
                        </div>
                        {doctor.isVerified && (
                          <span className="badge-primary flex-shrink-0 text-xs">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-base">🏆</span>
                      <span>{doctor.experience} {t('doctors.years')} experience</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StarRating rating={doctor.rating} />
                      <span className="text-sm text-gray-500">
                        {doctor.rating.toFixed(1)} ({doctor.totalReviews} {t('doctors.reviews')})
                      </span>
                    </div>

                    {(doctor.clinic?.name || doctor.clinicName) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-base">🏥</span>
                        <span className="truncate">{doctor.clinic?.name || doctor.clinicName}</span>
                      </div>
                    )}

                    {(doctor.clinic?.city || doctor.city) && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="text-base">📍</span>
                        <span>{doctor.clinic?.city || doctor.city}</span>
                        {/* Map link */}
                        <button
                          onClick={() => setMapDoctor(doctor)}
                          className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 hover:underline"
                        >
                          🗺️ View Map
                        </button>
                      </div>
                    )}

                    {doctor.qualification?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {doctor.qualification.slice(0, 2).map((q, i) => (
                          <span key={i} className="badge bg-gray-100 text-gray-600 text-xs">{q}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="divider" />

                  {/* Fee + Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-2xl font-extrabold text-primary-600">₹{doctor.consultationFee}</span>
                      <span className="text-gray-400 text-xs ml-1">/ consult</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMapDoctor(doctor)}
                        className="btn-ghost border border-gray-200 text-sm px-3 py-2 flex items-center gap-1"
                        title="View clinic on map"
                      >
                        🗺️
                      </button>
                      <button
                        onClick={() => handleBookClick(doctor)}
                        className="btn-primary text-sm px-4 py-2.5"
                      >
                        {isLoggedIn ? '📅 Book' : '🔒 Login'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  ← Prev
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, page })}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                      filters.page === page
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={filters.page === pagination.pages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Map Modal */}
      {mapDoctor && (
        <MapModal doctor={mapDoctor} onClose={() => setMapDoctor(null)} />
      )}

      {/* Booking Modal */}
      {selectedDoctor && !showSuccess && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onSuccess={() => { setSelectedDoctor(null); setShowSuccess(true); }}
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          onClose={() => setShowSuccess(false)}
          onViewAppointments={() => { setShowSuccess(false); navigate('/appointments'); }}
        />
      )}
    </div>
  );
}

export default Doctors;
