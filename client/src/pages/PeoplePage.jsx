import { useState, useEffect } from 'react';
import { peopleAPI } from '../services/api';

function PeoplePage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const data = await peopleAPI.getAll();
      setPeople(data);
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
        Family Members
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {people.map(person => (
          <div
            key={person.id}
            className="bg-white rounded-2xl shadow-lg p-6 border-4"
            style={{ borderColor: person.color }}
          >
            <div className="flex items-center gap-4">
              <span className="text-6xl">{person.avatar}</span>
              <div>
                <h2 className="text-2xl font-bold">{person.name}</h2>
                <p className="text-sm text-gray-600 capitalize">{person.type}</p>
                {person.type === 'kid' && (
                  <p className="text-lg font-bold mt-2" style={{ color: person.color }}>
                    {person.fun_bucks} Fun Bucks 💰
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PeoplePage;
