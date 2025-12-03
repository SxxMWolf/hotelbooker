import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const [step, setStep] = useState(1); // 1: 이메일 인증, 2: 회원가입 정보 입력
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    email: '',
    nickname: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !email.trim()) {
        setError('이메일을 입력해주세요.');
        setLoading(false);
        return;
      }

      const response = await authAPI.sendVerificationCode(email.trim());
      if (response.data.success) {
        setCodeSent(true);
        alert('인증 코드가 발송되었습니다.');
      } else {
        setError(response.data.message || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증 코드 발송 에러:', error);
      console.error('에러 응답:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.email ? error.response.data.email : 
                          '인증 코드 발송에 실패했습니다. 이메일 주소를 확인해주세요.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyCode(email, verificationCode);
      if (response.data.success) {
        setEmailVerified(true);
        setFormData({ ...formData, email });
        setStep(2);
        alert('이메일 인증이 완료되었습니다.');
      } else {
        setError(response.data.message || '인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.code ? error.response.data.code : 
                          (error.response?.data?.email ? error.response.data.email : 
                          '인증 코드 확인에 실패했습니다.'));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-pale-sky via-white to-hotel-pale-sky py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-hotel-pale-sky">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold text-hotel-dark mb-2">
                이메일 인증
              </h2>
              <p className="text-hotel-cyan">
                회원가입을 위해 이메일 인증이 필요합니다
              </p>
            </div>

            {!codeSent ? (
              <form className="space-y-6" onSubmit={handleSendCode}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-hotel-dark mb-2">
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-hotel-pale placeholder-hotel-teal text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
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
                    {loading ? '발송 중...' : '인증 코드 발송'}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleVerifyCode}>
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-hotel-dark mb-2">
                    이메일
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    disabled
                    className="appearance-none relative block w-full px-4 py-3 border border-hotel-pale bg-hotel-pale text-hotel-teal rounded-lg sm:text-sm"
                    value={email}
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-hotel-dark mb-2">
                    인증 코드
                  </label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    className="appearance-none relative block w-full px-4 py-3 border border-hotel-pale placeholder-hotel-teal text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all text-center text-2xl tracking-widest"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-hotel-navy hover:bg-hotel-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-sky disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    {loading ? '확인 중...' : '인증 코드 확인'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setVerificationCode('');
                    setError('');
                  }}
                  className="w-full text-center text-sm text-hotel-blue hover:text-hotel-teal font-medium transition-colors"
                >
                  인증 코드 다시 받기
                </button>
              </form>
            )}

            <div className="text-center mt-6 pt-6 border-t border-hotel-pale">
              <Link to="/login" className="text-hotel-blue hover:text-hotel-teal font-medium transition-colors">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-hotel-pale via-white to-hotel-pale py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-hotel-pale">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-hotel-dark mb-2">
              회원가입
            </h2>
            <p className="text-hotel-teal">계정을 생성하고 시작하세요</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-hotel-dark mb-2">
                  아이디 (3-15자)
                </label>
                <input
                  id="id"
                  name="id"
                  type="text"
                  required
                  minLength={3}
                  maxLength={15}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-hotel-pale placeholder-hotel-teal text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
                  value={formData.id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-hotel-dark mb-2">
                  비밀번호 (8자 이상)
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-hotel-pale placeholder-hotel-teal text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-hotel-dark mb-2">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-hotel-pale bg-hotel-pale text-hotel-teal rounded-lg sm:text-sm"
                  value={formData.email}
                />
                <p className="mt-1 text-xs text-hotel-teal font-semibold">✓ 이메일 인증 완료</p>
              </div>
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-hotel-dark mb-2">
                  닉네임
                </label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-4 py-3 border border-hotel-pale placeholder-hotel-teal text-hotel-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-hotel-sky focus:border-hotel-sky sm:text-sm transition-all"
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-hotel-navy hover:bg-hotel-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-hotel-sky disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {loading ? '가입 중...' : '회원가입'}
              </button>
            </div>

            <div className="text-center pt-4 border-t border-hotel-pale">
              <Link to="/login" className="text-hotel-blue hover:text-hotel-teal font-medium transition-colors">
                이미 계정이 있으신가요? 로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
