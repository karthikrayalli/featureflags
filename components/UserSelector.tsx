import { useFeatureFlags } from '@/lib/providers/FeatureFlagsProvider';
import { ChevronDown } from 'lucide-react';
import type { User } from '@/types';

const DEMO_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'user' },
  { id: 'admin-1', name: 'Jane Admin', email: 'jane@example.com', role: 'admin' },
  { id: 'tester-1', name: 'Bob Tester', email: 'bob@example.com', role: 'tester' },
];

export function UserSelector() {
  const { currentUser, setUser } = useFeatureFlags();

  const handleUserChange = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setUser(user);
    }
  };

  return (
    <div className="relative">
      <label className="block text-xs text-gray-600 mb-1">User Role</label>
      <div className="relative">
        <select
          value={currentUser.id}
          onChange={(e) => handleUserChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[200px]"
        >
          {DEMO_USERS.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}
