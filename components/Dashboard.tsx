'use client'
import React, { useState, useEffect } from 'react'
import { Settings, Package, Cpu, Users, AlertCircle, TrendingUp, TrendingDown, FileText, Ship, Tag, User as UserIcon, RefreshCw } from 'lucide-react'
import Notification from './Notification'
import Modal from './Modal'
import type { User as UserType, NewUser, NotificationState, Stat, QuickAction } from '@/types'

export default function Dashboard() {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  })
  const [createUserModal, setCreateUserModal] = useState<boolean>(false)
  const [manageUserModal, setManageUserModal] = useState<boolean>(false)
  const [settingsModal, setSettingsModal] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    role: '',
    phone: ''
  })
  
  // Data from database
  const [users, setUsers] = useState<UserType[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [operations, setOperations] = useState<any[]>([])
  const [systemStatus, setSystemStatus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch data from database
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [usersRes, statsRes, opsRes, statusRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/stats'),
        fetch('/api/operations'),
        fetch('/api/system-status'),
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        // Map stats with icons
        const statsWithIcons = (statsData.stats || []).map((stat: any) => ({
          ...stat,
          icon: getIconForStat(stat.label),
        }))
        setStats(statsWithIcons)
      }

      if (opsRes.ok) {
        const opsData = await opsRes.json()
        setOperations(opsData.operations || [])
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        setSystemStatus(statusData.statuses || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      showNotification('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
  }

  const getIconForStat = (label: string) => {
    const iconMap: Record<string, any> = {
      'Pending Orders': Package,
      'System Uptime': Cpu,
      'New Registrations': Users,
      'Open Support Tickets': AlertCircle,
    }
    return iconMap[label] || Package
  }

  const showNotification = (message: string, type: NotificationState['type'] = 'success') => {
    setNotification({ show: true, message, type })
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.phone) {
      showNotification('Please fill all fields', 'error')
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(`User ${newUser.name} created successfully!`, 'success')
        setCreateUserModal(false)
        setNewUser({ name: '', email: '', role: '', phone: '' })
        await fetchDashboardData() // Refresh data
      } else {
        showNotification(data.error || 'Failed to create user', 'error')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      showNotification('Error creating user', 'error')
    }
  }

  const handleManageUser = (user: UserType) => {
    setSelectedUser(user)
    setManageUserModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const roleSelect = document.getElementById('user-role-select') as HTMLSelectElement
      const statusSelect = document.getElementById('user-status-select') as HTMLSelectElement
      
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: roleSelect?.value || selectedUser.role, 
          status: statusSelect?.value || selectedUser.status 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showNotification('User updated successfully', 'success')
        setManageUserModal(false)
        await fetchDashboardData() // Refresh data
      } else {
        showNotification(data.error || 'Failed to update user', 'error')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      showNotification('Error updating user', 'error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        showNotification('User deleted successfully', 'success')
        setManageUserModal(false)
        await fetchDashboardData() // Refresh data
      } else {
        const data = await response.json()
        showNotification(data.error || 'Failed to delete user', 'error')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('Error deleting user', 'error')
    }
  }

  const handleApproveOperation = async (operationId: string) => {
    try {
      const response = await fetch(`/api/operations/${operationId}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        showNotification('Operation approved', 'success')
        await fetchDashboardData() // Refresh data
      } else {
        showNotification('Failed to approve operation', 'error')
      }
    } catch (error) {
      console.error('Error approving operation:', error)
      showNotification('Error approving operation', 'error')
    }
  }

  const quickActions: QuickAction[] = [
    { icon: FileText, title: 'Generate Report', desc: 'Run monthly operational reports.', color: 'bg-green-50' },
    { icon: Ship, title: 'Shipment Tracker', desc: 'Monitor all active logistics status.', color: 'bg-blue-50' },
    { icon: Tag, title: 'Manage Product Catalog', desc: 'Update pricing and product details.', color: 'bg-amber-50' }
  ]

  const statBgByColor: Record<string, string> = {
    warning: 'bg-amber-50',
    success: 'bg-green-50',
    info: 'bg-blue-50',
    danger: 'bg-red-50'
  }

  const statusClassByStatus: Record<string, string> = {
    Active: 'bg-green-50 text-green-800',
    Locked: 'bg-red-50 text-red-800',
    Pending: 'bg-amber-50 text-amber-800',
    Suspended: 'bg-gray-100 text-gray-700',
    Inactive: 'bg-gray-50 text-gray-600'
  }

  const statusBgByService: Record<string, string> = {
    Operational: 'bg-green-50 border-green-200',
    Warning: 'bg-amber-50 border-amber-200',
    Down: 'bg-red-50 border-red-200',
  }

  const statusColorByService: Record<string, string> = {
    Operational: 'text-green-800',
    Warning: 'text-amber-800',
    Down: 'text-red-800',
  }

  const statusEmoji: Record<string, string> = {
    Operational: '🟢',
    Warning: '🟡',
    Down: '🔴',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-green-600 text-white font-bold text-base">A</div>
            <div className="text-lg font-bold text-gray-900">OMPOI Admin</div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 font-medium text-gray-900 hover:text-green-600 transition-colors"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => showNotification('Support page coming soon!', 'warning')}
              className="font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              Support
            </button>
            <button
              onClick={() => setSettingsModal(true)}
              className="inline-flex items-center gap-2 font-medium text-gray-900 hover:text-green-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div
              onClick={() => showNotification('User profile menu coming soon!', 'warning')}
              className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors"
            >
              AD
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">Admin Dashboard</div>
            <div className="text-sm text-gray-500 mt-1">
              Overview for Operations & IT Management 
              {loading && <span className="ml-2">(Loading...)</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => showNotification('Opening IT Settings panel...', 'success')}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              IT Settings
            </button>
            <button
              onClick={() => setCreateUserModal(true)}
              className="px-4 py-2.5 rounded-xl bg-green-500 border border-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-500/25"
            >
              + Create New User
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading && stats.length === 0 ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-28"></div>
              </div>
            ))
          ) : (
            stats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div
                  key={idx}
                  onClick={() => showNotification(`Viewing ${stat.label}`, 'success')}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-sm text-gray-500">{stat.label}</div>
                    <div className={`p-2.5 rounded-lg ${statBgByColor[stat.color || 'info']}`}>
                      <Icon className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  {stat.trend && (
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {stat.trendValue} vs last week
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* User Management Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="font-bold text-gray-900">
                  User & Access Control <span className="text-xs text-green-600 font-semibold">(IT Admin)</span>
                  <span className="text-xs text-gray-500 ml-2">({users.length} users)</span>
                </div>
                <button
                  onClick={() => window.location.href = '/admin/users'}
                  className="text-sm text-green-600 font-semibold hover:text-green-700"
                >
                  View All Users
                </button>
              </div>
              <div className="p-4 divide-y divide-gray-100">
                {loading && users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No users found</div>
                ) : (
                  users.slice(0, 4).map((user) => (
                    <div key={user.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">#{user.id}: {user.name}</div>
                          <div className="text-xs text-gray-500">Role: {user.role} | {user.lastLogin || 'Never logged in'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${statusClassByStatus[user.status || 'Pending']}`}>
                          {user.status || 'Pending'}
                        </span>
                        <button
                          onClick={() => handleManageUser(user)}
                          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Operations Queue Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="font-bold text-gray-900">
                  Operations Review Queue <span className="text-xs text-green-600 font-semibold">(Ops Admin)</span>
                </div>
                <button
                  onClick={() => window.location.href = '/admin/operations'}
                  className="text-sm text-green-600 font-semibold hover:text-green-700"
                >
                  View Full Queue
                </button>
              </div>
              <div className="p-4 space-y-3">
                {loading && operations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Loading operations...</div>
                ) : operations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No operations in queue</div>
                ) : (
                  operations.slice(0, 2).map((op) => (
                    <div key={op.id} className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-gray-900">#{op.orderCode}: {op.title}</div>
                        <div className="text-xs text-gray-500">{op.description} | {op.relatedEntity}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                          op.status === 'PendingQC' ? 'bg-amber-50 text-amber-800' : 
                          op.status === 'Hold' ? 'bg-red-50 text-red-800' :
                          'bg-gray-50 text-gray-800'
                        }`}>
                          {op.status === 'PendingQC' ? 'Pending QC' : op.status}
                        </span>
                        <button
                          onClick={() => op.status === 'Hold' ? 
                            handleApproveOperation(op.id) : 
                            showNotification('Opening review...', 'success')
                          }
                          className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-green-500 hover:text-white transition-all"
                        >
                          {op.status === 'Hold' ? 'Approve' : 'Review'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* System Status Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md">
              <div className="p-4 border-b border-gray-200">
                <div className="font-bold text-gray-900">System Status (IT)</div>
              </div>
              <div className="p-3 space-y-2">
                {loading && systemStatus.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">Loading system status...</div>
                ) : systemStatus.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No system status data</div>
                ) : (
                  systemStatus.map((status) => (
                    <div
                      key={status.id}
                      onClick={() => showNotification(`${status.serviceName}: ${status.status}`, 
                        status.status === 'Down' ? 'error' : status.status === 'Warning' ? 'warning' : 'success'
                      )}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white hover:shadow-sm transition-all border ${statusBgByService[status.status]}`}
                    >
                      <span className="text-2xl">{statusEmoji[status.status]}</span>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{status.serviceName}</div>
                        <div className={`text-xs ${statusColorByService[status.status]}`}>{status.details}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md">
              <div className="p-4 border-b border-gray-200">
                <div className="font-bold text-gray-900">Quick Operations Access</div>
              </div>
              <div className="p-3 space-y-2">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon
                  return (
                    <div
                      key={idx}
                      onClick={() => showNotification(`Opening ${action.title}...`, 'success')}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white hover:border hover:border-green-500 hover:shadow-sm transition-all ${action.color}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{action.title}</div>
                        <div className="text-xs text-gray-600">{action.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={createUserModal}
        onClose={() => setCreateUserModal(false)}
        title="Create New User"
        footer={
          <>
            <button
              onClick={() => setCreateUserModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateUser}
              className="px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600"
            >
              Create User
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Full Name</div>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Email Address</div>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Role</div>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            >
              <option value="">Select role...</option>
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
              <option value="QCAgent">QC Agent</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Phone Number</div>
            <input
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={manageUserModal}
        onClose={() => setManageUserModal(false)}
        title={`Manage User: ${selectedUser?.name || ''}`}
        footer={
          <>
            <button
              onClick={() => handleDeleteUser(selectedUser?.id || '')}
              className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100"
            >
              Delete User
            </button>
            <button
              onClick={() => setManageUserModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateUser}
              className="px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600"
            >
              Save Changes
            </button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">User ID</div>
              <div className="text-sm font-medium">#{selectedUser.id}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Full Name</div>
              <div className="text-sm font-medium">{selectedUser.name}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Role</div>
              <select
                defaultValue={selectedUser.role}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              >
                <option>Buyer</option>
                <option>Seller</option>
                <option>QC Agent</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Status</div>
              <select
                defaultValue={selectedUser.status}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              >
                <option>Active</option>
                <option>Locked</option>
                <option>Suspended</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={settingsModal}
        onClose={() => setSettingsModal(false)}
        title="Settings"
        footer={
          <>
            <button
              onClick={() => setSettingsModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                showNotification('Settings saved', 'success')
                setSettingsModal(false)
              }}
              className="px-4 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600"
            >
              Save Settings
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Notification Preferences</div>
            <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
              <option>All Notifications</option>
              <option>Important Only</option>
              <option>None</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Theme</div>
            <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
              <option>Light Mode</option>
              <option>Dark Mode</option>
              <option>Auto</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Language</div>
            <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
        </div>
      </Modal>

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
    </div>
  )
}