export default function Services() {
  const services = [
    {
      name: "Telemedicine",
      description:
        "Speak with licensed medical professionals remotely through our secure healthcare platform.",
      image: "/images/altuhealth/service-telemedicine.png",
    },
    {
      name: "Digital Claims",
      description:
        "Fast and transparent claims processing powered by intelligent healthcare systems.",
      image: "/images/altuhealth/service-digital-claims.png",
    },
    {
      name: "Healthcare Analytics",
      description:
        "Data-driven healthcare insights helping organizations optimize employee wellbeing.",
      image: "/images/altuhealth/service-healthcare-analytics.png",
    },
  ];

  return (
    <section id="services">
      <div className="container">
        <div className="section-title">
          <span>Our Services</span>
          <h2>Technology Meets Healthcare Excellence.</h2>
          <p>
            We leverage modern digital systems to simplify enrolment, claims
            processing, healthcare access, and provider management.
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
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <img src={service.image} alt="" />
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
