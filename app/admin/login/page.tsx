"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import "../admin.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (signInError) {
        setError("Those credentials could not be verified.");
        setIsSubmitting(false);
        return;
      }

      if (!data.session || !data.user) {
        setError("Sign-in succeeded, but no session was created.");
        setIsSubmitting(false);
        return;
      }

      // Make sure the browser client has the authenticated user
      // before navigating to the protected admin area.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Your session could not be established.");
        setIsSubmitting(false);
        return;
      }

      // Navigate only after authentication is confirmed.
      router.replace("/admin");
    } catch (authError) {
      console.error("Admin sign-in error:", authError);

      setError(
        authError instanceof Error
          ? authError.message
          : "Could not sign in. Please try again.",
      );

      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section
        className="admin-login-panel"
        aria-labelledby="admin-login-title"
      >
        <Link
          className="admin-login-brand"
          href="/"
          aria-label="Lucky Club home"
        >
          <span className="admin-brand-mark">LC</span>

          <span>
            <strong>Lucky Club</strong>
            <small>Gift Articles</small>
          </span>
        </Link>

        <div className="admin-login-copy">
          <p className="admin-kicker">
            Private workspace
          </p>

          <h1 id="admin-login-title">
            Welcome back.
          </h1>

          <p>
            Sign in to manage the Lucky Club collection
            and orders.
          </p>
        </div>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="admin-email">
            Email address
          </label>

          <input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            disabled={isSubmitting}
          />

          <label htmlFor="admin-password">
            Password
          </label>

          <div className="admin-password-field">
            <input
              id="admin-password"
              name="password"
              type={
                showPassword ? "text" : "password"
              }
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              disabled={isSubmitting}
            />

            <button
              className="admin-password-toggle"
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value,
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              disabled={isSubmitting}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <p
              className="admin-form-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <Link
          className="admin-return-link"
          href="/"
        >
          Return to Lucky Club
        </Link>
      </section>
    </main>
  );
}