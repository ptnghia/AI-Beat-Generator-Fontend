# Frontend Implementation Guide

> Chi tiết triển khai từng tính năng frontend cho Admin Beat Management & BeatStars Integration

**Ngày tạo**: December 14, 2025  
**Frontend Path**: `/home/lifetechadmin/opt/AI-Beat-Generator-backend/frontend`

---

## 📋 Tổng Quan

Backend đã sẵn sàng với **13 endpoints mới**. Frontend cần triển khai UI tương ứng.

### Endpoints Backend Đã Sẵn Sàng

✅ Admin Beat Management (2)
✅ Admin API Key Management (4)  
✅ Admin System (2)
✅ BeatStars Integration (3)

**Tài liệu đầy đủ**: `docs/ADMIN_API.md`

---

## 🎯 Priority 1: Core Admin Features

### Step 1: Admin Beat Generation UI

**Trang**: `/admin/beats/generate`  
**File**: `app/admin/(dashboard)/beats/generate/page.tsx`

#### Chức năng

1. **Template Selector** - Chọn beat category từ `beat_catalog.xml`
2. **Generation Mode** - Full / Metadata Only
3. **Batch Generation** - Slider 1-10 beats
4. **Generation Queue** - Real-time status tracking

#### API Integration

```typescript
// Single beat generation
POST /api/generate/beat
Body: {
  templateId?: string,  // Optional, random if not provided
  mode: 'full' | 'metadata_only'
}

// Batch generation  
POST /api/generate/beats
Body: {
  templateId?: string,
  count: number,  // 1-10
  mode: 'full' | 'metadata_only'
}

// Get templates list (cần thêm endpoint backend)
GET /api/templates?isActive=true
```

#### UI Components Cần Tạo

1. **`TemplateSelectorGrid.tsx`**
   - Display 30+ categories
   - Search/filter templates
   - Selected state

2. **`GenerationModeToggle.tsx`**
   - Radio buttons: Full / Metadata Only
   - Description cho mỗi mode

3. **`BatchCountSlider.tsx`**
   - Slider 1-10 beats
   - Show estimated time & quota

4. **`GenerationQueueTable.tsx`**
   - Real-time queue status
   - Status badges: Pending → Processing → Completed
   - Retry failed generations

#### Implementation Steps

```bash
# 1. Tạo page
touch app/admin/(dashboard)/beats/generate/page.tsx

# 2. Tạo components
mkdir -p components/admin/generation
touch components/admin/generation/TemplateSelectorGrid.tsx
touch components/admin/generation/GenerationModeToggle.tsx
touch components/admin/generation/BatchCountSlider.tsx
touch components/admin/generation/GenerationQueueTable.tsx

# 3. Cập nhật types
# Thêm vào lib/types.ts:
```

```typescript
// lib/types.ts additions

export interface BeatTemplate {
  id: string;
  categoryName: string;
  genre: string;
  style: string;
  mood: string;
  useCase: string;
  tags: string[];
  basePrompt: string;
  isActive: boolean;
  lastUsed?: string;
  createdAt: string;
}

export interface GenerationRequest {
  templateId?: string;
  mode: 'full' | 'metadata_only';
  count?: number;
}

export interface GenerationQueueItem {
  beatId: string;
  beatName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mode: 'full' | 'metadata_only';
  createdAt: string;
  error?: string;
}
```

#### Example Implementation

```typescript
// app/admin/(dashboard)/beats/generate/page.tsx
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BeatGenerationPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [mode, setMode] = useState<'full' | 'metadata_only'>('metadata_only');
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      if (count === 1) {
        const response = await api.post('/api/generate/beat', {
          templateId: selectedTemplate || undefined,
          mode
        });
        
        toast.success(`Beat "${response.data.beat.name}" generated!`);
      } else {
        const response = await api.post('/api/generate/beats', {
          templateId: selectedTemplate || undefined,
          count,
          mode
        });
        
        toast.success(`${response.data.generated} beats generated!`);
      }
      
      // Refresh queue
      // ...
      
    } catch (error) {
      toast.error('Generation failed');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Generate Beats</h1>
      
      {/* Template Selector */}
      {/* Mode Toggle */}
      {/* Batch Count Slider */}
      
      <Button 
        onClick={handleGenerate}
        disabled={isGenerating}
        size="lg"
      >
        {isGenerating ? 'Generating...' : `Generate ${count} Beat${count > 1 ? 's' : ''}`}
      </Button>
      
      {/* Generation Queue Table */}
    </div>
  );
}
```

---

### Step 2: BeatStars Export Dashboard

**Trang**: `/admin/beats/beatstars`  
**File**: `app/admin/(dashboard)/beats/beatstars/page.tsx`

#### Chức năng

1. **Readiness Check** - Hiển thị beats sẵn sàng upload
2. **CSV Export** - Download BeatStars-compatible CSV
3. **Upload Checklist** - Chi tiết per beat
4. **Bulk Actions** - Convert WAV, Download files

#### API Integration

```typescript
GET /api/beatstars/ready-check?page=1&limit=20
GET /api/beatstars/export?readyOnly=true
GET /api/beatstars/checklist/:id
POST /api/beats/:id/convert-wav
POST /api/beats/:id/download
```

#### UI Components

1. **`BeatStarsTable.tsx`**
   - Show beats với status indicators
   - Missing items badges
   - Quick actions per beat

2. **`BeatStarsFilters.tsx`**
   - Ready / Not Ready toggle
   - Date range picker
   - Genre filter

3. **`UploadChecklistModal.tsx`**
   - 7-item checklist per beat
   - Progress percentage
   - Missing items list

4. **`BulkActionToolbar.tsx`**
   - Select multiple beats
   - Bulk convert to WAV
   - Bulk download
   - Export selected to CSV

#### Types

```typescript
// lib/types.ts

export interface BeatStarsReadiness {
  id: string;
  name: string;
  isReady: boolean;
  readiness: {
    hasMP3: boolean;
    hasWav: boolean;
    hasCover: boolean;
    hasBPM: boolean;
    hasKey: boolean;
    hasValidTags: boolean;
    hasValidDescription: boolean;
    hasPricing: boolean;
  };
  missingItems: string[];
  metadata: {
    bpm?: number;
    musicalKey?: string;
    tagsCount: number;
    descriptionLength: number;
  };
}

export interface BeatStarsChecklist {
  beatId: string;
  beatName: string;
  readyForUpload: boolean;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  items: ChecklistItem[];
}

export interface ChecklistItem {
  item: string;
  status: 'complete' | 'incomplete';
  details: any;
}
```

---

### Step 3: Pending Beats Management

**Trang**: `/admin/beats/pending`
**File**: `app/admin/(dashboard)/beats/pending/page.tsx`

#### Chức Năng

1. List beats với `generationStatus = 'pending'`
2. Generate audio cho metadata-only beats
3. Bulk generate audio
4. Real-time status updates

#### API Integration

```typescript
GET /api/beats/pending/list?page=1&limit=20
POST /api/beats/:id/generate-audio
```

#### UI Components

1. **`PendingBeatsTable.tsx`**
2. **`GenerateAudioModal.tsx`**
3. **`BulkGenerateDialog.tsx`**

---

## 🎨 Priority 2: Enhanced Features

### Step 4: Beat Edit Modal

**Component**: `components/admin/BeatEditModal.tsx`

#### Chức Năng

Modal với 4 tabs:
1. **Basic Info** - Name, genre, style, mood, tags, BPM, key
2. **BeatStars** - Auto-generated metadata (preview only)
3. **Pricing** - 4 tiers configuration
4. **Files** - MP3, WAV, Cover status

#### API Integration

```typescript
GET /api/beats/:id
PATCH /api/admin/beats/:id
POST /api/beats/:id/convert-wav
```

#### Validation

- Tags: 10-15 items required
- Description: Min 200 characters
- BPM: 60-200 range
- Pricing: Tiers must be ascending

---

### Step 5: API Key Management

**Trang**: `/admin/keys`  
**File**: `app/admin/(dashboard)/keys/page.tsx` (đã có, cần hoàn thiện)

#### API Integration

```typescript
GET /api/admin/keys
POST /api/admin/keys
PATCH /api/admin/keys/:id
DELETE /api/admin/keys/:id
```

---

### Step 6: System Logs Viewer

**Trang**: `/admin/logs`  
**File**: `app/admin/(dashboard)/logs/page.tsx` (đã có, cần hoàn thiện)

#### API Integration

```typescript
GET /api/admin/logs?level=ERROR&service=MusicService&startDate=xxx&limit=100
```

---

## 📦 Required Dependencies

Các package đã có trong `package.json`:
- ✅ `@tanstack/react-query` - Server state management
- ✅ `zustand` - Client state management  
- ✅ `axios` - API client
- ✅ `sonner` - Toast notifications
- ✅ `react-hook-form` - Form handling
- ✅ `zod` - Validation

**Cần thêm (optional)**:
```bash
npm install react-csv date-fns recharts
```

---

## 🔧 Configuration Updates

### 1. Update `lib/config.ts`

```typescript
export const API_ENDPOINTS = {
  // Existing endpoints...
  
  // Beat Generation
  generateBeat: '/api/generate/beat',
  generateBeats: '/api/generate/beats',
  templates: '/api/templates',
  
  // Admin Beat Management
  adminBeats: '/api/admin/beats',
  adminBeatDetail: (id: string) => `/api/admin/beats/${id}`,
  
  // Admin API Keys
  adminKeys: '/api/admin/keys',
  adminKeyDetail: (id: string) => `/api/admin/keys/${id}`,
  
  // Admin Logs
  adminLogs: '/api/admin/logs',
  adminStats: '/api/admin/stats/overview',
  
  // BeatStars
  beatstarsExport: '/api/beatstars/export',
  beatstarsReadyCheck: '/api/beatstars/ready-check',
  beatstarsChecklist: (id: string) => `/api/beatstars/checklist/${id}`,
  
  // Pending Beats
  pendingBeats: '/api/beats/pending/list',
  generateAudio: (id: string) => `/api/beats/${id}/generate-audio`,
  
  // WAV Conversion
  convertWav: (id: string) => `/api/beats/${id}/convert-wav`,
  wavStatus: (id: string) => `/api/beats/${id}/wav-status`,
  
  // File Download
  downloadFiles: (id: string) => `/api/beats/${id}/download`,
};
```

### 2. Update Navigation

Add to `components/admin/AdminSidebar.tsx`:

```typescript
const navItems = [
  // Existing items...
  { name: 'Beats', href: '/admin/beats', icon: Music },
  { name: 'Generate', href: '/admin/beats/generate', icon: Plus }, // NEW
  { name: 'Pending', href: '/admin/beats/pending', icon: Clock }, // NEW
  { name: 'BeatStars Export', href: '/admin/beats/beatstars', icon: Upload }, // NEW
  { name: 'API Keys', href: '/admin/keys', icon: Key },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
];
```

---

## 🧪 Testing Checklist

### Per Feature

- [ ] Component renders without errors
- [ ] API calls work correctly
- [ ] Loading states display
- [ ] Error handling works
- [ ] Success messages show
- [ ] Real-time updates work (where applicable)
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation, ARIA labels)

### Integration Testing

- [ ] Full workflow: Generate → Edit → Convert WAV → Export CSV
- [ ] Pending beats → Generate Audio → View in Beats list
- [ ] BeatStars ready check → Fix missing items → Export
- [ ] API key management → Add → Update → Delete

---

## 📈 Development Timeline

**Week 1**: Steps 1-3 (Generation UI, BeatStars Export, Pending Beats)  
**Week 2**: Steps 4-6 (Edit Modal, WAV Conversion, API Keys/Logs)  
**Week 3**: Polish, Testing, Bug Fixes

---

## 🔗 Resources

- **Backend API Docs**: `/home/lifetechadmin/opt/AI-Beat-Generator-backend.worktrees/worktree-2025-12-14T07-20-36/docs/ADMIN_API.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Frontend Path**: `/home/lifetechadmin/opt/AI-Beat-Generator-backend/frontend`

---

## 📞 Support

Nếu cần hỗ trợ:
1. Xem tài liệu API đầy đủ: `docs/ADMIN_API.md`
2. Check implementation summary: `docs/IMPLEMENTATION_SUMMARY.md`
3. Test endpoints với cURL examples trong docs

---

**Status**: 📝 Ready to Implement  
**Next**: Bắt đầu với Step 1 - Admin Beat Generation UI
