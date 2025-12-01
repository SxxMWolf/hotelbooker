// 예약 및 결제 페이지 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    if (!Auth.isAuthenticated()) {
        Utils.showMessage('로그인이 필요합니다.', 'warning');
        window.location.href = 'login.html';
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookingId = urlParams.get('id');
    
    if (!bookingId) {
        document.getElementById('bookingContainer').innerHTML = 
            '<p style="color: var(--danger-color);">예약 ID가 없습니다.</p>';
        return;
    }
    
    await loadBookingDetail(bookingId);
});

async function loadBookingDetail(bookingId) {
    const container = document.getElementById('bookingContainer');
    
    try {
        // 결제 폼 페이지 로드
        const response = await fetch(`http://localhost:8081/customer/bookings/${bookingId}/payment`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 예약 정보 추출
            const bookingInfo = extractBookingInfo(doc, bookingId);
            
            container.innerHTML = createBookingHTML(bookingInfo);
            
            // 결제 폼 이벤트
            const paymentForm = document.getElementById('paymentForm');
            if (paymentForm) {
                paymentForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await processPayment(bookingId);
                });
            }
        } else {
            container.innerHTML = '<p style="color: var(--danger-color);">예약 정보를 불러올 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('예약 정보 로드 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color);">예약 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function extractBookingInfo(doc, bookingId) {
    const booking = {
        bookingId: bookingId,
        roomName: doc.querySelector('.room-name, h2, h3')?.textContent?.trim() || '객실',
        checkInDate: doc.querySelector('[name="checkInDate"], .check-in')?.value || 
                    doc.querySelector('.check-in')?.textContent?.trim() || '',
        checkOutDate: doc.querySelector('[name="checkOutDate"], .check-out')?.value || 
                     doc.querySelector('.check-out')?.textContent?.trim() || '',
        numGuests: doc.querySelector('[name="numGuests"], .num-guests')?.value || 
                  doc.querySelector('.num-guests')?.textContent?.trim() || '1',
        totalPrice: parseFloat(doc.querySelector('.total-price, .price')?.textContent?.replace(/[^0-9]/g, '') || '0'),
        specialRequests: doc.querySelector('.special-requests')?.textContent?.trim() || ''
    };
    
    // 날짜 계산
    if (booking.checkInDate && booking.checkOutDate) {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        booking.nights = nights;
    }
    
    return booking;
}

function createBookingHTML(booking) {
    return `
        <div class="grid grid-2" style="gap: 2rem;">
            <div>
                <div class="card">
                    <h2 class="card-title">예약 정보</h2>
                    <div style="margin-top: 1rem;">
                        <p><strong>객실:</strong> ${booking.roomName}</p>
                        <p><strong>체크인:</strong> ${Utils.formatDate(booking.checkInDate)}</p>
                        <p><strong>체크아웃:</strong> ${Utils.formatDate(booking.checkOutDate)}</p>
                        <p><strong>숙박일수:</strong> ${booking.nights || 1}박</p>
                        <p><strong>인원:</strong> ${booking.numGuests}명</p>
                        ${booking.specialRequests ? `<p><strong>특별 요청:</strong> ${booking.specialRequests}</p>` : ''}
                    </div>
                </div>
                
                <div class="card mt-3">
                    <h2 class="card-title">요금 상세</h2>
                    <div style="margin-top: 1rem;">
                        <div class="flex-between" style="margin-bottom: 0.5rem;">
                            <span>객실 요금 (${booking.nights || 1}박)</span>
                            <span>${Utils.formatCurrency(booking.totalPrice)}</span>
                        </div>
                        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">
                        <div class="flex-between" style="font-size: 1.25rem; font-weight: bold;">
                            <span>총 결제 금액</span>
                            <span style="color: var(--primary-color);">${Utils.formatCurrency(booking.totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <div class="card">
                    <h2 class="card-title">결제 정보</h2>
                    <form id="paymentForm" style="margin-top: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">결제 방법</label>
                            <select id="paymentMethod" class="form-select" required>
                                <option value="CARD">신용카드</option>
                                <option value="SIMPLE_PAY">간편결제</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">할인 금액 (선택)</label>
                            <input type="number" id="discountAmount" class="form-input" 
                                   min="0" max="${booking.totalPrice}" value="0" step="1000">
                        </div>
                        
                        <div class="card" style="background: var(--bg-color); margin: 1.5rem 0;">
                            <div class="flex-between" style="font-size: 1.125rem; font-weight: 600;">
                                <span>최종 결제 금액</span>
                                <span id="finalAmount" style="color: var(--primary-color);">
                                    ${Utils.formatCurrency(booking.totalPrice)}
                                </span>
                            </div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; font-size: 1.125rem; padding: 1rem;">
                            결제하기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// 할인 금액 변경 시 최종 금액 업데이트
document.addEventListener('input', (e) => {
    if (e.target.id === 'discountAmount') {
        const totalPrice = parseFloat(document.querySelector('.total-price')?.textContent?.replace(/[^0-9]/g, '') || '0');
        const discount = parseFloat(e.target.value) || 0;
        const finalAmount = Math.max(0, totalPrice - discount);
        
        const finalAmountElement = document.getElementById('finalAmount');
        if (finalAmountElement) {
            finalAmountElement.textContent = Utils.formatCurrency(finalAmount);
        }
    }
});

async function processPayment(bookingId) {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;
    
    try {
        const formData = new URLSearchParams();
        formData.append('paymentMethod', paymentMethod);
        formData.append('discountAmount', discountAmount);
        
        const response = await fetch(`http://localhost:8081/customer/bookings/${bookingId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        if (response.ok || response.redirected) {
            Utils.showMessage('결제가 완료되었습니다!', 'success');
            setTimeout(() => {
                window.location.href = 'mypage.html';
            }, 1500);
        } else {
            Utils.showMessage('결제 처리 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('결제 처리 오류:', error);
        Utils.showMessage('결제 처리 중 오류가 발생했습니다.', 'error');
    }
}

