import Header from './components/Header'
import Hero from './components/Hero'
import Story from './components/Story'
import Lens from './components/Lens'
import Stages from './components/Stages'
import Marquee from './components/Marquee'
import Daily from './components/Daily'
import Focus from './components/Focus'
import Team from './components/Team'
import Tools from './components/Tools'
import Fit from './components/Fit'
import Faq from './components/Faq'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ContactModal from './components/ContactModal'
import { startVisitor } from './lib/visitor'

startVisitor()
import useIsMobile from './hooks/useIsMobile'

function App() {
  // Sections measure their own refs on mount; remount them when the layout switches between phone and desktop.
  const isMobile = useIsMobile()
  return (
    <main key={isMobile ? 'mobile' : 'desktop'} className="relative w-full overflow-x-clip bg-ink">
      <Header />
      <Hero />
      <Story />
      <Lens />
      <Stages />
      <Marquee />
      <Daily />
      <Focus />
      <Team />
      <Tools />
      <Fit />
      <Faq />
      <Contact />
      <Footer />
    </main>
  )
}

function Root() {
  return (
    <>
      <App />
      <ContactModal />
    </>
  )
}

export default Root
