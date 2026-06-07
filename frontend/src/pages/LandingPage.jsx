import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <section className="landing">
      <div>
        <p className="eyebrow">Bank visit guidance</p>
        <h1>Finish Bank Work Faster</h1>
        <p className="lead">
          Know the documents, forms, and branch steps before visiting your bank.
        </p>
        <div className="actions">
          <Link className="button primary" to="/customer">
            Check My Bank Work
          </Link>
          <Link className="button secondary" to="/employee">
            Employee Copilot
          </Link>
        </div>
      </div>
    </section>
  );
}
