import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      // 보안을 위해 항상 성공 메시지 표시
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-pale-sky via-white to-hotel-pale-sky py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-hotel-pale-sky">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-hotel-dark mb-4">
                비밀번호 찾기
              </h2>
              <div className="bg-hotel-pale-sky border border-hotel-teal text-hotel-teal px-4 py-3 rounded-lg mb-4">
                해당 이메일로 임시 비밀번호가 발송되었습니다.
                <br />
                로그인 후 마이페이지에서 새 비밀번호로 변경해주세요.
              </div>
              <Link
                to="/login"
                className="text-hotel-blue hover:text-hotel-teal font-medium transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-pale-sky via-white to-hotel-pale-sky py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-hotel-pale-sky">
          <div>
            <h2 className="mt-6 text-center text-4xl font-extrabold text-hotel-dark">
              비밀번호 찾기
            </h2>
            <p className="mt-2 text-center text-sm text-hotel-cyan">
              가입 시 사용한 이메일을 입력해주세요
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-hotel-dark mb-2">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-hotel-pale-sky placeholder-hotel-cyan text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-hotel-navy hover:bg-hotel-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-sky disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? '전송 중...' : '임시 비밀번호 전송'}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-hotel-pale-sky">
              <Link to="/login" className="text-hotel-blue hover:text-hotel-teal font-medium transition-colors">
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

