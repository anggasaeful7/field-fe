import { useNavigate } from "react-router";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetFooter,
  SheetClose,
} from "src/components/ui/sheet";
import { Avatar, AvatarFallback } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { Badge } from "src/components/ui/badge";
import { Icon } from "@iconify/react";
import { Mailbox, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function ProfileSheet() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Anda telah keluar.');
    navigate('/auth/auth2/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <Sheet>
      <SheetTrigger className="cursor-pointer hover:bg-primary/5 flex items-center justify-center rounded-full h-10 w-10">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </SheetTrigger>

      <SheetContent
        showCloseButton={false}
        side="right"
        className="border-s-0 w-full sm:max-w-80 max-w-60"
      >
        <SheetClose className="absolute top-5 end-5 p-2 hover:bg-primary/5 hover:text-primary rounded-full">
          <Icon icon="tabler:x" width={20} height={20} />
        </SheetClose>

        <div className="p-6 py-6">
          <div className="flex flex-col gap-3 justify-center items-center pt-8">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="text-center space-y-1">
              <h6 className="text-lg font-semibold text-foreground">{user?.name || 'Pengguna'}</h6>
              <div className="flex items-center gap-1.5 justify-center text-muted-foreground text-xs">
                <Mailbox size={14} />
                <span>{user?.email || 'user@mapid.dev'}</span>
              </div>
              <div className="pt-1">
                <Badge variant="outline" className="capitalize text-[11px]">
                  Role: {user?.role || 'Guest'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="px-6 pb-6 mt-auto">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full cursor-pointer gap-2"
          >
            <LogOut size={16} />
            Keluar (Logout)
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
