export default function Services() {
  const featuredServices = [
    {
      name: "Health Insurance Plans",
      description:
        "Flexible HMO plans tailored for individuals, families, SMEs, and corporates.",
      image: "/images/altuhealth/service-healthcare-analytics.png",
    },
    {
      name: "Claims Management",
      description:
        "Fast, transparent, and fully digital claims process.",
      image: "/images/altuhealth/service-digital-claims.png",
    },
    {
      name: "Telemedicine",
      description:
        "See a doctor anytime, anywhere with our e-health solutions.",
      image: "/images/altuhealth/service-telemedicine.png",
    },
  ];

  const additionalServices = [
    {
      initials: "PN",
      name: "Provider Network Access",
      description:
        "Wide access to hospitals, clinics, and diagnostic centers nationwide.",
    },
    {
      initials: "PH",
      name: "Preventive Health",
      description:
        "Screenings, checkups, and health education to keep you ahead.",
    },
    {
      initials: "CC",
      name: "Care Coordination",
      description:
        "Personalized support for chronic and special health conditions.",
    },
    {
      initials: "TPA",
      name: "Third Party Administration",
      description:
        "Efficient management of health insurance claims and benefits to ensure smooth and transparent processing.",
    },
    {
      initials: "PES",
      name: "Pre & Intra Employment Screening",
      description:
        "Comprehensive health assessments to support safe, compliant, and informed hiring and employee monitoring decisions.",
    },
    {
      initials: "HC",
      name: "Healthcare Consulting",
      description:
        "Expert guidance to optimize healthcare strategies, improve service delivery, and enhance overall health system performance.",
    },
  ];

  return (
    <section id="services">
      <div className="container">
        <div className="section-title">
          <span>Our Services</span>
          <h2>Technology Meets Healthcare Excellence.</h2>
          <p>
            Smart healthcare for a healthier tomorrow. At Altu Health, we go
            beyond health insurance to deliver complete healthcare solutions
            that put your needs first.
          </p>
        </div>

        <div className="feature-layout">
          <div className="feature-image">
            <img
              src="/images/altuhealth/services-telemedicine-care.png"
              alt="Patient using telemedicine services from home"
            />
          </div>

          <div className="service-grid">
            {featuredServices.map((service) => (
              <article key={service.name} className="service-card">
                <img src={service.image} alt="" />
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="additional-services">
          <div className="additional-services-heading">
            <span>Complete Care Solutions</span>
            <h3>More ways we support better health outcomes.</h3>
          </div>

          <div className="additional-service-grid">
            {additionalServices.map((service) => (
              <article key={service.name} className="additional-service-card">
                <span className="service-initials" aria-hidden="true">
                  {service.initials}
                </span>
                <div>
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
