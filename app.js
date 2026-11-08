// Логика магазина: страницы товаров, корзина, анимация, оплата.
// Данные о товарах (переменная P) берутся из products.js.
(function(){
  function fmt(n){return '$'+n.toFixed(2).replace('.',',');}
  function unit(k,s){return P[k].price(s)*(1-P[k].disc);}
  var view=document.getElementById('view'), links=document.querySelectorAll('#nav a');
  var cartBtn=document.getElementById('cart'), countEl=document.getElementById('count');
  var drawer=document.getElementById('drawer'), overlay=document.getElementById('overlay'), list=document.getElementById('list');
  var allBtn=document.getElementById('all'), totalEl=document.getElementById('total'), selCount=document.getElementById('selcount');
  var payBtn=document.getElementById('pay'), codBtn=document.getElementById('cod'), msg=document.getElementById('msg');
  var reduce=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur='sneakers', sel=null;
  var KEY='mini-shop-cart-v1';
  function load(){
    try{
      var raw=localStorage.getItem(KEY); if(!raw) return null;
      var a=JSON.parse(raw); if(!Array.isArray(a)) return null;
      return a.filter(function(i){return i&&P[i.k]&&P[i.k].sizes.indexOf(i.size)>-1&&P[i.k].stock(i.size)&&i.qty>=1&&i.qty<=99;}).map(function(i){return {k:i.k,size:i.size,qty:Math.floor(i.qty),on:!!i.on};});
    }catch(e){return null;}
  }
  function save(){ try{ localStorage.setItem(KEY,JSON.stringify(items)); }catch(e){} }
  var items=load()||[{k:'sneakers',size:38,qty:1,on:true},{k:'sneakers',size:41,qty:1,on:true},{k:'dress',size:42,qty:1,on:false}];

  function route(){var h=location.hash.slice(1); cur=P[h]?h:'sneakers'; sel=null; renderProduct();}
  function renderProduct(){
    var p=P[cur];
    [].forEach.call(links,function(a){a.setAttribute('aria-current',a.getAttribute('href')==='#'+cur?'page':'false');});
    document.title=p.name+' — мини-магазин';
    view.innerHTML='<div class="pic" id="pic"><span class="emo" aria-hidden="true">'+p.emo+'</span><img alt="'+p.name+'" src="'+p.img+'"></div><div><h1>'+p.name+'</h1><p class="brand">'+p.brand+'</p>'+(p.rating?'<div class="rating"><span class="stars">★★★★☆</span> 4,0</div>':'')+'<div class="price"><span class="now" id="now"></span><span class="old" id="old"></span>'+(p.disc?'<span class="badge">−'+Math.round(p.disc*100)+'%</span>':'')+'</div><p class="label">Размер</p><div class="sizes" id="sizes"></div><p class="hint" id="hint" aria-live="polite">Выберите размер</p><button class="buy" id="buy" type="button" disabled>Выберите размер</button></div>';
    var im=view.querySelector('img'); im.onerror=function(){im.remove();};
    document.getElementById('buy').addEventListener('click',onBuy);
    renderSizes(); setPrice();
  }
  function renderSizes(){
    var p=P[cur], wrap=document.getElementById('sizes'); wrap.innerHTML='';
    p.sizes.forEach(function(s){
      var b=document.createElement('button'); b.type='button'; b.className='size'; b.textContent=s;
      if(!p.stock(s)){ b.disabled=true; b.title='Нет в наличии'; }
      else{
        b.title=fmt(unit(cur,s)); b.setAttribute('aria-pressed',s===sel?'true':'false');
        b.addEventListener('click',function(){ sel=s; renderSizes(); setPrice(); var buy=document.getElementById('buy'); buy.disabled=false; buy.textContent='В корзину, размер '+s; document.getElementById('hint').textContent='Выбран размер '+s; });
      }
      wrap.appendChild(b);
    });
  }
  function setPrice(){
    var p=P[cur], s=sel||p.sizes[0];
    document.getElementById('now').textContent=(sel?'':'от ')+fmt(unit(cur,s));
    document.getElementById('old').textContent=p.disc?fmt(p.price(s)):'';
  }
  function onBuy(){
    if(!sel) return;
    var f=items.filter(function(i){return i.k===cur&&i.size===sel;})[0];
    if(f){f.qty++;f.on=true;}else items.push({k:cur,size:sel,qty:1,on:true});
    renderCart();
    if(reduce) return;
    var src=document.getElementById('pic').getBoundingClientRect(), dst=cartBtn.getBoundingClientRect();
    var fly=document.createElement('div'); fly.className='fly';
    fly.innerHTML='<div class="fly-pic">'+P[cur].emo+'</div><div><b>'+P[cur].name+'</b><br>Размер '+sel+' · '+fmt(unit(cur,sel))+'</div>';
    document.body.appendChild(fly);
    var sx=src.left+src.width/2-110, sy=src.top+src.height/2-36, ex=dst.left+dst.width/2-110, ey=dst.top+dst.height/2-36;
    var a=fly.animate([{transform:'translate('+sx+'px,'+sy+'px) scale(1)',opacity:1},{transform:'translate('+ex+'px,'+ey+'px) scale(.12)',opacity:.4}],{duration:800,easing:'cubic-bezier(.5,0,.75,0)'});
    a.onfinish=function(){ fly.remove(); cartBtn.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:300}); };
  }

  function qtyTotal(){return items.reduce(function(a,i){return a+i.qty;},0);}
  function chosen(){return items.filter(function(i){return i.on;});}
  function selTotal(){return chosen().reduce(function(a,i){return a+unit(i.k,i.size)*i.qty;},0);}
  function badge(){var n=qtyTotal(); countEl.textContent=n; countEl.hidden=n===0; cartBtn.setAttribute('aria-label',n?'Корзина, товаров: '+n:'Корзина пуста');}
  function renderTotals(){
    var c=chosen(), every=items.length>0&&c.length===items.length;
    totalEl.textContent=fmt(selTotal()); save();
    selCount.textContent='Выбрано: '+c.length+' из '+items.length;
    allBtn.textContent=every?'Снять выбор':'Выбрать все товары';
    allBtn.disabled=!items.length;
    payBtn.disabled=codBtn.disabled=!c.length;
  }
  function renderCart(){
    badge(); list.innerHTML='';
    if(!items.length) list.innerHTML='<p class="empty">В корзине пока пусто. Выберите товар и размер и нажмите «В корзину».</p>';
    items.forEach(function(it,idx){
      var name=P[it.k].name, row=document.createElement('div'); row.className='row'; var id='cb-'+idx;
      var cb=document.createElement('input'); cb.type='checkbox'; cb.id=id; cb.checked=it.on;
      cb.addEventListener('change',function(){ it.on=cb.checked; renderTotals(); });
      var del=document.createElement('button'); del.type='button'; del.className='del'; del.textContent='✕';
      del.setAttribute('aria-label','Удалить из корзины: '+name+', размер '+it.size);
      del.addEventListener('click',function(){ items=items.filter(function(i){return i!==it;}); renderCart(); });
      var info=document.createElement('label'); info.className='info'; info.htmlFor=id;
      var b=document.createElement('b'); b.textContent=name;
      var sm=document.createElement('small'); info.appendChild(b); info.appendChild(sm);
      var p=document.createElement('span'); p.className='lp';
      var qty=document.createElement('span'); qty.className='qty';
      var minus=document.createElement('button'); minus.type='button'; minus.textContent='−'; minus.setAttribute('aria-label','Уменьшить количество');
      var q=document.createElement('span'); q.setAttribute('aria-live','polite');
      var plus=document.createElement('button'); plus.type='button'; plus.textContent='+'; plus.setAttribute('aria-label','Увеличить количество');
      function sync(){
        q.textContent=it.qty; minus.disabled=it.qty<=1; plus.disabled=it.qty>=99;
        sm.textContent='Размер '+it.size+' · '+fmt(unit(it.k,it.size))+' × '+it.qty;
        p.textContent=fmt(unit(it.k,it.size)*it.qty);
        badge(); renderTotals();
      }
      minus.addEventListener('click',function(){ if(it.qty>1){it.qty--;sync();} });
      plus.addEventListener('click',function(){ if(it.qty<99){it.qty++;sync();} });
      qty.appendChild(minus); qty.appendChild(q); qty.appendChild(plus);
      row.appendChild(cb); row.appendChild(del); row.appendChild(info); row.appendChild(qty); row.appendChild(p);
      list.appendChild(row); sync();
    });
    renderTotals();
  }
  function openCart(){ msg.textContent=''; drawer.hidden=false; overlay.hidden=false; document.getElementById('closecart').focus(); }
  function closeCart(){ drawer.hidden=true; overlay.hidden=true; cartBtn.focus(); }
  cartBtn.addEventListener('click',openCart);
  overlay.addEventListener('click',closeCart);
  document.getElementById('closecart').addEventListener('click',closeCart);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!drawer.hidden) closeCart(); });
  allBtn.addEventListener('click',function(){ var every=items.length>0&&chosen().length===items.length; items.forEach(function(i){i.on=!every;}); renderCart(); });
  payBtn.addEventListener('click',function(){ msg.textContent='Переходим к оплате заказа на '+fmt(selTotal())+'. Это демо: настоящей оплаты здесь нет.'; });
  codBtn.addEventListener('click',function(){ var s=selTotal(); items=items.filter(function(i){return !i.on;}); renderCart(); msg.textContent='Заказ на '+fmt(s)+' оформлен. Оплата при получении.'; });
  window.addEventListener('hashchange',route);
  renderCart(); route();
})();
