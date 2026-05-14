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
import { Icon } from '@iconify/vue'


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

const showPassword = ref(false);

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
    class="min-h-screen flex flex-col md:flex-row items-center justify-center p-32 md:p-20">
    <!-- Pattern overlay on top -->
    <div
      class="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
      style="background: url('/images/login/cover-pattern.png') center center / cover no-repeat;"
    ></div>
    <!-- Gradient in background -->
    <div
      class="absolute inset-0 z-0"
      aria-hidden="true"
      style="background: linear-gradient(to bottom right, #00A859, #007d42);"
    ></div>
    
    <div class="w-full flex flex-col lg:flex-row items-stretch justify-center relative z-10 px-8 md:px-24 lg:px-35">
      <!-- Left: Image Section -->
      <div class="hidden lg:flex flex-col items-stretch justify-center w-full lg:w-1/2">
        <div
          class="relative w-full h-full rounded-none lg:rounded-l-3xl overflow-hidden flex flex-1"
          style="min-height: 75vh;"
        >
          <NuxtImg
            src="/images/sante-store.jpg"
            alt="Santé Physical Store"
            densities="x1"
            format="webp"
            class="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div class="absolute inset-0 bg-black opacity-70 z-10"></div>
          <div class="relative z-20 p-10 lg:p-10 flex flex-col justify-center h-full w-full">
            <div class="absolute top-0 left-0 p-10 text-white font-bold text-3xl z-20">
              Santé
            </div>

            <div class="flex flex-col items-center justify-center text-center flex-1">
            </div>
            <div class="flex flex-col items-center gap-1 self-center text-center">
              <p class="text-lg text-gray-200 mb-6 drop-shadow">
                Streamline Your Business
                Anytime, Anywhere.
              </p>
              <p class="text-gray-300 mb-6 drop-shadow-sm font-normal">
                Powerful, self-serve product and growth analytics
                to help you convert, engage, and retain more.
              </p>
              <span class="text-sm text-gray-500">© 2025 Santé. Crafted with by Santé.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Form Section -->
      <div class="flex flex-col items-center justify-center w-full lg:w-1/2">
        <Card
          class="w-full h-full rounded-none lg:rounded-r-3xl flex items-center justify-center bg-slate-900 border-slate-800 shadow-2xl"
        >
          <div class="flex flex-col justify-center items-center my-10 mx-10 w-full">
            <NuxtImg
              src="/images/sante_logo.png"
              alt="Santé Logo"
              densities="x1"
              class="h-40 mb-4 self-center"
            />
            <CardHeader class="text-center mb-3">
              <CardTitle class="mb-2 text-2xl md:text-4xl text-white">
                Welcome to Santé
              </CardTitle>
              <CardDescription class="text-md md:text-lg text-slate-400">
                Sign in to continue to Santé
              </CardDescription>
            </CardHeader>
            <form @submit.prevent="signInUser" class="w-full">
              <CardContent class="w-full px-8 md:px-4">
                <div class="grid w-full items-center gap-4">
                  <div class="flex flex-col space-y-1.5">
                    <label for="email" class="text-white text-sm font-medium">Email</label>
                    <Input
                      v-model="formData.email"
                      id="email"
                      type="email"
                      autocomplete="username"
                      placeholder="Enter your email"
                      :class="[
                        'w-full',
                        formErrors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'focus:border-primary focus:ring-primary',
                      ]"
                    />
                    <span v-if="formErrors.email" class="text-red-500 text-sm">
                      {{ formErrors.email }}
                    </span>
                  </div>
                  <div class="flex flex-col space-y-1.5">
                    <label for="password" class="text-white text-sm font-medium">Password</label>
                    <div class="relative">
                      <Input
                        v-model="formData.password"
                        :type="showPassword ? 'text' : 'password'"
                        id="password"
                        autocomplete="current-password"
                        placeholder="Enter your password"
                        :class="[
                          'w-full',
                          formErrors.password
                            ? 'border-red-500 focus:ring-red-500'
                            : 'focus:border-primary focus:ring-primary',
                        ]"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2"
                        type="button"
                        @click="showPassword = !showPassword"
                        tabindex="-1"
                      >
                        <Icon :icon="showPassword ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4" />
                      </Button>
                    </div>
                    <span v-if="formErrors.password" class="text-red-500 text-sm">
                      {{ formErrors.password }}
                    </span>
                  </div>
                  <!-- 
                  <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                      <input type="checkbox" id="remember" class="rounded border-gray-300" />
                      <label for="remember" class="text-xs md:text-sm text-gray-500">Remember me</label>
                    </div>
                    <NuxtLink href="#" class="text-xs md:text-sm text-gray-500 hover:text-gray-700">Forgot password?</NuxtLink>
                  </div> 
                  -->
                </div>
              </CardContent>
              <CardFooter class="w-full px-8 md:px-4">
                <div class="flex flex-col space-y-4 w-full">
                  <Button class="w-full bg-primary hover:bg-teal-700 text-white font-bold py-6">Sign In</Button>
                  <GoogleLoginButton
                    class="w-full"
                    :verify-on-server="true"
                    :options="{ theme: 'filled_blue', size: 'large' }"
                    @success="onSuccess"
                    @verified="onVerified"
                    @error="onError"
                  />
                </div>
              </CardFooter>
            </form>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>