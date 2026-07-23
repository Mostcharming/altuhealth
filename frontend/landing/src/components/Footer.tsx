import Link from "next/link";

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
                <Link href="/#about">About Us</Link>
              </li>
              <li>
                <Link href="/#plans">Healthcare Plans</Link>
              </li>
              <li>
                <Link href="/partnership-program">Partnership Program</Link>
              </li>
              <li>
                <Link href="/healthcare-providers">Providers</Link>
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
                <Link href="/#services">Telemedicine</Link>
              </li>
              <li>
                <Link href="/#services">Digital Claims</Link>
              </li>
              <li>
                <Link href="/#plans">Corporate Healthcare</Link>
              </li>
              <li>
                <Link href="/#services">Health Analytics</Link>
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
