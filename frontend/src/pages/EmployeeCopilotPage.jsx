import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client.js";

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function EmployeeAnswer({ answer }) {
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
      </section>
    );
  }

  const customerExplanation = [
    answer.process_title ? `Process: ${answer.process_title}` : null,
    answer.form_name ? `Form: ${answer.form_name}` : null,
    answer.required_documents
      ? `Required documents: ${answer.required_documents}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section className="answer-panel" aria-live="polite">
      <div className="answer-heading">
        <div>
          <p className="eyebrow">Employee checklist</p>
          <h2>{answer.process_title}</h2>
        </div>
        <span className="status-badge">{answer.confidence_status}</span>
      </div>

      <p>{answer.message}</p>
      <p className="warning-text">{answer.branch_variation_warning}</p>

      <dl className="detail-list">
        <DetailRow label="Last verified" value={answer.last_verified_date} />
        <DetailRow label="Quick checklist" value={answer.employee_steps} />
        <DetailRow label="Documents to verify" value={answer.required_documents} />
        <DetailRow label="Optional documents" value={answer.optional_documents} />
        <DetailRow label="Form to give" value={answer.form_name} />
        <DetailRow label="What to tell customer" value={customerExplanation} />
        <DetailRow label="Escalation note" value={answer.escalation_required} />
        <DetailRow
          label="Common mistakes to avoid"
          value={answer.common_rejection_reasons}
        />
      </dl>
    </section>
  );
}

export function EmployeeCopilotPage() {
  const [banks, setBanks] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedProcessId, setSelectedProcessId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [searching, setSearching] = useState(false);
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

  async function handleSearch(event) {
    event.preventDefault();

    if (!selectedBankId) {
      setError("Please select a bank first.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setAnswer(null);
      setSelectedProcessId("");

      const query = searchText.trim()
        ? `/api/processes?bank_id=${selectedBankId}&q=${encodeURIComponent(
            searchText.trim()
          )}`
        : `/api/processes?bank_id=${selectedBankId}`;

      const data = await apiRequest(query);
      setProcesses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedBankId) {
      setError("Please select a bank first.");
      return;
    }

    const query = selectedProcess?.process_name || searchText.trim();

    if (!query) {
      setError("Please search or select a process first.");
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
      <h1>Employee Copilot</h1>
      <p className="section-intro">
        Search a customer issue and use stored process data for a quick branch
        checklist.
      </p>

      <form className="assistant-form" onSubmit={handleSearch}>
        <label>
          Bank
          <select
            value={selectedBankId}
            onChange={(event) => {
              setSelectedBankId(event.target.value);
              setProcesses([]);
              setSelectedProcessId("");
              setAnswer(null);
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
          Search process
          <textarea
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setAnswer(null);
            }}
            placeholder="Example: Customer wants to update nominee"
            rows="3"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="button secondary" type="submit" disabled={searching}>
          {searching ? "Searching..." : "Search Processes"}
        </button>
      </form>

      {processes.length > 0 && (
        <form className="assistant-form compact-form" onSubmit={handleSubmit}>
          <label>
            Matching process
            <select
              value={selectedProcessId}
              onChange={(event) => {
                setSelectedProcessId(event.target.value);
                setAnswer(null);
              }}
            >
              <option value="">Use typed search text</option>
              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.employee_friendly_title ||
                    process.customer_friendly_title}
                </option>
              ))}
            </select>
          </label>

          <button className="button primary" type="submit" disabled={submitting}>
            {submitting ? "Opening checklist..." : "Open Checklist"}
          </button>
        </form>
      )}

      {processes.length === 0 && !searching && selectedBankId && searchText && (
        <section className="answer-panel muted-panel" aria-live="polite">
          <h2>No matching stored process</h2>
          <p>
            No process matched this search. Open the checklist anyway to see the
            unavailable response from stored-data rules.
          </p>
          <button className="button primary" type="button" onClick={handleSubmit}>
            Check Stored Data
          </button>
        </section>
      )}

      <EmployeeAnswer answer={answer} />
    </section>
  );
}
