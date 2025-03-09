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
                          <div className="mt-2 p-2 bg-gray-100 rounded-md">
                            {/* Answer space for question {i + 1} */}
                            <p className="text-gray-500">
                              {i === 0 && "Surgery may carry certain concerns, but understanding them can ease your mind. Common risks might involve mild swelling, infection, or reactions to anesthesia. The good news is that complications are often rare, and many patients recover well. By talking openly with your medical team, you'll feel more informed, supported, and confident about your next steps, knowing they will guide you every step of the way."}
                              {i === 1 && "Preparing for surgery includes a few adjustments to your diet, such as limiting heavy meals or alcohol. Your doctor may also suggest avoiding certain supplements. While it might feel restrictive, remember these steps help ensure a smoother operation. Following specific guidelines, including any fasting instructions, helps your body stay ready for a safe, successful surgery, and supports your overall well being."}
                              {i === 2 && "Setting up your home in advance makes recovery more comfortable and less stressful. Consider creating a cozy rest area with easy access to the bathroom, kitchen, and any medical supplies. Removing tripping hazards, organizing daily essentials within reach, and asking loved ones for help can make a big difference. With some planning, you'll have a safer space that supports smooth healing."}
                              {i === 3 && "Always share a detailed list of your medications and supplements with your doctor, so they can offer clear guidance. Certain medicines, like blood thinners or specific pain relievers, may need a brief pause before surgery. This precaution lowers the risk of complications and ensures a smoother procedure. By staying informed and working closely with your medical team, you can feel confident in your treatment plan."}
                            </p>
                          </div>
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
                          <div className="mt-2 p-2 bg-gray-100 rounded-md">
                            {/* Answer space for question {i + 1} */}
                            <p className="text-gray-500">
                              {i === 0 && "Light, gentle movements like short walks often help with blood flow and healing. Your doctor may suggest simple exercises or physical therapy to gradually rebuild strength. It's best to avoid heavy lifting or strenuous workouts until your care team says it's safe, so you can focus on healing at a comfortable pace."}
                              {i === 1 && "Recovery time varies from person to person, so your doctor's guidance is key. Many people start with part-time hours or lighter tasks before returning to their regular schedule. Communication with your employer, along with a flexible plan, can ensure you make a gradual, balanced transition back to work."}
                              {i === 2 && "A little discomfort or mild headaches can be normal, but more serious concerns like increased pain, swelling, or sudden changes in vision or speech are reasons to call right away. If something feels off or if you have a fever, never hesitate to reach out—timely support can give you peace of mind."}
                              {i === 3 && "Most doctors recommend periodic imaging to keep track of your recovery and watch for any signs of regrowth. These scans might be done every few months or annually, depending on your specific case. Keeping up with these check-ups helps your medical team provide the best care and reassurance for your long-term health."}
                            </p>
                          </div>
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
                          <div className="mt-2 p-2 bg-gray-100 rounded-md">
                            {/* Answer space for question {i + 1} */}
                            <p className="text-gray-500">
                              {i === 0 && "Some mild headaches, fatigue, or slight dizziness can be common after meningioma treatment. However, any sudden changes in strength, speech, or vision should be reported right away. If you experience unusually severe pain, persistent vomiting, or fever, you should also call your doctor. Your medical team is here to guide you, so never hesitate to reach out if something feels unusual."}
                              {i === 1 && "Fatigue is a common part of the healing process, but there are ways to make it more manageable. Start by pacing yourself and allowing for short naps or rest periods throughout the day. Balancing movement with rest can boost energy levels over time. Staying hydrated, eating nutritious foods, and talking to your doctor about vitamins or gentle exercises can also help."}
                              {i === 2 && "A balanced, nutrient rich diet can support recovery and overall health. Many patients benefit from including lean protein sources, fruits, and vegetables in their daily meals. Staying hydrated is equally important, so make sure to drink enough water. You may want to limit sugary or heavily processed foods. If you have any special dietary needs or concerns, consider consulting with a nutrition specialist who can offer personalized advice."}
                              {i === 3 && "While mild discomfort can be normal during recovery, it is crucial to recognize signs that need immediate attention. These might include sudden or severe headaches, confusion, trouble speaking or moving, and any rapid changes in alertness or consciousness. If you have escalating pain, unstoppable bleeding, or intense dizziness, do not hesitate to seek emergency care. Early intervention can make a significant difference in your well being."}
                            </p>
                          </div>
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
