export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3>AltuHealth</h3>
            <p>
              Transforming healthcare coverage through technology and
              innovation.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#home">Home</a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#plans">Plans</a>
              </li>
              <li>
                <a href="#services">Services</a>
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
                <a href="#services">Health Insurance</a>
              </li>
              <li>
                <a href="#services">Claims Management</a>
              </li>
              <li>
                <a href="#services">Corporate Solutions</a>
              </li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <p>Email: info@altuhealth.com</p>
            <p>Phone: +234 906 123 4567</p>
            <p>Support: Available 24/7</p>
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
