"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { Brain, Users, Clock, BookOpen, FileQuestion } from "lucide-react"

export default function LandingPage() {
  const { isAuthenticated, loginWithPopup } = useAuth0()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/home")
    }
    localStorage.setItem("demoMode", "False")
  }, [isAuthenticated, router])

  const handleLogin = async () => {
    try {
      localStorage.setItem("demoMode", "False")
      await loginWithPopup({
        authorizationParams: {
          screen_hint: "signin",
        },
      })
      router.push("/home")
    } catch (error) {
      console.error("Error during login:", error)
      alert("Failed to log in. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105">
            <Brain className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">neuro86</span>
          </Link>
          <Button
            variant="ghost"
            className="text-black hover:text-purple-600 hover:bg-transparent transition-colors duration-300"
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-20 lg:py-24 relative">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-left">
                <div className="inline-block bg-purple-100 text-purple-600 px-4 py-1.5 rounded-full text-sm font-medium animate-bounce-slow">
                  Community Support
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-gray-900 leading-tight">
                  Find Support for <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                    Meningioma Journey
                  </span>
                </h1>
                <p className="text-xl text-gray-600 max-w-xl">
                  Get answers, explore real stories, and connect with a
                  community that understands because no one should face this
                  journey alone.
                </p>
                <div className="space-y-6">
                  <Link href="/tutorial">
                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Begin your Journey
                      <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:block relative">
                <div className="bg-purple-100/50 rounded-full w-72 h-72 absolute -top-10 -right-10 animate-blob"></div>
                <div className="bg-pink-100/50 rounded-full w-56 h-56 absolute bottom-0 -left-10 animate-blob animation-delay-2000"></div>
                <div className="relative z-10 flex justify-center items-center">
                  <Users className="h-48 w-48 text-purple-600 animate-float" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you will get Section */}
        <section className="w-full py-20 bg-[#F8F7FC]">
          <div className="container px-4 md:px-6">
            <h2 className="text-4xl font-semibold text-gray-900 mb-16">What you will get</h2>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="bg-purple-600 p-3 h-fit rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Answers to Your Toughest Questions</h3>
                  <p className="text-gray-600">
                    Why do I feel dizzy after surgery? Can I eat ice cream now?" Get answers to the questions you
                    hesitate to ask elsewhere.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-purple-600 p-3 h-fit rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">A Community That Gets It</h3>
                  <p className="text-gray-600">
                    Connect anonymously with people who truly understand what you're going through.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-purple-600 p-3 h-fit rounded-lg">
                  <FileQuestion className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
                  <p className="text-gray-600">Explore stories and advice tailored to your unique needs.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-purple-600 p-3 h-fit rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Trusted Resources</h3>
                  <p className="text-gray-600">
                    Find hospitals, state-specific services, and expert-approved information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 flex flex-col items-center justify-center text-center">
          <Button
            size="lg"
            onClick={handleLogin}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xl px-12 py-6 rounded-full shadow-lg transition-all duration-300"
          >
            Begin your Journey
          </Button>
          <p className="mt-6 text-gray-600 text-lg">Take the first step toward support and answers.</p>
        </section>
      </main>

      <footer className="border-t py-8 bg-white">
        <div className="container flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500 max-w-2xl">
            <strong>Disclaimer:</strong> This platform is meant to help you track your journey and connect with others.
            It's not intended for diagnosis or treatment.
          </p>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} neuro86. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

