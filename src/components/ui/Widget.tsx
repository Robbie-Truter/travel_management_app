import { GripVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-grid-layout/css/styles.css";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onTouchEnd?: React.TouchEventHandler;
}

const Widget = ({
  title,
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
      className={cn("group flex flex-col", className)}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex-1 flex flex-col bg-surface-2 border border-border/50 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative">
        {/* Header / Drag Handle */}
        <div className="px-4 py-3 border-b border-border/40 bg-surface-3/50 flex items-center justify-between cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <GripVertical
              size={14}
              className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-lavender-600">
              {title}
            </span>
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
