export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="section-title">
          <span>About AltuHealth</span>
          <h2>Healthcare Coverage Reimagined.</h2>
          <p>
            We combine healthcare expertise with digital innovation to provide
            reliable medical coverage solutions built for today&apos;s
            fast-moving world.
          </p>
        </div>

        <div className="about-layout">
          <div className="about-copy">
            <h3>Our Vision</h3>

            <p>
              To provide dependable, technology-driven healthcare solutions
              through strong provider networks, exceptional customer service,
              and transparent operations; ensuring every enrolee receives
              timely, affordable, and high-quality care across Nigeria.
            </p>

            <h3>Core Values</h3>

            <p>
              At ALTU HEALTH, our core values guide every decision and action
              as we strive to restore trust in healthcare coverage across
              Nigeria. Accountability, Leadership, Trust, Universal.
            </p>
          </div>

          <div className="about-panel">
            <img
              src="/images/altuhealth/about-care-operations.png"
              alt="Healthcare operations team coordinating coverage and provider support"
            />

            <div className="about-metrics">
              <div>
                <strong>1,500+</strong>
                <span>Hospitals</span>
              </div>
              <div>
                <strong>2,500+</strong>
                <span>Pharmacies</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
