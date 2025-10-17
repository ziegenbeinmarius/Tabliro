"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ConfirmationModalParams {
  openButtonText: string;
  openButtonChildren?: React.ReactNode;
  openButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  onConfirm: () => void;
  children: React.ReactNode;
  title?: string;
  confirmVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
  disabled?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}
export default function ConfirmationModal({
  openButtonText,
  openButtonChildren,
  onConfirm,
  children,
  title = "Are you sure?",
  openButtonVariant = "default",
  confirmVariant = "default",

  disabled,
  size = "default",
}: ConfirmationModalParams) {
  const [isOpen, setIsOpen] = useState(false);
  function submit() {
    onConfirm();
    handleClose();
  }
  function handleOpen() {
    setIsOpen(true);
  }
  function handleClose() {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <Button
        disabled={disabled}
        size={size}
        variant={openButtonVariant}
        onClick={handleOpen}
      >
        {openButtonChildren ?? openButtonText}
      </Button>
      <DialogContent className=" max-w-xl max-h-[70vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {children}
        <Button variant={confirmVariant} onClick={submit}>
          Confirm
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
}
