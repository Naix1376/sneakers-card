// Данные о товарах. Чтобы добавить новый товар, скопируйте блок sneakers или dress,
// поменяйте название, размеры, цену и путь к фото.
// title — подпись вкладки в меню: новая вкладка появится сама.
// price(размер) возвращает цену до скидки, disc — скидка (0.05 = 5%).
function range(a,b){var r=[];for(var i=a;i<=b;i++)r.push(i);return r;}
var P={
  sneakers:{title:'Кроссовки',name:'Кроссовки Forever Sister X',brand:'Forever Sister · молодёжная серия',rating:true,sizes:range(35,48),stock:function(s){return s<=43;},price:function(s){return 115+5*(s-35);},disc:0.15,img:'images/sneakers.jpg',emo:'👟'},
  dress:{title:'Платье «Ангелина»',name:'Платье «Ангелина»',brand:'Коллекция «Ангелина»',rating:false,sizes:range(38,44),stock:function(){return true;},price:function(){return 79;},disc:0.05,img:'images/dress.jpg',emo:'👗'},
  dress2:{title:'Толстовка «MARK II»',name:'Толстовка «Naix X Mark II»',brand:'Коллекция «Naix»',rating:true,sizes:range(38,55),stock:function(){return true;},price:function(s){return 215+10*(s-20);},disc:0.05,img:'images/dress2.jpg',emo:'👘'}
};