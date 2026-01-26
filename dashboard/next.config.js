/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Make MIMIC data files optional - won't break build if missing
    config.externals = config.externals || [];

    if (isServer) {
      // Allow require() to fail gracefully for MIMIC files
      const originalExternals = config.externals;
      config.externals = [
        ...Array.isArray(originalExternals) ? originalExternals : [originalExternals],
      ];
    }

    // Ignore missing MIMIC files during build
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack').ContextReplacementPlugin)(
        /lib/,
        (context) => {
          if (context.request.includes('mimic')) {
            delete context.dependencies;
          }
        }
      )
    );

    return config;
  },
}

module.exports = nextConfig
