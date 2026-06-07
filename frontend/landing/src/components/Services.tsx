export default function Services() {
  const services = [
    {
      name: "Telemedicine",
      description:
        "Speak with licensed medical professionals remotely through our secure healthcare platform.",
    },
    {
      name: "Digital Claims",
      description:
        "Fast and transparent claims processing powered by intelligent healthcare systems.",
    },
    {
      name: "Healthcare Analytics",
      description:
        "Data-driven healthcare insights helping organizations optimize employee wellbeing.",
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

        <div className="service-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon"></div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
