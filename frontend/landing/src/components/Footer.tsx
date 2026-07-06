export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>ALTUHEALTH</h3>
            <p>
              Technology-driven healthcare coverage built for modern
              individuals, families, and enterprises.
            </p>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#plans">Healthcare Plans</a>
              </li>
              <li>
                Providers
              </li>
              <li>
                Careers
              </li>
            </ul>
          </div>

          <div>
            <h4>Services</h4>
            <ul>
              <li>
                <a href="#services">Telemedicine</a>
              </li>
              <li>
                <a href="#services">Digital Claims</a>
              </li>
              <li>
                <a href="#plans">Corporate Healthcare</a>
              </li>
              <li>
                <a href="#services">Health Analytics</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>support@altuhealth.com</li>
              <li>+234 810 759 9978</li>
              <li>
                AltuHealth Place, 4 Irewole Street, Opp. New Apostolic Church,
                Opebi, Ikeja, Lagos, Nigeria
              </li>
              <li>Operating Nationwide</li>
            </ul>
          </div>
        </div>

        <div className="bottom">© 2026 AltuHealth. All Rights Reserved.</div>
      </div>

      <a
        href="https://wa.me/2348107599978"
        className="whatsapp"
        target="_blank"
        rel="noopener noreferrer"
      >
        💬
      </a>
    </footer>
  );
}
