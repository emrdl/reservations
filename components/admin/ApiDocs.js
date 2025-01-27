'use client'
import { useState } from 'react'
import { BiCode, BiCopy, BiCheck } from 'react-icons/bi'

const API_ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/menu',
    description: 'Menü öğelerini listeler',
    parameters: [],
    response: {
      items: [
        { id: 1, name: 'Ürün 1', price: 100 }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/orders',
    description: 'Yeni sipariş oluşturur',
    parameters: [
      { name: 'tableId', type: 'string', required: true },
      { name: 'items', type: 'array', required: true }
    ],
    response: {
      orderId: 1,
      status: 'pending'
    }
  }
  // ... diğer endpoint'ler
]

export default function ApiDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <h2>API Dokümantasyonu</h2>
        <p>
          Restoran yönetim sistemimizin API'sini kullanarak kendi uygulamanızı
          geliştirebilirsiniz.
        </p>
      </div>

      <div className="space-y-4">
        {API_ENDPOINTS.map((endpoint, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    endpoint.method === 'GET'
                      ? 'bg-green-100 text-green-800'
                      : endpoint.method === 'POST'
                      ? 'bg-blue-100 text-blue-800'
                      : endpoint.method === 'PUT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {endpoint.path}
                  </code>
                </div>
                <p className="mt-2 text-gray-600">{endpoint.description}</p>
              </div>
              <button
                onClick={() => copyToClipboard(endpoint.path)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded"
              >
                {copied ? <BiCheck /> : <BiCopy />}
              </button>
            </div>

            {endpoint.parameters.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Parametreler</h4>
                <div className="space-y-2">
                  {endpoint.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded">
                        {param.name}
                      </code>
                      <span className="text-sm text-gray-600">
                        {param.type}
                      </span>
                      {param.required && (
                        <span className="text-xs text-red-500">Zorunlu</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h4 className="font-medium mb-2">Örnek Yanıt</h4>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                <code>{JSON.stringify(endpoint.response, null, 2)}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 