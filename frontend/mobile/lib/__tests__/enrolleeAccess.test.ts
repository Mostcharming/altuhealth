import {
  isRetailEnrollee,
  resolveNotificationRoute,
  validatePasswordChange,
} from "../enrolleeAccess";

describe("mobile enrollee access rules", () => {
  it("allows subscription management only for retail enrollees", () => {
    expect(isRetailEnrollee("RetailEnrollee")).toBe(true);
    expect(isRetailEnrollee("Enrollee")).toBe(false);
    expect(isRetailEnrollee(undefined)).toBe(false);
  });

  it("maps known notification links to protected mobile routes", () => {
    expect(resolveNotificationRoute("appointments")).toBe("/appointments");
    expect(resolveNotificationRoute("https://example.test/medical-history/1")).toBe(
      "/medical-history"
    );
    expect(
      resolveNotificationRoute(
        "https://example.test/dependent-medical-history?dependentId=123"
      )
    ).toBe("/dependents");
    expect(resolveNotificationRoute("https://example.test/admin/users")).toBeNull();
  });

  it("enforces the password form requirements", () => {
    expect(
      validatePasswordChange({ oldPassword: "", newPassword: "", confirmPassword: "" })
    ).toBe("Enter your current and new password.");
    expect(
      validatePasswordChange({
        oldPassword: "old-password",
        newPassword: "short",
        confirmPassword: "short",
      })
    ).toBe("Your new password must be at least 8 characters.");
    expect(
      validatePasswordChange({
        oldPassword: "old-password",
        newPassword: "new-password",
        confirmPassword: "new-password",
      })
    ).toBeNull();
  });
});
