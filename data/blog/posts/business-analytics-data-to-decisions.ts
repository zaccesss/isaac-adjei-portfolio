import type { BlogPost } from "../index"

const _business_analytics_data_to_decisions: BlogPost = {
    slug: "business-analytics-data-to-decisions",
    title: "Learning Business Analytics: From Probability to Machine Learning",
    date: "2026-05-01",
    type: "notes",
    cover_image: "/images/blog/covers/business-analytics-data-to-decisions.webp",
    description:
      "Notes from working through a structured executive education business analytics course, covering probability, statistics, Python, descriptive analytics, predictive ML and prescriptive optimisation.",
    tags: ["Data Science", "Python", "ML", "Analytics", "Learning"],
    published: true,
    content: [
      {
        type: "p",
        text: "I have been working through a business analytics course covering the journey from mathematical foundations to machine learning and prescriptive optimisation. My motivation was twofold: to deepen my own understanding of analytics on the data science side of my studies and to be able to explain these concepts clearly to someone learning them for the first time.",
      },
      {
        type: "p",
        text: "Teaching is one of the most effective ways to learn. When you have to explain something clearly enough for someone else to understand it, you quickly discover which parts of your own understanding are incomplete.",
      },
      {
        type: "h2",
        text: "The Five Phases",
      },
      {
        type: "p",
        text: "The course follows a logical progression through five phases:",
      },
      {
        type: "ol",
        items: [
          "Phase 1 - Maths primer: probability, statistics, distributions and variation",
          "Phase 2 - [Python](https://www.python.org) primer: syntax, data structures, functions and flow control",
          "Phase 3 - Descriptive analytics: summarising data, estimators, outliers and correlation",
          "Phase 4 - Predictive analytics: machine learning, classification, decision trees and support vector machines",
          "Phase 5 - Prescriptive analytics: linear programming, integer programming and optimisation",
        ],
      },
      {
        type: "h2",
        text: "What Phase 1 Actually Teaches",
      },
      {
        type: "p",
        text: "Probability is about reasoning under uncertainty. The Monty Hall problem is a perfect teaching example here: your intuition says switching doors makes no difference. The mathematics says switching wins two-thirds of the time. The lesson is that intuition can be wrong in systematic ways and that a framework for reasoning corrects for this.",
      },
      {
        type: "p",
        text: "Statistics in Phase 2 covers how to describe variation in data. Standard deviation is not just a formula to memorise. It is a measure of how spread out values are and it has rules: roughly 68% of values in a normal distribution fall within one standard deviation of the mean, 95% within two. Those rules matter when you are making decisions based on data and need to know how confident you can be.",
      },
      {
        type: "h2",
        text: "Machine Learning in Phase 4",
      },
      {
        type: "p",
        text: "The predictive analytics phase covers supervised learning: classification algorithms including logistic regression, k-nearest neighbours and decision trees, then support vector machines. The thread connecting all of them is the same: given labelled historical data, build a model that predicts the label for new unseen inputs.",
      },
      {
        type: "p",
        text: "Decision trees are particularly satisfying to study because they are interpretable. You can trace exactly why the model made a decision. This matters in business contexts where stakeholders need to understand and trust a model's output, not just use it.",
      },
      {
        type: "h2",
        text: "Building Alongside Learning",
      },
      {
        type: "p",
        text: "Alongside working through the course content I have been building a learning site that publishes notes and interactive tools for each module. The act of converting lecture notes into clear, teachable pages forces a level of understanding that passive reading does not. You cannot explain something clearly if you do not understand it clearly.",
      },
      {
        type: "p",
        text: "The capstone task is a production optimisation problem: determine the optimal weekly production mix of two medical devices given constraints on labour, materials and capacity. This requires everything from the course: probability to quantify uncertainty, statistics to describe historical data, Python to run the calculations and linear programming to find the optimal decision.",
      },
      {
        type: "h2",
        text: "References",
      },
      {
        type: "ol-links",
        items: [
          { text: "Wikipedia: Business analytics - overview, methods and applications", url: "https://en.wikipedia.org/wiki/Business_analytics" },
          { text: "pandas documentation - the primary Python data analysis library", url: "https://pandas.pydata.org/docs/" },
          { text: "Kaggle - datasets and notebooks for applied data science practice", url: "https://www.kaggle.com" },
          { text: "Google Data Analytics Certificate on Coursera - structured data analytics curriculum", url: "https://www.coursera.org/professional-certificates/google-data-analytics" },
          { text: "scikit-learn documentation - machine learning tools used in the predictive analytics phase", url: "https://scikit-learn.org/stable/" },
        ],
      },
    ],
  }

export default _business_analytics_data_to_decisions
