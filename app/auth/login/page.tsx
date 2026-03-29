import Link from "next/link";

export default function AuthLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-medium text-foreground">Sign in</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Use the sign-in option from the home page to continue.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
