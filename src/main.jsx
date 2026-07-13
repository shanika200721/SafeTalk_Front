import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import './styles/student-layout.css';
import './styles/student-pages.css';
import './index.css';

// ============ PRODUCTION-LEVEL DRAG PREVENTION ============

// 1. Prevent all drag events
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true);

document.addEventListener('dragend', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true);

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true);

document.addEventListener('dragenter', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true);

document.addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true);

document.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}, true);

// 2. Prevent touch-based dragging (pinch, swipe gestures for page movement)
let lastX = 0;
let lastY = 0;

document.addEventListener('touchstart', (e) => {
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchmove', (e) => {
  const target = e.target;
  
  // Allow scroll for inputs and scrollable containers
  if (target.closest('input') || target.closest('textarea') || 
      target.closest('[role="textbox"]') || target.closest('.scrollable')) {
    return;
  }
  
  // For normal page areas, still allow vertical scroll but prevent horizontal drag
  const deltaX = Math.abs(e.touches[0].clientX - lastX);
  const deltaY = Math.abs(e.touches[0].clientY - lastY);
  
  // If horizontal movement is detected more than vertical, prevent it
  if (deltaX > deltaY * 1.5) {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('touchend', (e) => {
  lastX = 0;
  lastY = 0;
}, { passive: true });

// 3. Prevent mouse-based dragging (left mouse button drag)
let isMouseDown = false;
let startX = 0;
let startY = 0;

document.addEventListener('mousedown', (e) => {
  const target = e.target;
  if (!target.closest('input') && !target.closest('textarea') && 
      !target.closest('button') && !target.closest('[role="button"]')) {
    isMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
  }
}, true);

document.addEventListener('mousemove', (e) => {
  if (isMouseDown) {
    const deltaX = Math.abs(e.clientX - startX);
    const deltaY = Math.abs(e.clientY - startY);
    
    // If significant movement detected (not just a click), prevent dragging
    if (deltaX > 5 || deltaY > 5) {
      // Block accidental drags
    }
  }
}, true);

document.addEventListener('mouseup', (e) => {
  isMouseDown = false;
  startX = 0;
  startY = 0;
}, true);

// 4. Prevent selection dragging
document.addEventListener('selectstart', (e) => {
  const target = e.target;
  if (!target.closest('input') && !target.closest('textarea') && 
      !target.closest('[contenteditable="true"]')) {
    e.preventDefault();
  }
}, true);

// 5. Prevent right-click on non-input elements
document.addEventListener('contextmenu', (e) => {
  const target = e.target;
  if (!target.closest('input') && !target.closest('textarea')) {
    e.preventDefault();
  }
}, true);

// 6. Prevent zooming via pinch gesture
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// 7. Set body style after page loads
window.addEventListener('load', () => {
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserDrag = 'none';
  document.body.style.touchAction = 'manipulation';
  document.body.style.overflow = 'hidden';
  
  const root = document.getElementById('root');
  if (root) {
    root.style.overflow = 'auto';
    root.style.overflowX = 'hidden';
    root.style.userSelect = 'none';
    root.style.webkitUserDrag = 'none';
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
