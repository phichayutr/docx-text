import { useState } from 'react'
import {
  FileText,
  LayoutTemplate,
  PenTool,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Upload,
  Download,
  type LucideIcon,
} from 'lucide-react'

interface MenuItem {
  icon: LucideIcon
  label: string
  id: string
  divider?: never
}

interface DividerItem {
  divider: true
  icon?: never
  label?: never
  id?: never
}

type MenuEntry = MenuItem | DividerItem

const menuItems: MenuEntry[] = [
  { icon: Home, label: 'Home', id: 'home' },
  // { icon: FileText, label: 'New Document', id: 'new' },
  // { icon: LayoutTemplate, label: 'Templates', id: 'templates' },
  // { icon: Upload, label: 'Import', id: 'import' },
  // { icon: Download, label: 'Export', id: 'export' },
  // { icon: PenTool, label: 'Sign', id: 'sign' },
  // { divider: true },
  // { icon: Settings, label: 'Settings', id: 'settings' },
]

interface SidebarProps {
  activeItem: string
  onNavigate: (id: string) => void
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false)

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        {!collapsed && <span className="brand-text">Doc Editor</span>}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item, index) =>
          'divider' in item && item.divider ? (
            <li key={index} className="sidebar-divider" />
          ) : (
            <li key={(item as MenuItem).id}>
              <button
                className={`sidebar-item ${activeItem === (item as MenuItem).id ? 'active' : ''}`}
                onClick={() => onNavigate((item as MenuItem).id)}
                title={collapsed ? (item as MenuItem).label : undefined}
              >
                {(() => {
                  const Icon = (item as MenuItem).icon
                  return <Icon size={20} />
                })()}
                {!collapsed && <span>{(item as MenuItem).label}</span>}
              </button>
            </li>
          )
        )}
      </ul>
    </nav>
  )
}
