'use client'
import { useState } from 'react'
import { BiUser, BiDollar, BiCalendar, BiPieChart } from 'react-icons/bi'
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const SEGMENTS = {
  PLATINUM: 'platinum',
  GOLD: 'gold',
  SILVER: 'silver',
  BRONZE: 'bronze'
}

const COLORS = {
  [SEGMENTS.PLATINUM]: '#8884d8',
  [SEGMENTS.GOLD]: '#ffc658',
  [SEGMENTS.SILVER]: '#82ca9d',
  [SEGMENTS.BRONZE]: '#ff8042'
}

export default function CustomerSegmentation() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      segment: SEGMENTS.GOLD,
      totalSpent: 5000,
      visits: 25,
      lastVisit: '2024-03-15',
      preferences: ['Türk Mutfağı', 'Tatlı']
    }
    // ... diğer müşteriler
  ])

  const [segmentRules, setSegmentRules] = useState({
    [SEGMENTS.PLATINUM]: { minSpent: 10000, minVisits: 50 },
    [SEGMENTS.GOLD]: { minSpent: 5000, minVisits: 25 },
    [SEGMENTS.SILVER]: { minSpent: 2500, minVisits: 10 },
    [SEGMENTS.BRONZE]: { minSpent: 0, minVisits: 0 }
  })

  const segmentData = Object.values(SEGMENTS).map(segment => ({
    name: segment,
    value: customers.filter(c => c.segment === segment).length
  }))

  return (
    <div className="space-y-6">
      {/* Segment Dağılımı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Segment Dağılımı</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={segmentData}
              cx={200}
              cy={150}
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {segmentData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Segment Kuralları</h3>
          <div className="space-y-4">
            {Object.entries(segmentRules).map(([segment, rules]) => (
              <div
                key={segment}
                className="p-3 bg-gray-50 rounded"
              >
                <div className="font-medium capitalize mb-2">{segment}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Min. Harcama:</span>
                    <span className="ml-2">{rules.minSpent}₺</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Min. Ziyaret:</span>
                    <span className="ml-2">{rules.minVisits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Müşteri Listesi */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Müşteriler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map(customer => (
            <div key={customer.id} className="border rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{customer.name}</h4>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    customer.segment === SEGMENTS.PLATINUM
                      ? 'bg-purple-100 text-purple-800'
                      : customer.segment === SEGMENTS.GOLD
                      ? 'bg-yellow-100 text-yellow-800'
                      : customer.segment === SEGMENTS.SILVER
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {customer.segment}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <BiDollar className="text-gray-500" />
                  Toplam: {customer.totalSpent}₺
                </div>
                <div className="flex items-center gap-2">
                  <BiCalendar className="text-gray-500" />
                  {customer.visits} Ziyaret
                </div>
                <div className="flex items-center gap-2">
                  <BiUser className="text-gray-500" />
                  Son: {new Date(customer.lastVisit).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 