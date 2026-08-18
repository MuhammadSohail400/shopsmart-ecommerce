"use client";

import { useState } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
  Eye,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedLogForDetail, setSelectedLogForDetail] = useState<any>(null);

  const { data: logsData, isLoading } = useAuditLogs({
    limit: 100,
    action: actionFilter !== 'all' ? actionFilter : undefined,
  });

  const logs = logsData?.data || [];

  const filteredLogs = logs.filter((log: any) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchEntity = log.entityType?.toLowerCase().includes(q);
      const matchActor = log.actor?.email?.toLowerCase().includes(q) || log.actorId?.toLowerCase().includes(q);
      if (!matchAction && !matchEntity && !matchActor) return false;
    }
    return true;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('created') || action.includes('add')) return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
    if (action.includes('updated') || action.includes('changed') || action.includes('modified')) return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    if (action.includes('deleted') || action.includes('archived') || action.includes('refund')) return 'bg-destructive/10 text-destructive border-destructive/30';
    return 'bg-secondary text-foreground border-border';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground uppercase tracking-tight">
            Audit Trail & Logs
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Immutable system logs tracking administrative actions, role changes, catalog updates, and order overrides.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-3.5 rounded-2xl border-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by action, entity, actor email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={actionFilter} onValueChange={(val) => val && setActionFilter(val)}>
            <SelectTrigger className="h-9 text-xs w-full sm:w-52">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Actions</SelectItem>
              <SelectItem value="product.created" className="text-xs">Product Created</SelectItem>
              <SelectItem value="product.updated" className="text-xs">Product Updated</SelectItem>
              <SelectItem value="staff.created" className="text-xs">Staff Created</SelectItem>
              <SelectItem value="staff.role_changed" className="text-xs">Staff Role Changed</SelectItem>
              <SelectItem value="order.status_changed" className="text-xs">Order Status Changed</SelectItem>
              <SelectItem value="order.refund_issued" className="text-xs">Refund Issued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Actor</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">IP / Source</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    Loading audit trail records...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                    No audit records recorded for this filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="p-3.5">
                      <div className="font-bold text-foreground truncate max-w-[180px]">
                        {log.actor?.email || log.actorId ? (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-primary" />
                            {log.actor?.email || log.actorId.slice(0, 8)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">System Automated</span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-3.5">
                      <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </Badge>
                    </td>

                    {/* Entity */}
                    <td className="p-3.5">
                      <div className="font-semibold text-foreground">
                        {log.entityType}
                      </div>
                      {log.entityId && (
                        <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">
                          {log.entityId}
                        </div>
                      )}
                    </td>

                    {/* IP / Source */}
                    <td className="p-3.5 text-muted-foreground font-mono text-[10px]">
                      {log.ipAddress || 'Internal'}
                    </td>

                    {/* Detail Dialog */}
                    <td className="p-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLogForDetail(log)}
                        className="h-7 px-2 text-[11px] font-bold gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect Dialog */}
      <Dialog open={!!selectedLogForDetail} onOpenChange={(open) => !open && setSelectedLogForDetail(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <FileCode className="h-5 w-5 text-primary" />
              Audit Log Record #{selectedLogForDetail?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detailed payload snapshot and recorded change diff.
            </DialogDescription>
          </DialogHeader>

          {selectedLogForDetail && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Event Action</span>
                  <span className="font-black text-foreground">{selectedLogForDetail.action}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Target Entity</span>
                  <span className="font-black text-foreground">{selectedLogForDetail.entityType} ({selectedLogForDetail.entityId || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Actor</span>
                  <span className="font-medium text-foreground">{selectedLogForDetail.actor?.email || selectedLogForDetail.actorId || 'System'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Exact Timestamp</span>
                  <span className="font-mono text-muted-foreground">{new Date(selectedLogForDetail.createdAt).toISOString()}</span>
                </div>
              </div>

              {/* JSON Diffs */}
              {selectedLogForDetail.oldValue && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-destructive uppercase tracking-wider">Previous State (Before)</span>
                  <pre className="p-3 rounded-xl bg-secondary/50 border border-border overflow-x-auto font-mono text-[11px] text-foreground max-h-40">
                    {JSON.stringify(selectedLogForDetail.oldValue, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLogForDetail.newValue && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Updated State (After)</span>
                  <pre className="p-3 rounded-xl bg-secondary/50 border border-border overflow-x-auto font-mono text-[11px] text-foreground max-h-40">
                    {JSON.stringify(selectedLogForDetail.newValue, null, 2)}
                  </pre>
                </div>
              )}

              {!selectedLogForDetail.oldValue && !selectedLogForDetail.newValue && (
                <div className="p-4 text-center text-muted-foreground rounded-xl bg-secondary/20 border border-border">
                  No state delta attached to this system audit record.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
