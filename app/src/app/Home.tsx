"use client"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import { useEffect } from "react"

export default function HomePage() {
  useEffect(() => {
    // Function to set the rotation of the clock hands
    function updateClock() {
      const secondHand = document.getElementById('second-hand');
      const minuteHand = document.getElementById('minute-hand');
      const hourHand = document.getElementById('hour-hand');

      const now = new Date();
      const seconds = now.getSeconds();
      const minutes = now.getMinutes();
      const hours = now.getHours();

      // Set the rotation for the hands
      const secondRotation = seconds * 6; // Each second is 6 degrees
      const minuteRotation = (minutes + seconds / 60) * 6; // Each minute is 6 degrees
      const hourRotation = (hours % 12) * 30 + minutes / 2; // Each hour is 30 degrees, and 0.5 degrees per minute

      if (secondHand) secondHand.style.transform = `rotate(${secondRotation}deg)`;
      if (minuteHand) minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
      if (hourHand) hourHand.style.transform = `rotate(${hourRotation}deg)`;
    }

    // Update the clock every second
    const interval = setInterval(updateClock, 1000);
    updateClock(); // Initial call to set the clock

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="text-center flex flex-col h-[100vh] w-[100vw] overflow-hidden  mx-auto">
      <nav className="flex relative z-10 bg-white justify-between h-[50px]  border-b-2 items-center px-20 py-8 ">
        <p className="text-3xl font-extrabold ps-2 logoo text-black flex items-center">Calendlio</p>
        <div className="flex">
          <ul className="flex gap-4 font-bold">
            <li className="cursor-pointer">
              Product
            </li>
            <li className="cursor-pointer">
              Pricing
            </li>
            <li className="cursor-pointer">
              Enterprise
            </li>
            <li className="cursor-pointer">
              Solutions
            </li>
            <li className="cursor-pointer">
              Pricing
            </li>
          </ul>

        </div>

      </nav>
      <div className="flex w-full h-full relative ">
        <div className="flex flex-col w-[50%] justify-center mb-20 gap-10 items-start px-20 z-10 relative">
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
        <div className="bobbly-container bobble1"></div>
        <div className="bobbly-container bobble2"></div>
        <div className="bobbly-container bobble3"></div>
        <div className="bobbly-container bobble4"></div>

        <div className="relative w-[50%] flex items-center justify-center">
  {/* Clock Container */}
  <div className="relative flex justify-center items-center bg-red-400 h-[40rem] w-[40rem] lg:h-[50rem] lg:w-[50rem]  rounded-full z-0">
    {/* Clock face */}
    <div className="relative h-[400px] w-[400px] l bg-white rounded-full flex justify-center items-center">
      {/* Clock hands */}
      <div
        id="second-hand"
        className="absolute bg-red-500 h-[160px] w-1 origin-bottom"
        style={{
          transform: 'rotate(90deg)',
          top: '50%',
          left: '50%',
          transformOrigin: 'bottom center',
          translate: '-50% -160px',
        }}
      ></div>
      <div
        id="minute-hand"
        className="absolute bg-black h-[140px] w-1 origin-bottom"
        style={{
          transform: 'rotate(90deg)',
          top: '50%',
          left: '50%',
          transformOrigin: 'bottom center',
          translate: '-50% -140px',
        }}
      ></div>
      <div
        id="hour-hand"
        className="absolute bg-black h-[100px] w-1 origin-bottom"
        style={{
          transform: 'rotate(45deg)',
          top: '50%',
          left: '50%',
          transformOrigin: 'bottom center',
          translate: '-50% -100px',
        }}
      ></div>
      {/* Center dot */}
      <div className="absolute bg-black h-4 w-4 rounded-full" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
    </div>
  </div>
        </div>

      </div>
    </div>
  );
}
