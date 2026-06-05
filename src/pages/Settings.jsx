import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, ExternalLink } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { contactsStore, settingsStore } from '../utils/storage'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export default function Settings() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState(() => contactsStore.getAll())
  const [settings, setSettings] = useState(() => settingsStore.get())
  const [newContact, setNewContact] = useState({ name: '', phone: '', apiKey: '' })
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)

  function saveContacts(updated) {
    contactsStore.save(updated)
    setContacts(updated)
  }

  function addContact() {
    if (!newContact.name || !newContact.phone || !newContact.apiKey) return
    const phone = newContact.phone.startsWith('+') ? newContact.phone : `+55${newContact.phone.replace(/\D/g, '')}`
    saveContacts([...contacts, { ...newContact, phone, id: uuid() }])
    setNewContact({ name: '', phone: '', apiKey: '' })
    setShowForm(false)
  }

  function removeContact(id) {
    saveContacts(contacts.filter(c => c.id !== id))
  }

  function saveSettings() {
    settingsStore.save(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="safe-top sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">Configurações</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-10">
        {/* WhatsApp Contacts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Contatos WhatsApp</h2>
            <button onClick={() => setShowForm(s => !s)} className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300">
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          {/* How to get API key */}
          <div className="bg-slate-800/60 border border-yellow-500/20 rounded-xl p-3 mb-3">
            <p className="text-xs text-yellow-300 font-medium mb-1">Como obter a API key do CallMeBot:</p>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Adicione o número <strong className="text-white">+34 644 44 84 24</strong> nos seus contatos</li>
              <li>Envie a mensagem: <strong className="text-white">I allow callmebot to send me messages</strong></li>
              <li>Você receberá sua API key pelo WhatsApp em instantes</li>
              <li>Repita para cada familiar que deverá receber alertas</li>
            </ol>
            <a
              href="https://www.callmebot.com/blog/free-api-whatsapp-messages/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 mt-2 hover:text-blue-300"
            >
              <ExternalLink size={12} />
              Documentação CallMeBot
            </a>
          </div>

          {showForm && (
            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-4 mb-3 space-y-3">
              <Input label="Nome" placeholder="Mãe, Pai, Esposa..." value={newContact.name}
                onChange={e => setNewContact(n => ({ ...n, name: e.target.value }))} />
              <Input label="Telefone (com DDD)" placeholder="+5511999999999" value={newContact.phone}
                onChange={e => setNewContact(n => ({ ...n, phone: e.target.value }))} />
              <Input label="API Key CallMeBot" placeholder="123456" value={newContact.apiKey}
                onChange={e => setNewContact(n => ({ ...n, apiKey: e.target.value }))} />
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={addContact}>Salvar</Button>
              </div>
            </div>
          )}

          {contacts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nenhum contato cadastrado</p>
          ) : (
            <div className="space-y-2">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.phone}</p>
                  </div>
                  <button onClick={() => removeContact(c.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-sm font-semibold text-white mb-3">Preferências</h2>
          <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Alertar prazos com antecedência de
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="1" max="14" value={settings.alertDaysBeforeDue}
                  onChange={e => setSettings(s => ({ ...s, alertDaysBeforeDue: parseInt(e.target.value) }))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-bold w-12 text-right">{settings.alertDaysBeforeDue} dias</span>
              </div>
            </div>

            <Select
              label="Moeda padrão"
              value={settings.defaultCurrency}
              onChange={e => setSettings(s => ({ ...s, defaultCurrency: e.target.value }))}
            >
              {['BRL', 'USD', 'EUR', 'ARS', 'CLP', 'PEN', 'COP', 'GBP'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>

            <Button onClick={saveSettings} className="w-full" variant={saved ? 'success' : 'primary'}>
              {saved ? '✅ Salvo!' : 'Salvar preferências'}
            </Button>
          </div>
        </section>

        {/* App info */}
        <section className="text-center text-xs text-slate-600 pt-4">
          <p>Viagens — Controle de Gastos v1.0</p>
          <p>Dados armazenados no dispositivo</p>
        </section>
      </div>
    </div>
  )
}
