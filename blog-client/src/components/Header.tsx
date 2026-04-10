import React from "react";
import { Button } from "@/components/ui/button";

export const Header: React.FC<{ onNavigate: (page: string) => void }> = ({
  onNavigate,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate("home")}
          className="font-serif text-2xl font-bold tracking-tight text-stone-900 hover:text-amber-700 transition-colors"
        >
          The Margin
        </button>
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-500">
          <button
            onClick={() => onNavigate("home")}
            className="hover:text-stone-900 transition-colors"
          >
            Archive
          </button>
          <button
            onClick={() => onNavigate("about")}
            className="hover:text-stone-900 transition-colors"
          >
            About
          </button>
          <Button
            size="sm"
            className="bg-stone-900 text-white hover:bg-amber-700 rounded-none text-xs tracking-widest uppercase font-semibold px-4"
          >
            Subscribe
          </Button>
        </nav>
      </div>
    </header>
  );
};
