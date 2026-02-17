"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function LibraryPage() {
  const borrowedBooks = [
    {
      id: 1,
      title: "Advanced Calculus",
      author: "James Stewart",
      issueDate: "2024-12-01",
      dueDate: "2024-12-15",
      status: "Active",
    },
    {
      id: 2,
      title: "Linear Algebra Done Right",
      author: "Sheldon Axler",
      issueDate: "2024-11-25",
      dueDate: "2024-12-09",
      status: "Overdue",
    },
    {
      id: 3,
      title: "Discrete Mathematics",
      author: "Kenneth H. Rosen",
      issueDate: "2024-12-05",
      dueDate: "2024-12-19",
      status: "Active",
    },
  ];

  const isOverdue = (book: any) => {
    return new Date(book.dueDate) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Library & Resources</h1>
        <p className="text-muted-foreground">
          Manage your borrowed books and access e-resources
        </p>
      </div>

      {/* Library Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Books Borrowed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{borrowedBooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Overdue Books</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {borrowedBooks.filter(isOverdue).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Library Fine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹0</div>
          </CardContent>
        </Card>
      </div>

      {/* Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {borrowedBooks.map((book) => (
              <div key={book.id} className="flex items-start justify-between pb-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {book.dueDate}
                  </p>
                </div>
                <Badge variant={isOverdue(book) ? "destructive" : "secondary"}>
                  {isOverdue(book) ? "Overdue" : "Active"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* E-Resources */}
      <Card>
        <CardHeader>
          <CardTitle>E-Resources</CardTitle>
          <CardDescription>Access digital learning materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {["Question Papers", "E-Books", "Journals", "Research Papers"].map((resource) => (
              <Button key={resource} variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                {resource}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
