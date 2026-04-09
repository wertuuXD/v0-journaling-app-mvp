/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  ...(typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
  }),
}

export default nextConfig
