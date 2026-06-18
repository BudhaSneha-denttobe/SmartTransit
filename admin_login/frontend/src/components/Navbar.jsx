import { useAuth } from "../context/AuthContext";
import { HiOutlineBars3, HiOutlineArrowRightOnRectangle } from "react-icons/hi2";

const Navbar = ({ setSidebarOpen }) => {
  const { admin, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-gray-600 hover:text-gray-900"
        >
          <HiOutlineBars3 className="text-2xl" />
        </button>
        <div className="hidden md:block" />
        <div className="flex items-center gap-4">
          {admin && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {admin.fullName}
                </p>
                <p className="text-xs text-gray-500">{admin.department}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {admin.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <HiOutlineArrowRightOnRectangle className="text-lg" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
