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
              To become Africa&apos;s most trusted technology-driven healthcare
              organization, delivering accessible, affordable, and innovative
              healthcare coverage solutions that improve lives and transform
              healthcare experiences globally.
            </p>

            <h3>Our Mission</h3>

            <p>
              To simplify healthcare access through technology, strategic
              partnerships, customer-centered innovation, and reliable
              healthcare management systems that empower individuals, families,
              and organizations.
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
