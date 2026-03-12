"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Settings } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <header className="h-11 border-b border-gray-200 bg-white shrink-0">
      <div className="flex items-center justify-between h-full px-4">
        {/* Spacer - left side intentionally empty */}
        <div />

        {/* Right side links + avatar */}
        <div className="flex items-center gap-1">
          <a
            href="#"
            className="px-2.5 py-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50"
          >
            What&apos;s new
          </a>
          <a
            href="#"
            className="px-2.5 py-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50"
          >
            Feedback
          </a>
          <a
            href="#"
            className="px-2.5 py-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-50"
          >
            Docs
          </a>

          <div className="mx-2 h-5 w-px bg-gray-200" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-7 w-7 rounded-full p-0"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback className="bg-gray-800 text-white text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-white border-gray-200"
              align="end"
            >
              <DropdownMenuLabel className="text-gray-900">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {session?.user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
