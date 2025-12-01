// 로그인 페이지 스크립트
document.addEventListener('DOMContentLoaded', () => {
    // 이미 로그인되어 있으면 리다이렉트
    if (Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
});

async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        Utils.showMessage('사용자명과 비밀번호를 입력해주세요.', 'error');
        return;
    }
    
    try {
        const result = await AuthAPI.login(username, password);
        
        if (result.success) {
            Utils.showMessage('로그인 성공!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            Utils.showMessage(result.message || '로그인에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('로그인 오류:', error);
        Utils.showMessage('로그인 중 오류가 발생했습니다.', 'error');
    }
}

