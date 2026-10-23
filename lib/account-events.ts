import { siteUrl } from "@/lib/email"
import { emailLater, notifyAdmin, notifyUser } from "@/lib/notify"

/** Someone created an account: the admin is told, and the person gets a welcome email. */
export async function welcomeNewAccount(user: { id: string; name: string; email: string; method: string }) {
  await notifyAdmin({
    type: "ACCOUNT",
    title: `New account: ${user.name}`,
    body: `${user.email} signed up with ${user.method}.`,
    href: "/account/users",
  })
  emailLater({
    to: user.email,
    subject: "Welcome to Butterfly Decor",
    greeting: `Hello ${user.name},`,
    paragraphs: [
      "Thank you for joining Butterfly Decor. You can now save the looks you like, plan your Gusaba and reception list, and book the outfits and decor you choose.",
      "Add your birthday on your profile page and we will remember to celebrate it with you.",
      "If you have any question, simply reply to this email or call us.",
    ],
    action: { label: "Open your profile", href: siteUrl("/profile") },
  })
}

/** A vendor finished signing up: the admin reviews the profile before it is shown to couples. */
export async function vendorSignedUp(vendor: { id: string; name: string; email: string; businessName: string }) {
  await notifyAdmin({
    type: "VENDOR",
    title: `New vendor waiting for approval: ${vendor.businessName}`,
    body: `${vendor.name} (${vendor.email}) signed up as a vendor.`,
    href: "/account/vendors?status=PENDING",
    email: {
      subject: `New vendor to review: ${vendor.businessName}`,
      greeting: "Hello,",
      paragraphs: [
        `${vendor.name} has signed up as a vendor with the business name ${vendor.businessName} (${vendor.email}).`,
        "Their profile stays hidden from couples until you approve it in the dashboard.",
      ],
      action: { label: "Review the vendor", href: siteUrl("/account/vendors?status=PENDING") },
    },
  })
  await notifyUser(vendor, {
    type: "VENDOR",
    title: "Your profile is being reviewed",
    body: "Add your photos now: couples will see your page as soon as we approve it.",
    href: "/account/my-gallery",
    email: {
      subject: "We received your vendor profile",
      greeting: `Hello ${vendor.name},`,
      paragraphs: [
        `Thank you for joining Butterfly Decor as ${vendor.businessName}.`,
        "We look at every new vendor profile before couples can see it. This usually takes a day. Meanwhile, add your best photos and complete your profile, so your page is ready the moment it goes live.",
      ],
      action: { label: "Add your photos", href: siteUrl("/account/my-gallery") },
    },
  })
}
