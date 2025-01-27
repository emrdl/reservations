import ReservationForm from '@/components/customer/ReservationForm'

export default function CustomerPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Online Rezervasyon
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <ReservationForm />
      </div>
    </div>
  )
} 