'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { updateBeat, UpdateBeatRequest } from '@/lib/api/beats';
import { useToast } from '@/hooks/use-toast';
import { Beat } from '@/lib/types';

interface BeatEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  beat: Beat;
}

const GENRES = [
  'Trap', 'LoFi', 'Hip-Hop', 'R&B', 'Pop', 'EDM', 'Drill', 'Afrobeats',
  'Amapiano', 'Reggaeton', 'Dancehall', 'UK Drill', 'Jersey Club',
  'Pluggnb', 'Rage', 'Hyperpop', 'Ambient', 'Cinematic', 'Gospel'
];

const STYLES = [
  'Dark', 'Melodic', 'Aggressive', 'Chill', 'Bouncy', 'Atmospheric',
  'Experimental', 'Commercial', 'Underground', 'Minimal'
];

const MOODS = [
  'Happy', 'Sad', 'Energetic', 'Chill', 'Angry', 'Romantic', 'Mysterious',
  'Uplifting', 'Dark', 'Peaceful', 'Intense'
];

const USE_CASES = [
  'Advertising', 'Film/TV', 'Gaming', 'Podcast', 'Social Media',
  'YouTube', 'TikTok', 'Instagram', 'Freestyle', 'Studio Recording'
];

const MUSICAL_KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor', 'D Major', 'D Minor',
  'D# Major', 'D# Minor', 'E Major', 'E Minor', 'F Major', 'F Minor',
  'F# Major', 'F# Minor', 'G Major', 'G Minor', 'G# Major', 'G# Minor',
  'A Major', 'A Minor', 'A# Major', 'A# Minor', 'B Major', 'B Minor'
];

export function BeatEditModal({ isOpen, onClose, beat }: BeatEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');

  // Form state
  const [formData, setFormData] = useState<UpdateBeatRequest>({
    name: beat.name,
    genre: beat.genre,
    style: beat.style,
    mood: beat.mood,
    useCase: beat.useCase,
    tags: beat.tags || [],
    bpm: beat.bpm,
    musicalKey: beat.musicalKey,
    description: beat.description,
    beatstarsDescription: beat.beatstarsDescription,
    pricing: beat.pricing?.map(tier => ({
      name: tier.name || tier.tier,
      price: tier.price,
      features: tier.features || []
    })) || [],
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when beat changes
  useEffect(() => {
    if (beat) {
      setFormData({
        name: beat.name,
        genre: beat.genre,
        style: beat.style,
        mood: beat.mood,
        useCase: beat.useCase,
        tags: beat.tags || [],
        bpm: beat.bpm,
        musicalKey: beat.musicalKey,
        description: beat.description,
        beatstarsDescription: beat.beatstarsDescription,
        pricing: beat.pricing?.map(tier => ({
          name: tier.name || tier.tier,
          price: tier.price,
          features: tier.features || []
        })) || [],
      });
    }
  }, [beat]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateBeatRequest) => updateBeat(beat.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat', beat.id] });
      queryClient.invalidateQueries({ queryKey: ['beats'] });
      toast({
        title: 'Beat updated',
        description: 'Beat metadata has been updated successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error.response?.data?.message || error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    }

    if (formData.tags && (formData.tags.length < 10 || formData.tags.length > 15)) {
      newErrors.tags = 'BeatStars requires 10-15 tags';
    }

    if (formData.description && formData.description.length < 200) {
      newErrors.description = 'Description should be at least 200 characters';
    }

    if (formData.bpm && (formData.bpm < 60 || formData.bpm > 200)) {
      newErrors.bpm = 'BPM should be between 60 and 200';
    }

    // Check pricing tiers are ascending
    if (formData.pricing && formData.pricing.length > 1) {
      for (let i = 1; i < formData.pricing.length; i++) {
        if (formData.pricing[i].price <= formData.pricing[i - 1].price) {
          newErrors.pricing = 'Pricing tiers must be in ascending order';
          break;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateMutation.mutate(formData);
  };

  const handleAddTag = () => {
    if (newTag.trim() && formData.tags && formData.tags.length < 15) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Beat</DialogTitle>
          <DialogDescription>
            Update beat metadata and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="beatstars">BeatStars</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="genre">Genre</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) =>
                    setFormData({ ...formData, genre: value })
                  }
                >
                  <SelectTrigger id="genre">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((genre) => (
                      <SelectItem key={genre} value={genre}>
                        {genre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="style">Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) =>
                    setFormData({ ...formData, style: value })
                  }
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STYLES.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mood">Mood</Label>
                <Select
                  value={formData.mood}
                  onValueChange={(value) =>
                    setFormData({ ...formData, mood: value })
                  }
                >
                  <SelectTrigger id="mood">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((mood) => (
                      <SelectItem key={mood} value={mood}>
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="useCase">Use Case</Label>
                <Select
                  value={formData.useCase}
                  onValueChange={(value) =>
                    setFormData({ ...formData, useCase: value })
                  }
                >
                  <SelectTrigger id="useCase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASES.map((useCase) => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bpm">BPM</Label>
                <Input
                  id="bpm"
                  type="number"
                  min="60"
                  max="200"
                  value={formData.bpm || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, bpm: parseInt(e.target.value) || undefined })
                  }
                  className={errors.bpm ? 'border-destructive' : ''}
                />
                {errors.bpm && (
                  <p className="text-sm text-destructive mt-1">{errors.bpm}</p>
                )}
              </div>

              <div>
                <Label htmlFor="musicalKey">Musical Key</Label>
                <Select
                  value={formData.musicalKey}
                  onValueChange={(value) =>
                    setFormData({ ...formData, musicalKey: value })
                  }
                >
                  <SelectTrigger id="musicalKey">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSICAL_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>
                Tags ({formData.tags?.length || 0}/15)
                {errors.tags && (
                  <span className="text-destructive ml-2 text-sm">
                    {errors.tags}
                  </span>
                )}
              </Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add tag..."
                  disabled={(formData.tags?.length || 0) >= 15}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={(formData.tags?.length || 0) >= 15}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags?.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">
                Description ({formData.description?.length || 0} chars)
                {errors.description && (
                  <span className="text-destructive ml-2 text-sm">
                    {errors.description}
                  </span>
                )}
              </Label>
              <Textarea
                id="description"
                rows={5}
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={errors.description ? 'border-destructive' : ''}
              />
            </div>
          </TabsContent>

          {/* Tab 2: BeatStars Metadata */}
          <TabsContent value="beatstars" className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Auto-Generated Title</h4>
              <p className="text-sm">{beat.beatstarsTitle || 'Not generated yet'}</p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Auto-Generated Tags</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {beat.beatstarsTags?.map((tag, idx) => (
                  <Badge key={idx} variant="outline">
                    {tag}
                  </Badge>
                )) || <p className="text-sm text-muted-foreground">No tags generated</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="beatstarsDescription">
                BeatStars Description ({formData.beatstarsDescription?.length || 0} chars)
              </Label>
              <Textarea
                id="beatstarsDescription"
                rows={8}
                value={formData.beatstarsDescription || ''}
                onChange={(e) =>
                  setFormData({ ...formData, beatstarsDescription: e.target.value })
                }
                placeholder="Description for BeatStars upload..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 800+ characters
              </p>
            </div>
          </TabsContent>

          {/* Tab 3: Pricing */}
          <TabsContent value="pricing" className="space-y-4">
            {errors.pricing && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                {errors.pricing}
              </div>
            )}
            <div className="grid gap-4">
              {formData.pricing?.map((tier, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label>Tier Name</Label>
                      <Input
                        value={tier.name}
                        onChange={(e) => {
                          const newPricing = [...(formData.pricing || [])];
                          newPricing[idx].name = e.target.value;
                          setFormData({ ...formData, pricing: newPricing });
                        }}
                      />
                    </div>
                    <div>
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={(e) => {
                          const newPricing = [...(formData.pricing || [])];
                          newPricing[idx].price = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, pricing: newPricing });
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Label>Features</Label>
                    <div className="space-y-2 mt-2">
                      {tier.features.map((feature, fIdx) => (
                        <div key={fIdx} className="text-sm text-muted-foreground">
                          • {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Tab 4: Files */}
          <TabsContent value="files" className="space-y-4">
            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">MP3 Audio</p>
                    <p className="text-sm text-muted-foreground">{beat.audioPath || 'N/A'}</p>
                  </div>
                  <Badge variant={beat.audioPath ? 'default' : 'secondary'}>
                    {beat.audioPath ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">WAV Audio</p>
                    <p className="text-sm text-muted-foreground">{beat.wavPath || 'Not converted'}</p>
                  </div>
                  <Badge
                    variant={
                      beat.wavConversionStatus === 'completed'
                        ? 'default'
                        : beat.wavConversionStatus === 'processing'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {beat.wavConversionStatus || 'Not Converted'}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Cover Art</p>
                    <p className="text-sm text-muted-foreground">{beat.coverArtPath || 'N/A'}</p>
                  </div>
                  <Badge variant={beat.coverArtPath ? 'default' : 'secondary'}>
                    {beat.coverArtPath ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Preview (30s)</p>
                    <p className="text-sm text-muted-foreground">{beat.previewPath || 'N/A'}</p>
                  </div>
                  <Badge variant={beat.previewPath ? 'default' : 'secondary'}>
                    {beat.previewPath ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
