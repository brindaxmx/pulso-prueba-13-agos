import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuditoriaLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-80 bg-white/20" />
            <Skeleton className="h-6 w-60 bg-white/20" />
          </div>
          <div className="flex space-x-3">
            <Skeleton className="h-10 w-32 bg-white/20" />
            <Skeleton className="h-10 w-32 bg-white/20" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <Skeleton className="h-8 w-8 mx-auto mb-2 bg-white/20" />
              <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
              <Skeleton className="h-4 w-20 mx-auto bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-6">
        <div className="flex space-x-1 bg-white/80 backdrop-blur rounded-lg p-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 flex-1" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-60" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
