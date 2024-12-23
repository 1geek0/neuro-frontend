import { useSearchParams } from "next/navigation";
import { Modal } from "./Modal";
import { TimelineChart } from "./TimelineChart";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { TimelineEvent } from "./TimelineModal";
import { Loader2 } from "lucide-react";

interface Timelines {
    events: TimelineEvent[]
}

interface TimelineChartModalProps {
    isOpen: boolean
    onClose: () => void
}
export function TimelineChatModal({ isOpen, onClose }: TimelineChartModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<TimelineEvent[]>([])
    const [timelines, setTimelines] = useState<Timelines[]>([])
    const authenticatedFetch = useAuthenticatedFetch();

    useEffect(() => {
        if (!isOpen) return
        const fetchTimelines = async () => {
            try {
                const response1 = await authenticatedFetch('/api/similar-stories')
                if (!response1.ok) throw new Error('Failed to fetch timeline')
                const stories = await response1.json();
                const tlines = stories.map((story: any) => ({
                    events: story.timelineJson.events
                }))
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
                setTimelines(tlines);
            } catch (error) {
                console.error('Error fetching timeline:', error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchTimelines()
    }, [isOpen])
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 w-full">Who Else</h2>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : timelines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Add more to your story so we can map your timeline together
                    </div>
                ) : (
                    <>
                        <div  className="flex justify-center flex-col items-center">
                            <h3 className="font-bold mb-6 text-gray-900 w-full">Your Timeline</h3>
                            <div className="w-4/5 ">
                                <TimelineChart events={events} />
                            </div>
                        </div>
                        <h3 className="font-bold mb-6 mt-10 text-gray-900 w-full">Similar Timelines</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {timelines.map((t, index) => {
                                return <TimelineChart events={t.events} key={index} />
                            })}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    )
}