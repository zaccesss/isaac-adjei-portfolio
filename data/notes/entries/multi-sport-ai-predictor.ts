import type { NoteEntry } from "../index"

const multiSportAiPredictor: NoteEntry = {
  slug: "multi-sport-ai-predictor",
  title: "Multi-Sport AI Predictor",
  description:
    "The World Cup 2026 predictor didn't ship in time for the tournament (Spain won it), so I'm generalising the idea into an open-ended multi-sport prediction platform: football, basketball, tennis, cricket, motorsport, rugby, athletics and volleyball, with more sports added over time.",
  ogTitle: "Multi-Sport%20AI%20Predictor",
  ogDescription:
    "Generalising%20a%20World%20Cup%20predictor%20into%20an%20open-ended%20multi-sport%20platform.",
  tags: ["Python", "ML", "Sports Analytics", "Data Science", "Web App", "Football", "Basketball", "Tennis", "Cricket", "Motorsport", "Rugby", "Athletics", "Volleyball"],
  lead:
    "What started as a single-tournament World Cup predictor never shipped in time for the 2026 tournament - Spain won it in the end, and I was still building the pipeline when the group stage kicked off on 11 June. Rather than treat one missed deadline as the end of the idea, I'm generalising it into an open-ended platform: football, basketball, tennis, cricket, motorsport, rugby, athletics and volleyball, with the list growing over time rather than fixed at launch.",
  body: [
    { type: "h2", text: "What actually happened" },
    {
      type: "p",
      text: "The original plan was a calibrated Poisson baseline followed by an XGBoost model on the full feature set, with Monte Carlo simulation running the full World Cup bracket 100,000 times to produce proper win probabilities rather than a single predicted winner. I got as far as the data collection and baseline model work, but the web app and the live-updating prediction layer weren't ready by 11 June 2026, so the project quietly missed its own deadline. The tournament played out without it, and Spain lifted the trophy.",
    },
    {
      type: "p",
      text: "None of that work was wasted, though. The actual hard part of a project like this - a calibrated ratings system, a gradient-boosted model over engineered features, Monte Carlo simulation for proper uncertainty quantification, a web app that visualises probabilities rather than just a predicted winner - is not really about football specifically. It is a general architecture for predicting competitive outcomes. Rebuilding it as a single-tournament, single-sport tool a second time would just recreate the same one-shot deadline problem. Generalising it into an ongoing, open-ended multi-sport platform is a better use of the same groundwork - one that keeps growing rather than expiring on a fixed date.",
    },
    { type: "h2", text: "The sports" },
    {
      type: "p",
      text: "The plan covers eight sports at launch, each added incrementally rather than all at once, and the list is deliberately open-ended: any sport with a large enough public results dataset is a candidate for a future addition, not a fixed roster decided up front.",
    },
    {
      type: "list",
      items: [
        "Football: the top European leagues (Premier League, La Liga, Serie A, Bundesliga), the Champions League, the Euros, Copa America and the World Cup itself for the next cycle. This is where the original model work already exists, so it's the starting point.",
        "Basketball: the NBA to start with, since box-score data is the most complete and standardised of any sport here. High-scoring, frequent fixtures (82 games a season plus playoffs) means far more training data per team per season than football, and back-to-back game fatigue is a real, modellable feature that football doesn't have an equivalent of.",
        "Tennis: individual rather than team matchups across the ATP and WTA tours, so the model is closer to a head-to-head Elo system than a team-strength regression. Surface matters enormously (clay, grass, hard court), so ratings need to be surface-specific rather than one global number per player.",
        "Cricket: format-dependent in a way none of the other sports are - T20, ODI and Test are close to different sports statistically (run rate dynamics, match length, the toss, follow-on rules), so each format likely needs its own model rather than one shared cricket model. Covers both international cricket and the major domestic T20 leagues.",
        "Motorsport (Formula 1): split into a qualifying model and a race model, with separate constructor and driver components, plus weather and tyre-strategy features that don't map onto anything in the other sports here.",
        "Rugby (union): international tests (Six Nations, The Rugby Championship, the Rugby World Cup) plus the major club competitions. Scoring is lower-frequency and higher-variance per score than football (tries, conversions, penalties, drop goals each worth different points), which changes the goal-modelling approach entirely from the football Poisson baseline.",
        "Athletics and running: track and field plus distance running (marathons and road races). A genuinely different prediction problem from every team sport here - it is about predicting an individual time or place in a field of competitors rather than a match outcome, closer to a ranking/regression problem than a win-probability one.",
        "Volleyball: international and major domestic leagues. Rally-scoring and the best-of-five-sets format make it closer to tennis's individual-set structure than to football's single continuous score, but it is a team sport, so the team-strength side of the model looks more like basketball's.",
      ],
    },
    { type: "h2", text: "Shared architecture, sport-specific adapters" },
    {
      type: "p",
      text: "The core stays the same across every sport: a data ingestion layer, a ratings/Elo engine, a gradient-boosting layer (XGBoost/LightGBM) trained on sport-specific features, Monte Carlo simulation for the uncertainty layer, and one web app that lets you pick a sport and competition and see live probabilities rather than a single predicted outcome. What changes per sport is the feature engineering and the specific rules layered on top: football's Poisson goal model, basketball's pace-adjusted scoring model, tennis and volleyball's surface- or format-adjusted Elo, cricket's per-format split, motorsport's qualifying-plus-race two-stage model, rugby's points-type breakdown, and athletics' switch from a win-probability model to a time/placement regression. Adding a new sport to the platform later should mean writing one new adapter against the shared core, not rebuilding the whole pipeline again.",
    },
    { type: "h2", text: "Data sources" },
    {
      type: "list",
      items: [
        "Football: the same historical results data as before (45,000+ international matches since 1872), FIFA/Elo rankings, squad and form data",
        "Basketball: box-score and play-by-play history going back decades, available through Basketball Reference and several public Kaggle datasets",
        "Tennis: ATP and WTA match history, including Jeff Sackmann's widely-used open tennis results datasets on GitHub, which cover match results, rankings and surface back to the start of the Open era",
        "Cricket: ball-by-ball data from Cricsheet, which covers international and domestic T20, ODI and Test matches in a consistent structured format",
        "Motorsport: full qualifying and race history including lap times, pit stops and weather, accessible through the FastF1 Python library",
        "Rugby: World Rugby's official rankings and match results as the starting point, since rugby-specific historical datasets are far less standardised than football or cricket's",
        "Athletics and running: World Athletics' official rankings and results database, covering track and field plus major road races and marathons",
        "Volleyball: the FIVB's official rankings and results as the starting point, similarly less standardised than the more data-rich sports here",
      ],
    },
    { type: "h2", text: "Why generalise rather than start a new single-sport project" },
    {
      type: "p",
      text: "It would have been easy to just pick a different single tournament and repeat the exact same mistake with a new deadline. The actual lesson from missing the World Cup deadline wasn't 'football is too hard to predict in time', it was 'a one-shot project tied to a single tournament date has no room for slippage, and slippage is normal in any real project'. An ongoing, open-ended multi-sport platform doesn't have that failure mode: each sport ships when it's ready, there's always another season, meet or tournament for it to be useful for, and treating the sport list as something that keeps growing rather than fixed at eight is a much better return on the modelling work already done than a single rebuilt World Cup predictor would have been.",
    },
    { type: "h2", text: "Order of work" },
    {
      type: "list",
      items: [
        "Finish football properly first, since the model groundwork already exists: extend the existing Poisson/XGBoost pipeline to the four league competitions plus the Champions League, Euros and Copa America, and actually ship the web app this time rather than leaving it as the unfinished piece again",
        "Basketball next, since box-score data is the most complete and standardised of the remaining sports",
        "Tennis, volleyball and cricket after that - tennis and volleyball share enough structure (individual or team matchups within a set-based format) to build close together, cricket likely in parallel since its modelling logic doesn't overlap much with either",
        "Rugby and athletics after the data-richer sports are proven out, since both have less standardised public data to build against and will need more groundwork on the ingestion side before the shared architecture can be reused",
        "Motorsport last of the initial eight, since the qualifying-plus-race two-stage structure is the most different from everything else and benefits from the shared architecture being proven out on the other sports first",
        "Beyond that: the platform stays open to further sports as they become worth adding, rather than treating eight as a final number",
      ],
    },
  ],
  references: [
    { text: "FIFA World Cup official results database", url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup" },
    { text: "Kaggle: International football results 1872 to present", url: "https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017" },
    { text: "Kaggle: FIFA World Cup dataset", url: "https://www.kaggle.com/datasets/abecklas/fifa-world-cup" },
    { text: "scikit-learn: Ensemble methods and gradient boosting", url: "https://scikit-learn.org/stable/modules/ensemble.html" },
    { text: "FiveThirtyEight Soccer Power Index (SPI) methodology", url: "https://fivethirtyeight.com/methodology/how-our-club-soccer-predictions-work/" },
    { text: "Basketball Reference - NBA historical box scores and statistics", url: "https://www.basketball-reference.com" },
    { text: "Jeff Sackmann's tennis_atp dataset - ATP match results, rankings and player data", url: "https://github.com/JeffSackmann/tennis_atp" },
    { text: "Cricsheet - structured ball-by-ball cricket match data", url: "https://cricsheet.org" },
    { text: "FastF1 - Python library for Formula 1 timing, telemetry and results data", url: "https://docs.fastf1.dev" },
    { text: "World Rugby - official rankings and match results", url: "https://www.world.rugby/rankings/mru" },
    { text: "World Athletics - official rankings, records and results database", url: "https://worldathletics.org/world-rankings" },
    { text: "FIVB - official international volleyball rankings and results", url: "https://www.fivb.com/rankings" },
  ],
}

export default multiSportAiPredictor
