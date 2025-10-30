import { useState, useEffect } from 'react';
import { prizesAPI, peopleAPI } from '../services/api';

function PrizesPage() {
  const [prizes, setPrizes] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prizesData, peopleData] = await Promise.all([
        prizesAPI.getAll(),
        peopleAPI.getAll(),
      ]);
      setPrizes(prizesData);
      setPeople(peopleData.filter(p => p.type === 'kid'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (prizeId, personId) => {
    try {
      await prizesAPI.redeem(prizeId, personId);
      alert('Prize redeemed successfully!');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
        Prize Shop
      </h1>

      {people.map(person => (
        <div key={person.id} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl">{person.avatar}</span>
            <div>
              <h2 className="text-3xl font-bold">{person.name}'s Shop</h2>
              <p className="text-xl" style={{ color: person.color }}>
                {person.fun_bucks} Fun Bucks available 💰
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prizes.map(prize => {
              const canAfford = person.fun_bucks >= prize.cost;

              return (
                <div
                  key={prize.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-4 ${
                    canAfford ? 'border-green-400' : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3">{prize.emoji}</div>
                    <h3 className="text-lg font-bold mb-2">{prize.name}</h3>
                    <div className="text-2xl font-bold mb-4" style={{ color: person.color }}>
                      {prize.cost} 💰
                    </div>
                    <button
                      onClick={() => canAfford && handleRedeem(prize.id, person.id)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Redeem' : 'Not Enough Fun Bucks'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {people.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">No kids to shop for!</p>
        </div>
      )}
    </div>
  );
}

export default PrizesPage;
