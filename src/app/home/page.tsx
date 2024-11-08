'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Modal } from '@/components/Modal'

interface Story {
    id: string
    rawText: string
    userId: string
    createdAt: { $date: string }
    title: string
}

interface Research {
    id: string
    title: string
    url: string
    abstract: string
}

export default function HomePage() {
    const [similarStories, setSimilarStories] = useState<Story[]>([])
    const [research, setResearch] = useState<Research[]>([])
    const [state, setState] = useState('')
    const router = useRouter()
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [storiesRes, researchRes] = await Promise.all([
                    fetch('/api/similar-stories'),
                    fetch('/api/research')
                ])

                if (!storiesRes.ok || !researchRes.ok) {
                    throw new Error('Failed to fetch data')
                }

                const stories = await storiesRes.json()
                const research = await researchRes.json()

                setSimilarStories(stories)
                setResearch(research)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [])

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Similar Stories Section */}
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Find people with stories like you</h2>
                        <div className="space-y-4">
                            {
                                similarStories.map(story => (
                                    <div
                                        key={story.id}
                                        className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                                        onClick={() => setSelectedStory(story)}
                                    >
                                        <p className="text-sm text-gray-900 mb-2">
                                            {new Date(story.createdAt['$date']).toLocaleDateString()}
                                        </p>
                                        <h3 className="font-semibold mb-2">{story.title}</h3>
                                        <p className="line-clamp-3 text-gray-900">{story.rawText}</p>
                                    </div>
                                ))}
                            <button className="w-full bg-emerald-100 text-emerald-900 rounded-lg p-3 hover:bg-emerald-200 transition">
                                Add more to your story to find more similar people
                            </button>
                        </div>
                    </section>

                    <div className="space-y-8">
                        {/* Research Section */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Latest Research on Meningioma</h2>
                            <div className="space-y-4">
                                {research.map(item => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block border rounded-lg p-4 hover:bg-gray-50"
                                    >
                                        <h3 className="font-semibold mb-2 text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-900 line-clamp-2">
                                            {item.abstract}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        </section>

                        {/* Medical Resources Section */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">
                                Search for medical resources in any state
                            </h2>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="Type to search states..."
                                className="w-full p-3 border rounded-lg bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                            />
                            <div className="mt-2 max-h-48 overflow-y-auto">
                                {[
                                    { value: 'AL', label: 'Alabama' },
                                    { value: 'AK', label: 'Alaska' },
                                    { value: 'AZ', label: 'Arizona' },
                                    { value: 'AR', label: 'Arkansas' },
                                    { value: 'CA', label: 'California' },
                                    { value: 'CO', label: 'Colorado' },
                                    { value: 'CT', label: 'Connecticut' },
                                    { value: 'DE', label: 'Delaware' },
                                    { value: 'FL', label: 'Florida' },
                                    { value: 'GA', label: 'Georgia' },
                                    { value: 'HI', label: 'Hawaii' },
                                    { value: 'ID', label: 'Idaho' },
                                    { value: 'IL', label: 'Illinois' },
                                    { value: 'IN', label: 'Indiana' },
                                    { value: 'IA', label: 'Iowa' },
                                    { value: 'KS', label: 'Kansas' },
                                    { value: 'KY', label: 'Kentucky' },
                                    { value: 'LA', label: 'Louisiana' },
                                    { value: 'ME', label: 'Maine' },
                                    { value: 'MD', label: 'Maryland' },
                                    { value: 'MA', label: 'Massachusetts' },
                                    { value: 'MI', label: 'Michigan' },
                                    { value: 'MN', label: 'Minnesota' },
                                    { value: 'MS', label: 'Mississippi' },
                                    { value: 'MO', label: 'Missouri' },
                                    { value: 'MT', label: 'Montana' },
                                    { value: 'NE', label: 'Nebraska' },
                                    { value: 'NV', label: 'Nevada' },
                                    { value: 'NH', label: 'New Hampshire' },
                                    { value: 'NJ', label: 'New Jersey' },
                                    { value: 'NM', label: 'New Mexico' },
                                    { value: 'NY', label: 'New York' },
                                    { value: 'NC', label: 'North Carolina' },
                                    { value: 'ND', label: 'North Dakota' },
                                    { value: 'OH', label: 'Ohio' },
                                    { value: 'OK', label: 'Oklahoma' },
                                    { value: 'OR', label: 'Oregon' },
                                    { value: 'PA', label: 'Pennsylvania' },
                                    { value: 'RI', label: 'Rhode Island' },
                                    { value: 'SC', label: 'South Carolina' },
                                    { value: 'SD', label: 'South Dakota' },
                                    { value: 'TN', label: 'Tennessee' },
                                    { value: 'TX', label: 'Texas' },
                                    { value: 'UT', label: 'Utah' },
                                    { value: 'VT', label: 'Vermont' },
                                    { value: 'VA', label: 'Virginia' },
                                    { value: 'WA', label: 'Washington' },
                                    { value: 'WV', label: 'West Virginia' },
                                    { value: 'WI', label: 'Wisconsin' },
                                    { value: 'WY', label: 'Wyoming' }
                                ].filter(s =>
                                    s.label.toLowerCase().startsWith(state.toLowerCase()) ||
                                    s.value.toLowerCase().startsWith(state.toLowerCase())
                                ).map(s => (
                                    <div
                                        key={s.value}
                                        onClick={() => setState(s.value)}
                                        className="p-2 hover:bg-blue-50 cursor-pointer rounded"
                                    >
                                        {s.label} ({s.value})
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={!!selectedStory}
                onClose={() => setSelectedStory(null)}
            >
                {selectedStory && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">{selectedStory.title}</h2>
                        <p className="text-sm text-gray-500">
                            {new Date(selectedStory.createdAt['$date']).toLocaleDateString()}
                        </p>
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedStory.rawText}</p>
                    </div>
                )}
            </Modal>
        </main>
    )
} 