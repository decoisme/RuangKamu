# 🎨 Cara Ganti Logo "R"

Logo "R" muncul di 4 tempat. Berikut cara menggantinya :)

---

## 📍 Lokasi Logo

1. **Navbar** - `src/components/layout/Navbar.tsx` (line 71-73)
2. **Landing Page** - `src/app/page.tsx` (line 136-138)  
3. **Auth Page** - `src/app/auth/page.tsx` (line 195-197)
4. **Dashboard** - `src/app/dashboard/page.tsx` (line 86-88)

---

## 🎨 Option 1: Ganti dengan Logo Image

### Step 1: Siapkan Logo File

1. **Prepare logo image**:
   - Format: PNG atau SVG (recommend SVG untuk scalability)
   - Size: 40x40px atau lebih besar
   - Background: Transparent
   - Nama file: `logo.svg` atau `logo.png`

2. **Put logo di folder**:
   - Place file di: `public/logo.svg` atau `public/logo.png`

### Step 2: Update Code

**Replace di semua 4 files**:

**FROM** (current - text "R"):
\`\`\`tsx
<div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
  <span className="text-white text-xs font-black">R</span>
</div>
\`\`\`

**TO** (dengan image):
\`\`\`tsx
<div className="w-7 h-7 rounded-lg overflow-hidden">
  <img 
    src="/logo.svg" 
    alt="Ruang Kamu" 
    className="w-full h-full object-cover"
  />
</div>
\`\`\`

### Files to Update:

1. **`src/components/layout/Navbar.tsx`** (line 71-73)
2. **`src/app/page.tsx`** (line 136-138)
3. **`src/app/auth/page.tsx`** (line 195-197)
4. **`src/app/dashboard/page.tsx`** (line 86-88)

---

## 🎨 Option 2: Ganti dengan Next.js Image Component (Recommended)

Lebih optimal untuk production.

### Step 1: Import Image Component

Add di top of each file:
\`\`\`tsx
import Image from 'next/image';
\`\`\`

### Step 2: Replace Logo Code

**FROM**:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
  <span className="text-white text-xs font-black">R</span>
</div>
\`\`\`

**TO**:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg overflow-hidden relative">
  <Image 
    src="/logo.svg" 
    alt="Ruang Kamu"
    width={28}
    height={28}
    className="object-cover"
    priority
  />
</div>
\`\`\`

---

## 🎨 Option 3: Ganti Text "R" dengan Text Lain

Paling simple - just ganti text:

**FROM**:
\`\`\`tsx
<span className="text-white text-xs font-black">R</span>
\`\`\`

**TO** (contoh: ganti jadi "RK"):
\`\`\`tsx
<span className="text-white text-xs font-black">RK</span>
\`\`\`

Atau pakai emoji:
\`\`\`tsx
<span className="text-base">🏠</span>
\`\`\`

---

## 🎨 Option 4: Ganti dengan Icon dari Lucide

Pakai icon library yang sudah ada.

### Step 1: Import Icon

\`\`\`tsx
import { Home, Heart, Sparkles } from 'lucide-react';
\`\`\`

### Step 2: Replace Logo

**FROM**:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
  <span className="text-white text-xs font-black">R</span>
</div>
\`\`\`

**TO**:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center">
  <Home className="w-4 h-4 text-white" />
</div>
\`\`\`

**Available Icons**:
- `<Home />` - House icon
- `<Heart />` - Heart icon
- `<Sparkles />` - Sparkles icon
- `<Smile />` - Smile icon
- Check more: https://lucide.dev/icons/

---

## 📱 Update Favicon (Browser Tab Icon)

Logo di browser tab terpisah:

### Step 1: Prepare Favicon

1. Create square image: 32x32px atau 512x512px
2. Format: ICO, PNG, atau SVG
3. Nama: `favicon.ico`

### Step 2: Replace File

**Put file di**:
- `src/app/favicon.ico` (will auto-replace current one)

Or use different formats:
- `src/app/icon.png` (PNG format)
- `src/app/icon.svg` (SVG format)

Next.js will automatically use it.

---

## ✅ Quick Example: Ganti Semua Logo ke Image

Saya buatkan script untuk update semua files sekaligus.

### Asumsi:
- Logo file: `public/logo.svg`
- Using Next.js Image component

### Update ke-4 files:

#### 1. Navbar (`src/components/layout/Navbar.tsx`)

Add import di top:
\`\`\`tsx
import Image from 'next/image';
\`\`\`

Replace line 71-73:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg overflow-hidden relative bg-[#0a0a0a]">
  <Image 
    src="/logo.svg" 
    alt="Ruang Kamu"
    width={28}
    height={28}
    className="object-cover"
  />
</div>
\`\`\`

#### 2. Landing Page (`src/app/page.tsx`)

Add import di top:
\`\`\`tsx
import Image from 'next/image';
\`\`\`

Replace line 136-138:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg overflow-hidden relative bg-[#0a0a0a]">
  <Image 
    src="/logo.svg" 
    alt="Ruang Kamu"
    width={28}
    height={28}
    className="object-cover"
  />
</div>
\`\`\`

#### 3. Auth Page (`src/app/auth/page.tsx`)

Replace line 195-197:
\`\`\`tsx
<div className="w-10 h-10 rounded-xl overflow-hidden relative bg-[#0a0a0a]">
  <Image 
    src="/logo.svg" 
    alt="Ruang Kamu"
    width={40}
    height={40}
    className="object-cover"
  />
</div>
\`\`\`

#### 4. Dashboard (`src/app/dashboard/page.tsx`)

Replace line 86-88:
\`\`\`tsx
<div className="w-7 h-7 rounded-lg overflow-hidden relative bg-[#0a0a0a]">
  <Image 
    src="/logo.svg" 
    alt="Ruang Kamu"
    width={28}
    height={28}
    className="object-cover"
  />
</div>
\`\`\`

---

## 🎯 Recommendation

**Best Approach**:
1. ✅ Use Next.js Image component (Option 2)
2. ✅ SVG format untuk logo (scalable)
3. ✅ Put logo di `public/logo.svg`
4. ✅ Update semua 4 files
5. ✅ Update favicon juga

**Benefits**:
- Optimized loading
- Better performance
- Responsive di semua screen sizes
- Professional look

---

## 📝 Notes

- **Size consistency**: Navbar/landing/dashboard use 28x28px (w-7 h-7)
- **Auth page larger**: Uses 40x40px (w-10 h-10)
- **Background**: Keep bg-[#0a0a0a] jika logo transparent
- **Alt text**: Always add untuk accessibility

---

## 🐛 Troubleshooting

### Logo tidak muncul:
- Check file exists di `public/logo.svg`
- Check path correct: `/logo.svg` (with leading slash)
- Clear browser cache & reload

### Logo terlalu besar/kecil:
- Adjust `width` and `height` props
- Or adjust container size: `w-7 h-7` → `w-8 h-8`, etc.

### Logo terpotong:
- Change `object-cover` → `object-contain`
- Or adjust container padding

---

**Ready to change logo!** {'<3'}

Choose your preferred option dan saya bisa bantu implement!
