const state = JSON.parse(localStorage.getItem('travelPlanner') || '{"routes":[],"points":[],"notes":[],"profile":{"name":"Путешественник","email":"","currency":"₽"}}');

function save(){ localStorage.setItem('travelPlanner', JSON.stringify(state)); render(); }
function money(n){ return Number(n||0).toLocaleString('ru-RU') + ' ' + state.profile.currency; }

function openPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  const titles={dashboard:'Планировщик путешествий',routes:'Маршруты',points:'Точки',notes:'Заметки',profile:'Профиль'};
  document.getElementById('pageTitle').textContent=titles[id];
}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>openPage(b.dataset.page));

document.getElementById('routeForm').onsubmit=e=>{
  e.preventDefault();
  state.routes.unshift({
    id:Date.now(),name:routeName.value,date:routeDate.value,
    time:Number(routeTime.value||0),cost:Number(routeCost.value||0),
    description:routeDescription.value
  });
  e.target.reset(); routeTime.value=1; routeCost.value=0; save(); openPage('routes');
};

document.getElementById('pointForm').onsubmit=e=>{
  e.preventDefault();
  state.points.unshift({
    id:Date.now(),name:pointName.value,place:pointPlace.value,
    time:Number(pointTime.value||0),cost:Number(pointCost.value||0),note:pointNote.value
  });
  e.target.reset(); pointTime.value=60; pointCost.value=0; save(); openPage('points');
};

document.getElementById('noteForm').onsubmit=e=>{
  e.preventDefault();
  state.notes.unshift({id:Date.now(),title:noteTitle.value,text:noteText.value});
  e.target.reset(); save(); openPage('notes');
};

document.getElementById('profileForm').onsubmit=e=>{
  e.preventDefault();
  state.profile={name:profileName.value||'Путешественник',email:profileEmail.value,currency:profileCurrency.value};
  save(); alert('Профиль сохранён');
};

function remove(type,id){state[type]=state[type].filter(x=>x.id!==id);save();}

function render(){
  statRoutes.textContent=state.routes.length;
  statPoints.textContent=state.points.length;
  const hours=state.routes.reduce((s,x)=>s+Number(x.time||0),0)+state.points.reduce((s,x)=>s+Number(x.time||0)/60,0);
  statTime.textContent=(Math.round(hours*10)/10)+' ч';
  const cost=state.routes.reduce((s,x)=>s+Number(x.cost||0),0)+state.points.reduce((s,x)=>s+Number(x.cost||0),0);
  statCost.textContent=money(cost);

  profileName.value=state.profile.name;
  profileEmail.value=state.profile.email;
  profileCurrency.value=state.profile.currency;
  profileTopName.textContent=state.profile.name;

  routesList.innerHTML=state.routes.length?state.routes.map(r=>`
    <div class="route">
      <div><h3>${esc(r.name)}</h3>
      <p>${r.date?new Date(r.date+'T00:00:00').toLocaleDateString('ru-RU'):'Дата не указана'} · ${r.time} ч · ${money(r.cost)}</p>
      ${r.description?'<p>'+esc(r.description)+'</p>':''}</div>
      <button class="btn btn-danger" onclick="remove('routes',${r.id})">Удалить</button>
    </div>`).join(''):'<div class="empty">Маршрутов пока нет. Создайте первый маршрут.</div>';

  dashboardRoutes.innerHTML=state.routes.slice(0,4).map(r=>`
    <div class="route"><div><h3>${esc(r.name)}</h3><p>${r.time} ч · ${money(r.cost)}</p></div><span class="badge">Маршрут</span></div>
  `).join('')||'<div class="empty">Здесь появятся ваши маршруты.</div>';

  pointsList.innerHTML=state.points.length?state.points.map(p=>`
    <div class="point"><div class="point-head"><div class="point-title">📍 ${esc(p.name)}</div>
    <button class="btn btn-danger" onclick="remove('points',${p.id})">Удалить</button></div>
    <div class="point-meta">${esc(p.place||'Место не указано')} · ${p.time} мин · ${money(p.cost)}</div>
    ${p.note?'<div class="point-meta">'+esc(p.note)+'</div>':''}</div>
  `).join(''):'<div class="empty">Добавьте интересные места, которые хотите посетить.</div>';

  notesList.innerHTML=state.notes.length?state.notes.map(n=>`
    <div class="note"><div class="point-head"><b>${esc(n.title)}</b>
    <button class="btn btn-danger" onclick="remove('notes',${n.id})">Удалить</button></div>
    <div style="margin-top:8px">${esc(n.text)}</div></div>
  `).join(''):'<div class="empty">Заметок пока нет.</div>';
}

function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
render();
