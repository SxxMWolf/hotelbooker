import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingAPI, paymentAPI, reviewAPI } from '../services/api';

const MyPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  });
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes, paymentsRes, reviewsRes] = await Promise.all([
        userAPI.getProfile(),
        bookingAPI.getAll(),
        paymentAPI.getAll(),
        reviewAPI.getMyReviews(),
      ]);
      setProfile(profileRes.data);
      setBookings(bookingsRes.data);
      setPayments(paymentsRes.data);
      setReviews(reviewsRes.data);
      setFormData({
        email: profileRes.data.email,
        name: profileRes.data.name,
        phone: profileRes.data.phone,
        password: '',
      });
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const updateData = {
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        ...(formData.password && { password: formData.password }),
      };
      await userAPI.updateProfile(updateData);
      setEditMode(false);
      fetchData();
      alert('프로필이 업데이트되었습니다.');
    } catch (error) {
      alert(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('정말 예약을 취소하시겠습니까?')) return;
    try {
      await bookingAPI.cancel(bookingId);
      fetchData();
      alert('예약이 취소되었습니다.');
    } catch (error) {
      alert(error.response?.data?.message || '예약 취소에 실패했습니다.');
    }
  };

  const handleOpenReviewForm = (booking) => {
    setSelectedBooking(booking);
    setShowReviewForm(true);
    setReviewForm({ rating: 5, comment: '' });
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking) return;
    try {
      await reviewAPI.create({
        bookingId: selectedBooking.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setShowReviewForm(false);
      setSelectedBooking(null);
      fetchData();
      alert('리뷰가 작성되었습니다.');
    } catch (error) {
      alert(error.response?.data?.message || '리뷰 작성에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      logout();
      navigate('/');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말 회원 탈퇴를 하시겠습니까?\n모든 예약 정보와 리뷰가 삭제되며 복구할 수 없습니다.')) {
      return;
    }
    
    if (!confirm('회원 탈퇴를 최종 확인합니다. 정말 진행하시겠습니까?')) {
      return;
    }

    try {
      await userAPI.deleteAccount();
      alert('회원 탈퇴가 완료되었습니다.');
      logout();
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-hotel-cyan">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-hotel-dark mb-8">마이페이지</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          프로필 관리
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'bookings'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          예약 관리
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'payments'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          결제 내역
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'reviews'
              ? 'bg-hotel-navy text-white shadow-lg'
              : 'bg-hotel-pale-sky text-hotel-navy hover:bg-hotel-light-cyan'
          }`}
        >
          리뷰 작성
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-hotel-dark">프로필 관리</h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                수정
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-hotel-teal text-white rounded-lg hover:bg-hotel-cyan font-semibold shadow-lg transition-all"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    fetchData();
                  }}
                  className="px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
                >
                  취소
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">사용자명</label>
              <input
                type="text"
                value={profile?.username}
                disabled
                className="w-full px-3 py-2 border border-hotel-pale rounded-md bg-hotel-pale text-hotel-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">이메일</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">이름</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-hotel-dark mb-2">전화번호</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editMode}
                className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
              />
            </div>
            {editMode && (
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  비밀번호 (변경 시에만 입력)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-hotel-pale rounded-md focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
                />
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-hotel-pale">
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                로그아웃
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-lg transition-all"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">예약 관리</h2>
          {bookings.length === 0 ? (
            <p className="text-hotel-cyan text-center py-8">예약 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-hotel-dark mb-2">{booking.roomName}</h3>
                      <p className="text-hotel-cyan mb-1">
                        {new Date(booking.checkInDate).toLocaleDateString('ko-KR')} ~{' '}
                        {new Date(booking.checkOutDate).toLocaleDateString('ko-KR')}
                      </p>
                      <p className="text-hotel-cyan mb-2">인원: {booking.guests}명</p>
                      <p className="text-xl font-semibold text-hotel-teal mb-2">
                        ₩{booking.totalPrice.toLocaleString()}
                      </p>
                      <p
                        className={`inline-block px-3 py-1 rounded-lg text-sm mt-2 font-medium ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-hotel-pale-sky text-hotel-teal border border-hotel-teal'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}
                      >
                        {booking.status === 'CONFIRMED'
                          ? '확정'
                          : booking.status === 'CANCELLED'
                          ? '취소됨'
                          : '대기중'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleOpenReviewForm(booking)}
                          className="px-4 py-2 bg-hotel-teal text-white rounded-lg hover:bg-hotel-cyan font-semibold shadow-lg transition-all"
                        >
                          리뷰 작성
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-lg transition-all"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">결제 내역</h2>
          {payments.length === 0 ? (
            <p className="text-hotel-cyan text-center py-8">결제 내역이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xl font-semibold text-hotel-teal mb-2">
                        ₩{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-hotel-cyan mb-1">
                        결제 방법: {payment.method === 'CARD' ? '카드' : payment.method === 'BANK_TRANSFER' ? '계좌이체' : '현금'}
                      </p>
                      <p className="text-hotel-cyan mb-1">
                        결제일: {new Date(payment.paymentDate).toLocaleString('ko-KR')}
                      </p>
                      <p className="text-hotel-cyan">거래번호: {payment.transactionId}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        payment.status === 'COMPLETED'
                          ? 'bg-hotel-pale-sky text-hotel-teal border border-hotel-teal'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      }`}
                    >
                      {payment.status === 'COMPLETED' ? '완료' : '대기중'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-hotel-pale">
          <h2 className="text-3xl font-semibold mb-6 text-hotel-dark">내 리뷰</h2>
          {reviews.length === 0 ? (
            <p className="text-hotel-cyan text-center py-8">작성한 리뷰가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-hotel-pale rounded-xl p-6 hover:bg-hotel-pale-sky transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-hotel-teal text-lg">⭐ {review.rating}</p>
                    <p className="text-sm text-hotel-cyan">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  {review.comment && <p className="text-hotel-dark mt-2">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 리뷰 작성 모달 */}
      {showReviewForm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 border border-hotel-pale shadow-2xl">
            <h3 className="text-2xl font-semibold mb-6 text-hotel-dark">리뷰 작성</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  평점
                </label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
                >
                  <option value={1}>1점</option>
                  <option value={2}>2점</option>
                  <option value={3}>3점</option>
                  <option value={4}>4점</option>
                  <option value={5}>5점</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-hotel-dark mb-2">
                  리뷰 내용
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-hotel-pale rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky text-hotel-dark transition-all"
                  placeholder="리뷰를 작성해주세요..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-hotel-navy text-white rounded-lg hover:bg-hotel-teal font-semibold shadow-lg transition-all"
              >
                작성
              </button>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 bg-hotel-pale-sky text-hotel-navy rounded-lg hover:bg-hotel-light-cyan font-semibold transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;

