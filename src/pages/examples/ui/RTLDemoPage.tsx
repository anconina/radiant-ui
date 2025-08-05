import * as React from 'react'

import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CornerDownLeft,
  Play,
  Send,
} from 'lucide-react'

import { useDirectionalStyles, useLanguage } from '@/shared/lib/i18n'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group'
import { FlippableIcon } from '@/shared/ui/rtl'
import { Switch } from '@/shared/ui/switch'

export default function RTLDemoPage() {
  const { direction } = useDirectionalStyles()
  const { changeLanguage, language } = useLanguage()
  const [switchValue1, setSwitchValue1] = React.useState(false)
  const [switchValue2, setSwitchValue2] = React.useState(true)
  const [switchValue3, setSwitchValue3] = React.useState(false)
  const [radioValue, setRadioValue] = React.useState('option-one')

  const toggleDirection = () => {
    // Toggle between English (LTR) and Hebrew (RTL)
    changeLanguage(language === 'he' ? 'en' : 'he')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">RTL Support Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates right-to-left (RTL) language support using CSS logical properties.
        </p>
        <div className="mt-4">
          <Button onClick={toggleDirection} size="lg">
            Toggle Direction (Currently: {direction.toUpperCase()})
          </Button>
        </div>
      </div>

      {/* CSS Logical Properties */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Logical Properties</CardTitle>
          <CardDescription>
            These utilities adapt automatically based on text direction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Margin and Padding */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Margin & Padding</h3>
            <div className="space-y-2">
              <div className="p-4 bg-secondary rounded">
                <div className="bg-primary text-primary-foreground p-2 ms-4">
                  margin-inline-start: 1rem (ms-4)
                </div>
              </div>
              <div className="p-4 bg-secondary rounded">
                <div className="bg-primary text-primary-foreground p-2 me-4">
                  margin-inline-end: 1rem (me-4)
                </div>
              </div>
              <div className="p-4 bg-secondary rounded">
                <div className="bg-primary text-primary-foreground ps-8 pe-2 py-2">
                  padding-inline: start 2rem, end 0.5rem (ps-8 pe-2)
                </div>
              </div>
            </div>
          </div>

          {/* Positioning */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Positioning</h3>
            <div className="relative h-32 bg-secondary rounded">
              <div className="absolute start-0 top-0 bg-primary text-primary-foreground p-2 text-sm">
                start-0 top-0
              </div>
              <div className="absolute end-0 bottom-0 bg-primary text-primary-foreground p-2 text-sm">
                end-0 bottom-0
              </div>
            </div>
          </div>

          {/* Borders */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Borders</h3>
            <div className="space-y-2">
              <div className="p-4 border-s-4 border-primary bg-secondary">
                border-inline-start: 4px (border-s-4)
              </div>
              <div className="p-4 border-e-4 border-primary bg-secondary">
                border-inline-end: 4px (border-e-4)
              </div>
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Border Radius</h3>
            <div className="flex gap-4">
              <div className="p-4 bg-primary text-primary-foreground rounded-s-lg">
                rounded-start (rounded-s-lg)
              </div>
              <div className="p-4 bg-primary text-primary-foreground rounded-e-lg">
                rounded-end (rounded-e-lg)
              </div>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Text Alignment</h3>
            <div className="space-y-2">
              <div className="p-4 bg-secondary text-start">text-align: start (text-start)</div>
              <div className="p-4 bg-secondary text-end">text-align: end (text-end)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Directional Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Directional Icons</CardTitle>
          <CardDescription>Icons that adapt based on reading direction</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Explicit RTL/LTR Icon Classes</h3>
            <div className="flex gap-4">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                Back
              </Button>
              <Button>
                Next
                <ChevronRight className="w-4 h-4 ltr:ml-2 rtl:mr-2" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">FlippableIcon Component</h3>
            <div className="flex gap-4">
              <Button variant="outline" size="icon">
                <FlippableIcon icon={ArrowLeft} />
              </Button>
              <Button variant="outline" size="icon">
                <FlippableIcon icon={ArrowRight} />
              </Button>
              <Button variant="outline" size="icon">
                <FlippableIcon icon={CornerDownLeft} />
              </Button>
              <Button variant="outline" size="icon">
                <FlippableIcon icon={Send} />
              </Button>
              <Button variant="outline" size="icon">
                <FlippableIcon icon={Play} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Example */}
      <Card>
        <CardHeader>
          <CardTitle>RTL-Ready Form</CardTitle>
          <CardDescription>Form layout that works in both directions</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <textarea
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter your message..."
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit">
                Submit
                <ChevronRight className="w-4 h-4 ltr:ml-2 rtl:mr-2" />
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Switch Components */}
      <Card>
        <CardHeader>
          <CardTitle>Switch Components</CardTitle>
          <CardDescription>
            Toggle switches that adapt to RTL layout - the thumb moves left when checked in RTL mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Switch Examples</h3>

            {/* Switch with label on the end side */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch id="airplane-mode" checked={switchValue1} onCheckedChange={setSwitchValue1} />
              <Label htmlFor="airplane-mode" className="cursor-pointer">
                Airplane Mode
              </Label>
            </div>

            {/* Switch with label on the start side */}
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="cursor-pointer">
                Enable Notifications
              </Label>
              <Switch id="notifications" checked={switchValue2} onCheckedChange={setSwitchValue2} />
            </div>

            {/* Switch in a form-like layout */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing" className="text-base cursor-pointer">
                    Marketing emails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about new products, features, and more.
                  </p>
                </div>
                <Switch id="marketing" checked={switchValue3} onCheckedChange={setSwitchValue3} />
              </div>
            </div>

            {/* Disabled switch example */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch id="disabled-switch" disabled checked={true} />
              <Label htmlFor="disabled-switch" className="opacity-50 cursor-not-allowed">
                Disabled Switch (Always On)
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Switch Behavior in RTL</h3>
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p>✓ In LTR mode: Switch thumb moves from left to right when toggled on</p>
              <p>✓ In RTL mode: Switch thumb moves from right to left when toggled on</p>
              <p>✓ Uses Tailwind CSS rtl: modifiers for directional transforms</p>
              <p>✓ Transitions work smoothly in both directions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radio Group Components */}
      <Card>
        <CardHeader>
          <CardTitle>Radio Group Components</CardTitle>
          <CardDescription>
            Radio buttons with proper RTL support - the indicator stays centered in both directions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Radio Group Examples</h3>

            {/* Vertical Radio Group */}
            <div className="space-y-2">
              <Label className="text-base">Select an option (Vertical Layout)</Label>
              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="option-one" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer">
                    First Option
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="option-two" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer">
                    Second Option
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="option-three" id="r3" />
                  <Label htmlFor="r3" className="cursor-pointer">
                    Third Option
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Horizontal Radio Group */}
            <div className="space-y-2">
              <Label className="text-base">Choose a size (Horizontal Layout)</Label>
              <RadioGroup defaultValue="medium" className="flex flex-row gap-4">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="small" id="size-small" />
                  <Label htmlFor="size-small" className="cursor-pointer">
                    Small
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="medium" id="size-medium" />
                  <Label htmlFor="size-medium" className="cursor-pointer">
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="large" id="size-large" />
                  <Label htmlFor="size-large" className="cursor-pointer">
                    Large
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Radio Group with descriptions */}
            <div className="space-y-2">
              <Label className="text-base">Notification Preferences</Label>
              <RadioGroup defaultValue="all" className="space-y-3">
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <RadioGroupItem value="all" id="notif-all" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="notif-all" className="cursor-pointer font-medium">
                      All notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive all notifications including promotional emails
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <RadioGroupItem value="important" id="notif-important" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="notif-important" className="cursor-pointer font-medium">
                      Important only
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Only receive important account and security notifications
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <RadioGroupItem value="none" id="notif-none" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="notif-none" className="cursor-pointer font-medium">
                      No notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Opt out of all email notifications
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Disabled Radio Button */}
            <div className="space-y-2">
              <Label className="text-base">With Disabled Option</Label>
              <RadioGroup defaultValue="enabled">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <RadioGroupItem value="enabled" id="enabled-option" />
                  <Label htmlFor="enabled-option" className="cursor-pointer">
                    Enabled Option
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse opacity-50">
                  <RadioGroupItem value="disabled" id="disabled-option" disabled />
                  <Label htmlFor="disabled-option" className="cursor-not-allowed">
                    Disabled Option
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Radio Button RTL Behavior</h3>
            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p>✓ Center dot indicator stays perfectly centered in both LTR and RTL modes</p>
              <p>✓ Uses left: 50% with translate-x: -50% for consistent centering</p>
              <p>✓ No overflow or misalignment issues in RTL</p>
              <p>✓ Label positioning adapts with space-x-reverse utility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List Example */}
      <Card>
        <CardHeader>
          <CardTitle>RTL-Ready Lists</CardTitle>
          <CardDescription>Lists with proper spacing and icons</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-primary" />
              <span>First list item with directional icon</span>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-primary" />
              <span>Second list item with proper spacing</span>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 ltr:mr-2 rtl:ml-2 text-primary" />
              <span>Third list item that adapts to direction</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded text-sm overflow-x-auto">
            {`// CSS Logical Properties
<div className="ms-4">  // margin-inline-start
<div className="pe-6">  // padding-inline-end
<div className="start-0">  // inset-inline-start
<div className="border-e">  // border-inline-end
<div className="rounded-s">  // border-start-radius
<div className="text-start">  // text-align: start

// RTL Hook (Standardized)
const { direction, isRTL } = useDirectionalStyles()
const { setLanguage, language } = useLanguage()
const toggleDirection = () => setLanguage(language === 'he' ? 'en' : 'he')

// Explicit RTL/LTR Icon Classes
<ChevronRight className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
<FlippableIcon icon={ArrowRight} />

// RTL-specific CSS
[dir="rtl"] .my-class {
  /* RTL-specific styles */
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
