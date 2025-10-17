import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Card className="max-w-md min-w-96 m-auto">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
      </CardHeader>
      <CardContent className=" flex flex-col gap-4">
        <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4">
          <p className="text-sm text-foreground/60">
            Please enter your new password below.
          </p>
          <Label htmlFor="password">New password</Label>
          <Input
            type="password"
            name="password"
            placeholder="New password"
            required
          />
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            required
          />
          <SubmitButton formAction={resetPasswordAction}>
            Reset password
          </SubmitButton>
          <FormMessage message={searchParams} />
        </form>
      </CardContent>
    </Card>
  );
}
