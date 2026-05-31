export default function Team() {
  const team = [
    {
      name: "Leadership Team Member",
      position: "Director",
      bio: "Bringing years of healthcare and technology experience to drive innovation.",
    },
    {
      name: "Management Team Member",
      position: "Manager",
      bio: "Dedicated to delivering excellent customer service and operational excellence.",
    },
    {
      name: "Operations Team Member",
      position: "Lead",
      bio: "Committed to building scalable systems that serve millions.",
    },
  ];

  return (
    <section className="team" id="team">
      <div className="container">
        <div className="section-title">
          <span>Management Team</span>
          <h2>Leadership Built On Vision & Innovation.</h2>
          <p>
            Meet the experienced professionals driving AltuHealth's mission to
            transform healthcare access.
          </p>
        </div>

        <div className="team-grid">
          {team.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-image"></div>
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
