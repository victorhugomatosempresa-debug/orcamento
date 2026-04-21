/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ReactNode } from 'react';
import { 
  User, 
  Car, 
  Settings, 
  Plus, 
  Trash2, 
  FileText, 
  Wrench,
  Package,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
}

interface ClientInfo {
  name: string;
  vehicle: string;
  serviceType: string;
  date: string;
}

// --- Components ---

const UnderlineInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  error,
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  error?: string;
  icon?: any;
}) => (
  <div className="flex flex-col gap-0.5 w-full group">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={12} className={error ? "text-red-400" : "text-zinc-400"} />}
      <span className={`text-[9px] uppercase font-semibold tracking-wider font-sans ${error ? "text-red-500" : "text-zinc-400"}`}>
        {label}
      </span>
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border-b bg-transparent py-1 px-1 focus:outline-none transition-all text-sm font-medium w-full ${
        error ? "border-red-400 text-red-700" : "border-zinc-200 text-zinc-800 focus:border-[#1f1f1f]"
      }`}
    />
    {error && <span className="text-[8px] text-red-500 mt-0.5 font-medium">{error}</span>}
  </div>
);

const SectionTitle = ({ children, icon: Icon }: { children: ReactNode; icon: any }) => (
  <div className="flex items-center gap-2 mb-3">
    <Icon size={14} className="text-zinc-400" />
    <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono italic">{children}</h2>
  </div>
);

export default function App() {
  // --- State ---
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    vehicle: '',
    serviceType: '',
    date: new Date().toLocaleDateString('pt-BR'),
  });

  const [items, setItems] = useState<QuoteItem[]>([
    { id: '1', description: '', quantity: 1, unitValue: 0 }
  ]);

  const [laborCost, setLaborCost] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  
  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Calculations ---
  const partsTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitValue), 0);
  }, [items]);

  const grandTotal = useMemo(() => {
    return partsTotal + laborCost;
  }, [partsTotal, laborCost]);

  // --- Handlers ---
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!clientInfo.name.trim()) newErrors.name = 'Obrigatório';
    if (!clientInfo.vehicle.trim()) newErrors.vehicle = 'Obrigatório';
    if (!clientInfo.serviceType.trim()) newErrors.serviceType = 'Obrigatório';
    if (!remarks.trim()) newErrors.remarks = 'Obrigatório';

    items.forEach((item, index) => {
      if (!item.description.trim()) newErrors[`item_${index}_desc`] = 'Obrigatório';
      if (item.quantity <= 0) newErrors[`item_${index}_qty`] = 'Mín 1';
      if (item.unitValue < 0) newErrors[`item_${index}_val`] = 'Inválido';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addItem = () => {
    const newId = crypto.randomUUID();
    setItems([...items, { id: newId, description: '', quantity: 1, unitValue: 0 }]);
    setEditingId(newId);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    // Clear item specific error when user types
    if (errors) {
      const index = items.findIndex(i => i.id === id);
      const fieldKey = field === 'description' ? 'desc' : field === 'quantity' ? 'qty' : 'val';
      const errorKey = `item_${index}_${fieldKey}`;
      if (errors[errorKey]) {
        const nextErrors = { ...errors };
        delete nextErrors[errorKey];
        setErrors(nextErrors);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleGeneratePDF = () => {
    if (validate()) {
      alert("Orçamento validado com sucesso! Gerando PDF...");
    } else {
      alert("Por favor, corrija os erros no formulário antes de continuar.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200 flex flex-col font-sans antialiased overflow-x-hidden">
      <div className="w-full max-w-[420px] mx-auto bg-white shadow-2xl flex flex-col min-h-screen relative border-x border-zinc-300">
        {/* HEADER */}
        <header className="bg-[#1f1f1f] text-white p-5 flex items-start gap-4 shrink-0">
          <div className="w-12 h-12 bg-zinc-700 rounded-md flex items-center justify-center border border-zinc-600 shrink-0">
            <Wrench className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight leading-none uppercase">PORTUÁRIO CENTRO AUTOMOTIVO</h1>
            <p className="text-xs font-light italic text-zinc-400 mt-1 tracking-wide">Orçamento detalhado de serviço</p>
            <address className="not-italic text-[9px] text-zinc-500 mt-2 leading-tight">
              Av. Almirante Cochrane, 142 - Canal 5<br/>
              Santos - SP, 11040-002 | (13) 3227-9000
            </address>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-6 space-y-6 flex flex-col">
          
          {/* Client Info */}
          <section className="space-y-4">
            <SectionTitle icon={User}>Identificação do Cliente</SectionTitle>
            <div className="grid grid-cols-1 gap-y-4">
              <UnderlineInput 
                label="Cliente" 
                value={clientInfo.name} 
                onChange={(val) => {
                  setClientInfo({ ...clientInfo, name: val });
                  if (errors.name) setErrors(prev => { const n = {...prev}; delete n.name; return n; });
                }}
                placeholder="Nome completo do cliente"
                error={errors.name}
                icon={User}
              />
              <div className="grid grid-cols-2 gap-4">
                <UnderlineInput 
                  label="Veículo" 
                  value={clientInfo.vehicle} 
                  onChange={(val) => {
                    setClientInfo({ ...clientInfo, vehicle: val });
                    if (errors.vehicle) setErrors(prev => { const n = {...prev}; delete n.vehicle; return n; });
                  }}
                  placeholder="Marca / Modelo / Ano"
                  error={errors.vehicle}
                  icon={Car}
                />
                <UnderlineInput 
                  label="Tipo de Serviço" 
                  value={clientInfo.serviceType} 
                  onChange={(val) => {
                    setClientInfo({ ...clientInfo, serviceType: val });
                    if (errors.serviceType) setErrors(prev => { const n = {...prev}; delete n.serviceType; return n; });
                  }}
                  placeholder="Ex: Preventiva"
                  error={errors.serviceType}
                  icon={Settings}
                />
              </div>
            </div>
          </section>

          {/* Items Section */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <SectionTitle icon={Package}>Peças & Materiais</SectionTitle>
              <button 
                onClick={addItem}
                className="text-[9px] font-bold text-blue-600 border border-blue-600 px-3 py-1 rounded uppercase tracking-wider transition-all active:scale-95 hover:bg-blue-50"
              >
                + Adicionar Item
              </button>
            </div>
            
            <div className="flex flex-col border border-zinc-100 rounded-sm overflow-hidden flex-1 group/table">
              <div className="grid grid-cols-12 bg-zinc-50 border-b border-zinc-200 text-[8px] font-bold uppercase p-2 text-zinc-500 sticky top-0 z-10">
                <span className="col-span-5">Descrição</span>
                <span className="col-span-2 text-center">Qtd</span>
                <span className="col-span-2 text-right">Unit</span>
                <span className="col-span-3 text-right">Total</span>
              </div>
              
              <div className="divide-y divide-zinc-100 overflow-y-auto max-h-[320px]">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const isEditing = editingId === item.id;
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`grid grid-cols-12 p-2 items-center gap-1 transition-colors ${isEditing ? 'bg-blue-50/30' : 'bg-white hover:bg-zinc-50'}`}
                      >
                        {/* Description */}
                        <div className="col-span-5 relative group/field">
                          {isEditing ? (
                            <input 
                              autoFocus
                              value={item.description}
                              onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                              className={`w-full bg-white border rounded px-1 py-0.5 text-[10px] focus:ring-1 focus:ring-blue-400 outline-none ${errors[`item_${index}_desc`] ? 'border-red-400' : 'border-zinc-200'}`}
                            />
                          ) : (
                            <span className="text-[10px] font-medium text-zinc-700 truncate block">{item.description || <span className="text-zinc-300 italic">Vazio</span>}</span>
                          )}
                          {errors[`item_${index}_desc`] && <span className="absolute -bottom-2.5 left-0 text-[6px] text-red-500 font-bold uppercase">Erro</span>}
                        </div>

                        {/* Qty */}
                        <div className="col-span-2 text-center relative">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className={`w-full bg-white border rounded px-1 py-0.5 text-[10px] text-center outline-none ${errors[`item_${index}_qty`] ? 'border-red-400' : 'border-zinc-200'}`}
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-600">{item.quantity}</span>
                          )}
                        </div>

                        {/* Unit Value */}
                        <div className="col-span-2 text-right relative">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={item.unitValue}
                              onChange={(e) => updateItem(item.id, 'unitValue', parseFloat(e.target.value) || 0)}
                              className={`w-full bg-white border rounded px-1 py-0.5 text-[10px] text-right outline-none ${errors[`item_${index}_val`] ? 'border-red-400' : 'border-zinc-200'}`}
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-600">{item.unitValue.toFixed(0)}</span>
                          )}
                        </div>

                        {/* Total & Actions */}
                        <div className="col-span-3 flex items-center justify-end gap-2 group/actions">
                          {isEditing ? (
                            <button 
                              onClick={() => setEditingId(null)}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="Salvar"
                            >
                              <Plus className="rotate-45" size={12} /> {/* Using as checkmark alternative or just toggle */}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-zinc-900">{formatCurrency(item.quantity * item.unitValue)}</span>
                              <div className="flex opacity-0 group-hover/actions:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setEditingId(item.id)}
                                  className="p-1 text-blue-500 hover:text-blue-700"
                                  title="Editar"
                                >
                                  <Settings size={10} />
                                </button>
                                {items.length > 1 && (
                                  <button 
                                    onClick={() => removeItem(item.id)}
                                    className="p-1 text-red-400 hover:text-red-600"
                                    title="Remover"
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Labor Cost & Remarks */}
          <section className="space-y-4 pt-4 border-t border-zinc-100">
            <UnderlineInput 
              label="Mão de Obra Especializada" 
              value={laborCost.toString()} 
              onChange={(val) => setLaborCost(parseFloat(val) || 0)}
              placeholder="Valor da mão de obra"
              icon={Wrench}
            />
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className={`text-[9px] uppercase font-semibold ${errors.remarks ? "text-red-500" : "text-zinc-400"}`}>
                  Observações & Considerações Técnicas
                </span>
                {errors.remarks && <span className="text-[7px] text-red-500 font-bold uppercase">Campo Obrigatório</span>}
              </div>
              <textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (errors.remarks) setErrors(prev => { const n = {...prev}; delete n.remarks; return n; });
                }}
                placeholder="Ex: Garantia de 3 meses, prazo de entrega..."
                className={`w-full h-20 bg-zinc-50 border rounded p-2 text-[11px] focus:outline-none transition-all resize-none italic ${
                  errors.remarks ? "border-red-300 ring-1 ring-red-100" : "border-zinc-100 focus:ring-1 focus:ring-zinc-200"
                }`}
              />
            </div>
          </section>

          {/* Totals */}
          <div className="bg-zinc-50 p-4 rounded border border-zinc-100 flex flex-col gap-2 items-end">
            <div className="flex justify-between w-full max-w-[200px] text-[9px] uppercase font-bold text-zinc-500">
              <span className="flex items-center gap-1"><Package size={10}/> Peças:</span>
              <span className="text-zinc-900 font-mono">{formatCurrency(partsTotal)}</span>
            </div>
            <div className="flex justify-between w-full max-w-[200px] text-[9px] uppercase font-bold text-zinc-500">
              <span className="flex items-center gap-1"><Wrench size={10}/> Mão de Obra:</span>
              <span className="text-zinc-900 font-mono">{formatCurrency(laborCost)}</span>
            </div>
            <div className="bg-blue-600 text-white w-full mt-2 px-4 py-3 rounded flex justify-between items-center shadow-xl shadow-blue-100">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">Total do Investimento</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Valor Final</span>
              </div>
              <span className="text-xl font-black font-mono tracking-tighter">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleGeneratePDF}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-4 rounded shadow-lg uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 transition-all group"
          >
            <FileText size={14} className="group-hover:scale-110 transition-transform" />
            Salvar e Gerar Orçamento PDF
            <ChevronRight size={14} className="opacity-40 group-hover:translate-x-1 transition-transform" />
          </button>
        </main>

        <footer className="bg-[#1f1f1f] text-white py-4 flex justify-center border-t border-zinc-700 shrink-0">
          <p className="text-[8px] font-black tracking-[0.6em] opacity-60 uppercase">
            Performance - Precisão - Confiança
          </p>
        </footer>
      </div>
    </div>
  );
}
