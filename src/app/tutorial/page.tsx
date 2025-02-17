'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Brain, ArrowRight, Search, MapPin, ChevronDown, ChevronRight, X, Building2, Loader2, Users } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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

export default function TutorialPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [state, setState] = useState('')
  const [research, setResearch] = useState<Research[]>([])
  const [isLoadingResearch, setIsLoadingResearch] = useState(true)
  const [researchError, setResearchError] = useState<string | null>(null)
  const [stateResources, setStateResources] = useState<StateResource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [currentResearchIndex, setCurrentResearchIndex] = useState(0)

  useEffect(() => {
    const fetchResearch = async () => {
      setIsLoadingResearch(true)
      setResearchError(null)
      try {
        const response = await fetch('/api/public-research')
        if (!response.ok) {
          throw new Error('Failed to fetch research data')
        }
        const data = await response.json()
        setResearch(data)
      } catch (error) {
        console.error('Error fetching research:', error)
        setResearchError('Unable to load research. Please try again later.')
      } finally {
        setIsLoadingResearch(false)
      }
    }

    fetchResearch()
  }, [])

  /*
  const fetchStateResources = (selectedState: string) => {
    setIsLoadingResources(true)
    setStateResources([])
    fetch(`/api/state-resources/${encodeURIComponent(selectedState)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch state resources')
        }
        return response.json()
      })
      .then(data => {
        setStateResources(data)
      })
      .catch(error => {
        console.error('Error fetching state resources:', error)
        setResearchError('Unable to load state resources. Please try again later.')
      })
      .finally(() => {
        setIsLoadingResources(false)
      })
  }
  */

  const navigateResearch = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setCurrentResearchIndex(prev => 
        prev > 0 ? prev - 1 : research.length - 1
      )
    } else {
      setCurrentResearchIndex(prev => 
        prev < research.length - 1 ? prev + 1 : 0
      )
    }
  }

  const slides = [
    {
      image: '/1. Take the First Step.png',
      alt: "Start your journey with Neuro86"
    },
    {
      image: '/2. Discover How Neuro86 Can Help You.png',
      alt: "Explore Neuro86's personalized tools"
    },
    {
      image: '/3. Join Our Family.png',
      alt: "Connect with the Neuro86 community"
    },
    {
      image: '/4. Experience a Preview.png',
      alt: "Preview Neuro86's powerful features"
    },
    {
      image: '/5. Connect and Share.png',
      alt: "Share your story with others"
    },
    {
      image: '/6. Write Your Story.png',
      alt: "Record your personal journey"
    },
    {
      image: '/7. Visualize Your Progress.png',
      alt: "Track and visualize your milestones"
    },
    {
      image: '/8. Find Local Support.png',
      alt: "Locate support resources near you"
    },
    {
      image: '/9. Embrace the Journey Ahead.png',
      alt: "Look forward to a brighter future"
    }
  ];
  
  const questions = {
    before: [
      "What are the risks I should discuss with my doctor?",
      "What foods should I avoid before surgery?",
      "How should I prepare my home for post-surgery recovery?",
      "What medications should I stop taking before surgery?"
    ],
    after: [
      "What physical activities are safe after surgery?",
      "When can I return to work?",
      "What symptoms should prompt me to call the doctor?",
      "How often will I need follow-up scans?"
    ],
    during: [
      "What side effects are normal vs concerning?",
      "How can I manage treatment-related fatigue?",
      "What dietary changes are recommended?",
      "When should I seek emergency care?"
    ]
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

  // Pagination for research
  const [currentPage, setCurrentPage] = useState(1)
  const researchPerPage = 5 // Typical number of research items per page

  // Paginated research items
  const paginatedResearch = research.slice(
    (currentPage - 1) * researchPerPage, 
    currentPage * researchPerPage
  )

  // Calculate total pages
  const totalPages = Math.ceil(research.length / researchPerPage)

  // Pagination handlers
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <span className="text-xl font-semibold text-gray-900">neuro86</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              See How Neuro86 Can Help You
            </h1>

            {/* Image Carousel */}
            <div className="relative mb-12">
              <button
                onClick={() =>
                  setCurrentSlide((prev) =>
                    prev === 0 ? slides.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <div className="relative aspect-[4/3] max-w-2xl mx-auto">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].alt}
                  className="rounded-xl shadow-lg"
                />
              </div>
              <button
                onClick={() =>
                  setCurrentSlide((prev) =>
                    prev === slides.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="flex justify-center gap-2 mt-4">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === index
                        ? "bg-purple-600 w-8"
                        : "bg-purple-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Community and Features Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-16">
              <div className="max-w-xl mx-auto space-y-8">
                <button
                  onClick={() => router.push("/onboarding")}
                  className="bg-purple-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Join Our Community
                </button>

                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="bg-purple-50 rounded-full p-3 inline-block mb-2">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Connect with Others
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-50 rounded-full p-3 inline-block mb-2">
                      <Search className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Access Resources
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-purple-50 rounded-full p-3 inline-block mb-2">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Find Local Support
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm">
                  Browse anonymously or join to share your story
                </p>
              </div>
            </div>

            
            {/* Questions Section */}
            <section className="max-w-4xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Discover the Questions That Matter Most
              </h2>
              <p className="text-gray-600 mb-6">
                Explore the top questions asked by people navigating their
                meningioma journey.
              </p>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="before"
                  className="bg-white rounded-lg shadow-sm"
                >
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-gray-50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                    Top Questions to Ask Before Surgery
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <ul className="space-y-2">
                      {questions.before.map((q, i) => (
                        <li key={i} className="text-gray-600">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="after"
                  className="bg-white rounded-lg shadow-sm"
                >
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-gray-50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                    Top Questions to Ask After Surgery
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <ul className="space-y-2">
                      {questions.after.map((q, i) => (
                        <li key={i} className="text-gray-600">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="during"
                  className="bg-white rounded-lg shadow-sm"
                >
                  <AccordionTrigger className="px-6 hover:no-underline hover:bg-gray-50 rounded-t-lg [&[data-state=open]]:rounded-b-none">
                    Top Questions to Ask During/After Treatment
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <ul className="space-y-2">
                      {questions.during.map((q, i) => (
                        <li key={i} className="text-gray-600">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
              <p className="italic">
                Disclaimer: This platform is meant to help you track your
                journey and connect with others. It is not intended for diagnosis
                or treatment.
              </p>
              <p className="mt-2">{new Date().getFullYear()} neuro86. All rights reserved.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
