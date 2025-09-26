'use client';

import { useState, useEffect, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

// Tipos de configuração atualizados para incluir os novos campos de pH
interface RelayConfig {
  relayIndex: number;
  mode: number;
  led_on_hour: number;
  led_off_hour: number;
  cycle_on_min: number;
  cycle_off_min: number;
  ph_pulse_sec: number;
  temp_threshold_on: number;
  temp_threshold_off: number;
  humidity_threshold_on: number;
  humidity_threshold_off: number;
  ec_threshold: number;
  ec_pulse_sec: number;
  ph_threshold_low: number;  // Campo antigo 'ph_threshold' foi substituído por este
  ph_threshold_high: number; // Novo campo para o limite superior de pH
}

interface AutomationCardProps {
  initialConfig: RelayConfig;
  onSave: (relayIndex: number, config: Partial<RelayConfig>) => Promise<void>;
}

// Opções de modo atualizadas com os novos modos de pH
const modeOptions = [
  { id: 0, name: 'Não Usado' },
  { id: 1, name: 'LED (Horário)' },
  { id: 2, name: 'Ciclo (Ligado/Desligado)' },
  { id: 3, name: 'Controle de pH (Subir pH)' },
  { id: 8, name: 'Controle de pH (Baixar pH)' }, // Novo modo (ID 8 para compatibilidade futura)
  { id: 4, name: 'Controle de Temperatura' },
  { id: 5, name: 'Controle de Umidade' },
  { id: 6, name: 'Controle de EC/TDS' },
];

export default function AutomationCard({ initialConfig, onSave }: AutomationCardProps) {
  const [config, setConfig] = useState(initialConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState(modeOptions.find(m => m.id === initialConfig.mode) || modeOptions[0]);

  // Sincroniza o estado interno se a prop inicial mudar (ex: após salvar)
  useEffect(() => {
    setConfig(initialConfig);
    setSelectedMode(modeOptions.find(m => m.id === initialConfig.mode) || modeOptions[0]);
  }, [initialConfig]);

  // Função chamada ao clicar no botão "Salvar"
  const handleSaveClick = async () => {
    setIsLoading(true);
    // Envia o estado local atualizado para a função onSave da página pai
    await onSave(config.relayIndex, { ...config, mode: selectedMode.id });
    setIsLoading(false);
  };

  // Funções seguras para atualizar o estado dos inputs, evitando erros de NaN
  const handleIntChange = (field: keyof RelayConfig, value: string) => {
    const numValue = parseInt(value, 10);
    setConfig({ ...config, [field]: isNaN(numValue) ? 0 : numValue });
  };

  const handleFloatChange = (field: keyof RelayConfig, value: string) => {
    const floatValue = parseFloat(value);
    setConfig({ ...config, [field]: isNaN(floatValue) ? 0 : floatValue });
  };

  // Renderiza os campos de formulário corretos com base no modo selecionado
  const renderSettings = () => {
    switch (selectedMode.id) {
      case 1: // Modo LED
        return (
          <>
            <label>Ligar às <input type="number" value={config.led_on_hour} onChange={e => handleIntChange('led_on_hour', e.target.value)} /></label>
            <label>Desligar às <input type="number" value={config.led_off_hour} onChange={e => handleIntChange('led_off_hour', e.target.value)} /></label>
          </>
        );
      case 2: // Modo Ciclo
        return (
          <>
            <label>Ligar por (min) <input type="number" value={config.cycle_on_min} onChange={e => handleIntChange('cycle_on_min', e.target.value)} /></label>
            <label>Desligar por (min) <input type="number" value={config.cycle_off_min} onChange={e => handleIntChange('cycle_off_min', e.target.value)} /></label>
          </>
        );
      case 3: // Modo pH Up (Subir pH)
      case 8: // Modo pH Down (Baixar pH)
        return (
          <>
            {selectedMode.id === 3 && (
              <label>Ativar se pH &lt; <input type="number" step="0.1" value={config.ph_threshold_low} onChange={e => handleFloatChange('ph_threshold_low', e.target.value)} /></label>
            )}
            {selectedMode.id === 8 && (
              <label>Ativar se pH &gt; <input type="number" step="0.1" value={config.ph_threshold_high} onChange={e => handleFloatChange('ph_threshold_high', e.target.value)} /></label>
            )}
            <label>Pulso por (seg) <input type="number" value={config.ph_pulse_sec} onChange={e => handleIntChange('ph_pulse_sec', e.target.value)} /></label>
          </>
        );
      case 4: // Modo Temperatura
        return (
          <>
            <label>Ligar se Temp &gt; <input type="number" step="0.1" value={config.temp_threshold_on} onChange={e => handleFloatChange('temp_threshold_on', e.target.value)} /></label>
            <label>Desligar se Temp &lt; <input type="number" step="0.1" value={config.temp_threshold_off} onChange={e => handleFloatChange('temp_threshold_off', e.target.value)} /></label>
          </>
        );
      case 5: // Modo Umidade
         return (
          <>
            <label>Ligar se Umidade &gt; <input type="number" step="0.1" value={config.humidity_threshold_on} onChange={e => handleFloatChange('humidity_threshold_on', e.target.value)} /></label>
            <label>Desligar se Umidade &lt; <input type="number" step="0.1" value={config.humidity_threshold_off} onChange={e => handleFloatChange('humidity_threshold_off', e.target.value)} /></label>
          </>
        );
      case 6: // Modo EC/TDS
        return (
          <>
            <label>Ativar se EC &lt; <input type="number" value={config.ec_threshold} onChange={e => handleFloatChange('ec_threshold', e.target.value)} /></label>
            <label>Pulso por (seg) <input type="number" value={config.ec_pulse_sec} onChange={e => handleIntChange('ec_pulse_sec', e.target.value)} /></label>
          </>
        );
      default:
        return <p className="text-gray-400">Este relé não está em uso.</p>;
    }
  };

  return (
    <div className="bg-gray-800/70 p-4 rounded-lg shadow-lg flex flex-col gap-4">
      <h3 className="text-lg font-bold text-cyan-300">Relé {config.relayIndex + 1}</h3>
      <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10">
        <label className="text-white font-medium w-full md:w-1/3 flex-shrink-0">Modo de Operação:</label>
        <Listbox value={selectedMode} onChange={setSelectedMode}>
          <div className="relative w-full md:w-2/3">
            <Listbox.Button className="relative w-full cursor-default rounded-md bg-gray-900 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <span className="block truncate">{selectedMode.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronUpDownIcon className="h-5 w-5 text-gray-400" /></span>
            </Listbox.Button>
            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                {modeOptions.map((mode) => (
                  <Listbox.Option key={mode.id} value={mode} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-cyan-600 text-white' : 'text-gray-300'}`}>
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{mode.name}</span>
                        {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400"><CheckIcon className="h-5 w-5" /></span>) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>
      <div className="flex flex-col gap-3 mt-4 settings-form">
        {renderSettings()}
      </div>
      <button onClick={handleSaveClick} disabled={isLoading} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-500">
        {isLoading ? 'Salvando...' : 'Salvar Configurações'}
      </button>

      <style jsx>{`
        .settings-form label { display: flex; justify-content: space-between; align-items: center; color: white; flex-wrap: wrap; gap: 0.5rem; }
        .settings-form input { background-color: #1f2937; color: white; border: 1px solid #4b5563; border-radius: 5px; padding: 8px; width: 100px; text-align: right; flex-shrink: 0; }
      `}</style>
    </div>
  );
}