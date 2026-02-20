import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function ContactPage() {
  const whatsappUrl =
    "https://wa.me/+250788724867?text=Hello%20Butterfly%20Ltd%2C%20I%20have%20a%20question";
  const instagramUrl = "https://www.instagram.com/sostene_____/";

  return (
    <>
      <Header />
      <main>
        {/* Page Header */}
        <section className="py-16 px-4 bg-muted border-b border-border">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Get in touch with us through your preferred channel.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* WhatsApp */}
              <div className="p-8 bg-card border border-border rounded-lg text-center hover:shadow-lg transition-smooth">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  WhatsApp
                </h3>
                <p className="text-muted-foreground mb-6">
                  Chat with us instantly on WhatsApp. We respond quickly to
                  messages.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth"
                >
                  Open WhatsApp
                </a>
              </div>

              {/* Instagram */}
              <div className="p-8 bg-card border border-border rounded-lg text-center hover:shadow-lg transition-smooth">
                <div className="text-5xl mb-4">📷</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Instagram
                </h3>
                <p className="text-muted-foreground mb-6">
                  Follow us on Instagram to see our latest decoration projects.
                </p>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth"
                >
                  Follow on Instagram
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-16 p-8 bg-muted rounded-lg border border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Quick Info
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Phone</p>
                  <p>+1 (234) 567-8900</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Email</p>
                  <p>
                    <a
                      href="mailto:info@butterflyltd.com"
                      className="hover:text-accent transition-smooth"
                    >
                      info@butterflyltd.com
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">
                    Preferred Contact
                  </p>
                  <p>WhatsApp for fastest response</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <p className="text-lg text-muted-foreground mb-6">
                Ready to book your event?
              </p>
              <Link
                href="/book"
                className="inline-block px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth text-lg"
              >
                Start Booking
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
