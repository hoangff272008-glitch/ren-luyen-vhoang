import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Search, Book, GraduationCap, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useStudyNotes, useCreateStudyNote, useDeleteStudyNote } from "@/hooks/use-study-notes";
import { insertStudyNoteSchema, type InsertStudyNote } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Study() {
  const { data: notes, isLoading } = useStudyNotes();
  const createMutation = useCreateStudyNote();
  const deleteMutation = useDeleteStudyNote();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<InsertStudyNote>({
    resolver: zodResolver(insertStudyNoteSchema),
    defaultValues: {
      subject: "",
      title: "",
      content: "",
      importance: "normal",
    },
  });

  const onSubmit = (data: InsertStudyNote) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      },
    });
  };

  const filteredNotes = notes?.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getImportanceColor = (imp: string | null) => {
    switch (imp) {
      case "high": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300";
      case "low": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300";
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold flex items-center gap-3">
            <span className="p-2 rounded-xl bg-primary/10 text-primary"><GraduationCap size={32} /></span>
            Ghi chú học tập
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Lưu trữ kiến thức gọn gàng & hiệu quả.</p>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Tìm kiếm..." 
              className="pl-9 bg-white/60 dark:bg-zinc-900/60 border-white/40 h-11 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl h-11 px-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                <Plus className="mr-2 h-5 w-5" /> Thêm mới
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border-white/20 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Thêm ghi chú mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Môn học</label>
                    <Input {...form.register("subject")} placeholder="Ví dụ: Toán" className="rounded-xl" />
                    {form.formState.errors.subject && <span className="text-xs text-red-500">{form.formState.errors.subject.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Độ quan trọng</label>
                    <Select onValueChange={(v) => form.setValue("importance", v)} defaultValue="normal">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn mức độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Thấp</SelectItem>
                        <SelectItem value="normal">Bình thường</SelectItem>
                        <SelectItem value="high">Cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tiêu đề</label>
                  <Input {...form.register("title")} placeholder="Chủ đề chính..." className="rounded-xl" />
                  {form.formState.errors.title && <span className="text-xs text-red-500">{form.formState.errors.title.message}</span>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nội dung</label>
                  <Textarea {...form.register("content")} placeholder="Ghi chú chi tiết..." className="min-h-[150px] rounded-xl" />
                  {form.formState.errors.content && <span className="text-xs text-red-500">{form.formState.errors.content.message}</span>}
                </div>

                <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl h-11 text-lg">
                  {createMutation.isPending ? "Đang lưu..." : "Lưu ghi chú"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 rounded-3xl bg-white/30 animate-pulse" />)}
        </div>
      ) : filteredNotes?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground glass-panel rounded-3xl">
          <Book size={64} strokeWidth={1} className="mb-4 opacity-50" />
          <p className="text-xl font-medium">Chưa có ghi chú nào</p>
          <p>Hãy tạo ghi chú đầu tiên của bạn!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredNotes?.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative glass-card p-6 rounded-3xl flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className={cn("px-3 py-1 rounded-full border-2", getImportanceColor(note.importance))}>
                    {note.subject}
                  </Badge>
                  <button
                    onClick={() => deleteMutation.mutate(note.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold mb-3 line-clamp-2" title={note.title}>{note.title}</h3>
                <div className="flex-1">
                   <p className="text-muted-foreground whitespace-pre-wrap line-clamp-5 text-sm leading-relaxed">
                    {note.content}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-dashed border-gray-200 dark:border-white/10 flex justify-between items-center text-xs text-muted-foreground">
                  <span>{note.createdAt && format(new Date(note.createdAt), "dd/MM/yyyy", { locale: vi })}</span>
                  {note.importance === 'high' && <AlertCircle size={14} className="text-red-500" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
