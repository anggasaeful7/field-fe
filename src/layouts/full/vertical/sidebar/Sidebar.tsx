import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import NavCollapse from './nav-collapse';
import SimpleBar from 'simplebar-react';
import FullLogo from '../../shared/logo/FullLogo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from 'src/components/ui/sidebar';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { LogOut } from 'lucide-react';
import sidebaritems from './sidebaritems';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const SidebarLayout = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Anda telah keluar.');
    navigate('/auth/auth2/login');
  };

  const filteredMenu = useMemo(() => {
    return sidebaritems.map((group) => ({
      ...group,
      items: group.items?.filter((item) => {
        if (item.url === '/admin/users' && !isAdmin) return false;
        return true;
      }),
    }));
  }, [isAdmin]);

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="sidebar-box **:data-[slot=sidebar-inner]:bg-background **:data-[slot=sidebar-inner]:border **:data-[slot=sidebar-inner]:border-border group-data-[state=collapsed]:hover:shadow-xl"
      side="left"
    >
      <SidebarHeader className="p-3 group-data-[state=collapsed]:px-2.5 flex flex-row items-center justify-between border-b border-border">
        <FullLogo />
        <Badge className="group-data-[state=collapsed]:hidden" variant="secondary">
          MAPID
        </Badge>
      </SidebarHeader>

      <SidebarContent>
        <SimpleBar style={{ height: '100%' }}>
          <SidebarGroup className="flex items-center justify-center group-data-[state=collapsed]:px-2 px-3 py-4">
            <div className="px-0 group-data-[state=collapsed]:px-0 w-full flex flex-col gap-4">
              <NavCollapse menu={filteredMenu} className="text-sm" />
            </div>
          </SidebarGroup>
        </SimpleBar>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <div className="hide-menu flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex flex-col truncate pr-2">
            <span className="font-semibold text-foreground truncate">{user?.name || 'User'}</span>
            <span className="text-[10px] capitalize text-muted-foreground">Peran: {user?.role}</span>
          </div>
          <Button
            data-testid="sidebar-logout-btn"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            title="Keluar (Logout)"
            className="cursor-pointer text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <LogOut size={14} className="mr-1" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default SidebarLayout;
