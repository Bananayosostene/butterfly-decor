/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: 'export'` is not usable here: the build fails because the admin, the API
  // routes (login, uploads, bookings) and the proxy all need a running server.
  // Public pages get the same "already built" speed from the data cache in lib/data.ts.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Items used to have their own page; old shared links now open the gallery popup instead.
  async redirects() {
    return [
      { source: "/collection/:id", destination: "/collection?item=:id", permanent: false },
      // The step-by-step courses were replaced by the planning sheet on one page.
      { source: "/wedding-planning/:plan", destination: "/wedding-planning", permanent: false },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
