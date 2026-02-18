"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteSponsorshipAction } from "../actions/sponsorship-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteSponsorshipDialogProps {
  sponsorshipId: number;
  sponsorName: string;
  redirectPath?: string;
}

export function DeleteSponsorshipDialog({
  sponsorshipId,
  sponsorName,
  redirectPath,
}: DeleteSponsorshipDialogProps) {
  const t = useTranslations("Sponsorships");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteSponsorshipAction(sponsorshipId);
        toast.success(t("sponsorshipDeleted"));
        setOpen(false);
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          router.refresh();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t("failedToDelete"),
        );
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" title={t("delete")}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteSponsorship")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteSponsorshipConfirmation", { sponsor: sponsorName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? t("deleting") : t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
