"use client";

import { useState } from "react";

type TalkToDoctorPromptProps = {
  className: string;
};

export default function TalkToDoctorPrompt({
  className,
}: TalkToDoctorPromptProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openLogin = () => {
    window.open("https://enrollee.altuhealth.com", "_blank", "noopener");
    setIsOpen(false);
  };

  const goToPlans = () => {
    setIsOpen(false);
    window.history.replaceState(null, "", "#plans");
    window.setTimeout(() => {
      document.getElementById("plans")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setIsOpen(true)}
      >
        Talk To A Doctor
      </button>

      {isOpen ? (
        <div className="doctor-modal-backdrop" role="dialog" aria-modal="true">
          <div className="doctor-modal">
            <button
              type="button"
              className="plan-modal-close"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>

            <div className="plan-modal-header">
              <span>Consult a doctor</span>
              <h3>Sign into your account.</h3>
              <p>
                You need an enrollee account to consult a doctor. If you do not
                have an account yet, buy a plan to get started.
              </p>
            </div>

            <div className="doctor-modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={openLogin}
              >
                Login
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={goToPlans}
              >
                Buy a plan
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
