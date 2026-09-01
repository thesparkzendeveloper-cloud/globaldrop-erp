import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  Globe,
  Building2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";

interface BranchOption {
  name: string;
  status: "active" | "inactive";
}

interface CountryOption {
  name: string;
  code: string;
  branches?: BranchOption[];
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [branch, setBranch] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [hasOptions, setHasOptions] = useState(false);

  const navigate = useNavigate();

  // Fetch register options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_API}/auth/register-options`,
        );
        if (response.ok) {
          const data = await response.json();
          const countriesList = data.countries || [];

          setCountries(countriesList);

          if (countriesList.length > 0) {
            const firstCountry = countriesList[0];
            setCountry(firstCountry.name);
            const firstCountryBranches =
              firstCountry.branches?.filter(
                (b: any) => b.status === "active",
              ) || [];
            if (firstCountryBranches.length > 0) {
              setBranch(firstCountryBranches[0].name);
            }
            setHasOptions(true);
          }
        }
      } catch (err: any) {
        console.error("Error fetching register options:", err);
        // Fall back to no options gracefully
      }
    };

    fetchOptions();
  }, []);

  const selectedCountryObj = countries.find((c) => c.name === country);
  const availableBranches =
    selectedCountryObj?.branches?.filter((b: any) => b.status === "active") ||
    [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !phone || !password) {
      setError("Please fill in all the required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_API}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            country: hasOptions ? country : "",
            branch: hasOptions ? branch : "",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        "Your registration was successful! An administrator must approve your account before you can log in.",
      );

      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (err: any) {
      setError(
        err.message ||
          "An error occurred during registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-xl mb-3">
            <span className="text-xl font-bold text-blue-600">GD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            GlobalDrop ERP
          </h1>
          <p className="text-blue-100 mt-1 text-sm">
            Join the enterprise resource planning portal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
              Account Registration
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs sm:text-sm text-emerald-800">
              <p className="font-semibold mb-1">
                Registration Request Submitted
              </p>
              <p>{success}</p>
              <button
                onClick={() => navigate("/login")}
                className="mt-3 btn-primary w-full py-2 justify-center"
              >
                Go to Sign In
              </button>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Smith"
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@company.com"
                      className="form-input pl-10"
                      autoCapitalize="off"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Phone Number</label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (212) 555-0100"
                      className="form-input pl-10"
                    />
                  </div>
                </div>
              </div>

              {hasOptions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Country</label>
                    <div className="relative">
                      <Globe
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                      />
                      <select
                        value={country}
                        onChange={(e) => {
                          const newCountryName = e.target.value;
                          setCountry(newCountryName);
                          const targetCountryObj = countries.find(
                            (c) => c.name === newCountryName,
                          );
                          const targetBranches =
                            targetCountryObj?.branches?.filter(
                              (b) => b.status === "active",
                            ) || [];
                          if (targetBranches.length > 0) {
                            setBranch(targetBranches[0].name);
                          } else {
                            setBranch("");
                          }
                        }}
                        className="form-input pl-10 relative"
                        required
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Branch</label>
                    <div className="relative">
                      <Building2
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
                      />
                      <select
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="form-input pl-10 relative"
                        required
                      >
                        {availableBranches.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="form-input pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 sm:py-3 mt-2 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Register Account"}
                {!loading && <UserPlus size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
