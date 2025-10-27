import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorAlertProps {
  title?: string;
  message?: string;
  error?: unknown;
  variant?: "default" | "destructive";
}

export function ErrorAlert({
  title,
  message,
  error,
  variant = "destructive",
}: ErrorAlertProps) {
  const t = useTranslations("Common");

  const errorMessage = error instanceof Error ? error.message : message;

  return (
    <Alert variant={variant}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title ?? t("error")}</AlertTitle>
      <AlertDescription>{errorMessage ?? t("errorMessage")}</AlertDescription>
    </Alert>
  );
}
