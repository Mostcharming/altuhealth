export default function Team() {
  const team = [
    {
      name: "Emmanuel Omoleye",
      position: "Managing Director / CEO",
      bio: "Leading AltuHealth's vision of transforming healthcare access through innovation and digital healthcare infrastructure.",
      image: "/images/team/gideon-ola.jpg",
    },
    {
      name: "Gideon Ola",
      position: "Head of Operations",
      bio: "Driving organizational growth, strategic partnerships, customer excellence, and operational efficiency.",
      image: "/images/team/emmanuel-omoleye.jpg",
    },
  ];

  return (
    <section className="team" id="team">
      <div className="container">
        <div className="section-title">
          <span>Management Team</span>
          <h2>Leadership Built On Vision & Innovation.</h2>
          <p>
            Our management team combines healthcare expertise, technology
            innovation, operational excellence, and customer-focused leadership.
          </p>
        </div>

        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <img
                className="team-image"
                src={member.image}
                alt={`${member.name}, ${member.position}`}
              />
              <h3>{member.name}</h3>
              <span>{member.position}</span>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
