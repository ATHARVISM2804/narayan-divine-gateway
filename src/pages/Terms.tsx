import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";

const Terms = () => {
  usePageTitle("Terms & Conditions — Narayan Kripa");

  return (
    <main>
      <PageHero title="Terms & Conditions" breadcrumb="Terms & Conditions" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <p className="text-sm text-brown/50 mb-8 italic">Last updated: 11 May 2026</p>

        <div className="space-y-10 text-brown/80 leading-relaxed text-[15px]">

          {/* 1 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using the website <strong>narayankripa.com</strong> ("Website") and
              the services offered by Narayan Kripa ("we", "our", or "Company"), you ("User", "you", or
              "your") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree with
              any part of these Terms, you must not use our Website or services.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">2. About Our Services</h2>
            <p className="mb-3">Narayan Kripa is an online platform that provides the following spiritual services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Online Puja Booking:</strong> Book sacred pujas performed by verified, experienced pandits at partnered temples across India.</li>
              <li><strong>Chadhava Offerings:</strong> Offer chadhava (sacred offerings) at revered temples on your behalf.</li>
              <li><strong>Pandit Consultation:</strong> Connect with certified Vedic acharyas for kundali reading, marriage matching, vastu consultation, and other astrological guidance.</li>
              <li><strong>Prasad Delivery:</strong> Receive blessed prasad and blessings certificates delivered to your doorstep.</li>
              <li><strong>Live Darshan:</strong> Watch live and recorded aarti from sacred temples across India.</li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">3. Eligibility</h2>
            <p>
              To use our services, you must be at least 18 years of age and legally capable of entering into
              binding contracts under Indian law. By using our services, you represent and warrant that you
              meet these requirements.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">4. User Account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You may create an account to track your orders and access order history.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to provide accurate, current, and complete information during registration.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">5. Booking & Order Process</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All puja and chadhava bookings are subject to availability and confirmation.</li>
              <li>By placing an order, you make an offer to purchase our services at the listed price.</li>
              <li>An order is confirmed only upon successful payment and receipt of a confirmation notification.</li>
              <li>We reserve the right to refuse or cancel any order for reasons including pricing errors, service unavailability, or suspected fraudulent activity.</li>
              <li>Puja dates mentioned on our website are indicative. In case of unforeseen circumstances (natural calamities, temple closures, or religious observances), we may reschedule the puja to the nearest auspicious date and inform you accordingly.</li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">6. Pricing & Payment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices displayed on the Website are in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>We reserve the right to change prices at any time without prior notice. However, price changes will not affect orders that have already been confirmed.</li>
              <li>Payments are processed securely through <strong>Razorpay</strong>, a PCI-DSS compliant payment gateway. We accept UPI, credit/debit cards, net banking, and digital wallets.</li>
              <li>You agree that you are authorised to use the payment method you provide at the time of purchase.</li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">7. Refund & Cancellation</h2>
            <p>
              Please refer to our{" "}
              <a href="/refund-policy" className="text-saffron hover:text-maroon font-semibold underline">
                Refund & Cancellation Policy
              </a>{" "}
              for detailed information on cancellations, refund eligibility, timelines, and the refund process.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">8. Shipping & Delivery</h2>
            <p>
              Please refer to our{" "}
              <a href="/shipping-policy" className="text-saffron hover:text-maroon font-semibold underline">
                Shipping & Delivery Policy
              </a>{" "}
              for details on prasad delivery timelines, coverage areas, and delivery procedures.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">9. Intellectual Property</h2>
            <p>
              All content on this Website — including text, images, logos, graphics, icons, videos, and software
              — is the property of Narayan Kripa or its content suppliers and is protected by Indian and
              international copyright, trademark, and intellectual property laws. You may not reproduce,
              distribute, modify, or create derivative works from any content without our prior written consent.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">10. User Conduct</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use our services for any unlawful or prohibited purpose</li>
              <li>Provide false or misleading information during booking or registration</li>
              <li>Interfere with or disrupt the Website's functionality or servers</li>
              <li>Attempt to gain unauthorised access to any part of the Website</li>
              <li>Use automated scripts, bots, or tools to access or scrape the Website</li>
              <li>Engage in any activity that could harm, disable, or impair the Website</li>
            </ul>
          </div>

          {/* 11 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">11. Disclaimer of Warranties</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our services are provided on an "as is" and "as available" basis without warranties of any kind, either express or implied.</li>
              <li>We do not guarantee uninterrupted, error-free, or secure access to our Website.</li>
              <li>While we work with verified pandits and temple partners, we do not guarantee specific spiritual outcomes or results from any puja, chadhava, or consultation service.</li>
              <li>Astrological and pandit consultations are for guidance purposes only and should not be considered a substitute for professional medical, legal, or financial advice.</li>
            </ul>
          </div>

          {/* 12 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">12. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Narayan Kripa, its directors, employees, and partners
              shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              arising out of or relating to your use of our services, including but not limited to loss of
              profits, data, or goodwill, even if we have been advised of the possibility of such damages. Our
              total liability shall not exceed the amount paid by you for the specific service giving rise to
              the claim.
            </p>
          </div>

          {/* 13 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Narayan Kripa, its affiliates, officers,
              directors, employees, and agents from and against any claims, liabilities, damages, losses, and
              expenses (including legal fees) arising out of or related to your use of the Website, violation
              of these Terms, or infringement of any third-party rights.
            </p>
          </div>

          {/* 14 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">14. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
              arising from these Terms or your use of our services shall be subject to the exclusive
              jurisdiction of the courts in <strong>Varanasi, Uttar Pradesh, India</strong>.
            </p>
          </div>

          {/* 15 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">15. Modifications to Terms</h2>
            <p>
              We reserve the right to modify or update these Terms at any time. Changes will be effective
              immediately upon posting on this page. Your continued use of the Website after such changes
              constitutes your acceptance of the revised Terms. We encourage you to review this page
              periodically.
            </p>
          </div>

          {/* 16 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid by a court of competent
              jurisdiction, the remaining provisions shall remain in full force and effect.
            </p>
          </div>

          {/* 17 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">17. Contact Us</h2>
            <p>If you have any questions about these Terms and Conditions, please contact us:</p>
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

export default Terms;
