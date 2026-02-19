import type { Flight, Accommodation, Activity, Trip } from '@/db/types'
import { useNotes } from '@/hooks/useNotes'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plane, Hotel, Compass, Calendar, StickyNote, Plus, PiggyBank } from 'lucide-react'
import { formatDate, formatCurrency, cn } from '@/lib/utils'
import { useMemo } from 'react'
import { useExchangeRates} from '@/hooks/useExchangeRates'

interface TripOverviewProps {
  trip: Trip
  flights: Flight[]
  accommodations: Accommodation[]
  activities: Activity[]
}

function EmptyState({
  icon: Icon,
  label,
  action,
  actionLabel,
}: {
  icon: React.ElementType
  label: string
  action?: () => void
  actionLabel?: string
}) {
  return (
    <div className="text-center p-4">
      <Icon size={24} className="mx-auto text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">{label}</p>
      {action && actionLabel && (
        <Button variant="primary" size="sm" onClick={action} className="mt-2">
          <Plus size={14} />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function TripOverview({
  trip,
  flights,
  accommodations,
  activities,
}: TripOverviewProps) {
  const { note } = useNotes(trip.id!)
  const { data: currencyRates } = useExchangeRates()


  const upcomingFlights = flights.filter(f => new Date(f.departureTime) > new Date())
  const confirmedStays = accommodations.filter(a => a.isConfirmed)
  const upcomingActivities = activities.filter(a => new Date(a.date) > new Date())

  // Calculate totals by currency and total in base currency (USD)
  const { budgetBreakdown, totalInBase } = useMemo(() => {
    const breakdown: Record<string, { total: number; flights: number; stays: number; activities: number }> = {}
    let totalCost = 0

    const ensureCurrency = (currency: string) => {
      const c = currency.toUpperCase()
      if (!breakdown[c]) {
        breakdown[c] = { total: 0, flights: 0, stays: 0, activities: 0 }
      }
      return c
    }

    const convertCurrency = (amount: number, from: 'USD' | 'EUR' | 'ZAR', to: 'USD' | 'EUR' | 'ZAR')=> {
      if (!currencyRates) return 0;

      const rates = currencyRates;
      return amount * (rates[from]/rates[to]);
    };

    flights.forEach(f => {
      const c = ensureCurrency(f.currency)
      breakdown[c].flights += f.price
      breakdown[c].total += f.price
      totalCost += convertCurrency(f.price, f.currency as 'USD' | 'EUR' | 'ZAR', 'ZAR')
    })

    accommodations.forEach(a => {
      const c = ensureCurrency(a.currency)
      breakdown[c].stays += a.price
      breakdown[c].total += a.price
      totalCost += convertCurrency(a.price, a.currency as 'USD' | 'EUR' | 'ZAR', 'ZAR')
    })

    activities.forEach(a => {
      const c = ensureCurrency(a.currency)
      const cost = a.cost || 0
      breakdown[c].activities += cost
      breakdown[c].total += cost
      totalCost += convertCurrency(cost, a.currency as 'USD' | 'EUR' | 'ZAR', 'ZAR')
    })

    return { budgetBreakdown: breakdown, totalInBase: totalCost }
  }, [flights, accommodations, activities, currencyRates])

  const currencies = Object.keys(budgetBreakdown)

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className='p-5'>
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <div className="p-1 bg-blue-200 rounded text-blue-500 mr-2">
            <Plane size={20} />
          </div>
          Flights
        </h3>
        {flights.length > 0 ? (
          <>
            <p>Total Flights: {flights.length}</p>
            {upcomingFlights.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold">Upcoming Flights</h4>
                <ul>
                  {upcomingFlights.slice(0, 2).map(f => (
                    <li key={f.id} className="text-sm mt-1">
                      {f.airline} {f.flightNumber} - {formatDate(f.departureTime)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={Plane} label="No flights yet" />
        )}
      </Card>

      <Card className='p-5'>
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <div className="p-1 bg-teal-100 rounded text-teal-600 mr-2">
            <Hotel size={20} />
          </div>
          Stays
        </h3>
        {accommodations.length > 0 ? (
          <>
            <p>Total Stays: {accommodations.length}</p>
            <p>Confirmed Stays: {confirmedStays.length}</p>
          </>
        ) : (
          <EmptyState icon={Hotel} label="No accommodations yet" />
        )}
      </Card>

      <Card className='p-5'>
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <div className="p-1 bg-purple-200 rounded text-purple-500 mr-2">
            <Compass size={20} />
          </div>
          Activities
        </h3>
        {activities.length > 0 ? (
          <>
            <p>Total Activities: {activities.length}</p>
            {upcomingActivities.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold">Upcoming Activities</h4>
                <ul>
                  {upcomingActivities.slice(0, 2).map(a => (
                    <li key={a.id} className="text-sm mt-1">
                      {a.name} - {formatDate(a.date)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <EmptyState icon={Compass} label="No activities yet" />
        )}
      </Card>

      <Card className='p-5'>
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <div className="p-1 bg-orange-200 rounded text-orange-500 mr-2">
            <Calendar size={20} />
          </div>
          Planner
        </h3>
        <p>
          {flights.length + accommodations.length + activities.length} items
          in planner
        </p>
      </Card>

      <Card className='p-5'>
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <div className="p-1 bg-yellow-200 rounded text-yellow-500 mr-2">
            <StickyNote size={20} />
          </div>
          Notes
        </h3>
        {note ? (
          <p className="text-sm line-clamp-3">{note.content}</p>
        ) : (
          <EmptyState icon={StickyNote} label="No notes yet" />
        )}
      </Card>
    </div>
      <Card className='mt-10 p-5'>
        <h3 className="font-bold text-lg mb-2 flex items-center">
          <div className="p-1 bg-rose-pastel-100 rounded text-rose-pastel-500 mr-2">
            <PiggyBank size={20} />
          </div>
          Budget Breakdown
        </h3>
        {currencies.length > 0 ? (
          <div className="space-y-4">
            {currencies.map(curr => {
              const data = budgetBreakdown[curr]
              return (
                <div key={curr} className="space-y-1">
                  <div className="flex justify-between items-end border-b pb-1">
                    <span className="text-xs font-semibold uppercase text-gray-500">{curr}</span>
                    <span className="font-bold text-lg">{formatCurrency(data.total, curr as 'USD' | 'EUR' | 'ZAR')}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-500">
                    <div>
                      <p className="border-l-2 border-blue-200 pl-1">Flights</p>
                      <p className="font-medium text-gray-700">{formatCurrency(data.flights, curr as 'USD' | 'EUR' | 'ZAR')}</p>
                    </div>
                    <div>
                      <p className="border-l-2 border-teal-200 pl-1">Stays</p>
                      <p className="font-medium text-gray-700">{formatCurrency(data.stays, curr as 'USD' | 'EUR' | 'ZAR')}</p>
                    </div>
                    <div>
                      <p className="border-l-2 border-purple-200 pl-1">Activities</p>
                      <p className="font-medium text-gray-700">{formatCurrency(data.activities, curr as 'USD' | 'EUR' | 'ZAR')}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {currencies.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 italic">
                <div className="flex justify-between items-center text-sm font-medium text-gray-700">
                  <span>Estimated Total (ZAR)</span>
                  <span className="text-base text-lavender-600">{formatCurrency(totalInBase, 'ZAR')}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">* Estimates based on static exchange rates.</p>
              </div>
            )}

            {trip.budget && (
              <div className="mt-4 pt-3 border-t border-dashed">
                <p className="text-xs text-gray-400">Target Budget</p>
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-gray-600">{trip.budget}</p>
                  {currencies.length > 1 && (
                    <span className={cn(
                      "text-xs font-medium",
                      parseFloat(trip.budget.replace(/[^0-9.]/g, '')) < totalInBase ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {parseFloat(trip.budget.replace(/[^0-9.]/g, '')) < totalInBase ? "Over budget" : "Under budget"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={PiggyBank} label="No costs added yet" />
        )}
      </Card>
    </>
  )
}
