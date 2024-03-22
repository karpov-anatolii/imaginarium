"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";

const MobileNav = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <Link href="/" className="flex items-center gap-2 md:py-2">
        <Image
          // src="/assets/images/logo-text.svg"
          src="/assets/images/imaginarium_logo.png?v=2"
          alt="logo"
          width={200}
          height={30}
        />
      </Link>

      <nav className="flex gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <Image
                src="/assets/icons/menu.svg"
                alt="menu"
                width={32}
                height={32}
                className="cursor-pointer"
              />
            </SheetTrigger>
            <SheetContent className="sheet-content w-full overflow-scroll sm:w-[330px]">
              <>
                <Image
                  src="/assets/images/imaginarium_logo.png?v=2"
                  alt="logo"
                  width={182}
                  height={30}
                  className="cursor-pointer"
                />

                <ul className="header-nav_elements">
                  {navLinks.map((link) => {
                    const isActive = link.route === pathname;
                    return (
                      <li
                        key={link.route}
                        className={` ${
                          isActive && "gradient-text"
                        } p-18 flex whitespace-nowrap text-dark-700`}
                      >
                        <Link
                          href={link.route}
                          className="sidebar-link cursor-pointer"
                          onClick={() => setOpen(false)}
                        >
                          <Image
                            src={link.icon}
                            alt="logo"
                            width={`${
                              link.label === "Background Replacement" ? 48 : 24
                            }`}
                            height={`${
                              link.label === "Background Replacement" ? 48 : 24
                            }`}
                          />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            </SheetContent>
          </Sheet>
        </SignedIn>

        <SignedOut>
          <Button asChild className="button bg-purple-gradient bg-cover">
            <Link href="/sign-in" className="">
              Login
            </Link>
          </Button>
        </SignedOut>
      </nav>
    </header>
  );
};

export default MobileNav;
