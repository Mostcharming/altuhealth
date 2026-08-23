import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../../../.cache/capture-runtime/node_modules/playwright-core/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(projectRoot, "store-assets", "screenshots");
const baseUrl = process.env.MOBILE_SCREENSHOT_URL || "http://127.0.0.1:8082";
const chromePath =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const demoUser = {
  id: "store-demo-enrollee",
  email: "amara.okafor@example.com",
  firstName: "Amara",
  lastName: "Okafor",
  policyNumber: "ALT-2026-01482",
  status: "active",
  type: "RetailEnrollee",
  role: "Enrollee",
  rolePrivileges: [
    "dependent-medical-history:view",
    "dependent-medical-histories:view",
  ],
  dependentVisitNotificationsEnabled: true,
  requiresDependentVisitSetup: false,
};

const dashboard = {
  enrollee: {
    firstName: demoUser.firstName,
    lastName: demoUser.lastName,
    policyNumber: demoUser.policyNumber,
  },
  healthPlan: {
    daysUntilRenewal: 224,
    renewalDate: "2027-04-01",
    name: "AltuCare Plus",
    status: "Active",
  },
  benefits: {
    totalBenefits: "24",
    usedPercentage: 18,
    remainingPercentage: 82,
  },
  appointments: [
    {
      id: "appointment-1",
      title: "Annual wellness check",
      date: "2026-09-03",
      time: "10:30",
      doctor: "Meridian Family Hospital",
    },
    {
      id: "appointment-2",
      title: "Dental consultation",
      date: "2026-09-18",
      time: "14:00",
      doctor: "BrightSmile Dental Clinic",
    },
  ],
};

const benefits = [
  {
    id: "benefit-1",
    name: "Outpatient consultation",
    description: "Consultations with approved general practitioners in the provider network.",
    benefitCategory: "Primary care",
    coverageType: "Covered",
    coverageValue: "100%",
    isCovered: true,
  },
  {
    id: "benefit-2",
    name: "Prescription medicines",
    description: "Eligible medicines prescribed during a covered consultation.",
    benefitCategory: "Pharmacy",
    coverageType: "Annual limit",
    coverageValue: "Included",
    isCovered: true,
  },
  {
    id: "benefit-3",
    name: "Laboratory diagnostics",
    description: "Approved routine tests requested by a network provider.",
    benefitCategory: "Diagnostics",
    coverageType: "Covered",
    coverageValue: "Plan limits apply",
    isCovered: true,
  },
  {
    id: "benefit-4",
    name: "Emergency care",
    description: "Urgent stabilisation and emergency services within your plan terms.",
    benefitCategory: "Emergency",
    coverageType: "Covered",
    coverageValue: "24/7",
    isCovered: true,
  },
];

const appointments = [
  {
    id: "appointment-1",
    complaint: "Annual wellness check",
    notes: "Routine preventive consultation and health review.",
    appointmentDateTime: "2026-09-03T09:30:00.000Z",
    status: "approved",
    Provider: { name: "Meridian Family Hospital" },
  },
  {
    id: "appointment-2",
    complaint: "Dental consultation",
    appointmentDateTime: "2026-09-18T13:00:00.000Z",
    status: "pending",
    Provider: { name: "BrightSmile Dental Clinic" },
  },
  {
    id: "appointment-3",
    complaint: "Eye examination",
    appointmentDateTime: "2026-07-14T10:00:00.000Z",
    status: "completed",
    Provider: { name: "ClearView Eye Centre" },
  },
];

const providers = [
  {
    id: "provider-1",
    name: "Meridian Family Hospital",
    category: "Hospital",
    categoryLabel: "Multi-specialist hospital",
    state: "Lagos",
    lga: "Ikeja",
    address: "12 Allen Avenue, Ikeja, Lagos",
    phoneNumber: "+234 800 000 0101",
    specialization: { name: "General Practice" },
  },
  {
    id: "provider-2",
    name: "BrightSmile Dental Clinic",
    category: "Clinic",
    categoryLabel: "Dental clinic",
    state: "Lagos",
    lga: "Lekki",
    address: "8 Admiralty Way, Lekki, Lagos",
    phoneNumber: "+234 800 000 0102",
    specialization: { name: "Dentistry" },
  },
  {
    id: "provider-3",
    name: "ClearView Eye Centre",
    category: "Clinic",
    categoryLabel: "Eye care centre",
    state: "Abuja",
    lga: "Wuse",
    address: "24 Aminu Kano Crescent, Wuse 2, Abuja",
    phoneNumber: "+234 800 000 0103",
    specialization: { name: "Ophthalmology" },
  },
];

const profile = {
  id: demoUser.id,
  firstName: demoUser.firstName,
  lastName: demoUser.lastName,
  email: demoUser.email,
  phoneNumber: "+234 803 555 0142",
  policyNumber: demoUser.policyNumber,
  country: "Nigeria",
  state: "Lagos",
  lga: "Ikeja",
  city: "Lagos",
  address: "Ikeja, Lagos",
  type: demoUser.type,
  dependentVisitNotificationsEnabled: true,
  requiresDependentVisitSetup: false,
};

const subscription = {
  current: {
    id: "subscription-1",
    referenceNumber: "ALT-SUB-2026-1482",
    planId: "plan-plus",
    plan: {
      id: "plan-plus",
      name: "AltuCare Plus",
      description: "Comprehensive everyday healthcare cover for individuals and families.",
      planCycle: "Annual",
      amount: 145000,
      currency: "NGN",
      allowDependentEnrolee: true,
      maxNumberOfDependents: 4,
    },
    amountPaid: 145000,
    currency: "NGN",
    datePaid: "2026-04-01",
    subscriptionStartDate: "2026-04-01",
    subscriptionEndDate: "2027-04-01",
    status: "active",
  },
  history: [],
  plans: [
    {
      id: "plan-plus",
      name: "AltuCare Plus",
      description: "Comprehensive everyday healthcare cover for individuals and families.",
      planCycle: "Annual",
      amount: 145000,
      currency: "NGN",
      allowDependentEnrolee: true,
      maxNumberOfDependents: 4,
    },
  ],
};

const dependents = [
  {
    id: "dependent-1",
    firstName: "Zara",
    lastName: "Okafor",
    relationshipToEnrollee: "daughter",
    policyNumber: "ALT-2026-01482-D1",
    dateOfBirth: "2018-05-12",
    gender: "female",
    isActive: true,
    status: "active",
  },
  {
    id: "dependent-2",
    firstName: "Chinedu",
    lastName: "Okafor",
    relationshipToEnrollee: "spouse",
    policyNumber: "ALT-2026-01482-D2",
    dateOfBirth: "1988-11-06",
    gender: "male",
    isActive: true,
    status: "active",
  },
];

function json(data) {
  return {
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(data),
  };
}

function fixtureFor(url) {
  const parsed = new URL(url);
  const endpoint = parsed.pathname.replace(/^.*\/api\/v\d+/, "");

  if (endpoint === "/enrollee/dashboard") return json({ data: dashboard });
  if (endpoint === "/enrollee/benefits/list") return json({ data: { benefits } });
  if (endpoint === "/enrollee/appointments/list") return json({ data: { list: appointments } });
  if (endpoint === "/public/providers") return json({ data: { list: providers } });
  if (endpoint === "/enrollee/account/profile") return json({ data: { user: profile } });
  if (endpoint === "/enrollee/account/dependent-visit-preference") {
    return json({
      data: {
        dependentVisitNotificationsEnabled: true,
        requiresDependentVisitSetup: false,
      },
    });
  }
  if (endpoint === "/enrollee/notifications/unread-count") {
    return json({ data: { unreadCount: 3 } });
  }
  if (endpoint === "/enrollee/subscriptions") return json({ data: subscription });
  if (endpoint === "/enrollee/dependents/list") return json({ data: { list: dependents } });
  if (endpoint === "/enrollee/medical-history/list") {
    return json({
      data: {
        list: [
          {
            id: "history-1",
            serviceDate: "2026-07-14",
            status: "completed",
            serviceType: "Consultation",
            notes: "Routine eye examination completed.",
            Provider: { name: "ClearView Eye Centre" },
            Diagnosis: { name: "Routine eye examination" },
          },
        ],
      },
    });
  }

  return json({ data: {} });
}

const devices = [
  {
    directory: "phone",
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2.5,
    screens: [
      ["01-home.png", "/", "Quick actions"],
      ["02-benefits.png", "/benefits", "Outpatient consultation"],
      ["03-appointments.png", "/appointments", "Annual wellness check"],
      ["04-more-services.png", "/more", "Enrollee services"],
    ],
  },
  {
    directory: "tablet-7",
    viewport: { width: 720, height: 1280 },
    deviceScaleFactor: 1.5,
    screens: [
      ["01-home.png", "/", "Quick actions"],
      ["02-benefits.png", "/benefits", "Outpatient consultation"],
      ["03-appointments.png", "/appointments", "Annual wellness check"],
      ["04-more-services.png", "/more", "Enrollee services"],
    ],
  },
  {
    directory: "tablet-10",
    viewport: { width: 900, height: 1600 },
    deviceScaleFactor: 1.6,
    screens: [
      ["01-home.png", "/", "Quick actions"],
      ["02-benefits.png", "/benefits", "Outpatient consultation"],
      ["03-appointments.png", "/appointments", "Annual wellness check"],
      ["04-more-services.png", "/more", "Enrollee services"],
    ],
  },
];

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--disable-dev-shm-usage", "--hide-scrollbars"],
});

try {
  for (const device of devices) {
    const directory = path.join(outputRoot, device.directory);
    await mkdir(directory, { recursive: true });

    const context = await browser.newContext({
      viewport: device.viewport,
      screen: device.viewport,
      deviceScaleFactor: device.deviceScaleFactor,
      hasTouch: true,
      isMobile: true,
      colorScheme: "light",
      locale: "en-NG",
      timezoneId: "Africa/Lagos",
    });

    await context.addInitScript(({ user }) => {
      localStorage.setItem(
        "altu_enrollee_session",
        JSON.stringify({ user, token: "store-screenshot-token" }),
      );
    }, { user: demoUser });

    await context.route("**/api/v1/**", async (route) => {
      await route.fulfill(fixtureFor(route.request().url()));
    });

    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") {
        console.error(`[${device.directory}] ${message.text()}`);
      }
    });

    for (const [filename, route, marker] of device.screens) {
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await page.getByText(marker, { exact: true }).first().waitFor({
        state: "visible",
        timeout: 45_000,
      });
      await page.waitForTimeout(1_000);

      const outputPath = path.join(directory, filename);
      await page.screenshot({ path: outputPath, fullPage: false, type: "png" });
      const info = await stat(outputPath);
      console.log(`${device.directory}/${filename} ${info.size} bytes`);
    }

    await context.close();
  }
} finally {
  await browser.close();
}
