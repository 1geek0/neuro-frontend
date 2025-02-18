'use client'

import { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/navigation'
// import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Modal } from '@/components/Modal'
import { useAuth0 } from '@auth0/auth0-react'
import { LogOut, Loader2, MapPin, Building2, ChevronRight, Search, X, Brain, ArrowRight } from 'lucide-react'
import { useAuthRedirect } from '@/hooks/useAuthRedirect'
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch'
import { demoSimilarStories } from '@/Demo/demoSimilarStories'

const SUBREDDIT_URL = 'https://www.reddit.com/r/Neuro86_Community/';

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
    useAuthRedirect();
    const [similarStories, setSimilarStories] = useState<Story[]>([])
    const [isLoadingSimilarStories, setIsLoadingSimilarStories] = useState<Boolean>(false);
    const [research, setResearch] = useState<Research[]>([])
    const [isLoadingResearch, setIsLoadingResearch] = useState<Boolean>(false);
    const [state, setState] = useState('')
    const router = useRouter()
    const [selectedStory, setSelectedStory] = useState<Story | null>(null)
    const { logout, user } = useAuth0()
    const authenticatedFetch = useAuthenticatedFetch()
    const [stateResources, setStateResources] = useState<StateResource[]>([])
    const [isLoadingResources, setIsLoadingResources] = useState(false)
    const [isLoadingSSO, setIsLoadingSSO] = useState(false);
    const [demoMode, setDemoMode] = useState<Boolean>(false);
    const { loginWithPopup } = useAuth0()


    useEffect(() => {
        let isMounted = true
        if (localStorage.getItem('demoMode') === 'True') {
            setDemoMode(true);
        }

        const fetchData = async () => {
            try {
                setIsLoadingResources(true);
                setIsLoadingSimilarStories(true);
                setIsLoadingResearch(true);
                const [storiesRes, researchRes] = await Promise.all([
                    authenticatedFetch('/api/similar-stories'),
                    authenticatedFetch('/api/research')
                ]);

                // Log raw responses for debugging
                console.log('Stories Response:', storiesRes);
                console.log('Research Response:', researchRes);

                // Check if responses are ok before parsing
                if (!storiesRes.ok) {
                    const errorText = await storiesRes.text();
                    console.error('Stories Fetch Error:', errorText);
                    throw new Error(`Stories fetch failed: ${errorText}`);
                }

                if (!researchRes.ok) {
                    const errorText = await researchRes.text();
                    console.error('Research Fetch Error:', errorText);
                    throw new Error(`Research fetch failed: ${errorText}`);
                }

                // Safely parse JSON
                let stories, researchData;
                try {
                    stories = await storiesRes.json();
                    researchData = await researchRes.json();
                } catch (jsonError) {
                    console.error('JSON Parsing Error:', jsonError);
                    console.log('Stories Raw:', await storiesRes.text());
                    console.log('Research Raw:', await researchRes.text());
                    throw new Error('Failed to parse JSON response');
                }

                if (isMounted) {
                    const additionalStories = researchData
                        .filter((item: Research) =>
                            item.resource_type === 'Individual Patient Story' ||
                            item.resource_type === 'Communities'
                        )
                        .map((item: Research) => ({
                            ...item,
                            rawText: item.content
                        }));

                    const medicalResearch = researchData.filter((item: Research) =>
                        item.resource_type === 'Medical Research'
                    );

                    setSimilarStories([...stories, ...additionalStories]);
                    setResearch(medicalResearch);
                }
            } catch (error) {
                console.error('Comprehensive Fetch Error:', error);
                // Optionally set an error state to show user-friendly message
                // setFetchError(true);
            } finally {
                setIsLoadingResources(false);
                setIsLoadingSimilarStories(false);
                setIsLoadingResearch(false);
            }
        };

        if (localStorage.getItem('demoMode') === 'True') {
            setSimilarStories(demoSimilarStories);
            const fetchPublicResearch = async () => {
                try {
                    setIsLoadingResearch(true);
                    const research = await fetch('/api/public-research');
                    if (!research.ok) {
                        throw new Error("Failed to fetch research");
                    }
                    const data = await research.json();
                    // Showing just two researches for now
                    const medicalResearch = data.slice(0, 2);
                    setResearch(medicalResearch);
                }
                catch (error) {
                    console.error("Error while fetching public research on Demo Mode, ", error);
                } finally {
                    setIsLoadingResearch(false);
                }
            }

            fetchPublicResearch();
        } else {
            fetchData();
        }

        return () => {
            isMounted = false;
        };
    }, []); // This effect runs only once when component mounts

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const params = new URLSearchParams(window.location.search);
        const sso = params.get('sso');
        const sig = params.get('sig');

        if (sso && sig) {
            const handleSSOCallback = async () => {
                setIsLoadingSSO(true);
                try {
                    const response = await authenticatedFetch('/api/discourse/sso', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ sso, sig })
                    });

                    if (response.ok) {
                        const { ssoUrl } = await response.json();
                        // Clear SSO parameters from URL
                        window.history.replaceState({}, '', '/home');
                        // Redirect to Discourse with SSO parameters
                        window.location.href = ssoUrl;
                    } else {
                        const error = await response.text();
                        console.error('Failed to create SSO link:', error);
                        setIsLoadingSSO(false);
                    }
                } catch (error) {
                    console.error('Error handling SSO callback:', error);
                    setIsLoadingSSO(false);
                }
            };

            handleSSOCallback();
        }
    }, []); // Run once on mount, but check URL params inside

    // const handleDiscourseSSO = async () => {
    //     if (!user) return;

    //     try {
    //         setIsLoadingSSO(true);
    //         if (typeof window !== 'undefined') {
    //             window.location.href = `${DISCOURSE_URL}/session/sso`;
    //         }
    //     } catch (error) {
    //         console.error('Error during SSO:', error);
    //         setIsLoadingSSO(false);
    //     }
    // };

    const handleLogout = async () => {
        try {
            // Clear session cookie - fixed to include domain and secure flags
            if (typeof window !== 'undefined') {
                document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname + '; secure; samesite=strict';
                localStorage.setItem('demoMode', 'False');
                // Auth0 logout and redirect

                if (!demoMode) {
                    await logout({
                        logoutParams: {
                            returnTo: window.location.origin
                        }
                    })
                    // Force navigation to home
                    router.push('/')
                } else {
                    router.push('/onboarding')
                }
            }

        } catch (error) {
            console.error('Error during logout:', error);
        }
    };


    const fetchStateResources = async (selectedState: string) => {
        setIsLoadingResources(true)
        try {
            const response = await fetch(`/api/state-resources/${selectedState}`)
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

    const handleLogin = async () => {
        try {
            localStorage.setItem('demoMode', 'False');
            // Trigger Auth0 login
            await loginWithPopup({
                authorizationParams: {
                    screen_hint: 'signin',
                }
            });
            router.push('/home');
        } catch (error) {
            console.error('Error during login:', error);
            alert('Failed to log in. Please try again.');
        }
        window.location.reload();
    };
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
        <main className="min-h-screen bg-gradient-to-b from-white to-purple-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm px-4 lg:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center transition-all duration-300 hover:scale-105">
                    <Brain className="h-7 w-7 text-purple-600" />
                    <span className="ml-2 text-xl font-bold text-purple-600 tracking-tight">neuro86</span>
                </div>


                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.open(SUBREDDIT_URL, '_blank')}
                        className="bg-purple-100 text-purple-600 rounded-lg px-4 py-2 hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center gap-2 font-medium"
                    >
                        Go to Forum
                        {/* <ArrowRight className="h-4 w-4" /> */}
                    </button>
                    <button
                        onClick={() => router.push('/notes')}
                        className="bg-purple-100 text-purple-600 rounded-lg px-4 py-2 hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center gap-2 font-medium"
                    >
                        My Story
                        {/* <ArrowRight className="h-4 w-4" /> */}
                    </button>
                    {demoMode && (
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105"
                        >
                            Sign In
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105"
                    >
                        <LogOut className="w-4 h-4" />
                        {demoMode ? 'Quit Demo Mode' : 'Logout'}
                    </button>
                </div>
            </header>
            {isLoadingSSO ? (
                <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Logging into Discourse...</p>
                    </div>
                </div>
            ) : null}
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Similar Stories Section */}
                    <section className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Find people with stories like you</h2>
                        <div className="space-y-4">
                            {isLoadingSimilarStories ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                                    <p className="text-sm text-gray-500 mt-2">Loading similar stories...</p>
                                </div>
                            ) :
                                similarStories.map((story, index) => {
                                    console.log(story);
                                    return (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                                            onClick={() => setSelectedStory(story)}
                                        >
                                            <h3 className="font-semibold mb-2 text-gray-900">{story.title}</h3>
                                            <p className="line-clamp-3 text-gray-900">{story.rawText}</p>
                                            {story.link && (
                                                <div className="flex justify-between items-end mt-2">
                                                    <button
                                                        onClick={() => setSelectedStory(story)}
                                                        className="text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:tracking-wider flex items-center gap-2"
                                                    >
                                                        Read More <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                    <a
                                                        href={story.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:tracking-wider flex items-center gap-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View original post <ChevronRight className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            )}
                                            {!story.link && (
                                                <button
                                                    onClick={() => setSelectedStory(story)}
                                                    className="text-purple-600 hover:text-purple-800 font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:tracking-wider flex items-center gap-2 mt-2"
                                                >
                                                    Read More <ChevronRight className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    )
                                })
                            }
                            {/* <button
                                onClick={() => window.open(SUBREDDIT_URL, '_blank')}
                                className="w-full bg-purple-100 text-purple-600 rounded-lg p-3 hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center gap-2 font-medium"
                            >
                                Go to Forum <ArrowRight className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() => router.push('/notes')}
                                className="w-full bg-purple-100 text-purple-600 rounded-lg p-3 hover:bg-purple-200 transition-all duration-300 ease-in-out hover:scale-105 flex items-center justify-center gap-2 font-medium"
                            >
                                Add more to your story <ArrowRight className="h-4 w-4" />
                            </button> */}
                        </div>
                    </section>

                    <div className="space-y-8">
                        {/* Research Section */}
                        <section className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Latest Research on Meningioma</h2>
                            <div className="space-y-4">
                                {isLoadingResearch ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-500" />
                                        <p className="text-sm text-gray-500 mt-2">Loading Latest Research...</p>
                                    </div>
                                ) :

                                    research.map((item,) => (
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