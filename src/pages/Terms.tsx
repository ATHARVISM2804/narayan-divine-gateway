import PageHero from "@/components/PageHero";

const Terms = () => {
  return (
    <main>
      <PageHero title="Terms & Conditions" breadcrumb="Terms" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <div className="space-y-8 text-brown/80 leading-relaxed">
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Narayan Kripa's services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">2. Service Description</h2>
            <p>Narayan Kripa provides online puja booking, live darshan, pandit consultation, and other spiritual services. We reserve the right to modify or discontinue any service without notice.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">3. User Responsibilities</h2>
            <p>You agree to provide accurate and complete information when booking services. You are responsible for maintaining the confidentiality of any account credentials.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">4. Refunds & Cancellations</h2>
            <p>Pujas and services once booked are subject to our cancellation policy. Refunds are evaluated on a case-by-case basis and must be requested at least 24 hours prior to the scheduled service.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Terms;
