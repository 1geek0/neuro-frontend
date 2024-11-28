import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth0 } from '@auth0/auth0-react'
import { useDemoContext } from '@/context/context'

export function useAuthRedirect() {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useAuth0()
    const { demo } = useDemoContext()
    useEffect(() => {
        if (!isLoading && !isAuthenticated && !demo) {
            router.push('/')
        }
    }, [isLoading, isAuthenticated, router])
} 