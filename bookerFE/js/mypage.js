// 마이페이지 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        Utils.showMessage('로그인이 필요합니다.', 'warning');
        window.location.href = 'login.html';
        return;
    }
    
    // 로그아웃
    document.getElementById('logoutLink').addEventListener('click', async (e) => {
        e.preventDefault();
        await AuthAPI.logout();
    });
    
    await loadMyPage();
});

async function loadMyPage() {
    const container = document.getElementById('mypageContainer');
    
    try {
        const response = await fetch('http://localhost:8081/customer/mypage', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 사용자 정보 및 예약 정보 추출
            const myPageData = extractMyPageData(doc);
            
            container.innerHTML = createMyPageHTML(myPageData);
            
            // 이벤트 리스너 설정
            setupEventListeners();
        } else {
            container.innerHTML = '<p style="color: var(--danger-color);">정보를 불러올 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('마이페이지 로드 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color);">정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function extractMyPageData(doc) {
    const user = {
        name: doc.querySelector('.user-name, [data-user-name]')?.textContent?.trim() || 
              Auth.getUser()?.name || '사용자',
        email: doc.querySelector('.user-email, [data-user-email]')?.textContent?.trim() || 
               Auth.getUser()?.email || ''
    };
    
    // 예약 정보 추출
    const bookings = [];
    const bookingElements = doc.querySelectorAll('.booking-card, .booking-item, [data-booking-id]');
    
    bookingElements.forEach(element => {
        const booking = {
            bookingId: element.getAttribute('data-booking-id') || 
                      element.querySelector('a')?.href?.match(/bookings\/(\d+)/)?.[1],
            roomName: element.querySelector('.room-name')?.textContent?.trim() || '객실',
            checkInDate: element.querySelector('.check-in')?.textContent?.trim() || '',
            checkOutDate: element.querySelector('.check-out')?.textContent?.trim() || '',
            status: element.querySelector('.status, .booking-status')?.textContent?.trim() || 'PENDING',
            totalPrice: parseFloat(element.querySelector('.price, .total-price')?.textContent?.replace(/[^0-9]/g, '') || '0')
        };
        
        if (booking.bookingId) {
            bookings.push(booking);
        }
    });
    
    return { user, bookings };
}

function createMyPageHTML(data) {
    return `
        <div class="grid grid-2" style="gap: 2rem;">
            <!-- 프로필 관리 -->
            <div>
                <div class="card">
                    <h2 class="card-title">프로필 관리</h2>
                    <form id="profileForm" style="margin-top: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">이름</label>
                            <input type="text" id="userName" class="form-input" 
                                   value="${data.user.name}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">이메일</label>
                            <input type="email" id="userEmail" class="form-input" 
                                   value="${data.user.email}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">프로필 업데이트</button>
                    </form>
                </div>
                
                <div class="card mt-3">
                    <h2 class="card-title">비밀번호 변경</h2>
                    <form id="passwordForm" style="margin-top: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">현재 비밀번호</label>
                            <input type="password" id="currentPassword" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">새 비밀번호</label>
                            <input type="password" id="newPassword" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">비밀번호 확인</label>
                            <input type="password" id="confirmPassword" class="form-input" required>
                        </div>
                        <button type="submit" class="btn btn-primary">비밀번호 변경</button>
                    </form>
                </div>
                
                <div class="card mt-3">
                    <h2 class="card-title">계정 관리</h2>
                    <button id="deleteAccountBtn" class="btn btn-danger" style="width: 100%; margin-top: 1rem;">
                        회원 탈퇴
                    </button>
                </div>
            </div>
            
            <!-- 예약 관리 -->
            <div>
                <div class="card">
                    <h2 class="card-title">내 예약</h2>
                    <div id="bookingsList" style="margin-top: 1rem;">
                        ${data.bookings.length > 0 ? 
                            data.bookings.map(booking => createBookingCard(booking)).join('') :
                            '<p style="color: var(--text-secondary);">예약 내역이 없습니다.</p>'
                        }
                    </div>
                </div>
                
                <div class="card mt-3">
                    <h2 class="card-title">결제 내역</h2>
                    <a href="payment-history.html" class="btn btn-outline" style="width: 100%; margin-top: 1rem;">
                        결제 내역 보기
                    </a>
                </div>
            </div>
        </div>
    `;
}

function createBookingCard(booking) {
    const statusClass = `status-${booking.status.toLowerCase()}`;
    const statusText = {
        'PENDING': '대기중',
        'CONFIRMED': '확정',
        'CHECKED_IN': '체크인',
        'CHECKED_OUT': '체크아웃',
        'CANCELLED': '취소됨'
    }[booking.status] || booking.status;
    
    return `
        <div class="booking-card" data-booking-id="${booking.bookingId}">
            <div class="flex-between">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">${booking.roomName}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.875rem;">
                        ${Utils.formatDate(booking.checkInDate)} ~ ${Utils.formatDate(booking.checkOutDate)}
                    </p>
                    <p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.5rem;">
                        ${Utils.formatCurrency(booking.totalPrice)}
                    </p>
                </div>
                <div>
                    <span class="booking-status ${statusClass}">${statusText}</span>
                </div>
            </div>
            ${booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? `
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-danger btn-sm" onclick="cancelBooking(${booking.bookingId})">
                        취소
                    </button>
                    ${booking.status === 'CONFIRMED' ? `
                        <button class="btn btn-primary btn-sm" onclick="writeReview(${booking.bookingId})">
                            리뷰 작성
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

function setupEventListeners() {
    // 프로필 업데이트
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await updateProfile();
        });
    }
    
    // 비밀번호 변경
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await changePassword();
        });
    }
    
    // 회원 탈퇴
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (confirm('정말 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                await deleteAccount();
            }
        });
    }
}

async function updateProfile() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    
    try {
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('email', email);
        
        const response = await fetch('http://localhost:8081/customer/profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        if (response.ok || response.redirected) {
            Utils.showMessage('프로필이 업데이트되었습니다.', 'success');
            // 사용자 정보 업데이트
            const user = Auth.getUser();
            if (user) {
                user.name = name;
                user.email = email;
                Auth.setUser(user);
            }
        } else {
            Utils.showMessage('프로필 업데이트 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('프로필 업데이트 오류:', error);
        Utils.showMessage('프로필 업데이트 중 오류가 발생했습니다.', 'error');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        Utils.showMessage('새 비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    try {
        const formData = new URLSearchParams();
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
        formData.append('confirmPassword', confirmPassword);
        
        const response = await fetch('http://localhost:8081/customer/mypage/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        if (response.ok || response.redirected) {
            Utils.showMessage('비밀번호가 변경되었습니다.', 'success');
            document.getElementById('passwordForm').reset();
        } else {
            Utils.showMessage('비밀번호 변경 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        Utils.showMessage('비밀번호 변경 중 오류가 발생했습니다.', 'error');
    }
}

async function deleteAccount() {
    try {
        const response = await fetch('http://localhost:8081/customer/mypage/delete-account', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok || response.redirected) {
            Utils.showMessage('회원 탈퇴가 완료되었습니다.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            Utils.showMessage('회원 탈퇴 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        Utils.showMessage('회원 탈퇴 중 오류가 발생했습니다.', 'error');
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('정말 예약을 취소하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:8081/customer/bookings/${bookingId}/cancel`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok || response.redirected) {
            Utils.showMessage('예약이 취소되었습니다.', 'success');
            setTimeout(() => {
                loadMyPage();
            }, 1000);
        } else {
            Utils.showMessage('예약 취소 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('예약 취소 오류:', error);
        Utils.showMessage('예약 취소 중 오류가 발생했습니다.', 'error');
    }
}

async function writeReview(bookingId) {
    window.location.href = `review.html?bookingId=${bookingId}`;
}

