import { useSearchParams } from "next/navigation";
import { Modal } from "./Modal";
import { TimelineChart } from "./TimelineChart";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { TimelineEvent } from "./TimelineModal";
import { Loader2 } from "lucide-react";

interface Timelines {
    events : TimelineEvent[]
}

interface TimelineChartModalProps {
    isOpen : boolean
    onClose: () => void
}
export function TimelineChatModal({ isOpen, onClose} : TimelineChartModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [timelines, setTimelines] = useState<Timelines[]>([])
    const authenticatedFetch = useAuthenticatedFetch();

    useEffect(() => {
        if (!isOpen) return
                const fetchTimelines = async () => {
                    try {
                        const response = await authenticatedFetch('/api/similar-stories')
                        if (!response.ok) throw new Error('Failed to fetch timeline')
                        const stories = await response.json();
                        const tlines = stories.map((story : any) => ({
                            events : story.timelineJson.events
                        }))
                        setTimelines(tlines);
                    } catch (error) {
                        console.error('Error fetching timeline:', error)
                    } finally {
                        setIsLoading(false)
                    }
                }
                fetchTimelines()
    },[isOpen])
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Similar Timelines</h2>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : timelines.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Add more to your story so we can map your timeline together
                    </div>
                ) : (
                    <div className="space-y-6">
                        {timelines.map((t, index) => {
                            return <TimelineChart events={t.events} key={index}/>
                        })}
                    </div>
                )}
            </div>
        </Modal>
    )
}