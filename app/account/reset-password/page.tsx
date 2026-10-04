import ResetPasswordForm from "./reset-password-form";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#fdf6ee" }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-4xl mb-3">🦋</div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#2b1807" }}>Set a new password</h1>
          <p className="text-sm" style={{ color: "#835105" }}>This also unlocks your account</p>
        </div>
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
