"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials } from "@/lib/redux/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check for token in localStorage on mount
    const token = localStorage.getItem("token");
    if (token && !isAuthenticated) {
      // You might want to validate the token with your backend here
      // For now, we'll assume it's valid if it exists
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("payload", payload);
        if (payload.exp * 1000 > Date.now()) {
          // Token is still valid, you might want to fetch user data
          // For demo purposes, we'll redirect to sign-in
          console.log("setting credentials");
          console.log("payload.user", payload);
          dispatch(
            setCredentials({
              token: token,
              user: payload,
            })
          );
        } else {
          localStorage.removeItem("token");
          router.push("/auth/signin");
        }
      } catch {
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    } else if (!isAuthenticated && !isLoading) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, isLoading, router, dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
