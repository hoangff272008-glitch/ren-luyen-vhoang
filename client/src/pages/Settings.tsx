import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Settings as SettingsIcon, Download, FileText, Calendar, Clock, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@shared/routes";
import type { DailyActivity } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

export default function Settings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMonth, setSearchMonth] = useState("");
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("display-name") || "Việt Hoàng");

  const handleNameChange = (newName: string) => {
    setDisplayName(newName);
    localStorage.setItem("display-name", newName);
    window.dispatchEvent(new Event("display-name-updated"));
    toast({ title: "Đã cập nhật tên hiển thị" });
  };

  const { data: activities, isLoading } = useQuery<DailyActivity[]>({
    queryKey: [api.dailyActivities.list.path, "all"],
    queryFn: async () => {
      const res = await fetch(api.dailyActivities.list.path);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    }
  });

  const filteredActivities = useMemo(() => {
    if (!activities) return [];
    return activities.filter(activity => {
      const matchesText = activity.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = !searchMonth || activity.date.startsWith(searchMonth);
      return matchesText && matchesMonth;
    });
  }, [activities, searchTerm, searchMonth]);

  const exportData = () => {
    if (!filteredActivities) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredActivities, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `hoat-dong-hang-ngay-${format(new Date(), "dd-MM-yyyy")}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [filteredActivities]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-300">
              <SettingsIcon size={32} />
            </span>
            Cài đặt & Xuất dữ liệu
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Quản lý và tra cứu toàn bộ lịch sử hoạt động của bạn.</p>
        </div>

        <Button 
          size="lg" 
          onClick={exportData}
          disabled={!activities || filteredActivities.length === 0}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
        >
          <Download className="mr-2 h-5 w-5" /> Xuất dữ liệu lọc (JSON)
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-primary" size={20} />
            Hồ sơ người dùng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên hiển thị</label>
              <div className="flex gap-2">
                <Input 
                  value={displayName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Nhập tên bạn muốn dùng..."
                  className="rounded-xl max-w-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="space-y-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            Bộ lọc & Tra cứu ({filteredActivities.length})
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Tìm theo tên hoạt động..." 
                className="pl-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="month"
                className="pl-10 rounded-xl"
                value={searchMonth}
                onChange={(e) => setSearchMonth(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-white/30 animate-pulse" />)}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Không tìm thấy hoạt động nào phù hợp với bộ lọc.</p>
                {(searchTerm || searchMonth) && (
                  <Button variant="link" onClick={() => { setSearchTerm(""); setSearchMonth(""); }} className="mt-2">
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-white/20 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4">Ngày</th>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Nội dung</th>
                      <th className="px-6 py-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {sortedActivities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-white/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          {format(new Date(activity.date), "dd/MM/yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {activity.time ? (
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {activity.time}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(activity.isDone && "line-through text-muted-foreground")}>
                            {activity.content}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {activity.isDone ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full w-fit">
                              <CheckCircle2 size={12} /> Xong
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full w-fit">
                              Chờ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
