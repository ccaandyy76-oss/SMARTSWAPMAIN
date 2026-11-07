'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminTransactionsPage() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl">Transactions</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Placeholder page for transaction management.
      </CardContent>
    </Card>
  )
}

