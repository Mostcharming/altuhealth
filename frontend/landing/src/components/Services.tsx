export default function Services() {
  const services = [
    {
      name: "Telemedicine",
      description:
        "Speak with licensed medical professionals remotely through our secure healthcare platform.",
    },
    {
      name: "Digital Enrolment",
      description:
        "Sign up for healthcare coverage in minutes through our user-friendly mobile and web platforms.",
    },
    {
      name: "Claims Processing",
      description:
        "Fast and transparent claim processing with real-time tracking and support.",
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
