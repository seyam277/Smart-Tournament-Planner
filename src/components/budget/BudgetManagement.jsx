import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as dataService from '../../services/dataService'

const BudgetManagement = () => {
  const { id } = useParams()
  const [expenses, setExpenses] = useState([])
  const [tournament, setTournament] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: 'Prize money',
    amount: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const tournamentData = await dataService.getTournamentById(id)
      const expensesData = await dataService.getExpensesByTournament(id)
      setTournament(tournamentData)
      setExpenses(expensesData)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    if (!formData.amount) {
      alert('Please enter amount')
      return
    }

    const newExpense = await dataService.addExpense({
      ...formData,
      tournamentId: id,
      amount: parseFloat(formData.amount)
    })
    setExpenses([...expenses, newExpense])
    setFormData({ category: 'Prize money', amount: '', description: '' })
    setShowForm(false)
  }

  const totalBudget = tournament?.budget || 0
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const remainingBudget = totalBudget - totalExpenses

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--text-h)', marginBottom: '30px' }}>Budget Management</h1>

      {/* Budget Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <BudgetCard label="Total Budget" amount={totalBudget} color="var(--accent)" />
        <BudgetCard label="Total Expenses" amount={totalExpenses} color="#ff6b6b" />
        <BudgetCard label="Remaining Budget" amount={Math.max(0, remainingBudget)} color={remainingBudget >= 0 ? '#0a0' : '#c00'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        {/* Expenses List */}
        <div>
          <h2 style={{ color: 'var(--text-h)', marginBottom: '20px' }}>Expense Details</h2>
          {expenses.length === 0 ? (
            <p style={{ color: 'var(--text)' }}>No expenses recorded yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'var(--bg)',
                borderRadius: '8px'
              }}>
                <thead>
                  <tr style={{ background: 'var(--accent)', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, idx) => (
                    <tr key={expense.id} style={{ borderBottom: `1px solid var(--border)` }}>
                      <td style={{ padding: '12px' }}>{expense.category}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>৳{expense.amount}</td>
                      <td style={{ padding: '12px' }}>{expense.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Expense Form */}
        <div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              width: '100%',
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add Expense'}
          </button>

          {showForm && (
            <form
              onSubmit={handleAddExpense}
              style={{
                background: 'var(--bg)',
                border: `1px solid var(--border)`,
                borderRadius: '8px',
                padding: '20px'
              }}
            >
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Category:
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid var(--border)`,
                    borderRadius: '4px',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    boxSizing: 'border-box'
                  }}
                >
                  <option>Prize money</option>
                  <option>Food and refreshments</option>
                  <option>Venue or ground rent</option>
                  <option>Equipment</option>
                  <option>Referee payments</option>
                  <option>Transportation</option>
                  <option>Miscellaneous</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Amount:
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Amount in BDT"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid var(--border)`,
                    borderRadius: '4px',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Description:
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Details about this expense"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid var(--border)`,
                    borderRadius: '4px',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Record Expense
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

const BudgetCard = ({ label, amount, color }) => (
  <div style={{
    background: 'var(--bg)',
    border: `2px solid ${color}`,
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center'
  }}>
    <p style={{ color: 'var(--text)', margin: '0 0 10px 0', fontSize: '14px' }}>{label}</p>
    <p style={{ color: color, fontSize: '28px', fontWeight: 'bold', margin: 0 }}>৳{amount.toFixed(2)}</p>
  </div>
)

export default BudgetManagement
