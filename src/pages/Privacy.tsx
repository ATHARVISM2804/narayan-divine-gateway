import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";

const Privacy = () => {
  usePageTitle("Privacy Policy — Narayan Kripa");

  return (
    <main>
      <PageHero title="Privacy Policy" breadcrumb="Privacy Policy" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <p className="text-sm text-brown/50 mb-8 italic">Last updated: 11 May 2026</p>

        <div className="space-y-10 text-brown/80 leading-relaxed text-[15px]">

          {/* 1 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">1. Introduction</h2>
            <p>
              Narayan Kripa ("we", "our", or "us") operates the website <strong>narayankripa.com</strong> and
              associated services including online puja booking, chadhava offerings, pandit consultation, and
              related spiritual services. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your personal information when you visit our website or use our services. By using our
              website, you consent to the data practices described in this policy.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">2. Information We Collect</h2>
            <p className="mb-3">We may collect the following categories of information:</p>
            <h3 className="font-bold text-maroon mt-4 mb-2">2.1 Personal Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number / mobile number</li>
              <li>Postal / delivery address (for prasad shipment)</li>
              <li>Name, gotra, and nakshatra (for sankalp during pujas)</li>
            </ul>

            <h3 className="font-bold text-maroon mt-4 mb-2">2.2 Payment Information</h3>
            <p>
              Payment transactions are processed through <strong>Razorpay</strong>, a PCI-DSS compliant payment
              gateway. We do <strong>not</strong> store your credit/debit card numbers, CVV, or bank account
              details on our servers. Razorpay may collect and store such information in accordance with its own
              privacy policy.
            </p>

            <h3 className="font-bold text-maroon mt-4 mb-2">2.3 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>IP address and browser type</li>
              <li>Device information (operating system, screen resolution)</li>
              <li>Pages visited, time spent, and referral URLs</li>
              <li>Cookies and similar tracking technologies (see Section 6)</li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">We use the collected information for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>To process and fulfil your puja bookings and chadhava offerings</li>
              <li>To perform sankalp with your name and gotra during rituals</li>
              <li>To deliver prasad and blessings certificates to your address</li>
              <li>To send order confirmations, updates, and photo/video proof of ceremonies</li>
              <li>To process payments and issue refunds when applicable</li>
              <li>To communicate about our services, promotions, and important updates</li>
              <li>To improve our website, user experience, and customer service</li>
              <li>To comply with legal obligations and prevent fraud</li>
            </ul>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">4. Information Sharing & Disclosure</h2>
            <p className="mb-3">
              We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Payment Processors:</strong> We share necessary transaction details with Razorpay to
                process your payments securely.
              </li>
              <li>
                <strong>Temple Partners & Pandits:</strong> Your name, gotra, and sankalp details are shared with
                verified temple priests solely to perform the booked puja or chadhava in your name.
              </li>
              <li>
                <strong>Shipping / Courier Partners:</strong> Your delivery address and phone number are shared
                with courier services to deliver prasad to your doorstep.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information if required by law,
                regulation, legal process, or governmental request.
              </li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>SSL/TLS encryption for all data transmitted between your browser and our servers</li>
              <li>PCI-DSS compliant payment processing through Razorpay</li>
              <li>Secure cloud infrastructure with access controls and monitoring</li>
              <li>Regular security audits and vulnerability assessments</li>
            </ul>
            <p className="mt-3">
              While we strive to use commercially acceptable means to protect your personal information, no
              method of transmission over the Internet or electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">6. Cookies & Tracking Technologies</h2>
            <p>
              Our website uses cookies and similar technologies to enhance your browsing experience. Cookies are
              small text files stored on your device that help us:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Remember your language preference (English / Hindi)</li>
              <li>Maintain your login session</li>
              <li>Analyse website traffic and usage patterns</li>
              <li>Improve website performance and functionality</li>
            </ul>
            <p className="mt-3">
              You can control cookie settings through your browser preferences. Disabling cookies may affect
              certain features of our website.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">7. Your Rights</h2>
            <p className="mb-3">Under applicable Indian data protection laws, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate or incomplete information</li>
              <li>Request deletion of your personal information (subject to legal obligations)</li>
              <li>Withdraw consent for processing your data at any time</li>
              <li>Opt out of promotional communications by using the unsubscribe link in our emails</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">
                Asknarayankripa@gmail.com
              </a>
              .
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites or services (such as Razorpay's payment
              page). We are not responsible for the privacy practices of such third parties. We encourage you to
              read their privacy policies before providing any personal information.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">9. Children's Privacy</h2>
            <p>
              Our services are not directed at individuals under the age of 18. We do not knowingly collect
              personal information from children. If we become aware that a child under 18 has provided us with
              personal data, we will take steps to delete such information.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with
              a revised "Last updated" date. We encourage you to review this page periodically. Continued use
              of our website after any modifications constitutes your acceptance of the updated policy.
            </p>
          </div>

          {/* 11 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">11. Contact Us</h2>
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
            <div className="mt-4 bg-ivory p-6 rounded-xl border border-gold/30 space-y-1">
              <p className="font-bold text-maroon">Narayan Kripa</p>
              <p>Lanka, Varanasi, Uttar Pradesh 221005, India</p>
              <p>Email: <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">Asknarayankripa@gmail.com</a></p>
              <p>Phone: <a href="tel:+919286345941" className="text-saffron hover:text-maroon font-semibold">+91 92863 45941</a></p>
              <p>Support Hours: Mon–Sat, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Privacy;
