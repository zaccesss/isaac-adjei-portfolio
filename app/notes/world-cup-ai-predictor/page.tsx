import type { Metadata } from "next"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ExternalLink } from "lucide-react"

export const metadata: Metadata = {
  title: "World Cup 2026 AI Predictor",
  description:
    "A planned AI project to predict FIFA World Cup 2026 match outcomes using historical data and machine learning.",
  alternates: {
    canonical: "https://www.isaacadjei.me/notes/world-cup-ai-predictor",
  },
}

const references = [
  {
    text: "FIFA World Cup official results database",
    url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup",
  },
  {
    text: "Kaggle: International football results 1872 to present",
    url: "https://www.kaggle.com/datasets/martj42/international-football-results-from-1872-to-2017",
  },
  {
    text: "Kaggle: FIFA World Cup dataset",
    url: "https://www.kaggle.com/datasets/abecklas/fifa-world-cup",
  },
  {
    text: "scikit-learn: Ensemble methods and gradient boosting",
    url: "https://scikit-learn.org/stable/modules/ensemble.html",
  },
  {
    text: "FiveThirtyEight Soccer Power Index (SPI) methodology",
    url: "https://fivethirtyeight.com/methodology/how-our-club-soccer-predictions-work/",
  },
  {
    text: "Goldman Sachs 2018 World Cup prediction model (research report)",
    url: "https://www.goldmansachs.com/intelligence/pages/the-world-cup-and-markets.html",
  },
]

export default function WorldCupAIPredictorPage() {
  return (
    <div className="container max-w-3xl py-24 space-y-12">
      <div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>
        <div className="flex flex-wrap gap-2 mb-4">
          {["Python", "ML", "Football", "Data Science", "Web App"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">World Cup 2026 AI Predictor</h1>
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
          A planned machine learning project for Summer 2026: predict every match of the FIFA World
          Cup using historical data, team statistics and tournament context.
        </p>
      </div>

      <Separator />

      <section className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mt-0 [&_p]:leading-relaxed [&_p]:text-[0.95rem]">
        <h2>The idea</h2>
        <p>
          The FIFA World Cup 2026 is the first to feature 48 teams and will be hosted across 16
          cities in the USA, Canada and Mexico. With more teams and more matches than any previous
          tournament, there is more data to predict and more uncertainty to model. I want to build
          an AI system that takes in historical World Cup results going back to 1930 alongside
          current team and player statistics, and produces a full probability distribution over
          every possible match outcome: win, draw or loss, with score predictions, group stage
          standings and knockout bracket simulation.
        </p>
        <p>
          The goal is not just to get the winner right. Any prediction system that only outputs
          a winner is not very useful. I want to quantify uncertainty properly: for every match,
          the model should output a probability for each outcome so that you can see not just what
          is most likely but how confident the model is and what the alternative scenarios look like.
        </p>

        <h2>The data</h2>
        <p>
          The core training data will be every international football result since 1872, covering
          over 45,000 matches. For World Cup matches specifically, the historical record goes back
          to Uruguay 1930. Each match record will include: date, teams, goals, tournament stage,
          host nation and match importance weighting.
        </p>
        <p>
          Beyond raw results, I plan to incorporate:
        </p>
        <ul className="list-none space-y-2">
          {[
            "FIFA world rankings at the time of each match (to capture relative team strength)",
            "Recent form (results from the 12 months leading into the tournament)",
            "Squad composition metrics (average age, number of top-division players, key player availability)",
            "Tournament experience (how many World Cups each squad has played in collectively)",
            "Home advantage and neutral venue adjustments",
            "Head-to-head record between the two teams",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2>The models</h2>
        <p>
          Football prediction is a well-studied problem in sports analytics. The main approaches
          are:
        </p>
        <ul className="list-none space-y-2">
          {[
            "Poisson regression: models goals scored by each team as independent Poisson processes with rates estimated from historical attack and defence strengths. The simplest baseline and surprisingly competitive.",
            "Random Forest and Gradient Boosting (XGBoost/LightGBM): ensemble methods that handle non-linear feature interactions well. Require careful feature engineering but tend to outperform Poisson models when enough features are available.",
            "Elo rating systems: similar to chess ratings, updated after every match. FIFA uses a variant of this. Good for capturing current form but loses context about specific opponent matchups.",
            "Neural networks: can capture complex patterns but are prone to overfitting on a dataset the size of World Cup history alone. More useful for the pre-tournament squad analysis component.",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          My plan is to start with a calibrated Poisson baseline to validate the data pipeline,
          then train an XGBoost model on the full feature set and use Monte Carlo simulation to
          run the full tournament bracket 100,000 times, producing win probabilities for every
          possible knockout matchup.
        </p>

        <h2>The web app</h2>
        <p>
          The predictions will be deployed as a public web app so anyone can interact with them.
          The planned interface includes:
        </p>
        <ul className="list-none space-y-2">
          {[
            "Group stage view: all six groups with win/draw/loss probabilities for each match and predicted final standings",
            "Knockout bracket: interactive bracket showing win probability for each potential matchup at every stage",
            "Team deep-dive: click any team to see their historical performance, current form score, squad strength and model confidence",
            "Live updates: once the tournament starts, the model re-scores after each result using actual outcomes to update remaining predictions",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p>
          Stack: Python for data processing and model training, FastAPI for the prediction API,
          Next.js for the frontend, PostgreSQL to store match results and predictions, deployed on
          Vercel and Render.
        </p>

        <h2>Timeline</h2>
        <p>
          The World Cup group stage begins on 11 June 2026. That gives me roughly from May 2026
          to have a working model and deployed app in place. The plan:
        </p>
        <ul className="list-none space-y-2">
          {[
            "May 2026: data collection, cleaning and baseline Poisson model",
            "Late May 2026: XGBoost model, feature validation, Monte Carlo simulation engine",
            "Early June 2026: web app build and deployment",
            "11 June 2026: go live with full group stage predictions",
            "Throughout tournament: real-time updates after each match result",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="text-primary shrink-0 mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h2>Why this project</h2>
        <p>
          Football and engineering do not usually sit in the same sentence but they share something
          important: they both reward people who think carefully about systems and uncertainty. A
          prediction model for a football tournament is a real applied machine learning problem with
          a clear deadline, a public output and a defined success criterion. It is also a project
          that will be genuinely useful and interesting to people outside of engineering, which
          matters to me.
        </p>
        <p>
          I also want to document the entire build process as a blog post series so that other
          students can see how a real ML project comes together from data collection to deployed
          product.
        </p>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">References and resources</h2>
        <ul className="space-y-3">
          {references.map((ref) => (
            <li key={ref.text}>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-sm text-primary hover:underline group"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-70 group-hover:opacity-100" />
                <span>{ref.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Separator />

      <Link
        href="/notes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to notes
      </Link>
    </div>
  )
}
