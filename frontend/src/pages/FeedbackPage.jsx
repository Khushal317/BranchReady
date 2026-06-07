import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { apiRequest } from "../api/client.js";

const feedbackTypes = [
  "information was correct",
  "information was wrong",
  "branch asked for extra document",
  "process is outdated",
  "missing process request",
];

function optionalNumber(value) {
  return value ? Number(value) : null;
}

export function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const linkedBankId = searchParams.get("bank_id") || "";
  const linkedProcessId = searchParams.get("process_id") || "";
  const [form, setForm] = useState({
    bank_id: linkedBankId,
    process_id: linkedProcessId,
    feedback_type: feedbackTypes[0],
    user_feedback: "",
    suggested_correction: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasLinkedContext = useMemo(
    () => Boolean(linkedBankId || linkedProcessId),
    [linkedBankId, linkedProcessId]
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.user_feedback.trim()) {
      setError("Please describe your feedback.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          bank_id: optionalNumber(form.bank_id),
          process_id: optionalNumber(form.process_id),
          feedback_type: form.feedback_type,
          user_feedback: form.user_feedback.trim(),
          suggested_correction: form.suggested_correction.trim() || null,
          contact: form.contact.trim() || null,
          status: "new",
        }),
      });

      setMessage("Feedback submitted. Thank you for helping improve this data.");
      setForm((current) => ({
        ...current,
        user_feedback: "",
        suggested_correction: "",
        contact: "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-panel">
      <h1>Feedback</h1>
      <p className="section-intro">
        Tell us whether the stored process information was correct, incomplete,
        or outdated.
      </p>

      {hasLinkedContext && (
        <p className="context-note">
          This feedback is linked to the process you were viewing.
        </p>
      )}

      <form className="assistant-form" onSubmit={handleSubmit}>
        <label>
          Feedback type
          <select
            value={form.feedback_type}
            onChange={(event) => updateField("feedback_type", event.target.value)}
          >
            {feedbackTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Feedback
          <textarea
            value={form.user_feedback}
            required
            rows="5"
            onChange={(event) => updateField("user_feedback", event.target.value)}
            placeholder="Example: My branch asked for one extra photocopy."
          />
        </label>

        <label>
          Suggested correction
          <textarea
            value={form.suggested_correction}
            rows="4"
            onChange={(event) =>
              updateField("suggested_correction", event.target.value)
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Contact
          <input
            value={form.contact}
            onChange={(event) => updateField("contact", event.target.value)}
            placeholder="Optional email or phone"
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </section>
  );
}
