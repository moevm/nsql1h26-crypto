import { useAuthRouting } from "@/hooks/use-auth-routing";

export default function IndexPage() {
  useAuthRouting({ mode: "root" });

  return null;
}
