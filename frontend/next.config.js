module.exports = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8000',
        pathname: '/images/**',
      },
    ],
  },
}