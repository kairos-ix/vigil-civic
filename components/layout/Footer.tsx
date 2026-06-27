import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t bg-card py-6 pb-24 lg:pb-6 mt-auto shrink-0 relative z-10">
      <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-sm text-muted-foreground text-center">
        <div>
          © {new Date().getFullYear()} Vigil Civic Platform. All rights reserved.<br/>
          Made by <Link target='_blank' rel="noopener noreferrer" href="https://sahilmauryadev.com/" className="hover:text-foreground hover:underline font-medium transition-colors">Sahil Maurya (kairos)</Link>.<br/>
          <strong>Disclaimer: This is a hackathon project prototype, not a production-ready real application.</strong>
        </div>
      </div>
    </footer>
  )
}
