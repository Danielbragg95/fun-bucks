import { useState, useEffect } from 'react';
import { choresAPI } from '../services/api';

function ChoresPage() {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async () => {
    try {
      const data = await choresAPI.getAll();
      setChores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
        All Chores
      </h1>

      <div className="space-y-4 max-w-2xl mx-auto">
        {chores.map(chore => (
          <div
            key={chore.id}
            className="bg-white rounded-xl shadow-lg p-6 border-4"
            style={{ borderColor: chore.assigned_color }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">{chore.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl">{chore.assigned_avatar}</span>
                  <span className="text-gray-600">{chore.assigned_name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 capitalize">{chore.frequency}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: chore.assigned_color }}>
                  +{chore.fun_bucks_reward} 💰
                </div>
                {chore.completed ? (
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ Complete
                  </span>
                ) : (
                  <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChoresPage;
