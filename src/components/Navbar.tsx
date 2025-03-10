"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-gray-800 shadow-lg mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center text-white text-lg font-semibold"
            >
              MahaDBT Scholarship
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 ${isActive('/')}`}
            >
              Home
            </Link>
            <Link
              href="/track"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-blue-700 ${isActive('/track')}`}
            >
              Track Application
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 