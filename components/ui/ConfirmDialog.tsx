"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, LogOut, Info, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "primary" | "warning";
  icon?: "trash" | "warning" | "logout" | "info";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  icon = "trash",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const isExecuting = loading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
      onOpenChange(false);
    }
  };

  const getIconElement = () => {
    switch (icon) {
      case "trash":
        return (
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-inner">
            <Trash2 className="h-6 w-6" />
          </div>
        );
      case "warning":
        return (
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-inner">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "logout":
        return (
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-inner">
            <LogOut className="h-6 w-6" />
          </div>
        );
      case "info":
      default:
        return (
          <div className="h-12 w-12 rounded-2xl bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber flex items-center justify-center border border-seneca-crimson/20 shadow-inner">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    if (variant === "destructive") {
      return "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20";
    }
    if (variant === "warning") {
      return "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20";
    }
    return "bg-seneca-crimson hover:bg-seneca-crimson-dark text-white shadow-md shadow-seneca-crimson/20";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border/80 bg-card/98 backdrop-blur-2xl p-6 max-w-sm sm:max-w-md">
        <DialogHeader className="space-y-3 text-center items-center">
          {getIconElement()}
          <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExecuting}
            className="flex-1 rounded-xl font-bold text-xs h-10 border-border/80"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isExecuting}
            className={`flex-1 rounded-xl font-bold text-xs gap-1.5 h-10 ${getConfirmButtonClasses()}`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {icon === "trash" && <Trash2 className="h-3.5 w-3.5" />}
                {icon === "warning" && <AlertTriangle className="h-3.5 w-3.5" />}
                {icon === "logout" && <LogOut className="h-3.5 w-3.5" />}
                <span>{confirmText}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDialog;
