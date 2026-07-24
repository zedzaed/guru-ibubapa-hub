"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeMalaysianPhone } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const credentials = identity.includes("@")
        ? { email: identity.trim().toLowerCase(), password }
        : { phone: normalizeMalaysianPhone(identity), password };

      const { error: signInError } = await supabase.auth.signInWithPassword(credentials);
      if (signInError) throw signInError;

      router.replace("/");
      router.refresh();
    } catch (caughtError) {
      console.error(caughtError);
      setError("Maklumat log masuk tidak tepat atau akaun belum diaktifkan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="identity">E-mel atau nombor telefon</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-muted-foreground" />
          <Input
            id="identity"
            name="identity"
            autoComplete="username"
            placeholder="nama@email.com atau 01X-XXXXXXX"
            value={identity}
            onChange={(event) => setIdentity(event.target.value)}
            className="pl-11"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Kata laluan</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3.5 top-3.5 size-5 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata laluan"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pl-11"
            required
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />}
        {loading ? "Sedang log masuk..." : "Log masuk"}
      </Button>
    </form>
  );
}
