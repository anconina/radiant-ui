import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  MobileCheckbox,
  MobileFloatingInput,
  MobileForm,
  MobileFormActions,
  MobileFormField,
  MobileSelect,
} from '@/shared/ui/mobile-form'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { useIsMobile } from '@/shared/ui/responsive'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'

export function FormsPage() {
  const isMobile = useIsMobile()
  const [mobileFormData, setMobileFormData] = useState({
    name: '',
    email: '',
    role: '',
    newsletter: false,
  })

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Mobile form submitted:', mobileFormData)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Form Components</h1>
        <p className="text-muted-foreground">
          Interactive form elements and input controls for building forms.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Text Inputs</CardTitle>
            <CardDescription>Basic text input components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Enter your name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Enter your message" />
            </div>
          </CardContent>
        </Card>

        {/* Selection Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Selection Controls</CardTitle>
            <CardDescription>Checkboxes, radio buttons, and switches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="notifications" />
              <Label htmlFor="notifications">Enable notifications</Label>
            </div>

            <div className="space-y-3">
              <Label>Preferred contact method</Label>
              <RadioGroup defaultValue="email">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-option" />
                  <Label htmlFor="email-option">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-option" />
                  <Label htmlFor="phone-option">Phone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms-option" />
                  <Label htmlFor="sms-option">SMS</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Dropdown Selections */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown Selections</CardTitle>
            <CardDescription>Select components for choosing from options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Form Example</CardTitle>
            <CardDescription>A sample form combining multiple components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Acme Inc." />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="newsletter" />
              <Label htmlFor="newsletter">Subscribe to newsletter</Label>
            </div>

            <Button className="w-full">Submit Form</Button>
          </CardContent>
        </Card>

        {/* Mobile-Optimized Form Example */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Mobile-Optimized Form</CardTitle>
            <CardDescription>
              Mobile-first form with floating labels, larger touch targets, and optimized spacing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MobileForm onSubmit={handleMobileSubmit} spacing="normal">
              <MobileFormField>
                <MobileFloatingInput
                  label="Full Name"
                  type="text"
                  value={mobileFormData.name}
                  onChange={e => setMobileFormData({ ...mobileFormData, name: e.target.value })}
                  required
                />
              </MobileFormField>

              <MobileFormField>
                <MobileFloatingInput
                  label="Email Address"
                  type="email"
                  value={mobileFormData.email}
                  onChange={e => setMobileFormData({ ...mobileFormData, email: e.target.value })}
                  required
                />
              </MobileFormField>

              <MobileFormField>
                <MobileSelect
                  label="Role"
                  placeholder="Select your role"
                  value={mobileFormData.role}
                  onValueChange={value => setMobileFormData({ ...mobileFormData, role: value })}
                  options={[
                    { value: 'developer', label: 'Developer' },
                    { value: 'designer', label: 'Designer' },
                    { value: 'manager', label: 'Manager' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </MobileFormField>

              <MobileFormField>
                <MobileCheckbox
                  label="Subscribe to newsletter"
                  checked={mobileFormData.newsletter}
                  onCheckedChange={checked =>
                    setMobileFormData({ ...mobileFormData, newsletter: checked })
                  }
                />
              </MobileFormField>

              <MobileFormActions sticky={false}>
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Submit Mobile Form
                </Button>
              </MobileFormActions>
            </MobileForm>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
