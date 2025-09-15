import axios, { AxiosInstance, AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API_BASE_URL:', API_BASE_URL)
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
}

// Types
export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'enterprise'
  usage_count: number
  usage_limit: number
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  full_name?: string
}

export interface Project {
  id: number
  title: string
  description?: string
  status: 'active' | 'completed' | 'paused'
  client_name?: string
  budget?: number
  deadline?: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  project_id?: number
  milestone_id?: number
  due_date?: string
  time_tracked: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  address?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface Invoice {
  id: number
  invoice_number: string
  title?: string
  description?: string
  client_id?: number
  client_name: string
  client_email: string
  client_address?: string
  project_id?: number
  project_title?: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string
  sent_date?: string
  paid_date?: string
  notes?: string
  terms?: string
  is_recurring: boolean
  recurring_frequency?: string
  created_at: string
  updated_at?: string
  items?: InvoiceItem[]
}

export interface Milestone {
  id: number
  title: string
  description?: string
  project_id: number
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  priority: 'low' | 'medium' | 'high'
  progress: number
  due_date?: string
  completed_date?: string
  start_date?: string
  estimated_hours?: number
  actual_hours?: number
  notes?: string
  is_billable: boolean
  hourly_rate?: number
  created_at: string
  updated_at?: string
  tasks?: Task[]
}

export interface WorkLog {
  id: number
  title: string
  description?: string
  task_id?: number
  project_id?: number
  hours_worked: number
  start_time?: string
  end_time?: string
  ai_explanation?: string
  is_ai_generated: boolean
  is_billable: boolean
  hourly_rate?: number
  total_amount?: number
  status: 'logged' | 'approved' | 'rejected' | 'pending'
  notes?: string
  created_at: string
  updated_at?: string
}

export interface Notification {
  id: number
  title: string
  message: string
  type: 'task_due' | 'task_completed' | 'project_deadline' | 'milestone_completed' | 'invoice_overdue' | 'payment_received' | 'system_update' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  related_entity_type?: string
  related_entity_id?: number
  is_read: boolean
  is_archived: boolean
  action_url?: string
  action_text?: string
  created_at: string
  read_at?: string
  expires_at?: string
}

export interface AIRequest {
  tool: string
  prompt: string
  parameters?: Record<string, any>
  context?: string
}

export interface AIResponse {
  result: string
  usage_count: number
  usage_limit: number
  metadata?: Record<string, any>
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuth()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth methods
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return Cookies.get('access_token') || localStorage.getItem('access_token')
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return
    Cookies.set('access_token', token, { expires: 7 })
    localStorage.setItem('access_token', token)
  }

  private clearAuth(): void {
    if (typeof window === 'undefined') return
    Cookies.remove('access_token')
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  clearToken(): void {
    this.clearAuth()
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/api/v1/auth/login', credentials)
    this.setToken(response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Registering user with data:', userData)
      console.log('Making request to:', this.client.defaults.baseURL + '/api/v1/auth/register')
      const response: AxiosResponse<AuthResponse> = await this.client.post('/api/v1/auth/register', userData)
      console.log('Registration successful:', response.data)
      this.setToken(response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout')
    } finally {
      this.clearAuth()
    }
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/api/v1/auth/me')
    return response.data
  }

  async refreshToken(): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post('/api/v1/auth/refresh')
    this.setToken(response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    const response: AxiosResponse<Project[]> = await this.client.get('/api/v1/projects')
    return response.data
  }

  async getProject(id: number): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.get(`/api/v1/projects/${id}`)
    return response.data
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.post('/api/v1/projects', project)
    return response.data
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<Project> = await this.client.put(`/api/v1/projects/${id}`, project)
    return response.data
  }

  async deleteProject(id: number): Promise<void> {
    await this.client.delete(`/api/v1/projects/${id}`)
  }

  // Task methods
  async getTasks(projectId?: number): Promise<Task[]> {
    const params = projectId ? { project_id: projectId } : {}
    const response: AxiosResponse<Task[]> = await this.client.get('/api/v1/tasks', { params })
    return response.data
  }

  async getTask(id: number): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.get(`/api/v1/tasks/${id}`)
    return response.data
  }

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.post('/api/v1/tasks', task)
    return response.data
  }

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const response: AxiosResponse<Task> = await this.client.put(`/api/v1/tasks/${id}`, task)
    return response.data
  }

  async deleteTask(id: number): Promise<void> {
    await this.client.delete(`/api/v1/tasks/${id}`)
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    const response: AxiosResponse<Client[]> = await this.client.get('/api/v1/clients')
    return response.data
  }

  async getClient(id: number): Promise<Client> {
    const response: AxiosResponse<Client> = await this.client.get(`/api/v1/clients/${id}`)
    return response.data
  }

  async createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const response: AxiosResponse<Client> = await this.client.post('/api/v1/clients', client)
    return response.data
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client> {
    const response: AxiosResponse<Client> = await this.client.put(`/api/v1/clients/${id}`, client)
    return response.data
  }

  async deleteClient(id: number): Promise<void> {
    await this.client.delete(`/api/v1/clients/${id}`)
  }

  async toggleClientStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    const response: AxiosResponse<{ message: string; is_active: boolean }> = await this.client.patch(`/api/v1/clients/${id}/toggle-status`)
    return response.data
  }

  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    const response: AxiosResponse<Invoice[]> = await this.client.get('/api/v1/invoices')
    return response.data
  }

  async getInvoice(id: number): Promise<Invoice> {
    const response: AxiosResponse<Invoice> = await this.client.get(`/api/v1/invoices/${id}`)
    return response.data
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'invoice_number' | 'sent_date' | 'paid_date'>): Promise<Invoice> {
    const response: AxiosResponse<Invoice> = await this.client.post('/api/v1/invoices', invoice)
    return response.data
  }

  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    const response: AxiosResponse<Invoice> = await this.client.put(`/api/v1/invoices/${id}`, invoice)
    return response.data
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.client.delete(`/api/v1/invoices/${id}`)
  }

  async updateInvoiceStatus(id: number, status: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.patch(`/api/v1/invoices/${id}/status`, null, { params: { new_status: status } })
    return response.data
  }

  // Milestone methods
  async getMilestones(projectId?: number): Promise<Milestone[]> {
    const params = projectId ? { project_id: projectId } : {}
    const response: AxiosResponse<Milestone[]> = await this.client.get('/api/v1/milestones', { params })
    return response.data
  }

  async getMilestone(id: number): Promise<Milestone> {
    const response: AxiosResponse<Milestone> = await this.client.get(`/api/v1/milestones/${id}`)
    return response.data
  }

  async createMilestone(milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at' | 'completed_date'>): Promise<Milestone> {
    const response: AxiosResponse<Milestone> = await this.client.post('/api/v1/milestones', milestone)
    return response.data
  }

  async updateMilestone(id: number, milestone: Partial<Milestone>): Promise<Milestone> {
    const response: AxiosResponse<Milestone> = await this.client.put(`/api/v1/milestones/${id}`, milestone)
    return response.data
  }

  async deleteMilestone(id: number): Promise<void> {
    await this.client.delete(`/api/v1/milestones/${id}`)
  }

  async updateMilestoneStatus(id: number, status: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.patch(`/api/v1/milestones/${id}/status`, null, { params: { new_status: status } })
    return response.data
  }

  async updateMilestoneProgress(id: number, progress: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.patch(`/api/v1/milestones/${id}/progress`, null, { params: { progress } })
    return response.data
  }

  // Work Log methods
  async getWorkLogs(taskId?: number, projectId?: number): Promise<WorkLog[]> {
    const params: any = {}
    if (taskId) params.task_id = taskId
    if (projectId) params.project_id = projectId
    const response: AxiosResponse<WorkLog[]> = await this.client.get('/api/v1/work-logs', { params })
    return response.data
  }

  async getWorkLog(id: number): Promise<WorkLog> {
    const response: AxiosResponse<WorkLog> = await this.client.get(`/api/v1/work-logs/${id}`)
    return response.data
  }

  async createWorkLog(workLog: Omit<WorkLog, 'id' | 'created_at' | 'updated_at'>): Promise<WorkLog> {
    const response: AxiosResponse<WorkLog> = await this.client.post('/api/v1/work-logs', workLog)
    return response.data
  }

  async updateWorkLog(id: number, workLog: Partial<WorkLog>): Promise<WorkLog> {
    const response: AxiosResponse<WorkLog> = await this.client.put(`/api/v1/work-logs/${id}`, workLog)
    return response.data
  }

  async deleteWorkLog(id: number): Promise<void> {
    await this.client.delete(`/api/v1/work-logs/${id}`)
  }

  async updateWorkLogStatus(id: number, status: string): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.patch(`/api/v1/work-logs/${id}/status`, null, { params: { new_status: status } })
    return response.data
  }

  // Notification methods
  async getNotifications(unreadOnly?: boolean, priority?: string, type?: string): Promise<Notification[]> {
    const params: any = {}
    if (unreadOnly) params.unread_only = unreadOnly
    if (priority) params.priority = priority
    if (type) params.type = type
    
    const response: AxiosResponse<Notification[]> = await this.client.get('/api/v1/notifications', { params })
    return response.data
  }

  async getNotification(id: number): Promise<Notification> {
    const response: AxiosResponse<Notification> = await this.client.get(`/api/v1/notifications/${id}`)
    return response.data
  }

  async markNotificationRead(id: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.patch(`/api/v1/notifications/${id}/read`)
    return response.data
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.patch('/api/v1/notifications/read-all')
    return response.data
  }

  async deleteNotification(id: number): Promise<void> {
    await this.client.delete(`/api/v1/notifications/${id}`)
  }

  async getNotificationStats(): Promise<{ total_notifications: number; unread_notifications: number; high_priority_unread: number }> {
    const response: AxiosResponse<{ total_notifications: number; unread_notifications: number; high_priority_unread: number }> = await this.client.get('/api/v1/notifications/stats/summary')
    return response.data
  }

  // AI Tool methods
  async generateContent(request: AIRequest): Promise<AIResponse> {
    const response: AxiosResponse<AIResponse> = await this.client.post('/api/v1/ai/generate', request)
    return response.data
  }

  async generateAIContent(request: AIRequest): Promise<{ result: string; model: string; usage?: any }> {
    const response: AxiosResponse<{ result: string; model: string; usage?: any }> = await this.client.post('/api/v1/ai/generate', request)
    return response.data
  }

  // Analytics methods
  async getAnalytics(timeRange: string = '30'): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get(`/api/v1/analytics?time_range=${timeRange}`)
    return response.data
  }

  async getRevenueTrend(days: number = 30): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get(`/api/v1/analytics/revenue-trend?days=${days}`)
    return response.data
  }

  async getProjectPerformance(): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get('/api/v1/analytics/project-performance')
    return response.data
  }

  // Enhanced Invoice methods
  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    const response: AxiosResponse<Invoice> = await this.client.put(`/api/v1/invoices/${id}`, invoice)
    return response.data
  }

  async sendInvoice(id: number, recipientEmail?: string, customMessage?: string): Promise<void> {
    await this.client.post(`/api/v1/invoices/${id}/send`, {
      recipient_email: recipientEmail,
      custom_message: customMessage
    })
  }

  async generateInvoicePDF(id: number): Promise<any> {
    const response: AxiosResponse<any> = await this.client.get(`/api/v1/invoices/${id}/pdf`)
    return response.data
  }

  async getUsageStats(): Promise<{ usage_count: number; usage_limit: number }> {
    const response: AxiosResponse<{ usage_count: number; usage_limit: number }> = await this.client.get('/api/v1/ai/usage')
    return response.data
  }

  // File upload
  async uploadFile(file: File, type: 'avatar' | 'project' | 'task'): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const response: AxiosResponse<{ url: string }> = await this.client.post('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  getCurrentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}

export const apiClient = new ApiClient()