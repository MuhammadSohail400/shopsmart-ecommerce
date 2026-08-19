"use client";

import { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  KeyRound,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useStaff, useCreateStaff, useUpdateStaffRole } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ROLE_DEFINITIONS: Record<string, { label: string; description: string; color: string }> = {
  admin: {
    label: 'Super Admin',
    description: 'Full store control, financial analytics, staff onboarding, settings, and full catalog rights.',
    color: 'bg-primary/10 text-primary border-primary/30',
  },
  inventory_manager: {
    label: 'Inventory Manager',
    description: 'Manage apparel stock levels, track warehouses, and update product variants.',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  },
  support_agent: {
    label: 'Support Agent',
    description: 'View customer orders, review transactions, and manage order fulfillment status.',
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  },
  customer: {
    label: 'Customer',
    description: 'Regular storefront shopper account without staff console privileges.',
    color: 'bg-secondary text-muted-foreground border-border',
  },
};

export default function AdminStaffPage() {
  const { user: currentUser } = useAuth();
  const { data: staffList, isLoading } = useStaff();
  const createStaffMutation = useCreateStaff();
  const updateRoleMutation = useUpdateStaffRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'inventory_manager' | 'support_agent'>('support_agent');

  const staff = staffList || [];
  const adminCount = staff.filter((s) => s.role === 'admin').length;

  const filteredStaff = staff.filter((member) => {
    if (roleFilter !== 'all' && member.role !== roleFilter) return false;
    if (searchQuery && !member.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (newPassword.length < 8 || !hasUpper || !hasLower || !hasNumber) {
      toast.error('Password must be at least 8 characters with at least 1 uppercase, 1 lowercase, and 1 number (e.g. Staff@123456)');
      return;
    }

    try {
      await createStaffMutation.mutateAsync({
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        role: newRole,
      });

      setIsAddOpen(false);
      setNewEmail('');
      setNewPassword('');
      setNewRole('support_agent');
    } catch (err: any) {
      // Handled by mutation onError toast
    }
  };

  const handleRoleChange = (staffId: string, currentRole: string, newRoleValue: string) => {
    if (currentRole === 'admin' && newRoleValue !== 'admin' && adminCount <= 1) {
      alert('Last Admin Protection: You cannot demote the only remaining Administrator on the platform!');
      return;
    }

    if (confirm(`Are you sure you want to change this staff member's role to "${newRoleValue}"?`)) {
      updateRoleMutation.mutate({ staffId, role: newRoleValue });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Staff & Role Permissions
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Manage team members, staff roles, and administrative access control.
          </p>
        </div>

        {/* Add Staff Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger
            render={
              <Button className="font-bold rounded-full text-xs gap-1.5 shadow-sm">
                <UserPlus className="h-4 w-4" /> Onboard Staff Member
              </Button>
            }
          />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight">
                Add Team Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                Create a new staff account with dedicated role permissions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="agent@shopsmart.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold">Temporary Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 text-xs"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-bold">Assigned Role</Label>
                <Select value={newRole} onValueChange={(val: any) => val && setNewRole(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select Staff Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-xs">Super Admin (Full Access)</SelectItem>
                    <SelectItem value="inventory_manager" className="text-xs">Inventory Manager (Stock & Catalog)</SelectItem>
                    <SelectItem value="support_agent" className="text-xs">Support Agent (Orders & Fulfillment)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground pt-1">
                  {ROLE_DEFINITIONS[newRole]?.description}
                </p>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createStaffMutation.isPending}
                  className="text-xs font-bold"
                >
                  {createStaffMutation.isPending ? 'Onboarding...' : 'Onboard Staff'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Summary Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(ROLE_DEFINITIONS).filter(([key]) => key !== 'customer').map(([key, info]) => {
          const count = staff.filter((s) => s.role === key).length;
          return (
            <Card key={key} className="p-4 rounded-2xl border-border flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-foreground">{info.label}</span>
                  <Badge variant="secondary" className="text-[10px] font-bold">
                    {count} Members
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {info.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 rounded-2xl border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={(val) => val && setRoleFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Roles</SelectItem>
              <SelectItem value="admin" className="text-xs">Super Admin</SelectItem>
              <SelectItem value="inventory_manager" className="text-xs">Inventory Manager</SelectItem>
              <SelectItem value="support_agent" className="text-xs">Support Agent</SelectItem>
              <SelectItem value="customer" className="text-xs">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Staff Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Staff Member</th>
                <th className="p-3.5">Current Role</th>
                <th className="p-3.5">Date Added</th>
                <th className="p-3.5">Security Status</th>
                <th className="p-3.5 text-right">Role Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                    Loading staff members...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                    No staff members match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const isCurrent = member.email === currentUser?.email;
                  const isLastAdmin = member.role === 'admin' && adminCount <= 1;
                  const roleInfo = ROLE_DEFINITIONS[member.role] || ROLE_DEFINITIONS.customer;

                  return (
                    <tr key={member.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Member Email */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">
                            {member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              {member.email}
                              {isCurrent && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase text-primary border-primary/30">
                                  You
                                </Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">
                              ID: {member.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Current Role */}
                      <td className="p-3.5">
                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-wider ${roleInfo.color}`}>
                          {roleInfo.label}
                        </Badge>
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(member.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Verification Status */}
                      <td className="p-3.5">
                        {member.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                            <AlertCircle className="h-3.5 w-3.5" /> Unverified
                          </span>
                        )}
                      </td>

                      {/* Role Dropdown / Action */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLastAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20" title="Sole administrator protection active">
                              <ShieldAlert className="h-3.5 w-3.5" /> Last Admin (Locked)
                            </span>
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(val) => val && handleRoleChange(member.id, member.role, val)}
                              disabled={updateRoleMutation.isPending}
                            >
                              <SelectTrigger className="h-8 text-xs w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin" className="text-xs">Super Admin</SelectItem>
                                <SelectItem value="inventory_manager" className="text-xs">Inventory Manager</SelectItem>
                                <SelectItem value="support_agent" className="text-xs">Support Agent</SelectItem>
                                <SelectItem value="customer" className="text-xs">Revoke to Customer</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
