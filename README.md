# CalcWorks : A modern Calculator Web Application

![Calculator Preview](https://img.shields.io/badge/Project-CalcWorks-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

## 📖 Overview
**CalcWorks** is a premium, modern, and mathematically-inspired web calculator built using purely vanilla web technologies. It features a stunning glassmorphism design language set against a dynamic, layered 3D mathematical background. Designed to be robust and elegant, it completely bypasses the unsafe `eval()` function in favor of a safe, custom-built step-by-step arithmetic parsing logic.

## 🚀 Live Demo
Experience the calculator live here:   https://varung-coder.github.io/SCT_WD_2/


## ✨ Key Features
- **Eval-Free Logic**: A completely safe, custom-built calculation engine that accurately handles edge cases like division by zero and multiple decimals.
- **Dynamic 3D Math Background**: A rich background featuring an animated sine/cosine wave `<canvas>`, rotating 3D wireframe geometry, and floating mathematical formulas with parallax depth.
- **Premium Glassmorphism UI**: High-quality frosted glass aesthetics (`backdrop-filter`) with subtle inner glowing borders and deep shadow casting.
- **Full Keyboard Support**: Seamlessly type expressions using your physical keyboard (`Enter` for =, `Escape` for AC, `Backspace` for delete).
- **Visual Micro-interactions**: Material-inspired ripple effects on click, active operator neon glows, and visual depression states synchronized with keyboard inputs.
- **Calculation History Panel**: Slide-out history panel that tracks your last 50 calculations. Clicking any previous history item instantly restores its result to the main display.
- **Copy to Clipboard**: Simply click the display screen to instantly copy your current result, complete with a smooth toast notification.

## 💻 Tech Stack
- **HTML5**: Semantic structure and 3D environment container setup.
- **CSS3**: Advanced Glassmorphism styling, CSS grid/flexbox layouts, CSS 3D transforms (`perspective`, `rotateX/Y/Z`), and complex keyframe animations.
- **Vanilla JavaScript (ES6+)**: DOM manipulation, event listeners, dynamic math symbol injection, canvas rendering, and safe calculation algorithms.

## 📂 Project Structure
```text
SCT_WD_2/
├── index.html       # The main HTML document containing the app structure and 3D background wrappers
├── style.css        # All styling rules, 3D animations, responsive breakpoints, and glassmorphism UI
├── script.js        # Core calculator logic, keyboard event handling, and history state management
└── README.md        # Project documentation
```

## 🛠️ Installation & Usage
To run this project locally, you do not need any package managers or build tools.
1. Clone this repository:
   ```bash
   git clone https://github.com/varung-coder/SCT_WD_2.git
   ```
2. Navigate into the directory:
   ```bash
   cd SCT_WD_2
   ```
3. Open `index.html` in your favorite modern web browser.

---

### 👤 Author
**G VARUN**  
*Web Development Intern at Skill Craft Technology*
