// 객실 선택 페이지 스크립트
document.addEventListener('DOMContentLoaded', async () => {
    checkAuthStatus();
    
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    document.getElementById('checkIn').value = today;
    document.getElementById('checkOut').value = tomorrow;
    
    // 객실 로드
    await loadRooms();
    
    // 필터 폼 이벤트
    document.getElementById('filterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await filterRooms();
    });
    
    // 초기화 버튼
    document.getElementById('resetFilter').addEventListener('click', async () => {
        document.getElementById('checkIn').value = '';
        document.getElementById('checkOut').value = '';
        await loadRooms();
    });
    
    // 로그아웃
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await AuthAPI.logout();
        });
    }
});

function checkAuthStatus() {
    const user = Auth.getUser();
    const isAuthenticated = Auth.isAuthenticated();
    
    if (isAuthenticated && user) {
        document.getElementById('authMenu').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
    } else {
        document.getElementById('authMenu').style.display = 'flex';
        document.getElementById('userMenu').style.display = 'none';
    }
}

// 객실 로드
async function loadRooms() {
    const container = document.getElementById('roomsContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>객실 정보를 불러오는 중...</p></div>';
    
    try {
        const response = await fetch('http://localhost:8081/customer/rooms', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // 객실 목록 추출
            const roomElements = doc.querySelectorAll('tr, .room-item, [data-room-id]');
            
            if (roomElements.length > 0) {
                container.innerHTML = '';
                // 테이블 형식인 경우 처리
                roomElements.forEach(element => {
                    const roomCard = extractRoomFromElement(element);
                    if (roomCard) {
                        container.appendChild(roomCard);
                    }
                });
            } else {
                // 직접 객실 카드 생성 시도
                const rooms = await parseRoomsFromHTML(html);
                if (rooms.length > 0) {
                    container.innerHTML = '';
                    rooms.forEach(room => {
                        container.appendChild(createRoomCard(room));
                    });
                } else {
                    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">등록된 객실이 없습니다.</p>';
                }
            }
        } else {
            container.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 2rem;">객실 정보를 불러올 수 없습니다.</p>';
        }
    } catch (error) {
        console.error('객실 로드 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 2rem;">객실 정보를 불러오는 중 오류가 발생했습니다.</p>';
    }
}

// 날짜 필터로 객실 검색
async function filterRooms() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    
    if (!checkIn || !checkOut) {
        Utils.showMessage('체크인/체크아웃 날짜를 모두 선택해주세요.', 'warning');
        return;
    }
    
    if (new Date(checkIn) >= new Date(checkOut)) {
        Utils.showMessage('체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.', 'error');
        return;
    }
    
    const container = document.getElementById('roomsContainer');
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>검색 중...</p></div>';
    
    try {
        const response = await fetch(`http://localhost:8081/customer/rooms?checkIn=${checkIn}&checkOut=${checkOut}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const roomElements = doc.querySelectorAll('tr, .room-item, [data-room-id]');
            
            if (roomElements.length > 0) {
                container.innerHTML = '';
                roomElements.forEach(element => {
                    const roomCard = extractRoomFromElement(element);
                    if (roomCard) {
                        container.appendChild(roomCard);
                    }
                });
            } else {
                const rooms = await parseRoomsFromHTML(html);
                if (rooms.length > 0) {
                    container.innerHTML = '';
                    rooms.forEach(room => {
                        container.appendChild(createRoomCard(room));
                    });
                } else {
                    container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">해당 날짜에 예약 가능한 객실이 없습니다.</p>';
                }
            }
        } else {
            container.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 2rem;">검색 중 오류가 발생했습니다.</p>';
        }
    } catch (error) {
        console.error('객실 검색 오류:', error);
        container.innerHTML = '<p style="color: var(--danger-color); text-align: center; padding: 2rem;">검색 중 오류가 발생했습니다.</p>';
    }
}

// HTML에서 객실 데이터 파싱
async function parseRoomsFromHTML(html) {
    // Thymeleaf 템플릿에서 데이터 추출 시도
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 숨겨진 데이터나 스크립트에서 정보 추출
    const scripts = doc.querySelectorAll('script');
    const rooms = [];
    
    // 테이블에서 데이터 추출 시도
    const rows = doc.querySelectorAll('table tbody tr, .room-list-item');
    rows.forEach(row => {
        const room = {
            roomId: row.getAttribute('data-room-id') || row.querySelector('[data-room-id]')?.getAttribute('data-room-id'),
            roomName: row.querySelector('td:nth-child(2), .room-name')?.textContent?.trim(),
            roomType: row.querySelector('td:nth-child(3), .room-type')?.textContent?.trim(),
            pricePerNight: parseFloat(row.querySelector('td:nth-child(4), .room-price')?.textContent?.replace(/[^0-9]/g, '') || '0'),
            maxGuests: parseInt(row.querySelector('td:nth-child(5), .room-guests')?.textContent?.replace(/[^0-9]/g, '') || '2'),
            imageUrl: row.querySelector('img')?.src || 'https://via.placeholder.com/400x200'
        };
        
        if (room.roomId || room.roomName) {
            rooms.push(room);
        }
    });
    
    return rooms;
}

// HTML 요소에서 객실 정보 추출
function extractRoomFromElement(element) {
    // 테이블 행인 경우
    if (element.tagName === 'TR') {
        const tds = element.querySelectorAll('td');
        if (tds.length >= 3) {
            const roomId = element.getAttribute('data-room-id') || 
                          element.querySelector('a')?.href?.match(/rooms\/(\d+)/)?.[1];
            const roomName = tds[1]?.textContent?.trim() || '객실';
            const roomType = tds[2]?.textContent?.trim() || 'STANDARD';
            const priceText = tds[3]?.textContent?.trim() || '0';
            const price = parseFloat(priceText.replace(/[^0-9]/g, '')) || 0;
            
            if (roomId) {
                return createRoomCard({
                    roomId,
                    roomName,
                    roomType,
                    pricePerNight: price,
                    maxGuests: 2,
                    imageUrl: 'https://via.placeholder.com/400x200'
                });
            }
        }
    }
    
    return null;
}

// 객실 카드 생성
function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    
    card.innerHTML = `
        <img src="${room.imageUrl || 'https://via.placeholder.com/400x200'}" 
             alt="${room.roomName}" 
             class="room-image" 
             onerror="this.src='https://via.placeholder.com/400x200'">
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

