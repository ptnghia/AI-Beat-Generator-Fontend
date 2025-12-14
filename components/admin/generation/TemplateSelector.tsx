'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BeatCategory } from '@/lib/api/generation';
import { Music, Search } from 'lucide-react';

interface TemplateSelectorProps {
  templates: BeatCategory[];
  selectedTemplate: BeatCategory | null;
  onSelectTemplate: (template: BeatCategory) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Get unique genres
  const genres = ['all', ...new Set(templates.map(t => t.genre))];

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      searchQuery === '' ||
      template.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.mood.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = selectedGenre === 'all' || template.genre === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {genres.map(genre => (
            <option key={genre} value={genre}>
              {genre === 'all' ? 'All Genres' : genre}
            </option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredTemplates.map((template, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.categoryName === template.categoryName
                ? 'ring-2 ring-primary'
                : ''
            }`}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base leading-tight">
                    {template.categoryName}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {template.style}
                  </CardDescription>
                </div>
                <Music className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {template.genre}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.mood}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {template.useCase}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your search</p>
        </div>
      )}
    </div>
  );
}
