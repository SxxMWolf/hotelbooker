// 홈 페이지 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    // 인증 상태 확인
    checkAuthStatus();
    
    // 공지사항 로드
    await loadNotices();
    
    // 추천 객실 로드
    await loadRooms();
    
    // 로그아웃 이벤트
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await AuthAPI.logout();
        });
    }
});

// 인증 상태 확인
function checkAuthStatus() {
    const user = Auth.getUser();
    const isAuthenticated = Auth.isAuthenticated();
    
    if (isAuthenticated && user) {
        document.getElementById('authMenu').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('mypageBtn').style.display = 'inline-block';
    } else {
        document.getElementById('authMenu').style.display = 'flex';
        document.getElementById('userMenu').style.display = 'none';
        document.getElementById('mypageBtn').style.display = 'none';
    }
}

// 공지사항 로드
async function loadNotices() {
    const container = document.getElementById('noticesContainer');
    
    try {
        // 백엔드가 Thymeleaf를 사용하므로 HTML을 파싱해야 함
        const response = await fetch('http://localhost:8081/customer/notices', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 공지사항 목록 추출
            const notices = doc.querySelectorAll('.notice-card, [class*="notice"]');
            
            if (notices.length > 0) {
                container.innerHTML = '';
                notices.forEach(notice => {
                    container.appendChild(notice.cloneNode(true));
                });
            } else {
                container.innerHTML = '<p style="color: var(--text-secondary);">등록된 공지사항이 없습니다.</p>';
            }
        } else {
            container.innerHTML = '<p style="color: var(--text-secondary);">공지사항을 불러올 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('공지사항 로드 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color);">공지사항을 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 객실 로드
async function loadRooms() {
    const container = document.getElementById('roomsContainer');
    
    try {
        const response = await fetch('http://localhost:8081/customer/rooms', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 객실 목록 추출
            const rooms = doc.querySelectorAll('.room-card, [class*="room"]');
            
            if (rooms.length > 0) {
                container.innerHTML = '';
                rooms.forEach(room => {
                    container.appendChild(room.cloneNode(true));
                });
            } else {
                // 직접 객실 카드 생성
                const roomData = await getRoomsData();
                if (roomData && roomData.length > 0) {
                    container.innerHTML = '';
                    roomData.slice(0, 3).forEach(room => {
                        container.appendChild(createRoomCard(room));
                    });
                } else {
                    container.innerHTML = '<p style="color: var(--text-secondary);">등록된 객실이 없습니다.</p>';
                }
            }
        } else {
            container.innerHTML = '<p style="color: var(--text-secondary);">객실 정보를 불러올 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('객실 로드 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color);">객실 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 객실 데이터 가져오기 (API 직접 호출)
async function getRoomsData() {
    try {
        const response = await fetch('http://localhost:8081/customer/rooms', {
            credentials: 'include'
        });
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Thymeleaf 템플릿에서 데이터 추출 시도
        const scripts = doc.querySelectorAll('script');
        for (const script of scripts) {
            if (script.textContent.includes('rooms') || script.textContent.includes('room')) {
                // JSON 데이터가 있다면 파싱
                try {
                    const match = script.textContent.match(/var\s+rooms\s*=\s*(\[.*?\]);/s);
                    if (match) {
                        return JSON.parse(match[1]);
                    }
                } catch (e) {
                    // JSON 파싱 실패
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('객실 데이터 가져오기 오류:', error);
        return null;
    }
}

// 객실 카드 생성
function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.onclick = () => {
        window.location.href = `room-detail.html?id=${room.roomId || room.id}`;
    };
    
    card.innerHTML = `
        <img src="${room.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${room.roomName}" class="room-image" onerror="this.src='https://via.placeholder.com/400x200'">
        <div class="room-content">
            <h3 class="room-title">${room.roomName || '객실'}</h3>
            <p class="room-type">${room.roomType || 'STANDARD'}</p>
            <div class="room-info">
                <span>👥 최대 ${room.maxGuests || 2}명</span>
            </div>
            <div class="room-price">${Utils.formatCurrency(room.pricePerNight || 0)} / 박</div>
            <a href="room-detail.html?id=${room.roomId || room.id}" class="btn btn-primary" style="width: 100%;">상세보기</a>
        </div>
    `;
    
    return card;
}

