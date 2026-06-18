import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const Sidebar = ({ open, setOpen }) => {
  const { logout } = useAdminAuth();

  const links = [
    { to: "/admin-portal/dashboard", label: "Dashboard", icon: "grid_view" },
    { to: "/admin-portal/add-bus", label: "Add Bus", icon: "add_circle" },
    { to: "/admin-portal/buses", label: "Bus List", icon: "format_list_bulleted" },
    { to: "/admin-portal/delete-bus", label: "Delete Bus", icon: "delete" },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400">directions_bus</span>
            <span className="text-lg font-bold">Smart Transit</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
