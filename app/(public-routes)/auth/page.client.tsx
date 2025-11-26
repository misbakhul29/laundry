"use client";
import { IconBrandFacebookFilled, IconBrandGoogleFilled, IconEye, IconEyeOff, IconMail, IconLock } from "@tabler/icons-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { metadata } from "@/app/metadata";
import { useNotification } from "@/app/components/provider/NotificationProvider";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const providers = [
  { name: 'Google', icon: IconBrandGoogleFilled, color: '#4285F4' },
  { name: 'Facebook', icon: IconBrandFacebookFilled, color: '#1877F2' },
];

export default function LandingPageClient() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isShowPass, setIsShowPass] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { push } = useRouter();
  const { notify } = useNotification();

  const handleSSOLogin = (providerName: string) => {
    const providerIcon = providers.find((provider) => provider.name === providerName)?.icon;
    notify({
      message: `Login in with ${providerName} Coming Soon!`,
      type: "info",
      icon: providerIcon,
      duration: 3000,
    });
  };

  const handleAuth = (action: 'login' | 'register') => {
    notify({
      message: `${action === 'login' ? 'Login' : 'Registration'} Proceeding...`,
      type: "info",
      icon: Loader,
      duration: 3000,
    });

    setTimeout(() => {
      push('/dashboard');
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-fit w-full gap-6 items-center justify-center p-8 max-w-md mx-auto select-none">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h1 className="text-5xl font-marker-hatch bg-clip-text text-transparent bg-linear-to-r from-white to-indigo-200">
          {metadata.title as string}
        </h1>
        <p className="text-indigo-200 text-sm">{metadata.description}.</p>
      </motion.div>

      <motion.section
        className="flex flex-col gap-4 items-center w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative w-full">
          <IconMail
            size={20}
            className={`absolute z-50 top-1/2 -translate-y-1/2 left-3 transition-colors duration-300 ${focusedInput === 'email' ? 'text-indigo-600' : 'text-gray-300'}`}
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            className="w-full text-sm p-3 pl-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all ease-in-out duration-300 shadow-sm"
          />
        </div>

        <div className="relative w-full">
          <IconLock
            size={20}
            className={`absolute z-50 top-1/2 -translate-y-1/2 left-3 transition-colors duration-300 ${focusedInput === 'password' ? 'text-indigo-600' : 'text-gray-300'}`}
          />
          <input
            name="password"
            type={isShowPass ? "text" : "password"}
            placeholder="Password"
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            className="w-full text-sm p-3 pl-10 pr-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all ease-in-out duration-300 shadow-sm"
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
                <p id="hideToolTipPassword" className="absolute -top-[150%] left-1/2 -translate-x-1/2 text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Hide Password</p>
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
                <p id="showToolTipPassword" className="absolute -top-[150%] left-1/2 -translate-x-1/2 text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Show Password</p>
              </div>
            </div>
          )}
        </div>

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
              <IconLock
                size={20}
                className={`absolute z-50 top-1/2 -translate-y-1/2 left-3 transition-colors duration-300 ${focusedInput === 'confirmPassword' ? 'text-indigo-600' : 'text-gray-300'}`}
              />
              <input
                name="confirmPassword"
                type={isShowPass ? "text" : "password"}
                placeholder="Confirm Password"
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                className="w-full text-sm p-3 pl-10 pr-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all ease-in-out duration-300 shadow-sm"
              />
              {isShowPass ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="relative group">
                    <IconEyeOff
                      size={16}
                      className={`cursor-pointer ${focusedInput === 'confirmPassword' ? 'text-indigo-600' : 'text-white'}`}
                      onClick={() => setIsShowPass(false)}
                      title="Hide Password"
                    />
                    <p id="hideToolTipPassword" className="absolute -top-[150%] left-1/2 -translate-x-1/2 text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Hide Password</p>
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
                    <p id="showToolTipPassword" className="absolute -top-[150%] left-1/2 -translate-x-1/2 text-xs text-white bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">Show Password</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="w-full text-sm text-center flex items-center justify-center p-3 pl-10 pr-10 font-bold bg-white text-indigo-600 rounded-lg hover:bg-white/90 transition-all ease-in-out duration-200"
          onClick={() => {
            handleAuth(isRegistering ? 'register' : 'login');
            setIsAuthenticating(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {isAuthenticating ? <Loader className="animate-spin" /> : (isRegistering ? "Register" : "Get Started")}
        </motion.button>
      </motion.section>

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

      <motion.p
        className="text-xs text-gray-300 mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </motion.p>
    </div>
  );
}