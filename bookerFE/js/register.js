// 회원가입 페이지 스크립트
document.addEventListener('DOMContentLoaded', () => {
    // 이미 로그인되어 있으면 리다이렉트
    if (Auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }
    
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
});

async function handleRegister() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    
    // 유효성 검사
    if (!username || !password || !email || !name) {
        Utils.showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        Utils.showMessage('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    if (password.length < 4) {
        Utils.showMessage('비밀번호는 최소 4자 이상이어야 합니다.', 'error');
        return;
    }
    
    try {
        const result = await AuthAPI.register(username, password, email, name);
        
        if (result.success) {
            Utils.showMessage('회원가입이 완료되었습니다!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            Utils.showMessage('회원가입에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('회원가입 오류:', error);
        Utils.showMessage('회원가입 중 오류가 발생했습니다.', 'error');
    }
}

