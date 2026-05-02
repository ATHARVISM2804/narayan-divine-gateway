import PageHero from "@/components/PageHero";

const Grievance = () => {
  return (
    <main>
      <PageHero title="Grievance Redressal" breadcrumb="Grievance" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <div className="space-y-8 text-brown/80 leading-relaxed">
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">Our Commitment</h2>
            <p>At Narayan Kripa, we strive to provide the highest quality spiritual services. If you have any concerns, complaints, or grievances regarding our services, we are committed to addressing them promptly and fairly.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">Grievance Officer</h2>
            <p>In accordance with the Information Technology Act, 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:</p>
            <div className="mt-4 bg-ivory p-6 rounded-xl border border-gold/30">
              <p className="font-bold text-maroon">Mr. Amit Sharma</p>
              <p>Narayan Kripa Spiritual Services</p>
              <p>Varanasi, Uttar Pradesh, India</p>
              <p>Email: grievance@narayankripa.com</p>
              <p>Phone: +91 98765 43210 (Mon-Fri, 10 AM to 6 PM)</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">Resolution Process</h2>
            <p>Upon receiving a grievance, our officer will acknowledge it within 48 hours and strive to resolve the issue within 15 working days from the date of receipt. We appreciate your patience during this process.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Grievance;
