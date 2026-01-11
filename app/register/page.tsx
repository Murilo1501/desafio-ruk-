
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { graphqlFetch } from '@/lib/graphql-client';

interface Telephone {
  number: string;
  area_code: string;
}

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telephones, setTelephones] = useState<Telephone[]>([
    { number: '', area_code: '' }
  ]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const addTelephone = () => {
    setTelephones([...telephones, { number: '', area_code: '' }]);
  };


  const removeTelephone = (index: number) => {
    if (telephones.length > 1) {
      setTelephones(telephones.filter((_, i) => i !== index));
    }
  };

  const updateTelephone = (index: number, field: 'number' | 'area_code', value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const updated = [...telephones];
    updated[index][field] = numericValue;
    setTelephones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    if (password.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    const validTelephones = telephones.filter(
      t => t.number.trim() !== '' && t.area_code.trim() !== ''
    );

    if (validTelephones.length === 0) {
      setError('Please add at least one phone number');
      return;
    }

    // Validar formato dos telefones
    for (const phone of validTelephones) {
      if (phone.area_code.length !== 2) {
        setError('Area code must be exactly 2 digits');
        return;
      }
      if (phone.number.length !== 11) {
        setError('Phone number must be exactly 11 digits');
        return;
      }
    }

    setLoading(true);

    const mutation = `
      mutation CreateUser($createUserInput: CreateUserInput!) {
        createUser(createUserInput: $createUserInput) {
          data {
            id
            created_at
            modified_at
          }
          error {
            status
            message
          }
        }
      }
    `;

    try {
      const response = await graphqlFetch(mutation, {
        createUserInput: {
          name,
          email,
          password,
          telephones: validTelephones
        }
      });

      // Verifica se tem erro na resposta
      if (response.createUser.error) {
        throw new Error(response.createUser.error.message);
      }

      console.log('Usuário criado:', response.createUser.data);

      // Redirecionar para login após cadastro bem-sucedido
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-200 via-purple-300 to-pink-200 items-center justify-center p-12">

      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">RUK</h1>
            <p className="text-sm text-gray-500">Encoding paths</p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600 mb-8">
            Fill in the details to get started
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers
              </label>
              <div className="space-y-3">
                {telephones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={phone.area_code}
                        onChange={(e) => updateTelephone(index, 'area_code', e.target.value)}
                        placeholder="DDD"
                        maxLength={2}
                        pattern="\d{2}"
                        className="w-20 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
                      />
                      {phone.area_code && phone.area_code.length !== 2 && (
                        <p className="absolute text-xs text-red-500 mt-1">2 digits</p>
                      )}
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phone.number}
                        onChange={(e) => updateTelephone(index, 'number', e.target.value)}
                        placeholder="Phone (11 digits)"
                        maxLength={11}
                        pattern="\d{11}"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
                      />
                      {phone.number && phone.number.length !== 11 && (
                        <p className="absolute text-xs text-red-500 mt-1">Must be 11 digits</p>
                      )}
                    </div>
                    {telephones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTelephone(index)}
                        className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTelephone}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add another phone
                </button>
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  minLength={5}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 5 characters
              </p>
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  minLength={5}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
