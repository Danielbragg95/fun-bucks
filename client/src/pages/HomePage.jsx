import { useState, useEffect } from 'react';
import { peopleAPI, choresAPI } from '../services/api';

function HomePage() {
  const [people, setPeople] = useState([]);
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [peopleData, choresData] = await Promise.all([
        peopleAPI.getAll(),
        choresAPI.getAll(),
      ]);
      setPeople(peopleData.filter(p => p.type === 'kid'));
      setChores(choresData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChore = async (choreId) => {
    try {
      await choresAPI.complete(choreId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUncompleteChore = async (choreId) => {
    try {
      await choresAPI.uncomplete(choreId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
        Chore Tracker
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {people.map(person => {
          const personChores = chores.filter(c => c.assigned_to === person.id);
          const completedCount = personChores.filter(c => c.completed).length;
          const totalCount = personChores.length;

          return (
            <div
              key={person.id}
              className="bg-white rounded-2xl shadow-lg p-6 border-4"
              style={{ borderColor: person.color }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{person.avatar}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{person.name}</h2>
                    <p className="text-sm text-gray-600">
                      {completedCount}/{totalCount} chores done
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: person.color }}>
                    {person.fun_bucks}
                  </div>
                  <div className="text-sm text-gray-600">Fun Bucks</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                    backgroundColor: person.color,
                  }}
                />
              </div>

              {/* Chores List */}
              <div className="space-y-2">
                {personChores.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No chores assigned</p>
                ) : (
                  personChores.map(chore => (
                    <button
                      key={chore.id}
                      onClick={() => chore.completed ? handleUncompleteChore(chore.id) : handleCompleteChore(chore.id)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                        chore.completed
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-gray-100 border-2 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            chore.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'
                          }`}>
                            {chore.completed && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={chore.completed ? 'line-through text-gray-600' : 'font-medium'}>
                            {chore.title}
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: person.color }}>
                          +{chore.fun_bucks_reward} 💰
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 ml-8 mt-1 capitalize">
                        {chore.frequency}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {people.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">No kids added yet!</p>
          <p className="text-sm mt-2">Go to People to add family members</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
