/** @type {import('next').NextConfig} */
const nextConfig = {
  // `output: 'export'` is not usable here: the build fails because the admin, the API
  // routes (login, uploads, bookings) and the proxy all need a running server.
  // Public pages get the same "already built" speed from the data cache in lib/data.ts.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
