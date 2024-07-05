
/**
 * Copyright (C) 2012 by Justin Windle
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
// Global initialisation flag
var initialized = false;

// For detecting browser prefix and capabilities
var el = document.createElement('div');
var re = /^(Moz|(w|W)ebkit|O|ms)(?=[A-Z])/;

// Establish vendor prefix and CSS 3D support
var vendor = (function() {
  for (var p in el.style) if (re.test(p)) return p.match(re)[0];
})() || '';
var canRun = vendor + 'Perspective' in el.style;
var prefix = '-' + vendor.toLowerCase() + '-';

var thisElement, rootElement, baseElement, kids, node, item, over, back;
var wait, anim, last, time;

// Public API
var api = {

  // Toggle open / closed
  toggle: function() {
    thisElement = this;
    api[thisElement.classList.contains('open') ? 'close' : 'open'].call(thisElement);
  },

  // Trigger the unfold animation
  open: function(speed, overlap, easing) {

    // Cache DOM references
    thisElement = this;
    rootElement = thisElement.querySelector('.root');
    kids = Array.from(thisElement.querySelectorAll('.node')).filter(function(node) {
      return !node.classList.contains('root');
    });

    // Establish values or fallbacks
    speed = speed || thisElement.dataset.speed || 0.8;
    easing = easing || thisElement.dataset.easing || 'ease-in-out';
    overlap = overlap || thisElement.dataset.overlap || 0.6;

    kids.forEach(function(el, index) {
      // Establish settings for this iteration
      anim = 'unfold' + (!index ? '-first' : '');
      last = index === kids.length - 1;
      time = speed * (1 - overlap);
      wait = index * time;

      // Cache DOM references
      item = el;
      over = item.querySelector('.over');

      // Element animation
      item.style.transform = 'rotateX(180deg)';
      item.style.animation = anim + ' ' + speed + 's ' + easing + ' ' + wait + 's 1 normal forwards';

      // Shading animation happens when the next item starts
      if (!last) wait = (index + 1) * time;

      // Shading animation
      over.style.animation = 'unfold-over ' + (speed * 0.45) + 's ' + easing + ' ' + wait + 's 1 normal forwards';
    });

    // Add momentum to the container
    rootElement.style.animation = 'swing-out ' + (kids.length * time * 1.4) + 's ease-in-out 0s 1 normal forwards';

    thisElement.classList.add('open');
  },

  // Trigger the fold animation
  close: function(speed, overlap, easing) {

    // Cache DOM references
    thisElement = this;
    rootElement = thisElement.querySelector('.root');
    kids = Array.from(thisElement.querySelectorAll('.node')).filter(function(node) {
      return !node.classList.contains('root');
    });

    // Establish values or fallbacks
    speed = speed || thisElement.dataset.speed || 0.8;
    easing = easing || thisElement.dataset.easing || 'ease-in-out';
    overlap = overlap || thisElement.dataset.overlap || 0.6;

    kids.forEach(function(el, index) {
      // Establish settings for this iteration
      anim = 'fold' + (!index ? '-first' : '');
      last = index === 0;
      time = speed * (1 - overlap);
      wait = (kids.length - index - 1) * time;

      // Cache DOM references
      item = el;
      over = item.querySelector('.over');

      // Element animation
      item.style.transform = 'rotateX(0deg)';
      item.style.animation = anim + ' ' + speed + 's ' + easing + ' ' + wait + 's 1 normal forwards';

      // Adjust delay for shading
      if (!last) wait = ((kids.length - index - 2) * time) + (speed * 0.35);

      // Shading animation
      over.style.animation = 'fold-over ' + (speed * 0.45) + 's ' + easing + ' ' + wait + 's 1 normal forwards';
    });

    // Add momentum to the container
    rootElement.style.animation = 'swing-in ' + (kids.length * time * 1.0) + 's ease-in-out 0s 1 normal forwards';

    thisElement.classList.remove('open');
  }
};

// Utils
var utils = {

  // Resolves argument values to defaults
  resolve: function(el, key, val) {
    return typeof val === 'undefined' ? el.dataset[key] : val;
  },

  // Prefixes a hash of styles with the current vendor
  prefix: function(style) {
    var prefixedStyle = {};
    for (var key in style) {
      prefixedStyle[prefix + key] = style[key];
    }
    return prefixedStyle;
  },

  // Inserts rules into the document styles
  inject: function(rule) {
    try {
      var style = document.createElement('style');
      style.innerHTML = rule;
      document.head.appendChild(style);
    } catch (error) {}
  }
};

// Element templates
var markup = {
  node: '<span class="node"></span>',
  back: '<span class="face back"></span>',
  over: '<span class="face over"></span>'
};

// Plugin definition
var makisu = function(elements, options) {
  // Notify if 3D isn't available
  if (!canRun) {
    console.warn('Failed to detect CSS 3D support');
    elements.forEach(function(element) {
      element.dispatchEvent(new Event('error'));
    });
    return;
  }

  // Fires only once
  if (!initialized) {
    initialized = true;

    // Unfold
    utils.inject('@' + prefix + 'keyframes unfold        {' +
      '0%   {' + prefix + 'transform: rotateX(180deg);  }' +
      '50%  {' + prefix + 'transform: rotateX(-30deg);  }' +
      '100% {' + prefix + 'transform: rotateX(0deg);    }' +
      '}');

    // Unfold (first item)
    utils.inject('@' + prefix + 'keyframes unfold-first  {' +
      '0%   {' + prefix + 'transform: rotateX(-90deg);  }' +
      '50%  {' + prefix + 'transform: rotateX(60deg);   }' +
      '100% {' + prefix + 'transform: rotateX(0deg);    }' +
      '}');

    // Fold
    utils.inject('@' + prefix + 'keyframes fold          {' +
      '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
      '100% {' + prefix + 'transform: rotateX(180deg);  }' +
      '}');

    // Fold (first item)
    utils.inject('@' + prefix + 'keyframes fold-first    {' +
      '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
      '100% {' + prefix + 'transform: rotateX(-180deg); }' +
      '}');

    // Swing out
    utils.inject('@' + prefix + 'keyframes swing-out     {' +
      '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
      '30%  {' + prefix + 'transform: rotateX(-30deg);  }' +
      '60%  {' + prefix + 'transform: rotateX(15deg);   }' +
      '100% {' + prefix + 'transform: rotateX(0deg);    }' +
      '}');

    // Swing in
    utils.inject('@' + prefix + 'keyframes swing-in      {' +
      '0%   {' + prefix + 'transform: rotateX(0deg);    }' +
      '50%  {' + prefix + 'transform: rotateX(-10deg);  }' +
      '90%  {' + prefix + 'transform: rotateX(15deg);   }' +
      '100% {' + prefix + 'transform: rotateX(0deg);    }' +
      '}');

    // Shading (unfold)
    utils.inject('@' + prefix + 'keyframes unfold-over   {' +
      '0%   { opacity: 1.0; }' +
      '100% { opacity: 0.0; }' +
      '}');

    // Shading (fold)
    utils.inject('@' + prefix + 'keyframes fold-over     {' +
      '0%   { opacity: 0.0; }' +
      '100% { opacity: 1.0; }' +
      '}');

    // Node styles
    utils.inject('.node {' +
      'position: relative;' +
      'display: block;' +
      '}');

    // Face styles
    utils.inject('.face {' +
      'pointer-events: none;' +
      'position: absolute;' +
      'display: block;' +
'height: 100%;' +
'width: 100%;' +
'left: 0;' +
'top: 0;' +
'}');
}

// Merge options & defaults
var opts = Object.assign({}, makisu.defaults, options);

// Extract api method arguments
var args = Array.prototype.slice.call(arguments, 1);

// Main plugin loop
elements.forEach(function(element) {
// If the user is calling a method…
if (api[options]) {
return api[options].apply(element, args);
}// Store options in view
element.dataset = opts;

// Only proceed if the scene hierarchy isn't already built
if (!element.dataset.initialized) {
  element.dataset.initialized = true;

  // Select the first level of matching child elements
  kids = Array.from(element.children).filter(function(child) {
    return child.matches(opts.selector);
  });

  // Build a scene graph for elements
  rootElement = document.createElement('span');
  rootElement.className = 'node root';
  baseElement = rootElement;

  // Process each element and insert into hierarchy
  kids.forEach(function(el, index) {
    item = el;

    // Which animation should this node use?
    anim = 'fold' + (!index ? '-first' : '');

    // Since we're adding absolutely positioned children
    item.style.position = 'relative';

    // Give the item some depth to avoid clipping artefacts
    Object.assign(item.style, utils.prefix({
      'transform-style': 'preserve-3d',
      'transform': 'translateZ(-0.1px)'
    }));

    // Create back face
    back = document.createElement('span');
    back.className = 'face back';
    back.style.background = item.style.background;
    Object.assign(back.style, utils.prefix({ 'transform': 'translateZ(-0.1px)' }));

    // Create shading
    over = document.createElement('span');
    over.className = 'face over';
    Object.assign(over.style, utils.prefix({ 'transform': 'translateZ(0.1px)' }));
    over.style.background = opts.shading;
    over.style.opacity = 0.0;

    // Begin folded
    node = document.createElement('span');
    node.className = 'node';
    node.appendChild(item);
    Object.assign(node.style, utils.prefix({
      'transform-origin': '50% 0%',
      'transform-style': 'preserve-3d',
      'animation': anim + ' 1ms linear 0s 1 normal forwards'
    }));

    // Build display list
    item.appendChild(over);
    item.appendChild(back);
    baseElement.appendChild(node);

    // Use as parent in next iteration
    baseElement = node;
  });

  // Set root transform settings
  Object.assign(rootElement.style, utils.prefix({
    'transform-origin': '50% 0%',
    'transform-style': 'preserve-3d'
  }));

  // Apply perspective
  Object.assign(element.style, utils.prefix({
    'transform': 'perspective(' + opts.perspective + 'px)'
  }));

  // Display the scene
  element.appendChild(rootElement);
}});
};

// Default options
makisu.defaults = {
// Perspective to apply to rotating elements
perspective: 1200,

// Default shading to apply (null => no shading)
shading: 'rgba(0,0,0,0.12)',

// Area of rotation (fraction or pixel value)
selector: null,

// Fraction of speed (0-1)
overlap: 0.6,

// Duration per element
speed: 0.8,

// Animation curve
easing: 'ease-in-out'
};

makisu.enabled = canRun;

// Initialising the plugin with example elements
if (makisu.enabled) {
var sashimi = document.querySelectorAll('.sashimi');
var nigiri = document.querySelectorAll('.nigiri');
var maki = document.querySelectorAll('.maki');

// Create Makisus
makisu(nigiri, {
selector: 'dd',
overlap: 0.85,
speed: 1.7
});

makisu(maki, {
selector: 'dd',
overlap: 0.6,
speed: 0.85
});

makisu(sashimi, {
selector: 'dd',
overlap: 0.2,
speed: 0.5
});

// Open all
Array.from(document.querySelectorAll('.list')).forEach(function(list) {
api.open.call(list);
});

// Toggle on click
Array.from(document.querySelectorAll('.toggle')).forEach(function(toggle) {
toggle.addEventListener('click', function() {
Array.from(document.querySelectorAll('.list')).forEach(function(list) {
api.toggle.call(list);
});
});
});

// Disable all links
Array.from(document.querySelectorAll('.demo a')).forEach(function(link) {
link.addEventListener('click', function(event) {
event.preventDefault();
});
});
} else {
Array.from(document.querySelectorAll('.warning')).forEach(function(warning) {
warning.style.display = 'block';
});
}