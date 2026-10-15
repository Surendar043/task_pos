import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../api";
import { useAuth } from "../auth";
import { Button, Field, Input, Select } from "../components/ui";

type Mode = "signin" | "signup";

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");

  // Sign in state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Sign up state
  const [signUpName, setSignUpName] = useState("");
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpMobile, setSignUpMobile] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpRole, setSignUpRole] = useState<"staff" | "admin">("staff");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submitSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(username.trim(), password);
      navigate(user.role === "admin" ? "/admin" : "/billing", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await signup({
        username: signUpUsername.trim(),
        name: signUpName.trim(),
        password: signUpPassword,
        mobile: signUpMobile.trim(),
        role: signUpRole,
      });
      navigate(user.role === "admin" ? "/admin" : "/billing", { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-lg font-bold">PS</div>
          <span className="text-lg font-semibold">POS Billing Software</span>
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight">Retail & textile billing, made simple.</h1>
          <p className="max-w-md text-slate-400">
            Manage products, staff, suppliers and returns in the Admin Portal. Bill customers and print receipts in the
            Billing Portal. Test the full admin experience in a mobile app layout.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>• Product &amp; variant management with stock control</li>
            <li>• Fast POS billing with cash / card / UPI / split payments</li>
            <li>• Returns, suppliers, purchases, ledger and reports</li>
          </ul>
        </div>
        <p className="text-xs text-slate-500">FastAPI · MongoDB · React · TypeScript</p>
      </div>

      <div className="flex items-center justify-center bg-slate-100 px-4 pb-4 sm:p-6 pb-[calc(100vh_-_100dvh_-_env(safe-area-inset-bottom))] sm:pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${mode === "signin" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${mode === "signup" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
            >
              Sign up
            </button>
          </div>

          {mode === "signin" ? (
            <form onSubmit={submitSignIn} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-800">Sign in</h2>
                <p className="text-sm text-slate-500">Use your store credentials to continue.</p>
              </div>

              <Field label="Email or username">
                <Input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
              </Field>
              <Field label="Password">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </Field>

              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={submitSignUp} className="space-y-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-800">Create account</h2>
                <p className="text-sm text-slate-500">Sign up with your details to get started.</p>
              </div>

              <Field label="Name">
                <Input value={signUpName} onChange={(e) => setSignUpName(e.target.value)} autoComplete="name" autoFocus required />
              </Field>
              <Field label="Username">
                <Input value={signUpUsername} onChange={(e) => setSignUpUsername(e.target.value)} autoComplete="username" required />
              </Field>
              <Field label="Mobile number">
                <Input
                  value={signUpMobile}
                  onChange={(e) => setSignUpMobile(e.target.value)}
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </Field>
              <Field label="Password">
                <Input
                  type="password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </Field>
              <Field label="Role">
                <Select value={signUpRole} onChange={(e) => setSignUpRole(e.target.value as "staff" | "admin")}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>

              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Creating account…" : "Create account"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}