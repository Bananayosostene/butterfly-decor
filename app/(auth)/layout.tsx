import { Header } from "@/components/header";

/**
 * Sign-in and sign-up: the header only, with no footer under the form. The page area stretches
 * to fill whatever is left of the screen under the header, on any screen size.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col" style={{ minHeight: "100dvh" }}>
      <Header />
      <main className="flex-1 flex flex-col pb-20 md:pb-0">{children}</main>
    </div>
  );
}
