(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Scroll-state classes , show #scrolltotop after half a viewport scroll
  function updateScrollState(){
    var y = window.scrollY;
    document.documentElement.classList.toggle('scrollstart', y > 0);
    document.body.classList.toggle('scrolled', y > window.innerHeight * 0.5);
  }
  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });
  updateScrollState();

  // End-of-page sentinel
  var footer = document.querySelector('footer');
  if (footer) {
    new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        document.body.classList.toggle('scrolledend', e.isIntersecting);
      });
    }, { rootMargin: '0px 0px -1px 0px' }).observe(footer);
  }

  // 2. Lenis smooth-scroll , desktop + reduced-motion-respecting
  if (window.innerWidth > 1000 && !reduced) {
    var lenisScript = document.createElement('script');
    lenisScript.src = '/js/lenis.min.js';
    document.body.append(lenisScript);
  }

  // 3. Pointer-driven ambient glow
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    var glow = document.getElementById('glow');
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;

    window.addEventListener('pointermove', function(e){
      tx = (e.clientX / window.innerWidth - 0.5) * 6;   // ±3vw
      ty = (e.clientY / window.innerHeight - 0.5) * 6;  // ±3vh
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });

    function tick(){
      raf = null;
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      if (glow) {
        glow.style.setProperty('--glow-x', cx.toFixed(2) + 'vw');
        glow.style.setProperty('--glow-y', cy.toFixed(2) + 'vh');
      }
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) {
        raf = requestAnimationFrame(tick);
      }
    }
  }
})();
