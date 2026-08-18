"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth, useLogout } from '@/hooks/use-auth';
import { Menu, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AdminSidebar } from './admin-sidebar';

export function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const logout = useLogout();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Generate readable breadcrumb from pathname
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const currentTitle = pathSegments.length > 1
    ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1)
    : 'Dashboard';

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden h-9 w-9"><Menu className="h-5 w-5" /></Button>} />
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Admin Navigation</SheetTitle>
            </SheetHeader>
            <AdminSidebar isMobile onItemClick={() => setIsMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground hidden sm:block">
            Management Console
          </div>
          <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight uppercase">
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-black uppercase tracking-wider bg-primary/10 text-primary border-primary/30">
          <Shield className="h-3 w-3 mr-1" />
          {user?.role || 'Staff'}
        </Badge>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 px-2 rounded-full border border-border">
                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <span className="text-xs font-bold text-foreground hidden md:inline">
                  {user?.firstName || user?.email?.split('@')[0]}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="text-xs font-bold text-foreground truncate">{user?.email}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  Role: {user?.role}
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout.mutate()}
              className="cursor-pointer text-xs font-medium text-destructive focus:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
