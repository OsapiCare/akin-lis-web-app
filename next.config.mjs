/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // https://www.gravatar.com/avatar/f0deb0d98d21d26c3bc4a69c61bc9ff7
        protocol: "https",
        hostname: "www.gravatar.com",
        port: "",
        pathname: "/avatar/**",
      },
      {
        protocol: "https",
        hostname: "www.github.com",
        port: "",
        pathname: "/**",
      },
      //   {
      // protocol: "https",
      // hostname: "avatars.githubusercontent.com",
      // port: "",
      // pathname: "/u/**",
      //   },
    ],
  },
};

export default nextConfig;
