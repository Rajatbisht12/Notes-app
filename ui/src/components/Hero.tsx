// components/Hero.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Notebook, Bookmark, ShieldCheck } from 'lucide-react'

const Hero = () => {
  return (
    <div className="min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full px-6 py-2 mb-6">
            <ShieldCheck className="h-5 w-5 mr-2" />
            <span>Secure & Private</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Organize Your Thoughts & Resources
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A modern notes and bookmarks organizer that keeps your data secure and accessible from anywhere.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FeatureCard 
            icon={<Notebook className="h-10 w-10 text-indigo-600" />}
            title="Smart Notes"
            description="Create, organize, and search your notes with powerful tagging and search capabilities."
          />
          <FeatureCard 
            icon={<Bookmark className="h-10 w-10 text-indigo-600" />}
            title="Bookmark Manager"
            description="Save web pages with auto-generated titles and organize them with tags."
          />
        </div>
      </div>
    </div>
  )
}

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) => (
  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

export default Hero