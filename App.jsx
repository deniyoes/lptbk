import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, Users, Settings, Search, Bell, ChevronDown, ChevronLeft,
  ChevronRight, Download, Plus, CalendarDays, SlidersHorizontal, Menu,
  RefreshCw, CircleHelp, LogOut, Wallet, Clock3, CalendarCheck, X,
  FileSpreadsheet, ArrowUpDown, MoreHorizontal, Check, AlertCircle
} from 'lucide-react'
import { isSupabaseConfigured, supabase } from './lib/supabase'

const demoEmployees = [
  { id: '1', nip: '197803102005011001', nama: 'DEVI MAHNIZON', golongan: 'III/d', jabatan: 'Pelaksana', rekening: '' },
  { id: '2', nip: '197609291998031001', nama: 'ABRAHAM TARIGAN', golongan: 'IV/a', jabatan: 'Kepala Seksi', rekening: '' },
  { id: '3', nip: '198204152006041002', nama: 'ANDI SAPUTRA', golongan: 'III/c', jabatan: 'Pelaksana', rekening: '' },
  { id: '4', nip: '198711202010121003', nama: 'CUT NURHALIZA', golongan: 'III/b', jabatan: 'Pelaksana', rekening: '' },
  { id: '5', nip: '199001102014021004', nama: 'FAJAR HIDAYAT', golongan: 'III/a', jabatan: 'Pelaksana', rekening: '' },
  { id: '6', nip: '198506252009021005', nama: 'IRWAN MAULANA', golongan: 'III/c', jabatan: 'Pelaksana', rekening: '' },
]
const codes = ['WFO', 'WFH', 'LIBUR', 'LP', 'CUTI', 'SAKIT', 'DL']
const codeClass = (v) => ({ WFO: 'code-wfo', WFH: 'code-wfh', LIBUR: 'code-holiday', LP: 'code-lp', CUTI: 'code-leave', SAKIT: 'code-sick', DL: 'code-dl' }[v] || '')
const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function App() {
  const [page, setPage] = useState('rekap')
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(2026)
  const [employees, setEmployees] = useState(demoEmployees)
  const [attendance, setAttendance] = useState({})
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ nip: '', nama: '', golongan: '', jabatan: '' })

  const days = new Date(year, month, 0).getDate()
  const filteredEmployees = useMemo(() => employees.filter(e => `${e.nama} ${e.nip}`.toLowerCase().includes(query.toLowerCase())), [employees, query])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let alive = true
    async function loadEmployees() {
      setLoading(true)
      const { data, error } = await supabase.from('employees').select('id,nip,nama,golongan,jabatan,rekening').order('nama')
      if (!alive) return
      if (error) notify(`Gagal memuat pegawai: ${error.message}`)
      else if (data?.length) setEmployees(data)
      setLoading(false)
    }
    loadEmployees()
    return () => { alive = false }
  }, [])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }

  function changeAttendance(employeeId, day, value) {
    const key = `${employeeId}-${year}-${month}-${day}`
    setAttendance(prev => ({ ...prev, [key]: value }))
    if (isSupabaseConfigured) {
      // Attendance persistence will be connected after confirming the final attendance-code catalogue.
    }
  }

  function addEmployee(e) {
    e.preventDefault()
    if (!newEmployee.nip.trim() || !newEmployee.nama.trim()) return notify('NIP dan nama wajib diisi.')
    if (employees.some(x => x.nip === newEmployee.nip.trim())) return notify('NIP sudah terdaftar.')
    const row = { ...newEmployee, id: crypto.randomUUID(), rekening: '' }
    setEmployees(prev => [...prev, row].sort((a,b) => a.nama.localeCompare(b.nama)))
    setNewEmployee({ nip: '', nama: '', golongan: '', jabatan: '' })
    setShowAdd(false)
    notify('Pegawai ditambahkan pada tampilan. Simpan ke Supabase setelah koneksi master aktif.')
  }

  function exportCsv() {
    const headers = ['No','NIP','Nama','Golongan','Jabatan', ...Array.from({length: days}, (_,i) => i+1)]
    const rows = filteredEmployees.map((e,i) => [i+1,e.nip,e.nama,e.golongan || '',e.jabatan || '', ...Array.from({length: days},(_,j) => attendance[`${e.id}-${year}-${month}-${j+1}`] || '')])
    const csv = [headers, ...rows].map(row => row.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(';')).join('\r\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `Rekap_Kehadiran_${year}_${String(month).padStart(2,'0')}.csv`; a.click(); URL.revokeObjectURL(url)
  }

  const monthLabel = `${monthNames[month-1]} ${year}`
  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark">K</div><div><strong>ADMIN KPPN</strong><span>Employee workspace</span></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav>
        <button className={`nav-item ${page==='rekap'?'active':''}`} onClick={() => {setPage('rekap');setMobileNav(false)}}><LayoutDashboard size={18}/> Rekap Bulanan</button>
        <button className={`nav-item ${page==='pegawai'?'active':''}`} onClick={() => {setPage('pegawai');setMobileNav(false)}}><Users size={18}/> Master Pegawai</button>
      </nav>
      <div className="nav-caption nav-caption-bottom">PREFERENSI</div>
      <button className={`nav-item ${page==='pengaturan'?'active':''}`} onClick={() => {setPage('pengaturan');setMobileNav(false)}}><Settings size={18}/> Pengaturan</button>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><strong>Butuh bantuan?</strong><p>Panduan penggunaan aplikasi administrasi.</p><button onClick={() => notify('Panduan penggunaan akan disiapkan pada tahap berikutnya.')}>Lihat panduan <ChevronRight size={14}/></button></div><div className="profile"><div className="avatar">AD</div><div className="profile-info"><strong>Administrator</strong><span>Admin aplikasi</span></div><MoreHorizontal size={18} className="muted"/></div></div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{page==='rekap'?'Rekap Bulanan':page==='pegawai'?'Master Pegawai':'Pengaturan'}</b></div></div><div className="topbar-right"><div className={`connection ${isSupabaseConfigured?'connected':'disconnected'}`}><span/> {isSupabaseConfigured?'Supabase terhubung':'Mode pratinjau'}</div><button className="icon-button" title="Notifikasi" onClick={() => notify('Belum ada notifikasi.')}><Bell size={18}/></button><div className="top-avatar">AD</div></div></header>
      {page === 'rekap' && <section className="page-content">
        <div className="page-heading"><div><div className="eyebrow">OVERVIEW / OPERASIONAL</div><h1>Rekap Bulanan</h1><p>Kelola kehadiran, libur pengganti, uang makan, dan lembur dalam satu tampilan.</p></div><button className="btn btn-primary" onClick={exportCsv}><Download size={16}/> Ekspor rekap</button></div>
        <div className="period-bar"><div className="period-title"><CalendarDays size={18}/><div><span>PERIODE AKTIF</span><strong>{monthLabel}</strong></div></div><div className="period-controls"><button className="select-like" onClick={() => {setMonth(m => m===1?12:m-1); if(month===1)setYear(y=>y-1)}}><ChevronLeft size={15}/></button><select value={month} onChange={e=>setMonth(Number(e.target.value))}>{monthNames.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select><select value={year} onChange={e=>setYear(Number(e.target.value))}>{[2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}</select><button className="select-like" onClick={() => {setMonth(m => m===12?1:m+1); if(month===12)setYear(y=>y+1)}}><ChevronRight size={15}/></button></div></div>
        <div className="stats-grid"><Stat icon={<Users/>} label="Total Pegawai" value={employees.length} detail="Pegawai terdaftar" tone="blue"/><Stat icon={<CalendarCheck/>} label="Hari Kerja" value="—" detail="Menunggu kalender kerja" tone="green"/><Stat icon={<Wallet/>} label="Total Uang Makan" value="—" detail="Menunggu data kehadiran" tone="orange"/><Stat icon={<Clock3/>} label="Total Lembur" value="—" detail="Menunggu aturan perhitungan" tone="purple"/></div>
        <div className="section-card"><div className="table-toolbar"><div><h2>Data Kehadiran Pegawai</h2><p>Isi kode kehadiran langsung pada sel tabel. Klik sel untuk memilih kode.</p></div><div className="toolbar-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama atau NIP..."/></div><button className="btn btn-outline" onClick={() => notify('Filter lanjutan akan tersedia setelah kategori data ditetapkan.')}><SlidersHorizontal size={15}/> Filter</button><button className="btn btn-outline btn-square" title="Muat ulang" onClick={() => window.location.reload()}><RefreshCw size={15}/></button></div></div>
          <div className="legend"><span><i className="legend-dot dot-wfo"/> WFO</span><span><i className="legend-dot dot-wfh"/> WFH</span><span><i className="legend-dot dot-holiday"/> Libur</span><span><i className="legend-dot dot-lp"/> Libur Pengganti</span><span><i className="legend-dot dot-leave"/> Cuti</span><span><i className="legend-dot dot-dl"/> Dinas Luar</span></div>
          <div className="table-wrap"><table className="attendance-table"><thead><tr className="group-head"><th className="sticky-col sticky-no" rowSpan="2">No</th><th className="sticky-col sticky-name" rowSpan="2">Pegawai</th><th className="sticky-col sticky-gol" rowSpan="2">Gol.</th><th colSpan={days} className="date-group">TANGGAL — {monthLabel.toUpperCase()}</th></tr><tr className="date-head">{Array.from({length:days},(_,i)=><th key={i} className={new Date(year,month-1,i+1).getDay()===0||new Date(year,month-1,i+1).getDay()===6?'weekend':''}>{i+1}</th>)}</tr></thead><tbody>{filteredEmployees.map((emp,index)=><tr key={emp.id}><td className="sticky-col sticky-no row-no">{index+1}</td><td className="sticky-col sticky-name employee-cell"><strong>{emp.nama}</strong><span>{emp.nip}</span></td><td className="sticky-col sticky-gol"><span className="gol-pill">{emp.golongan || '—'}</span></td>{Array.from({length:days},(_,i)=>{const day=i+1;const key=`${emp.id}-${year}-${month}-${day}`;const value=attendance[key]||'';const weekend=[0,6].includes(new Date(year,month-1,day).getDay());return <td key={day} className={`attendance-cell ${weekend?'weekend':''}`} onClick={()=>setEditing(editing===key?null:key)}>{editing===key?<select autoFocus className="cell-select" value={value} onChange={e=>{changeAttendance(emp.id,day,e.target.value);setEditing(null)}} onBlur={()=>setEditing(null)}><option value="">—</option>{codes.map(c=><option key={c}>{c}</option>)}</select>:<span className={`attendance-code ${value?codeClass(value):'empty-code'}`}>{value||'·'}</span>}</td>})}</tr>)}</tbody></table>{filteredEmployees.length===0&&<div className="empty-state">Tidak ada pegawai yang cocok dengan pencarian.</div>}</div>
          <div className="table-footer"><span>Menampilkan <b>{filteredEmployees.length}</b> dari <b>{employees.length}</b> pegawai</span><span className="footer-note"><AlertCircle size={14}/> Data pada tahap awal ini belum disimpan ke database.</span></div>
        </div>
        <div className="next-modules"><div><div className="module-icon lp-icon"><CalendarCheck size={18}/></div><div><strong>Libur Pengganti</strong><span>Saldo dan transaksi LP akan ditampilkan pada rekap ini.</span></div></div><div><div className="module-icon meal-icon"><Wallet size={18}/></div><div><strong>Uang Makan</strong><span>WFO dan WFH menjadi dasar hari berhak uang makan.</span></div></div><div><div className="module-icon ot-icon"><Clock3 size={18}/></div><div><strong>Uang Lembur</strong><span>Rincian lembur menunggu ketentuan perhitungan.</span></div></div></div>
      </section>}
      {page === 'pegawai' && <section className="page-content"><div className="page-heading"><div><div className="eyebrow">DATA REFERENSI</div><h1>Master Pegawai</h1><p>Kelola identitas pegawai yang digunakan dalam rekap bulanan.</p></div><button className="btn btn-primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> Tambah pegawai</button></div><div className="section-card"><div className="table-toolbar"><div><h2>Daftar Pegawai</h2><p>{employees.length} pegawai pada daftar saat ini</p></div><div className="toolbar-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama atau NIP..."/></div></div></div><div className="table-wrap"><table className="master-table"><thead><tr><th>No</th><th>NIP</th><th>Nama Pegawai</th><th>Golongan</th><th>Jabatan</th><th>Rekening</th></tr></thead><tbody>{filteredEmployees.map((e,i)=><tr key={e.id}><td>{i+1}</td><td className="mono">{e.nip}</td><td><strong>{e.nama}</strong></td><td>{e.golongan||'—'}</td><td>{e.jabatan||'—'}</td><td>{e.rekening||'—'}</td></tr>)}</tbody></table></div><div className="table-footer"><span>Menampilkan <b>{filteredEmployees.length}</b> dari <b>{employees.length}</b> pegawai</span><span className="footer-note">{isSupabaseConfigured?'Sumber: Supabase':'Mode pratinjau / data contoh'}</span></div></div></section>}
      {page === 'pengaturan' && <section className="page-content"><div className="page-heading"><div><div className="eyebrow">KONFIGURASI APLIKASI</div><h1>Pengaturan</h1><p>Konfigurasi koneksi dan preferensi dasar aplikasi.</p></div></div><div className="settings-grid"><div className="section-card setting-card"><div className="setting-heading"><div className="module-icon meal-icon"><Settings size={18}/></div><div><h2>Koneksi Supabase</h2><p>Status koneksi backend aplikasi.</p></div></div><div className="setting-status"><span className={`status-dot ${isSupabaseConfigured?'ok':''}`}/><div><strong>{isSupabaseConfigured?'Konfigurasi ditemukan':'Belum dikonfigurasi'}</strong><span>{isSupabaseConfigured?'Variabel lingkungan tersedia.':'Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.'}</span></div></div><p className="setting-help">Atur variabel ini pada file <code>.env</code> saat pengembangan lokal dan pada Vercel → Settings → Environment Variables saat deploy.</p></div><div className="section-card setting-card"><div className="setting-heading"><div className="module-icon lp-icon"><FileSpreadsheet size={18}/></div><div><h2>Data & Perhitungan</h2><p>Pengaturan yang akan dikembangkan berikutnya.</p></div></div><div className="setting-list"><div><span>Kode kehadiran</span><b>Menunggu finalisasi</b></div><div><span>Tarif uang makan</span><b>Belum diatur</b></div><div><span>Aturan pajak</span><b>Belum diatur</b></div><div><span>Rumus lembur</span><b>Menunggu ketentuan</b></div></div></div></div></section>}
      <footer className="app-footer"><span>© 2026 Administrasi Pegawai KPPN</span><span>Versi 0.1.0 · Fondasi aplikasi</span></footer>
    </main>
    {showAdd && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAdd(false)}}><form className="modal" onSubmit={addEmployee}><div className="modal-head"><div><h2>Tambah Pegawai</h2><p>Masukkan identitas dasar pegawai.</p></div><button type="button" className="icon-button" onClick={()=>setShowAdd(false)}><X size={18}/></button></div><label>NIP<input value={newEmployee.nip} onChange={e=>setNewEmployee(p=>({...p,nip:e.target.value}))} placeholder="Masukkan NIP" required/></label><label>Nama lengkap<input value={newEmployee.nama} onChange={e=>setNewEmployee(p=>({...p,nama:e.target.value.toUpperCase()}))} placeholder="Nama pegawai" required/></label><div className="form-row"><label>Golongan<input value={newEmployee.golongan} onChange={e=>setNewEmployee(p=>({...p,golongan:e.target.value}))} placeholder="Contoh: III/a"/></label><label>Jabatan<input value={newEmployee.jabatan} onChange={e=>setNewEmployee(p=>({...p,jabatan:e.target.value}))} placeholder="Jabatan"/></label></div><div className="modal-actions"><button type="button" className="btn btn-outline" onClick={()=>setShowAdd(false)}>Batal</button><button className="btn btn-primary" type="submit"><Check size={15}/> Tambahkan</button></div></form></div>}
    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
  </div>
}

function Stat({icon,label,value,detail,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div> }

export default App
