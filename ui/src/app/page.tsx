// app/page.tsx
import { SignedIn, SignedOut } from '@clerk/nextjs'
import Dashboard from '@/components/Dashboard'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <div>
      <SignedOut>
        <Hero />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </div>
  )
}