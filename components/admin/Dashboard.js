'use client';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiFilter, FiPlus, FiChevronRight, FiBell, FiSearch, FiUsers } from 'react-icons/fi';

const data = [
  { name: 'OCA', value: 3000 },
  { name: 'ŞUB', value: 3500 },
  { name: 'MAR', value: 4000 },
  { name: 'NİS', value: 3800 },
  { name: 'MAY', value: 4500 },
  { name: 'HAZ', value: 4300 },
  { name: 'TEM', value: 4100 },
  { name: 'AĞU', value: 4200 },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: i,
  visits: Math.floor(Math.random() * 100),
}));

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('Bu ay');

  return (
    <div className="flex min-h-screen">

      {/* Ana İçerik */}
      <div className="flex-1 p-8">
        {/* Üst Bar */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-100"></div>
              <div className="w-8 h-8 rounded-full bg-blue-100"></div>
              <div className="w-8 h-8 rounded-full bg-green-100"></div>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <FiBell className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg">
              Export
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
              <p className="text-gray-500 text-sm">Track your sales and performance of your strategy</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center px-4 py-2 border rounded-lg">
                <FiFilter className="mr-2" /> Filters
              </button>
              <button className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg">
                <FiPlus className="mr-2" /> Add Widget
              </button>
            </div>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500">Product Overview</h3>
              <select className="border-none text-sm">
                <option>This month</option>
                <option>Last month</option>
              </select>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">$43,630</div>
              <div className="text-sm text-gray-500">Total sales</div>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                Cosmetics
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                Houseware
              </span>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500">Active Sales</h3>
              <span className="text-green-500 text-sm">+12%</span>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">$27,064</div>
              <div className="text-sm text-gray-500">vs last month</div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-12 w-4 bg-orange-500 rounded"></div>
              <div className="h-8 w-4 bg-orange-300 rounded"></div>
              <div className="h-10 w-4 bg-orange-400 rounded"></div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500">Product Revenue</h3>
              <span className="text-green-500 text-sm">+7%</span>
            </div>
            <div>
              <div className="text-3xl font-semibold mb-1">$16,568</div>
              <div className="text-sm text-gray-500">vs last month</div>
            </div>
            <div className="mt-4">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-8 border-orange-500 rounded-full opacity-20"></div>
                <div className="absolute inset-0 border-8 border-orange-500 rounded-full" 
                     style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 70%)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Grafik ve Performans */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-500">Analytics</h3>
              <div className="flex items-center gap-4">
                <select className="border-none text-sm">
                  <option>This year</option>
                  <option>Last year</option>
                </select>
                <button className="px-3 py-1 border rounded-lg text-sm">
                  Filters
                </button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7043" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ff7043" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#ff7043"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-500">Sales Performance</h3>
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-gray-100 rounded text-xs">For week</div>
                <div className="px-2 py-1 bg-gray-100 rounded text-xs">For today</div>
              </div>
            </div>
            <div className="flex justify-center items-center h-[300px]">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 border-[16px] border-orange-500 rounded-full opacity-20"></div>
                <div className="absolute inset-0 border-[16px] border-orange-500 rounded-full" 
                     style={{ clipPath: 'polygon(0 0, 100% 0, 100% 17.9%, 0 17.9%)' }}>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-semibold">17.9%</div>
                    <div className="text-sm text-gray-500">Since yesterday</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bölüm */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FiUsers className="text-orange-500" />
                <h3 className="text-gray-500">Total visits by hourly</h3>
              </div>
              <div className="text-2xl font-semibold">288,822</div>
            </div>
            <div className="grid grid-cols-12 gap-1 mt-4">
              {hourlyData.map((item, index) => (
                <div
                  key={index}
                  className="h-8 bg-orange-100 rounded"
                  style={{
                    opacity: item.visits / 100,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500">Top Products</h3>
              <button className="text-orange-500 text-sm">See Details</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="text-left py-2">Product</th>
                  <th className="text-left py-2">Sales</th>
                  <th className="text-left py-2">Revenue</th>
                  <th className="text-left py-2">Stock</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded"></div>
                      <span>Black Shorts</span>
                    </div>
                  </td>
                  <td className="py-2">127 pcs</td>
                  <td className="py-2">$1,890</td>
                  <td className="py-2">120</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                      In stock
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded"></div>
                      <span>T-Shirt, Male</span>
                    </div>
                  </td>
                  <td className="py-2">540 pcs</td>
                  <td className="py-2">$2,869</td>
                  <td className="py-2">100</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-sm">
                      Out of stock
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 