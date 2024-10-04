// src/app/page.tsx (Server Component)

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import HomePage from "./Home"

export default async function Page() {
  const { userId } = auth()

  if (userId != null) {
    redirect("/events")
  }

  return <HomePage />
}
