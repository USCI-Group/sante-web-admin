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
import { useToast } from "~/components/ui/toast/use-toast";
const { toast } = useToast()


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

// eslint-disable-next-line no-console
const onSuccess = async (e: { credential: string; claims: any }) => {
  // console.log('success:', e.claims, e.credential.slice(0, 20) + '…')

  const email = e.claims.email;

  try {
    await signIn(
      {
        email: email,
        google_auth_token: e.credential,
      },
      { callbackUrl: "/business", external: false }
    );
  } catch (error: any) {
    toast({
      title: 'Login Failed',
      description: error.response._data.message,
      variant: 'destructive'
    })
  }
}
// eslint-disable-next-line no-console
const onVerified = (data: any) => {
  // console.log('verified:', data)
}
// eslint-disable-next-line no-console
const onError = (err: any) => {
  console.error('error:', err)
}

</script>

<template>
  <div
    class="min-h-screen bg-[url('/images/login/login-bg-pattern.png')] bg-cover bg-center bg-no-repeat flex flex-col md:flex-row items-center justify-center p-32 md:p-20 before:content-[''] before:absolute before:inset-0 before:bg-white before:opacity-10 before:z-0 relative">
    <div class="hidden lg:flex flex-1 pt-18 p-8 flex-col justify-start items-start relative z-10">
      <h1 class="text-2xl lg:text-5xl font-semibold leading-tight text-gray-900 mb-4">
        Streamline Your Business<br />
        Anytime, Anywhere.
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Powerful, self-serve product and growth analytics<br />
        to help you convert, engage, and retain more.
      </p>

      <div class="relative">
        <NuxtImg src="/images/login/login-user.png" alt="Business user" densities="x1" format="webp"
          class="w-full max-w-2xl" />
      </div>
    </div>

    <div class="flex-1 flex justify-center items-start relative z-10">
      <Card
        class="w-auto md:w-[480px] h-auto md:h-[700px] rounded-3xl mx-4 flex items-center justify-center bg-gray-50">
        <div class="flex flex-col justify-center items-center my-10">
          <NuxtImg
            src="/images/sante-icon.svg"
            alt="Santé Logo"
            densities="x1"
            class="w-16 h-auto"
          />
          <CardHeader class="text-center mb-3">
            <CardTitle class="mb-2 text-2xl md:text-4xl">Welcome to {{ config.public.appName }}</CardTitle>
            <CardDescription class="text-md md:text-lg">Sign in to {{ config.public.appName }} to access your account
            </CardDescription>
          </CardHeader>
          <form @submit.prevent="signInUser">
            <CardContent class="w-[400px] md:w-[400px] px-8 md:px-4">
              <div class="grid w-full items-center gap-4">
                <div class="flex flex-col space-y-1.5">
                  <label for="email">Email</label>
                  <Input v-model="formData.email" id="email" type="email" placeholder="Enter your email" :class="[
                    'w-full',
                    formErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:border-red-500 focus:ring-red-500',
                  ]" />
                  <span v-if="formErrors.email" class="text-red-500 text-sm">
                    {{ formErrors.email }}
                  </span>
                </div>
                <div class="flex flex-col space-y-1.5">
                  <label for="password">Password</label>
                  <Input v-model="formData.password" id="password" type="password" placeholder="Enter your password"
                    :class="[
                      'w-full',
                      formErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'focus:border-red-500 focus:ring-red-500',
                    ]" />
                  <span v-if="formErrors.password" class="text-red-500 text-sm">
                    {{ formErrors.password }}
                  </span>
                </div>
                <!-- <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-2">
                    <input type="checkbox" id="remember" class="rounded border-gray-300" />
                    <label for="remember" class="text-xs md:text-sm text-gray-500">Remember me</label>
                  </div>
                  <NuxtLink href="#" class="text-xs md:text-sm text-gray-500 hover:text-gray-700">Forgot password?
                  </NuxtLink>
                </div> -->
              </div>
            </CardContent>
            <CardFooter class="w-full px-8 md:px-4">
                <div class="flex flex-col space-y-4 w-full">
                  <Button class="w-full bg-primary hover:bg-green-700">Sign In</Button>
                  <ClientOnly>
                    <GoogleLoginButton
                      class="w-full"
                      :verify-on-server="true"
                      :options="{ theme: 'filled_blue', size: 'large' }"
                      @success="onSuccess"
                      @verified="onVerified"
                      @error="onError"
                    />
                  </ClientOnly>
                </div>
            </CardFooter>
          </form>
        </div>
      </Card>
    </div>
  </div>
</template>