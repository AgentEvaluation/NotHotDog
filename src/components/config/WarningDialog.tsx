"use client";
import React, { useState, useEffect } from "react";
import { TriangleAlert, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WarningDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  severity?: 'warning' | 'error' | 'info';
}

export default function WarningDialog({ 
  isOpen, 
  onClose,
  title = "LLM Keys not configured",
  message = "Please navigate to Settings and set up your preferred LLM.",
  severity = 'warning'
}: WarningDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen);

  useEffect(() => {
    setInternalIsOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setInternalIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Get icon based on severity
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <TriangleAlert className="mr-2 h-5 w-5 text-destructive" />;
      case 'info':
        return <Settings className="mr-2 h-5 w-5 text-blue-500" />;
      case 'warning':
      default:
        return <TriangleAlert className="mr-2 h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Dialog open={internalIsOpen} onOpenChange={setInternalIsOpen}>
      <DialogContent className="sm:max-w-[425px] border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg font-semibold">
            {getIcon()}
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 text-sm text-muted-foreground">
          {message.includes('Settings') ? (
            <>
              {message.split('Settings')[0]}
              <span className="inline-flex items-center">
                Settings (<Settings className="inline w-4 h-4 mx-1" />)
              </span>
              {message.split('Settings')[1]}
            </>
          ) : (
            message
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}