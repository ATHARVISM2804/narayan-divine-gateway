import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";

const Refund = () => {
  usePageTitle("Refund & Cancellation Policy | Narayan Kripa");

  return (
    <main>
      <PageHero title="Refund & Cancellation Policy" breadcrumb="Refund Policy" />
      <section className="container max-w-3xl py-8 md:py-12">
        <p className="text-sm mb-6 text-ink-soft">Last updated: 11 May 2026</p>

        <div className="space-y-10 text-ink-muted leading-relaxed text-[15px]">

          {/* 1 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">1. Overview</h2>
            <p>
              At Narayan Kripa, we are committed to delivering sacred and authentic spiritual services. We
              understand that there may be occasions where you need to cancel a booking or request a refund.
              This Refund & Cancellation Policy outlines the terms and procedures for the same.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">2. Cancellation Policy</h2>

            <h3 className="font-semibold text-ink mt-4 mb-2">2.1 Pooja Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-line rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-surface-muted">
                    <th className="text-left px-4 py-3 text-ink font-semibold border-b border-line">Cancellation Timeframe</th>
                    <th className="text-left px-4 py-3 text-ink font-semibold border-b border-line">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3">More than 48 hours before scheduled pooja</td>
                    <td className="px-4 py-3 font-semibold text-green-700">100% refund</td>
                  </tr>
                  <tr className="border-b border-line bg-surface">
                    <td className="px-4 py-3">24 – 48 hours before scheduled pooja</td>
                    <td className="px-4 py-3 font-semibold text-saffron">75% refund</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3">Less than 24 hours before scheduled pooja</td>
                    <td className="px-4 py-3 font-semibold text-red-600">No refund</td>
                  </tr>
                  <tr className="bg-surface">
                    <td className="px-4 py-3">After pooja has been performed</td>
                    <td className="px-4 py-3 font-semibold text-red-600">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-ink mt-6 mb-2">2.2 Chadhava Offerings</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Chadhava offerings can be cancelled for a <strong>full refund</strong> if the cancellation is made <strong>before the offering has been performed</strong> at the temple.</li>
              <li>Once the chadhava has been offered at the temple, <strong>no refund</strong> will be provided as the offering cannot be reversed.</li>
              <li>If we are unable to perform the chadhava due to temple closure or other unavoidable reasons, a <strong>100% refund</strong> will be automatically processed.</li>
            </ul>

            <h3 className="font-semibold text-ink mt-6 mb-2">2.3 Pandit Consultation</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Consultations can be cancelled up to <strong>12 hours before</strong> the scheduled session for a <strong>full refund</strong>.</li>
              <li>No-shows or cancellations within 12 hours of the scheduled session are <strong>non-refundable</strong>.</li>
              <li>If a pandit is unavailable for the scheduled session, you may choose a rescheduled session or a full refund.</li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">3. Refund Eligibility</h2>
            <p className="mb-3">Refunds may be issued in the following circumstances:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service not delivered:</strong> If a pooja or chadhava was not performed despite successful payment.</li>
              <li><strong>Duplicate payment:</strong> If you were charged more than once for the same booking.</li>
              <li><strong>Technical error:</strong> If a system or payment gateway error resulted in an incorrect charge.</li>
              <li><strong>Service cancellation by us:</strong> If Narayan Kripa cancels a service due to unforeseen circumstances (natural calamities, temple closures, etc.).</li>
            </ul>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">4. Non-Refundable Cases</h2>
            <p className="mb-3">Refunds will <strong>not</strong> be issued in the following cases:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Pooja or chadhava has already been performed</li>
              <li>Dissatisfaction with spiritual or astrological outcomes (as results are based on faith and belief)</li>
              <li>Failure to provide correct personal details (name, gotra, etc.) leading to sankalp errors</li>
              <li>Cancellation requests made after the applicable cancellation window</li>
              <li>Change of mind after the service has been initiated</li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">5. Refund Process</h2>

            <h3 className="font-semibold text-ink mt-4 mb-2">5.1 How to Request a Refund</h3>
            <p className="mb-3">To request a cancellation or refund, please contact us through any of the following channels:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email: <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron-dark hover:underline font-semibold">Asknarayankripa@gmail.com</a></li>
              <li>Phone: <a href="tel:+919286345941" className="text-saffron-dark hover:underline font-semibold">+91 92863 45941</a> (Mon–Sat, 9 AM – 7 PM IST)</li>
              <li>WhatsApp: +91 92863 45941</li>
            </ul>
            <p className="mt-3">Please include the following in your request:</p>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Your order ID / booking reference number</li>
              <li>Registered email address or phone number</li>
              <li>Reason for cancellation / refund</li>
            </ul>

            <h3 className="font-semibold text-ink mt-6 mb-2">5.2 Refund Timeline</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-line rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-surface-muted">
                    <th className="text-left px-4 py-3 text-ink font-semibold border-b border-line">Step</th>
                    <th className="text-left px-4 py-3 text-ink font-semibold border-b border-line">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3">Acknowledgement of refund request</td>
                    <td className="px-4 py-3">Within 24 hours</td>
                  </tr>
                  <tr className="border-b border-line bg-surface">
                    <td className="px-4 py-3">Review and approval</td>
                    <td className="px-4 py-3">1 – 3 business days</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="px-4 py-3">Refund initiated to original payment method</td>
                    <td className="px-4 py-3">Within 5 – 7 business days of approval</td>
                  </tr>
                  <tr className="bg-surface">
                    <td className="px-4 py-3">Reflection in bank / wallet statement</td>
                    <td className="px-4 py-3">5 – 10 business days (depends on your bank)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-ink mt-6 mb-2">5.3 Refund Method</h3>
            <p>
              All approved refunds will be credited back to the <strong>original payment method</strong> used
              during the transaction (credit card, debit card, UPI, net banking, or wallet). We do not offer
              refunds in cash or via alternative payment methods.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">6. Rescheduling</h2>
            <p>
              If you wish to reschedule a pooja or consultation instead of cancelling, please contact us at least
              24 hours before the scheduled date. Rescheduling is subject to availability and may be accommodated
              at no extra charge for the first instance. Subsequent rescheduling requests may incur additional fees.
            </p>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">7. Disputes</h2>
            <p>
              If you are dissatisfied with our refund decision, you may escalate the matter to our Grievance
              Officer. Please visit our{" "}
              <Link to="/grievance" className="text-saffron-dark hover:underline font-semibold underline">
                Grievance Redressal
              </Link>{" "}
              page for contact details and the resolution process. We aim to resolve all disputes amicably
              within 15 working days.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-4">8. Contact Us</h2>
            <p>For any questions regarding this Refund & Cancellation Policy, please reach out to us:</p>
            <div className="mt-4 bg-surface p-6 rounded-xl border border-line space-y-1">
              <p className="font-semibold text-ink">Narayan Kripa</p>
              <p>Lanka, Varanasi, Uttar Pradesh 221005, India</p>
              <p>Email: <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron-dark hover:underline font-semibold">Asknarayankripa@gmail.com</a></p>
              <p>Phone: <a href="tel:+919286345941" className="text-saffron-dark hover:underline font-semibold">+91 92863 45941</a></p>
              <p>Support Hours: Mon–Sat, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Refund;
