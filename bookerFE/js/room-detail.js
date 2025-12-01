// 객실 상세 페이지 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    checkAuthStatus();
    
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (!roomId) {
        document.getElementById('roomDetailContainer').innerHTML = 
            '<p style="color: var(--danger-color);">객실 ID가 없습니다.</p>';
        return;
    }
    
    await loadRoomDetail(roomId);
});

function checkAuthStatus() {
    const user = Auth.getUser();
    const isAuthenticated = Auth.isAuthenticated();
    
    if (isAuthenticated && user) {
        document.getElementById('userMenu').style.display = 'flex';
    }
}

async function loadRoomDetail(roomId) {
    const container = document.getElementById('roomDetailContainer');
    
    try {
        const response = await fetch(`http://localhost:8081/customer/rooms/${roomId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 객실 상세 정보 추출
            const roomInfo = extractRoomInfo(doc);
            
            container.innerHTML = createRoomDetailHTML(roomInfo);
            
            // 예약 폼 이벤트
            const bookingForm = document.getElementById('bookingForm');
            if (bookingForm) {
                bookingForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await submitBooking(roomId);
                });
            }
        } else {
            container.innerHTML = '<p style="color: var(--danger-color);">객실 정보를 불러올 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('객실 상세 로드 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color);">객실 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

function extractRoomInfo(doc) {
    // Thymeleaf 템플릿에서 정보 추출
    const room = {
        roomId: doc.querySelector('[data-room-id]')?.getAttribute('data-room-id') || 
                window.location.search.match(/id=(\d+)/)?.[1],
        roomName: doc.querySelector('.room-name, h1, h2')?.textContent?.trim() || '객실',
        roomType: doc.querySelector('.room-type')?.textContent?.trim() || 'STANDARD',
        description: doc.querySelector('.room-description, .description')?.textContent?.trim() || '',
        pricePerNight: parseFloat(doc.querySelector('.room-price, .price')?.textContent?.replace(/[^0-9]/g, '') || '0'),
        maxGuests: parseInt(doc.querySelector('.max-guests')?.textContent?.replace(/[^0-9]/g, '') || '2'),
        imageUrl: doc.querySelector('.room-image, img')?.src || 'https://via.placeholder.com/800x400',
        amenities: doc.querySelector('.amenities')?.textContent?.trim() || ''
    };
    
    // 리뷰 정보
    const reviews = [];
    const reviewElements = doc.querySelectorAll('.review-card, .review-item, [class*="review"]');
    reviewElements.forEach(element => {
        const review = {
            rating: element.querySelector('.rating, .review-rating')?.textContent?.trim() || '5',
            comment: element.querySelector('.comment, .review-comment')?.textContent?.trim() || '',
            author: element.querySelector('.author, .review-author')?.textContent?.trim() || '익명'
        };
        if (review.comment) {
            reviews.push(review);
        }
    });
    
    return { ...room, reviews };
}

function createRoomDetailHTML(room) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    return `
        <div class="grid grid-2" style="gap: 2rem;">
            <div>
                <img src="${room.imageUrl}" alt="${room.roomName}" 
                     style="width: 100%; border-radius: 0.75rem; margin-bottom: 1.5rem;" 
                     onerror="this.src='https://via.placeholder.com/800x400'">
                
                <div class="card">
                    <h2 class="card-title">객실 정보</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">${room.description || '편안하고 안락한 객실입니다.'}</p>
                    <div class="room-info">
                        <span>🏷️ 타입: ${room.roomType}</span>
                        <span>👥 최대 ${room.maxGuests}명</span>
                    </div>
                    ${room.amenities ? `<div style="margin-top: 1rem;"><strong>편의시설:</strong> ${room.amenities}</div>` : ''}
                </div>
            </div>
            
            <div>
                <div class="card" style="position: sticky; top: 100px;">
                    <h2 class="card-title">${room.roomName}</h2>
                    <div class="room-price" style="font-size: 2rem; margin: 1rem 0;">
                        ${Utils.formatCurrency(room.pricePerNight)} / 박
                    </div>
                    
                    ${Auth.isAuthenticated() ? `
                        <form id="bookingForm" style="margin-top: 2rem;">
                            <div class="form-group">
                                <label class="form-label">체크인</label>
                                <input type="date" id="checkIn" class="form-input" 
                                       value="${today}" min="${today}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">체크아웃</label>
                                <input type="date" id="checkOut" class="form-input" 
                                       value="${tomorrow}" min="${tomorrow}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">인원 수</label>
                                <input type="number" id="numGuests" class="form-input" 
                                       min="1" max="${room.maxGuests}" value="1" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">특별 요청사항 (선택)</label>
                                <textarea id="specialRequests" class="form-textarea" 
                                          placeholder="특별 요청사항을 입력해주세요."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">예약하기</button>
                        </form>
                    ` : `
                        <p style="color: var(--text-secondary); margin: 2rem 0;">
                            예약을 하시려면 <a href="login.html">로그인</a>이 필요합니다.
                        </p>
                    `}
                </div>
            </div>
        </div>
        
        ${room.reviews && room.reviews.length > 0 ? `
            <div class="card mt-4">
                <h2 class="card-title">리뷰 (${room.reviews.length})</h2>
                ${room.reviews.map(review => `
                    <div class="review-card">
                        <div class="review-rating">${'⭐'.repeat(parseInt(review.rating))}</div>
                        <p class="review-comment">${review.comment}</p>
                        <p class="review-author">- ${review.author}</p>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="card mt-4">
                <h2 class="card-title">리뷰</h2>
                <p style="color: var(--text-secondary);">아직 리뷰가 없습니다.</p>
            </div>
        `}
    `;
}

async function submitBooking(roomId) {
    if (!Auth.isAuthenticated()) {
        Utils.showMessage('로그인이 필요합니다.', 'warning');
        window.location.href = 'login.html';
        return;
    }
    
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const numGuests = document.getElementById('numGuests').value;
    const specialRequests = document.getElementById('specialRequests').value;
    
    if (!checkIn || !checkOut) {
        Utils.showMessage('체크인/체크아웃 날짜를 선택해주세요.', 'error');
        return;
    }
    
    if (new Date(checkIn) >= new Date(checkOut)) {
        Utils.showMessage('체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.', 'error');
        return;
    }
    
    try {
        const formData = new URLSearchParams();
        formData.append('roomId', roomId);
        formData.append('checkInDate', checkIn);
        formData.append('checkOutDate', checkOut);
        formData.append('numGuests', numGuests);
        if (specialRequests) formData.append('specialRequests', specialRequests);
        
        const response = await fetch('http://localhost:8081/customer/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: formData
        });
        
        if (response.ok || response.redirected) {
            const redirectUrl = response.url || response.headers.get('Location');
            if (redirectUrl) {
                const bookingId = redirectUrl.match(/\/bookings\/(\d+)/)?.[1];
                if (bookingId) {
                    window.location.href = `booking.html?id=${bookingId}`;
                } else {
                    window.location.href = 'booking.html';
                }
            } else {
                window.location.href = 'booking.html';
            }
        } else {
            Utils.showMessage('예약 생성 중 오류가 발생했습니다.', 'error');
        }
    } catch (error) {
        console.error('예약 생성 오류:', error);
        Utils.showMessage('예약 생성 중 오류가 발생했습니다.', 'error');
    }
}

