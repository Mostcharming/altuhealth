import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div>
          <h2>
            Healthcare Coverage for Nigerians at Home and Loved Ones Abroad
          </h2>

          <p className="hero-description">
            Whether you live in Nigeria or anywhere in the world, AltuHealth
            makes it easy to protect the people who matter most.
          </p>

          <p className="hero-description">
            We provide trusted, technology-driven healthcare coverage for
            individuals, families, businesses, and Nigerians in the diaspora
            who want quality healthcare for their loved ones back home.
          </p>

          <p className="hero-tagline">
            Affordable. Reliable. Nationwide. Available 24/7.
          </p>

          <div className="hero-buttons">
            <a href="#plans" className="btn btn-primary">
              Explore Plans
            </a>

            <Link
              href="/?planCategory=retail#plans"
              className="btn btn-outline"
            >
              Buy for Family in Nigeria
            </Link>

            <Link href="/contact" className="btn btn-outline">
              Talk to an Advisor
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="AltuHealth care overview">
          <img
            src="/images/altuhealth/hero-care-access.png"
            alt="Care coordinator helping a family access healthcare coverage"
          />
          <div className="hero-visual-card hero-visual-card-top">
            <strong>24/7</strong>
            <span>Support Available</span>
          </div>
          <div className="hero-visual-card hero-visual-card-bottom">
            <strong>Fast</strong>
            <span>Digital Claims</span>
          </div>
        </div>
      </div>

      <div className="container hero-stats">
        <div>
          <h3>1,500+</h3>
          <p>Hospitals</p>
        </div>

        <div>
          <h3>2,500+</h3>
          <p>Pharmacies</p>
        </div>

        <div>
          <h3>24/7</h3>
          <p>Support</p>
        </div>

        <div>
          <h3>Digital</h3>
          <p>Access</p>
        </div>
      </div>
    </section>
  );
}
