# Design System: Dynamic Grainy Spotlight UI

Extracted from Stitch Project ID: `18425016398356646913`

## 1. Color Palette
The project uses a deep dark theme with vibrant purple glassmorphism accents.

- **Dark Background (`custom-dark`)**: `#0f0f11`
- **Glass Cards (`custom-card`)**: `rgba(255, 255, 255, 0.03)`
- **Subtle Borders (`custom-border`)**: `rgba(255, 255, 255, 0.08)`
- **Primary Purple (`custom-purple`)**: `#b065ff`
- **Light Purple / Glow (`custom-purple-light`)**: `#d9a8ff`

### Specialized Glows & Gradients
- **Text Gradient**: A left-to-right linear gradient transitioning from `#b065ff` to `#d9a8ff`.
- **Particle Color**: A semi-transparent purple `rgba(168, 85, 247, 0.25)` (approx. Tailwind's `purple-500`).

## 2. Typography
**Primary Font**: `Inter`
- **Fallback**: System UI, sans-serif
- **Weights Used**: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)

## 3. Glassmorphism CSS Logic
Core component containers leverage light white translucency combined with CSS backdrop filters.

```css
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}
```

## 4. Canvas Particle Tracking Logic
The dynamic background features a responsive particle system that repels elements from the user's cursor.

### Core Configuration
- **Particle Count**: 80
- **Base Size**: Randomized between `0.5px` and `2px`
- **Mouse Radius (Interaction Area)**: `150px`
- **Particle Density (Speed/Weight)**: Randomized `(Math.random() * 30) + 1`

### Interaction Logic (Repulsion Engine)
When the user's cursor comes within `150px` of a particle, the script calculates the distance vector and pushes the particle away proportional to its density. When the cursor leaves, the particles slowly return to their `baseX` and `baseY` origin strings.

```javascript
// Repulsion Mathematics
if (mouse.x != null && mouse.y != null) {
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calculate normalized direction vector
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    
    // Scale force by proximity
    let maxDistance = mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    if (distance < mouse.radius) {
        // Push particle away
        this.x -= directionX;
        this.y -= directionY;
    } else {
        // Elastic return to original position
        if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 10;
        if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 10;
    }
}
```

### Canvas Initialization
The canvas naturally resets and reorganizes when the window scales:
```javascript
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init(); // Re-spawns particles at new random base coordinates
});
```
