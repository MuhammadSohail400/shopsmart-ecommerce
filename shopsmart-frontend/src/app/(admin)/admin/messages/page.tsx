"use client";

import { useState } from 'react';
import {
  Mail,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  Archive,
  Trash2,
  Send,
  User,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  useContactMessages,
  useUpdateContactMessageStatus,
  useDeleteContactMessage,
} from '@/hooks/use-admin';
import { AdminContactMessage } from '@/services/admin-operations.service';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read' | 'responded' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<AdminContactMessage | null>(null);

  const { data: messages, isLoading, refetch, isFetching } = useContactMessages(activeTab === 'all' ? undefined : activeTab);
  const updateStatusMutation = useUpdateContactMessageStatus();
  const deleteMessageMutation = useDeleteContactMessage();

  const allMessages = messages || [];

  const filteredMessages = allMessages.filter((msg) => {
    const query = searchQuery.toLowerCase();
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.email.toLowerCase().includes(query) ||
      msg.subject.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query)
    );
  });

  const unreadCount = allMessages.filter((m) => m.status === 'unread').length;
  const respondedCount = allMessages.filter((m) => m.status === 'responded').length;
  const totalCount = allMessages.length;

  const handleOpenMessage = (msg: AdminContactMessage) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      updateStatusMutation.mutate({ id: msg.id, status: 'read' });
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          if (selectedMessage && selectedMessage.id === id) {
            setSelectedMessage({ ...selectedMessage, status: newStatus as any });
          }
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer inquiry?')) {
      deleteMessageMutation.mutate(id, {
        onSuccess: () => {
          if (selectedMessage && selectedMessage.id === id) {
            setSelectedMessage(null);
          }
        },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive" className="font-semibold text-xs">Unread</Badge>;
      case 'read':
        return <Badge variant="secondary" className="font-semibold text-xs">Read</Badge>;
      case 'responded':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs">Responded</Badge>;
      case 'archived':
        return <Badge variant="outline" className="font-semibold text-xs text-muted-foreground">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <MessageSquare className="h-6 w-6 text-primary" />
            Customer Inquiries
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage, review, and reply to customer inquiries submitted through the contact form.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-xl gap-2 font-medium"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Unread Inquiries</p>
              <p className="text-2xl font-black text-foreground mt-1">{unreadCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
              <Mail className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Responded</p>
              <p className="text-2xl font-black text-foreground mt-1">{respondedCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Inquiries</p>
              <p className="text-2xl font-black text-foreground mt-1">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls & Filter Tabs */}
      <Card className="rounded-2xl border-border shadow-xs">
        <CardHeader className="p-5 pb-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {(['all', 'unread', 'read', 'responded', 'archived'] as const).map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="rounded-xl text-xs capitalize font-bold h-8 px-3"
                >
                  {tab}
                  {tab === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-destructive text-destructive-foreground text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-bold text-foreground">No customer inquiries found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {searchQuery
                  ? 'No messages match your search query. Try clearing your search filter.'
                  : 'Customer messages submitted via the storefront Contact form will appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`p-5 transition-colors cursor-pointer hover:bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    msg.status === 'unread' ? 'bg-primary/[0.02] font-medium' : ''
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">({msg.email})</span>
                      {getStatusBadge(msg.status)}
                    </div>
                    <p className="text-sm font-bold text-foreground truncate">{msg.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{msg.message}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 rounded-lg flex items-center justify-center hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors outline-none">
                        <Eye className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl min-w-44">
                        <DropdownMenuItem onClick={() => handleOpenMessage(msg)} className="text-xs font-semibold gap-2 cursor-pointer">
                          <Eye className="h-3.5 w-3.5" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            window.location.href = `mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`;
                          }}
                          className="text-xs font-semibold gap-2 text-primary cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" /> Reply via Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {msg.status !== 'read' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(msg.id, 'read')} className="text-xs gap-2">
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        {msg.status !== 'responded' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(msg.id, 'responded')} className="text-xs gap-2 text-emerald-600">
                            Mark as Responded
                          </DropdownMenuItem>
                        )}
                        {msg.status !== 'archived' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(msg.id, 'archived')} className="text-xs gap-2">
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(msg.id)}
                          className="text-xs font-semibold text-destructive gap-2 focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Inspection Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                {getStatusBadge(selectedMessage.status)}
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>
              <DialogTitle className="text-xl font-black text-foreground">
                {selectedMessage.subject}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Inquiry from <strong className="text-foreground">{selectedMessage.name}</strong> ({selectedMessage.email})
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 p-4 rounded-xl bg-muted/40 border border-border/60">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Message Body</p>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'responded' ? 'read' : 'responded')}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  {selectedMessage.status === 'responded' ? 'Mark as Read' : 'Mark as Responded'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange(selectedMessage.id, 'archived')}
                  className="rounded-xl text-xs font-semibold gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`;
                  }}
                  className="rounded-xl font-bold text-xs gap-1.5 bg-primary text-primary-foreground"
                >
                  <Send className="h-3.5 w-3.5" /> Reply to Customer
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
