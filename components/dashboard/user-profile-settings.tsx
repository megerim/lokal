"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { errorHandler } from "@/lib/error-handler"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Bell,
  Shield,
  Settings,
  Camera,
  Heart,
  Coffee,
  Users,
  Lock,
  Eye,
  EyeOff,
  Save,
  X
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"
import type { UserProfileExtended, NotificationPreferences, PrivacySettings } from "@/lib/types"

const ACTIVITY_INTERESTS = [
  "Kitap Kulübü",
  "Film Gecesi",
  "Yoga",
  "Satranç",
  "Müzik",
  "Dans",
  "Fotoğrafçılık",
  "Yemek",
  "Spor",
  "Sanat",
  "Teknoloji",
  "Doğa Yürüyüşü",
  "Board Game",
  "Dil Öğrenme"
]

export function UserProfileSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfileExtended | null>(null)
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    id: '',
    user_id: '',
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    activity_reminders: true,
    new_comments: true,
    new_followers: true,
    created_at: '',
    updated_at: ''
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    id: '',
    user_id: '',
    show_profile: true,
    show_activities: true,
    show_connections: true,
    allow_messages: true,
    activity_visibility: 'public',
    created_at: '',
    updated_at: ''
  })
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    fetchUserProfile()
  }, [user])

  const fetchUserProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError
      }

      if (profileData) {
        setProfile(profileData)
        setAvatarUrl(profileData.avatar_url || '')
        setSelectedInterests(profileData.interests || [])
      } else {
        // Create initial profile if doesn't exist
        const newProfile = {
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          role: 'member' as const,
          bio: '',
          phone_number: '',
          birthday: ''
        }
        
        const { data: createdProfile, error: createError } = await supabase
          .from("user_profiles")
          .insert(newProfile)
          .select()
          .single()

        if (createError) throw createError
        setProfile(createdProfile)
      }

      // Fetch notification preferences
      const { data: notifData, error: notifError } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!notifError && notifData) {
        setNotifications(notifData)
      }

      // Fetch privacy settings
      const { data: privacyData, error: privacyError } = await supabase
        .from("privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (!privacyError && privacyData) {
        setPrivacy(privacyData)
      }

    } catch (error) {
      errorHandler.logError('Error fetching user profile', error)
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          phone_number: profile.phone_number,
          birthday: profile.birthday,
          avatar_url: avatarUrl,
          interests: selectedInterests,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)

      if (profileError) throw profileError

      // Update or create notification preferences
      const { error: notifError } = await supabase
        .from("notification_preferences")
        .upsert({
          ...notifications,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })

      if (notifError) throw notifError

      // Update or create privacy settings
      const { error: privacyError } = await supabase
        .from("privacy_settings")
        .upsert({
          ...privacy,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })

      if (privacyError) throw privacyError

      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
      })

    } catch (error) {
      errorHandler.logError('Error updating profile', error)
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold">Profil Ayarları</h2>
            <p className="text-sm text-muted-foreground">
              Profil bilgilerinizi ve tercihlerinizi yönetin
            </p>
          </div>
        </div>
        <Button onClick={handleProfileUpdate} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="interests">İlgi Alanları</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="privacy">Gizlilik</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Herkesin görebileceği profil bilgilerinizi düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Profil Fotoğrafı</Label>
                  <UploadButton<OurFileRouter, "imageUploader">
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      if (res?.[0]) {
                        setAvatarUrl(res[0].ufsUrl)
                        toast({
                          title: "Başarılı",
                          description: "Profil fotoğrafı yüklendi",
                        })
                      }
                    }}
                    onUploadError={(error: Error) => {
                      toast({
                        title: "Hata",
                        description: `Yükleme hatası: ${error.message}`,
                        variant: "destructive",
                      })
                    }}
                    appearance={{
                      button: "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium",
                      allowedContent: "hidden"
                    }}
                    content={{
                      button({ ready }) {
                        if (ready) return <><Camera className="w-4 h-4 mr-2" /> Fotoğraf Yükle</>
                        return "Hazırlanıyor..."
                      }
                    }}
                  />
                </div>
              </div>

              {/* Profile Fields */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">
                    <User className="w-4 h-4 inline mr-2" />
                    Ad Soyad
                  </Label>
                  <Input
                    id="fullName"
                    value={profile.full_name}
                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                    placeholder="Adınız ve soyadınız"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bio">
                    <Heart className="w-4 h-4 inline mr-2" />
                    Hakkımda
                  </Label>
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Kendinizden bahsedin..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefon
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone_number || ''}
                      onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                      placeholder="5XX XXX XX XX"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="birthday">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Doğum Tarihi
                    </Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={profile.birthday || ''}
                      onChange={(e) => setProfile({...profile, birthday: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İlgi Alanları</CardTitle>
              <CardDescription>
                Size özel aktivite önerileri için ilgi alanlarınızı seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_INTERESTS.map(interest => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer py-2 px-3"
                    onClick={() => toggleInterest(interest)}
                  >
                    {selectedInterests.includes(interest) && (
                      <Heart className="w-3 h-3 mr-1 fill-current" />
                    )}
                    {interest}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {selectedInterests.length} ilgi alanı seçildi
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>
                Hangi bildirimleri almak istediğinizi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif" className="text-base">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-posta Bildirimleri
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Önemli güncellemeler e-posta ile gönderilsin
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={notifications.email_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, email_notifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notif" className="text-base">
                      <Bell className="w-4 h-4 inline mr-2" />
                      Anlık Bildirimler
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tarayıcı bildirimleri alın
                    </p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={notifications.push_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, push_notifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif" className="text-base">
                      <Phone className="w-4 h-4 inline mr-2" />
                      SMS Bildirimleri
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Önemli etkinlikler için SMS alın
                    </p>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={notifications.sms_notifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, sms_notifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-remind" className="text-base">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Etkinlik Hatırlatıcıları
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Katılacağınız etkinlikler için hatırlatıcı
                    </p>
                  </div>
                  <Switch
                    id="activity-remind"
                    checked={notifications.activity_reminders}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, activity_reminders: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="new-comments" className="text-base">
                      <Users className="w-4 h-4 inline mr-2" />
                      Yeni Yorumlar
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Etkinliklerinize yapılan yorumlar
                    </p>
                  </div>
                  <Switch
                    id="new-comments"
                    checked={notifications.new_comments}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, new_comments: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gizlilik Ayarları</CardTitle>
              <CardDescription>
                Profilinizin görünürlüğünü ve gizlilik tercihlerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-profile" className="text-base">
                      <Eye className="w-4 h-4 inline mr-2" />
                      Profili Göster
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Diğer kullanıcılar profilinizi görebilir
                    </p>
                  </div>
                  <Switch
                    id="show-profile"
                    checked={privacy.show_profile}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, show_profile: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-activities" className="text-base">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Aktiviteleri Göster
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Katıldığınız aktiviteler profilinizde görünsün
                    </p>
                  </div>
                  <Switch
                    id="show-activities"
                    checked={privacy.show_activities}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, show_activities: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-connections" className="text-base">
                      <Users className="w-4 h-4 inline mr-2" />
                      Bağlantıları Göster
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Arkadaş listeniz görünür olsun
                    </p>
                  </div>
                  <Switch
                    id="show-connections"
                    checked={privacy.show_connections}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, show_connections: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-messages" className="text-base">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Mesajlara İzin Ver
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Diğer kullanıcılar size mesaj gönderebilir
                    </p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={privacy.allow_messages}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, allow_messages: checked})
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity-visibility">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Aktivite Görünürlüğü
                  </Label>
                  <Select
                    value={privacy.activity_visibility}
                    onValueChange={(value: 'public' | 'friends' | 'private') => 
                      setPrivacy({...privacy, activity_visibility: value})
                    }
                  >
                    <SelectTrigger id="activity-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Herkese Açık</SelectItem>
                      <SelectItem value="friends">Sadece Arkadaşlar</SelectItem>
                      <SelectItem value="private">Gizli</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Aktivite katılımlarınızı kimler görebilir
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}