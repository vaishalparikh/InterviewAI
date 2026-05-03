import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoWall from "@/components/LogoWall";
import Features from "@/components/Features";
import ProductShot from "@/components/ProductShot";
import Privacy from "@/components/Privacy";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main>
        <Hero />
        <LogoWall />
        <Features />
        <ProductShot />
        <Privacy />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
