import Header from '@/components/Header';
import Hero from '@/components/Hero';
import DailyOracle from '@/components/DailyOracle';
import MoonCalendar from '@/components/MoonCalendar';
import DreamChat from '@/components/DreamChat';
import DreamHistory from '@/components/DreamHistory';
import SymbolDictionary from '@/components/SymbolDictionary';
import Pricing from '@/components/Pricing';
import Account from '@/components/Account';
import About from '@/components/About';
import Contacts from '@/components/Contacts';
import Footer from '@/components/Footer';
import { DreamWalletProvider } from '@/hooks/use-dream-wallet';

const Index = () => (
  <DreamWalletProvider>
    <div className="grain relative min-h-screen overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <DailyOracle />
        <MoonCalendar />
        <DreamChat />
        <DreamHistory />
        <SymbolDictionary />
        <Pricing />
        <Account />
        <About />
        <Contacts />
      </main>
      <Footer />
    </div>
  </DreamWalletProvider>
);

export default Index;