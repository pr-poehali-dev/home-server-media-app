import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: string;
};

type FileItem = {
  id: string;
  name: string;
  size: string;
  date: string;
  year?: string;
  type?: string;
  thumbnail?: string;
};

type ViewMode = 'list' | 'grid';

const categories: Category[] = [
  { id: 'photos', name: 'Фото', icon: 'Image', count: 1245, gradient: 'from-purple-600 to-purple-400' },
  { id: 'videos', name: 'Видео', icon: 'Video', count: 324, gradient: 'from-blue-600 to-blue-400' },
  { id: 'documents', name: 'Документы', icon: 'FileText', count: 892, gradient: 'from-green-600 to-green-400' },
  { id: 'movies', name: 'Фильмы', icon: 'Film', count: 156, gradient: 'from-red-600 to-red-400' },
  { id: 'work', name: 'Работа', icon: 'Briefcase', count: 567, gradient: 'from-orange-600 to-orange-400' },
  { id: 'software', name: 'Софт', icon: 'Package', count: 89, gradient: 'from-pink-600 to-pink-400' },
  { id: 'music', name: 'Музыка', icon: 'Music', count: 2341, gradient: 'from-indigo-600 to-indigo-400' },
  { id: 'archives', name: 'Архивы', icon: 'Archive', count: 234, gradient: 'from-cyan-600 to-cyan-400' },
];

const mockFiles: Record<string, FileItem[]> = {
  photos: [
    { id: '1', name: 'IMG_2024_001.jpg', size: '4.2 MB', date: '15 окт 2024', year: '2024' },
    { id: '2', name: 'IMG_2024_002.jpg', size: '3.8 MB', date: '14 окт 2024', year: '2024' },
    { id: '3', name: 'IMG_2023_156.jpg', size: '5.1 MB', date: '22 дек 2023', year: '2023' },
    { id: '4', name: 'IMG_2023_089.jpg', size: '4.5 MB', date: '10 июн 2023', year: '2023' },
    { id: '5', name: 'IMG_2022_234.jpg', size: '3.9 MB', date: '5 май 2022', year: '2022' },
  ],
  videos: [
    { id: '1', name: 'video_2024_summer.mp4', size: '124 MB', date: '10 авг 2024' },
    { id: '2', name: 'family_trip.mov', size: '89 MB', date: '5 июл 2024' },
  ],
  documents: [
    { id: '1', name: 'Отчет_2024.pdf', size: '2.1 MB', date: '20 окт 2024' },
    { id: '2', name: 'Договор.docx', size: '145 KB', date: '18 окт 2024' },
  ],
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [files, setFiles] = useState<Record<string, FileItem[]>>(mockFiles);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<{id: string, category: string, name: string} | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedYear(null);
    setSearchQuery('');
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setSelectedYear(null);
    setSearchQuery('');
    setViewMode('list');
  };

  const handleFileClick = (index: number) => {
    setCurrentFileIndex(index);
    setLightboxOpen(true);
  };

  const handleNextFile = () => {
    setCurrentFileIndex((prev) => (prev + 1) % filteredFiles.length);
  };

  const handlePrevFile = () => {
    setCurrentFileIndex((prev) => (prev - 1 + filteredFiles.length) % filteredFiles.length);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevFile();
      } else if (e.key === 'ArrowRight') {
        handleNextFile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, currentFileIndex, filteredFiles.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      setUploadingFiles(prev => [...prev, file.name]);
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f !== file.name));
      }, 2000);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      setUploadingFiles(prev => [...prev, file.name]);
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f !== file.name));
      }, 2000);
    });
  };

  const confirmDeleteFile = (fileId: string, categoryId: string, fileName: string) => {
    setFileToDelete({id: fileId, category: categoryId, name: fileName});
    setDeleteDialogOpen(true);
  };

  const handleDeleteFile = () => {
    if (!fileToDelete) return;

    const { id, category } = fileToDelete;
    setFiles(prev => ({
      ...prev,
      [category]: prev[category].filter(f => f.id !== id)
    }));
    
    if (lightboxOpen) {
      const newFilteredFiles = files[category].filter(f => f.id !== id);
      if (newFilteredFiles.length === 0) {
        handleCloseLightbox();
      } else if (currentFileIndex >= newFilteredFiles.length) {
        setCurrentFileIndex(newFilteredFiles.length - 1);
      }
    }
    
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentFiles = selectedCategory ? (files[selectedCategory] || []) : [];
  
  const years = selectedCategory === 'photos' 
    ? Array.from(new Set(currentFiles.map(f => f.year).filter(Boolean)))
    : [];

  const filteredFiles = currentFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = !selectedYear || file.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  if (selectedCategory) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              onClick={handleBack}
              variant="ghost" 
              size="icon"
              className="hover:bg-muted"
            >
              <Icon name="ArrowLeft" size={24} />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentCategory?.gradient} flex items-center justify-center`}>
                <Icon name={currentCategory?.icon || 'Folder'} size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{currentCategory?.name}</h1>
                <p className="text-muted-foreground">{currentCategory?.count} файлов</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Поиск файлов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card border-border"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <Icon name="List" size={20} />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Icon name="Grid3x3" size={20} />
              </Button>
              <label htmlFor="file-upload">
                <Button variant="default" className="cursor-pointer" asChild>
                  <span>
                    <Icon name="Upload" size={20} className="mr-2" />
                    Загрузить
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
          {years.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-6">
              <Button
                variant={selectedYear === null ? "default" : "outline"}
                onClick={() => setSelectedYear(null)}
                className="rounded-full"
              >
                Все
              </Button>
              {years.map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  onClick={() => setSelectedYear(year || null)}
                  className="rounded-full"
                >
                  {year}
                </Button>
              ))}
            </div>
          )}

          <div 
            className={`relative ${isDragging ? 'opacity-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 border-4 border-dashed border-primary rounded-2xl flex items-center justify-center bg-primary/10 z-10">
                <div className="text-center">
                  <Icon name="Upload" size={48} className="mx-auto mb-2 text-primary" />
                  <p className="text-xl font-semibold text-foreground">Перетащите файлы сюда</p>
                </div>
              </div>
            )}
            
            {uploadingFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploadingFiles.map((fileName, idx) => (
                  <Card key={idx} className="border-primary">
                    <CardContent className="flex items-center gap-3 p-3">
                      <Icon name="Loader2" size={20} className="animate-spin text-primary" />
                      <span className="text-sm text-foreground">Загружается: {fileName}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'list' ? (
              <div className="grid gap-3">
                {filteredFiles.map((file, index) => (
                  <Card 
                    key={file.id}
                    className="hover:bg-muted/50 transition-all animate-scale-in border-border"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentCategory?.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon name="File" size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => handleFileClick(index)}>
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 hover:bg-red-500/20 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedCategory) {
                            confirmDeleteFile(file.id, selectedCategory, file.name);
                          }
                        }}
                      >
                        <Icon name="Trash2" size={20} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map((file, index) => (
                  <Card 
                    key={file.id}
                    onClick={() => handleFileClick(index)}
                    className="group hover:scale-105 transition-all cursor-pointer animate-scale-in border-border overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-0 relative group">
                      <div className={`aspect-square bg-gradient-to-br ${currentCategory?.gradient} flex items-center justify-center relative`}>
                        <Icon name={currentCategory?.icon || 'File'} size={48} className="text-white" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-500/80 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedCategory) {
                              confirmDeleteFile(file.id, selectedCategory, file.name);
                            }
                          }}
                        >
                          <Icon name="Trash2" size={18} />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-foreground text-sm truncate mb-1">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {lightboxOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
            onClick={handleCloseLightbox}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedCategory) {
                    confirmDeleteFile(
                      filteredFiles[currentFileIndex].id, 
                      selectedCategory,
                      filteredFiles[currentFileIndex].name
                    );
                  }
                }}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-red-500/50"
              >
                <Icon name="Trash2" size={28} />
              </Button>
              <Button
                onClick={handleCloseLightbox}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Icon name="X" size={32} />
              </Button>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevFile();
              }}
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20 z-10"
            >
              <Icon name="ChevronLeft" size={48} />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleNextFile();
              }}
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20 z-10"
            >
              <Icon name="ChevronRight" size={48} />
            </Button>

            <div className="max-w-7xl max-h-[90vh] flex flex-col items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
              <div className={`w-full aspect-video max-h-[70vh] rounded-2xl bg-gradient-to-br ${currentCategory?.gradient} flex items-center justify-center mb-6 shadow-2xl`}>
                <Icon name={currentCategory?.icon || 'File'} size={120} className="text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">{filteredFiles[currentFileIndex]?.name}</h2>
                <div className="flex gap-4 text-white/80 justify-center">
                  <span>{filteredFiles[currentFileIndex]?.size}</span>
                  <span>•</span>
                  <span>{filteredFiles[currentFileIndex]?.date}</span>
                  <span>•</span>
                  <span>{currentFileIndex + 1} / {filteredFiles.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
              <AlertDialogDescription>
                Вы уверены, что хотите удалить файл <span className="font-semibold text-foreground">{fileToDelete?.name}</span>? 
                Это действие нельзя будет отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteFile}
                className="bg-red-500 hover:bg-red-600"
              >
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Файловый Менеджер</h1>
            <p className="text-muted-foreground">Управление файлами домашнего сервера</p>
          </div>
          <Icon name="HardDrive" size={32} className="text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group cursor-pointer hover:scale-105 transition-all duration-300 border-border animate-scale-in overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon name={category.icon} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{category.name}</h3>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {category.count} файлов
                  </Badge>
                  <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;