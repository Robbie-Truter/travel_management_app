import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Moon,
  Sun,
  Menu,
  X,
  Plane,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountrySelector } from "@/components/ui/CountrySelector";
import { useTheme, useSettings } from "@/hooks/useTrips";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNewTrip: () => void;
  onImport: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  homeCountry: string | null;
  setHomeCountry: (value: string) => void;
}

export function AppShell({
  children,
  onNewTrip,
  onImport,
}: {
  children: React.ReactNode;
  onNewTrip: () => void;
  onImport: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { homeCountry, setHomeCountry } = useSettings();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="hidden md:flex flex-col bg-surface border-r border-border shrink-0 overflow-hidden"
      >
        <SidebarContent
          onNewTrip={onNewTrip}
          onImport={onImport}
          theme={theme}
          toggleTheme={toggleTheme}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          homeCountry={homeCountry}
          setHomeCountry={setHomeCountry}
        />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface border-r border-border md:hidden"
            >
              <SidebarContent
                onNewTrip={onNewTrip}
                onImport={onImport}
                theme={theme}
                toggleTheme={toggleTheme}
                onClose={() => setMobileOpen(false)}
                isCollapsed={false}
                onToggleCollapse={() => {}}
                homeCountry={homeCountry}
                setHomeCountry={setHomeCountry}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-surface border-b border-border">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Plane size={20} className="text-text-primary" />
            <span className="font-bold text-text-primary">Wanderplan</span>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  onNewTrip,
  onImport,
  theme,
  toggleTheme,
  onClose,
  isCollapsed,
  onToggleCollapse,
  homeCountry,
  setHomeCountry,
}: SidebarProps & {
  theme: string;
  toggleTheme: () => void;
  onClose?: () => void;
}) {
  const navigate = useNavigate();

  const handleNewTrip = () => {
    onNewTrip();
    onClose?.();
  };

  const handleImport = () => {
    onImport();
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-border min-h-[73px]",
          isCollapsed ? "justify-center px-0" : "justify-between px-5 py-5",
        )}
      >
        <button
          onClick={() => {
            navigate("/");
            onClose?.();
          }}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-lavender-500 flex items-center justify-center shrink-0">
            <Plane size={16} className="text-white" />
          </div>
          {!isCollapsed && <span className="font-bold text-lg text-text-primary">Wanderplan</span>}
        </button>
        {onClose && (
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 py-4 space-y-1", isCollapsed ? "px-2" : "px-3")}>
        <NavLink
          to="/"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors overflow-hidden whitespace-nowrap",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
              isActive
                ? "bg-rose-pastel-300 text-white"
                : "hover:bg-surface-3 hover:text-text-primary",
            )
          }
          end
        >
          <Plane size={isCollapsed ? 20 : 18} className="shrink-0" />
          {!isCollapsed && <span>My Trips</span>}
        </NavLink>
        <NavLink
          to="/maps"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors overflow-hidden whitespace-nowrap",
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2",
              isActive
                ? "bg-rose-pastel-300 text-white"
                : "hover:bg-surface-3 hover:text-text-primary",
            )
          }
        >
          <Map size={isCollapsed ? 20 : 18} className="shrink-0" />
          {!isCollapsed && <span>My Maps</span>}
        </NavLink>
      </nav>

      {/* Country of Origin */}
      <div className={cn("border-t border-border", isCollapsed ? "py-2" : "py-1")}>
        <CountrySelector value={homeCountry} onChange={setHomeCountry} isCollapsed={isCollapsed} />
      </div>

      {/* Actions */}
      <div className={cn("py-4 space-y-2 border-t border-border", isCollapsed ? "px-2" : "px-3")}>
        <Button
          variant="primary"
          className={cn("w-full transition-all overflow-hidden", isCollapsed ? "px-0" : "")}
          onClick={handleNewTrip}
          title={isCollapsed ? "New Trip" : undefined}
        >
          <Plus size={16} className="shrink-0" />
          {!isCollapsed && <span className="ml-2 whitespace-nowrap">New Trip</span>}
        </Button>
        <Button
          variant="secondary"
          className={cn("w-full transition-all overflow-hidden", isCollapsed ? "px-0" : "")}
          onClick={handleImport}
          title={isCollapsed ? "Import Trip" : undefined}
        >
          <Upload size={16} className="shrink-0" />
          {!isCollapsed && <span className="ml-2 whitespace-nowrap">Import Trip</span>}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start transition-all overflow-hidden",
            isCollapsed ? "px-0 justify-center" : "",
          )}
          onClick={toggleTheme}
          title={isCollapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
        >
          {theme === "dark" ? (
            <Sun size={16} className="shrink-0" />
          ) : (
            <Moon size={16} className="shrink-0" />
          )}
          {!isCollapsed && (
            <span className="ml-2 whitespace-nowrap">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          )}
        </Button>

        {/* Collapse Toggle Button (Desktop only) */}
        {!onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full mt-4 flex items-center justify-center text-text-secondary hover:text-text-primary"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        )}
      </div>
    </div>
  );
}
