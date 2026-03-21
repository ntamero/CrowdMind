'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ScrollText } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using the Wisery platform ("Platform"), available at wisery.live, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, you must not access or use the Platform.',
      'These Terms constitute a legally binding agreement between you ("User," "you," or "your") and Wisery ("we," "us," or "our"). Your continued use of the Platform following the posting of any changes to these Terms constitutes acceptance of those changes.',
      'We reserve the right to update or modify these Terms at any time without prior notice. It is your responsibility to review these Terms periodically. The "Last Updated" date at the top of this page indicates when these Terms were last revised.',
    ],
  },
  {
    title: '2. Eligibility',
    content: [
      'You must be at least eighteen (18) years of age to use the Platform. By using the Platform, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into a binding agreement.',
      'If you are using the Platform on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.',
      'We reserve the right to request proof of age at any time and to suspend or terminate accounts where we reasonably believe the User is under 18 years of age.',
    ],
  },
  {
    title: '3. Account Registration and Responsibilities',
    content: [
      'To access certain features of the Platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.',
      'You are solely responsible for maintaining the confidentiality of your account credentials, including your password and any linked wallet addresses. You agree to notify us immediately of any unauthorized use of your account.',
      'You are responsible for all activities that occur under your account, whether or not you have authorized such activities. We are not liable for any loss or damage arising from your failure to maintain the security of your account.',
      'Two-factor authentication (2FA) is mandatory for all accounts. Failure to enable 2FA may result in restricted access to certain Platform features.',
    ],
  },
  {
    title: '4. Platform Usage',
    content: [
      'The Platform provides a decentralized opinion and prediction marketplace where users can create questions, cast votes, participate in prediction markets, and earn rewards through the Wisery Score and Reputation (WSR) token system.',
      'You agree to use the Platform only for lawful purposes and in accordance with these Terms. You shall not use the Platform in any manner that could disable, overburden, damage, or impair the Platform or interfere with any other party\'s use of the Platform.',
      'We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for personal, non-commercial purposes, subject to these Terms.',
    ],
  },
  {
    title: '5. Voting and Prediction Rules',
    content: [
      'Each user is permitted one (1) vote per question. You may not vote on questions you have created. Votes are final and cannot be changed once submitted.',
      'Prediction markets operate on a staking mechanism using WSR tokens. By participating in prediction markets, you acknowledge and accept the risk that you may lose some or all of your staked tokens.',
      'Prediction market outcomes are resolved based on verifiable real-world events. Wisery reserves the right to void or reverse any prediction market in cases of ambiguity, manipulation, or force majeure events.',
      'Any attempt to manipulate voting outcomes, prediction markets, or platform metrics through bots, multiple accounts, coordinated campaigns, or other fraudulent means is strictly prohibited and will result in immediate account termination.',
    ],
  },
  {
    title: '6. WSR Token Disclaimer',
    content: [
      'The Wisery Score and Reputation (WSR) token is a utility token used within the Platform ecosystem. WSR tokens are NOT securities, investments, or financial instruments of any kind.',
      'WSR tokens do not represent equity, ownership, revenue share, or any form of participation in any entity. They confer no voting rights in the governance of Wisery as a company.',
      'The value of WSR tokens is inherently volatile and may fluctuate significantly. You should not purchase or acquire WSR tokens with the expectation of profit. Past performance of WSR tokens is not indicative of future results.',
      'WSR tokens are currently deployed on testnet infrastructure and are subject to resets, migrations, or discontinuation without notice. There is no guarantee that WSR tokens will maintain any value or utility.',
    ],
  },
  {
    title: '7. Prohibited Conduct',
    content: [
      'You agree not to engage in any of the following prohibited activities:',
      '(a) Creating multiple accounts to circumvent voting limits or manipulate platform metrics.',
      '(b) Using bots, scripts, or automated tools to interact with the Platform without express written permission.',
      '(c) Posting or transmitting content that is defamatory, obscene, threatening, harassing, discriminatory, or otherwise objectionable.',
      '(d) Attempting to gain unauthorized access to other user accounts, Platform systems, or data.',
      '(e) Engaging in market manipulation, wash trading, insider trading, or any form of fraudulent activity within prediction markets.',
      '(f) Circumventing or attempting to circumvent any security measures, rate limits, or access controls.',
      '(g) Using the Platform to launder money, finance terrorism, or engage in any other illegal financial activity.',
      '(h) Scraping, mining, or extracting data from the Platform without authorization.',
      '(i) Impersonating any person or entity, or falsely stating or misrepresenting your affiliation with any person or entity.',
    ],
  },
  {
    title: '8. Intellectual Property',
    content: [
      'The Platform, including its design, code, graphics, logos, trademarks, and all associated intellectual property, is owned by Wisery and is protected by international copyright, trademark, and other intellectual property laws.',
      'User-generated content, including questions, comments, and votes, remains the intellectual property of the respective users. By posting content on the Platform, you grant Wisery a worldwide, non-exclusive, royalty-free, perpetual, irrevocable license to use, reproduce, modify, adapt, publish, display, and distribute such content in connection with the Platform.',
      'You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any portion of the Platform without prior written consent from Wisery.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    content: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WISERY AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES.',
      'IN NO EVENT SHALL WISERY\'S TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM EXCEED THE GREATER OF (A) THE AMOUNT YOU HAVE PAID TO WISERY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED US DOLLARS ($100).',
      'THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'Wisery does not warrant that the Platform will be uninterrupted, error-free, secure, or free of viruses or other harmful components. You use the Platform at your own risk.',
    ],
  },
  {
    title: '10. Indemnification',
    content: [
      'You agree to indemnify, defend, and hold harmless Wisery, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or relating to your use of the Platform, your violation of these Terms, or your violation of any rights of any third party.',
    ],
  },
  {
    title: '11. Dispute Resolution',
    content: [
      'Any dispute, controversy, or claim arising out of or relating to these Terms or the Platform shall first be attempted to be resolved through informal negotiation. You agree to contact us at legal@wisery.live before initiating any formal proceedings.',
      'If the dispute cannot be resolved through informal negotiation within thirty (30) days, either party may submit the dispute to binding arbitration administered by a mutually agreed-upon arbitration body. The arbitration shall be conducted in the English language.',
      'You agree that any dispute resolution proceedings will be conducted on an individual basis and not as part of any class, consolidated, or representative action.',
      'Nothing in this section shall prevent either party from seeking injunctive or other equitable relief in a court of competent jurisdiction to prevent the actual or threatened infringement of intellectual property rights.',
    ],
  },
  {
    title: '12. Governing Law',
    content: [
      'These Terms shall be governed by and construed in accordance with the laws applicable in the jurisdiction where Wisery is established, without regard to its conflict of law provisions.',
      'For users located in the European Union, these Terms do not affect your rights under mandatory consumer protection legislation in your country of residence.',
      'If any provision of these Terms is found to be unenforceable or invalid under applicable law, the remaining provisions shall continue in full force and effect.',
    ],
  },
  {
    title: '13. Modifications to the Platform',
    content: [
      'We reserve the right to modify, suspend, or discontinue any part of the Platform at any time, with or without notice. We shall not be liable to you or any third party for any modification, suspension, or discontinuation of the Platform.',
      'We may introduce new features, change existing features, or remove features at our sole discretion. Continued use of the Platform after any such changes constitutes your acceptance of the modified Platform.',
    ],
  },
  {
    title: '14. Termination',
    content: [
      'We may terminate or suspend your account and access to the Platform immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms.',
      'Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property provisions, warranty disclaimers, indemnification, and limitations of liability.',
      'You may terminate your account at any time by contacting us at support@wisery.live. Account termination does not relieve you of any obligations incurred prior to termination.',
    ],
  },
  {
    title: '15. Contact Information',
    content: [
      'If you have any questions, concerns, or requests regarding these Terms of Service, please contact us at:',
      'Email: legal@wisery.live',
      'Platform: wisery.live',
      'For privacy-related inquiries, please refer to our Privacy Policy or contact our Data Protection Officer at dpo@wisery.live.',
    ],
  },
];

export default function TermsPage() {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
            <ScrollText className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            <p className="text-sm text-zinc-400">Last updated: March 19, 2026</p>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Please read these Terms of Service carefully before using the Wisery platform. These terms
          govern your access to and use of wisery.live and all associated services.
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
            <div className="space-y-3">
              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-sm leading-relaxed text-zinc-300">
                  {paragraph}
                </p>
              ))}
            </div>
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
          By using Wisery, you acknowledge that you have read, understood, and agree to be bound by
          these Terms of Service.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
            Privacy Policy
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
