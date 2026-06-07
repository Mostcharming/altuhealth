import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Plans from "@/components/Plans";
import Services from "@/components/Services";
import Team from "@/components/Team";
import CTA from "@/components/CTA";
import Chatbox from "@/components/Chatbox";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Plans />
      <Services />
      <Team />
      <CTA />
      <Chatbox />
      <Footer />
    </>
  );
}
