// API 통신 모듈
const API_BASE_URL = 'http://localhost:8081';

// 인증 토큰 관리
const Auth = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),
    isAuthenticated: () => !!localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
    setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
    removeUser: () => localStorage.removeItem('user')
};

// API 요청 헬퍼
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = Auth.getToken();
    
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include' // 쿠키 포함
    };
    
    try {
        const response = await fetch(url, config);
        
        // 리다이렉트 처리 (Spring Security)
        if (response.redirected) {
            window.location.href = response.url;
            return;
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return { ok: response.ok, data, status: response.status };
        } else {
            const text = await response.text();
            return { ok: response.ok, data: text, status: response.status };
        }
    } catch (error) {
        console.error('API 요청 오류:', error);
        throw error;
    }
}

// 인증 API
const AuthAPI = {
    login: async (username, password) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        if (response.ok || response.redirected) {
            // 사용자 정보 가져오기
            const userResponse = await apiRequest('/api/user/me');
            if (userResponse && userResponse.ok) {
                Auth.setUser(userResponse.data);
            }
            return { success: true };
        }
        return { success: false, message: '로그인 실패' };
    },
    
    register: async (username, password, email, name) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);
        formData.append('email', email);
        formData.append('name', name);
        
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        return { success: response.ok || response.redirected };
    },
    
    logout: async () => {
        await fetch(`${API_BASE_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        Auth.removeToken();
        Auth.removeUser();
        window.location.href = '/index.html';
    }
};

// 객실 API
const RoomAPI = {
    getAll: async () => {
        const response = await apiRequest('/customer/rooms');
        return response;
    },
    
    getById: async (id) => {
        const response = await apiRequest(`/customer/rooms/${id}`);
        return response;
    },
    
    getAvailable: async (checkIn, checkOut) => {
        const response = await apiRequest(`/customer/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
        return response;
    }
};

// 예약 API
const BookingAPI = {
    create: async (roomId, checkInDate, checkOutDate, numGuests, specialRequests) => {
        const formData = new URLSearchParams();
        formData.append('roomId', roomId);
        formData.append('checkInDate', checkInDate);
        formData.append('checkOutDate', checkOutDate);
        formData.append('numGuests', numGuests);
        if (specialRequests) formData.append('specialRequests', specialRequests);
        
        const response = await fetch(`${API_BASE_URL}/customer/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        if (response.redirected) {
            const redirectUrl = response.url;
            const bookingId = redirectUrl.match(/\/bookings\/(\d+)/)?.[1];
            return { success: true, bookingId };
        }
        return { success: false };
    },
    
    getMyBookings: async () => {
        const response = await apiRequest('/customer/bookings');
        return response;
    },
    
    getById: async (id) => {
        const response = await apiRequest(`/customer/bookings/${id}`);
        return response;
    },
    
    cancel: async (id) => {
        const response = await fetch(`${API_BASE_URL}/customer/bookings/${id}/cancel`, {
            method: 'POST',
            credentials: 'include'
        });
        return { success: response.ok || response.redirected };
    }
};

// 결제 API
const PaymentAPI = {
    getPaymentForm: async (bookingId) => {
        const response = await apiRequest(`/customer/bookings/${bookingId}/payment`);
        return response;
    },
    
    process: async (bookingId, paymentMethod, discountAmount = 0) => {
        const formData = new URLSearchParams();
        formData.append('paymentMethod', paymentMethod);
        formData.append('discountAmount', discountAmount);
        
        const response = await fetch(`${API_BASE_URL}/customer/bookings/${bookingId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        return { success: response.ok || response.redirected };
    },
    
    getHistory: async () => {
        const response = await apiRequest('/customer/mypage/payment-history');
        return response;
    }
};

// 공지사항 API
const NoticeAPI = {
    getAll: async () => {
        const response = await apiRequest('/customer/notices');
        return response;
    },
    
    getById: async (id) => {
        const response = await apiRequest(`/customer/notices/${id}`);
        return response;
    }
};

// 리뷰 API
const ReviewAPI = {
    create: async (bookingId, rating, comment) => {
        const formData = new URLSearchParams();
        formData.append('rating', rating);
        formData.append('comment', comment);
        
        const response = await fetch(`${API_BASE_URL}/customer/bookings/${bookingId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        return { success: response.ok || response.redirected };
    },
    
    getByRoom: async (roomId) => {
        // 객실 상세에서 리뷰를 함께 가져옴
        const response = await apiRequest(`/customer/rooms/${roomId}`);
        return response;
    }
};

// 사용자 API
const UserAPI = {
    getProfile: async () => {
        const response = await apiRequest('/customer/profile');
        return response;
    },
    
    updateProfile: async (name, email) => {
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('email', email);
        
        const response = await fetch(`${API_BASE_URL}/customer/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        return { success: response.ok || response.redirected };
    },
    
    changePassword: async (currentPassword, newPassword, confirmPassword) => {
        const formData = new URLSearchParams();
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);
        
        const response = await fetch(`${API_BASE_URL}/customer/mypage/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        return { success: response.ok || response.redirected };
    },
    
    deleteAccount: async () => {
        const response = await fetch(`${API_BASE_URL}/customer/mypage/delete-account`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok || response.redirected) {
            Auth.removeToken();
            Auth.removeUser();
        }
        return { success: response.ok || response.redirected };
    }
};

// 유틸리티 함수
const Utils = {
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR');
    },
    
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    },
    
    showMessage: (message, type = 'info') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    },
    
    parseHTML: (htmlString) => {
        const parser = new DOMParser();
        return parser.parseFromString(htmlString, 'text/html');
    }
};

