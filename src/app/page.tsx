'use client'

import Link from 'next/link'
import { useAuth0 } from '@auth0/auth0-react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Users, FileQuestion, BookOpen, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const { isAuthenticated, loginWithPopup } = useAuth0()
  const router = useRouter()

  const handleLogin = async () => {
    try {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <header className="px-4 lg:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <Brain className="h-8 w-8 text-purple-600" />
          <span className="ml-2 text-2xl font-bold text-purple-600">neuro86</span>
        </Link>
        {!isAuthenticated && (
          <button
            onClick={handleLogin}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200 ease-in-out"
          >
            Sign In
          </button>
        )}
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient">
                  Find Support and Connect with Others Facing Meningioma
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-2xl/relaxed">
                  Welcome to <span className="font-bold text-purple-600">neuro86</span> – Your Anonymous Community for Navigating Life with Meningioma
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="w-full py-20 md:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-600 transition-transform hover:scale-105">
                  Community Support
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-gray-900">
                  Living with meningioma can feel overwhelming, but you don't have to go through it alone.
                </h2>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <p className="text-gray-600 md:text-xl/relaxed lg:text-2xl/relaxed">
                  <span className="font-bold text-purple-600">neuro86</span> is a safe, anonymous space where you can share your experiences,
                  connect with others, and find the support you need on your journey.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Cards Section */}
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              <Card className="p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Share Your Story Anonymously</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Open up about your experiences without revealing your identity</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Inspire and support others on a similar journey</span>
                  </li>
                </ul>
              </Card>
              <Card className="p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
                <div className="flex items-center space-x-4">
                  <FileQuestion className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Ask Your Questions Freely</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Get answers to questions you might hesitate to ask your doctor</span>
                  </li>
                  <li className="pl-6 text-sm italic">- "Can I eat ice cream two weeks after surgery?"</li>
                  <li className="pl-6 text-sm italic">- "Why do I get headaches when I take this medication and go for a walk?"</li>
                </ul>
              </Card>
              <Card className="p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
                <div className="flex items-center space-x-4">
                  <Users className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Connect with People Like You</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Find others who understand what you're going through</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Build a network of support and friendship</span>
                  </li>
                </ul>
              </Card>
              <Card className="p-6 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105">
                <div className="flex items-center space-x-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Access Helpful Resources</h3>
                </div>
                <ul className="mt-4 space-y-2 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Discover hospitals and state-based services near you</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                    <span>Stay informed with the latest research and information on meningioma</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </section>
        {/* Call to Action Section */}
        <section className="w-full py-20 md:py-32 bg-purple-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                  You're Not Alone
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl/relaxed lg:text-2xl/relaxed">
                  Join <span className="font-bold text-purple-600">neuro86</span> today and be part of a community that understands. 
                  Share, learn, and find the support you deserve.
                </p>
              </div>
              <Link href="/onboarding">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-3 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105">
                  Join the Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-white py-8">
        <div className="container px-4 md:px-6">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-4">
              <strong>Disclaimer:</strong> This is not for diagnosis. The platform is meant to help you track your journey
              and connect with others. It's not intended for diagnosis or treatment.
            </p>
            <p>© {new Date().getFullYear()} neuro86. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

