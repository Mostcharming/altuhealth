export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="container hero-grid">
        <div>
          <div className="badge">Built on trust and secure access</div>

          <h2>
            Healthcare Coverage For
            <span> Modern Families.</span>
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
        </div>

        <div className="hero-visual" aria-label="AltuHealth care overview">
          <img src="/images/cards/card-01.jpg" alt="Healthcare professional" />
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
