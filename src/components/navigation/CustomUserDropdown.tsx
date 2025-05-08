"use client";

import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import ApiKeyConfig from "@/components/config/ApiKeyConfig";
import { useState } from "react";
import { KeyRound, Sun, Moon } from "lucide-react";

export default function CustomUserDropdown() {
  const { theme, setTheme } = useTheme();
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="API Keys Config"
            labelIcon={<KeyRound className="h-4 w-4" />}
            onClick={() => setIsApiKeyModalOpen(true)}
          />
          <UserButton.Action
            label={theme === "dark" ? "Light Theme" : "Dark Theme"}
            labelIcon={
              theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            }
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          />
        </UserButton.MenuItems>
      </UserButton>

      {/* API Key Config Modal */}
      <ApiKeyConfig
        isOpen={isApiKeyModalOpen}
        setIsOpen={setIsApiKeyModalOpen}
      />
    </>
  );
}