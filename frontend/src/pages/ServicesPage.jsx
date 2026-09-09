import { useState, useEffect } from "react";
import {
  listServices,
  createService,
  updateService,
  deleteService,
} from "../api/client";
import { servicesPageStyles as s } from "../assets/dummyStyles";
import heroImg from "../assets/P3.png";
import {
  Plus,
  Save,
  X,
  Pencil,
  Trash2,
  Layers,
  Clock,
  IndianRupee,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";

const ICONS = ["C1.png", "C2.png", "C3.png", "C4.png", "C5.png", "C6.png", "C7.png", "C8.png"];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const emptyForm = {
  name: "",
  duration: 30,
  price: 0,
  description: "",
  icon: "C1.png",
  isActive: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadServices = () => {
    listServices()
      .then((r) => setServices(r.data.services || r.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadServices();
  }, []);

  const set = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      if (editingId) {
        await updateService(editingId, form);
        setMessage("Service updated.");
      } else {
        await createService(form);
        setMessage("Service created.");
      }
      setForm({ ...emptyForm });
      setEditingId(null);
      loadServices();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sv) => {
    setEditingId(sv._id);
    setForm({
      name: sv.name,
      duration: sv.duration,
      price: sv.price,
      description: sv.description || "",
      icon: sv.icon || "C1.png",
      isActive: sv.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      loadServices();
    } catch (err) {
      setMessage("Failed to delete.");
    }
  };

  const handleToggleActive = async (sv) => {
    try {
      await updateService(sv._id, { isActive: !sv.isActive });
      loadServices();
    } catch (err) {
      setMessage("Failed to update.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  return (
    <div className={s.mainGrid}>
      {/* ── Left ── */}
      <div>
        <div className={s.headerRow}>
          <div>
            <div className={s.pageLabel}>SERVICES</div>
            <h1 className={s.mainHeading}>
              Shape what customers
              <br />
              can <span className={s.gradientText}>book.</span>
            </h1>
            <p className={s.subText}>
              Add each appointment type with a duration and price. Active
              services appear on your public booking page.
            </p>
          </div>
          <div className={s.illustrationContainer}>
            <img src={heroImg} alt="" className={s.illustrationImg} />
          </div>
        </div>

        {/* Form */}
        <div className={s.formCard}>
          <div className={s.formTitle}>
            <Plus className={s.formTitleIcon} />
            {editingId ? "Edit service" : "Add new service"}
          </div>

          <form className={s.formGrid} onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className={s.inputLabel}>Service name</label>
              <div className={s.inputWrapper}>
                <Layers className={s.inputIcon} />
                <input
                  type="text"
                  className={s.textInput}
                  placeholder="Consultation"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
            </div>

            {/* Duration & Price */}
            <div className={s.durationPriceGrid}>
              <div>
                <label className={s.inputLabel}>Duration</label>
                <div className={s.inputWrapper}>
                  <Clock className={s.inputIcon} />
                  <select
                    className={s.selectInput}
                    value={form.duration}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        duration: Number(e.target.value),
                      }))
                    }
                  >
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} minutes
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={s.inputLabel}>Price</label>
                <div className={s.inputWrapper}>
                  <IndianRupee className={s.inputIcon} />
                  <input
                    type="number"
                    className={s.priceInput}
                    placeholder="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        price: Number(e.target.value),
                      }))
                    }
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={s.inputLabel}>Description</label>
              <div className={s.textareaWrapper}>
                <FileText className={s.textareaIcon} />
                <textarea
                  className={s.textareaInput}
                  rows={3}
                  placeholder="A short customer-facing description"
                  value={form.description}
                  onChange={set("description")}
                />
              </div>
            </div>

            {/* Icon selector */}
            <div>
              <label className={s.inputLabel}>Service Icon</label>
              <div className={s.iconGrid}>
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={
                      form.icon === icon ? s.iconBtnActive : s.iconBtnInactive
                    }
                    onClick={() => setForm((p) => ({ ...p, icon }))}
                  >
                    <img
                      src={`/src/assets/icons/${icon}`}
                      alt=""
                      className={s.iconImg}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className={s.formActions}>
              <button
                type="submit"
                className={s.submitButton}
                disabled={loading}
              >
                <Save className={s.submitIcon} />
                {loading
                  ? "Saving…"
                  : editingId
                  ? "Update service"
                  : "Add service"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className={s.cancelButton}
                  onClick={cancelEdit}
                >
                  <X className={s.cancelIcon} />
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && <div className={s.message}>{message}</div>}
        </div>
      </div>

      {/* ── Right: Service List ── */}
      <div className={s.rightSection}>
        <div className={s.rightTitle}>
          <Layers className={s.rightTitleIcon} />
          Your services
        </div>

        <div className={s.serviceList}>
          {services.length === 0 && (
            <div className={s.emptyState}>
              <Layers className={s.emptyIcon} />
              <p className={s.emptyText}>No services yet.</p>
            </div>
          )}

          {services.map((sv) => (
            <div key={sv._id} className={s.serviceCard}>
              <div className={s.serviceCardInner}>
                <div className={s.serviceInfoRow}>
                  <div className={s.serviceIconContainer}>
                    <img
                      src={`/src/assets/icons/${sv.icon || "C1.png"}`}
                      alt=""
                      className={s.serviceIconImg}
                    />
                  </div>
                  <div className={s.serviceTextBlock}>
                    <div className={s.serviceName}>{sv.name}</div>
                    <div className={s.serviceDetail}>
                      {sv.duration} min · ₹{sv.price}
                    </div>
                    {sv.description && (
                      <div className={s.serviceDesc}>{sv.description}</div>
                    )}
                  </div>
                </div>

                <div className={s.serviceActions}>
                  <button
                    className={
                      sv.isActive
                        ? s.visibilityBadgeActive
                        : s.visibilityBadgeInactive
                    }
                    onClick={() => handleToggleActive(sv)}
                  >
                    {sv.isActive ? (
                      <>
                        <Eye className="h-3 w-3" /> Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" /> Hidden
                      </>
                    )}
                  </button>
                  <button
                    className={s.editButton}
                    onClick={() => handleEdit(sv)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className={s.deleteButton}
                    onClick={() => handleDelete(sv._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
