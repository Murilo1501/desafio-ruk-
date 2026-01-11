
'use client';

import { useState, useEffect } from 'react';
import { Search, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { graphqlFetch } from '@/lib/graphql-client';

interface Telephone {
  number: string;
  areaCode: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  telephones?: Telephone[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const fetchUsers = async () => {
      const query = `
        query {
          users {
            id
            name
            email
            createdAt
            telephones {
              number
              areaCode
            }
          }
        }
      `;

      try {
        const response = await graphqlFetch(query,undefined, token|| undefined);
        setUsers(response.users);
      } catch (err: any) {
        setError('Failed to load users');
        console.error(err);
      }
    };

    fetchUsers();
  }, []);


  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('accessToken');


      const query = `
        query {
          me {
            id
            email
            name
            createdAt
          }
        }
      `;

      try {
        const response = await graphqlFetch(query,undefined,token || undefined);
        setCurrentUser(response.me);
      } catch (err: any) {
        console.error('Failed to load current user:', err);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('rememberMe');
    router.push('/');
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telephones && user.telephones.some(t => 
        t.number.includes(searchTerm) || 
        t.areaCode.includes(searchTerm)
      ))
  );

  const formatPhone = (telephones?: Telephone[]) => {
    if (!telephones || telephones.length === 0) return '-';
    const phone = telephones[0];
    return `(${phone.areaCode}) ${phone.number}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">RUK</h1>
              <p className="text-xs text-gray-500">Encoding paths</p>
            </div>


            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-6 py-8">

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                User Management
              </h2>
              <p className="text-gray-600">
                Total: {users.length} users registered
              </p>
            </div>
          </div>


          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>


        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-gray-500">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatPhone(user.telephones)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
