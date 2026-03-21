'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

const sections = [
  {
    title: '1. Introduction',
    content: [
      'Wisery ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Wisery platform ("Platform") at wisery.live.',
      'This Privacy Policy complies with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws. By using the Platform, you consent to the data practices described in this policy.',
      'If you do not agree with the terms of this Privacy Policy, please do not access or use the Platform.',
    ],
  },
  {
    title: '2. Data We Collect',
    subsections: [
      {
        subtitle: '2.1 Information You Provide',
        items: [
          'Account registration data: email address, username, display name, and profile information.',
          'Wallet addresses: blockchain wallet addresses you connect to the Platform for WSR token transactions.',
          'Authentication data: credentials used for login, including two-factor authentication tokens.',
          'User-generated content: questions, votes, comments, predictions, and other content you create on the Platform.',
          'Communications: messages you send to us through support channels, feedback forms, or email.',
        ],
      },
      {
        subtitle: '2.2 Information Collected Automatically',
        items: [
          'Usage data: pages visited, features used, voting patterns, prediction activity, time spent on pages, and interaction metrics.',
          'Device information: device type, operating system, browser type and version, screen resolution, and language preferences.',
          'Log data: IP address, access timestamps, referring URLs, error logs, and server response codes.',
          'Location data: approximate geographic location derived from your IP address (we do not collect precise GPS location).',
        ],
      },
      {
        subtitle: '2.3 Information from Third Parties',
        items: [
          'Blockchain data: publicly available transaction data from the Polygon blockchain associated with your wallet address.',
          'Authentication providers: basic profile information from third-party login services if you choose to use social sign-in.',
        ],
      },
    ],
  },
  {
    title: '3. How We Use Your Data',
    content: [
      'We use the information we collect for the following purposes:',
    ],
    list: [
      'To provide, operate, and maintain the Platform and its features.',
      'To process your votes, predictions, and WSR token transactions.',
      'To calculate and display leaderboard rankings, XP scores, and reputation metrics.',
      'To send you account-related notifications, security alerts, and service updates.',
      'To personalize your experience and deliver content relevant to your interests.',
      'To analyze usage patterns and improve the Platform\'s functionality and performance.',
      'To detect, prevent, and address fraud, abuse, security threats, and technical issues.',
      'To comply with legal obligations and respond to lawful requests from authorities.',
      'To enforce our Terms of Service and Community Guidelines.',
    ],
  },
  {
    title: '4. Cookies and Tracking Technologies',
    content: [
      'We use cookies and similar tracking technologies to enhance your experience on the Platform.',
    ],
    subsections: [
      {
        subtitle: 'Essential Cookies',
        items: [
          'Required for Platform functionality, authentication, and security. These cannot be disabled.',
        ],
      },
      {
        subtitle: 'Analytics Cookies',
        items: [
          'Help us understand how users interact with the Platform. You may opt out of analytics cookies through your browser settings or our cookie preference center.',
        ],
      },
      {
        subtitle: 'Preference Cookies',
        items: [
          'Store your settings, language preferences, and display options to provide a personalized experience.',
        ],
      },
    ],
    extra: [
      'You can manage your cookie preferences at any time through the Platform settings. Note that disabling certain cookies may affect Platform functionality.',
    ],
  },
  {
    title: '5. Third-Party Services',
    content: [
      'We integrate with the following third-party services that may process your data:',
    ],
    subsections: [
      {
        subtitle: 'Groq AI',
        items: [
          'We use Groq AI for question analysis, trend detection, and content moderation. Question text and aggregated voting data may be sent to Groq for processing. Groq processes data in accordance with their privacy policy and does not retain user-specific data beyond the processing session.',
        ],
      },
      {
        subtitle: 'Polygon Blockchain',
        items: [
          'WSR token transactions are recorded on the Polygon blockchain. Blockchain transactions are public, permanent, and immutable. Your wallet address and transaction history are publicly visible on the blockchain. We cannot delete or modify blockchain data.',
        ],
      },
      {
        subtitle: 'Supabase',
        items: [
          'We use Supabase for authentication and database services. Your account data is stored securely on Supabase infrastructure with encryption at rest and in transit.',
        ],
      },
    ],
  },
  {
    title: '6. Data Retention',
    content: [
      'We retain your personal data only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.',
      'Account data: retained for the duration of your account\'s existence and for up to thirty (30) days following account deletion to allow for account recovery.',
      'Voting and prediction data: retained for the lifetime of the associated question or prediction market, and for up to twelve (12) months thereafter for analytics purposes.',
      'Usage logs and analytics data: retained for up to twenty-four (24) months and then automatically anonymized or deleted.',
      'Blockchain data: data recorded on the Polygon blockchain is permanent and cannot be deleted due to the immutable nature of blockchain technology.',
      'Legal compliance data: retained for the period required by applicable law, which may extend beyond account deletion.',
    ],
  },
  {
    title: '7. Your Rights',
    content: [
      'Under GDPR, CCPA, and other applicable data protection laws, you have the following rights regarding your personal data:',
    ],
    list: [
      'Right of Access: You may request a copy of the personal data we hold about you.',
      'Right to Rectification: You may request correction of inaccurate or incomplete personal data.',
      'Right to Erasure ("Right to be Forgotten"): You may request deletion of your personal data, subject to legal retention requirements and blockchain immutability.',
      'Right to Data Portability: You may request a copy of your data in a structured, commonly used, machine-readable format (JSON or CSV).',
      'Right to Restrict Processing: You may request that we limit the processing of your personal data under certain circumstances.',
      'Right to Object: You may object to the processing of your personal data for direct marketing or where processing is based on legitimate interests.',
      'Right to Withdraw Consent: Where processing is based on consent, you may withdraw consent at any time without affecting the lawfulness of prior processing.',
      'Right to Non-Discrimination (CCPA): We will not discriminate against you for exercising your privacy rights.',
    ],
    extra: [
      'To exercise any of these rights, please contact our Data Protection Officer at dpo@wisery.live. We will respond to your request within thirty (30) days. You may also export your data directly from Platform settings.',
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      'The Platform is not intended for individuals under the age of eighteen (18). We do not knowingly collect, solicit, or maintain personal data from anyone under 18 years of age.',
      'If we become aware that we have collected personal data from a child under 18, we will take immediate steps to delete such data from our systems. If you believe we may have inadvertently collected data from a minor, please contact us at dpo@wisery.live.',
      'Parents or legal guardians who become aware that their child has provided personal data to us without consent should contact us immediately.',
    ],
  },
  {
    title: '9. International Data Transfers',
    content: [
      'Your data may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.',
      'For transfers from the European Economic Area (EEA), we rely on Standard Contractual Clauses (SCCs) approved by the European Commission, or other legally recognized transfer mechanisms.',
      'We ensure that any international data transfers are subject to appropriate safeguards and that your data receives an adequate level of protection consistent with applicable data protection laws.',
    ],
  },
  {
    title: '10. Security Measures',
    content: [
      'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:',
    ],
    list: [
      'Encryption of data in transit (TLS 1.3) and at rest (AES-256).',
      'Mandatory two-factor authentication for all user accounts.',
      'Regular security audits, penetration testing, and vulnerability assessments.',
      'Access controls and role-based permissions for internal systems.',
      'Secure development practices including code reviews and dependency scanning.',
      'Incident response procedures and breach notification protocols.',
    ],
    extra: [
      'While we strive to protect your personal data, no method of electronic transmission or storage is completely secure. We cannot guarantee absolute security, but we are committed to maintaining industry-standard protections.',
    ],
  },
  {
    title: '11. Changes to This Privacy Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our data practices, legal requirements, or Platform features. We will notify you of material changes by posting the updated policy on the Platform and updating the "Last Updated" date.',
      'For significant changes that affect how we process your personal data, we will provide prominent notice through the Platform or via email. Your continued use of the Platform after any changes constitutes your acceptance of the updated Privacy Policy.',
    ],
  },
  {
    title: '12. Contact Our Data Protection Officer',
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer:',
      'Data Protection Officer: dpo@wisery.live',
      'General Inquiries: privacy@wisery.live',
      'Platform: wisery.live',
      'You also have the right to lodge a complaint with your local data protection supervisory authority if you believe your data protection rights have been violated.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      {/* Back Link */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-amber-400"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <Shield className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            <p className="text-sm text-zinc-400">Last updated: March 19, 2026</p>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Your privacy matters to us. This policy describes how Wisery collects, uses, stores, and
          protects your personal data in compliance with GDPR, CCPA, and other applicable regulations.
        </p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <motion.section
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <h2 className="mb-4 text-xl font-semibold text-amber-400">{section.title}</h2>

            {section.content && (
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-sm leading-relaxed text-zinc-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {section.subsections && (
              <div className="mt-4 space-y-4">
                {section.subsections.map((sub, sIndex) => (
                  <div key={sIndex} className="rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-4">
                    <h3 className="mb-2 text-sm font-semibold text-zinc-200">{sub.subtitle}</h3>
                    <ul className="space-y-1.5">
                      {sub.items.map((item, iIndex) => (
                        <li key={iIndex} className="flex items-start gap-2 text-sm text-zinc-400">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {section.list && (
              <ol className="mt-3 space-y-2">
                {section.list.map((item, lIndex) => (
                  <li key={lIndex} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-medium text-amber-400">
                      {lIndex + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            )}

            {section.extra && (
              <div className="mt-4 space-y-2">
                {section.extra.map((text, eIndex) => (
                  <p key={eIndex} className="text-sm leading-relaxed text-zinc-400 italic">
                    {text}
                  </p>
                ))}
              </div>
            )}
          </motion.section>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
      >
        <p className="text-sm text-zinc-400">
          Your privacy is fundamental to us. If you have any questions about how we handle your data,
          please contact our Data Protection Officer at dpo@wisery.live.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link href="/terms" className="text-amber-400 hover:text-amber-300 transition-colors">
            Terms of Service
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/guidelines" className="text-amber-400 hover:text-amber-300 transition-colors">
            Community Guidelines
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/disclaimer" className="text-amber-400 hover:text-amber-300 transition-colors">
            Token Disclaimer
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
