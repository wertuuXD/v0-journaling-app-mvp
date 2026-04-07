import { JournalApp } from "@/components/journal/journal-app"
import { ErrorBoundary } from "@/components/error-boundary"

export default function Page() {
  return (
    <ErrorBoundary>
      <JournalApp />
    </ErrorBoundary>
  )
}
