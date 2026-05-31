"use client";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header>
      <div className="container">
        <nav>
          <div className="logo">
            <span>AltuHealth</span>
          </div>

          <div className="nav-links">
            <a onClick={() => scrollToSection("home")}>Home</a>
            <a onClick={() => scrollToSection("about")}>About</a>
            <a onClick={() => scrollToSection("plans")}>Plans</a>
            <a onClick={() => scrollToSection("services")}>Services</a>
            <a onClick={() => scrollToSection("team")}>Management</a>
            <a onClick={() => scrollToSection("contact")}>Contact</a>
          </div>

          <button className="nav-btn" onClick={() => scrollToSection("plans")}>
            Get Covered
          </button>
        </nav>
      </div>
    </header>
  );
}
