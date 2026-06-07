import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client.js";

const initialAnswer = null;

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const displayValue =
    typeof value === "boolean" ? (value ? "Yes" : "No") : value;

  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{displayValue}</dd>
    </div>
  );
}

function AnswerResult({ answer }) {
  if (!answer) {
    return null;
  }

  if (!answer.available) {
    return (
      <section className="answer-panel muted-panel" aria-live="polite">
        <h2>Information unavailable</h2>
        <p>{answer.message}</p>
        <p className="warning-text">{answer.branch_variation_warning}</p>
        <DetailRow label="Confidence status" value={answer.confidence_status} />
        <FeedbackAction />
      </section>
    );
  }

  return (
    <section className="answer-panel" aria-live="polite">
      <div className="answer-heading">
        <div>
          <p className="eyebrow">Stored process data</p>
          <h2>{answer.process_title}</h2>
        </div>
        <span className="status-badge">{answer.confidence_status}</span>
      </div>

      <p>{answer.message}</p>
      <p className="warning-text">{answer.branch_variation_warning}</p>

      <dl className="detail-list">
        <DetailRow label="Last verified" value={answer.last_verified_date} />
        <DetailRow label="Required documents" value={answer.required_documents} />
        <DetailRow label="Optional documents" value={answer.optional_documents} />
        <DetailRow label="Originals needed" value={answer.originals_required} />
        <DetailRow label="Photocopies needed" value={answer.photocopies_required} />
        <DetailRow
          label="Self-attestation needed"
          value={answer.self_attestation_required}
        />
        <DetailRow label="Form required" value={answer.form_name} />
        <DetailRow label="Branch visit required" value={answer.branch_visit_required} />
        <DetailRow label="Online possible" value={answer.online_possible} />
        <DetailRow label="Estimated time" value={answer.estimated_time} />
        <DetailRow label="Branch steps" value={answer.customer_steps} />
        <DetailRow
          label="Common rejection reasons"
          value={answer.common_rejection_reasons}
        />
        <DetailRow label="Public notes" value={answer.public_notes} />
      </dl>

      <FeedbackAction processId={answer.process_id} bankId={answer.bank_id} />
    </section>
  );
}

function FeedbackAction({ processId, bankId }) {
  const searchParams = new URLSearchParams();

  if (bankId) {
    searchParams.set("bank_id", bankId);
  }

  if (processId) {
    searchParams.set("process_id", processId);
  }

  const feedbackPath = searchParams.toString()
    ? `/feedback?${searchParams.toString()}`
    : "/feedback";

  return (
    <Link className="text-link" to={feedbackPath}>
      Share feedback about this information
    </Link>
  );
}

export function CustomerAssistantPage() {
  const [banks, setBanks] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedProcessId, setSelectedProcessId] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(initialAnswer);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedProcess = useMemo(
    () =>
      processes.find((process) => String(process.id) === selectedProcessId) ||
      null,
    [processes, selectedProcessId]
  );

  useEffect(() => {
    async function loadBanks() {
      try {
        setLoadingBanks(true);
        setError("");
        const data = await apiRequest("/api/banks");
        setBanks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingBanks(false);
      }
    }

    loadBanks();
  }, []);

  useEffect(() => {
    async function loadProcesses() {
      if (!selectedBankId) {
        setProcesses([]);
        setSelectedProcessId("");
        return;
      }

      try {
        setLoadingProcesses(true);
        setError("");
        const data = await apiRequest(`/api/processes?bank_id=${selectedBankId}`);
        setProcesses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProcesses(false);
      }
    }

    loadProcesses();
  }, [selectedBankId]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedBankId) {
      setError("Please select a bank first.");
      return;
    }

    const query = selectedProcess?.process_name || question.trim();

    if (!query) {
      setError("Please select a process or type your question.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const data = await apiRequest(
        `/api/answer?bank_id=${selectedBankId}&q=${encodeURIComponent(query)}`
      );
      setAnswer(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="content-panel">
      <h1>Customer Assistant</h1>
      <p className="section-intro">
        Select a bank and process, or type your banking task. Answers come only
        from stored process data.
      </p>

      <form className="assistant-form" onSubmit={handleSubmit}>
        <label>
          Bank
          <select
            value={selectedBankId}
            onChange={(event) => {
              setSelectedBankId(event.target.value);
              setAnswer(initialAnswer);
            }}
            disabled={loadingBanks}
          >
            <option value="">
              {loadingBanks ? "Loading banks..." : "Select bank"}
            </option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.bank_name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Process
          <select
            value={selectedProcessId}
            onChange={(event) => {
              setSelectedProcessId(event.target.value);
              setAnswer(initialAnswer);
            }}
            disabled={!selectedBankId || loadingProcesses}
          >
            <option value="">
              {loadingProcesses ? "Loading processes..." : "Select process"}
            </option>
            {processes.map((process) => (
              <option key={process.id} value={process.id}>
                {process.customer_friendly_title}
              </option>
            ))}
          </select>
        </label>

        <label>
          Or type your question
          <textarea
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setAnswer(initialAnswer);
            }}
            placeholder="Example: I want to change my father's name in passbook"
            rows="4"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="button primary" type="submit" disabled={submitting}>
          {submitting ? "Checking..." : "Check Process"}
        </button>
      </form>

      <AnswerResult answer={answer} />
    </section>
  );
}
