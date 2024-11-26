import { Modal } from './Modal'
import { Loader2, Calendar } from 'lucide-react'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'
import { useState, useEffect } from 'react'

interface TimelineEvent {
    phase: string
    type: string
    date: string
    desc: string[]
    details?: string
}

interface TimelineModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TimelineModal({ isOpen, onClose }: TimelineModalProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const authenticatedFetch = useAuthenticatedFetch()

    useEffect(() => {
        if (!isOpen) return

        const fetchTimeline = async () => {
            try {
                const response = await authenticatedFetch('/api/timeline')
                if (!response.ok) throw new Error('Failed to fetch timeline')
                const data = await response.json()
                if (data.timeline) {
                    // Sort events by date in descending order
                    const sortedEvents = data.timeline.sort((a: TimelineEvent, b: TimelineEvent) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    setEvents(sortedEvents)
                }
            } catch (error) {
                console.error('Error fetching timeline:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTimeline()
    }, [isOpen])

    const getPhaseColor = (phase: string) => {
        const colors = {
            'pre-diagnosis': 'bg-yellow-100 text-yellow-800',
            'diagnosis': 'bg-blue-100 text-blue-800',
            'pre-surgery': 'bg-purple-100 text-purple-800',
            'surgery': 'bg-red-100 text-red-800',
            'post-surgery': 'bg-green-100 text-green-800',
            'follow-up': 'bg-indigo-100 text-indigo-800'
        }
        return colors[phase as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Your Medical Timeline</h2>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No timeline events found
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map((event, index) => (
                            <div key={index} className="relative">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 my-auto">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="bg-white rounded-lg border p-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPhaseColor(event.phase)}`}>
                                                {event.phase}
                                            </span>
                                            <div className="font-medium text-gray-900">
                                                {Array.isArray(event.desc) ? event.desc.join(', ') : event.desc}
                                            </div>
                                            {event.details && (
                                                <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                                            )}
                                            <div className="text-xs text-gray-400 mt-2">
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* {index < events.length - 1 && (
                                    <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200 h-8" />
                                )} */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    )
}