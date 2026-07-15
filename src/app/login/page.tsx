import { Suspense } from "react";
import { DogPetLogin } from "@/components/access/dog-pet-login";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#C0C0C0]" />}>
      <DogPetLogin />
    </Suspense>
  );
}
