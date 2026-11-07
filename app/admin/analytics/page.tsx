'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl">Analytics</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Placeholder page for analytics.
      </CardContent>
    </Card>
  )
}

