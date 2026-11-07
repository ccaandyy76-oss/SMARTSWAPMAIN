'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminUsersPage() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl">User Management</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Placeholder page for managing users.
      </CardContent>
    </Card>
  )
}

