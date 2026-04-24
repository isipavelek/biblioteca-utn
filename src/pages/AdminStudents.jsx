import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Edit, User, Mail, GraduationCap, Upload, Search, X, Download, Phone, FileText, Hash, FileSpreadsheet, Users, UserCheck, Calendar, Shield } from 'lucide-react';
import * as XLSX from 'xlsx';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminStudents = ({ students, setStudents, deleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    type: 'Alumno', // Alumno, Profesor/a, Preceptor/a, Staff
    firstName: '',
    lastName: '',
    grade: '1°A',
    legajo: '',
    dniType: 'DNI',
    dni: '',
    sex: 'M',
    phone: '',
    cellphone: '',
    altPhone: '',
    email: '',
    instEmail: '',
    birthDate: ''
  });

  const courses = ["1°A", "1°B", "1°C", "2°A", "2°B", "2°C", "3°A", "3°B", "3°C", "4°A", "4°B", "4°C", "5°A", "5°B", "5°C", "6°A", "6°B", "6°C"];

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        type: student.type || 'Alumno',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        grade: student.grade || '1°A',
        legajo: student.legajo || '',
        dniType: student.dniType || 'DNI',
        dni: student.dni || '',
        sex: student.sex || 'M',
        phone: student.phone || '',
        cellphone: student.cellphone || '',
        altPhone: student.altPhone || '',
        email: student.email || '',
        instEmail: student.instEmail || '',
        birthDate: student.birthDate || ''
      });
    } else {
      setEditingStudent(null);
      setFormData({ 
        type: 'Alumno', firstName: '', lastName: '', grade: '1°A', legajo: '', 
        dniType: 'DNI', dni: '', sex: 'M', phone: '', cellphone: '', 
        altPhone: '', email: '', instEmail: '', birthDate: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const studentData = { ...formData, name: `${formData.firstName} ${formData.lastName}`.trim() };
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...studentData, id: s.id } : s));
    } else {
      setStudents([...students, { ...studentData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      if (deleteStudent) deleteStudent(deleteConfirm.id);
      setStudents(students.filter(s => s.id !== deleteConfirm.id));
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const parseCourse = (rawCourse) => {
    if (!rawCourse) return '1°A';
    const text = String(rawCourse);
    // Regex to match "1º "A"" or similar
    const match = text.match(/(\d)[º°]\s*["']?([A-C])["']?/i);
    if (match) {
      return `${match[1]}°${match[2].toUpperCase()}`;
    }
    return '1°A';
  };

  const downloadTemplate = () => {
    const headers = [
      "Curso", "Tipo", "Alumnos/Docentes en curso", "Nombre", "Apellido", "Sexo", "Tipo Doc.", "Doc.Nro", "Teléfono", "Celular", "Tel.Alternativo", "E-mail", "Email.Inst.", "Fec.Nac.", "Legajo"
    ];
    const example = [
      '1º "A" - (10) ELECTRÓNICA', "Alumno", "Alumno 1", "Juan", "Perez", "M", "DNI", "40123456", "45551234", "1544332211", "", "juan@gmail.com", "jperez@escuela.edu", "2005-05-20", "12345"
    ];
    const example2 = [
      'Cuerpo Docente', "Profesor/a", "Profesor 1", "Maria", "Gonzalez", "F", "DNI", "30123456", "", "1544332200", "", "maria@gmail.com", "mgonzalez@escuela.edu", "1980-10-15", "P99"
    ];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, example, example2]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Importar");
    XLSX.writeFile(wb, "plantilla_importacion_escuela.xlsx");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const newStudents = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0 || (!row[3] && !row[4])) continue;
          
          const rawCourse = row[0];
          const grade = parseCourse(rawCourse);
          const type = String(row[1] || 'Alumno').trim();
          const firstName = String(row[3] || '').trim();
          const lastName = String(row[4] || '').trim();

          newStudents.push({
            id: Date.now() + i,
            type,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            grade,
            sex: String(row[5] || 'M').trim(),
            dniType: String(row[6] || 'DNI').trim(),
            dni: String(row[7] || '').trim(),
            phone: String(row[8] || '').trim(),
            cellphone: String(row[9] || '').trim(),
            altPhone: String(row[10] || '').trim(),
            email: String(row[11] || '').trim(),
            instEmail: String(row[12] || '').trim(),
            birthDate: String(row[13] || '').trim(),
            legajo: String(row[14] || '').trim()
          });
        }

        if (newStudents.length > 0) {
          setStudents([...students, ...newStudents]);
          alert(`Se han importado ${newStudents.length} registros con éxito.`);
        }
      } catch (error) {
        alert('Error al procesar el archivo. Revisa el formato.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const filteredStudents = students.filter(s => {
    const fullSearch = `${s.name} ${s.dni} ${s.legajo} ${s.grade} ${s.type}`.toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl">Gestión de Usuarios</h1>
          <p className="text-muted text-sm mt-2">Personal y Alumnado de la institución</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Nuevo Usuario
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="glass-card" onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: '#4ade80' }}>
              <FileSpreadsheet size={20} /> Plantilla Oficial
            </button>
            <button className="glass-card" onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', color: 'white' }}>
              <Upload size={20} /> Importar Excel
            </button>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xlsx, .xls" onChange={handleFileChange} />
          </div>
        </div>
      </div>

      <div className="glass-card p-4 mb-8">
        <div className="relative">
          <Search className="absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            className="input-field" 
            style={{ paddingLeft: '3rem' }} 
            placeholder="Buscar por nombre, DNI, legajo, curso o tipo (Profesor, Alumno, Staff)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Usuario</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Curso/Rol</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Documento</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contacto</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover-card-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ 
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        width: '32px', height: '32px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {(student.lastName || student.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {student.lastName ? `${student.lastName}, ${student.firstName}` : (student.name || 'Sin Nombre')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>L: {student.legajo || '---'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div className="flex flex-col gap-1">
                      <div style={{ fontSize: '0.875rem' }}>{student.grade}</div>
                      <div style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase',
                        color: 
                          student.type === 'Profesor/a' ? 'var(--accent)' : 
                          student.type === 'Preceptor/a' ? 'var(--primary)' :
                          student.type === 'Staff' ? '#4ade80' :
                          'var(--secondary)'
                      }}>
                        {student.type || 'Alumno/a'}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {student.dniType}: {student.dni || '---'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2" style={{ fontSize: '0.8rem' }}>
                        <Mail size={12} className="text-muted" />
                        <span>{student.instEmail || student.email || '---'}</span>
                      </div>
                      <div className="flex items-center gap-2" style={{ fontSize: '0.8rem' }}>
                        <Phone size={12} className="text-muted" />
                        <span>{student.cellphone || student.phone || '---'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleOpenModal(student)} className="text-muted p-2" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-2" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredStudents.length === 0 && (
            <div className="py-20 text-center">
              <Users size={48} className="mx-auto mb-4 text-muted opacity-20" />
              <p className="text-xl text-muted">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }} />
          <div className="glass-card" style={{ maxWidth: '700px', width: '100%', padding: '2.5rem', position: 'relative', background: '#1e293b', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingStudent ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted block mb-1">Tipo de Usuario</label>
                  <select className="input-field" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="Alumno">Alumno</option>
                    <option value="Profesor/a">Profesor/a</option>
                    <option value="Preceptor/a">Preceptor/a</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Curso / División</label>
                  <select className="input-field" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})}>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Nombre</label>
                  <input className="input-field" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Apellido</label>
                  <input className="input-field" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Legajo</label>
                  <input className="input-field" value={formData.legajo} onChange={(e) => setFormData({...formData, legajo: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-xs text-muted block mb-1">Tipo Doc.</label>
                    <select className="input-field" value={formData.dniType} onChange={(e) => setFormData({...formData, dniType: e.target.value})}>
                      <option value="DNI">DNI</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted block mb-1">Nro Documento</label>
                    <input className="input-field" value={formData.dni} onChange={(e) => setFormData({...formData, dni: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Sexo</label>
                  <select className="input-field" value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value})}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="X">No Binario</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Fecha Nacimiento</label>
                  <input type="date" className="input-field" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Celular</label>
                  <input className="input-field" value={formData.cellphone} onChange={(e) => setFormData({...formData, cellphone: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Teléfono Fijo</label>
                  <input className="input-field" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted block mb-1">Email Institucional</label>
                  <input type="email" className="input-field" value={formData.instEmail} onChange={(e) => setFormData({...formData, instEmail: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="glass-card flex-1 py-3 text-white">Cancelar</button>
                <button type="submit" className="btn-primary flex-1 py-3">Guardar Registro</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <ConfirmDialog 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="¿Eliminar registro?"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción es permanente."
      />
    </div>
  );
};

export default AdminStudents;
