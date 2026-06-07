import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client.js";

const emptyBankForm = {
  bank_name: "",
  bank_type: "",
  country: "India",
  website: "",
  notes: "",
};

const emptyProcessForm = {
  bank_id: "",
  process_name: "",
  process_category: "",
  customer_friendly_title: "",
  employee_friendly_title: "",
  required_documents: "",
  optional_documents: "",
  form_name: "",
  form_link: "",
  originals_required: "Depends",
  photocopies_required: "Depends",
  self_attestation_required: "Depends",
  branch_visit_required: true,
  online_possible: false,
  estimated_time: "",
  customer_steps: "",
  employee_steps: "",
  common_rejection_reasons: "",
  escalation_required: "",
  branch_variation_note: "",
  last_verified_date: "",
  verified_by: "",
  source_type: "",
  confidence_status: "needs re-check",
  status: "active",
  internal_notes: "",
  public_notes: "",
};

const emptyContributorForm = {
  name: "",
  role: "",
  bank: "",
  branch_city: "",
  contact: "",
  contribution_count: 0,
  payment_status: "",
  trust_score: 0,
};

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function cleanPayload(payload) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      value === "" ? null : value,
    ])
  );
}

function Field({ label, children }) {
  return (
    <label>
      {label}
      {children}
    </label>
  );
}

function TextInput({ value, onChange, required = false, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TextArea({ value, onChange, required = false, rows = 3 }) {
  return (
    <textarea
      value={value}
      required={required}
      rows={rows}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

export function AdminPage() {
  const [token, setToken] = useState(
    () => window.localStorage.getItem("branchready_admin_token") || ""
  );
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [banks, setBanks] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [selectedProcessId, setSelectedProcessId] = useState("");
  const [selectedContributorId, setSelectedContributorId] = useState("");
  const [processSearch, setProcessSearch] = useState("");
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [processForm, setProcessForm] = useState(emptyProcessForm);
  const [contributorForm, setContributorForm] = useState(emptyContributorForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredProcesses = useMemo(() => {
    const search = processSearch.trim().toLowerCase();
    if (!search) {
      return processes;
    }

    return processes.filter((process) =>
      [
        process.process_name,
        process.customer_friendly_title,
        process.employee_friendly_title,
        process.process_category,
        process.confidence_status,
        process.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [processSearch, processes]);

  const selectedBank = useMemo(
    () => banks.find((bank) => String(bank.id) === selectedBankId),
    [banks, selectedBankId]
  );

  const selectedProcess = useMemo(
    () => processes.find((process) => String(process.id) === selectedProcessId),
    [processes, selectedProcessId]
  );

  const selectedContributor = useMemo(
    () =>
      contributors.find(
        (contributor) => String(contributor.id) === selectedContributorId
      ),
    [contributors, selectedContributorId]
  );

  async function loadAdminData(activeToken = token) {
    if (!activeToken) {
      return;
    }

    const headers = authHeaders(activeToken);
    const [bankData, processData, contributorData, feedbackData] =
      await Promise.all([
        apiRequest("/api/banks"),
        apiRequest("/api/admin/processes", { headers }),
        apiRequest("/api/admin/contributors", { headers }),
        apiRequest("/api/admin/feedback", { headers }),
      ]);

    setBanks(bankData);
    setProcesses(processData);
    setContributors(contributorData);
    setFeedback(feedbackData);
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    loadAdminData().catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!selectedBank) {
      setBankForm(emptyBankForm);
      return;
    }

    setBankForm({
      bank_name: selectedBank.bank_name || "",
      bank_type: selectedBank.bank_type || "",
      country: selectedBank.country || "India",
      website: selectedBank.website || "",
      notes: selectedBank.notes || "",
    });
  }, [selectedBank]);

  useEffect(() => {
    if (!selectedProcess) {
      setProcessForm((current) => ({
        ...emptyProcessForm,
        bank_id: current.bank_id || "",
      }));
      return;
    }

    setProcessForm({
      ...emptyProcessForm,
      ...selectedProcess,
      bank_id: String(selectedProcess.bank_id),
      branch_variation_note: selectedProcess.branch_variation_note || "",
      last_verified_date: selectedProcess.last_verified_date || "",
    });
  }, [selectedProcess]);

  useEffect(() => {
    if (!selectedContributor) {
      setContributorForm(emptyContributorForm);
      return;
    }

    setContributorForm({
      name: selectedContributor.name || "",
      role: selectedContributor.role || "",
      bank: selectedContributor.bank || "",
      branch_city: selectedContributor.branch_city || "",
      contact: selectedContributor.contact || "",
      contribution_count: selectedContributor.contribution_count || 0,
      payment_status: selectedContributor.payment_status || "",
      trust_score: selectedContributor.trust_score || 0,
    });
  }, [selectedContributor]);

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const data = await apiRequest("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      window.localStorage.setItem("branchready_admin_token", data.access_token);
      setToken(data.access_token);
      setMessage("Admin login successful.");
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    window.localStorage.removeItem("branchready_admin_token");
    setToken("");
    setBanks([]);
    setProcesses([]);
    setContributors([]);
    setFeedback([]);
    setMessage("");
    setError("");
  }

  async function saveBank(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const path = selectedBankId
        ? `/api/admin/banks/${selectedBankId}`
        : "/api/admin/banks";
      const method = selectedBankId ? "PUT" : "POST";

      await apiRequest(path, {
        method,
        headers: authHeaders(token),
        body: JSON.stringify(cleanPayload(bankForm)),
      });

      setMessage(selectedBankId ? "Bank updated." : "Bank created.");
      setSelectedBankId("");
      setBankForm(emptyBankForm);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveProcess(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const payload = cleanPayload({
        ...processForm,
        bank_id: Number(processForm.bank_id),
      });
      const path = selectedProcessId
        ? `/api/admin/processes/${selectedProcessId}`
        : "/api/admin/processes";
      const method = selectedProcessId ? "PUT" : "POST";

      await apiRequest(path, {
        method,
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });

      setMessage(selectedProcessId ? "Process updated." : "Process created.");
      setSelectedProcessId("");
      setProcessForm(emptyProcessForm);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveContributor(event) {
    event.preventDefault();

    try {
      setError("");
      setMessage("");
      const payload = cleanPayload({
        ...contributorForm,
        contribution_count: Number(contributorForm.contribution_count) || 0,
        trust_score: Number(contributorForm.trust_score) || 0,
      });
      const path = selectedContributorId
        ? `/api/admin/contributors/${selectedContributorId}`
        : "/api/admin/contributors";
      const method = selectedContributorId ? "PUT" : "POST";

      await apiRequest(path, {
        method,
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });

      setMessage(
        selectedContributorId ? "Contributor updated." : "Contributor created."
      );
      setSelectedContributorId("");
      setContributorForm(emptyContributorForm);
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateFeedbackStatus(feedbackId, status) {
    try {
      setError("");
      setMessage("");
      await apiRequest(`/api/admin/feedback/${feedbackId}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ status }),
      });
      setMessage("Feedback status updated.");
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!token) {
    return (
      <section className="content-panel">
        <h1>Admin Login</h1>
        <form className="assistant-form" onSubmit={handleLogin}>
          <Field label="Username">
            <TextInput
              value={loginForm.username}
              required
              onChange={(value) =>
                setLoginForm((current) => ({ ...current, username: value }))
              }
            />
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={loginForm.password}
              required
              onChange={(value) =>
                setLoginForm((current) => ({ ...current, password: value }))
              }
            />
          </Field>
          {error && <p className="form-error">{error}</p>}
          <button className="button primary" type="submit">
            Login
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="content-panel">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="section-intro">
            Manage banks, process data, contributors, verification status, and
            feedback.
          </p>
        </div>
        <button className="button secondary" type="button" onClick={logout}>
          Logout
        </button>
      </div>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      <section className="admin-section">
        <h2>Bank</h2>
        <Field label="Edit existing bank">
          <select
            value={selectedBankId}
            onChange={(event) => setSelectedBankId(event.target.value)}
          >
            <option value="">Create new bank</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.bank_name}
              </option>
            ))}
          </select>
        </Field>

        <form className="admin-grid" onSubmit={saveBank}>
          <Field label="Bank name">
            <TextInput
              value={bankForm.bank_name}
              required
              onChange={(value) =>
                setBankForm((current) => ({ ...current, bank_name: value }))
              }
            />
          </Field>
          <Field label="Bank type">
            <TextInput
              value={bankForm.bank_type}
              onChange={(value) =>
                setBankForm((current) => ({ ...current, bank_type: value }))
              }
            />
          </Field>
          <Field label="Country">
            <TextInput
              value={bankForm.country}
              required
              onChange={(value) =>
                setBankForm((current) => ({ ...current, country: value }))
              }
            />
          </Field>
          <Field label="Website">
            <TextInput
              value={bankForm.website}
              onChange={(value) =>
                setBankForm((current) => ({ ...current, website: value }))
              }
            />
          </Field>
          <Field label="Notes">
            <TextArea
              value={bankForm.notes}
              onChange={(value) =>
                setBankForm((current) => ({ ...current, notes: value }))
              }
            />
          </Field>
          <button className="button primary" type="submit">
            {selectedBankId ? "Update Bank" : "Create Bank"}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <h2>Process</h2>
        <Field label="Search processes">
          <TextInput
            value={processSearch}
            onChange={setProcessSearch}
          />
        </Field>
        <Field label="Edit existing process">
          <select
            value={selectedProcessId}
            onChange={(event) => setSelectedProcessId(event.target.value)}
          >
            <option value="">Create new process</option>
            {filteredProcesses.map((process) => (
              <option key={process.id} value={process.id}>
                {process.customer_friendly_title}
              </option>
            ))}
          </select>
        </Field>

        <form className="admin-grid" onSubmit={saveProcess}>
          <Field label="Bank">
            <select
              value={processForm.bank_id}
              required
              onChange={(event) =>
                setProcessForm((current) => ({
                  ...current,
                  bank_id: event.target.value,
                }))
              }
            >
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.bank_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Process name">
            <TextInput
              value={processForm.process_name}
              required
              onChange={(value) =>
                setProcessForm((current) => ({ ...current, process_name: value }))
              }
            />
          </Field>
          <Field label="Category">
            <TextInput
              value={processForm.process_category}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  process_category: value,
                }))
              }
            />
          </Field>
          <Field label="Customer title">
            <TextInput
              value={processForm.customer_friendly_title}
              required
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  customer_friendly_title: value,
                }))
              }
            />
          </Field>
          <Field label="Employee title">
            <TextInput
              value={processForm.employee_friendly_title}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  employee_friendly_title: value,
                }))
              }
            />
          </Field>
          <Field label="Required documents">
            <TextArea
              value={processForm.required_documents}
              required
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  required_documents: value,
                }))
              }
            />
          </Field>
          <Field label="Optional documents">
            <TextArea
              value={processForm.optional_documents}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  optional_documents: value,
                }))
              }
            />
          </Field>
          <Field label="Form name">
            <TextInput
              value={processForm.form_name}
              onChange={(value) =>
                setProcessForm((current) => ({ ...current, form_name: value }))
              }
            />
          </Field>
          <Field label="Form link">
            <TextInput
              value={processForm.form_link}
              onChange={(value) =>
                setProcessForm((current) => ({ ...current, form_link: value }))
              }
            />
          </Field>
          <Field label="Originals required">
            <select
              value={processForm.originals_required}
              onChange={(event) =>
                setProcessForm((current) => ({
                  ...current,
                  originals_required: event.target.value,
                }))
              }
            >
              <option>Yes</option>
              <option>No</option>
              <option>Depends</option>
            </select>
          </Field>
          <Field label="Photocopies required">
            <select
              value={processForm.photocopies_required}
              onChange={(event) =>
                setProcessForm((current) => ({
                  ...current,
                  photocopies_required: event.target.value,
                }))
              }
            >
              <option>Yes</option>
              <option>No</option>
              <option>Depends</option>
            </select>
          </Field>
          <Field label="Self-attestation required">
            <select
              value={processForm.self_attestation_required}
              onChange={(event) =>
                setProcessForm((current) => ({
                  ...current,
                  self_attestation_required: event.target.value,
                }))
              }
            >
              <option>Yes</option>
              <option>No</option>
              <option>Depends</option>
            </select>
          </Field>
          <Field label="Branch visit required">
            <Checkbox
              checked={processForm.branch_visit_required}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  branch_visit_required: value,
                }))
              }
            />
          </Field>
          <Field label="Online possible">
            <Checkbox
              checked={processForm.online_possible}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  online_possible: value,
                }))
              }
            />
          </Field>
          <Field label="Estimated time">
            <TextInput
              value={processForm.estimated_time}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  estimated_time: value,
                }))
              }
            />
          </Field>
          <Field label="Customer steps">
            <TextArea
              value={processForm.customer_steps}
              required
              rows={5}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  customer_steps: value,
                }))
              }
            />
          </Field>
          <Field label="Employee steps">
            <TextArea
              value={processForm.employee_steps}
              rows={5}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  employee_steps: value,
                }))
              }
            />
          </Field>
          <Field label="Common rejection reasons">
            <TextArea
              value={processForm.common_rejection_reasons}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  common_rejection_reasons: value,
                }))
              }
            />
          </Field>
          <Field label="Escalation note">
            <TextArea
              value={processForm.escalation_required}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  escalation_required: value,
                }))
              }
            />
          </Field>
          <Field label="Branch variation note">
            <TextArea
              value={processForm.branch_variation_note}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  branch_variation_note: value,
                }))
              }
            />
          </Field>
          <Field label="Last verified date">
            <TextInput
              type="date"
              value={processForm.last_verified_date}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  last_verified_date: value,
                }))
              }
            />
          </Field>
          <Field label="Verified by">
            <TextInput
              value={processForm.verified_by}
              onChange={(value) =>
                setProcessForm((current) => ({ ...current, verified_by: value }))
              }
            />
          </Field>
          <Field label="Source type">
            <TextInput
              value={processForm.source_type}
              onChange={(value) =>
                setProcessForm((current) => ({ ...current, source_type: value }))
              }
            />
          </Field>
          <Field label="Confidence status">
            <select
              value={processForm.confidence_status}
              onChange={(event) =>
                setProcessForm((current) => ({
                  ...current,
                  confidence_status: event.target.value,
                }))
              }
            >
              <option>verified</option>
              <option>needs re-check</option>
              <option>unverified</option>
              <option>bank-specific variation possible</option>
            </select>
          </Field>
          <Field label="Process status">
            <select
              value={processForm.status}
              onChange={(event) =>
                setProcessForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option>active</option>
              <option>inactive</option>
            </select>
          </Field>
          <Field label="Internal notes">
            <TextArea
              value={processForm.internal_notes}
              rows={4}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  internal_notes: value,
                }))
              }
            />
          </Field>
          <Field label="Public notes">
            <TextArea
              value={processForm.public_notes}
              rows={4}
              onChange={(value) =>
                setProcessForm((current) => ({
                  ...current,
                  public_notes: value,
                }))
              }
            />
          </Field>
          <button className="button primary" type="submit">
            {selectedProcessId ? "Update Process" : "Create Process"}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <h2>Contributor</h2>
        <Field label="Edit existing contributor">
          <select
            value={selectedContributorId}
            onChange={(event) => setSelectedContributorId(event.target.value)}
          >
            <option value="">Create new contributor</option>
            {contributors.map((contributor) => (
              <option key={contributor.id} value={contributor.id}>
                {contributor.name}
              </option>
            ))}
          </select>
        </Field>

        <form className="admin-grid" onSubmit={saveContributor}>
          <Field label="Name">
            <TextInput
              value={contributorForm.name}
              required
              onChange={(value) =>
                setContributorForm((current) => ({ ...current, name: value }))
              }
            />
          </Field>
          <Field label="Role">
            <TextInput
              value={contributorForm.role}
              onChange={(value) =>
                setContributorForm((current) => ({ ...current, role: value }))
              }
            />
          </Field>
          <Field label="Bank">
            <TextInput
              value={contributorForm.bank}
              onChange={(value) =>
                setContributorForm((current) => ({ ...current, bank: value }))
              }
            />
          </Field>
          <Field label="Branch/city">
            <TextInput
              value={contributorForm.branch_city}
              onChange={(value) =>
                setContributorForm((current) => ({
                  ...current,
                  branch_city: value,
                }))
              }
            />
          </Field>
          <Field label="Contact">
            <TextInput
              value={contributorForm.contact}
              onChange={(value) =>
                setContributorForm((current) => ({ ...current, contact: value }))
              }
            />
          </Field>
          <Field label="Contribution count">
            <TextInput
              type="number"
              value={contributorForm.contribution_count}
              onChange={(value) =>
                setContributorForm((current) => ({
                  ...current,
                  contribution_count: value,
                }))
              }
            />
          </Field>
          <Field label="Payment status">
            <TextInput
              value={contributorForm.payment_status}
              onChange={(value) =>
                setContributorForm((current) => ({
                  ...current,
                  payment_status: value,
                }))
              }
            />
          </Field>
          <Field label="Trust score">
            <TextInput
              type="number"
              value={contributorForm.trust_score}
              onChange={(value) =>
                setContributorForm((current) => ({
                  ...current,
                  trust_score: value,
                }))
              }
            />
          </Field>
          <button className="button primary" type="submit">
            {selectedContributorId ? "Update Contributor" : "Create Contributor"}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <h2>Feedback Review</h2>
        {feedback.length === 0 ? (
          <p className="section-intro">No feedback found.</p>
        ) : (
          <div className="feedback-list">
            {feedback.map((item) => (
              <article className="feedback-item" key={item.id}>
                <p>
                  <strong>{item.feedback_type}</strong> - {item.status}
                </p>
                <p>{item.user_feedback}</p>
                {item.suggested_correction && (
                  <p>Suggested correction: {item.suggested_correction}</p>
                )}
                <select
                  value={item.status}
                  onChange={(event) =>
                    updateFeedbackStatus(item.id, event.target.value)
                  }
                >
                  <option>new</option>
                  <option>reviewed</option>
                  <option>fixed</option>
                  <option>rejected</option>
                </select>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
