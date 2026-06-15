import TalkToDoctorPrompt from "@/components/TalkToDoctorPrompt";

export default function CTA() {
  return (
    <section>
      <div className="container">
        <div className="cta">
          <h2>Healthcare You Can Trust.</h2>

          <p>
            Join thousands of individuals, families, and businesses choosing
            AltuHealth for reliable healthcare coverage and modern healthcare
            experiences.
          </p>

          <div className="cta-buttons">
            <a href="#plans" className="btn btn-white">
              Get Started
            </a>

            <TalkToDoctorPrompt className="btn btn-glass" />
          </div>
        </div>
      </div>
    </section>
  );
}
