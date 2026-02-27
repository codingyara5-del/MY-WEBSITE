# QUICK START GUIDE - Hot Ice Crystallization Experiment

## Problem Fixed
The Hot Ice module was not rendering because of how Three.js was being loaded from a CDN when the file is opened locally. This has been resolved.

---

## How to Run (Choose ONE option below)

### **FASTEST OPTION: Use the start-server.bat file**
1. In your `CV2` folder, **double-click** `start-server.bat`
2. A command window opens showing: `Serving HTTP on 0.0.0.0 port 8000`
3. **Open your browser** and go to:
   - **http://localhost:8000/hot_ice.html** ← Hot Ice (crystallization)
   - **http://localhost:8000** ← Acid-base experiment (index.html)

4. Press `Ctrl+C` in the command window when you're done to stop the server

---

### **OPTION 2: Using command line (Windows)**
1. **Open Command Prompt** (Win+R, type `cmd`, press Enter)
2. Navigate to your CV2 folder:
   ```
   cd Desktop\CV2
   ```
3. Start the server:
   ```
   python -m http.server 8000
   ```
4. Open browser to: **http://localhost:8000/hot_ice.html**
5. Press `Ctrl+C` to stop when done

---

### **OPTION 3: VS Code (if you have it open)**
1. Install "Live Server" extension (search in Extensions panel)
2. Right-click **hot_ice.html** → Select **"Open with Live Server"**
3. Browser opens automatically

---

## What's Fixed

✅ **Three.js Library Loading**
- Now loads from CDN with fallback to local copy
- Includes offline versions of all required libraries
- Built-in error detection if loading fails

✅ **Guide Character Initialization**
- No longer crashes if elements missing
- Provides helpful error messages

✅ **Better Error Handling**
- Checks for WebGL support
- Clear messages if rendering fails
- Try/catch blocks around critical code

✅ **User Experience**
- Intro overlay now explains to click to start
- Click overlay automatically starts crystallization
- Added reference visuals so you see something if there's an issue

---

## If You Still See a Black Screen

1. **Check your browser console** (F12 or Right-click → Inspect → Console)
2. Look for error messages and **report them**
3. Try **Option 1 or 2** (use the server, don't open file directly)
4. Make sure you're opening: `hot_ice.html` not `index.html`

---

## File Structure

```
CV2/
├── hot_ice.html              ← The crystallization experiment
├── hot_ice.css               ← Styling for hot ice
├── hot_ice.js                ← 3D rendering & logic
├── three.min.js              ← Three.js library (local copy)
├── EffectComposer.js         ← Postprocessing
├── RenderPass.js             
├── BokehPass.js              
├── ShaderPass.js             
├── CopyShader.js             
├── index.html                ← Acid-base experiment
├── script.js                 ← Logic for acid-base
├── style.css                 ← Styling for acid-base
├── start-server.bat          ← Quick server launcher (RECOMMENDED)
└── README.md                 ← Full documentation
```

---

## Project Status

Both experiments are **fully functional**:

| Experiment | File | Status |
|---|---|---|
| **Hot Ice** (Crystallization) | hot_ice.html | ✅ Fixed & Ready |
| **Acid-Base** (Baking Soda + Vinegar) | index.html | ✅ Fully Working |

---

## What to Expect

### Hot Ice Module
- Cinematic intro title screen
- Click anywhere to dismiss and auto-start
- Watch real-time 3D crystallization grow
- Branches form using procedural diffusion-limited aggregation
- Can toggle scientific analysis overlays
- Heat shimmer and glow effects

### Acid-Base Module
- Interactive 3D-styled chemistry lab
- Add materials in sequence (baking soda → coloring → vinegar)
- Watch bubbles animate and foam form
- Learn chemical equations and reactions
- Audio feedback with synthesized tones

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Black screen | Use start-server.bat or access via http://localhost:8000 |
| "Three.js not loaded" message | Check network connection or ensure files are present |
| Buttons do nothing | Refresh page, check console for errors |
| No sound | Check browser audio permissions, click any element on page |
| Crystals won't grow | Click intro overlay first, then start button |

---

## Need Help?

1. Check **README.md** for full documentation
2. Open **browser console** (F12) to see detailed error messages
3. Ensure **all files** from the CV2 folder are present
4. Try a **different browser** (Chrome, Firefox, Edge all work)

---

**Everything should work now. Enjoy the experiments!** 🔬✨
