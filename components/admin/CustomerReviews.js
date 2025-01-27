'use client'
import { useState } from 'react'
import { BiStar, BiComment, BiLike } from 'react-icons/bi'

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      customerName: 'Mehmet A.',
      rating: 4,
      comment: 'Yemekler çok lezzetliydi, servis hızlıydı.',
      date: '2024-03-15',
      response: null,
      tags: ['yemek', 'servis']
    }
    // ... diğer yorumlar
  ])

  const [filter, setFilter] = useState({
    rating: 'all',
    tag: 'all',
    responded: 'all'
  })

  const respondToReview = (reviewId, response) => {
    setReviews(reviews.map(review =>
      review.id === reviewId ? { ...review, response } : review
    ))
  }

  return (
    <div className="space-y-4">
      {/* Filtreler */}
      <div className="flex gap-4 mb-4">
        <select
          value={filter.rating}
          onChange={(e) => setFilter({ ...filter, rating: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="all">Tüm Puanlar</option>
          {[5, 4, 3, 2, 1].map(rating => (
            <option key={rating} value={rating}>{rating} Yıldız</option>
          ))}
        </select>
        {/* ... diğer filtreler */}
      </div>

      {/* Yorumlar */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">{review.customerName}</div>
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <BiStar
                      key={i}
                      className={i < review.rating ? 'fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(review.date).toLocaleDateString()}
              </div>
            </div>
            <p className="text-gray-700 mb-2">{review.comment}</p>
            <div className="flex gap-2 mb-2">
              {review.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            {review.response && (
              <div className="bg-gray-50 p-3 rounded mt-2">
                <div className="text-sm font-medium">Yanıtımız:</div>
                <p className="text-sm text-gray-700">{review.response}</p>
              </div>
            )}
            {!review.response && (
              <button
                onClick={() => {/* Yanıt formu */}}
                className="text-sm text-blue-600 hover:underline"
              >
                Yanıtla
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 