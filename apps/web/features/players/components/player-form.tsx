"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createPlayerAction } from "../actions";
import { DEFAULT_FORM_VALUES } from "../constants";
import { CreatePlayerDto, CreatePlayerSchema } from "@repo/core";
import { PhysicalAttributes, BasicInfo, TeamInfo, PlayerStatus } from "./form";

export function PlayerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePlayerDto>({
    resolver: zodResolver(CreatePlayerSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const onSubmit = async (data: CreatePlayerDto) => {
    startTransition(async () => {
      try {
        await createPlayerAction(data);
        toast.success("Player created successfully!");
        form.reset();
        router.push("/dashboard/players");
      } catch (error) {
        console.error("Failed to create player:", error);
        toast.error("Failed to create player. Please try again.");
      }
    });
  };

  const onCancel = () => {
    router.push("/dashboard/players");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Player</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfo />
            <PhysicalAttributes />
            <TeamInfo />
            <PlayerStatus />

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Player"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
