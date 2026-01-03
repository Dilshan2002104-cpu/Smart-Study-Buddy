import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-white text-2xl font-bold">📚 Smart Study Buddy</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-white font-medium">
              Hello, {user.username || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;