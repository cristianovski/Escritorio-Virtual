import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = 'Confirmar',
  message,
  onConfirm,
  onCancel,
  confirming = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !confirming && onOpenChange(nextOpen)}>
      <DialogContent closeDisabled={confirming}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="leading-6">{message}</DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={confirming}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={confirming} aria-busy={confirming}>
            {confirming ? 'Excluindo…' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
