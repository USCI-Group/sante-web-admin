<script setup lang="ts">
import { useAuthStore } from "~/store/AuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

definePageMeta({
  title: "Login",
  auth: false,
  layout: false,
});

const config = useRuntimeConfig();

useSeoMeta({
  title: config.public.appName + " | Sign In",
  description: "Sign in to your " + config.public.appName + " account",
});

const { signIn } = useAuth();
const formData = reactive({
  email: "",
  password: "",
});

const authStore = useAuthStore();
const formErrors = reactive({
  email: "",
  password: "",
});

async function signInUser() {
  // Reset errors
  formErrors.email = "";
  formErrors.password = "";

  try {
    await signIn(
      {
        email: formData.email,
        password: formData.password,
      },
      { callbackUrl: "/business", external: false }
    );
  } catch (error: any) {
    console.error("Login error:", error);

    // Reset errors
    formErrors.email = "";
    formErrors.password = "";

    if (error.response?._data) {
      const errorData = error.response._data;

      // Check invalid credentials
      if (errorData.message === "record not found") {
        const message = "Invalid email or password";
        formErrors.email = message;
        formErrors.password = message;
        return;
      }

      // Split message if multiple errors
      const errors = errorData.message.split(";");

      // Assign each error to relevant field
      errors.forEach((err: string) => {
        const errorMessage = err.trim();
        const field = errorMessage.toLowerCase().includes("email")
          ? "email"
          : "password";
        formErrors[field] = errorMessage;
      });
    }
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-[url('/images/login/login-bg.png')] bg-cover bg-center bg-no-repeat flex flex-col md:flex-row items-center justify-center p-4 md:p-20 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-red-600 before:to-red-400 before:opacity-80 relative"
  >
    <div
      class="hidden md:flex flex-1 p-8 flex-col justify-start items-start self-start relative z-10"
    >
      <h1 class="text-white text-6xl font-semibold tracking-wide">
        Streamline <br />
        Your Business<br />
        Anytime,<br />
        Anywhere.
      </h1>
    </div>

    <div class="flex-1 flex justify-center items-center relative z-10">
      <Card
        class="w-[400px] md:w-[620px] h-auto md:h-[700px] rounded-3xl mx-4 flex items-center justify-center"
      >
        <div class="flex flex-col justify-center items-center my-10">
          <NuxtImg
            src="/images/sante_logo.png"
            alt="Santé Logo"
            sizes="144px"
            densities="x1"
            format="webp"
            class="w-32 h-auto"
          />
          <CardHeader class="text-center mb-5">
            <CardTitle class="mb-2 text-4xl"
              >Welcome to {{ config.public.appName }}</CardTitle
            >
            <CardDescription class="text-lg"
              >Enter your credentials to sign in</CardDescription
            >
          </CardHeader>
          <form @submit.prevent="signInUser">
            <CardContent class="w-full md:w-[500px] px-4">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <label for="email">Email</label>
                  <Input
                    v-model="formData.email"
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    :class="[
                      'w-full',
                      formErrors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'focus:border-red-500 focus:ring-red-500',
                    ]"
                  />
                  <span v-if="formErrors.email" class="text-red-500 text-sm">
                    {{ formErrors.email }}
                  </span>
                </div>
                <div class="flex flex-col space-y-1.5">
                  <label for="password">Password</label>
                  <Input
                    v-model="formData.password"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    :class="[
                      'w-full',
                      formErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'focus:border-red-500 focus:ring-red-500',
                    ]"
                  />
                  <span v-if="formErrors.password" class="text-red-500 text-sm">
                    {{ formErrors.password }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      class="rounded border-gray-300"
                    />
                    <label
                      for="remember"
                      class="text-xs md:text-sm text-gray-500"
                      >Remember me</label
                    >
                  </div>
                  <NuxtLink
                    href="#"
                    class="text-xs md:text-sm text-gray-500 hover:text-gray-700"
                    >Forgot password?</NuxtLink
                  >
                </div>
              </div>
            </CardContent>
            <CardFooter class="w-full px-4">
              <Button class="w-full bg-red-500 hover:bg-red-600"
                >Sign In</Button
              >
            </CardFooter>
          </form>
        </div>
      </Card>
    </div>
  </div>
</template>