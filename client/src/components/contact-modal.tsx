
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Professional } from "@shared/schema";

interface ContactModalProps {
  professional: Professional | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ professional, isOpen, onClose }: ContactModalProps) {
  const { toast } = useToast();

  if (!professional) return null;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: `Could not copy ${type.toLowerCase()}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact {professional.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Email</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{professional.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(professional.email, "Email")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Phone */}
          {professional.phone && (
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Phone</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{professional.phone}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(professional.phone!, "Phone")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => window.open(`mailto:${professional.email}`, '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            {professional.phone && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`tel:${professional.phone}`, '_blank')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
