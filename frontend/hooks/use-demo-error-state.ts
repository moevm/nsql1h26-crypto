import { useRouter } from "next/router";

export const useDemoErrorState = () => {
  const router = useRouter();

  return router.query.demo === "error";
};
