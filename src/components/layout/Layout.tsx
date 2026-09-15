import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InteractiveBackground } from '@/components/InteractiveBackground'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <InteractiveBackground />
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          <Header />
          <ScrollArea className="flex-1">
            <main className="p-6 min-h-full box-border">
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
