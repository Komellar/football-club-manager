"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { LoginDto, LoginSchema } from "@repo/utils";
import { loginAction, useAuthStore } from "@/features/auth";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const form = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginDto) {
    startTransition(async () => {
      const result = await loginAction(data);

      if (result?.error) {
        form.setError("root", { message: result.error });
        return;
      }

      if (result?.fieldErrors) {
        console.error(result.fieldErrors);
        Object.entries(result.fieldErrors).forEach(([field, errors]) => {
          if (errors?.[0]) {
            form.setError(field as keyof LoginDto, { message: errors[0] });
          }
        });
        return;
      }

      if (result?.success) {
        // Refresh auth state after successful login
        await checkAuth();
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/players.png')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Welcome
            <span className="block text-green-400">Back</span>
          </h1>
          <p className="text-xl text-gray-200 leading-relaxed">
            Sign in to continue managing your football club with professional
            tools and insights.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center flex flex-col">
            <Image
              width={96}
              height={96}
              alt="Football Club Manager Logo"
              src={"/logo.svg"}
              className="self-center mb-6"
            />
            <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-400">
              Access your football management dashboard
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.formState.errors.root && (
                <Alert
                  variant="destructive"
                  className="border-red-400/50 bg-red-500/10 text-red-300 rounded-lg"
                >
                  <AlertDescription>
                    {form.formState.errors.root.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-sm text-gray-300 block mb-2 font-medium">
                        Email
                      </label>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          autoComplete="email"
                          disabled={isPending}
                          className="h-12 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 rounded-lg transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <label className="text-sm text-gray-300 block mb-2 font-medium">
                        Password
                      </label>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={isPending}
                            className="h-12 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 rounded-lg pr-12 transition-all"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-gray-400 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-300 text-sm">
              Don&apos;t have an account?&nbsp;
              <Link
                href="/register"
                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
