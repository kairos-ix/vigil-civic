import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-sm py-5 mt-auto shrink-0 relative z-10">
      <div className="container mx-auto px-4 flex flex-col items-center gap-1.5 text-xs text-muted-foreground text-center">
        <p>
          © {new Date().getFullYear()} Vigil Civic Platform. Built by <Link target='_blank' rel="noopener noreferrer" href="https://sahilmauryadev.com/" className="font-medium hover:text-foreground hover:underline transition-colors font-semibold">Sahil Maurya (kairos)</Link>.
        </p>
        <p className="text-[12px] font-semibold opacity-80">
          Hackathon prototype • Not a production application
        </p>
      </div>
    </footer>
  )
}
