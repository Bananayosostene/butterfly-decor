import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PhoneForm from "./phone-form";

export const metadata = { title: "Complete sign-up" };

export default async function GoogleCompletePage() {
  const store = await cookies();
  if (!store.get("google_pending")?.value) redirect("/login");
  return (
    <div
      className="relative flex-1 flex items-center justify-center px-4 py-6 overflow-hidden"
      style={{ background: "#fbf7f2" }}
    >
      <PhoneForm />
    </div>
  );
}
