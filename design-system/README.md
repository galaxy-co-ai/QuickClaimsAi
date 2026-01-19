# GalaxyCo Design System

A local, auditable UI component library based on [MagicUI](https://magicui.design).

## Origin & License

- **Source**: [magicuidesign/magicui](https://github.com/magicuidesign/magicui)
- **License**: MIT
- **Cloned**: 2026-01-09

## Component Count

- **70 MagicUI Components** - Animated & interactive components
- **27 shadcn/ui Components** - Base UI primitives

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure your app

Add the path alias to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Import and use

```tsx
import { MagicCard, Button, cn } from "@galaxyco/design-system"

export function MyComponent() {
  return (
    <MagicCard className="p-6">
      <Button>Click me</Button>
    </MagicCard>
  )
}
```

## Component Categories

### MagicUI Components

| Category | Components |
|----------|-----------|
| **Device Mockups** | Android, iPhone, Safari |
| **Animated Text** | AuroraText, HyperText, MorphingText, SparklesText, TypingAnimation, WordRotate, etc. |
| **Buttons** | PulsatingButton, RainbowButton, ShimmerButton, ShinyButton, RippleButton |
| **Cards** | MagicCard, NeonGradientCard, BentoGrid, WarpBackground |
| **Borders** | BorderBeam, ShineBorder |
| **Backgrounds** | DotPattern, GridPattern, FlickeringGrid, RetroGrid |
| **Effects** | Confetti, Marquee, Meteors, Particles, Ripple, OrbitingCircles |
| **Data Display** | NumberTicker, FileTree, Terminal, AvatarCircles |
| **3D & Maps** | Globe, DottedMap, IconCloud |
| **Navigation** | Dock |

### shadcn/ui Base Components

Accordion, Alert, Avatar, Badge, Button, Calendar, Card, Collapsible, Command, ContextMenu, Dialog, DropdownMenu, Form, Input, Label, Popover, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Sonner, Switch, Table, Tabs, Tooltip

## Tech Stack

- React 18+
- TypeScript
- Tailwind CSS
- Framer Motion (motion)
- Radix UI Primitives

## File Structure

```
design-system/
├── src/
│   ├── components/
│   │   ├── magicui/     # 70 animated components
│   │   └── ui/          # 27 base components
│   ├── lib/
│   │   └── utils.ts     # cn() utility
│   ├── styles/
│   │   └── globals.css  # CSS variables
│   └── index.ts         # Main exports
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Why Local?

Having your design system locally means:

1. **Full Audit Control** - You can review every line of code
2. **No Supply Chain Risk** - No external dependencies to worry about
3. **Customization** - Modify components to fit your exact needs
4. **Offline Access** - Works without internet
5. **Version Lock** - Components don't change unexpectedly
