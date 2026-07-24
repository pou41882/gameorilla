import Image from "next/image";
import type { Metadata } from "next";
import {
  audioRules,
  bananaRules,
  brandPalette,
  games,
  implementationModules,
} from "@/lib/gameorilla-brand";

export const metadata: Metadata = {
  title: "Ape Vice Arcade",
  description:
    "Ape Vice Arcade is Gameorilla's neon after-dark world of social games, mischief, and bananas.",
  openGraph: {
    title: "Gameorilla | Vice Arcade",
    description:
      "Old arcade soul. Night energy. Grown-up social games from PoundTown Games.",
    images: [
      {
        url: "/og-gameorilla.png",
        width: 1680,
        height: 945,
        alt: "Gameorilla Vice Arcade",
      },
    ],
  },
};

const skyline = [42, 76, 54, 94, 61, 82, 48, 104, 69, 88, 57, 72];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="site-header">
        <a className="micro-mark" href="#top" aria-label="Gameorilla home">
          <span aria-hidden="true">GG</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#games">Games</a>
          <a href="#vibe">The vice</a>
          <a href="#bananas">Banana bank</a>
          <a href="#ptg">PTG</a>
        </nav>
        <a className="header-cta" href="#games">
          Press start <span aria-hidden="true">▶</span>
        </a>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="scanlines" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">PoundTown Games presents // Ape Vice Arcade</p>
            <h1 id="hero-title" aria-label="Gameorilla">
              <span className="cyan">game</span>
              <span className="pink">orilla</span>
            </h1>
            <p className="hero-kicker">Ape vice arcade. Bananas on the line.</p>
            <p className="hero-description">
              A neon after-dark den for every vice a chill ape could want: clever
              games, big bragging rights, music, mischief, and a banana stack
              worth protecting.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#games">
                Enter the arcade
              </a>
              <a className="button button-secondary" href="#bananas">
                Check banana bank
              </a>
            </div>
            <p className="system-line">
              <span className="status-dot" aria-hidden="true" />
              Local alpha // GitHub-ready build in progress
            </p>
          </div>

          <div className="hero-art" aria-label="Gameorilla vice-arcade brand art">
            <div className="sun" aria-hidden="true" />
            <div className="mascot-frame">
              <Image
                src="/brand/reference/04-logo-art-direction.jpeg"
                alt="The Gameorilla pixel mascot wearing controller-eye glasses"
                width={1680}
                height={945}
                priority
              />
            </div>
            <div className="city" aria-hidden="true">
              {skyline.map((height, index) => (
                <span
                  key={`${height}-${index}`}
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden="true">
          <span>OLD ARCADE SOUL</span>
          <span>◆</span>
          <span>APE VICE ENERGY</span>
          <span>◆</span>
          <span>MULTI-GAME WORLD</span>
          <span>◆</span>
          <span>FOREVER PLAY</span>
        </div>

        <section className="section" id="games" aria-labelledby="games-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 // game select</p>
              <h2 id="games-title">Choose your cabinet.</h2>
            </div>
            <p>
              The first cabinet is a Gamearang adaptation with a new Ape Vice
              Arcade scoring layer. The others establish the expandable arcade catalog.
            </p>
          </div>

          <div className="game-grid">
            {games.map((game, index) => (
              <article className={`game-card accent-${game.accent}`} key={game.slug}>
                <div className="card-topline">
                  <span>0{index + 1}</span>
                  <span className="game-status">{game.status}</span>
                </div>
                <div className="game-icon" aria-hidden="true">
                  {game.icon}
                </div>
                <p className="game-type">{game.type}</p>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-meta">
                  <span>{game.players}</span>
                  <span>{game.duration}</span>
                </div>
                <p className="card-action" aria-label={`${game.title}: ${game.action}`}>
                  {game.action} <span aria-hidden="true">→</span>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="banana-section" id="bananas" aria-labelledby="banana-title">
          <div>
            <p className="eyebrow">02 // the banana bank</p>
            <h2 id="banana-title">Play for bananas. Stay for the vice.</h2>
            <p>
              Bananas are the visible heartbeat of Ape Vice Arcade: earned in
              play, displayed with pride, and spent on the fun around the games.
              They are never cash, a cash prize, or a substitute for PTG tokens.
            </p>
          </div>
          <ul>
            {bananaRules.map((rule, index) => (
              <li key={rule}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <section className="vibe-section" id="vibe" aria-labelledby="vibe-title">
          <div className="vibe-copy">
            <p className="eyebrow">03 // brand world</p>
            <h2 id="vibe-title">The city plays after dark.</h2>
            <p className="vibe-lead">
              Gameorilla is a neon vice-arcade universe: a chill ape-run city of
              retro games, nightlife, water, palms, and grown-up fun.
            </p>
            <ul className="feature-list">
              <li>
                <span>♥</span>
                Pixel-first identity with 8-bit and 16-bit roots
              </li>
              <li>
                <span>♜</span>
                Clever, playful energy—never aggressive or childish
              </li>
              <li>
                <span>◎</span>
                Multiple game categories under one arcade roof
              </li>
            </ul>
          </div>
          <figure className="brand-reference">
            <Image
              src="/brand/reference/02-brand-world.jpeg"
              alt="Gameorilla brand world reference showing the neon city, mascot, and brand pillars"
              width={1680}
              height={945}
            />
            <figcaption>Canonical brand world // source kit page 02</figcaption>
          </figure>
        </section>

        <section className="section system-section" id="system" aria-labelledby="system-title">
          <div className="section-heading">
            <div>
            <p className="eyebrow">04 // design operating system</p>
              <h2 id="system-title">Built on fixed rules.</h2>
            </div>
            <p>
              The brand lives as reusable tokens and components, so every future
              game can feel different without drifting away from Gameorilla.
            </p>
          </div>

          <div className="system-grid">
            <article className="panel palette-panel">
              <p className="panel-label">Color registers</p>
              <h3>Neon over midnight.</h3>
              <div className="swatch-grid">
                {brandPalette.map((color) => (
                  <div className="swatch" key={color.hex}>
                    <span style={{ background: color.hex }} />
                    <div>
                      <strong>{color.name}</strong>
                      <code>{color.hex}</code>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel type-panel">
              <p className="panel-label">Type channels</p>
              <h3>Readable at arcade speed.</h3>
              <div className="type-sample display-sample">
                <span>Display</span>
                <strong>PRESS START</strong>
                <small>Headline / score / logo moments</small>
              </div>
              <div className="type-sample ui-sample">
                <span>Interface</span>
                <strong>PLAYER SELECT</strong>
                <small>Menus / buttons / UI labels</small>
              </div>
              <div className="type-sample utility-sample">
                <span>Utility</span>
                <strong>room_code: G0-R1LLA</strong>
                <small>System text / codes / live status</small>
              </div>
            </article>

            <article className="panel audio-panel">
              <p className="panel-label">Audio identity</p>
              <h3>Retro sound creates emotion.</h3>
              <div className="equalizer" aria-hidden="true">
                {[5, 9, 14, 8, 17, 11, 7, 15, 10, 6, 13, 8].map((bars, index) => (
                  <span key={`${bars}-${index}`} style={{ height: `${bars * 4}px` }} />
                ))}
              </div>
              <dl className="audio-list">
                {audioRules.map((rule) => (
                  <div key={rule.event}>
                    <dt>{rule.event}</dt>
                    <dd>{rule.rule}</dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>

        <section className="build-section" aria-labelledby="build-title">
          <div>
            <p className="eyebrow">05 // implementation map</p>
            <h2 id="build-title">Ready to become a real arcade.</h2>
            <p>
              This local build separates the public experience from the systems
              we will connect later: identity, payments, game telemetry, support,
              and the shared PTG game-building stack.
            </p>
          </div>
          <ol className="module-list">
            {implementationModules.map((module, index) => (
              <li key={module.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{module.title}</strong>
                  <p>{module.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer id="ptg">
        <div>
          <span className="footer-logo">
            <span className="cyan">game</span>
            <span className="pink">orilla</span>
            <small>.com</small>
          </span>
          <p>The Ape Vice Arcade property of PoundTown Games.</p>
        </div>
        <div className="footer-status">
          <span>LOCAL BUILD // V0.1</span>
          <span>PLAY BY THE RULES ♥</span>
        </div>
      </footer>
    </>
  );
}
