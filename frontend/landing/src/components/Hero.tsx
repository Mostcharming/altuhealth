export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div>
          <div className="badge">Technology-Driven Healthcare Coverage</div>

          <h2>
            Restoring Trust In
            <span> Healthcare Access.</span>
          </h2>

          <p>
            AltuHealth delivers affordable, reliable, and technology-powered
            healthcare coverage solutions for individuals, families, SMEs, and
            enterprises across Nigeria.
          </p>

          <div className="hero-buttons">
            <a href="#plans" className="btn btn-primary">
              Explore Plans
            </a>

            <a
              href="https://wa.me/2348107599978"
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>

            <a
              href="https://yourtelemedicineportal.com"
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk To A Doctor
            </a>
          </div>

          <div className="hero-stats">
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
              <h3>Fast</h3>
              <p>Claims</p>
            </div>

            <div>
              <h3>Digital</h3>
              <p>Access</p>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-card-top">
            <p>Healthcare Innovation</p>
            <h3>Smart Healthcare For Modern Living.</h3>
          </div>

          <div className="hero-card-bottom">
            <div className="hero-item">
              <div className="dot"></div>
              Affordable healthcare plans
            </div>

            <div className="hero-item">
              <div className="dot"></div>
              Digital enrolment systems
            </div>

            <div className="hero-item">
              <div className="dot"></div>
              Telemedicine access
            </div>

            <div className="hero-item">
              <div className="dot"></div>
              Nationwide provider network
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
