// components/Navbar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Home, Bookmark, Notebook, Search } from 'lucide-react'

const Navbar = () => {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-xl font-bold text-indigo-600">
              <Notebook className="h-6 w-6 mr-2" />
              NoteApp
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Home size={16} />} active={isActive('/')}>
              Dashboard
            </NavLink>
            <NavLink href="/notes" icon={<Notebook size={16} />} active={isActive('/notes')}>
              Notes
            </NavLink>
            <NavLink href="/bookmarks" icon={<Bookmark size={16} />} active={isActive('/bookmarks')}>
              Bookmarks
            </NavLink>
          </div>
          
          <div className="flex items-center space-x-4">
            <SignedIn>
              <Link href="/search">
                <Button variant="outline" size="icon">
                  <Search size={16} />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  )
}

const NavLink = ({ 
  href, 
  children, 
  icon, 
  active 
}: { 
  href: string; 
  children: React.ReactNode; 
  icon: React.ReactNode;
  active: boolean; 
}) => (
  <Link href={href}>
    <Button 
      variant={active ? "secondary" : "ghost"} 
      className={`flex items-center ${active ? 'bg-indigo-50 text-indigo-700' : ''}`}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </Button>
  </Link>
)

export default Navbar