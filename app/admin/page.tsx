'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          This is the admin landing page. Use the sidebar to navigate to merchant/user management.
        </CardContent>
      </Card>
    </div>
  )
}

