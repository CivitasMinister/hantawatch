import { supabase, Foyer, TimelineEvent, Case, FALLBACK_DATA } from '@/lib/supabase';
import { ArrowLeft, Radio, Clock, AlertTriangle, TrendingUp, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60;

// Données de fallback pour la page fiche
const FALLBACK_TIMELINE = [
  { id: '1', foyer_id: 'hondius-2026', date_evt: '2026-04-01', evenement: 'Départ du MV Hondius depuis Ushuaia (Argentine) avec 147 personnes à bord', type_evt: 'depart', source_nom: 'WHO DON599', source_url: null },
  { id: '2', foyer_id: 'hondius-2026', date_evt: '2026-04-11', evenement: 'Premier décès à bord — citoyen néerlandais (cas index présumé)', type_evt: 'mort', source_nom: 'Wikipedia/WHO', source_url: null },
  { id: '3', foyer_id: 'hondius-2026', date_evt: '2026-04-24', evenement: 'Escale Saint-Hélène : 30 passagers débarquent. Corps du cas 1 débarqué.', type_evt: 'escale', source_nom: 'UKHSA/WHO', source_url: null },
  { id: '4', foyer_id: 'hondius-2026', date_evt: '2026-04-26', evenement: 'Décès du cas 2 à l\'arrivée aux urgences à Johannesburg', type_evt: 'mort', source_nom: 'WHO DON599', source_url: null },
  { id: '5', foyer_id: 'hondius-2026', date_evt: '2026-05-02', evenement: 'OMS notifiée via le RSI. PCR positive hantavirus confirmée en Afrique du Sud.', type_evt: 'officiel', source_nom: 'WHO DON599', source_url: null },
  { id: '6', foyer_id: 'hondius-2026', date_evt: '2026-05-10', evenement: 'Le Hondius arrive au port de Granadilla (Tenerife) — Évacuation de 94 personnes en 19 nationalités', type_evt: 'arrivee', source_nom: 'CNN/Al Jazeera', source_url: null },
];

const FALLBACK_CASES = [
  { id: '1', foyer_id: 'hondius-2026', numero_local: 1, statut: 'decede', nationalite: 'NL', sexe: 'M', age_categorie: 'adulte', lieu_actuel: 'à bord (11 avril)', date_onset: '2026-04-06', confirme_pcr: true, notes: 'Cas index présumé. Road trip 4 mois Chili/Uruguay/Argentine.' },
  { id: '2', foyer_id: 'hondius-2026', numero_local: 2, statut: 'decede', nationalite: 'NL', sexe: 'F', age_categorie: 'adulte', lieu_actuel: 'Johannesburg (26 avril)', date_onset: '2026-04-23', confirme_pcr: true, notes: 'Épouse du cas 1. Débarquée à Saint-Hélène avec symptômes gastro.' },
  { id: '3', foyer_id: 'hondius-2026', numero_local: 3, statut: 'soigne', nationalite: 'GB', sexe: 'M', age_categorie: 'adulte', lieu_actuel: 'Johannesburg ICU', date_onset: '2026-04-24', confirme_pcr: true, notes: 'Pneumonie à bord. Évacué d\'Ascension le 27 avril.' },
  { id: '4', foyer_id: 'hondius-2026', numero_local: 4, statut: 'decede', nationalite: 'DE', sexe: 'F', age_categorie: 'adulte', lieu_actuel: 'à bord (2 mai)', date_onset: '2026-04-28', confirme_pcr: true, notes: 'Pneumonie. Onset 28 avril.' },
  { id: '5', foyer_id: 'hondius-2026', numero_local: 5, statut: 'soigne', nationalite: 'CH', sexe: null, age_categorie: null, lieu_actuel: 'Zurich', date_onset: null, confirme_pcr: true, notes: 'Passager débarqué et soigné en Suisse.' },
  { id: '6', foyer_id: 'hondius-2026', numero_local: 6, statut: 'soigne', nationalite: 'GB', sexe: null, age_categorie: null, lieu_actuel: null, date_onset: null, confirme_pcr: true, notes: 'Confirmation UKHSA 8 mai.' },
];

async function getFoyerData(id: string) {
  if (!supabase) {
    if (id === 'hondius-2026') {
      return {
        foyer: FALLBACK_DATA.foyer,
        timeline: FALLBACK_TIMELINE,
        cases: FALLBACK_CASES,
        isConnected: false
      };
    }
    return null;
  }

  try {
    const [foyerRes, timelineRes, casesRes] = await Promise.all([
      supabase.from('foyers').select('*').eq('id', id).single(),
      supabase.from('timeline_events').select('*').eq('foyer_id', id).order('date_evt'),
      supabase.from('cases').select('*').eq('foyer_id', id).order('numero_local'),
    ]);

    if (foyerRes.error || !foyerRes.data) {
      if (id === 'hondius-2026') {
        return {
          foyer: FALLBACK_DATA.foyer,
          timeline: FALLBACK_TIMELINE,
          cases: FALLBACK_CASES,
          isConnected: false
        };
      }
      return null;
    }

    return {
      foyer: foyerRes.data as Foyer,
      timeline: (timelineRes.data as TimelineEvent[]) || FALLBACK_TIMELINE,
      cases: (casesRes.data as Case[]) || FALLBACK_CASES,
      isConnected: true
    };
  } catch (error) {
    console.error('Erreur Supabase fiche:', error);
    if (id === 'hondius-2026') {
      return {
        foyer: FALLBACK_DATA.foyer,
        timeline: FALLBACK_TIMELINE,
        cases: FALLBACK_CASES,
        isConnected: false
      };
    }
    return null;
  }
}

export default async function FoyerPage({ params }: { params: { id: string } }) {
  const data = await getFoyerData(params.id);
  if (!data) notFound();

  const { foyer, timeline, cases, isConnected } = data;
  const heureActuelle = new Date().toLocaleString('fr-FR', {
    timeZone: 'UTC', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--promethean-dark)', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <header style={{
        borderBottom: '1px solid #1e293b', padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'var(--promethean-dark)ee', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent', border: '1px solid #334155', color: '#94a3b8',
              padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', borderRadius: '4px'
            }}>
              <ArrowLeft size={12} /> DASHBOARD
            </button>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '24px', height: '24px', backgroundColor: 'var(--promethean-blue)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '14px', height: '14px', border: '1.5px solid #f1f5f9',
                borderRadius: '50%', position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', top: '2px', left: '2px',
                  width: '6px', height: '6px',
                  background: 'linear-gradient(45deg, #f1f5f9 0%, #cbd5e1 100%)',
                  clipPath: 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)'
                }} />
              </div>
            </div>
            <h1 style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600 }}>
              <span style={{ color: 'var(--promethean-blue)' }}>PROMETHEAN</span>{' '}
              <span style={{ color: '#f1f5f9' }}>EPIDEMIO</span>
            </h1>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--promethean-gray)' }}>
          <Clock size={12} />
          <span>{heureActuelle} UTC</span>
        </div>
      </header>

      {/* HERO */}
      <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{
            backgroundColor: '#3a0a0a', borderLeft: '3px solid var(--error)', color: '#fca5a5',
            padding: '2px 10px', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.1em', fontWeight: 600, borderRadius: '2px'
          }}>
            {foyer.niveau}
          </span>
          <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--promethean-gray)', letterSpacing: '0.1em' }}>
            ID:{foyer.id.toUpperCase()} · MAJ : {new Date(foyer.derniere_maj).toLocaleString('fr-FR')}
            {!isConnected && ' · MODE DÉMO'}
          </span>
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '52px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
          {foyer.nom}
        </h1>

        <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', marginBottom: '6px' }}>SOUCHE</div>
            <div style={{ fontSize: '15px', color: 'var(--warning)', fontFamily: 'JetBrains Mono, monospace' }}>{foyer.souche || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', marginBottom: '6px' }}>TRANSMISSION</div>
            <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{foyer.transmission || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', marginBottom: '6px' }}>PAYS CONCERNÉS</div>
            <div style={{ fontSize: '14px', color: '#cbd5e1' }}>{foyer.pays_concernes?.join(', ') || '—'}</div>
          </div>
        </div>
      </section>

      {/* STATISTIQUES VISUELLES */}
      <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b', animationDelay: '0.2s' }}>
        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 600, margin: '0 0 24px 0' }}>
          Vue d'ensemble épidémiologique
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', backgroundColor: '#1e293b' }}>
          {[
            { label: 'Cas confirmés', value: cases.filter(c => c.confirme_pcr).length, total: cases.length, color: 'var(--warning)', desc: 'PCR+' },
            { label: 'Décès', value: cases.filter(c => c.statut === 'decede').length, total: cases.length, color: 'var(--error)', desc: 'confirmés' },
            { label: 'En soins', value: cases.filter(c => c.statut === 'soigne').length, total: cases.length, color: 'var(--info)', desc: 'actifs' },
            { label: 'CFR observée', value: `${Math.round((cases.filter(c => c.statut === 'decede').length / cases.filter(c => c.confirme_pcr).length) * 100)}%`, total: null, color: 'var(--error)', desc: 'létalité' },
            { label: 'Pays touchés', value: [...new Set(cases.filter(c => c.nationalite).map(c => c.nationalite))].length, total: null, color: 'var(--info)', desc: 'nations' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'var(--promethean-dark)', padding: '24px' }}>
              <div style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: '8px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace' }}>
                {stat.desc}
              </div>
              {stat.total && (
                <div style={{ marginTop: '8px', width: '100%', height: '4px', backgroundColor: '#1e293b', borderRadius: '2px' }}>
                  <div style={{ 
                    width: `${(stat.value / stat.total) * 100}%`, 
                    height: '100%', 
                    backgroundColor: stat.color, 
                    borderRadius: '2px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CAS DOCUMENTÉS */}
      <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b', animationDelay: '0.4s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 600, margin: 0 }}>
            Cas documentés ({cases.length})
          </h2>
          <div style={{ display: 'flex', gap: '12px', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: 'var(--error)' }}>● DÉCÉDÉ</span>
            <span style={{ color: 'var(--info)' }}>● SOIGNÉ</span>
            <span style={{ color: 'var(--warning)' }}>● SUSPECT</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {cases.map((c, i) => {
            const couleurStatut: Record<string, string> = {
              decede: 'var(--error)', soigne: 'var(--info)', suspect: 'var(--warning)', confirme: 'var(--warning)', probable: 'var(--warning)',
            };
            const colStat = couleurStatut[c.statut] || '#94a3b8';
            return (
              <div key={c.id} className="animate-slide-in" style={{ 
                padding: '20px', backgroundColor: '#0a0e14', border: '1px solid #1e293b', borderRadius: '4px',
                borderLeft: `3px solid ${colStat}`,
                animationDelay: `${0.5 + i * 0.1}s`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--warning)', fontWeight: 600 }}>
                    CAS #{c.numero_local || '?'}
                  </span>
                  <span style={{ 
                    fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: colStat,
                    border: `1px solid ${colStat}`, padding: '2px 6px', letterSpacing: '0.1em',
                    borderRadius: '2px', textTransform: 'uppercase'
                  }}>{c.statut}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '8px', fontWeight: 500 }}>
                  {c.nationalite || '—'} {c.sexe ? `· ${c.sexe}` : ''} {c.age_categorie ? `· ${c.age_categorie}` : ''}
                </div>
                {c.lieu_actuel && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>
                    📍 {c.lieu_actuel}
                  </div>
                )}
                {c.date_onset && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>
                    🗓 Onset: {new Date(c.date_onset).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {c.notes && (
                  <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '8px' }}>{c.notes}</div>
                )}
                <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.confirme_pcr ? '✓ PCR CONFIRMÉ' : '○ SUSPECT'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CHRONOLOGIE */}
      <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b', animationDelay: '0.6s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Calendar size={20} color="var(--promethean-blue)" />
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 600, margin: 0 }}>
            Chronologie complète ({timeline.length} événements)
          </h2>
        </div>
        <div style={{ position: 'relative' }}>
          {/* Ligne temporelle */}
          <div style={{ position: 'absolute', left: '50px', top: '0', bottom: '0', width: '2px', backgroundColor: 'var(--promethean-blue)', opacity: 0.3 }} />
          
          {timeline.map((t, i) => {
            const typeColors: Record<string, string> = {
              depart: 'var(--info)',
              mort: 'var(--error)',
              escale: 'var(--warning)',
              officiel: 'var(--promethean-blue)',
              arrivee: 'var(--success)',
              cas: 'var(--warning)',
              evac: 'var(--info)'
            };
            const eventColor = typeColors[t.type_evt] || 'var(--promethean-gray)';
            
            return (
              <div key={t.id} className="animate-slide-in" style={{
                display: 'grid', gridTemplateColumns: '100px 40px 1fr', gap: '16px',
                padding: '16px 0', borderBottom: i < timeline.length - 1 ? '1px solid #1e293b' : 'none',
                position: 'relative',
                animationDelay: `${0.7 + i * 0.1}s`
              }}>
                <div style={{ fontSize: '12px', color: 'var(--warning)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  {new Date(t.date_evt).toLocaleDateString('fr-FR')}
                </div>
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    width: '12px', height: '12px', borderRadius: '50%', 
                    backgroundColor: eventColor, 
                    border: '2px solid var(--promethean-dark)',
                    zIndex: 1
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '4px' }}>
                    {t.evenement}
                  </div>
                  {t.source_nom && (
                    <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                      Source: {t.source_nom}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer style={{ padding: '32px 40px', fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.7, borderTop: '1px solid var(--promethean-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            Permalien : /foyers/{foyer.id} · Citable comme : "The Promethean Institute (2026). Fiche épidémiologique {foyer.nom}. Consulté le {heureActuelle}."
          </div>
          <div style={{ fontSize: '10px', color: 'var(--promethean-gray)' }}>
            {isConnected ? 'Données temps réel' : 'Version démo - Base de données en cours de connexion'}
          </div>
        </div>
      </footer>
    </div>
  );
}
