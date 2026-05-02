import PageHero from "@/components/PageHero";

const Privacy = () => {
  return (
    <main>
      <PageHero title="Privacy Policy" breadcrumb="Privacy Policy" />
      <section className="container py-16 md:py-24 max-w-4xl">
        <div className="space-y-8 text-brown/80 leading-relaxed">
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when using Narayan Kripa services, such as when you create an account, book a puja, or contact us for support. This may include your name, email address, phone number, and any other information you choose to provide.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">2. How We Use Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, communicate with you, and personalize your experience. We do not sell your personal information to third parties.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">3. Data Security</h2>
            <p>We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, or misuse. However, no data transmission over the internet or electronic storage system is completely secure.</p>
          </div>
          <div>
            <h2 className="text-2xl font-display text-maroon mb-4">4. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at hello@narayankripa.com.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Privacy;
