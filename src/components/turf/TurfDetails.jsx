import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const TurfDetails = () => {
  const { id } = useParams();
  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState('');

  // User state
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [hasBooked, setHasBooked] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // For simplicity, we just fetch turf, reviews and check booking eligibility
      const turfRes = await fetch(`http://localhost:3001/api/turfs/${id}`);
      if (!turfRes.ok) throw new Error('Failed to fetch turf');
      const turfData = await turfRes.json();
      setTurf(turfData);

      const reviewRes = await fetch(`http://localhost:3001/api/turfs/${id}/reviews`);
      const reviewData = await reviewRes.json();
      setReviews(reviewData);

      if (currentUser) {
        const bookingRes = await fetch(`http://localhost:3001/api/turfs/bookings/user/${currentUser._id || currentUser.id}`);
        const userBookings = await bookingRes.json();
        const completedBooking = userBookings.find(b => b.fieldId === id && b.status === 'Completed');
        
        if (completedBooking) {
          setHasBooked(true);
          setBookingId(completedBooking._id || completedBooking.id);
          
          const alreadyReviewed = reviewData.some(r => r.userId === (currentUser._id || currentUser.id));
          setHasReviewed(alreadyReviewed);
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) return setReviewError('Rating is required');
    if (!comment.trim()) return setReviewError('Review text is required');
    
    try {
      const res = await fetch(`http://localhost:3001/api/turfs/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fieldId: id,
          bookingId: bookingId,
          userId: currentUser._id || currentUser.id,
          userName: currentUser.name,
          rating,
          comment: comment.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }

      setComment('');
      setRating(0);
      setReviewError('');
      fetchData(); // Refresh reviews
    } catch (err) {
      setReviewError(err.message);
    }
  };

  if (loading) return <div>Loading turf details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!turf) return <div>Turf not found</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  // Rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => distribution[r.rating]++);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{turf.name || 'Bashundhara Sports Arena'}</h1>
        <p className="text-gray-600 mb-4">📍 {turf.location || 'Bashundhara, Dhaka'}</p>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="text-2xl text-yellow-500 font-bold">⭐ {averageRating} / 5</div>
          <div className="text-gray-500">{reviews.length} Reviews</div>
        </div>
        
        <div className="flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Check Availability</button>
          <button className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700">Book Now</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">RATING SUMMARY</h2>
        <div className="space-y-2 max-w-md">
          {[5, 4, 3, 2, 1].map(star => {
            const percentage = reviews.length > 0 ? ((distribution[star] / reviews.length) * 100).toFixed(0) : 0;
            return (
              <div key={star} className="flex items-center gap-4">
                <div className="w-16 flex text-yellow-500">{Array(star).fill('★').join('')}{Array(5-star).fill('☆').join('')}</div>
                <div className="flex-1 bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <div className="w-12 text-right text-gray-500 text-sm">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">USER REVIEWS</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xl mb-2">⭐ No reviews yet</p>
            <p>Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id || review.id} className="border-b pb-6 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-yellow-500">⭐ {review.rating.toFixed(1)}</div>
                  <div className="font-semibold">{review.userName || 'User'}</div>
                  <div className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</div>
                </div>
                <p className="text-gray-700">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentUser && hasBooked && !hasReviewed && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Rate this Turf</h2>
          <form onSubmit={handleSubmitReview}>
            {reviewError && <div className="text-red-500 mb-4">{reviewError}</div>}
            
            <div className="flex gap-1 mb-4 text-3xl cursor-pointer">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={(hoverRating || rating) >= star ? "text-yellow-500" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea 
              className="w-full border rounded-lg p-3 mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Review"
              value={comment}
              onChange={e => setComment(e.target.value)}
            ></textarea>
            
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
              Submit Review
            </button>
          </form>
        </div>
      )}

      {currentUser && !hasBooked && (
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
          You can review this turf after completing a booking.
        </div>
      )}

      {currentUser && hasBooked && hasReviewed && (
        <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-600">
          You have already reviewed this booking.
        </div>
      )}
    </div>
  );
};

export default TurfDetails;
