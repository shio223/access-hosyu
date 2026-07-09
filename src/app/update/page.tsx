"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MainMenu } from "@/components/access/main-menu";
import { PasswordDialog } from "@/components/access/password-dialog";
import { routes } from "@/lib/routes";

export default function UpdateMenuPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <PasswordDialog
        onSuccess={() => setAuthenticated(true)}
        onCancel={() => router.push(routes.menuReference)}
      />
    );
  }

  return <MainMenu mode="update" />;
}
