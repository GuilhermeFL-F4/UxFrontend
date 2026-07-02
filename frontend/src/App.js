import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'https://uxbackend.onrender.com';

function App() {
  const [coletas, setColetas] = useState([]);
  const [form, setForm] = useState({ tipoDocumento: 'CPF', documento: '', data: '', endereco: '' });
  const [pesoInput, setPesoInput] = useState({});

  // Carrega as demandas do dia
  const carregarColetas = async () => {
    const response = await axios.get(`${API_URL}/agendamentos/hoje`);
    setColetas(response.data);
  };

  useEffect(() => {
    carregarColetas();
  }, []);

  // UX: Fluxo de Agendamento
  const handleAgendar = async (e) => {
    e.preventDefault();
    await axios.post(`${API_URL}/agendamentos`, form);
    setForm({ tipoDocumento: 'CPF', documento: '', data: '', endereco: '' });
    carregarColetas();
  };

  // UX: Fluxo do Motorista
  const handleColetar = async (id) => {
    await axios.patch(`${API_URL}/agendamentos/${id}/coletar`);
    carregarColetas();
  };

  // UX: Fluxo do ADM e Declaração
  const handleRegistrarPeso = async (id) => {
    const peso = pesoInput[id];
    if (!peso) return alert("Insira o peso antes de confirmar.");
    
    await axios.patch(`${API_URL}/agendamentos/${id}/peso`, { peso: parseFloat(peso) });
    alert("Peso registrado! Declaração gerada (PDF/Email).");
    carregarColetas();
  };

  return (
    <div className="container">
      <header>
        <h1>Gerenciamento de Resíduos Eletrônicos</h1>
      </header>

      <div className="dashboard">
        {/* Painel do Usuário (Agendamento) */}
        <section className="panel">
          <h2>1. Novo Agendamento</h2>
          <form onSubmit={handleAgendar}>
            <select value={form.tipoDocumento} onChange={e => setForm({...form, tipoDocumento: e.target.value})}>
              <option value="CPF">Pessoa Física (CPF - até 5kg)</option>
              <option value="CNPJ">Pessoa Jurídica (CNPJ - mais de 50kg)</option>
            </select>
            <input placeholder="Documento" value={form.documento} onChange={e => setForm({...form, documento: e.target.value})} required />
            <input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} required />
            <input placeholder="Endereço da Coleta" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} required />
            <button type="submit">Agendar Coleta</button>
          </form>
        </section>

        {/* Painel do Motorista e ADM (Jornada) */}
        <section className="panel">
          <h2>2. Jornada da Coleta (Motorista & ADM)</h2>
          {coletas.map(coleta => (
            <div key={coleta.id} className="card">
              <p><strong>ID:</strong> {coleta.id} | <strong>{coleta.tipoDocumento}:</strong> {coleta.documento}</p>
              <p><strong>Status:</strong> <span className={`badge ${coleta.status.toLowerCase()}`}>{coleta.status}</span></p>
              
              <div className="actions">
                {coleta.status === 'AGENDADO' && (
                  <button onClick={() => handleColetar(coleta.id)} className="btn-motorista">
                    Ação Motorista: Marcar como Coletado
                  </button>
                )}

                {coleta.status === 'COLETADO' && (
                  <div className="adm-action">
                    <input 
                      type="number" 
                      placeholder="Peso (Kg)" 
                      onChange={e => setPesoInput({...pesoInput, [coleta.id]: e.target.value})} 
                    />
                    <button onClick={() => handleRegistrarPeso(coleta.id)} className="btn-adm">
                      Ação ADM: Salvar Peso & Gerar Declaração
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;
