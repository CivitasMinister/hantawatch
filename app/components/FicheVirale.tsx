"use client";

import React, { useState } from 'react';
import { Activity, TrendingUp, Shield, BarChart3, Globe, Users, AlertTriangle, ExternalLink } from 'lucide-react';

// Données épidémiologiques ANDV (sources : CDC, PAHO, Lancet, NEJM)
const ANDV_DATA = {
  classification: {
    famille: "Hantaviridae",
    genre: "Orthohantavirus",
    espece: "Andes orthohantavirus",
    code: "ANDV",
    decouverte: "1993, Argentine (Oran, Salta)",
  },
  epidemio: {
    reservoir_principal: "Oligoryzomys longicaudatus (souris à longue queue)",
    distribution: "Cône Sud : Argentine, Chili, Uruguay, Paraguay, Bolivie",
    transmission_r0: "0.3-0.7 (interhumaine limitée)",
    cfr_historique: "32-40% (Argentine), 37% (Chili), 38% (cluster Hondius)",
    incubation: "4-42 jours (médiane 14-21j)",
    periode_contagieuse: "Phase aiguë uniquement (fièvre + détresse respiratoire)",
  },
  clinique: {
    syndrome: "Syndrome Pulmonaire à Hantavirus (SPH)",
    phase1: "Prodromique (3-6j) : fièvre, myalgies, maux de tête",
    phase2: "Cardio-pulmonaire : SDRA, choc, œdème pulmonaire non-cardiogénique",
    phase3: "Convalescence ou décès (48-72h après onset pulmonaire)",
    biomarqueurs: "Thrombocytopénie, hémoconcentration, leucocytose",
  },
  prevention: {
    prophylaxis: "Aucun vaccin disponible",
    traitement: "Soins de support, ventilation mécanique précoce si nécessaire",
    mesures: "Évitement rongeurs, désinfection, EPI en milieu médical",
    isolement: "Contact étroit + précautions gouttelettes (ANDV uniquement)",
  }
};

const TRANSMISSION_DATA = [
  { mode: "Aérosols (urine/fèces rongeurs)", risque: "ÉLEVÉ", freq: "95%", desc: "Voie principale. Nettoyage à sec, balayage sans masque.", couleur: "#dc2626" },
  { mode: "Contact direct (morsures)", risque: "MODÉRÉ", freq: "3%", desc: "Manipulation rongeurs vivants ou morts.", couleur: "#f59e0b" },
  { mode: "Interhumaine (ANDV)", risque: "FAIBLE", freq: "2%", desc: "Contact prolongé, intime. Documentée uniquement pour ANDV.", couleur: "#10b981" },
  { mode: "Arthropodes", risque: "NUL", freq: "0%", desc: "Aucune transmission vectorielle démontrée.", couleur: "#64748b" },
];

const CFR_COMPARATIF = [
  { souche: "Andes (ANDV)", region: "Argentine", cfr: 36, cas_annuels: 100, source: "MinSalud AR 2019-2024" },
  { souche: "Andes (ANDV)", region: "Chili", cfr: 37, cas_annuels: 40, source: "MINSAL CL 2019-2024" },
  { souche: "Sin Nombre (SNV)", region: "USA Sud-Ouest", cfr: 38, cas_annuels: 25, source: "CDC 2019-2024" },
  { souche: "Puumala", region: "Europe", cfr: 0.4, cas_annuels: 3000, source: "ECDC 2019-2024" },
  { souche: "Dobrava", region: "Balkans", cfr: 12, cas_annuels: 150, source: "WHO Europe 2019-2024" },
];

const FACTEURS_RISQUE = [
  { facteur: "Activité rurale/forestière", risque: "ÉLEVÉ", population: "Agriculteurs, bûcherons", prevention: "EPI, ventilation espaces", niveau: "#dc2626" },
  { facteur: "Nettoyage bâtiments abandonnés", risque: "ÉLEVÉ", population: "Ouvriers, déménageurs", prevention: "Masque P2, humidification préalable", niveau: "#dc2626" },
  { facteur: "Camping/randonnée zones endémiques", risque: "MODÉRÉ", population: "Touristes, scouts", prevention: "Éviter cabanes, stocker nourriture", niveau: "#f59e0b" },
  { facteur: "Contact cas ANDV", risque: "MODÉRÉ", population: "Famille, soignants", prevention: "Isolement, précautions contact", niveau: "#f59e0b" },
];

export function FicheVirale() {
  const [activeSection, setActiveSection] = useState<'epidemio' | 'transmission' | 'clinique' | 'prevention'>('epidemio');

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'epidemio':
        return (
          <div className="animate-slide-in">
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#f1f5f9' }}>
              ÉPIDÉMIOLOGIE
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--promethean-gray)', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  Réservoir & Distribution
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>Réservoir :</strong> {ANDV_DATA.epidemio.reservoir_principal}<br/>
                  <strong>Zone :</strong> {ANDV_DATA.epidemio.distribution}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--promethean-gray)', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  Paramètres de transmission
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
                  <strong>R₀ :</strong> {ANDV_DATA.epidemio.transmission_r0}<br/>
                  <strong>Incubation :</strong> {ANDV_DATA.epidemio.incubation}
                </div>
              </div>
            </div>
            
            {/* Tableau comparatif CFR */}
            <div style={{ marginTop: '24px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#f1f5f9' }}>
                Létalité comparative (2019-2024)
              </h5>
              <div style={{ border: '1px solid #1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '2fr 2fr 80px 100px 2fr', 
                  gap: '16px',
                  padding: '12px 20px', 
                  backgroundColor: '#050810',
                  fontSize: '10px', 
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--promethean-gray)', 
                  letterSpacing: '0.1em',
                  borderBottom: '1px solid #1e293b',
                  textTransform: 'uppercase'
                }}>
                  <span>Souche</span><span>Région</span><span>CFR</span><span>Cas/an</span><span>Source</span>
                </div>
                
                {CFR_COMPARATIF.map((c, i) => (
                  <div key={i} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 2fr 80px 100px 2fr', 
                    gap: '16px',
                    padding: '14px 20px', 
                    borderBottom: i < CFR_COMPARATIF.length - 1 ? '1px solid #1e293b' : 'none',
                    alignItems: 'center',
                    backgroundColor: c.souche.includes('Andes') ? '#1a0a0a' : 'transparent'
                  }}>
                    <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>
                      {c.souche}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {c.region}
                    </span>
                    <span style={{ 
                      fontSize: '14px', 
                      color: c.cfr >= 30 ? '#dc2626' : c.cfr >= 10 ? '#f59e0b' : '#10b981',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontWeight: 600
                    }}>
                      {c.cfr}%
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {c.cas_annuels}
                    </span>
                    <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                      {c.source}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'transmission':
        return (
          <div className="animate-slide-in">
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#f1f5f9' }}>
              MODES DE TRANSMISSION
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {TRANSMISSION_DATA.map((t, i) => (
                <div key={i} style={{ 
                  backgroundColor: '#050810', 
                  border: '1px solid #1e293b',
                  padding: '16px',
                  borderLeft: `3px solid ${t.couleur}`,
                  borderRadius: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: '#cbd5e1' }}>
                      {t.mode}
                    </span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontFamily: 'JetBrains Mono, monospace',
                      color: t.couleur,
                      backgroundColor: `${t.couleur}20`,
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {t.risque}
                    </span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: t.couleur, marginBottom: '4px' }}>
                    {t.freq}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', lineHeight: 1.4 }}>
                    {t.desc}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Facteurs de risque */}
            <div style={{ marginTop: '24px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#f1f5f9' }}>
                Facteurs de risque populationnels
              </h5>
              {FACTEURS_RISQUE.map((f, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 2fr 3fr',
                  gap: '16px',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: '#050810',
                  border: '1px solid #1e293b',
                  borderLeft: `3px solid ${f.niveau}`,
                  borderRadius: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>{f.facteur}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    color: f.niveau,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 600
                  }}>{f.risque}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{f.population}</span>
                  <span style={{ fontSize: '11px', color: 'var(--promethean-gray)' }}>{f.prevention}</span>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'clinique':
        return (
          <div className="animate-slide-in">
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#f1f5f9' }}>
              PRÉSENTATION CLINIQUE
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--promethean-gray)', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  Évolution clinique
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 500 }}>Phase 1 (prodromique)</span><br/>
                    {ANDV_DATA.clinique.phase1}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#dc2626', fontWeight: 500 }}>Phase 2 (cardio-pulmonaire)</span><br/>
                    {ANDV_DATA.clinique.phase2}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--promethean-gray)', fontWeight: 500 }}>Phase 3</span><br/>
                    {ANDV_DATA.clinique.phase3}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--promethean-gray)', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  Biomarqueurs diagnostiques
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <strong>Biologie :</strong> {ANDV_DATA.clinique.biomarqueurs}<br/><br/>
                  <strong>Imagerie :</strong> Infiltrats pulmonaires bilatéraux, œdème interstitiel<br/><br/>
                  <strong>Sérologie :</strong> IgM ELISA (sensible dès J3), PCR (phase aiguë)
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'prevention':
        return (
          <div className="animate-slide-in">
            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#f1f5f9' }}>
              PRÉVENTION & CONTRÔLE
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: '#050810', border: '1px solid #1e293b', padding: '20px', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--promethean-gray)', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  Prophylaxis
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#dc2626', fontWeight: 500 }}>Vaccin :</span><br/>
                    {ANDV_DATA.prevention.prophylaxis}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#10b981', fontWeight: 500 }}>Traitement :</span><br/>
                    {ANDV_DATA.prevention.traitement}
                  </div>
                </div>
              </div>
              
              <div style={{ backgroundColor: '#050810', border: '1px solid #1e293b', padding: '20px', borderRadius: '4px' }}>
                <div style={{ fontSize: '12px', color: 'var(--promethean-gray)', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>
                  Mesures de contrôle
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: 500 }}>Isolement :</span><br/>
                    {ANDV_DATA.prevention.isolement}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ color: '#6366f1', fontWeight: 500 }}>EPI :</span><br/>
                    Masque P2, gants, surblouse, protection oculaire
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recommandations par contexte */}
            <div style={{ marginTop: '20px', backgroundColor: '#0f1419', border: '1px solid #f59e0b', borderRadius: '4px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <AlertTriangle size={16} color="#f59e0b" />
                <span style={{ fontSize: '12px', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, textTransform: 'uppercase' }}>
                  Recommandations spéciales ANDV
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5 }}>
                <strong>Contrairement aux autres hantavirus,</strong> ANDV peut se transmettre d'humain à humain. 
                Isolement contact + gouttelettes requis pour tous les cas suspects. 
                Surveillance des contacts familiaux pendant 42 jours. 
                Personnel soignant : EPI complet + formation spécifique.
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#0a0e14', 
      border: '1px solid var(--promethean-blue)', 
      fontFamily: 'Inter, sans-serif',
      color: '#e2e8f0',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '24px 32px', 
        borderBottom: '1px solid var(--promethean-blue)',
        background: 'linear-gradient(135deg, var(--promethean-blue) 0%, #0f172a 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{
            width: '40px', height: '40px', backgroundColor: '#dc2626', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Activity size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontSize: '24px', 
              fontWeight: 700, 
              margin: 0, 
              color: '#f1f5f9',
              letterSpacing: '-0.02em'
            }}>
              FICHE VIRALE — ANDES ORTHOHANTAVIRUS
            </h2>
            <div style={{ 
              fontSize: '12px', 
              color: '#94a3b8', 
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: '4px'
            }}>
              Classification ICTV · Mise à jour 10 mai 2026 · Sourcing scientifique
            </div>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          fontSize: '11px', 
          fontFamily: 'JetBrains Mono, monospace',
          color: '#cbd5e1',
          flexWrap: 'wrap'
        }}>
          <span>FAMILLE: {ANDV_DATA.classification.famille}</span>
          <span>GENRE: {ANDV_DATA.classification.genre}</span>
          <span>CODE: {ANDV_DATA.classification.code}</span>
          <span>DÉCOUVERTE: {ANDV_DATA.classification.decouverte}</span>
        </div>
      </div>

      {/* Indicateurs clés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', backgroundColor: 'var(--promethean-blue)' }}>
        {[
          { label: 'CFR observée', value: ANDV_DATA.epidemio.cfr_historique.split(' ')[0], desc: 'Létalité', color: '#dc2626', icon: TrendingUp },
          { label: 'Transmission R₀', value: ANDV_DATA.epidemio.transmission_r0.split(' ')[0], desc: 'Interhumaine limitée', color: '#f59e0b', icon: Users },
          { label: 'Incubation', value: '14-21j', desc: '4-42 jours étendue', color: '#6366f1', icon: BarChart3 },
          { label: 'Réservoir', value: 'O. longicaudatus', desc: 'Rongeur principal', color: '#10b981', icon: Globe },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ backgroundColor: '#0a0e14', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon size={14} color={stat.color} />
                <span style={{ 
                  fontSize: '10px', 
                  color: 'var(--promethean-gray)', 
                  fontFamily: 'JetBrains Mono, monospace', 
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 600, 
                color: stat.color, 
                lineHeight: 1,
                marginBottom: '6px'
              }}>
                {stat.value}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'var(--promethean-gray)', 
                fontFamily: 'JetBrains Mono, monospace' 
              }}>
                {stat.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation par onglets */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--promethean-blue)', backgroundColor: '#050810' }}>
        {[
          { key: 'epidemio' as const, label: 'ÉPIDÉMIOLOGIE', icon: BarChart3 },
          { key: 'transmission' as const, label: 'TRANSMISSION', icon: TrendingUp },
          { key: 'clinique' as const, label: 'CLINIQUE', icon: Activity },
          { key: 'prevention' as const, label: 'PRÉVENTION', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              style={{
                backgroundColor: activeSection === tab.key ? 'var(--promethean-blue)' : 'transparent',
                color: activeSection === tab.key ? '#f1f5f9' : 'var(--promethean-gray)',
                border: 'none',
                padding: '16px 20px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                flex: 1,
                justifyContent: 'center'
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenu de la section active */}
      <div style={{ padding: '24px 32px', minHeight: '400px' }}>
        {renderSectionContent()}
      </div>

      {/* Footer sources */}
      <div style={{ 
        padding: '16px 32px', 
        backgroundColor: '#050810',
        borderTop: '1px solid var(--promethean-blue)'
      }}>
        <div style={{ 
          fontSize: '10px', 
          color: 'var(--promethean-gray)', 
          fontFamily: 'JetBrains Mono, monospace',
          lineHeight: 1.5
        }}>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>SOURCES SCIENTIFIQUES:</span> CDC Hantavirus Guidelines 2024, 
          PAHO Epidemiological Alert 2025, Lancet Infect Dis 2024;24(3), NEJM 2023;389(12), 
          ECDC Risk Assessment 2024, Argentine MinSalud Surveillance Data 2019-2024, 
          MINSAL Chile Epidemiological Bulletins 2019-2024. 
          <span style={{ color: '#f59e0b' }}>Dernière révision: 10 mai 2026.</span>
        </div>
      </div>
    </div>
  );
}
