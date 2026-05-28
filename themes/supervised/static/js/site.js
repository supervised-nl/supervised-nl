(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Scroll-state classes via IntersectionObserver (was scroll-listener)
  var top = document.getElementById('top');
  if (top) {
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        document.body.parentElement.classList.toggle('scrollstart', e.intersectionRatio < 1);
        document.body.classList.toggle('scrolled', !e.isIntersecting);
      });
    }, { threshold: [0.99, 1] }).observe(top);
  }

  // End-of-page sentinel
  var footer = document.querySelector('footer');
  if (footer) {
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        document.body.classList.toggle('scrolledend', e.isIntersecting);
      });
    }, { rootMargin: '0px 0px -1px 0px' }).observe(footer);
  }

  // 2. Lenis smooth-scroll — desktop + reduced-motion-respecting
  if (window.innerWidth > 1000 && !reduced) {
    var lenisScript = document.createElement('script');
    lenisScript.src = '/js/lenis.min.js';
    document.body.append(lenisScript);
  }

  // 3+4. Pointer-driven: ambient glow + magnetic arrow CTAs
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var glow = document.getElementById('glow');
    var magnetics = [];
    Array.prototype.forEach.call(document.querySelectorAll('a'), function(el){
      if (/→\s*$/.test(el.textContent)) {
        magnetics.push(el);
        el.style.display = 'inline-block';
        el.style.transition = 'transform 250ms cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.willChange = 'transform';
      }
    });

    var tx = 0, ty = 0, cx = 0, cy = 0, lastX = -1e6, lastY = -1e6, raf = null;

    function scheduleTick(){
      if (!raf) raf = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', function(e){
      lastX = e.clientX;
      lastY = e.clientY;
      tx = (e.clientX / window.innerWidth - 0.5) * 6;   // ±3vw
      ty = (e.clientY / window.innerHeight - 0.5) * 6;  // ±3vh
      scheduleTick();
    }, { passive: true });

    // Schedule a frame on scroll too — links move into magnetic range while
    // cursor sits still. Without this, magnetic only triggers when the cursor
    // moves, which is why it felt "sometimes works".
    window.addEventListener('scroll', scheduleTick, { passive: true });

    function tick(){
      raf = null;

      // Glow easing (lerp factor 0.08)
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (glow) {
        glow.style.setProperty('--glow-x', cx.toFixed(2) + 'vw');
        glow.style.setProperty('--glow-y', cy.toFixed(2) + 'vh');
      }

      // Magnetic CTAs (pull within 80px, max 6px)
      var anyMagnetic = false;
      if (lastX >= 0 && magnetics.length) {
        var vh = window.innerHeight;
        magnetics.forEach(function(link){
          var rect = link.getBoundingClientRect();
          // Skip offscreen links — no chance of being in range
          if (rect.bottom < -80 || rect.top > vh + 80) {
            if (link.style.transform) link.style.transform = '';
            return;
          }
          var lcx = rect.left + rect.width / 2;
          var lcy = rect.top + rect.height / 2;
          var dx = lastX - lcx;
          var dy = lastY - lcy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          // Guard divide-by-zero when cursor sits at link center
          if (dist < 80 && dist > 0.5) {
            var pull = (1 - dist / 80) * 6;
            link.style.transform = 'translate(' + ((dx / dist) * pull).toFixed(1) + 'px, ' + ((dy / dist) * pull).toFixed(1) + 'px)';
            anyMagnetic = true;
          } else if (link.style.transform) {
            link.style.transform = '';
          }
        });
      }

      var glowSettled = Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01;
      if (!glowSettled || anyMagnetic) {
        raf = requestAnimationFrame(tick);
      }
    }
  }
})();
