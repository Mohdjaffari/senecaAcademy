"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (_) {}

    toast.success("Signed out successfully", {
      description: "Your portal session has been safely closed.",
    });

    onOpenChange(false);
    // Smooth transition to login without hard page refresh
    router.replace("/login");
    setLoggingOut(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border/80 bg-card/98 backdrop-blur-2xl p-6 max-w-sm">
        <DialogHeader className="space-y-2.5 text-center items-center">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
            <LogOut className="h-6 w-6" />
          </div>
          <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
            Sign Out of Seneca Portal?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground text-center leading-relaxed">
            Are you sure you want to end your active session? Any unsaved form progress will be lost.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loggingOut}
            className="flex-1 rounded-xl font-bold text-xs h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmLogout}
            disabled={loggingOut}
            className="flex-1 rounded-xl font-bold text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white h-10 shadow-md shadow-rose-600/20"
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Signing Out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5" />
                <span>Yes, Sign Out</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LogoutConfirmDialog;
