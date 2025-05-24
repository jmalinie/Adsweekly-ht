"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { getSettings, updateSettings } from "@/app/actions/settings-actions"
import { toast } from "@/hooks/use-toast"

interface Settings {
  site_title: string
  site_description: string
  site_url: string
  admin_email: string
  posts_per_page: string
  show_author: string
  show_date: string
  dark_mode: string
  new_comment_notifications: string
  new_user_notifications: string
  newsletter_enabled: string
  cache_enabled: string
  debug_mode: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    site_title: "",
    site_description: "",
    site_url: "",
    admin_email: "",
    posts_per_page: "10",
    show_author: "true",
    show_date: "true",
    dark_mode: "false",
    new_comment_notifications: "true",
    new_user_notifications: "true",
    newsletter_enabled: "false",
    cache_enabled: "true",
    debug_mode: "false",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsData = await getSettings()
        setSettings((prev) => ({ ...prev, ...settingsData }))
      } catch (error) {
        console.error("Settings fetch error:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading settings.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateSettings(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while saving settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (key: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSwitchChange = (key: keyof Settings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: checked ? "true" : "false" }))
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure your blog's general settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    name="site_title"
                    value={settings.site_title}
                    onChange={(e) => handleInputChange("site_title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Input
                    id="site_description"
                    name="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange("site_description", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_url">Site URL</Label>
                  <Input
                    id="site_url"
                    name="site_url"
                    value={settings.site_url}
                    onChange={(e) => handleInputChange("site_url", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_email">Admin Email</Label>
                  <Input
                    id="admin_email"
                    name="admin_email"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => handleInputChange("admin_email", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize your blog's appearance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dark_mode">Theme</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="dark_mode"
                      name="dark_mode"
                      checked={settings.dark_mode === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("dark_mode", checked)}
                    />
                    <Label htmlFor="dark_mode">Dark Mode</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posts_per_page">Posts Per Page</Label>
                  <Input
                    id="posts_per_page"
                    name="posts_per_page"
                    type="number"
                    value={settings.posts_per_page}
                    onChange={(e) => handleInputChange("posts_per_page", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="show_author">Author Information</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_author"
                      name="show_author"
                      checked={settings.show_author === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("show_author", checked)}
                    />
                    <Label htmlFor="show_author">Show author information on post pages</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="show_date">Date Information</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_date"
                      name="show_date"
                      checked={settings.show_date === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("show_date", checked)}
                    />
                    <Label htmlFor="show_date">Show date information on post pages</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure email notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_comment_notifications">New Comment</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new_comment_notifications"
                      name="new_comment_notifications"
                      checked={settings.new_comment_notifications === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("new_comment_notifications", checked)}
                    />
                    <Label htmlFor="new_comment_notifications">Get notified when new comments are posted</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_user_notifications">New User</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="new_user_notifications"
                      name="new_user_notifications"
                      checked={settings.new_user_notifications === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("new_user_notifications", checked)}
                    />
                    <Label htmlFor="new_user_notifications">Get notified when new users register</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletter_enabled">Newsletter</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="newsletter_enabled"
                      name="newsletter_enabled"
                      checked={settings.newsletter_enabled === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("newsletter_enabled", checked)}
                    />
                    <Label htmlFor="newsletter_enabled">Send weekly newsletter</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>Advanced configuration options.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cache_enabled">Cache</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cache_enabled"
                      name="cache_enabled"
                      checked={settings.cache_enabled === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("cache_enabled", checked)}
                    />
                    <Label htmlFor="cache_enabled">Enable page caching</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="debug_mode">Debug Mode</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debug_mode"
                      name="debug_mode"
                      checked={settings.debug_mode === "true"}
                      onCheckedChange={(checked) => handleSwitchChange("debug_mode", checked)}
                    />
                    <Label htmlFor="debug_mode">Enable debug mode</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
