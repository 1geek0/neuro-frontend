'use client'

import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Modal } from '@/components/Modal'
import { useAuth0 } from '@auth0/auth0-react'
import { LogOut, Loader2, MapPin, Building2, ChevronRight, Search, X } from 'lucide-react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'
import { demoSimilarStories } from '@/Demo/demoSimilarStories'
import { useDemoContext } from '@/context/context';



export interface Story {
    id: string;
    title: string | null;
    rawText: string;
    userId: string;
    createdAt: { $date: string };
    content?: string;
    link?: string;
}

interface Research {
    id: string
    title: string
    link: string
    content: string
    resource_type: string
}

interface StateResource {
    id: string
    name: string
    state: string
    facility_type: string
}

export default function HomePage() {
    useAuthRedirect()
    const [similarStories, setSimilarStories] = useState<Story[]>([])
    const [research, setResearch] = useState<Research[]>([])
    const [state, setState] = useState('')
    const router = useRouter()
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const { logout } = useAuth0()
    const authenticatedFetch = useAuthenticatedFetch()
    const [stateResources, setStateResources] = useState<StateResource[]>([])
    const [isLoadingResources, setIsLoadingResources] = useState(false)

    const { demo, setDemo } = useDemoContext();

    useEffect(() => {
        let isMounted = true

        const fetchData = async () => {
            try {
                const [storiesRes, researchRes] = await Promise.all([
                    authenticatedFetch('/api/similar-stories'),
                    authenticatedFetch('/api/research')
                ])

                if (!storiesRes.ok || !researchRes.ok) {
                    throw new Error('Failed to fetch data')
                }

                const stories = await storiesRes.json()
                const researchData = await researchRes.json()

                if (isMounted) {
                    const additionalStories = researchData
                        .filter((item: Research) =>
                            item.resource_type === 'Individual Patient Story' ||
                            item.resource_type === 'Communities'
                        )
                        .map((item: Research) => ({
                            ...item,
                            rawText: item.content
                        }))

                    const medicalResearch = researchData.filter((item: Research) =>
                        item.resource_type === 'Medical Research'
                    )

                    setSimilarStories([...stories, ...additionalStories])
                    setResearch(medicalResearch)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        if (demo) {
            setSimilarStories(demoSimilarStories);
        } else {
            fetchData();
        }

        return () => {
            isMounted = false
        }
    }, [])

    const handleLogout = async () => {
        try {
            // Clear session cookie - fixed to include domain and secure flags
            document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + '; secure; samesite=strict';

            // Auth0 logout and redirect
            await logout({
                logoutParams: {
                    returnTo: window.location.origin
                }
            })

            // Force navigation to home
            router.push('/')
        } catch (error) {
            console.error('Error during logout:', error)
            // Fallback: force navigation even if Auth0 logout fails
            router.push('/')
        }
    }


    const fetchStateResources = async (selectedState: string) => {
        setIsLoadingResources(true)
        try {
            const response = await authenticatedFetch(`/api/state-resources/${selectedState}`)
            if (!response.ok) throw new Error('Failed to fetch state resources')
            const data = await response.json()
            setStateResources(data)
        } catch (error) {
            console.error('Error fetching state resources:', error)
            setStateResources([])
        } finally {
            setIsLoadingResources(false)
        }
    }

    // Group resources by facility type for better organization
    const groupedResources = stateResources.reduce((acc, resource) => {
        const type = resource.facility_type
        if (!acc[type]) {
            acc[type] = []
        }
        acc[type].push(resource)
        return acc
    }, {} as Record<string, StateResource[]>)

    return (
        <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-300 shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        {demo ? 'Quit Demo Mode' : 'Logout'}
                    </button>
                </div>

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


                                        <h3 className="font-semibold mb-2 text-gray-900">{story.title}</h3>
                                        <p className="line-clamp-3 text-gray-900">{story.rawText}</p>
                                        {story.link && (
                                            <a
                                                href={story.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View original post →
                                            </a>
                                        )}
                                    </div>
                                ))}
                            <button
                                onClick={() => router.push('/notes')}
                                className="w-full bg-emerald-100 text-emerald-900 rounded-lg p-3 hover:bg-emerald-200 transition"
                            >
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
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block border rounded-lg p-4 hover:bg-gray-50"
                                    >
                                        <h3 className="font-semibold mb-2 text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-900 line-clamp-2">
                                            {item.content}
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
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        placeholder="Search states..."
                                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    />
                                    {state && (
                                        <button
                                            onClick={() => {
                                                setState('')
                                                setStateResources([])
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                                        >
                                            <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                    )}
                                </div>

                                {state && !stateResources.length && (
                                    <div className="absolute z-10 mt-1 w-full bg-white rounded-lg border shadow-lg max-h-48 overflow-y-auto">
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
                                            s.label.toLowerCase().includes(state.toLowerCase()) ||
                                            s.value.toLowerCase().includes(state.toLowerCase())
                                        ).map(s => (
                                            <button
                                                key={s.value}
                                                onClick={() => {
                                                    setState(s.label)
                                                    fetchStateResources(s.label)
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                                            >
                                                <span className="font-medium text-gray-900">{s.label}</span>
                                                <span className="ml-2 text-sm text-gray-500">({s.value})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {state && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Medical Resources in {state}
                                        </h3>
                                    </div>

                                    {isLoadingResources ? (
                                        <div className="text-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                                            <p className="text-sm text-gray-500 mt-2">Loading resources...</p>
                                        </div>
                                    ) : stateResources.length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.entries(groupedResources).map(([facilityType, resources]) => (
                                                <div key={facilityType} className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-gray-500" />
                                                        <h4 className="font-medium text-gray-700">
                                                            {facilityType}
                                                        </h4>
                                                        <span className="text-sm text-gray-500">
                                                            ({resources.length})
                                                        </span>
                                                    </div>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {resources.map(resource => (
                                                            <div
                                                                key={resource.id}
                                                                className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200 group cursor-pointer"
                                                            >
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        <h5 className="font-medium text-gray-900 group-hover:text-blue-600">
                                                                            {resource.name}
                                                                        </h5>
                                                                        <p className="text-sm text-gray-500 mt-1">
                                                                            {resource.facility_type}
                                                                        </p>
                                                                    </div>
                                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                            <MapPin className="w-6 h-6 text-gray-400 mx-auto" />
                                            <p className="text-gray-500 mt-2">
                                                No medical resources found for {state}.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
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
                        {/* <p className="text-sm text-gray-500">
                            {new Date(selectedStory.createdAt['$date']).toLocaleDateString()}
                        </p> */}
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedStory.rawText}</p>
                    </div>
                )}
            </Modal>
        </main>
    )
} 