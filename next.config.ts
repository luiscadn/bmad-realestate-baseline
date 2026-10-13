import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { supabaseImagePatterns } from "./src/lib/image-hosts";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");


const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImagePatterns(process.env.NEXT_PUBLIC_SUPABASE_URL),
  },
};

export default withNextIntl(nextConfig);
