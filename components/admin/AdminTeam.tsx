'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import AvatarUpload from '@/components/ui/AvatarUpload'
import { TeamMember } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/admin/team-members')
      const data = await response.json()

      if (response.ok) {
        setMembers(data.teamMembers || [])
      } else {
        throw new Error(data.error || 'Failed to load team members')
      }
    } catch (error: any) {
      console.error('Error loading members:', error)
      toast.error(error.message || 'Lỗi khi tải danh sách thành viên')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setCurrentMember({
      name: '',
      role: '',
      bio: '',
      display_order: members.length
    })
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!currentMember.name || !currentMember.role) {
      toast.error('Vui lòng điền đầy đủ tên và vai trò')
      return
    }

    try {
      const url = currentMember.id
        ? `/api/admin/team-members/${currentMember.id}`
        : '/api/admin/team-members'

      const method = currentMember.id ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentMember)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || (currentMember.id ? 'Đã cập nhật thành viên' : 'Đã thêm thành viên mới'))
        setEditMode(false)
        setCurrentMember({})
        loadMembers()
      } else {
        throw new Error(data.error || 'Failed to save team member')
      }
    } catch (error: any) {
      console.error('Error saving member:', error)
      toast.error(error.message || 'Lỗi khi lưu thành viên')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa thành viên này?')) {
      try {
        const response = await fetch(`/api/admin/team-members/${id}`, {
          method: 'DELETE'
        })

        const data = await response.json()

        if (response.ok) {
          toast.success(data.message || 'Đã xóa thành viên')
          loadMembers()
        } else {
          throw new Error(data.error || 'Failed to delete team member')
        }
      } catch (error: any) {
        console.error('Error deleting member:', error)
        toast.error(error.message || 'Lỗi khi xóa thành viên')
      }
    }
  }

  if (editMode) {
    return (
      <div>
        <Card>
          <h2 className="text-2xl font-bold text-text mb-6">
            {currentMember.id ? 'Chỉnh Sửa Thành Viên' : 'Thêm Thành Viên Mới'}
          </h2>

          <div className="space-y-4">
            <Input
              label="Tên"
              value={currentMember.name || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
              required
              placeholder="Nguyễn Văn A"
            />

            <Input
              label="Vai trò"
              value={currentMember.role || ''}
              onChange={(e) => setCurrentMember({ ...currentMember, role: e.target.value })}
              required
              placeholder="CEO / Giám đốc / Nhà sáng lập"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
              <textarea
                value={currentMember.bio || ''}
                onChange={(e) => setCurrentMember({ ...currentMember, bio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary focus:outline-none"
                rows={4}
                placeholder="Giới thiệu ngắn gọn về thành viên..."
              />
            </div>

            <AvatarUpload
              label="Avatar"
              currentAvatar={currentMember.avatar}
              onUploadSuccess={(url) => setCurrentMember({ ...currentMember, avatar: url })}
              onRemove={() => setCurrentMember({ ...currentMember, avatar: '' })}
              size="lg"
              uploading={uploading}
              setUploading={setUploading}
            />

            <Input
              label="Twitter"
              value={currentMember.social_links?.twitter || ''}
              onChange={(e) => setCurrentMember({
                ...currentMember,
                social_links: { ...currentMember.social_links, twitter: e.target.value }
              })}
            />

            <Input
              label="LinkedIn"
              value={currentMember.social_links?.linkedin || ''}
              onChange={(e) => setCurrentMember({
                ...currentMember,
                social_links: { ...currentMember.social_links, linkedin: e.target.value }
              })}
            />

            <Input
              label="GitHub"
              value={currentMember.social_links?.github || ''}
              onChange={(e) => setCurrentMember({
                ...currentMember,
                social_links: { ...currentMember.social_links, github: e.target.value }
              })}
            />

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={uploading || !currentMember.name || !currentMember.role}
              >
                {uploading ? 'Đang tải ảnh...' : 'Lưu'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setEditMode(false); setCurrentMember({}) }}
                disabled={uploading}
              >
                Hủy
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text">Quản Lý Đội Ngũ</h2>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Thành Viên
        </Button>
      </div>

      {members.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thành viên</h3>
            <p className="text-gray-500">Thêm thành viên đầu tiên</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <Card key={member.id} hover>
              <div className="flex items-start gap-4">
                {member.avatar && (
                  <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text">{member.name}</h3>
                  <p className="text-primary font-medium mb-2">{member.role}</p>
                  {member.bio && <p className="text-gray-600">{member.bio}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => { setCurrentMember(member); setEditMode(true) }}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="w-4 h-4 text-error" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
