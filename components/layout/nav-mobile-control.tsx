"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavMobile } from "./nav-mobile";
interface NavItem {
  title: string;
  items: { title: string; href: string }[];
}

interface NavMobileControlProps {
  items: NavItem[];
}

export function NavMobileControl({ items }: NavMobileControlProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs transform bg-background shadow-lg transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b pl-6 pr-2">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="size-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
          <NavMobile items={items} />
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
