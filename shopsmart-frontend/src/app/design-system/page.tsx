"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { StatusIndicator } from "@/components/shared/status-indicator"
import { EmptyState } from "@/components/shared/empty-state"
import { ErrorState } from "@/components/shared/error-state"
import { DataTable } from "@/components/shared/data-table"
import { PackageOpen } from "lucide-react"

export default function DesignSystemPage() {
  const sampleTableData = [
    { id: "1", name: "Wireless Headphones", status: "Active", price: "$99.00" },
    { id: "2", name: "Mechanical Keyboard", status: "Inactive", price: "$120.00" },
  ]
  const sampleColumns = [
    { header: "ID", accessorKey: "id" as const },
    { header: "Product", accessorKey: "name" as const },
    { header: "Status", accessorKey: "status" as const },
    { header: "Price", accessorKey: "price" as const },
  ]

  return (
    <div className="container py-12 space-y-16">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Design System</h1>
        <p className="text-muted-foreground text-lg">ShopSmart Phase 2 Visual Foundation</p>
      </div>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Typography</h2>
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Heading 1</h1>
          <h2 className="text-3xl font-semibold tracking-tight first:mt-0">Heading 2</h2>
          <h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
          <h4 className="text-xl font-semibold tracking-tight">Heading 4</h4>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            The king, seeing how much mother and daughter loved each other, resolved to marry the mother and make the daughter a princess.
          </p>
          <p className="text-sm text-muted-foreground">This is a muted paragraph or caption.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button disabled><Spinner className="mr-2 h-4 w-4" /> Loading</Button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Inputs & Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Input</label>
            <Input placeholder="Enter something..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Disabled Input</label>
            <Input disabled placeholder="Disabled..." />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Accept terms and conditions
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" />
            <label htmlFor="airplane-mode" className="text-sm font-medium leading-none">Airplane Mode</label>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Badges & Indicators</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
          <Badge variant="destructive">Destructive Badge</Badge>
          <Badge variant="outline">Outline Badge</Badge>
        </div>
        <div className="flex flex-wrap gap-4 pt-4">
          <StatusIndicator variant="success" pulse>Online</StatusIndicator>
          <StatusIndicator variant="warning">Pending</StatusIndicator>
          <StatusIndicator variant="error">Failed</StatusIndicator>
          <StatusIndicator variant="info">Processing</StatusIndicator>
          <StatusIndicator variant="default">Draft</StatusIndicator>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Surfaces (Cards)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
              <CardDescription>A basic card with standard padding.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here. It has a default padding and border.</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold border-b pb-2">Complex States</h2>
        <Tabs defaultValue="empty" className="w-full">
          <TabsList>
            <TabsTrigger value="empty">Empty State</TabsTrigger>
            <TabsTrigger value="error">Error State</TabsTrigger>
            <TabsTrigger value="table">Data Table</TabsTrigger>
          </TabsList>
          <TabsContent value="empty" className="pt-4">
            <EmptyState 
              title="No Products Found" 
              description="Your search didn't match any products. Try adjusting your filters."
              icon={<PackageOpen />}
              action={<Button variant="outline">Clear Filters</Button>}
            />
          </TabsContent>
          <TabsContent value="error" className="pt-4">
            <ErrorState onRetry={() => {}} />
          </TabsContent>
          <TabsContent value="table" className="pt-4">
            <DataTable columns={sampleColumns} data={sampleTableData} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
