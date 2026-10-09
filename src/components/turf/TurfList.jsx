import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TurfList = () => {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/turfs');
        const data = await res.json();
        
        // Fetch reviews for each turf to calculate rating
        const turfsWithRatings = await Promise.all(data.map(async (turf) => {
          const revRes = await fetch(`http://localhost:3001/api/turfs/${turf._id || turf.id}/reviews`);
          const reviews = await revRes.json();
          const avgRating = reviews.length > 0 
            ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
            : 0;
          return { ...turf, avgRating, totalReviews: reviews.length };
        }));

        setTurfs(turfsWithRatings);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchTurfs();
  }, []);

  if (loading) return <div className="p-4">Loading turfs...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Turfs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turfs.map(turf => (
          <div key={turf._id || turf.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-bold mb-2">{turf.name}</h2>
            <p className="text-gray-600 mb-4">📍 {turf.location}</p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-500 font-bold">⭐ {turf.avgRating}</span>
              <span className="text-gray-500 text-sm">({turf.totalReviews} reviews)</span>
            </div>
            
            <Link 
              to={`/turfs/${turf._id || turf.id}`} 
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              View Turf
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TurfList;
