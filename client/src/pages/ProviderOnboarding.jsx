import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProviderOnboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    // Step 1
    category: '', description: '', phone: '',
    // Step 2
    portfolio: [], certifications: [], languages: ['English'],
    // Step 3
    idDocument: '', backgroundCheck: false, skillTestCompleted: false, skillTestScore: 0,
    // Step 4
    availability: {}, serviceRadius: 10, emergencyWork: false, emergencyCharge: 0,
    // Step 5
    bankDetails: { accountNumber: '', ifscCode: '', accountHolderName: '' }, upiId: '', membershipTier: 'basic', insuranceOpted: false
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function submitStep(currentStep) {
    try {
      setLoading(true)
      setError('')
      await api.post('/auth/register/provider/step', {
        step: currentStep,
        userId: user?.id || user?._id,
        data: (currentStep === 1) ? { category: form.category, description: form.description, phone: form.phone }
          : (currentStep === 2) ? { portfolio: form.portfolio, certifications: form.certifications, languages: form.languages }
          : (currentStep === 3) ? { idDocument: form.idDocument, backgroundCheck: form.backgroundCheck, skillTestCompleted: form.skillTestCompleted, skillTestScore: form.skillTestScore }
          : (currentStep === 4) ? { availability: form.availability, serviceRadius: form.serviceRadius, emergencyWork: form.emergencyWork, emergencyCharge: form.emergencyCharge }
          : (currentStep === 5) ? { bankDetails: form.bankDetails, upiId: form.upiId, membershipTier: form.membershipTier, insuranceOpted: form.insuranceOpted }
          : {}
      })
      setStep(currentStep + 1)
    } catch (e) {
      console.error('Onboarding step failed', e)
      setError('Failed to submit step')
    } finally {
      setLoading(false)
    }
  }

  async function complete() {
    try {
      setLoading(true)
      setError('')
      await api.post('/auth/register/provider/complete', { userId: user?.id || user?._id })
      navigate('/dashboard/provider')
    } catch (e) {
      console.error('Onboarding complete failed', e)
      setError('Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Provider Onboarding</h1>
        <p className="dashboard-subtitle">Complete your profile to start receiving bookings</p>
      </div>

      {error && <div className="error-message" style={{ marginBottom: 16 }}>{error}</div>}

      {step <= 5 ? (
        <div className="dashboard-card">
          <h3>Step {step} of 5</h3>
          {step === 1 && (
            <div>
              <label>Category</label>
              <select value={form.category} onChange={e => update('category', e.target.value)}>
                <option value="">Select</option>
                {['driver','cook','plumber','electrician','cleaner','maid','gardener','other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <label>Description</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} />
              <label>Phone</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <div>
              <label>Languages</label>
              <input value={form.languages.join(', ')} onChange={e => update('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            </div>
          )}
          {step === 3 && (
            <div>
              <label>Background Check</label>
              <input type="checkbox" checked={form.backgroundCheck} onChange={e => update('backgroundCheck', e.target.checked)} />
              <label>Skill Test Completed</label>
              <input type="checkbox" checked={form.skillTestCompleted} onChange={e => update('skillTestCompleted', e.target.checked)} />
            </div>
          )}
          {step === 4 && (
            <div>
              <label>Service Radius (km)</label>
              <input type="number" value={form.serviceRadius} onChange={e => update('serviceRadius', Number(e.target.value))} />
              <label>Emergency Work</label>
              <input type="checkbox" checked={form.emergencyWork} onChange={e => update('emergencyWork', e.target.checked)} />
            </div>
          )}
          {step === 5 && (
            <div>
              <label>Account Holder Name</label>
              <input value={form.bankDetails.accountHolderName} onChange={e => setForm(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, accountHolderName: e.target.value } }))} />
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            {step < 5 ? (
              <button className="btn btn-primary" onClick={() => submitStep(step)} disabled={loading}>
                {loading ? 'Saving...' : 'Save & Continue'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={complete} disabled={loading}>
                {loading ? 'Finishing...' : 'Finish Onboarding'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-card">
          <h3>All steps completed</h3>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard/provider')}>Go to Dashboard</button>
        </div>
      )}
    </div>
  )
}


