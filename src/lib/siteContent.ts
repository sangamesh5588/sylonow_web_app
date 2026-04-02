export interface InfoPageSection {
  title: string;
  body: string[];
}

export interface InfoPageContent {
  eyebrow: string;
  title: string;
  summary: string;
  sections: InfoPageSection[];
}

export const COMPANY_CONTACT = {
  address: "No 51, Old site No.1, 5th Floor, 5th Main road, above Alchemy Coffee Roasters, 36th Cross Rd, 5th Block, Jayanagar, Bengaluru, Karnataka, India, 560041",
  phone: "+91 90359 54661",
  email: "info@sylonow.com",
};

export const POLICY_PAGES: Record<string, InfoPageContent> = {
  terms_of_service: {
    eyebrow: "Legal",
    title: "Terms of Service",
    summary: "These terms explain how Sylonow bookings, pricing, cancellations, and customer responsibilities work when you place an order with us.",
    sections: [
      {
        title: "Booking acceptance",
        body: [
          "All bookings are subject to serviceability, decorator availability, venue access, and payment confirmation.",
          "Sylonow may contact you after booking to confirm event details, setup timing, and any customization needed for the selected decoration.",
        ],
      },
      {
        title: "Pricing and scope",
        body: [
          "Displayed package prices cover only the items clearly listed on the product page, inclusions, or confirmed customization summary.",
          "Additional charges may apply for premium add-ons, long-distance delivery, difficult venue access, urgent requests, or event-specific custom work.",
        ],
      },
      {
        title: "Customer responsibilities",
        body: [
          "Customers must provide accurate contact details, setup address, event date, and venue access information before the service date.",
          "A clean and accessible setup space, along with any required permissions from venue management, should be arranged in advance.",
        ],
      },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    summary: "We collect the minimum information required to complete bookings, support customer service, and improve the Sylonow experience.",
    sections: [
      {
        title: "What we collect",
        body: [
          "We may collect your phone number, name, addresses, booking preferences, and order history when you use the website.",
          "Basic device, browser, and usage information may also be collected for analytics, performance, and security purposes.",
        ],
      },
      {
        title: "How we use it",
        body: [
          "Your information is used to process bookings, manage addresses, share order updates, coordinate delivery or setup teams, and provide support.",
          "We may use anonymized analytics to understand site usage and improve browsing, search, and checkout flows.",
        ],
      },
      {
        title: "Sharing and security",
        body: [
          "Relevant order details may be shared with decorators, delivery partners, or service providers strictly for fulfilling your booking.",
          "We take reasonable technical and operational measures to protect your information, but no internet system can guarantee absolute security.",
        ],
      },
    ],
  },
  cancellation: {
    eyebrow: "Legal",
    title: "Cancellation Policy",
    summary: "Cancellation eligibility depends on how close the request is to the service date and whether custom preparation has already begun.",
    sections: [
      {
        title: "Standard cancellations",
        body: [
          "Cancellation requests made well before the confirmed setup slot are more likely to qualify for refund or credit review.",
          "Closer-to-event cancellations may attract partial retention charges because inventory, labor, and scheduling are blocked for your booking.",
        ],
      },
      {
        title: "Custom and urgent work",
        body: [
          "Orders involving customized names, printed materials, premium props, or urgent same-day arrangements may be non-refundable once production starts.",
          "Our support team can still review each request and share the best possible resolution based on work already committed.",
        ],
      },
      {
        title: "How to request",
        body: [
          "Please contact Sylonow support with your booking details as early as possible to request cancellation or rescheduling.",
          "Any approved refund or credit outcome will be shared after internal review with the service partner.",
        ],
      },
    ],
  },
  shipping: {
    eyebrow: "Legal",
    title: "Shipping Policy",
    summary: "Sylonow primarily coordinates decoration setup services, but any physical items or gifting add-ons follow delivery-zone and time-slot rules.",
    sections: [
      {
        title: "Service coverage",
        body: [
          "Delivery and setup availability depends on your selected city, local partner coverage, and the service listed on the website.",
          "Some premium or large-scale decorations may be restricted to specific localities or venue types.",
        ],
      },
      {
        title: "Delivery windows",
        body: [
          "Where gifting or product delivery is included, estimated delivery windows are shared during booking or confirmation.",
          "Weather conditions, traffic, venue restrictions, and local disruptions may affect exact fulfillment timing.",
        ],
      },
      {
        title: "Access and support",
        body: [
          "Customers should ensure the location is accessible for decorators, props, and materials at the confirmed time.",
          "Additional support charges may apply for upper floors without lift access, remote locations, or strict venue entry processes.",
        ],
      },
    ],
  },
  refund: {
    eyebrow: "Legal",
    title: "Refund Policy",
    summary: "Refund eligibility is reviewed based on cancellation timing, service completion status, and the type of work already prepared for the event.",
    sections: [
      {
        title: "Refund scenarios",
        body: [
          "Approved refunds may be processed when a booking cannot be fulfilled, is cancelled in an eligible time window, or faces a confirmed service issue.",
          "Refunds may not apply in full for last-minute cancellations, customized work, or bookings already executed as confirmed.",
        ],
      },
      {
        title: "Processing timeline",
        body: [
          "Once approved, refunds are initiated through the original payment method or another agreed resolution channel.",
          "Banking and gateway timelines can vary, so final credit may take several business days after approval.",
        ],
      },
      {
        title: "Support review",
        body: [
          "If you believe there was a service quality problem, please share photos, timing details, and booking information with support for review.",
          "Our team will investigate the issue with the partner and communicate the resolution clearly.",
        ],
      },
    ],
  },
  revenue: {
    eyebrow: "Legal",
    title: "Revenue Policy",
    summary: "This page explains how platform charges, partner payouts, discounts, and payment collections are treated across bookings on Sylonow.",
    sections: [
      {
        title: "Platform pricing and collections",
        body: [
          "Sylonow may collect booking amounts from customers on behalf of service partners and apply platform commissions, campaign discounts, gateway fees, or promotional adjustments as configured internally.",
          "Displayed customer-facing prices may differ from partner settlement values because platform incentives, coupons, taxes, and internal revenue rules can be applied at checkout.",
        ],
      },
      {
        title: "Partner settlements",
        body: [
          "Revenue payouts to decorators or service partners are subject to successful order completion, dispute review, refund outcomes, and internal settlement cycles.",
          "Sylonow may withhold or adjust settlement amounts where service issues, cancellations, partial fulfillment, or refund liabilities apply.",
        ],
      },
      {
        title: "Changes and exceptions",
        body: [
          "Revenue rules may vary by category, city, campaign, or payment method and can be revised over time to reflect operational costs and marketplace decisions.",
          "Special campaign orders, enterprise requests, or highly customized bookings may follow separate commercial agreements communicated directly to the relevant partner or customer.",
        ],
      },
    ],
  },
  gdpr: {
    eyebrow: "Legal",
    title: "GDPR Compliance",
    summary: "Sylonow aims to handle personal data responsibly and supports privacy rights such as access, correction, deletion, and lawful processing review where applicable.",
    sections: [
      {
        title: "Your data rights",
        body: [
          "You may request access to the personal information we hold about you, ask for corrections to inaccurate details, or request deletion where legally permitted.",
          "You may also ask for clarification on how your data is processed, what service providers are involved, and how long core customer records are retained.",
        ],
      },
      {
        title: "Lawful use and retention",
        body: [
          "We use customer data only for legitimate service needs such as booking management, support, fraud prevention, product improvement, and regulatory compliance.",
          "Information is retained only for as long as necessary for operational, contractual, legal, security, or dispute-resolution purposes.",
        ],
      },
      {
        title: "Requests and support",
        body: [
          "If you want to make a privacy or GDPR-style request, please contact support with enough information for us to verify and process the request safely.",
          "Some records may need to be retained even after a request if required for payment reconciliation, legal obligations, or fraud prevention.",
        ],
      },
    ],
  },
  cookie: {
    eyebrow: "Legal",
    title: "Cookie Policy",
    summary: "Cookies and similar browser storage help Sylonow remember preferences, improve performance, keep sessions working, and understand product usage patterns.",
    sections: [
      {
        title: "What cookies are used for",
        body: [
          "We may use cookies or local browser storage for login continuity, city selection, cart and booking flows, basic personalization, and performance monitoring.",
          "Some analytics or functional tools may also use storage to understand page usage, reduce repeated actions, and support smoother browsing sessions.",
        ],
      },
      {
        title: "Managing your preferences",
        body: [
          "You can control or delete cookies through your browser settings, but some website features may stop working properly if required storage is blocked.",
          "Functional experiences such as saved preferences, address flows, and checkout continuity may be affected when cookies or local storage are disabled.",
        ],
      },
      {
        title: "Updates",
        body: [
          "The exact mix of cookies and browser storage may change as the product evolves, integrations are updated, or new features are added.",
          "We may revise this policy whenever those technical changes materially affect how customer data or preferences are stored in the browser.",
        ],
      },
    ],
  },
  copyright: {
    eyebrow: "Legal",
    title: "Copyright Policy",
    summary: "Images, text, designs, branding, and marketplace content on Sylonow are protected intellectual property and should not be copied or redistributed without permission.",
    sections: [
      {
        title: "Ownership and use",
        body: [
          "Website content, creative assets, product descriptions, logos, and platform design are owned by Sylonow, its partners, or their respective licensors unless stated otherwise.",
          "You may browse and use the platform for personal booking purposes, but unauthorized commercial reuse, copying, scraping, or republication is not permitted.",
        ],
      },
      {
        title: "Reporting infringement",
        body: [
          "If you believe your copyrighted work has been used improperly on Sylonow, contact support with the exact content details, ownership information, and a clear explanation of the claim.",
          "We may review, restrict, or remove content where we reasonably believe an infringement issue exists or where supporting legal documentation is provided.",
        ],
      },
      {
        title: "Repeat misuse",
        body: [
          "Accounts, partners, or content contributors who repeatedly violate copyright or intellectual property standards may face content removal, payout holds, or access restrictions.",
          "Sylonow reserves the right to cooperate with legitimate legal requests related to intellectual property protection and enforcement.",
        ],
      },
    ],
  },
  delete_account: {
    eyebrow: "Legal",
    title: "Delete Account",
    summary: "Customers can request account deletion, and Sylonow will process the request subject to identity verification and any required record-retention obligations.",
    sections: [
      {
        title: "How to request deletion",
        body: [
          "To request deletion of your account, contact Sylonow support from your registered phone number or email and mention that you want your account removed.",
          "We may ask you to verify account ownership before acting on the request to protect your information and prevent unauthorized deletion attempts.",
        ],
      },
      {
        title: "What gets removed",
        body: [
          "Where possible, we will delete or anonymize customer profile information that is no longer required for service operations, compliance, or security review.",
          "Some transactional records, payment references, or dispute-related data may still be retained where required for accounting, legal, fraud, or regulatory reasons.",
        ],
      },
      {
        title: "After deletion",
        body: [
          "Once deletion is completed, your access to account-linked features such as saved addresses, wishlist, and booking history may no longer be available.",
          "If you return later, a fresh account or verification flow may be required depending on the systems and data already removed.",
        ],
      },
    ],
  },
};

export const COMPANY_PAGES: Record<string, InfoPageContent> = {
  about: {
    eyebrow: "About Company",
    title: "About Us",
    summary: "Sylonow helps customers discover, book, and personalize event decorations and celebration experiences with trusted local partners.",
    sections: [
      {
        title: "What we do",
        body: [
          "We curate decoration setups across occasions like birthdays, anniversaries, baby showers, proposals, and intimate private celebrations.",
          "Our goal is to make planning easier by combining inspiration, transparent pricing, and convenient booking in one place.",
        ],
      },
      {
        title: "How we work",
        body: [
          "Customers browse real packages, pick a preferred date and time, add venue details, and complete bookings through the platform.",
          "After booking, our team and service partners coordinate final event notes, colors, names, and setup logistics.",
        ],
      },
      {
        title: "Why Sylonow",
        body: [
          "We focus on practical booking flows, curated service quality, and making celebration planning feel simple and dependable.",
          "The platform continues to evolve based on customer feedback, city coverage, and partner capabilities.",
        ],
      },
    ],
  },
  careers: {
    eyebrow: "About Company",
    title: "Careers",
    summary: "We are building the next layer of celebration commerce and service booking, and we’re always open to strong operators, designers, and engineers.",
    sections: [
      {
        title: "Who we hire",
        body: [
          "We look for people who care deeply about customer experience, execution quality, and building reliable systems that teams can trust.",
          "Product, design, engineering, operations, growth, partner success, and customer support are all important areas for us.",
        ],
      },
      {
        title: "How to apply",
        body: [
          "If you want to work with Sylonow, send your profile, portfolio, or resume to our support email with a short note on the role you’re interested in.",
          "We review thoughtful applications faster when they include relevant work samples and a clear explanation of your strengths.",
        ],
      },
    ],
  },
  blog: {
    eyebrow: "About Company",
    title: "Blog",
    summary: "The Sylonow blog is where we’ll share decoration trends, planning tips, booking advice, and city-specific celebration ideas.",
    sections: [
      {
        title: "What to expect",
        body: [
          "We plan to publish celebration inspiration, venue-friendly setup ideas, budgeting guides, and partner stories from real event categories.",
          "As the content library grows, this section will also support SEO-led landing content tied to cities, occasions, and decoration themes.",
        ],
      },
      {
        title: "Current status",
        body: [
          "The blog structure is now live as a linked page so it is fully navigable from the website.",
          "Editorial publishing can be added next when you want to manage posts dynamically.",
        ],
      },
    ],
  },
};
