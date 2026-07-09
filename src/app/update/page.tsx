"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainMenu } from "@/components/access/main-menu";
import { PasswordDialog } from "@/components/access/password-dialog";
import { isUpdateMenuAuthenticated, setUpdateMenuAuthenticated } from "@/lib/menu-auth";
import { routes } from "@/lib/routes";

export default function UpdateMenuPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthenticated(isUpdateMenuAuthenticated());
    setChecked(true);
  }, []);

  const handleSuccess = () => {
    setUpdateMenuAuthenticated(true);
    setAuthenticated(true);
  };

  if (!checked) {
    return null;
  }

  if (!authenticated) {
    return (
      <PasswordDialog
        onSuccess={handleSuccess}
        onCancel={() => router.push(routes.menuReference)}
      />
    );
  }

  return <MainMenu mode="update" />;
}
