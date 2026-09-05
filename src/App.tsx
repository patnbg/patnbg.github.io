import type { DailyQuote } from "./quotes";

interface AppProps {
  readonly daily: DailyQuote;
}

export const App = ({ daily }: AppProps) => (
  <main className="scene">
    <div className="scene__sun" aria-hidden="true" />
    <div className="scene__scribble scene__scribble--left" aria-hidden="true">
      take
      <br />
      five
    </div>
    <div className="scene__scribble scene__scribble--right" aria-hidden="true">
      no rush
    </div>

    <section className="calendar" aria-labelledby="page-title">
      <div className="calendar__shadow" aria-hidden="true" />
      <div className="calendar__body">
        <header className="calendar__topbar">
          <h1 id="page-title" className="calendar__title" aria-label="Daily Detour">
            <span>Daily</span>
            <span>Detour</span>
          </h1>
          <p className="calendar__edition">UTC edition</p>
        </header>

        <div className="calendar__binding" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <article className="calendar__sheet">
          <header className="date-stamp">
            <time dateTime={daily.date.iso}>
              <span className="date-stamp__weekday">{daily.date.weekday}</span>
              <span className="date-stamp__day">{daily.date.day}</span>
              <span className="date-stamp__month">
                {daily.date.month} / {daily.date.year}
              </span>
            </time>
            <span className="date-stamp__rule" aria-hidden="true" />
            <span className="date-stamp__instruction">Take one daily</span>
          </header>

          <blockquote className="quote">
            <p>“{daily.quote.text}”</p>
            <footer className="quote__credit">
              <cite>{daily.quote.author}</cite>
              <span>{daily.quote.source}</span>
            </footer>
          </blockquote>

          <footer className="calendar__footer">
            <span>Reload after midnight UTC</span>
            <span aria-hidden="true">No action items</span>
          </footer>
        </article>
      </div>
    </section>
  </main>
);
