"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Activity, Globe, Clock } from 'lucide-react';

// Données de surveillance temps réel
const REALTIME_DATA = [
  { timestamp: '2026-05-10T19:00:00Z', cas_cumules: 8, deces_cumules: 3, r_effectif: 0.4, zones_actives: 6 },
  { timestamp: '2026-05-10T19:15:00Z', cas_cumules: 8, deces_cumules: 3, r_effectif: 0.4, zones_actives: 6 },
  { timestamp: '2026-05-10T19:30:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
  { timestamp: '2026-05-10T19:45:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
  { timestamp: '2026-05-10T20:00:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
  { timestamp: '2026-05-10T20:15:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
  { timestamp: '2026-05-10T20:30:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
  { timestamp: '2026-05-10T20:45:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
  { timestamp: '2026-05-10T21:00:00Z', cas_cumules: 9, deces_cumules: 3, r_effectif: 0.5, zones_actives: 7 },
];

// Cartographie des risques géographiques
const RISK_ZONES = [
  { pays: 'Tenerife (ES)', lat: 28.0, lon: -16.5, niveau_risque: 'CRITIQUE', population_exposee: 147, statut: 'Évacuation en cours', priorite: 1 },
  { pays: 'France', lat: 46.6, lon: 2.2, niveau_risque: 'ÉLEVÉ', population_exposee: 5, statut: 'Isolement strict (1 symptomatique)', priorite: 2 },
  { pays: 'Johannesburg (ZA)', lat: -26.2, lon: 28.0, niveau_risque: 'ÉLEVÉ', population_exposee: 2, statut: 'Soins ICU', priorite: 3 },
  { pays: 'Nebraska (US)', lat: 41.3, lon: -95.9, niveau_risque: 'MODÉRÉ', population_exposee: 18, statut: 'Quarantaine spécialisée', priorite: 4 },
  { pays: 'Madrid (ES)', lat: 40.4, lon: -3.7, niveau_risque: 'MODÉRÉ', population_exposee: 13, statut: 'Quarantaine', priorite: 5 },
  { pays: 'Zurich (CH)', lat: 47.4, lon: 8.5, niveau_risque: 'MODÉRÉ', population_exposee: 1, statut: 'Hospitalisation', priorite: 6 },
  { pays: 'Argentine (endémique)', lat: -34.6, lon: -64.0, niveau_risque: 'ENDÉMIQUE', population_exposee: 1000000, statut: 'Surveillance renforcée', priorite: 7 },
];

const INDICATORS_LIVE = {
  transmission_status: 'LIMITÉE',
  r_effectif: 0.5,
  doubling_time: 'N/A (cluster fini)',
  attack_rate: '6.1%',
  secondary_cases: 7,
  generation_time: '5-8 jours',
  last_update: '2026-05-10T21:00:00Z'
};

export function VisualisationTempsReel() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMetric, setSelectedMetric] = useState<'cas_cumules' | 'r_effectif' | 'zones_actives'>('cas_cumules');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' UTC';
  };

  const getCouleurRisque = (niveau: string): string => {
    const couleurs: Record<string, string> = {
      'CRITIQUE': '#dc2626',
      'ÉLEVÉ': '#f59e0b', 
      'MODÉRÉ': '#10b981',
      'ENDÉMIQUE': '#6366f1'
    };
    return couleurs[niveau] || '#64748b';
  };

  // Tri des zones par priorité
  const zonesSortees = [...RISK_ZONES].sort((a, b) => a.priorite - b.priorite);

  return (
    <div className="animate-slide-in" style={{ 
      backgroundColor: '#0a0e14', 
      border: '1px solid var(--promethean-blue)', 
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header temps réel */}
      <div style={{ 
        padding: '20px 32px', 
        borderBottom: '1px solid var(--promethean-blue)',
        background: 'linear-gradient(135deg, var(--promethean-blue) 0%, var(--success) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="animate-pulse" style={{
            width: '32px', height: '32px', backgroundColor: 'var(--success)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={18} color="#fff" />
          </div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            margin: 0, 
            color: '#f1f5f9',
            letterSpacing: '-0.01em'
          }}>
            SURVEILLANCE TEMPS RÉEL
          </h3>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#f1f5f9'
        }}>
          <Clock size={14} />
          <span>LIVE · {formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Indicateurs clés temps réel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', backgroundColor: 'var(--promethean-blue)' }}>
        {[
          { 
            label: 'R effectif', 
            value: INDICATORS_LIVE.r_effectif, 
            trend: 'stable', 
            desc: 'Transmission actuelle',
            color: INDICATORS_LIVE.r_effectif < 1 ? 'var(--success)' : 'var(--warning)'
          },
          { 
            label: 'Taux d\'attaque', 
            value: INDICATORS_LIVE.attack_rate, 
            trend: 'plateau', 
            desc: 'Sur population exposée',
            color: 'var(--error)'
          },
          { 
            label: 'Zones actives', 
            value: RISK_ZONES.filter(z => z.niveau_risque !== 'ENDÉMIQUE').length, 
            trend: 'déclin', 
            desc: 'Avec cas actifs',
            color: 'var(--warning)'
          },
          { 
            label: 'Statut transmission', 
            value: INDICATORS_LIVE.transmission_status, 
            trend: 'contrôlé', 
            desc: 'Évaluation globale',
            color: 'var(--success)'
          },
        ].map((ind, i) => (
          <div key={i} style={{ backgroundColor: '#0a0e14', padding: '20px' }}>
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--promethean-gray)', 
              fontFamily: 'JetBrains Mono, monospace', 
              letterSpacing: '0.1em',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              {ind.label}
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              color: ind.color, 
              lineHeight: 1,
              marginBottom: '6px'
            }}>
              {ind.value}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: 'var(--promethean-gray)', 
              fontFamily: 'JetBrains Mono, monospace',
              marginBottom: '4px'
            }}>
              {ind.desc}
            </div>
            <div style={{
              fontSize: '9px',
              color: ind.color,
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              opacity: 0.8
            }}>
              ▲ {ind.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Courbe temps réel */}
      <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--promethean-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            margin: 0, 
            color: '#f1f5f9',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            ÉVOLUTION 12H (AUTO-REFRESH 15min)
          </h4>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { key: 'cas_cumules' as const, label: 'CAS' },
              { key: 'r_effectif' as const, label: 'R(t)' },
              { key: 'zones_actives' as const, label: 'ZONES' }
            ].map(metric => (
              <button
                key={metric.key}
                onClick={() => setSelectedMetric(metric.key)}
                style={{
                  backgroundColor: selectedMetric === metric.key ? 'var(--promethean-blue)' : 'transparent',
                  color: selectedMetric === metric.key ? '#f1f5f9' : 'var(--promethean-gray)',
                  border: '1px solid #334155',
                  padding: '6px 12px',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Graphique SVG */}
        <div style={{ width: '100%', height: '160px', backgroundColor: '#050810', border: '1px solid #1e293b', padding: '16px', borderRadius: '4px' }}>
          <svg viewBox="0 0 400 120" style={{ width: '100%', height: '100%' }}>
            {/* Grille */}
            {[0, 0.25, 0.5, 0.75, 1].map(y => (
              <line key={y} x1="40" y1={20 + y * 80} x2="380" y2={20 + y * 80} stroke="#1e293b" strokeWidth="1" />
            ))}
            
            {/* Données */}
            {REALTIME_DATA.map((d, i) => {
              if (i === 0) return null;
              const prev = REALTIME_DATA[i - 1];
              const x1 = 40 + ((i - 1) / (REALTIME_DATA.length - 1)) * 340;
              const x2 = 40 + (i / (REALTIME_DATA.length - 1)) * 340;
              
              let y1, y2;
              if (selectedMetric === 'cas_cumules') {
                y1 = 100 - (prev.cas_cumules / 10) * 80;
                y2 = 100 - (d.cas_cumules / 10) * 80;
              } else if (selectedMetric === 'r_effectif') {
                y1 = 100 - prev.r_effectif * 80;
                y2 = 100 - d.r_effectif * 80;
              } else {
                y1 = 100 - (prev.zones_actives / 8) * 80;
                y2 = 100 - (d.zones_actives / 8) * 80;
              }
              
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--promethean-blue)" strokeWidth="2" />
                  <circle cx={x2} cy={y2} r="3" fill="var(--promethean-blue)" />
                </g>
              );
            })}
            
            {/* Labels temps */}
            <text x="40" y="115" fill="var(--promethean-gray)" fontSize="9" fontFamily="JetBrains Mono, monospace">19:00</text>
            <text x="380" y="115" fill="var(--promethean-gray)" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="end">21:00</text>
          </svg>
        </div>
      </div>

      {/* Heatmap zones de risque */}
      <div style={{ padding: '24px 32px' }}>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: 600, 
          margin: '0 0 16px 0', 
          color: '#f1f5f9',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Globe size={14} color="var(--warning)" />
          CARTOGRAPHIE DES RISQUES
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {zonesSortees.map((zone, i) => (
            <div key={i} className="animate-fade-in" style={{ 
              backgroundColor: '#050810', 
              border: '1px solid #1e293b',
              borderLeft: `4px solid ${getCouleurRisque(zone.niveau_risque)}`,
              padding: '16px',
              borderRadius: '4px',
              animationDelay: `${i * 100}ms`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>
                    {zone.pays}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {zone.lat.toFixed(1)}°, {zone.lon.toFixed(1)}°
                  </div>
                </div>
                <span style={{ 
                  fontSize: '9px', 
                  fontFamily: 'JetBrains Mono, monospace',
                  color: getCouleurRisque(zone.niveau_risque),
                  backgroundColor: `${getCouleurRisque(zone.niveau_risque)}20`,
                  padding: '3px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.05em'
                }}>
                  {zone.niveau_risque}
                </span>
              </div>
              
              <div style={{ fontSize: '16px', fontWeight: 600, color: getCouleurRisque(zone.niveau_risque), marginBottom: '6px' }}>
                {zone.population_exposee.toLocaleString()} exp.
              </div>
              
              <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', lineHeight: 1.4 }}>
                {zone.statut}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer dernière mise à jour */}
        <div style={{ 
          marginTop: '16px', 
          fontSize: '10px', 
          color: 'var(--promethean-gray)', 
          fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'center',
          padding: '12px',
          backgroundColor: '#050810',
          border: '1px solid #1e293b',
          borderRadius: '4px'
        }}>
          <TrendingUp size={12} style={{ display: 'inline', marginRight: '6px' }} />
          Dernière synchronisation sources : {new Date(INDICATORS_LIVE.last_update).toLocaleString('fr-FR')} 
          · Prochain refresh automatique : {new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
