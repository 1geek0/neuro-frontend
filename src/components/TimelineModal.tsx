import { Modal } from './Modal'
import { Loader2, Calendar } from 'lucide-react'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'
import { useState, useEffect } from 'react'
import { demoTimelineEvents } from '@/Demo/demoTimelineEvents';
import { TimelineChart } from './TimelineChart';

export interface TimelineEvent {
    phase: string
    type: string
    date: string | null | undefined
    symptoms?: string[]
    description: string[] | string
    outcome?: string
}

interface TimelineModalProps {
    isOpen: boolean
    onClose: () => void
}

export function TimelineModal({ isOpen, onClose }: TimelineModalProps) {
    const [events, setEvents] = useState<TimelineEvent[]>([
        {
          "phase": "pre-surgery",
          "type": "consultation",
          "date": null,
          "description": "Surgeon's assistant informed patient about titanium plate replacement for skull section",
          "outcome": "Unexpected surgical modification"
        },
        {
          "phase": "surgery",
          "type": "brain_tumor_removal",
          "date": null,
          "description": "Tumor removal surgery with general anesthesia",
          "outcome": "Complete tumor removal reported"
        },
        {
          "phase": "post-surgery",
          "type": "symptoms",
          "date": null,
          "description": "Speech and cognitive challenges",
          "symptoms": [
            "Word retrieval difficulties",
            "Memory recall issues",
            "Temporary location name confusion"
          ]
        },
        {
          "phase": "post-surgery",
          "type": "recovery",
          "date": null,
          "description": "Discharge from hospital"
        },
        {
          "phase": "post-surgery",
          "type": "symptoms",
          "date": null,
          "description": "Ongoing post-operative symptoms",
          "symptoms": [
            "Fatigue",
            "Swelling around surgical site",
            "Sinus fluid sensation",
            "Scalp itching",
            "Reduced sensation around scar",
            "Surgical scar"
          ]
        },
        {
          "phase": "post-surgery",
          "type": "procedure",
          "date": null,
          "description": "Staple removal"
        }
      ])
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
                        new Date(b.date ? b.date : 0).getTime() - new Date(a.date ? a.date : 0).getTime()
                    )
                    setEvents(sortedEvents)
                }
            } catch (error) {
                console.error('Error fetching timeline:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (localStorage.getItem('demoMode') === 'True') {
            setIsLoading(false);
            setEvents(demoTimelineEvents)
        } else {
            fetchTimeline()
        }
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
                        Add more to your story so we can map your timeline together
                    </div>
                ) : (
                    <div className="space-y-6">
                        {events.map((event, index) => (
                            <div key={index} className="relative">
                                <div className="flex items-start gap-4 ">
                                    <div className="flex-shrink-0 my-auto w-20">
                                        <div className="text-xs text-gray-400" >
                                            {event.date && new Date(event.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>

                                    </div>
                                    <div className="flex-grow relative">
                                        <div className="bg-white rounded-lg border p-4">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getPhaseColor(event.phase)}`}>
                                                {event.phase}
                                            </span>
                                            <div className="font-medium text-gray-900">
                                                {Array.isArray(event.description) ? event.description.join(', ') : event.description}
                                            </div>
                                            {event.symptoms && (
                                                <div className=' flex flex-wrap'>
                                                    {event.symptoms.map((symptom, index) => (
                                                        <div key={index} className="text-xs w-fit text-gray-600 border rounded-full px-2 py-1 mr-2 my-1">{symptom}</div>

                                                    ))}
                                                </div>
                                            )}
                                            {/* {event.outcome && <div className='text-sm text-gray-700 my-2 border-t py-2  my-2'>
                                                {event.outcome}
                                            </div>} */}
                                            {/* {event.date && <div className="text-xs text-gray-400 mt-2">
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>} */}
                                        </div>
                                        {index < events.length - 1 && (
                                            <div className="absolute left-[50%] -translate-x-1/2 top-[100%] w-0.5 bg-gray-200 h-full" />
                                        )}
                                    </div>
                                </div>

                            </div>
                        ))}
                        <TimelineChart events={events} />
                    </div>
                )}
            </div>
        </Modal>
    )
}