import { LoadingState } from "@/components/loading-state";
import { useAuthRouting } from "@/hooks/use-auth-routing";

export default function IndexPage() {
  useAuthRouting({ mode: "root" });

  return (
    <LoadingState
      title="Открываем приложение"
      message="Переводим на нужный экран"
    />
  );
}
