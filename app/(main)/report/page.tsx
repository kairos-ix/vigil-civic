import { ReportForm } from '@/components/issues/ReportForm'

export default function ReportPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">
          Take a photo of a civic issue and our AI will help you fill in the details.
        </p>
      </div>
      
      <ReportForm />
    </div>
  )
}
