import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";

const Shipping = () => {
  usePageTitle("Shipping & Delivery Policy — Narayan Kripa");

  return (
    <main>
      <PageHero title="Shipping & Delivery Policy" breadcrumb="Shipping Policy" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <p className="text-sm text-brown/50 mb-8 italic">Last updated: 11 May 2026</p>

        <div className="space-y-10 text-brown/80 leading-relaxed text-[15px]">

          {/* 1 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">1. Overview</h2>
            <p>
              Narayan Kripa provides both <strong>digital services</strong> (puja videos, certificates, live
              darshan) and <strong>physical delivery</strong> (prasad, blessings certificates) as part of our
              spiritual service offerings. This Shipping & Delivery Policy explains how and when you can
              expect to receive both digital and physical deliverables.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">2. Digital Deliverables</h2>
            <p className="mb-3">The following items are delivered digitally after the puja or chadhava is performed:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gold/30 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-cream">
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Deliverable</th>
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Mode</th>
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gold/20">
                    <td className="px-4 py-3">HD Puja / Chadhava Video</td>
                    <td className="px-4 py-3">WhatsApp / Email</td>
                    <td className="px-4 py-3">Within 24 – 48 hours after the ceremony</td>
                  </tr>
                  <tr className="border-b border-gold/20 bg-ivory">
                    <td className="px-4 py-3">Digital Blessings Certificate</td>
                    <td className="px-4 py-3">WhatsApp / Email</td>
                    <td className="px-4 py-3">Within 24 – 48 hours after the ceremony</td>
                  </tr>
                  <tr className="border-b border-gold/20">
                    <td className="px-4 py-3">Puja Photos</td>
                    <td className="px-4 py-3">WhatsApp / Email</td>
                    <td className="px-4 py-3">Within 24 – 48 hours after the ceremony</td>
                  </tr>
                  <tr className="bg-ivory">
                    <td className="px-4 py-3">Sankalp Confirmation</td>
                    <td className="px-4 py-3">WhatsApp</td>
                    <td className="px-4 py-3">During or immediately after the ceremony</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm">
              <strong>Note:</strong> Digital deliverables are sent to the WhatsApp number and/or email address
              provided during checkout. Please ensure your contact details are accurate.
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">3. Physical Delivery (Prasad)</h2>

            <h3 className="font-bold text-maroon mt-4 mb-2">3.1 Prasad Shipment</h3>
            <p className="mb-3">
              Blessed prasad from the puja or chadhava is carefully packaged and shipped to the delivery
              address provided during checkout. Prasad delivery is included for eligible puja packages.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gold/30 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-cream">
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Delivery Zone</th>
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Estimated Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gold/20">
                    <td className="px-4 py-3">Metro Cities (Delhi, Mumbai, Bangalore, Kolkata, Chennai, Hyderabad)</td>
                    <td className="px-4 py-3">5 – 7 business days</td>
                  </tr>
                  <tr className="border-b border-gold/20 bg-ivory">
                    <td className="px-4 py-3">Tier-2 Cities & Towns</td>
                    <td className="px-4 py-3">7 – 10 business days</td>
                  </tr>
                  <tr className="border-b border-gold/20">
                    <td className="px-4 py-3">Remote / Rural Areas</td>
                    <td className="px-4 py-3">10 – 15 business days</td>
                  </tr>
                  <tr className="bg-ivory">
                    <td className="px-4 py-3">International (NRI Devotees)</td>
                    <td className="px-4 py-3">15 – 25 business days (subject to customs)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-bold text-maroon mt-6 mb-2">3.2 Shipping Coverage</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We ship prasad across <strong>all pin codes in India</strong> via reputed courier partners.</li>
              <li>International shipping is available for select countries. Please contact us to confirm delivery to your country.</li>
              <li>Certain remote locations or areas affected by natural calamities may experience delays.</li>
            </ul>

            <h3 className="font-bold text-maroon mt-6 mb-2">3.3 Shipping Charges</h3>
            <p>
              Shipping charges for prasad delivery are <strong>included in the puja/chadhava price</strong> for
              deliveries within India. International shipping may attract additional charges which will be
              communicated before confirmation.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">4. Tracking Your Delivery</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Once your prasad is dispatched, you will receive a <strong>tracking number</strong> via WhatsApp and/or email.</li>
              <li>You can track your shipment using the courier partner's tracking portal.</li>
              <li>For tracking inquiries, contact us at{" "}
                <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">Asknarayankripa@gmail.com</a>{" "}
                or call{" "}
                <a href="tel:+919286345941" className="text-saffron hover:text-maroon font-semibold">+91 92863 45941</a>.
              </li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">5. Delivery Issues</h2>

            <h3 className="font-bold text-maroon mt-4 mb-2">5.1 Failed Delivery</h3>
            <p>
              If the courier is unable to deliver the prasad due to an incorrect address, unavailability at
              the delivery location, or refusal to accept, the package will be returned to us. In such cases:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>We will contact you to confirm the correct address.</li>
              <li>Re-shipment may incur additional shipping charges.</li>
            </ul>

            <h3 className="font-bold text-maroon mt-6 mb-2">5.2 Damaged or Lost Shipments</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>If your prasad arrives damaged, please contact us within <strong>48 hours</strong> of delivery with photos of the damaged package.</li>
              <li>We will arrange a <strong>replacement shipment</strong> at no additional cost.</li>
              <li>If a shipment is lost in transit, we will either reship the prasad or issue a refund for the prasad component after investigation with the courier partner.</li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">6. Important Notes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delivery timelines are <strong>estimates</strong> and may vary due to courier delays, public holidays, weather conditions, or unforeseen circumstances.</li>
              <li>Please ensure your <strong>delivery address, pin code, and phone number</strong> are accurate during checkout. We are not responsible for delays caused by incorrect address information.</li>
              <li>Prasad is sacred and perishable in nature. Please accept delivery promptly and store appropriately.</li>
              <li>For puja packages that <strong>do not include prasad delivery</strong>, only digital deliverables (video, certificate, photos) will be provided.</li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">7. Contact Us</h2>
            <p>For any shipping or delivery related queries, please contact us:</p>
            <div className="mt-4 bg-ivory p-6 rounded-xl border border-gold/30 space-y-1">
              <p className="font-bold text-maroon">Narayan Kripa</p>
              <p>Lanka, Varanasi, Uttar Pradesh 221005, India</p>
              <p>Email: <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">Asknarayankripa@gmail.com</a></p>
              <p>Phone: <a href="tel:+919286345941" className="text-saffron hover:text-maroon font-semibold">+91 92863 45941</a></p>
              <p>WhatsApp: +91 92863 45941</p>
              <p>Support Hours: Mon–Sat, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Shipping;
