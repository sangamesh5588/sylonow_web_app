import { useState, useEffect } from 'react';

export interface MockUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async () => {
    const mockUser: MockUser = {
      uid: 'mock-user-123',
      displayName: 'Sylonow User',
      email: 'user@sylonow.com',
      photoURL: 'https://picsum.photos/seed/user/200/200',
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = async () => {
    localStorage.removeItem('mock_user');
    setUser(null);
  };

  return { user, loading, login, logout };
};
