'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Users, AlertTriangle, Ban, MessageSquare, Flag, Scale } from 'lucide-react';

const sections = [
  {
    title: '1. Respectful Participation',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    content: [
      'Wisery is a platform built on the collective intelligence of its community. Every member has a right to participate in a respectful, welcoming environment.',
    ],
    rules: [
      'Treat all users with dignity and respect, regardless of their opinions, background, identity, or prediction accuracy.',
      'Engage in good-faith discussions. Constructive disagreement is encouraged; personal attacks are not.',
      'Respect the diversity of perspectives. The value of crowd wisdom depends on a wide range of honest viewpoints.',
      'Use clear, thoughtful language when creating questions and commenting. Avoid inflammatory or misleading framing.',
      'Acknowledge that others may have different levels of expertise. Help newcomers learn rather than dismissing them.',
    ],
  },
  {
    title: '2. Voting Integrity',
    icon: Scale,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    content: [
      'The accuracy and reliability of Wisery depends on authentic, independent voting. Any attempt to undermine voting integrity damages the entire community.',
    ],
    rules: [
      'Vote honestly based on your genuine opinion or best assessment. Do not vote strategically to manipulate outcomes.',
      'Do not create multiple accounts to cast additional votes on the same question. One person, one vote.',
      'Do not use bots, scripts, automated tools, or browser extensions to cast votes or interact with the Platform.',
      'Do not coordinate with other users to vote in a particular way for the purpose of manipulating results.',
      'Do not buy, sell, or trade votes. Offering or accepting compensation for voting in a specific way is strictly prohibited.',
      'Do not engage in "vote farming" by creating low-quality questions solely to generate voting activity for XP.',
    ],
  },
  {
    title: '3. Question Quality Standards',
    icon: MessageSquare,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    content: [
      'High-quality questions are the foundation of meaningful crowd wisdom. All questions should meet the following standards:',
    ],
    rules: [
      'Questions must be clear, specific, and answerable. Avoid vague or ambiguous wording.',
      'Provide sufficient context for voters to form an informed opinion.',
      'Questions must be genuine inquiries, not statements disguised as questions or rhetorical questions.',
      'For prediction markets, questions must have objectively verifiable outcomes with clear resolution criteria.',
      'Do not create duplicate questions. Search existing questions before creating a new one.',
      'Questions must not contain false premises, misleading statistics, or deliberately deceptive framing.',
      'Tag questions with appropriate categories to help users find relevant content.',
      'Questions must not be used to promote products, services, or personal agendas (no spam).',
    ],
  },
  {
    title: '4. Prohibited Content',
    icon: Ban,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    content: [
      'The following types of content are strictly prohibited on the Platform. Violations may result in immediate account suspension:',
    ],
    rules: [
      'Hate speech: content that promotes hatred, violence, or discrimination against individuals or groups based on race, ethnicity, nationality, religion, gender, sexual orientation, disability, or any other protected characteristic.',
      'Harassment and bullying: targeted abuse, threats, intimidation, stalking, doxxing (sharing private information), or persistent unwanted contact directed at other users.',
      'Violent content: graphic violence, threats of violence, glorification of violence, or content that incites harm against any individual or group.',
      'Sexually explicit content: pornography, sexual solicitation, or sexually explicit material of any kind.',
      'Illegal content: content that promotes, facilitates, or instructs others in illegal activities, including but not limited to drug trafficking, weapons dealing, fraud, or money laundering.',
      'Misinformation: deliberately false or misleading content presented as fact, particularly relating to public health, elections, or safety.',
      'Spam and commercial solicitation: unsolicited advertising, phishing attempts, pyramid schemes, or promotional content not relevant to the Platform.',
      'Impersonation: creating accounts or content that falsely represents another person, organization, or entity.',
      'Malware and exploits: sharing links to malicious software, phishing sites, or attempting to exploit Platform vulnerabilities.',
    ],
  },
  {
    title: '5. Prediction Market Integrity',
    icon: AlertTriangle,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    content: [
      'Prediction markets on Wisery must operate with fairness and transparency. The following rules apply to all prediction market activity:',
    ],
    rules: [
      'Do not trade on insider information or non-public knowledge that gives you an unfair advantage over other participants.',
      'Do not attempt to influence the outcome of a prediction market through actions outside the Platform.',
      'Do not create prediction markets with outcomes you can personally control or manipulate.',
      'Report any prediction markets with ambiguous resolution criteria or other integrity concerns.',
      'Do not engage in wash trading (simultaneously buying and selling the same position to artificially inflate volume).',
      'Accept prediction market resolutions in good faith. While you may appeal a resolution through the proper process, threats or harassment directed at resolvers will not be tolerated.',
      'Do not collude with other users to manipulate prediction market prices or outcomes.',
    ],
  },
  {
    title: '6. Reporting Violations',
    icon: Flag,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    content: [
      'If you encounter content or behavior that violates these Community Guidelines, please report it promptly. Your reports help us maintain a safe and productive community.',
    ],
    rules: [
      'Use the built-in report function on any question, comment, or user profile to flag violations.',
      'Provide a clear, specific description of the violation when submitting a report.',
      'Reports are reviewed by our moderation team within 24 hours for standard reports and within 4 hours for reports involving threats, harassment, or safety concerns.',
      'All reports are treated confidentially. We do not reveal the identity of the reporter to the reported user.',
      'Do not abuse the reporting system by submitting false or frivolous reports. Repeated false reports may result in action against your own account.',
      'For urgent safety concerns, contact us directly at safety@wisery.live.',
    ],
  },
];

const consequences = [
  {
    level: 'Level 1: Warning',
    description: 'First-time or minor violations result in a formal warning. The offending content will be removed and you will receive guidance on the specific rule that was violated.',
    color: 'border-yellow-500/30 bg-yellow-500/5',
    textColor: 'text-yellow-400',
  },
  {
    level: 'Level 2: Temporary Restriction',
    description: 'Repeated or moderate violations result in temporary restrictions on your account. This may include temporary loss of voting privileges, commenting restrictions, or reduced XP earning for a period of 7 to 30 days.',
    color: 'border-orange-500/30 bg-orange-500/5',
    textColor: 'text-orange-400',
  },
  {
    level: 'Level 3: Temporary Suspension',
    description: 'Serious violations or continued pattern of moderate violations result in account suspension for 30 to 90 days. During suspension, you cannot access any Platform features. WSR tokens in your wallet remain accessible.',
    color: 'border-red-500/30 bg-red-500/5',
    textColor: 'text-red-400',
  },
  {
    level: 'Level 4: Permanent Ban',
    description: 'Severe violations such as threats, doxxing, coordinated manipulation, or repeated serious offenses result in permanent account termination. Banned users may not create new accounts. This decision is subject to the appeals process.',
    color: 'border-red-700/30 bg-red-700/5',
    textColor: 'text-red-500',
  },
];

export default function GuidelinesPage() {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
            <Users className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Community Guidelines</h1>
            <p className="text-sm text-zinc-400">Last updated: March 19, 2026</p>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          These guidelines exist to ensure Wisery remains a trustworthy platform for collective
          intelligence. Every member plays a role in maintaining the integrity and quality of our
          community.
        </p>
      </motion.div>

      {/* Main Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${section.bg}`}>
                  <Icon className={section.color} size={18} />
                </div>
                <h2 className="text-xl font-semibold text-amber-400">{section.title}</h2>
              </div>

              {section.content.map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-4 text-sm leading-relaxed text-zinc-300">
                  {paragraph}
                </p>
              ))}

              <ol className="space-y-2.5">
                {section.rules.map((rule, rIndex) => (
                  <li key={rIndex} className="flex items-start gap-3 text-sm text-zinc-300">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-medium text-amber-400">
                      {rIndex + 1}
                    </span>
                    {rule}
                  </li>
                ))}
              </ol>
            </motion.section>
          );
        })}
      </div>

      {/* Consequences Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
      >
        <h2 className="mb-2 text-xl font-semibold text-amber-400">7. Consequences of Violations</h2>
        <p className="mb-6 text-sm text-zinc-300 leading-relaxed">
          Violations of these Community Guidelines are addressed through a progressive enforcement
          system. The severity of consequences depends on the nature and frequency of violations.
        </p>
        <div className="space-y-3">
          {consequences.map((item, index) => (
            <div key={index} className={`rounded-lg border p-4 ${item.color}`}>
              <h3 className={`mb-1 text-sm font-semibold ${item.textColor}`}>{item.level}</h3>
              <p className="text-sm text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Appeals Process */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
      >
        <h2 className="mb-4 text-xl font-semibold text-amber-400">8. Appeals Process</h2>
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-zinc-300">
            If you believe a moderation action taken against your account was unjust or made in error,
            you have the right to appeal. The appeals process works as follows:
          </p>
          <ol className="space-y-2.5">
            {[
              'Submit an appeal within fourteen (14) days of the moderation action by emailing appeals@wisery.live with your username, a description of the action taken, and your reason for appealing.',
              'Your appeal will be reviewed by a senior moderator who was not involved in the original decision. Reviews are conducted within seven (7) business days.',
              'You will receive a written response explaining the outcome of your appeal, including the reasoning behind the decision.',
              'If your appeal is upheld, the moderation action will be reversed and any penalties removed from your account. If your appeal is denied, you will receive a detailed explanation.',
              'Each moderation action may be appealed only once. The decision on appeal is final.',
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-zinc-300">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-medium text-amber-400">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
      >
        <p className="text-sm text-zinc-400">
          These guidelines are enforced to protect the integrity and safety of the Wisery community. By
          using the Platform, you agree to abide by these guidelines.
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link href="/terms" className="text-amber-400 hover:text-amber-300 transition-colors">
            Terms of Service
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/privacy" className="text-amber-400 hover:text-amber-300 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-zinc-600">|</span>
          <Link href="/rules" className="text-amber-400 hover:text-amber-300 transition-colors">
            Platform Rules
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
