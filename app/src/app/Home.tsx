// src/components/HomePage.tsx (Client Component)

import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

export default function HomePage() {
  return (
    <div className="text-center flex flex-col h-[100vh] w-[100vw] overflow-x-hidden  my-4 mx-auto">
      <nav className="flex justify-between h-[50px]">
        <p className="text-3xl font-bold ps-2">Calendlio</p>
      </nav>
      <div className="flex w-full h-full">
        <div className="flex flex-col w-[50%] justify-center mb-20 gap-10 items-start px-20">
          <p className="text-8xl font-extrabold">Easy</p>
          <p className="text-8xl font-extrabold">scheduling</p>
          <p className="text-8xl font-extrabold">ahead</p>
          <p className="text-gray-500 text-justify text-md" style={{ lineHeight: "2" }}>
            Calendlio is a modern web application designed to simplify appointment booking and scheduling tasks.
          </p>
          <div className="flex gap-2 justify-center">
            <Button asChild>
              <SignInButton />
            </Button>
            <Button asChild>
              <SignUpButton />
            </Button>
            <UserButton />
          </div>
        </div>
        <div className="relative w-[50%] flex items-center justify-center">
          {/* Clock component goes here */}
        </div>
      </div>
    </div>
  )
}
