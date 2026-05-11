import { usePageTitle } from "@/hooks/use-page-title";
import PageHero from "@/components/PageHero";

const Grievance = () => {
  usePageTitle("Grievance Redressal — Narayan Kripa");

  return (
    <main>
      <PageHero title="Grievance Redressal" breadcrumb="Grievance Redressal" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <p className="text-sm text-brown/50 mb-8 italic">Last updated: 11 May 2026</p>

        <div className="space-y-10 text-brown/80 leading-relaxed text-[15px]">

          {/* 1 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">1. Our Commitment</h2>
            <p>
              At Narayan Kripa, we strive to provide the highest quality spiritual services with devotion and
              integrity. We are committed to addressing any concerns, complaints, or grievances you may have
              regarding our services in a fair, transparent, and timely manner. This Grievance Redressal
              Policy is in accordance with the <strong>Information Technology Act, 2000</strong> and the
              <strong> Consumer Protection Act, 2019</strong>.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">2. Grievance Officer</h2>
            <p className="mb-3">
              In compliance with the Information Technology Act, 2000 and the rules made thereunder, we have
              appointed a Grievance Officer to address your concerns. You may contact the Grievance Officer
              for any issues related to our services, data privacy, payment disputes, or content on our website.
            </p>
            <div className="bg-ivory p-6 rounded-xl border border-gold/30 space-y-1">
              <p className="font-bold text-maroon text-lg">Grievance Officer Details</p>
              <div className="mt-3 space-y-1">
                <p><strong>Name:</strong> Mr. Amit Sharma</p>
                <p><strong>Designation:</strong> Grievance Officer, Narayan Kripa</p>
                <p><strong>Address:</strong> Lanka, Varanasi, Uttar Pradesh 221005, India</p>
                <p><strong>Email:</strong>{" "}
                  <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">
                    Asknarayankripa@gmail.com
                  </a>
                </p>
                <p><strong>Phone:</strong>{" "}
                  <a href="tel:+919286345941" className="text-saffron hover:text-maroon font-semibold">
                    +91 92863 45941
                  </a>
                </p>
                <p><strong>Working Hours:</strong> Monday to Saturday, 10:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">3. How to File a Grievance</h2>
            <p className="mb-3">You may file a grievance through any of the following channels:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Email:</strong> Send a detailed description of your complaint to{" "}
                <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">
                  Asknarayankripa@gmail.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong> Call us at{" "}
                <a href="tel:+919286345941" className="text-saffron hover:text-maroon font-semibold">
                  +91 92863 45941
                </a>{" "}
                during working hours
              </li>
              <li><strong>WhatsApp:</strong> Message us at +91 92863 45941</li>
              <li>
                <strong>Postal Mail:</strong> Write to us at — Narayan Kripa, Lanka, Varanasi, Uttar Pradesh
                221005, India
              </li>
            </ul>

            <p className="mt-4 mb-2 font-semibold text-maroon">Please include the following information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your full name and registered email address or phone number</li>
              <li>Order ID or booking reference number (if applicable)</li>
              <li>A detailed description of the grievance</li>
              <li>Any supporting documents, screenshots, or evidence</li>
              <li>The relief or resolution you are seeking</li>
            </ul>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">4. Resolution Process</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gold/30 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-cream">
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Step</th>
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Action</th>
                    <th className="text-left px-4 py-3 text-maroon font-display border-b border-gold/30">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gold/20">
                    <td className="px-4 py-3 font-semibold text-maroon">1. Acknowledgement</td>
                    <td className="px-4 py-3">We acknowledge receipt of your grievance via email or phone</td>
                    <td className="px-4 py-3">Within 48 hours</td>
                  </tr>
                  <tr className="border-b border-gold/20 bg-ivory">
                    <td className="px-4 py-3 font-semibold text-maroon">2. Investigation</td>
                    <td className="px-4 py-3">The Grievance Officer investigates the complaint with relevant teams</td>
                    <td className="px-4 py-3">3 – 7 working days</td>
                  </tr>
                  <tr className="border-b border-gold/20">
                    <td className="px-4 py-3 font-semibold text-maroon">3. Resolution</td>
                    <td className="px-4 py-3">A resolution or response is communicated to you</td>
                    <td className="px-4 py-3">Within 15 working days</td>
                  </tr>
                  <tr className="bg-ivory">
                    <td className="px-4 py-3 font-semibold text-maroon">4. Escalation</td>
                    <td className="px-4 py-3">If unsatisfied, you may escalate to senior management</td>
                    <td className="px-4 py-3">Additional 7 working days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">5. Types of Grievances</h2>
            <p className="mb-3">We handle grievances related to, but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment issues — duplicate charges, failed refunds, incorrect deductions</li>
              <li>Service quality — puja not performed as described, missing deliverables</li>
              <li>Delivery issues — prasad not received, damaged shipment, incorrect address</li>
              <li>Data privacy — unauthorised use of personal information, data breach concerns</li>
              <li>Website content — objectionable content, copyright concerns</li>
              <li>Customer service — unsatisfactory support experience</li>
            </ul>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">6. External Remedies</h2>
            <p className="mb-3">
              If you are not satisfied with our resolution, you may seek external remedies available under
              Indian law:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Consumer Helpline:</strong> National Consumer Helpline — 1800-11-4000 or{" "}
                <a href="https://consumerhelpline.gov.in" target="_blank" rel="noopener noreferrer" className="text-saffron hover:text-maroon font-semibold">
                  consumerhelpline.gov.in
                </a>
              </li>
              <li>
                <strong>Consumer Forum:</strong> You may file a complaint with the District Consumer Disputes
                Redressal Commission or the State Consumer Disputes Redressal Commission.
              </li>
              <li>
                <strong>Online Dispute Resolution:</strong> Visit{" "}
                <a href="https://edaakhil.nic.in" target="_blank" rel="noopener noreferrer" className="text-saffron hover:text-maroon font-semibold">
                  edaakhil.nic.in
                </a>{" "}
                to file complaints online.
              </li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">7. Contact Us</h2>
            <p>For any grievances or complaints, please contact us:</p>
            <div className="mt-4 bg-ivory p-6 rounded-xl border border-gold/30 space-y-1">
              <p className="font-bold text-maroon">Narayan Kripa</p>
              <p>Lanka, Varanasi, Uttar Pradesh 221005, India</p>
              <p>Email: <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">Asknarayankripa@gmail.com</a></p>
              <p>General Enquiry: <a href="mailto:Asknarayankripa@gmail.com" className="text-saffron hover:text-maroon font-semibold">Asknarayankripa@gmail.com</a></p>
              <p>Phone: <a href="tel:+919286345941" className="text-saffron hover:text-maroon font-semibold">+91 92863 45941</a></p>
              <p>Support Hours: Mon–Sat, 9:00 AM – 7:00 PM IST</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Grievance;
