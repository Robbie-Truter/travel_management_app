import { GripVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-grid-layout/css/styles.css";

interface WidgetProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
}

const Widget = ({
  title,
  subtitle,
  icon,
  children,
  className,
  style,
  onMouseDown,
  onMouseUp,
  onTouchEnd,
}: WidgetProps) => {
  return (
    <div
      style={style}
      className={cn("group flex flex-col h-full w-full", className)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1 flex flex-col bg-surface-2 border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
        {/* Header / Drag Handle */}
        <div className="px-4 py-3 border-b border-border/40 bg-surface-3/50 flex items-center justify-between cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2.5">
            <GripVertical
              size={14}
              className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity -ml-1"
            />
            {icon && (
              <div className="p-1 rounded-md bg-lavender-50 dark:bg-lavender-900/30 text-lavender-600 dark:text-lavender-400">
                {icon}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-lavender-600 leading-none">
                {title}
              </span>
              {subtitle && (
                <span className="text-[9px] font-bold text-text-muted leading-none mt-1 uppercase tracking-wider opacity-80">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <button className="text-text-muted hover:text-text-primary transition-colors">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 text-sm text-text-secondary leading-relaxed overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Widget;
