/* Carrel landing logic — variant attribution, download counter, reveal, email. */
(function () {
  "use strict";
  var CFG = window.CARREL_CONFIG, S = CFG.shared;
  function isSet(v){ return typeof v === "string" && v && v.indexOf("REPLACE") === -1; }

  /* ---- variant (never silently default to A) ---------------------------- */
  var raw = new URLSearchParams(location.search).get("v");
  var v = (raw === "a" || raw === "b") ? raw : null;
  var analyticsVariant = v || "unknown";
  var V = CFG.variants[v || "a"];

  /* ---- OS detection (separate fact from the button tapped) -------------- */
  function detectOS(){
    var ua = navigator.userAgent || "";
    if (/android/i.test(ua)) return "android";
    if (/iphone|ipad|ipod/i.test(ua)) return "ios";
    if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
    return "other";
  }
  var OS = detectOS();

  /* ---- session dedup (no cookies, no cross-session id) ------------------ */
  var mem = {}, lastFocus = null;
  function once(k){ k="carrel_"+k; try{ if(sessionStorage.getItem(k))return false; sessionStorage.setItem(k,"1"); return true; }catch(e){ if(mem[k])return false; mem[k]=1; return true; } }

  /* ---- tracking --------------------------------------------------------- */
  window.__events = window.__events || [];
  function track(name, props){
    var p = Object.assign({event:name, variant:analyticsVariant, os:OS, ts:new Date().toISOString()}, props||{});
    window.__events.push(p);
    try{ console.log("[carrel-event] "+JSON.stringify(p)); }catch(e){}
    if (isSet(CFG.analytics.plausibleDomain) && typeof window.plausible === "function"){
      var pp = Object.assign({variant:analyticsVariant, os:OS}, props||{});
      if (name === "page_view") window.plausible("pageview", {props:pp});
      else window.plausible(name, {props:pp});
    }
  }
  function loadPlausible(){
    if(!isSet(CFG.analytics.plausibleDomain)) return;
    window.plausible = window.plausible || function(){ (window.plausible.q=window.plausible.q||[]).push(arguments); };
    var s=document.createElement("script"); s.defer=true; s.src=CFG.analytics.plausibleSrc;
    s.setAttribute("data-domain", CFG.analytics.plausibleDomain); document.head.appendChild(s);
  }

  /* ---- icons ------------------------------------------------------------ */
  var IMG = {
    "ic-entry":"ic-entry.png","ic-chart":"ic-chart.png","ic-gear":"ic-gear.png",
    "ic-floors":"ic-floors.png","ic-cap":"ic-cap.png","geofence":"ic-geofence.png",
    "entry":"ic-entry.png","chart":"ic-chart.png","heatmap":"ic-heatmap.png",
    "trophy":"ic-trophy.png","friends":"ic-friends.png"
  };
  function gaugeSVG(pct,cls){
    var col = pct>=66?"#E8756E":(pct>=40?"#E8A44C":"#5FBE97");
    return '<svg viewBox="0 0 120 66" class="'+(cls||"")+'" aria-hidden="true">'
      +'<path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="10" stroke-linecap="round" pathLength="100"/>'
      +'<path d="M8 60 A52 52 0 0 1 112 60" fill="none" stroke="'+col+'" stroke-width="10" stroke-linecap="round" pathLength="100" stroke-dasharray="'+pct+' 100"/></svg>';
  }
  function iconHTML(key){
    if(key==="gauge") return gaugeSVG(72,"ic-gauge");
    return '<img class="pixel" src="assets/img/'+(IMG[key]||"ic-chart.png")+'" alt="">';
  }

  /* ---- store badges (official-style, both platforms) -------------------- */
  var APPLE='<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M17.05 12.5c-.02-2 1.63-2.96 1.7-3-.93-1.36-2.38-1.55-2.9-1.57-1.23-.12-2.4.72-3.03.72-.62 0-1.58-.7-2.6-.68-1.34.02-2.57.78-3.26 1.98-1.39 2.41-.36 5.98 1 7.94.66.96 1.45 2.03 2.48 1.99 1-.04 1.37-.64 2.58-.64 1.2 0 1.54.64 2.6.62 1.07-.02 1.75-.98 2.4-1.94.76-1.11 1.07-2.18 1.09-2.24-.02-.01-2.09-.8-2.11-3.18zM15.1 6.9c.55-.66.92-1.59.82-2.5-.79.03-1.75.53-2.32 1.19-.51.58-.96 1.51-.84 2.4.88.07 1.79-.44 2.34-1.09z"/></svg>';
  var PLAY='<svg class="glyph" viewBox="0 0 22 24" aria-hidden="true">'
    +'<path fill="#EA4335" d="M2.7 1.4 13.9 8 11.4 10.5 2.7 1.4z"/>'
    +'<path fill="#4285F4" d="M2.4 1.6C2.2 1.8 2.1 2.1 2.1 2.6v18.8c0 .5.1.8.3 1L12 12 2.4 1.6z"/>'
    +'<path fill="#34A853" d="M2.7 22.6 11.4 13.5 13.9 16 2.7 22.6z"/>'
    +'<path fill="#FBBC04" d="M13.9 8 18.9 10.9c1 .6 1 1.6 0 2.2L13.9 16 11.1 12 13.9 8z"/></svg>';
  function badgesHTML(){
    return '<button class="badge" data-store="ios" type="button" aria-label="Im App Store laden">'+APPLE
      +'<span class="txt"><small>Laden im</small><b>App&nbsp;Store</b></span></button>'
      +'<button class="badge" data-store="android" type="button" aria-label="Bei Google Play">'+PLAY
      +'<span class="txt"><small>Jetzt bei</small><b>Google&nbsp;Play</b></span></button>';
  }

  function el(id){ return document.getElementById(id); }
  function set(id,txt){ var e=el(id); if(e) e.textContent=txt; }

  /* ---- render ----------------------------------------------------------- */
  function render(){
    document.documentElement.lang="de";
    set("appName", CFG.appName);
    el("logo").src="assets/img/logo.png";

    // hero
    el("hero-bg-img").src="assets/img/philo-hero.png";
    set("headline", V.headline);
    set("sub", V.sub);
    set("everylib", S.everyLibrary);
    set("dlnote", S.downloadNote);
    el("owl").src="assets/img/owl-anim.png";

    // variant benefits
    el("benefits").innerHTML = V.benefits.map(function(b){
      return '<div class="benefit reveal-up"><span class="ic">'+iconHTML(b.icon)+'</span><p>'+b.text+'</p></div>';
    }).join("");

    // how it works
    set("howHead", S.how.heading); set("howSub", S.how.sub);
    el("howSteps").innerHTML = S.how.steps.map(function(s,i){
      return '<div class="step reveal-up"><span class="n">'+(i+1)+'</span>'+iconHTML(s.icon).replace('class="pixel"','class="pixel" style="width:48px;height:48px"')
        +'<h3>'+s.title+'</h3><p>'+s.text+'</p></div>';
    }).join("");

    // features
    set("featHead", S.features.heading); set("featSub", S.features.sub);
    el("featGrid").innerHTML = S.features.items.map(function(f){
      return '<div class="feature reveal-up">'+iconHTML(f.icon).replace('class="pixel"','class="pixel" style="width:38px;height:38px"')
        +'<h3>'+f.title+'</h3><p>'+f.text+'</p></div>';
    }).join("");
    buildHeatmap();

    // faq
    set("faqHead", S.faq.heading);
    el("faqList").innerHTML = S.faq.items.map(function(x,i){
      return '<div class="qa"><button type="button" aria-expanded="false" aria-controls="a'+i+'">'
        +'<span>'+x.q+'</span><span class="plus" aria-hidden="true">+</span></button>'
        +'<div class="a" id="a'+i+'" role="region"><p>'+x.a+'</p></div></div>';
    }).join("");

    // cta + reveal + footer
    set("ctaHead", S.downloadHeading);
    set("ctaTag", S.tagline);
    set("revealHead", S.reveal.headline);
    set("revealBody", S.reveal.body);
    el("m-owl").src="assets/img/owl-anim.png";
    el("email").placeholder=S.emailPlaceholder;
    set("optinLabel", S.optin);
    set("emailBtn", S.emailButton);
    set("thanks", S.thanks);
    set("disc", S.footerDisclaimer);

    // inject store badges everywhere
    Array.prototype.forEach.call(document.querySelectorAll(".badges"), function(c){ c.innerHTML=badgesHTML(); });
  }

  function buildHeatmap(){
    var g=el("hmGrid"); if(!g) return;
    var cols=20, rows=5, cells="";
    // deterministic pattern: denser toward "recent" (right)
    for(var r=0;r<rows;r++) for(var c=0;c<cols;c++){
      var seed=(c*7+r*13)%11, lvl = seed>8?4:seed>6?3:seed>4?2:seed>2?1:0;
      if(c>15 && seed>3) lvl=Math.min(4,lvl+1);
      var cls = lvl?" l"+lvl:"";
      cells+='<i class="'+cls.trim()+'" style="animation-delay:'+((c+r)*18)+'ms"></i>';
    }
    g.innerHTML=cells;
  }

  /* ---- interactions ----------------------------------------------------- */
  function onStore(btn){
    var button=btn.getAttribute("data-store");
    if(once("dl_"+button)) track("download_tap", {button:button, os:OS, variant:analyticsVariant});
    openModal();
  }
  function openModal(){
    lastFocus=document.activeElement; var m=el("modal"); m.classList.add("open"); m.setAttribute("aria-hidden","false");
    setTimeout(function(){ var f=el("email"), x=m.querySelector("[data-close]"); var t=(f&&f.offsetParent!==null)?f:x; if(t){ try{t.focus();}catch(e){} } },40);
  }
  function closeModal(){ var m=el("modal"); m.classList.remove("open"); m.setAttribute("aria-hidden","true"); if(lastFocus&&lastFocus.focus){ try{lastFocus.focus();}catch(e){} } }

  function onSubmit(e){
    e.preventDefault();
    var email=el("email"), optin=el("optin"), err=el("emailErr");
    if(!email.value || !email.checkValidity()){ err.textContent="Bitte gib eine gültige E-Mail-Adresse ein."; err.style.display="block"; return; }
    if(!optin.checked){ err.textContent="Bitte bestätige die Benachrichtigung."; err.style.display="block"; return; }
    err.style.display="none";
    function done(){ if(once("em")) track("email_submit",{variant:analyticsVariant, os:OS}); el("form").style.display="none"; el("thanks").style.display="block"; }
    if(isSet(CFG.formspree.endpoint)){
      var fd=new FormData(); fd.append("email",email.value); fd.append("variant",analyticsVariant);
      fd.append("_subject","Carrel launch-notify ("+analyticsVariant+")");
      fetch(CFG.formspree.endpoint,{method:"POST",body:fd,headers:{Accept:"application/json"}})
        .then(function(r){ if(r.ok) done(); else { err.textContent="Etwas ist schiefgelaufen. Bitte später erneut versuchen."; err.style.display="block"; } })
        .catch(function(){ err.textContent="Netzwerkfehler. Bitte später erneut versuchen."; err.style.display="block"; });
    } else done();
  }

  function initScroll(){
    function depth(){
      var h=document.documentElement, sc=h.scrollTop||document.body.scrollTop, max=h.scrollHeight-h.clientHeight;
      var p=max>0?(sc/max)*100:100;
      if(p>=50 && once("sc50")) track("scroll_50",{variant:analyticsVariant});
      if(p>=90 && once("sc90")) track("scroll_90",{variant:analyticsVariant});
    }
    var t; window.addEventListener("scroll",function(){ clearTimeout(t); t=setTimeout(depth,120); },{passive:true});
    setTimeout(depth, 600); // fire once for short pages that never scroll
  }
  function initReveal(){
    if(!("IntersectionObserver" in window)){ Array.prototype.forEach.call(document.querySelectorAll(".reveal-up"),function(x){x.classList.add("in");}); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }); },{threshold:.15});
    Array.prototype.forEach.call(document.querySelectorAll(".reveal-up"),function(x){ io.observe(x); });
  }

  /* ---- boot ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function(){
    loadPlausible();
    render();
    document.body.setAttribute("data-variant", analyticsVariant);
    // bind after render (badges are injected)
    Array.prototype.forEach.call(document.querySelectorAll("[data-store]"), function(b){
      b.addEventListener("click", function(e){ e.preventDefault(); onStore(b); });
    });
    el("form").addEventListener("submit", onSubmit);
    Array.prototype.forEach.call(document.querySelectorAll("[data-close]"), function(x){ x.addEventListener("click", function(e){ e.preventDefault(); closeModal(); }); });
    el("modal").addEventListener("click", function(e){ if(e.target===this) closeModal(); });
    document.addEventListener("keydown", function(e){ if(e.key==="Escape") closeModal(); });
    // faq accordion
    Array.prototype.forEach.call(document.querySelectorAll(".qa button"), function(btn){
      btn.addEventListener("click", function(){
        var open=btn.getAttribute("aria-expanded")==="true";
        btn.setAttribute("aria-expanded", open?"false":"true");
        var a=btn.parentElement.querySelector(".a"); a.style.maxHeight = open?null:a.scrollHeight+"px";
      });
    });
    window.addEventListener("resize", function(){
      Array.prototype.forEach.call(document.querySelectorAll('.qa button[aria-expanded="true"]'), function(btn){
        var a=btn.parentElement.querySelector(".a"); if(a) a.style.maxHeight=a.scrollHeight+"px";
      });
    });
    el("modal").addEventListener("keydown", function(e){
      if(e.key!=="Tab") return;
      var f=Array.prototype.filter.call(this.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'), function(x){ return x.offsetParent!==null; });
      if(!f.length) return; var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    });
    initScroll(); initReveal();
    if(once("pv")) track("page_view", {variant:analyticsVariant, os:OS, referrer:document.referrer||""});
  });
})();
