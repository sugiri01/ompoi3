'use client'
import React, { useState } from 'react'
import { Settings, Package, Cpu, Users, AlertCircle, TrendingUp, TrendingDown, FileText, Ship, Tag, User as UserIcon } from 'lucide-react'
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

  const showNotification = (message: string, type: NotificationState['type'] = 'success') => {
    setNotification({ show: true, message, type })
  }

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.phone) {
      showNotification('Please fill all fields', 'error')
      return
    }
    showNotification(`User ${newUser.name} created successfully!`, 'success')
    setCreateUserModal(false)
    setNewUser({ name: '', email: '', role: '', phone: '' })
  }

  const handleManageUser = (user: UserType) => {
    setSelectedUser(user)
    setManageUserModal(true)
  }

  const stats: Stat[] = [
    { label: 'Pending Orders', value: '147', icon: Package, trend: 'down', trendValue: '5%', color: 'warning' },
    { label: 'System Uptime', value: '99.9%', icon: Cpu, trend: 'up', trendValue: '0.05%', color: 'success' },
    { label: 'New Registrations', value: '25', icon: Users, trend: 'up', trendValue: '12%', color: 'info' },
    { label: 'Open Support Tickets', value: '7', icon: AlertCircle, trend: 'up', trendValue: '2 High', color: 'danger' }
  ]

  const users: UserType[] = [
    { id: 'U00128', name: 'John Doe', role: 'Seller', status: 'Active', lastLogin: '5 mins ago' },
    { id: 'U00055', name: 'Jane Smith', role: 'Buyer', status: 'Active', lastLogin: '2 days ago' },
    { id: 'U00340', name: 'Tech Tester', role: 'QC Agent', status: 'Locked', lastLogin: 'Account Locked' },
    { id: 'U00401', name: 'New User', role: 'Buyer', status: 'Pending', lastLogin: 'Email Verification Pending' }
  ]

  const quickActions: QuickAction[] = [
    { icon: FileText, title: 'Generate Report', desc: 'Run monthly operational reports.', color: 'bg-green-50' },
    { icon: Ship, title: 'Shipment Tracker', desc: 'Monitor all active logistics status.', color: 'bg-blue-50' },
    { icon: Tag, title: 'Manage Product Catalog', desc: 'Update pricing and product details.', color: 'bg-amber-50' }
  ]

  const statBgByColor: Record<Stat['color'], string> = {
    warning: 'bg-amber-50',
    success: 'bg-green-50',
    info: 'bg-blue-50',
    danger: 'bg-red-50'
  }

  const statusClassByStatus: Record<'Active' | 'Locked' | 'Pending' | 'Suspended', string> = {
    Active: 'bg-green-50 text-green-800',
    Locked: 'bg-red-50 text-red-800',
    Pending: 'bg-amber-50 text-amber-800',
    Suspended: 'bg-gray-100 text-gray-700'
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
            <div className="text-sm text-gray-500 mt-1">Overview for Operations & IT Management</div>
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
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                onClick={() => showNotification(`Viewing ${stat.label}`, 'success')}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className={`p-2.5 rounded-lg ${statBgByColor[stat.color]}`}>
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stat.trendValue} vs last week
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Column - Main Content */}
          <div className="space-y-6">
            {/* User Management Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="font-bold text-gray-900">User & Access Control <span className="text-xs text-green-600 font-semibold">(IT Admin)</span></div>
                <button
                  onClick={() => showNotification('Loading all users...', 'success')}
                  className="text-sm text-green-600 font-semibold hover:text-green-700"
                >
                  View All Users
                </button>
              </div>
              <div className="p-4 divide-y divide-gray-100">
                {users.map((user) => (
                  <div key={user.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-gray-900 truncate">#{user.id}: {user.name}</div>
                        <div className="text-xs text-gray-500">Role: {user.role} | {user.lastLogin}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${statusClassByStatus[user.status]}`}>{user.status}</span>
                      <button
                        onClick={() => handleManageUser(user)}
                        className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-green-500 hover:text-white transition-all whitespace-nowrap"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations Queue Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="font-bold text-gray-900">Operations Review Queue <span className="text-xs text-green-600 font-semibold">(Ops Admin)</span></div>
                <button
                  onClick={() => showNotification('Loading full operations queue...', 'success')}
                  className="text-sm text-green-600 font-semibold hover:text-green-700"
                >
                  View Full Queue
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900">#ORD-9012: Cashew Lot 42</div>
                    <div className="text-xs text-gray-500">QC Report Approval | Seller: East Africa Traders</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 whitespace-nowrap">Pending QC</span>
                    <button
                      onClick={() => showNotification('Opening review...', 'success')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-green-500 hover:text-white transition-all"
                    >
                      Review
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900">#TXN-1002: $15,000 Payment</div>
                    <div className="text-xs text-gray-500">High Value Transaction | Buyer: Global Nuts Inc.</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-800">Hold</span>
                    <button
                      onClick={() => showNotification('Transaction approved', 'success')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-green-500 hover:text-white transition-all"
                    >
                      Approve
                    </button>
                  </div>
                </div>
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
                <div
                  onClick={() => showNotification('API Gateway: Operational', 'success')}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-2xl">🟢</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">API Gateway</div>
                    <div className="text-xs text-green-800">Operational. Latency: 50ms</div>
                  </div>
                </div>
                <div
                  onClick={() => showNotification('Database: High Load', 'warning')}
                  className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-2xl">🟡</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Database Server</div>
                    <div className="text-xs text-amber-800">High Load. CPU: 85%</div>
                  </div>
                </div>
                <div
                  onClick={() => showNotification('Reconnecting...', 'success')}
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:bg-white hover:shadow-sm transition-all"
                >
                  <span className="text-2xl">🔴</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">Logistics Partner Sync</div>
                    <div className="text-xs text-red-800">Connection failed 3 hours ago.</div>
                  </div>
                </div>
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
              <option value="QC Agent">QC Agent</option>
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
              onClick={() => setManageUserModal(false)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-semibold text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                showNotification('Changes saved', 'success')
                setManageUserModal(false)
              }}
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