import { useState, useRef } from "react";
import { User, LogOut, Mail, Shield } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface UserProfileProps {
  isCollapsed?: boolean;
}

export function UserProfile({ isCollapsed = false }: UserProfileProps) {
  const [open, setOpen] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
              "flex items-center gap-3 w-full p-2 rounded-xl transition-all duration-300",
              "hover:bg-surface-3 group relative",
              isCollapsed ? "justify-center" : "px-3",
            )}
          >
            {/* Rounded Avatar Icon */}
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-lavender-500 to-fuchsia-pastel-500 flex items-center justify-center text-white shadow-md shadow-lavender-500/20 group-hover:scale-105 transition-transform duration-300">
              <User size={20} strokeWidth={2.5} />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-bold text-text-primary truncate w-full">
                  My Account
                </span>
                <span className="text-[10px] text-text-muted truncate w-full">{user.email}</span>
              </div>
            )}
          </button>
        </Popover.Trigger>

        <AnimatePresence>
          {open && (
            <Popover.Portal forceMount>
              <Popover.Content
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                side="right"
                align="start"
                sideOffset={12}
                asChild
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    y: isCollapsed ? 0 : 10,
                    x: isCollapsed ? -10 : 0,
                    scale: 0.95,
                  }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: isCollapsed ? 0 : 10,
                    x: isCollapsed ? -10 : 0,
                    scale: 0.95,
                  }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="z-50 w-64 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border bg-surface-2/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-lavender-100 to-fuchsia-pastel-100 dark:from-lavender-900/40 dark:to-fuchsia-pastel-900/40 flex items-center justify-center text-lavender-600">
                        <User size={24} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">Traveler</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-lavender-600 uppercase tracking-widest px-1">
                        <Shield size={10} />
                        User Verified
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1 bg-surface">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-secondary">
                      <Mail size={14} className="text-text-muted" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-surface-2/30 border-t border-border mt-1">
                    <Button
                      variant="ghost"
                      onClick={handleSignOut}
                      className="w-full justify-start text-rose-pastel-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 group h-10 px-3"
                    >
                      <LogOut
                        size={16}
                        className="mr-2 group-hover:translate-x-0.5 transition-transform"
                      />
                      <span className="font-bold">Sign Out</span>
                    </Button>
                  </div>
                </motion.div>
              </Popover.Content>
            </Popover.Portal>
          )}
        </AnimatePresence>
      </Popover.Root>
    </div>
  );
}
