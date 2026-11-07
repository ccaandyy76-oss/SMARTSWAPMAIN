'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminMerchantsPage() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl">Merchant Approval</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Placeholder page for merchant approvals.
      </CardContent>
    </Card>
  )
}

