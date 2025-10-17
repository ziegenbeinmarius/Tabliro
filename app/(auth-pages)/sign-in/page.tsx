import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SignInForm } from "./sign-in-form";
import { FormMessage, Message } from "@/components/form-message";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <Card className="max-w-md min-w-96">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent className=" flex flex-col gap-4">
        <p className="text-sm text-foreground">
          Don't have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
        <SignInForm />
        <FormMessage message={searchParams} />
      </CardContent>
    </Card>
  );
}
