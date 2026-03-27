import nextConfig from "@repo/eslint-config/next";

export default [
  { ignores: ["next-env.d.ts", ".next/**"] },
  ...nextConfig,
];
