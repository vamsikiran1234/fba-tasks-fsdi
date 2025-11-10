"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportButtonProps {
  type: "invoices" | "vendors" | "analytics";
  label?: string;
  filters?: Record<string, string>;
}

export function ExportButton({ type, label, filters = {} }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query string from filters
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/api/export/${type}/csv${queryParams ? `?${queryParams}` : ""}`;

      // Trigger download
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${type}_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-2 border-[#1B1464] text-[#1B1464] hover:bg-[#1B1464] hover:text-white transition-colors"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4" />
          {label || "Export CSV"}
        </>
      )}
    </Button>
  );
}
