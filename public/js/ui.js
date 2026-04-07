// Timpa fungsi openModal dan saveTask lama lo dengan ini
function openModal(){
  document.getElementById('f-name').value='';
  document.getElementById('f-due').value=todayISO;
  document.getElementById('f-notes').value='';
  document.getElementById('f-prio').value='med';
  
  // Reset field KPI baru
  const tgtStart = document.getElementById('f-tgt-start');
  if(tgtStart) tgtStart.value = todayISO;
  const estDur = document.getElementById('f-est-dur');
  if(estDur) estDur.value = '1';

  const sel=document.getElementById('f-proj');
  sel.innerHTML=projects.map(p=>`<option value="${p.name}">${p.name}</option>`).join('');
  
  // Ubah judul modal balik ke Tambah (buat nge-reset setelah dipakai edit)
  const modalTitle = document.querySelector('#modal h3');
  if(modalTitle) modalTitle.textContent = 'Tambah Task Baru';
  const saveBtn = document.querySelector('#modal .btn.primary');
  if(saveBtn) {
    saveBtn.textContent = 'Simpan Task';
    saveBtn.onclick = saveTask;
  }

  document.getElementById('modal').style.display='flex';
  setTimeout(()=>document.getElementById('f-name').focus(),50);
}

async function saveTask(){
  const name=document.getElementById('f-name').value.trim();if(!name)return;
  
  // Tangkap value KPI baru
  const tgtStartInput = document.getElementById('f-tgt-start');
  const estDurInput = document.getElementById('f-est-dur');
  
  const task={
    id:'task_'+Date.now(),
    name,
    project:document.getElementById('f-proj').value,
    due:document.getElementById('f-due').value,
    prio:document.getElementById('f-prio').value,
    progress:0,
    done:false,
    notes:document.getElementById('f-notes').value.trim(),
    targetStart: tgtStartInput ? tgtStartInput.value : '',
    estDuration: estDurInput ? parseInt(estDurInput.value) || 0 : 0,
    actualStart: '',
    completedAt: ''
  };
  
  tasks.unshift(task);
  closeModal();updateBadge();render();
  showDBStatus('Menyimpan task...');
  const res=await dbPost({action:'addTask',task});
  if(res&&res.id){task.id=res.id;}
  hideDBStatus();
}
