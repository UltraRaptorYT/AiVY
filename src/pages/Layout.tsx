import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/ui/sonner";

function Layout() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="fullHeight bg-white dark:bg-[#080c15] flex dark:text-white text-black w-full">
        <div className="grow w-full h-full">
          <Outlet />
          <Toaster richColors position="top-center" />
        </div>
      </main>
      <div className="fixed bottom-3 left-3">
        <ThemeToggle></ThemeToggle>
      </div>
    </ThemeProvider>
  );
}

export default Layout;
