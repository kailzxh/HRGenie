/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ui-avatars.com'],
    unoptimized: true
  },
  transpilePackages: ['three'],
}

module.exports = nextConfig
