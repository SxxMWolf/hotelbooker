import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hotel-pale-sky via-white to-hotel-pale-sky">
      <nav className="bg-hotel-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-white hover:text-hotel-sky transition-colors">
                🏨 호텔 예약 시스템
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/mypage"
                    className="px-4 py-2 text-hotel-pale-sky hover:text-white hover:bg-hotel-navy rounded-md transition-colors"
                  >
                    마이페이지
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-hotel-pale-sky hover:text-white hover:bg-hotel-navy rounded-md transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-hotel-sky text-white rounded-md hover:bg-hotel-light-cyan transition-colors font-semibold"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;

