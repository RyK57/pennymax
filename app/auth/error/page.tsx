export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-lg font-medium text-foreground">Sign-in failed</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Something went wrong while signing you in. Please try again from the home page.
      </p>
    </div>
  );
}
