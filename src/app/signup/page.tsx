"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, AuthError, AuthLink } from "@/components/AuthShell";
import { Field, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signupAction } from "@/actions/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signupAction({ name, email, password });
      router.push("/docs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start writing in seconds."
      footer={
        <>
          Have an account? <AuthLink href="/login">Log in</AuthLink>
        </>
      }
    >
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <Field label="Name">
          <Input required autoComplete="name" placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint="Minimum 8 characters.">
          <Input type="password" required minLength={8} autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <AuthError message={error} />}
        <Button variant="primary" type="submit" loading={busy} className="w-full">
          Sign up
        </Button>
        <p className="text-center text-[11px] text-muted">
          Simplified signup — for demonstration purposes only.
        </p>
      </form>
    </AuthShell>
  );
}
