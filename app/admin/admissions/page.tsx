import { redirect } from "next/navigation";

export default function AdminAdmissionsRedirect() {
  redirect("/dashboard/website/admissions");
}
