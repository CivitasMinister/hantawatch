import { supabase, Foyer, NewsItem, FALLBACK_DATA } from '@/lib/supabase';
import { Radio, Clock, AlertTriangle, ExternalLink, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { FicheVirale } from '@/app/components/FicheVirale';
import { VisualisationTempsReel } from '@/app/components/VisualisationTempsReel';

export const revalidate = 60; // Revalidation du cache toutes les 60s

async function getData() {
  // Tentative de connexion à Supabase, fallback si échec
  if (!supabase) {
    return {
      foyers: [FALLBACK_DATA.foyer],
      news: FALLBACK_DATA.news,
      isConnected: false
    };
  }

  try {
    const [foyersRes, newsRes] = await Promise.all([
      supabase.from('foyers').select('*').order('derniere_maj', { ascending: false }),
      supabase
        .from('news_items')
        .select('*')
        .in('validation', ['AUTO', 'VALIDE_HUMAIN'])
        .order('publie_le', { ascending: false })
        .limit(20),
    ]);

    const foyers = (foyersRes.data as Foyer[]) || [];
    const news = (newsRes.data as NewsItem[]) || [];

    // Si pas de données en base, utiliser les fallback
    return {
      foyers: foyers.length > 0 ? foyers : [FALLBACK_DATA.foyer],
      news: news.length > 0 ? news : FALLBACK_DATA.news,
      isConnected: true
    };
  } catch (error) {
    console.error('Erreur Supabase:', error);
    return {
      foyers: [FALLBACK_DATA.foyer],
      news: FALLBACK_DATA.news,
      isConnected: false
    };
  }
}

function formatDateRelative(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString('fr-FR');
}

export default async function Home() {
  const { foyers, news, isConnected } = await getData();
  const foyer = foyers[0];

  const heureActuelle = new Date().toLocaleString('fr-FR', {
    timeZone: 'UTC',
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--promethean-dark)', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      {/* HEADER */}
      <header style={{
        borderBottom: '1px solid #1e293b', padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'var(--promethean-dark)ee', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '32px', height: '32px', backgroundColor: 'var(--promethean-blue)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              width: '20px', height: '20px', border: '2px solid #f1f5f9',
              borderRadius: '50%', position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '4px', left: '4px',
                width: '8px', height: '8px',
                background: 'linear-gradient(45deg, #f1f5f9 0%, #cbd5e1 100%)',
                clipPath: 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)'
              }} />
            </div>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Inter, sans-serif', fontSize: '22px', fontWeight: 600, letterSpacing: '-0.01em' }}>
            <span style={{ color: 'var(--promethean-blue)' }}>PROMETHEAN</span>{' '}
            <span style={{ color: '#f1f5f9' }}>EPIDEMIO</span>
            <span style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', marginLeft: '12px', fontWeight: 400, letterSpacing: '0.15em' }}>
              v1.0 · HANTAVIRUS ANDV
            </span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--promethean-gray)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={12} /><span>{heureActuelle} UTC</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className={isConnected ? 'animate-blink' : ''} style={{ 
              width: '6px', 
              height: '6px', 
              backgroundColor: isConnected ? 'var(--success)' : 'var(--warning)', 
              borderRadius: '50%' 
            }} />
            <span>{isConnected ? 'SOURCES OK' : 'MODE DÉMO'}</span>
          </div>
        </div>
      </header>

      {/* DISCLAIMER */}
      <div style={{
        padding: '10px 40px', backgroundColor: '#0a0e14', borderBottom: '1px solid #1e293b',
        fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <AlertTriangle size={12} color="var(--warning)" />
        <span>
          {isConnected 
            ? 'PRODUCTION — Mise à jour automatique toutes les 15 min. Sources : WHO, CDC, ECDC, ProMED. Ne se substitue à aucune autorité sanitaire.'
            : 'MODE DÉMO — Données statiques pour démonstration. Base de données en cours de connexion. Fonctionnalités complètes disponibles après configuration Supabase.'
          }
        </span>
      </div>

      {/* FOYER ACTIF */}
      {foyer && (
        <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
              FOYER ACTIF · ID:{foyer.id.toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '40px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
              {foyer.nom}
            </h2>
            {foyer.description && (
              <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px', maxWidth: '720px', lineHeight: 1.6 }}>
                {foyer.description}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', backgroundColor: '#1e293b' }}>
            {[
              { l: 'Cas confirmés', v: foyer.cas_confirmes, s: 'PCR positifs', c: 'var(--warning)' },
              { l: 'Cas suspects', v: foyer.cas_suspects, s: 'en investigation', c: '#fcd34d' },
              { l: 'Décès', v: foyer.deces, s: '2 confirmés ANDV', c: 'var(--error)' },
              { l: 'CFR', v: foyer.cfr_pourcent ? `${foyer.cfr_pourcent}%` : '—', s: 'létalité observée', c: 'var(--warning)' },
              { l: 'Pays', v: foyer.pays_concernes?.length ?? 0, s: 'cas ou contacts', c: 'var(--info)' },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: 'var(--promethean-dark)', padding: '28px 24px' }}>
                <div style={{ fontSize: '10px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', marginBottom: '14px' }}>
                  {s.l.toUpperCase()}
                </div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '48px', fontWeight: 600, color: s.c, lineHeight: 1, marginBottom: '8px' }}>
                  {s.v}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {s.s}
                </div>
              </div>
            ))}
          </div>

          <Link href={`/foyers/${foyer.id}`} style={{ textDecoration: 'none' }}>
            <button style={{
              marginTop: '24px', backgroundColor: 'var(--promethean-blue)', color: '#f1f5f9',
              border: 'none', padding: '14px 24px',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
              letterSpacing: '0.15em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'pointer', borderRadius: '4px'
            }}>
              FICHE COMPLÈTE <ChevronRight size={14} />
            </button>
          </Link>
        </section>
      )}

      {/* VISUALISATION TEMPS RÉEL */}
      <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b', animationDelay: '0.2s' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
            SURVEILLANCE ÉPIDÉMIQUE
          </div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            Monitoring temps réel
          </h2>
        </div>
        <VisualisationTempsReel />
      </section>

      {/* FICHE VIRALE SCIENTIFIQUE */}
      <section className="animate-slide-in" style={{ padding: '40px', borderBottom: '1px solid #1e293b', animationDelay: '0.4s' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
            ANALYSE SCIENTIFIQUE
          </div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            Profil pathogène ANDV
          </h2>
        </div>
        <FicheVirale />
      </section>

      {/* FLUX ACTUS */}
      <section className="animate-slide-in" style={{ padding: '40px', animationDelay: '0.6s' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.2em', marginBottom: '6px' }}>
            FLUX TEMPS RÉEL · {news.length} ENTRÉES
          </div>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
            Actualités vérifiées
          </h2>
        </div>

        {news.length === 0 && (
          <div style={{
            padding: '40px', textAlign: 'center', color: 'var(--promethean-gray)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '12px',
            border: '1px dashed #1e293b', borderRadius: '4px'
          }}>
            Aucune actualité pour le moment. Les scrapers tournent toutes les 15 min.<br/>
            Si la base reste vide après 1h, vérifie GitHub Actions → onglet "Actions".
          </div>
        )}

        {news.map((a, i) => (
          <article key={a.id} className="animate-slide-in" style={{
            borderTop: '1px solid #1e293b', padding: '20px 0',
            display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '24px', alignItems: 'flex-start',
            animationDelay: `${0.7 + i * 0.1}s`
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={a.urgence === 'HAUTE' ? 'animate-pulse' : ''} style={{
                  display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: a.urgence === 'HAUTE' ? 'var(--error)' : a.urgence === 'MOYENNE' ? 'var(--warning)' : 'var(--promethean-gray)',
                }} />
                <span style={{ fontSize: '11px', color: 'var(--promethean-gray)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatDateRelative(a.publie_le)}
                </span>
              </div>
              <span style={{
                fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em',
                color: '#94a3b8', border: '1px solid #334155', padding: '2px 6px', display: 'inline-block', width: 'fit-content',
                borderRadius: '2px'
              }}>{a.type_contenu}</span>
              <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
                via {a.source_id.replace('-', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: '#f1f5f9', lineHeight: 1.3 }}>
                {a.titre}
              </h3>
              {a.resume && (
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{a.resume}</p>
              )}
            </div>
            <a href={a.url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
              display: 'flex', alignItems: 'center', gap: '6px',
              whiteSpace: 'nowrap', border: '1px solid #334155', padding: '6px 10px',
              color: 'var(--info)', textDecoration: 'none', borderRadius: '2px'
            }}>
              LIRE <ExternalLink size={11} />
            </a>
          </article>
        ))}
      </section>

      <footer style={{ padding: '32px 40px', fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.7, borderTop: '1px solid var(--promethean-blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            Promethean Epidemio v1.0 — Surveillance épidémiologique scientifique · Mise à jour automatique toutes les 15 minutes
          </div>
          <div style={{ fontSize: '10px', color: 'var(--promethean-gray)' }}>
            The Promethean Institute · Grounded in past, clear on present, focused on future
          </div>
        </div>
      </footer>
    </div>
  );
}
