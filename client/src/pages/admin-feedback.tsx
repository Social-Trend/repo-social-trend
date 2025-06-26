import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Star, MessageSquare, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import type { Feedback } from "@shared/schema";

export default function AdminFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const { data: feedback = [], isLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  const filteredFeedback = useMemo(() => {
    return (feedback as Feedback[]).filter((item: Feedback) => {
      const matchesSearch = searchTerm === "" || 
        item.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userAgent?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      const matchesRating = ratingFilter === "all" || item.rating?.toString() === ratingFilter;

      return matchesSearch && matchesCategory && matchesRating;
    });
  }, [feedback, searchTerm, categoryFilter, ratingFilter]);

  const exportToCSV = () => {
    const headers = [
      "ID", "Rating", "Recommendation", "Experience", "Category", 
      "Message", "User Intent", "User Agent", "Current Page", 
      "Session Duration", "Created At"
    ];
    
    const csvData = filteredFeedback.map((item: Feedback) => [
      item.id,
      item.rating || "",
      item.recommendationRating || "",
      item.experienceRating || "",
      item.category || "",
      `"${item.message?.replace(/"/g, '""') || ""}"`,
      `"${item.userIntent?.replace(/"/g, '""') || ""}"`,
      `"${item.userAgent?.replace(/"/g, '""') || ""}"`,
      item.currentPage || "",
      item.sessionDuration || "",
      item.createdAt ? format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss") : ""
    ]);

    const csvContent = [headers.join(","), ...csvData.map(row => row.join(","))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const feedbackList = feedback as Feedback[];
    const total = feedbackList.length;
    const avgRating = total > 0 ? (feedbackList.reduce((sum: number, item: Feedback) => sum + (item.rating || 0), 0) / total).toFixed(1) : "0";
    const avgRecommendation = feedbackList.filter((item: Feedback) => item.recommendationRating).length > 0 
      ? (feedbackList
          .filter((item: Feedback) => item.recommendationRating)
          .reduce((sum: number, item: Feedback) => sum + (item.recommendationRating || 0), 0) / 
         feedbackList.filter((item: Feedback) => item.recommendationRating).length).toFixed(1)
      : "0";
    const categories = Array.from(new Set(feedbackList.map((item: Feedback) => item.category).filter(Boolean)));
    
    return { total, avgRating, avgRecommendation, categories: categories.length };
  }, [feedback]);

  const renderStars = (rating: number | null) => {
    const ratingValue = rating || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Recommendation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRecommendation}/5</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="exit_intent">Exit Intent</SelectItem>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Entries ({filteredFeedback.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback entries found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Category</th>
                    <th className="text-left p-2">Overall</th>
                    <th className="text-left p-2">Recommend</th>
                    <th className="text-left p-2">Experience</th>
                    <th className="text-left p-2">Message</th>
                    <th className="text-left p-2">User Intent</th>
                    <th className="text-left p-2">Page</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map((item: Feedback) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="text-sm">
                          {item.createdAt ? format(item.createdAt, "MMM dd, yyyy") : "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.createdAt ? format(item.createdAt, "HH:mm") : "-"}
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="p-2">
                        {renderStars(item.rating)}
                      </td>
                      <td className="p-2">
                        {item.recommendationRating ? renderStars(item.recommendationRating) : "-"}
                      </td>
                      <td className="p-2">
                        {item.experienceRating ? renderStars(item.experienceRating) : "-"}
                      </td>
                      <td className="p-2 max-w-xs">
                        <div className="truncate" title={item.message || ""}>
                          {item.message || "-"}
                        </div>
                      </td>
                      <td className="p-2 max-w-xs">
                        <div className="truncate" title={item.userIntent || ""}>
                          {item.userIntent || "-"}
                        </div>
                      </td>
                      <td className="p-2">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {item.currentPage || "/"}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}