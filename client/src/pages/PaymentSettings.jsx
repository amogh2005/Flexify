import { useState, useEffect } from 'react'
import { api } from '../api/client'
import './PaymentSettings.css'

export default function PaymentSettings() {
  const [paymentMethods, setPaymentMethods] = useState({
    bank: null,
    upi: null
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('bank')
  const [formData, setFormData] = useState({
    bank: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: ''
    },
    upi: {
      upiId: ''
    }
  })
  const [earnings, setEarnings] = useState(null)

  useEffect(() => {
    loadPaymentMethods()
    loadEarningsSummary()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      const response = await api.get('/payments/payment-methods')
      setPaymentMethods(response.data)
      
      // Pre-fill form with existing data
      if (response.data.bank) {
        setFormData(prev => ({
          ...prev,
          bank: {
            accountNumber: response.data.bank.accountNumber || '',
            ifscCode: response.data.bank.ifscCode || '',
            accountHolderName: response.data.bank.accountHolderName || '',
            bankName: response.data.bank.bankName || ''
          }
        }))
      }
      if (response.data.upi) {
        setFormData(prev => ({
          ...prev,
          upi: {
            upiId: response.data.upi || ''
          }
        }))
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEarningsSummary = async () => {
    try {
      const response = await api.get('/payments/earnings-summary')
      setEarnings(response.data)
    } catch (error) {
      console.error('Error loading earnings:', error)
    }
  }

  const handleInputChange = (method, field, value) => {
    setFormData(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }))
  }

  const handleSavePaymentMethod = async (method) => {
    setSaving(true)
    try {
      const details = formData[method]
      await api.post('/payments/payment-method', {
        method,
        details
      })
      
      // Reload payment methods
      await loadPaymentMethods()
      alert(`${method === 'bank' ? 'Bank' : 'UPI'} details saved successfully!`)
    } catch (error) {
      console.error('Error saving payment method:', error)
      alert('Failed to save payment method. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleRequestWithdrawal = async () => {
    const amount = prompt('Enter withdrawal amount:')
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const paymentMethod = paymentMethods.bank ? 'bank' : 'upi'
    if (!paymentMethods.bank && !paymentMethods.upi) {
      alert('Please configure a payment method first')
      return
    }

    try {
      const response = await api.post('/payments/request-withdrawal', {
        amount: parseFloat(amount),
        paymentMethod
      })
      
      alert(`Withdrawal request submitted! Transaction ID: ${response.data.withdrawalRequest.transactionId}`)
      await loadEarningsSummary()
    } catch (error) {
      console.error('Error requesting withdrawal:', error)
      alert(error.response?.data?.message || 'Failed to request withdrawal')
    }
  }

  if (loading) {
    return (
      <div className="payment-settings-container">
        <div className="loading">Loading payment settings...</div>
      </div>
    )
  }

  return (
    <div className="payment-settings-container">
      <div className="payment-header">
        <h1>Payment Settings</h1>
        <p>Manage your payment methods and track your earnings</p>
      </div>

      {/* Earnings Summary */}
      {earnings && (
        <div className="earnings-summary">
          <h2>Earnings Summary</h2>
          <div className="earnings-grid">
            <div className="earnings-card">
              <div className="earnings-label">Total Earnings</div>
              <div className="earnings-value">${earnings.totalEarnings.toFixed(2)}</div>
            </div>
            <div className="earnings-card">
              <div className="earnings-label">Platform Fees</div>
              <div className="earnings-value">${earnings.platformFees.toFixed(2)}</div>
            </div>
            <div className="earnings-card highlight">
              <div className="earnings-label">Available Balance</div>
              <div className="earnings-value">${earnings.netEarnings.toFixed(2)}</div>
            </div>
            <div className="earnings-card">
              <div className="earnings-label">This Month</div>
              <div className="earnings-value">${earnings.thisMonthEarnings.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="withdrawal-section">
            <button 
              className="btn btn-primary"
              onClick={handleRequestWithdrawal}
              disabled={earnings.netEarnings < 50}
            >
              Request Withdrawal
            </button>
            {earnings.netEarnings < 50 && (
              <p className="withdrawal-note">Minimum withdrawal amount is $50</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <div className="payment-methods">
        <h2>Payment Methods</h2>
        
        <div className="payment-tabs">
          <button 
            className={`tab-btn ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            Bank Account
          </button>
          <button 
            className={`tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
            onClick={() => setActiveTab('upi')}
          >
            UPI
          </button>
        </div>

        <div className="payment-form">
          {activeTab === 'bank' && (
            <div className="form-section">
              <h3>Bank Account Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={formData.bank.accountNumber}
                    onChange={(e) => handleInputChange('bank', 'accountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={formData.bank.ifscCode}
                    onChange={(e) => handleInputChange('bank', 'ifscCode', e.target.value)}
                    placeholder="Enter IFSC code"
                  />
                </div>
                <div className="form-group">
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    value={formData.bank.accountHolderName}
                    onChange={(e) => handleInputChange('bank', 'accountHolderName', e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank.bankName}
                    onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => handleSavePaymentMethod('bank')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Bank Details'}
              </button>
            </div>
          )}

          {activeTab === 'upi' && (
            <div className="form-section">
              <h3>UPI Details</h3>
              <div className="form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  value={formData.upi.upiId}
                  onChange={(e) => handleInputChange('upi', 'upiId', e.target.value)}
                  placeholder="Enter UPI ID (e.g., yourname@paytm)"
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => handleSavePaymentMethod('upi')}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save UPI Details'}
              </button>
            </div>
          )}
        </div>

        {/* Current Payment Methods */}
        <div className="current-methods">
          <h3>Current Payment Methods</h3>
          <div className="method-cards">
            {paymentMethods.bank && (
              <div className="method-card">
                <div className="method-icon">🏦</div>
                <div className="method-info">
                  <div className="method-type">Bank Account</div>
                  <div className="method-details">
                    {paymentMethods.bank.accountNumber} • {paymentMethods.bank.ifscCode}
                  </div>
                </div>
              </div>
            )}
            {paymentMethods.upi && (
              <div className="method-card">
                <div className="method-icon">📱</div>
                <div className="method-info">
                  <div className="method-type">UPI</div>
                  <div className="method-details">{paymentMethods.upi}</div>
                </div>
              </div>
            )}
            {!paymentMethods.bank && !paymentMethods.upi && (
              <div className="no-methods">
                <p>No payment methods configured</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
