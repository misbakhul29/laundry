"use client";

import {
  IconBrandFacebookFilled,
  IconBrandGoogleFilled,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconArrowLeft
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { metadata } from "@/app/metadata";
import { useNotification } from "@/app/components/provider/NotificationProvider"; // Pastikan path ini sesuai
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from '@tanstack/react-form';
import { decryptToken } from "@/app/actions/token";
import { signIn, useSession } from "next-auth/react";
import { Role } from "@/lib/generated/prisma/enums";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const providers = [
  { name: 'Google', icon: IconBrandGoogleFilled, color: '#4285F4' },
  { name: 'Facebook', icon: IconBrandFacebookFilled, color: '#1877F2' },
];

export default function LandingPageClient({ token }: { token?: string }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isShowPass, setIsShowPass] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { push } = useRouter();
  const { notify } = useNotification();
  const session = useSession();

  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (session.status === 'authenticated') {
      push('/dashboard');
    }
  }, [session.status, push]);

  const mutateRegister = useMutation({
    mutationFn: (data: { email: string; password: string, confirmPassword: string, role: string | undefined, recaptchaToken: string }) => {
      return fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(res => res.json());
    },
    onSettled: () => {
      setIsAuthenticating(false);
    }
  });

  const formAuth = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: Role.USER,
    },
    onSubmit: async ({ value }) => {
      setIsAuthenticating(true);

      if (!executeRecaptcha) {
        notify({ message: "Security check failed. Please try again.", type: "error" });
        setIsAuthenticating(false);
        return;
      }

      try {
        const recaptchaToken = await executeRecaptcha(isRegistering ? "register_submit" : "login_submit");

        if (!isRegistering) {
          const res = await signIn("credentials", {
            email: value.email,
            password: value.password,
            recaptchaToken: recaptchaToken,
            redirect: false,
          });

          if (res?.ok) {
            notify({
              message: "Login Successful!",
              type: "success",
              duration: 3000,
            });
            push('/dashboard');
          } else {
            notify({
              message: "Invalid email or password",
              type: "error",
              duration: 5000,
            });
          }
        } else {
          let role: Role = Role.USER;

          if (token) {
            const data = await decryptToken(token);
            role = data ? ((data as string).split('=')[1].trim() === Role.PROVIDER.toLowerCase() ? Role.PROVIDER : Role.USER) : Role.USER;
          }

          mutateRegister.mutate({
            email: value.email,
            password: value.password,
            confirmPassword: value.confirmPassword,
            role: role,
            recaptchaToken: recaptchaToken,
          }, {
            onSuccess: async (response, variables) => {
              if (response.error) {
                notify({
                  message: response.error,
                  type: "error",
                  duration: 5000,
                });
                return;
              }

              notify({
                message: `Registration Successful! Logging in...`,
                type: "success",
                duration: 3000,
              });

              const res = await signIn("credentials", {
                email: variables.email,
                password: variables.password,
                recaptchaToken: recaptchaToken,
                redirect: false,
              });

              if (res?.ok) {
                push('/dashboard');
              } else {
                notify({
                  message: "Auto-login failed. Please login manually.",
                  type: "error",
                  duration: 5000,
                });
              }
            },
            onError: (error: unknown) => {
              const message = error instanceof Error ? error.message : 'Registration failed. Please try again.';
              notify({ message, type: 'error', duration: 5000 });
            }
          });
        }
      } catch (error) {
        console.error("Auth Error:", error);
        notify({ message: "An unexpected error occurred.", type: "error" });
      } finally {
        if (!isRegistering) {
          setIsAuthenticating(false);
        }
      }
    },
  });

  const handleSSOLogin = (providerName: string) => {
    const providerIcon = providers.find((provider) => provider.name === providerName)?.icon;
    notify({
      message: `Processing login with ${providerName}`,
      type: "info",
      icon: providerIcon,
      duration: 3000,
    });
    signIn(providerName, {
      redirect: false,
    }).then((res) => {
      if (res?.ok) {
        notify({
          message: `Login Successful with ${providerName}!`,
          type: "success",
          duration: 3000,
        });
        push('/dashboard');
      } else {
        notify({
          message: `Login failed with ${providerName}`,
          type: "error",
          duration: 5000,
        });
      }
    });
  };

  return (
    <div className="relative flex-1 flex flex-col h-fit w-full gap-6 items-center justify-center p-8 max-w-md mx-auto select-none">
      <motion.button
        className="absolute top-4 left-4 bg-white/40 p-2 rounded-full text-white text-sm underline hover:text-white"
        onClick={() => push('/')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <IconArrowLeft size={16} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h1 className="text-5xl font-marker-hatch bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200">
          {typeof metadata.title === 'string' ? metadata.title : 'App Name'}
        </h1>
        <p className="text-indigo-200 text-sm">{metadata.description}.</p>
      </motion.div>

      <form
        className="flex flex-col gap-4 items-center w-full"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          formAuth.handleSubmit();
        }}>
        <motion.section
          className="flex flex-col gap-4 items-center w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* EMAIL FIELD */}
          <formAuth.Field name="email">
            {(field) => (
              <div className="relative w-full">
                <IconMail
                  size={20}
                  className={`absolute z-50 top-1/2 -translate-y-1/2 left-3 transition-colors duration-300 ${focusedInput === 'email' ? 'text-indigo-600' : 'text-gray-300'}`}
                />
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => { field.handleBlur(); setFocusedInput(null); }}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  placeholder="Email Address"
                  onFocus={() => setFocusedInput('email')}
                  className="w-full text-sm p-3 pl-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all ease-in-out duration-300 shadow-sm"
                  autoComplete="false"
                />
              </div>
            )}
          </formAuth.Field>

          {/* PASSWORD FIELD */}
          <formAuth.Field name="password">
            {(field) => (
              <div className="relative w-full">
                <IconLock
                  size={20}
                  className={`absolute z-50 top-1/2 -translate-y-1/2 left-3 transition-colors duration-300 ${focusedInput === 'password' ? 'text-indigo-600' : 'text-gray-300'}`}
                />
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={() => { field.handleBlur(); setFocusedInput(null); }}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type={isShowPass ? "text" : "password"}
                  placeholder="Password"
                  onFocus={() => setFocusedInput('password')}
                  className="w-full text-sm p-3 pl-10 pr-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-300 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all ease-in-out duration-300 shadow-sm"
                  autoComplete="false"
                />
                {isShowPass ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="relative group">
                      <IconEyeOff
                        size={16}
                        className={`cursor-pointer ${focusedInput === 'password' ? 'text-indigo-600' : 'text-white'}`}
                        onClick={() => setIsShowPass(false)}
                        title="Hide Password"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="relative group">
                      <IconEye
                        size={16}
                        className={`cursor-pointer ${focusedInput === 'password' ? 'text-indigo-600' : 'text-white'}`}
                        onClick={() => setIsShowPass(true)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </formAuth.Field>

          {/* CONFIRM PASSWORD FIELD (Conditional) */}
          <AnimatePresence>
            {isRegistering && (
              <motion.div
                key="confirmPassword"
                initial={{ opacity: 0, y: -8, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.18 }}
                layout
                className="relative w-full"
              >
                <formAuth.Field name="confirmPassword">
                  {(field) => (
                    <>
                      <IconLock
                        size={20}
                        className={`absolute z-50 top-1/2 -translate-y-1/2 left-3 transition-colors duration-300 ${focusedInput === 'confirmPassword' ? 'text-indigo-600' : 'text-gray-300'}`}
                      />
                      <input
                        name={field.name}
                        value={field.state.value}
                        onBlur={() => { field.handleBlur(); setFocusedInput(null); }}
                        onChange={(e) => field.handleChange(e.target.value)}
                        type={isShowPass ? "text" : "password"}
                        placeholder="Confirm Password"
                        onFocus={() => setFocusedInput('confirmPassword')}
                        className="w-full text-sm p-3 pl-10 pr-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all ease-in-out duration-300 shadow-sm"
                      />
                    </>
                  )}
                </formAuth.Field>
                {isShowPass ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="relative group">
                      <IconEyeOff
                        size={16}
                        className={`cursor-pointer ${focusedInput === 'confirmPassword' ? 'text-indigo-600' : 'text-white'}`}
                        onClick={() => setIsShowPass(false)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="relative group">
                      <IconEye
                        size={16}
                        className={`cursor-pointer ${focusedInput === 'confirmPassword' ? 'text-indigo-600' : 'text-white'}`}
                        onClick={() => setIsShowPass(true)}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT BUTTON */}
          <motion.button
            className="w-full text-sm text-center flex items-center justify-center p-3 pl-10 pr-10 font-bold bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-all ease-in-out duration-200"
            type="submit"
            disabled={isAuthenticating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            {isAuthenticating ? <Loader className="animate-spin" /> : (isRegistering ? "Register" : "Get Started")}
          </motion.button>
        </motion.section>
      </form>

      {/* SSO BUTTONS */}
      <motion.section
        className="w-full flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="flex-none text-xs w-fit text-gray-300">or {isRegistering ? 'Register' : 'Login'} with</p>

        <div className="w-full flex gap-4">
          {(() => {
            return providers.map((provider) => (
              <motion.button
                key={provider.name}
                onClick={() => handleSSOLogin(provider.name)}
                className="w-full p-2 font-bold bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all ease-in-out duration-200 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex gap-2 items-center">
                  <provider.icon size={18} />
                  <p className="text-xs">{provider.name}</p>
                </span>
              </motion.button>
            ));
          })()}
        </div>
      </motion.section>

      {/* TOGGLE LOGIN/REGISTER */}
      <motion.p
        className="text-sm text-gray-300 mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <motion.span
          className="text-gray-200 cursor-pointer hover:underline"
          onClick={() => setIsRegistering(!isRegistering)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
        </motion.span>
      </motion.p>

      {/* FOOTER & RECAPTCHA DISCLAIMER */}
      <motion.p
        className="text-xs text-gray-300 mt-4 text-center leading-relaxed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy.
        <br />
        This site is protected by reCAPTCHA and the Google
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline mx-1">Privacy Policy</a> and
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline mx-1">Terms of Service</a> apply.
      </motion.p>
    </div>
  );
}