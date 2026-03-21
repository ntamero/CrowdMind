'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Coins, ShieldAlert, Globe, FileWarning } from 'lucide-react';

const sections = [
  {
    title: '1. Nature of WSR Tokens',
    icon: Coins,
    content: [
      'The Wisery Score and Reputation (WSR) token is a digital utility token designed exclusively for use within the Wisery platform ecosystem. WSR tokens serve as a mechanism for participation in prediction markets, reputation tracking, and platform engagement.',
      'WSR tokens are NOT securities, shares, equity, bonds, debentures, or any other form of investment product. They do not represent ownership, control, or any financial interest in Wisery or any affiliated entity.',
      'WSR tokens do not entitle holders to dividends, revenue sharing, profit distribution, or any other form of financial return. They confer no governance rights, voting rights in corporate matters, or decision-making authority over Wisery as a company.',
    ],
  },
  {
    title: '2. No Investment Advice',
    icon: ShieldAlert,
    content: [
      'Nothing on the Wisery platform, in our documentation, marketing materials, social media posts, or community channels constitutes investment advice, financial advice, trading advice, or any other form of professional financial guidance.',
      'Wisery does not recommend that any user acquire WSR tokens as an investment. Any decision to acquire, hold, or dispose of WSR tokens should be made after conducting your own independent research and consulting with qualified financial, legal, and tax advisors.',
      'Past performance of WSR tokens, including any historical price data, is not indicative of future results. Any projections, forecasts, or forward-looking statements are speculative and should not be relied upon.',
      'Wisery employees, contractors, moderators, and community members are not licensed financial advisors. Any opinions expressed by these individuals regarding WSR tokens are personal views and should not be construed as investment advice.',
    ],
  },
  {
    title: '3. No Guaranteed Returns',
    content: [
      'There is no guarantee that WSR tokens will maintain any particular value, increase in value, or retain any value at all. The value of WSR tokens may decline to zero.',
      'Participation in prediction markets using WSR tokens involves the risk of partial or total loss of staked tokens. Prediction outcomes are inherently uncertain, and even well-informed predictions may prove incorrect.',
      'XP-to-WSR conversion rates (currently 250 XP = 1 WSR) are set by Wisery and may be modified, suspended, or discontinued at any time without prior notice.',
      'No representation, guarantee, or warranty is made regarding the liquidity of WSR tokens. There is no assurance that you will be able to exchange WSR tokens for other digital assets, fiat currency, or any other form of value.',
    ],
  },
  {
    title: '4. Volatility and Experimental Status',
    content: [
      'WSR tokens are inherently volatile. Their value may fluctuate dramatically in short periods due to market conditions, platform changes, technical issues, regulatory developments, or other factors beyond our control.',
      'The WSR token system is experimental technology. It is provided on an "as is" and "as available" basis. The underlying smart contracts, tokenomics, and distribution mechanisms may contain bugs, errors, or vulnerabilities.',
      'Wisery reserves the right to modify the WSR token\'s functionality, supply, distribution mechanism, conversion rates, or any other aspect of the token system at any time. Such changes may materially affect the value and utility of existing WSR tokens.',
      'The technology underlying WSR tokens, including blockchain networks and smart contracts, is still maturing and may be subject to unforeseen technical failures, network congestion, or security breaches.',
    ],
  },
  {
    title: '5. Testnet Status',
    content: [
      'WSR tokens are currently deployed on testnet infrastructure. This means the token system is in a testing and development phase and is not operating on a production blockchain mainnet.',
      'Testnet tokens have no inherent monetary value and are used solely for testing platform functionality, validating smart contract behavior, and allowing users to familiarize themselves with the token system.',
      'Testnet balances, transactions, and token holdings may be reset, modified, or deleted at any time without notice as part of the testing and development process.',
      'Migration from testnet to mainnet, if it occurs, is not guaranteed. The terms, conditions, and mechanics of any such migration will be communicated separately and may differ significantly from the current testnet configuration.',
      'Users should not rely on testnet token balances as representing actual or future value. Any resources spent acquiring testnet tokens through platform participation are at the user\'s own discretion.',
    ],
  },
  {
    title: '6. No Regulatory Approval',
    icon: FileWarning,
    content: [
      'WSR tokens have not been registered with, approved by, or endorsed by any securities regulatory authority, financial regulatory body, or government agency in any jurisdiction.',
      'This disclaimer does not constitute a prospectus, offering memorandum, or any other form of offering document under any securities law. No regulatory authority has examined or approved the information contained herein.',
      'The classification of WSR tokens under applicable laws and regulations is uncertain and may vary by jurisdiction. Regulatory developments may adversely affect the token\'s availability, functionality, or legality in certain regions.',
      'Wisery makes no representation or warranty that WSR tokens comply with the laws or regulations of any particular jurisdiction. Users are solely responsible for ensuring compliance with their local laws before acquiring or using WSR tokens.',
    ],
  },
  {
    title: '7. Risk Acknowledgment',
    content: [
      'By using WSR tokens or participating in the Wisery platform, you acknowledge and accept the following risks:',
    ],
    risks: [
      'Total loss of value: WSR tokens may become worthless. You should only use tokens you can afford to lose entirely.',
      'Smart contract risk: Bugs, exploits, or vulnerabilities in smart contracts could result in loss of tokens.',
      'Blockchain risk: Network failures, forks, congestion, or other blockchain issues may affect token functionality.',
      'Regulatory risk: Changes in laws or regulations may restrict or prohibit the use, transfer, or possession of WSR tokens.',
      'Technology risk: Platform outages, cyber attacks, data breaches, or technical failures may affect token access.',
      'Market risk: Token value may be affected by market sentiment, speculation, and factors unrelated to the Platform.',
      'Liquidity risk: You may not be able to sell, exchange, or transfer your WSR tokens when desired or at any price.',
      'Operational risk: Wisery may cease operations, undergo restructuring, or otherwise change in ways that affect the token system.',
      'Key personnel risk: The departure of key individuals from the Wisery team could adversely affect platform development.',
      'Third-party risk: Dependencies on third-party services (blockchain networks, oracles, APIs) introduce additional failure points.',
    ],
  },
  {
    title: '8. Jurisdictional Restrictions',
    icon: Globe,
    content: [
      'WSR tokens may not be available or legally permissible in all jurisdictions. It is your sole responsibility to determine whether acquiring, holding, or using WSR tokens is legal in your jurisdiction.',
      'Without limiting the generality of the foregoing, WSR tokens are not offered to, and should not be acquired by, persons who are residents, citizens, or located in jurisdictions where the distribution, holding, or use of digital tokens is prohibited, restricted, or subject to licensing requirements that have not been obtained.',
      'Wisery reserves the right to restrict or prohibit access to WSR token functionality for users in specific jurisdictions based on legal advice, regulatory guidance, or risk assessment.',
      'You represent and warrant that you are not a resident or citizen of any jurisdiction in which the acquisition, holding, or use of digital tokens is prohibited. You further represent that you are not subject to any sanctions programs or restricted party lists.',
      'Users who access the Platform from restricted jurisdictions do so at their own risk and are solely responsible for compliance with local laws. Wisery disclaims all liability for such use.',
    ],
  },
];

export default function DisclaimerPage() {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle className="text-red-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Token Disclaimer</h1>
            <p className="text-sm text-zinc-400">Last updated: March 19, 2026</p>
          </div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm font-medium text-red-400">
            IMPORTANT: Please read this disclaimer carefully before acquiring, holding, or using WSR
            tokens. This disclaimer contains critical information about the risks and limitations
            associated with WSR tokens.
          </p>
        </div>
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

            {section.risks && (
              <div className="mt-4 space-y-2">
                {section.risks.map((risk, rIndex) => (
                  <div
                    key={rIndex}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-medium text-red-400">
                      {rIndex + 1}
                    </span>
                    <p className="text-sm text-zinc-300">{risk}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        ))}
      </div>

      {/* Acknowledgment Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8 rounded-xl border border-orange-500/20 bg-orange-500/5 p-6"
      >
        <h3 className="mb-3 text-lg font-semibold text-orange-400">Acknowledgment</h3>
        <p className="text-sm leading-relaxed text-zinc-300">
          By using the Wisery platform and interacting with WSR tokens, you acknowledge that you have
          read, understood, and accepted all risks and limitations described in this disclaimer. You
          confirm that you are acquiring and using WSR tokens at your own risk and that Wisery shall
          not be liable for any losses, damages, or adverse consequences resulting from your use of
          WSR tokens.
        </p>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
      >
        <p className="text-sm text-zinc-400">
          This disclaimer is subject to change. Check back regularly for updates.
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
